// Compare unchanged render output, then capture the finished responsive shell.
// Build baseline/candidate first; CHROME_PATH points to the disclosed browser.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const roots = [resolve(process.argv[2]), resolve('.')], out = resolve('reports/T-P10k-lab');
const servers = [], results = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  for (const [i, root] of roots.entries()) servers.push(await preview({ root, configFile: false, logLevel: 'silent',
    build: { outDir: resolve(root, 'dist') }, preview: { host: '127.0.0.1', port: 4198 + i, strictPort: true } }));
  for (const [device, scene] of [['phone','soft-studio'],['phone','dark-glass'],['phone','warm-sunset'],['phone','clean-white'],['laptop','soft-studio']]) {
    const captures = [];
    for (const server of servers) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${server.resolvedUrls.local[0]}?pg=1&device=${device}&scene=${scene}`);
      await page.waitForSelector('html[data-plinth-ready="1"]', { timeout: 60000 });
      if (errors.length) throw new Error(errors.join('\n'));
      captures.push(await page.locator('#stage').screenshot()); await page.close();
    }
    const [a,b] = captures.map(bytes => PNG.sync.read(bytes));
    let changed = 0, max = 0;
    if (a.width !== b.width || a.height !== b.height) throw new Error('Dimensions changed');
    for (let i = 0; i < a.data.length; i++) { const diff = Math.abs(a.data[i] - b.data[i]); if (diff) changed++; max = Math.max(max, diff); }
    results.push({device,scene,width:a.width,height:a.height,changedChannels:changed,maxDifference:max});
    await writeFile(resolve(out, `${device}-${scene}.png`), captures[1]);
  }
  for (const mobile of [false,true]) {
    const page = await browser.newPage({ viewport: mobile ? {width:412,height:823} : {width:1280,height:800},
      deviceScaleFactor:mobile ? 1.75 : 1,isMobile:mobile,hasTouch:mobile });
    await page.goto(servers[1].resolvedUrls.local[0]);
    await page.waitForSelector('html[data-plinth-ready="1"]', {timeout:60000});
    await page.screenshot({path:resolve(out,mobile?'mobile-ready.png':'desktop-ready.png')});
    if (mobile) { await page.locator('#settings-open').tap(); await page.screenshot({path:resolve(out,'mobile-settings.png')}); }
    await page.close();
  }
  await writeFile(resolve(out,'visual-check.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results));
  if (results.some(row => row.changedChannels)) throw new Error('Render pixels differ');
} finally {
  await browser.close(); await Promise.all(servers.map(server => new Promise(done => server.httpServer.close(done))));
}
