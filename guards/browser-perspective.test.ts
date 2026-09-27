import { afterAll, beforeAll, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, type Browser } from 'playwright';
import { PNG } from 'pngjs';

let server: ViteDevServer;
let browser: Browser;
beforeAll(async () => {
  server = await createServer({ logLevel: 'silent', server: { port: 4221, strictPort: false, hmr: false } });
  await server.listen();
  browser = await chromium.launch({
    ...(process.env['PLINTH_CHROMIUM_PATH'] ? { executablePath: process.env['PLINTH_CHROMIUM_PATH'] } : {}),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
});
afterAll(async () => { await browser?.close(); await server?.close(); });

it('P-17 Browser Hero has level screen endpoints and equal visible side heights', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(String(e)));
  let replacements = 0;
  if (process.env['PLINTH_BROWSER_SEED'] === 'original') {
    await page.route('**/src/camera/poses.ts', async route => {
      const response = await route.fetch();
      const body = await response.text();
      const marker = /new Vector3\(0,\s*0?\.16,\s*1\)/g;
      expect(body.match(marker)).toHaveLength(1);
      replacements++;
      await route.fulfill({ response, body: body.replace(marker, 'new Vector3(0.2, 0.16, 1)') });
    });
  }
  try {
    await page.goto(`${server.resolvedUrls!.local[0]}?pg=1&device=browser&scene=soft-studio&pose=hero`);
    await page.waitForSelector('html[data-plinth-ready="1"]');
    // A flat QA screen isolates actual projected geometry from demo typography,
    // title bar, shadow and anti-aliasing. Native review images keep the demo.
    await page.evaluate(() => window.__plinth!.setScreenColor('#ff0000'));
    const png = PNG.sync.read(await page.locator('#stage').screenshot());
    expect([png.width, png.height]).toEqual([1280, 800]);
    const bounds = (x: number) => {
      const rows: number[] = [];
      for (let y = 0; y < png.height; y++) {
        const i = (y*png.width+x)*4;
        if (png.data[i]! > 180 && png.data[i+1]! < 60 && png.data[i+2]! < 60) rows.push(y);
      }
      expect(rows.length).toBeGreaterThan(200);
      return [rows[0]!, rows[rows.length-1]!] as const;
    };
    // Pairs are well inside the screen's rounded corners. One-pixel raster
    // tolerance is fixed; the old camera differs by several pixels.
    for (const offset of [120, 180, 220]) {
      const left = bounds(640-offset), right = bounds(640+offset);
      expect(Math.abs(left[0]-right[0]), `top ±${offset}`).toBeLessThanOrEqual(1);
      expect(Math.abs(left[1]-right[1]), `bottom ±${offset}`).toBeLessThanOrEqual(1);
      expect(Math.abs((left[1]-left[0])-(right[1]-right[0])), `height ±${offset}`).toBeLessThanOrEqual(1);
    }
    expect(errors).toEqual([]);
    expect(replacements).toBe(process.env['PLINTH_BROWSER_SEED'] === 'original' ? 1 : 0);
  } finally { await page.close(); }
});
