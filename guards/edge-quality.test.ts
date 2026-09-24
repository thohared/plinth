import { afterAll, beforeAll, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, type Browser } from 'playwright';
import { PNG } from 'pngjs';

let server: ViteDevServer, browser: Browser, url: string;
beforeAll(async () => {
  server = await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:4216,strictPort:false,hmr:false}});
  await server.listen(); url = server.resolvedUrls!.local[0]!;
  browser = await chromium.launch({
    ...(process.env['PLINTH_CHROMIUM_PATH'] ? {executablePath:process.env['PLINTH_CHROMIUM_PATH']} : {}),
    args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],
  });
});
afterAll(async () => { await browser?.close(); await server?.close(); });

it('T-P9h the actual Browser silhouette covers a shallow straight edge continuously', async () => {
  const page = await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const errors: string[] = []; page.on('pageerror', e => errors.push(String(e)));
  try {
    if (process.env['PLINTH_EDGE_SEED'] === 'original') await page.route('**/src/scene/pipeline.ts', async route => {
      const response = await route.fetch(), body = await response.text();
      const installation = 'installSmaaEdgeSearch(smaa);';
      expect(body.split(installation)).toHaveLength(2);
      await route.fulfill({response,body:body.replace(installation,'')});
    });
    await page.goto(`${url}?pg=1&device=browser&scene=soft-studio&pose=hero`);
    await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
    const png = PNG.sync.read(await page.locator('#stage').screenshot());
    expect([png.width,png.height]).toEqual([1280,800]);
    // Fixed PG fixture, away from rounded corners and the screenshot. Find
    // subpixel coverage, not an integer silhouette that ignores antialiasing.
    const edge: number[] = [];
    const contrast = (x:number,y:number) => Math.max(...[0,1,2].map(c =>
      Math.abs(png.data[(y*png.width+x)*4+c]! - png.data[c]!)));
    for (let x=420; x<870; x++) {
      let y=150; while(y<270 && contrast(x,y)<=30) y++;
      expect(y, `visible top silhouette at x=${x}`).toBeGreaterThan(150);
      expect(y, `visible top silhouette at x=${x}`).toBeLessThan(270);
      const previous = contrast(x,y-1), next = contrast(x,y);
      edge.push(y-1+(30-previous)/(next-previous));
    }
    const meanX=(edge.length-1)/2, meanY=edge.reduce((a,b)=>a+b,0)/edge.length;
    const variance=edge.reduce((sum,_,x)=>sum+(x-meanX)**2,0);
    const slope=edge.reduce((sum,y,x)=>sum+(x-meanX)*(y-meanY),0)/variance;
    const rms=Math.sqrt(edge.reduce((sum,y,x)=>sum+(y-(meanY+slope*(x-meanX)))**2,0)/edge.length);
    const jump=Math.max(...edge.slice(1).map((y,i)=>Math.abs(y-edge[i]!)));
    console.log('T-P9h shallow-edge coverage',{rms,jump,slope});
    // Diagnostic quality floor for this unchanged scene; does not replace §7.
    // The old eight-step pipeline measures RMS .198 and jump .143 pixels.
    expect(rms, 'shallow edge must not flatten into periodic steps').toBeLessThan(0.15);
    expect(jump, 'neighboring columns must have gradual coverage').toBeLessThan(0.11);
    expect(errors).toEqual([]);
  } finally { await page.close(); }
});
