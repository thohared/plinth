import { afterAll, beforeAll, expect, it } from 'vitest';
import { build, preview, type PreviewServer } from 'vite';
import { chromium, type Browser } from 'playwright';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';

let server: PreviewServer, browser: Browser, url: string, outDir: string;
beforeAll(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'plinth-startup-failure-'));
  await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  if (process.env['PLINTH_STARTUP_FAILURE_SEED']) {
    if (process.env['PLINTH_STARTUP_FAILURE_SEED'] !== 'broken-reload') throw new Error('Unknown seed');
    let changed = false;
    for (const name of await readdir(join(outDir, 'assets'))) {
      if (!name.endsWith('.js')) continue;
      const path = join(outDir, 'assets', name), source = await readFile(path, 'utf8');
      if (source.includes('window.location.reload()')) {
        await writeFile(path, source.replaceAll('window.location.reload()', 'window.location.toString()'));
        changed = true;
      }
    }
    if (!changed) throw new Error('Reload seed did not match');
  }
  server = await preview({ logLevel: 'silent', build: { outDir }, preview: { port: 4213, strictPort: false } });
  url = server.resolvedUrls!.local[0]!;
  browser = await chromium.launch({
    ...(process.env['PLINTH_CHROMIUM_PATH'] ? { executablePath: process.env['PLINTH_CHROMIUM_PATH'] } : {}),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
});
afterAll(async () => {
  await browser?.close();
  if (server) await new Promise<void>(resolve => server.httpServer.close(() => resolve()));
  if (outDir) await rm(outDir, { recursive: true, force: true });
});


for (const width of [390, 1280]) for (const failure of ['load', 'graphics'] as const) {
  it(`T-P10r ${failure} failure offers accessible help and recovery at ${width}`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      if (failure === 'load') await page.route('**/assets/main-*.js', route => route.abort());
      else await page.addInitScript(() => {
        if (window.name === 'graphics-enabled') return;
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
          return /^(webgl2?|experimental-webgl)$/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
        } as typeof original;
      });
      const hash = '#v2/tablet?scene=clean-white';
      await page.goto(url + hash);
      const title = page.getByRole('heading', { name: 'Plinth could not start', exact: true });
      await title.waitFor();
      expect(await title.evaluate(node => node === document.activeElement)).toBe(true);
      expect(await page.locator('html').getAttribute('data-plinth-ready')).toBeNull();
      expect(await page.locator('#startup-error').innerText()).not.toMatch(/THREE|WebGLRenderer|Error creating/);
      expect(await page.locator('#startup-error').innerText()).toContain(failure === 'graphics' ? 'WebGL 2' : 'Check your connection');
      expect(await page.locator('#settings-open').isVisible()).toBe(false);
      const reload = page.getByRole('button', { name: 'Reload page', exact: true });
      expect(await reload.isVisible()).toBe(true);
      expect((await reload.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const summary = page.locator('#plinth-guide > summary');
      await summary.focus(); await page.keyboard.press('Enter');
      expect(await page.locator('#about-plinth').isVisible()).toBe(false);
      await page.keyboard.press('Space');
      expect(await page.locator('#about-plinth').isVisible()).toBe(true);
      await page.getByRole('heading', { name: 'Frequently asked questions' }).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `/tmp/plinth-startup-${failure}-${width}.png`, fullPage: true });
      {
        if (failure === 'load') await page.unroute('**/assets/main-*.js');
        else await page.evaluate(() => { window.name = 'graphics-enabled'; });
        await reload.focus();
        await Promise.all([page.waitForEvent('framenavigated', { predicate: frame => frame === page.mainFrame(), timeout: 10000 }), page.keyboard.press('Enter')]);
        await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60000 });
        expect(await page.locator('#startup-error').count()).toBe(0);
        expect(new URL(page.url()).hash).toBe(hash);
        expect(await page.evaluate(() => window.__plinth.getDevice())).toBe('tablet');
        if (width === 390 && failure === 'load') {
          const chooserPromise = page.waitForEvent('filechooser'); await page.locator('#pick').click();
          await (await chooserPromise).setFiles(join(import.meta.dirname, '../public/compositions/clean-tablet.png'));
          await page.waitForFunction(() => window.__plinth.getImage()?.identity === 'user');
          await page.locator('#png-export').click();
          await page.waitForSelector('#png-download:not([hidden])', { timeout: 30000 });
          const downloadPromise = page.waitForEvent('download'); await page.locator('#png-download').click();
          const download = await downloadPromise;
          expect(await download.failure()).toBeNull();
          const png = PNG.sync.read(await readFile((await download.path())!));
          expect([png.width, png.height]).toEqual([1080, 1350]);
        }
      }
    } finally { await context.close(); }
  });
}
