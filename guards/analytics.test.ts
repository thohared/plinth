import { afterAll, beforeAll, expect, it } from 'vitest';
import { build, createServer, preview, type PreviewServer, type ViteDevServer } from 'vite';
import { chromium, type Browser, type Page } from 'playwright';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

let server: PreviewServer, dev: ViteDevServer, browser: Browser, local: string, development: string;
const site = 'https://plinth-phi.vercel.app';

// This is a collector double, not a copy of Vercel's remotely hosted script.
// The production bundle still includes the real pinned SDK and its command queue.
const collector = `(() => {
  let beforeSend = event => event;
  window.__analyticsEmit = async event => {
    const safe = beforeSend(event);
    if (safe) await fetch('/_vercel/insights/view', { method: 'POST', body: JSON.stringify(safe) });
  };
  window.va = (name, value) => { if (name === 'beforeSend') beforeSend = value; };
  for (const command of window.vaq || []) window.va(...command);
  window.__analyticsReady = true;
  window.__analyticsEmit({ type: 'pageview', url: location.href });
})();`;

beforeAll(async () => {
  // vitest sets NODE_ENV=test; explicitly compile the production branch as the
  // deployed `vite build` does, while retaining the real SDK and its mode logic.
  const seed = process.env['PLINTH_ANALYTICS_SEED'];
  const mutations: Record<string, [string, string]> = {
    gate: ['if (!analyticsAllowed(import.meta.env.PROD, window.location.href, document.referrer)) return;', ''],
    url: ["return { type: 'pageview', url: SITE + '/' };", 'return event;'],
    event: ["if (event.type !== 'pageview') return null;", ''],
    referrer: ['if (referrer) {', 'if (false && referrer) {'],
  };
  if (seed && !(seed in mutations) && seed !== 'header') throw new Error('Unknown Analytics seed');
  await build({ logLevel: 'silent', define: { 'import.meta.env.PROD': 'true' }, plugins: seed && seed in mutations ? [{
    name: 'analytics-negative-seed', enforce: 'pre',
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/analytics.ts')) return;
      const [from, to] = mutations[seed]!;
      if (!code.includes(from)) throw new Error('Analytics seed did not match');
      return code.replace(from, to);
    },
  }] : [] });
  server = await preview({ logLevel: 'silent', preview: { port: 4198, strictPort: false } });
  local = server.resolvedUrls!.local[0]!;
  dev = await createServer({ logLevel: 'silent', server: { port: 4199, strictPort: false, hmr: false } });
  await dev.listen(); development = dev.resolvedUrls!.local[0]!;
  browser = await chromium.launch({ headless: true,
    ...(process.env['PLINTH_CHROMIUM_PATH'] ? { executablePath: process.env['PLINTH_CHROMIUM_PATH'] } : {}),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
});
afterAll(async () => {
  await browser?.close(); await dev?.close();
  if (server) await new Promise<void>(resolve => server.httpServer.close(() => resolve()));
});

async function routed(page: Page, origin = site, source = local, blocked = false) {
  const requests: { url: string; body: string | null; referer: string | undefined }[] = [];
  const foreign: string[] = [];
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== origin) { foreign.push(request.url()); await route.abort(); return; }
    if (url.pathname.startsWith('/_vercel/insights/')) {
      requests.push({ url: request.url(), body: request.postData(), referer: request.headers()['referer'] });
      if (blocked) { await route.abort(); return; }
      await route.fulfill({ status: 200, contentType: url.pathname.endsWith('script.js') ? 'text/javascript' : 'application/json',
        body: url.pathname.endsWith('script.js') ? collector : '{}' }); return;
    }
    const response = await route.fetch({ url: new URL(url.pathname + url.search, source).href });
    if (process.env['PLINTH_ANALYTICS_SEED'] === 'header' && request.resourceType() === 'document') {
      await route.fulfill({ response, body: (await response.text()).replace('<meta name="referrer" content="no-referrer" />', '') });
    } else await route.fulfill({ response });
  });
  return { requests, foreign };
}

async function ready(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60_000 });
}

async function journey(page: Page) {
  const png = new PNG({ width: 37, height: 19 }); png.data.fill(173);
  const image = PNG.sync.write(png);
  await page.locator('#image-file').setInputFiles({ name: 'PRIVATE_IMAGE_SENTINEL.png', mimeType: 'image/png', buffer: image });
  await page.waitForFunction(() => window.__plinth.getImage()?.identity === 'user');
  expect(await page.evaluate(() => ({ width: window.__plinth.getImage()?.width, height: window.__plinth.getImage()?.height }))).toEqual({ width: 37, height: 19 });
  await page.keyboard.press('3');
  expect(await page.evaluate(() => window.__plinth.getDevice())).toBe('laptop');
  await page.locator('#copy-link').click();
  await page.waitForFunction(() => document.querySelector('#share-status')?.textContent === 'Link copied');
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/^https:\/\/plinth-phi\.vercel\.app\/#v2\/laptop(?:\?|$)/);
  expect(link).not.toContain('PRIVATE');
  await page.locator('#png-export').click();
  await page.locator('#png-download').waitFor({ state: 'visible', timeout: 60_000 });
  const downloading = page.waitForEvent('download'); await page.locator('#png-download').click();
  const download = await downloading, path = await download.path();
  expect(await download.failure()).toBeNull(); expect(path).toBeTruthy();
  const output = PNG.sync.read(await readFile(path!));
  expect(output.width).toBeGreaterThan(0); expect(output.height).toBeGreaterThan(0);
  return { image, link };
}

it('P-20 production SDK strips URL state and custom events through an image/share/PNG session', async () => {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const { requests, foreign } = await routed(page);
    await ready(page, site + '/#PRIVATE_INITIAL_SCENE');
    await page.waitForFunction(() => (window as unknown as { __analyticsReady: boolean }).__analyticsReady);
    expect(await page.evaluate(() => (window as unknown as { vam: string }).vam)).toBe('production');
    expect(await page.locator('script[src="/_vercel/insights/script.js"]').count()).toBe(1);
    await page.waitForFunction(() => !!window.__plinth);
    const { image, link } = await journey(page);
    // Exercise the exact callback installed by the SDK, including a future
    // custom event. The collector double must not redact anything itself.
    await page.evaluate(async () => {
      const emit = (window as unknown as { __analyticsEmit: (event: object) => Promise<void> }).__analyticsEmit;
      history.replaceState(null, '', '/?token=PRIVATE_QUERY#PRIVATE_SCENE');
      await emit({ type: 'pageview', url: location.href, filename: 'PRIVATE_IMAGE_SENTINEL.png', data: 'PRIVATE_BYTES' });
      await emit({ type: 'event', url: location.href, name: 'PRIVATE_EVENT', data: 'PRIVATE_BYTES' });
    });
    const payloads = requests.filter(request => request.body !== null);
    expect(payloads).toHaveLength(2);
    for (const request of payloads) expect(JSON.parse(request.body!)).toEqual({ type: 'pageview', url: 'https://plinth-phi.vercel.app/' });
    for (const request of requests) expect(request.referer).toBeUndefined();
    const serialized = JSON.stringify(requests);
    expect(serialized).not.toMatch(/PRIVATE|#|\?|blob:|data:/);
    expect(serialized).not.toContain(image.toString('base64'));
    expect(serialized).not.toContain(new URL(link).hash.slice(3));
    expect(foreign).toEqual([]);
  } finally { await context.close(); }
});

it.each([
  [site, '/?pg=1', '', false],
  [site, '/?token=PRIVATE_QUERY', '', false],
  ['https://plinth-preview.vercel.app', '/', '', false],
  ['http://localhost:4198', '/', '', false],
  [site, '/', 'https://source.example/private?token=PRIVATE_REFERRER', false],
  [site, '/', '', true],
] as const)('P-20 suppresses Analytics at %s%s, referrer %s, development %s', async (origin, suffix, referrer, isDev) => {
  const page = await browser.newPage();
  try {
    if (referrer) await page.addInitScript(value => Object.defineProperty(document, 'referrer', { value }), referrer);
    const { requests, foreign } = await routed(page, origin, isDev ? development : local);
    await ready(page, origin + suffix); await page.waitForTimeout(300);
    expect(requests).toEqual([]); expect(foreign).toEqual([]);
    expect(await page.locator('script[src*="insights"]').count()).toBe(0);
  } finally { await page.close(); }
});

it('P-20 blocked Analytics leaves image input, sharing and real PNG download usable', async () => {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const { requests, foreign } = await routed(page, site, local, true);
    await ready(page, site + '/'); await journey(page);
    expect(requests.map(request => request.url)).toEqual([site + '/_vercel/insights/script.js']);
    expect(foreign).toEqual([]);
  } finally { await context.close(); }
});
