import { afterAll, beforeAll, expect, it } from 'vitest';
import { build, preview, type PreviewServer } from 'vite';
import { chromium, type Browser } from 'playwright';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';

let server: PreviewServer, browser: Browser, url: string, outDir: string;
beforeAll(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'plinth-startup-'));
  await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  if (process.env['PLINTH_STARTUP_SEED']) {
    if (process.env['PLINTH_STARTUP_SEED'] !== 'missing-action') throw new Error('Unknown startup seed');
    const path = join(outDir, 'index.html'), html = await readFile(path, 'utf8');
    const changed = html.replace('id="mobile-pick"', 'id="removed-mobile-pick"');
    if (changed === html) throw new Error('Startup seed did not match');
    await writeFile(path, changed);
  }
  server = await preview({ logLevel: 'silent', build: { outDir }, preview: { port: 4212, strictPort: false } });
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

it('keeps the real mobile actions stable during demo loading, then enables upload and PNG download', async () => {
  const context = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  try {
    const page = await context.newPage(); const requested = new Set<string>(); const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/demo*.png', async route => { requested.add(new URL(route.request().url()).pathname); await blocked; await route.continue(); });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(await page.locator('#mobile-pick').count()).toBe(1);
    await expect.poll(() => requested.size).toBe(2);
    expect(await page.locator('#mobile-pick').isVisible()).toBe(true);
    expect(await page.locator('#mobile-pick').isDisabled()).toBe(true);
    expect(await page.locator('#settings-open').isDisabled()).toBe(true);
    expect(await page.locator('#stage').isVisible()).toBe(false);
    expect(await page.locator('html').getAttribute('data-plinth-ready')).toBeNull();
    const pick = await page.locator('#mobile-pick').elementHandle();
    const brand = await page.locator('#mobile-brand').elementHandle();
    const box = await page.locator('#mobile-pick').boundingBox();
    release();
    await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60000 });
    expect(await pick!.evaluate(node => node === document.querySelector('#mobile-pick'))).toBe(true);
    expect(await brand!.evaluate(node => node === document.querySelector('#mobile-brand'))).toBe(true);
    expect(await page.locator('#mobile-pick').boundingBox()).toEqual(box);
    expect(await page.locator('#stage').isVisible()).toBe(true);
    expect(await page.locator('#mobile-pick').isEnabled()).toBe(true);
    expect(await page.locator('#settings-open').isEnabled()).toBe(true);
    const chooserPromise = page.waitForEvent('filechooser'); await page.locator('#mobile-pick').tap();
    const chooser = await chooserPromise; await chooser.setFiles(join(import.meta.dirname, '../public/compositions/clean-tablet.png'));
    await page.waitForFunction(() => window.__plinth.getImage()?.identity === 'user');
    await page.locator('#settings-open').tap();
    await page.locator('#control-aspect').selectOption('1:1');
    await page.locator('#sheet-close').tap();
    await page.locator('#png-export').tap();
    await page.waitForSelector('#png-download:not([hidden])', { timeout: 30000 });
    const downloading = page.waitForEvent('download'); await page.locator('#png-download').tap();
    const download = await downloading; expect(await download.failure()).toBeNull();
    const png = PNG.sync.read(await readFile((await download.path())!));
    expect([png.width, png.height]).toEqual([1080, 1080]);
    expect(await page.evaluate(() => window.__plinth.getImage()?.identity)).toBe('user');
    expect(errors).toEqual([]);
  } finally { release(); await context.close(); }
});
