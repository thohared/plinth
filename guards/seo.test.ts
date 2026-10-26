import { afterAll, beforeAll, expect, it } from 'vitest';
import { build, preview, type PreviewServer } from 'vite';
import { chromium, type Browser } from 'playwright';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let server: PreviewServer, browser: Browser, url: string, outDir: string;
let originalHtml: string;
const canonical = 'https://plinth-phi.vercel.app/';

beforeAll(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'plinth-seo-'));
  const seed = process.env['PLINTH_SEO_SEED'];
  if (seed && !['canonical', 'sitemap', 'content'].includes(seed)) throw new Error('Unknown SEO seed');
  await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true }, plugins: seed === 'content' ? [{
    name: 'seo-content-negative-seed', enforce: 'pre',
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/ui/panel.ts')) return;
      const statement = 'if (about) utilities.append(about);';
      if (!code.includes(statement)) throw new Error('SEO content seed did not match');
      return code.replace(statement, '');
    },
  }] : [] });
  originalHtml = await readFile(join(outDir, 'index.html'), 'utf8');
  if (seed === 'canonical') {
    const changed = originalHtml.replace('rel="canonical" href="https://plinth-phi.vercel.app/"', 'rel="canonical" href="https://example.invalid/"');
    if (changed === originalHtml) throw new Error('SEO canonical seed did not match');
    await writeFile(join(outDir, 'index.html'), changed);
  }
  if (seed === 'sitemap') {
    const file = join(outDir, 'sitemap.xml'), xml = await readFile(file, 'utf8');
    const changed = xml.replace('<loc>https://plinth-phi.vercel.app/</loc>', '<loc>https://plinth-phi.vercel.app/#s=PRIVATE_SCENE</loc>');
    if (changed === xml) throw new Error('SEO sitemap seed did not match');
    await writeFile(file, changed);
  }
  server = await preview({ logLevel: 'silent', build: { outDir }, preview: { port: 4208, strictPort: false } });
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

it('serves descriptive, consistent metadata and truthful application data without JavaScript', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto(url);
    expect(response!.status()).toBe(200);
    expect(response!.headers()['x-robots-tag'] ?? '').not.toMatch(/noindex|none/i);
    expect(await page.title()).toBe('Plinth: Free 3D Mockup Generator for Screenshots');
    expect(await page.locator('link[rel="canonical"]').count()).toBe(1);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(canonical);
    expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(canonical);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      expect(await page.locator(selector).getAttribute('content')).toBe(await page.title());
    }
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      expect(await page.locator(selector).getAttribute('content')).toMatch(/3D phone, tablet, laptop and browser mockups.*export PNG.*No account/);
    }
    expect((await page.locator('meta[name="robots"],meta[name="googlebot"],meta[name="bingbot"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('content')).join(',')))).not.toMatch(/noindex|none/i);
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(data).toMatchObject({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Plinth', url: canonical,
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } });
    expect(data.description).toMatch(/phone, tablet, laptop, browser window and card.*PNG/);
    expect(data.browserRequirements).toMatch(/JavaScript.*WebGL 2/);
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data).not.toHaveProperty('review');
    expect(JSON.stringify(data)).not.toMatch(/#s=|PRIVATE|MP4|video export/i);
  } finally { await context.close(); }
});

it('serves crawlable robots and an XML sitemap containing only the canonical public page', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage(); await page.goto(url);
    const robots = await context.request.get(new URL('robots.txt', url).href);
    expect(robots.status()).toBe(200); expect(robots.headers()['content-type']).toMatch(/text\/plain/);
    expect(await robots.text()).toMatch(/^User-agent: \*\s+Allow: \/\s+Sitemap: https:\/\/plinth-phi\.vercel\.app\/sitemap\.xml\s*$/);
    const sitemap = await context.request.get(new URL('sitemap.xml', url).href);
    expect(sitemap.status()).toBe(200); expect(sitemap.headers()['content-type']).toMatch(/xml/);
    const parsed = await page.evaluate(xml => {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      return { errors: doc.querySelectorAll('parsererror').length, ns: doc.documentElement.namespaceURI,
        urls: [...doc.querySelectorAll('loc')].map(n => n.textContent), dates: doc.querySelectorAll('lastmod').length };
    }, await sitemap.text());
    expect(parsed).toEqual({ errors: 0, ns: 'http://www.sitemaps.org/schemas/sitemap/0.9', urls: [canonical], dates: 0 });
  } finally { await context.close(); }
});

it('keeps a readable guide and honest capability notice when scripts are disabled', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 500 } });
  try {
    const page = await context.newPage(); await page.goto(url);
    expect(await page.locator('#about-plinth h2').innerText()).toBe('Free 3D mockups from your screenshots');
    expect(await page.locator('#about-plinth > p').allTextContents()).toEqual(expect.arrayContaining([
      expect.stringContaining('no account required'), expect.stringContaining('never your uploaded image'),
    ]));
    expect(await page.locator('#about-plinth li').count()).toBe(3);
    const notice = page.locator('#about-plinth noscript p');
    await notice.scrollIntoViewIfNeeded(); expect(await notice.isVisible()).toBe(true);
    const box = (await notice.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(501);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

it.each([{ width: 1280, height: 800 }, { width: 390, height: 844 }])('retains the delivered guide in the working editor at $width px', async viewport => {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage(); const errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url); await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60_000 });
    expect(await page.locator('#pick').isEnabled()).toBe(true);
    expect(await page.locator('#png-export').isEnabled()).toBe(true);
    if (viewport.width < 900) await page.locator('#settings-open').click();
    expect(await page.locator('#about-plinth').count()).toBe(1);
    const sourceCopy = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return [...doc.querySelectorAll('#about-plinth > p, #about-plinth li, #about-plinth h2')].map(n => n.textContent);
    }, originalHtml);
    expect(await page.locator('#panel-utilities #about-plinth > p, #panel-utilities #about-plinth li, #panel-utilities #about-plinth h2').allTextContents()).toEqual(sourceCopy);
    const last = page.locator('#about-plinth > p').last(); await last.scrollIntoViewIfNeeded();
    const panel = (await page.locator('#panel').boundingBox())!, box = (await last.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(panel.y - 1); expect(box.y + box.height).toBeLessThanOrEqual(panel.y + panel.height + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(canonical);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});
