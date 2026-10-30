import { afterAll, beforeAll, expect, it } from 'vitest';
import { build, preview, type PreviewServer } from 'vite';
import { chromium, type Browser } from 'playwright';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';

let server: PreviewServer, browser: Browser, url: string, outDir: string;
// Independent literal contract: PLINTH_SPEC P-13(1), not output.ts constants.
const sizes = [
  ['1:1', '1080 × 1080'], ['4:5', '1080 × 1350'], ['16:9', '1920 × 1080'],
  ['9:16', '1080 × 1920'], ['3:1', '1920 × 640'],
];

beforeAll(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'plinth-discovery-'));
  await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  const seed = process.env['PLINTH_DISCOVERY_SEED'];
  if (seed) {
    if (!['dimensions', 'schema', 'llms'].includes(seed)) throw new Error('Unknown discovery seed');
    const path = join(outDir, seed === 'llms' ? 'llms.txt' : 'index.html');
    const source = await readFile(path, 'utf8');
    const changed = seed === 'dimensions' ? source.replace('1920 × 640', '3240 × 1080')
      : seed === 'schema' ? source.replace('"PNG, JPG and WebP screenshot input"', '"PNG, JPG and SVG screenshot input"')
      : source.replace('- PNG, JPG and WebP screenshot input', '- PNG, JPG and SVG screenshot input');
    if (changed === source) throw new Error('Discovery seed did not match');
    await writeFile(path, changed);
  }
  server = await preview({ logLevel: 'silent', build: { outDir }, preview: { port: 4216, strictPort: false } });
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

it('delivers honest capability answers and matching structured facts without JavaScript', async () => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    await page.goto(url);
    const facts = await page.locator('.guide-facts dd').allTextContents();
    expect(facts).toHaveLength(5);
    expect(facts.join(' ')).toMatch(/phone, tablet, laptop, browser window and card/i);
    expect(facts.join(' ')).toMatch(/PNG, JPG and WebP screenshot input/);
    expect(facts.join(' ')).toMatch(/PNG export.*transparent/);
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(data.featureList).toEqual(facts);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(data['@id']).toBe(`${canonical}#app`);
    expect(data.mainEntityOfPage).toBe(canonical);
    expect(data.inLanguage).toBe(await page.locator('html').getAttribute('lang'));
    expect(await page.locator('#plinth-facts').innerText()).toMatch(/Fit image to show the whole screenshot.*Fill screen.*crop.*New images start with Fill screen/s);
    expect(await page.locator('#scene-sharing').innerText()).toMatch(/demo image.*their own screenshot.*download and send the PNG/s);
    expect(await page.locator('#scene-sharing').innerText()).toMatch(/requires JavaScript and WebGL 2/);
    expect(await page.locator('#png-sizes').innerText()).toMatch(/does not export video/);
  } finally { await page.close(); }
});

it('publishes all five literal P-13 dimensions with scale and hardware limits', async () => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    await page.goto(url);
    const rows = await page.locator('.guide-sizes tbody tr').evaluateAll(rows => rows.map(row => [...row.children].map(cell => cell.textContent)));
    expect(rows).toEqual(sizes);
    expect(await page.locator('.guide-sizes caption').innerText()).toBe('PNG dimensions at 1×, in pixels');
    expect(await page.locator('#png-sizes').innerText()).toMatch(/2× or 3×, both dimensions.*3840 × 2160.*graphics limits.*not supported on every device/s);
    expect(await page.locator('.guide-sizes th[scope="col"]').count()).toBe(2);
    expect(await page.locator('.guide-sizes th[scope="row"]').count()).toBe(5);
  } finally { await page.close(); }
});

it('serves a plain-text optional summary consistent with visible facts and dimensions', async () => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    await page.goto(url);
    const response = await page.request.get(new URL('llms.txt', url).href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/text\/plain/);
    const text = await response.text();
    expect(text).toContain(`The canonical site is ${await page.locator('link[rel="canonical"]').getAttribute('href')}`);
    for (const fact of await page.locator('.guide-facts dd').allTextContents()) expect(text).toContain(`- ${fact}\n`);
    for (const [shape, pixels] of sizes) expect(text).toContain(`| ${shape} | ${pixels} |`);
    expect(text).toMatch(/do not transfer the user's screenshot/);
    expect(text).toMatch(/JavaScript and WebGL 2/);
    expect(text).toMatch(/not every device supports every size/i);
    expect(text).toMatch(/still PNG images, not video/);
    expect(text).toMatch(/optional summary.*proposal.*does not.*guarantee/s);
  } finally { await page.close(); }
});

for (const width of [1280, 390]) for (const theme of ['light', 'dark']) {
  it(`keeps answers readable and utility controls usable at ${width}px in ${theme}`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
    try {
      await page.goto(url);
      await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60_000 });
      if (width < 900) await page.locator('#settings-open').click();
      if (theme === 'dark') await page.locator('#interface-theme').click();
      const delivered = await page.request.get(url).then(r => r.text());
      const source = await page.evaluate(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return ['plinth-facts', 'png-sizes', 'scene-sharing'].map(id => doc.getElementById(id)!.textContent);
      }, delivered);
      expect(await page.locator('#panel-utilities #plinth-facts, #panel-utilities #png-sizes, #panel-utilities #scene-sharing').allTextContents()).toEqual(source);
      for (const selector of ['.guide-facts dd', '.guide-sizes']) {
        for (const element of await page.locator(selector).all()) {
          await element.scrollIntoViewIfNeeded();
          expect(await element.isVisible()).toBe(true);
          const box = (await element.boundingBox())!, panel = (await page.locator('#panel').boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(panel.x);
          expect(box.x + box.width).toBeLessThanOrEqual(panel.x + panel.width);
          expect(box.y).toBeGreaterThanOrEqual(panel.y - 1);
          expect(box.y + box.height).toBeLessThanOrEqual(panel.y + panel.height + 1);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const captureDir = process.env['PLINTH_DISCOVERY_CAPTURE_DIR'];
      if (captureDir) {
        await mkdir(captureDir, { recursive: true });
        await page.screenshot({ path: join(captureDir, `${width}-${theme}.png`) });
      }
      await page.locator('#shortcut-help').click();
      expect(await page.locator('#shortcut-keys').isVisible()).toBe(true);
      await page.locator('#shortcut-help').click();
      expect(await page.locator('#copy-link').isEnabled()).toBe(true);
      // One real upload/download journey after scrolling the extended mobile guide.
      if (width === 390 && theme === 'light') {
        const image = new PNG({ width: 48, height: 32 }); image.data.fill(255);
        await page.locator('#image-file').setInputFiles({ name: 'guide-check.png', mimeType: 'image/png', buffer: PNG.sync.write(image) });
        await page.waitForFunction(() => window.__plinth.getImage()?.identity === 'user');
        await page.locator('#control-aspect').selectOption('1:1');
        await page.locator('#png-scale').selectOption('1');
        await page.locator('#png-export').click();
        await page.locator('#png-download').waitFor({ timeout: 90_000 });
        const pending = page.waitForEvent('download'); await page.locator('#png-download').click();
        const download = await pending;
        expect(await download.failure()).toBeNull();
        const png = PNG.sync.read(await readFile((await download.path())!));
        expect([png.width, png.height]).toEqual([1080, 1080]);
        await page.locator('#shortcut-help').click();
        expect(await page.locator('#shortcut-keys').isVisible()).toBe(true);
      }
    } finally { await page.close(); }
  });
}
