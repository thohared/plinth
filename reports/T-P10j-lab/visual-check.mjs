// Local interaction/capture evidence. Requires the built candidate and an
// installed Chromium; never a physical-phone or Safari performance verdict.
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { PNG } from 'pngjs';
import { resolve } from 'node:path';

const out = resolve('reports/T-P10j-lab'); await mkdir(out, { recursive: true });
const outDir = await mkdtemp(resolve(tmpdir(), 'plinth-tp10j-visual-'));
await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
const server = await preview({ logLevel: 'silent', build: { outDir }, preview: { host: '127.0.0.1', port: 4188, strictPort: true } });
const browser = await chromium.launch({ executablePath: process.env.PLINTH_CHROMIUM_PATH,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const evidence = { browser: browser.version(), captures: [], checks: [] };
try {
  for (const mobile of [false, true]) {
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
      deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    await page.goto(server.resolvedUrls.local[0]);
    await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60_000 });
    for (const theme of ['light', 'dark']) {
      if (mobile) await page.locator('#settings-open').click();
      if (theme === 'dark') await page.locator('#interface-theme').click();
      for (const [part, selector] of [['guide', '.guide-examples h3'], ['faq', '.guide-faq h3']]) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        const file = `${mobile ? 'mobile' : 'desktop'}-${theme}-${part}.png`;
        await page.screenshot({ path: resolve(out, file) }); evidence.captures.push(file);
      }
      if (mobile) await page.locator('#sheet-close').click();
    }
    const source = new PNG({ width: 180, height: 320 });
    for (let i = 0; i < source.data.length; i += 4) source.data.set([35, 105, 155, 255], i);
    await page.locator('#image-file').setInputFiles({ name: 'seo-check.png', mimeType: 'image/png', buffer: PNG.sync.write(source) });
    await page.waitForFunction(() => { const image = window.__plinth.getImage(); return image?.identity === 'user' && image.originalWidth === 180 && image.originalHeight === 320; });
    if (mobile) await page.locator('#settings-open').click();
    await page.getByLabel('Aspect ratio', { exact: true }).selectOption('1:1');
    await page.locator('#png-export').click();
    await page.locator('#png-download').waitFor({ timeout: 90_000 });
    const pending = page.waitForEvent('download'); await page.locator('#png-download').click();
    const download = await pending;
    if (await download.failure()) throw new Error(await download.failure());
    const png = PNG.sync.read(await readFile(await download.path()));
    if (png.width !== 1080 || png.height !== 1080) throw new Error(`Unexpected selected 1:1 PNG dimensions: ${png.width}x${png.height}`);
    await page.locator('#shortcut-help').scrollIntoViewIfNeeded(); await page.locator('#shortcut-help').click();
    if (!await page.locator('#shortcut-keys').isVisible()) throw new Error('Final utility is unreachable');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (errors.length || overflow) throw new Error(JSON.stringify({ errors, overflow }));
    evidence.checks.push({ mobile, upload: '180x320 accepted', png: [png.width, png.height], download: true, finalUtility: true, errors, overflow });
    await page.close();
  }
  await writeFile(resolve(out, 'visual-check.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence));
} finally { await browser.close(); await new Promise(done => server.httpServer.close(done)); await rm(outDir, { recursive: true, force: true }); }
