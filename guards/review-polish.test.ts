import { beforeAll, afterAll, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, type Browser, type Page } from 'playwright';
import { PNG } from 'pngjs';
import { Vector3 } from 'three';
import { createStage } from '../src/scene';
import type { DeviceId } from '../src/devices/presets';
let server: ViteDevServer, browser: Browser, url: string;
beforeAll(async () => {
  server = await createServer({ logLevel: 'silent', server: { port: 4198, strictPort: false, hmr: false } });
  await server.listen(); url = server.resolvedUrls!.local[0]!;
  browser = await chromium.launch({ ...(process.env['PLINTH_CHROMIUM_PATH'] ? { executablePath: process.env['PLINTH_CHROMIUM_PATH'] } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
});
afterAll(async () => { await browser?.close(); await server?.close(); });
async function ready(page: Page, query = '') {
  await page.goto(url + query); await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60000 });
}
function sample(png: PNG, id: DeviceId, u: number, v: number): number[] {
  const stage = createStage(id, 'soft-studio', 1.6); stage.setPose('front', true);
  const rig = stage.getRig(); const size = rig.screenSize; stage.scene.updateMatrixWorld(true);
  const ndc = rig.screen.localToWorld(new Vector3((u - .5) * size.w, (v - .5) * size.h, 0)).project(stage.camera);
  const x = Math.round((ndc.x + 1) * png.width / 2), y = Math.round((1 - ndc.y) * png.height / 2);
  stage.dispose(); return [...png.data.subarray((y * png.width + x) * 4, (y * png.width + x) * 4 + 3)];
}
it('T-P9e full wide demos have continuous border colors; explicit pads and user uploads keep their own fit', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  try {
    if (process.env['PLINTH_POLISH_SEED'] === 'bands') await page.route('**/src/screen/material.ts', async route => {
      const response = await route.fetch(); const source = await response.text();
      const body = source.replace('screenDemoEdges.value = extendDemoEdges', 'screenDemoEdges.value = false && extendDemoEdges');
      expect(body).not.toBe(source); await route.fulfill({ response, body });
    });
    await ready(page, '?pg=1&device=tablet&pose=front');
    for (const id of ['tablet', 'laptop', 'card', 'browser'] as const) {
      await page.evaluate(id => { const h = window.__plinth; h.setDevice(id); h.setPose('front'); h.setSpec({ ...h.getSpec(), glassClearcoat: 0 }); }, id);
      expect(await page.evaluate(() => window.__plinth.getImage())).toMatchObject({ identity: 'demo', fit: 'contain', originalWidth: 2880, originalHeight: 1800 });
      const png = PNG.sync.read(await page.locator('#stage').screenshot());
      // The source's left sidebar is dark all the way to both image boundaries.
      // Prior uniform-white letterbox bands fail on tablet/laptop/card.
      const u = id === 'browser' ? .025 : .10;
      for (const v of [.02, .98]) expect(Math.max(...sample(png, id, u, v)), `${id} sidebar continues to border`).toBeLessThan(80);
    }
    await page.evaluate(() => { const h = window.__plinth; h.setDevice('tablet'); h.setSpec({ ...h.getSpec(), glassClearcoat: 0 }); h.setPad(.1); h.setPadColor('#ff0000'); });
    let png = PNG.sync.read(await page.locator('#stage').screenshot());
    let color = sample(png, 'tablet', .1, .98); expect(color[0]).toBeGreaterThan(245); expect(color[1]).toBeLessThan(10);
    await page.evaluate(() => { window.__plinth.setPad(0); });
    png = PNG.sync.read(await page.locator('#stage').screenshot()); color = sample(png, 'tablet', .1, .98);
    expect(color[0]).toBeGreaterThan(245); expect(color[1]).toBeLessThan(10);
    const source = new PNG({ width: 160, height: 100 });
    for (let i = 0; i < source.data.length; i += 4) { source.data[i] = 20; source.data[i+1] = 30; source.data[i+2] = 40; source.data[i+3] = 255; }
    await page.locator('#image-file').setInputFiles({ name: 'uncropped.png', mimeType: 'image/png', buffer: PNG.sync.write(source) });
    await page.waitForFunction(() => window.__plinth.getImage()?.identity === 'user');
    await page.evaluate(() => window.__plinth.setPadColor('#ffffff'));
    png = PNG.sync.read(await page.locator('#stage').screenshot());
    expect(Math.min(...sample(png, 'tablet', .1, .98)), 'user Contain margin stays white').toBeGreaterThan(245);
    expect(Math.max(...sample(png, 'tablet', .5, .5)), 'user content remains visible').toBeLessThan(50);
  } finally { await page.close(); }
});
it('T-P9e mobile image shortcut, theme, segmented looks and export stay usable', async () => {
  const page = await browser.newPage({ viewport: { width: 400, height: 800 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  try {
    if (process.env['PLINTH_POLISH_SEED'] === 'picker') await page.route('**/src/ui/panel.ts', async route => {
      const response = await route.fetch(); const source = await response.text();
      const body = source.replace('if (!mobilePick.disabled) pick.click()', 'if (!mobilePick.disabled) void 0');
      expect(body).not.toBe(source); await route.fulfill({ response, body });
    });
    await ready(page);
    for (const selector of ['#mobile-pick', '#settings-open', '#png-export']) {
      const b = await page.locator(selector).boundingBox(); expect(b).not.toBeNull(); expect(b!.height).toBeGreaterThanOrEqual(44); expect(b!.y + b!.height).toBeLessThanOrEqual(800);
    }
    const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 5000 }), page.locator('#mobile-pick').click()]);
    const source = new PNG({ width: 64, height: 32 }); source.data.fill(255);
    await chooser.setFiles({ name: 'phone-upload.png', mimeType: 'image/png', buffer: PNG.sync.write(source) });
    await page.waitForFunction(() => window.__plinth.getImage()?.identity === 'user');
    await page.locator('#settings-open').click();
    if (process.env['PLINTH_POLISH_SEED'] === 'footer') await page.addStyleTag({ content:
      '.editor #png-actions{align-content:start;grid-template-rows:auto auto}.editor #png-actions label{grid-row:1}.editor #png-actions #png-scale{grid-row:2}.editor #png-actions #png-export{grid-row:1 / 3}' });
    const exportBottom = async () => page.locator('#png-export').evaluate(element => {
      const button = element.getBoundingClientRect();
      const footer = document.querySelector('#png-actions')!.getBoundingClientRect();
      return { bottomGap: footer.bottom - button.bottom, viewportGap: innerHeight - button.bottom, height: button.height };
    });
    expect((await exportBottom()).bottomGap, 'Export is in the bottom thumb zone').toBeLessThanOrEqual(16);
    expect((await exportBottom()).viewportGap).toBeLessThanOrEqual(16);
    expect((await exportBottom()).height).toBeGreaterThanOrEqual(44);
    const before = await page.evaluate(() => ({ settings: window.__plinth.getSettings(), image: window.__plinth.getImage(), hash: location.hash }));
    await page.getByRole('button', { name: 'Use dark interface' }).click();
    expect(await page.evaluate(() => document.body.dataset['theme'])).toBe('dark');
    expect(await page.locator('#pick').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(35, 48, 39)');
    expect(await page.evaluate(() => ({ settings: window.__plinth.getSettings(), image: window.__plinth.getImage(), hash: location.hash }))).toEqual(before);
    expect(await page.locator('.looks img').count()).toBe(4);
    await page.locator('[data-composition="dark-laptop"]').click();
    // Composition identity follows the settled pose, not the animation target.
    await page.waitForFunction(() => document.querySelector('[data-composition="dark-laptop"]')?.getAttribute('aria-pressed') === 'true');
    expect(await page.locator('[data-composition="dark-laptop"]').getAttribute('aria-pressed')).toBe('true');
    expect(await page.evaluate(() => window.__plinth.getImage())).toMatchObject({ identity: 'user', width: 64, height: 32 });
    await page.locator('#sheet-close').click();
    expect((await exportBottom()).viewportGap).toBeLessThanOrEqual(16);
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('settings-open');
    await page.locator('#png-export').click();
    const link = page.locator('#png-download'); await link.waitFor({ timeout: 90000 });
    expect((await exportBottom()).bottomGap).toBeLessThanOrEqual(16);
    const pending = page.waitForEvent('download'); await link.click(); const download = await pending;
    expect(await download.failure()).toBeNull();
    await page.evaluate(() => document.querySelector('#stage')!.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    expect(await page.locator('#mobile-pick').isDisabled()).toBe(true); expect(await page.locator('#png-export').isDisabled()).toBe(true);
  } finally { await page.close(); }
});
