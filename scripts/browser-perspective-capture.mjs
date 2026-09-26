// Native same-resolution evidence; never writes PG baselines.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const out = resolve(process.env.PLINTH_BROWSER_OUT ?? 'browser-perspective-out');
await mkdir(out, { recursive: true });
const server = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port: 4222, strictPort: false, hmr: false } });
await server.listen();
const browser = await chromium.launch({
  ...(process.env.PLINTH_CHROMIUM_PATH ? { executablePath: process.env.PLINTH_CHROMIUM_PATH } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const report = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  tree: execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim(),
  dirty: execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim(),
  node: process.version, browser: browser.version(), platform: process.platform,
  note: 'Local software-renderer captures. Not CI PG candidates, baseline blessing or physical-device performance evidence.', cases: [],
};
try {
  for (const variant of ['original', 'candidate']) for (const device of ['browser', 'phone']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const errors = []; let replacements = 0;
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    if (variant === 'original') await page.route('**/src/camera/poses.ts', async route => {
      const response = await route.fetch(), body = await response.text();
      const marker = /new Vector3\(0,\s*0?\.16,\s*1\)/g;
      assert.equal(body.match(marker)?.length, 1); replacements++;
      await route.fulfill({ response, body: body.replace(marker, 'new Vector3(0.2, 0.16, 1)') });
    });
    try {
      await page.goto(`${server.resolvedUrls.local[0]}?pg=1&device=${device}&scene=soft-studio&pose=hero`);
      await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60000 });
      const file = `${device}-${variant}.png`;
      const bytes = await page.locator('#stage').screenshot({ path: resolve(out, file) });
      const state = await page.evaluate(() => {
        const canvas = document.querySelector('#stage'), gl = canvas.getContext('webgl2');
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        return { width: canvas.width, height: canvas.height, dpr: devicePixelRatio,
          renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), glError: gl.getError() };
      });
      assert.deepEqual([state.width, state.height, state.dpr], [1280, 800, 1]);
      assert.equal(state.glError, 0); assert.deepEqual(errors, []);
      assert.equal(replacements, variant === 'original' ? 1 : 0);
      const measurements = [];
      if (device === 'browser') {
        await page.evaluate(() => window.__plinth.setScreenColor('#ff0000'));
        const png = PNG.sync.read(await page.locator('#stage').screenshot());
        const bounds = x => {
          const rows = [];
          for (let y=0; y<png.height; y++) {
            const i = (y*png.width+x)*4;
            if (png.data[i]>180 && png.data[i+1]<60 && png.data[i+2]<60) rows.push(y);
          }
          assert.ok(rows.length>200);
          return { top: rows[0], bottom: rows.at(-1), height: rows.at(-1)-rows[0] };
        };
        for (const offset of [120,180,220]) {
          const left=bounds(640-offset), right=bounds(640+offset);
          measurements.push({ offset, left, right, heightDifference: right.height-left.height });
        }
      }
      report.cases.push({ file, device, variant, replacements, sha256: createHash('sha256').update(bytes).digest('hex'), ...state, measurements, errors });
      console.log(file, JSON.stringify(measurements));
    } finally { await page.close(); }
  }
} finally {
  await writeFile(resolve(out, 'receipt.json'), JSON.stringify(report,null,2)+'\n');
  await browser.close(); await server.close();
}
