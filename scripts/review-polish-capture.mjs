// Repeatable owner reference views. Native downloads are separate from small previews.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const out = process.env.PLINTH_CAPTURE_DIR ?? 'review-polish-capture';
await mkdir(`${out}/views`, {recursive:true});
const server = await createServer({logLevel:'error',server:{port:4197,strictPort:false,hmr:false}}); await server.listen();
const browser = await chromium.launch({...(process.env.PLINTH_CHROMIUM_PATH?{executablePath:process.env.PLINTH_CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const report = {browser:browser.version(),captures:[],downloads:[],errors:[]};
const devices = ['phone','tablet','laptop','browser','card'];
const scenes = ['soft-studio','dark-glass','warm-sunset','clean-white'];
try {
 const page = await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(String(e)));
 await page.goto(`${server.resolvedUrls.local[0]}?pg=1`);
 await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
 await page.addStyleTag({content:'body.pg #pick,body.pg #note{visibility:hidden}'});
 const tiles = [];
 for (const scene of scenes) for (const device of devices) for (const pose of ['front','hero','top','lean']) {
  await page.evaluate(({device,scene,pose})=>{const h=window.__plinth;h.setDevice(device);h.setScene(scene);h.setPose(pose);}, {device,scene,pose});
  const state = await page.evaluate(()=>({settings:window.__plinth.getSettings(),image:window.__plinth.getImage()}));
  assert.equal(state.image.identity,'demo');assert.equal(state.image.fit,'contain');
  assert.equal(state.image.originalWidth, device==='phone'?845:2880);
  const name=`${device}-${scene}-${pose}.png`;
  const bytes=await page.locator('#stage').screenshot({path:`${out}/views/${name}`});
  report.captures.push({name,device,scene,pose,...state});
  if(pose==='hero')tiles.push({device,scene,png:PNG.sync.read(bytes)});
 }
 // Compact grid: columns phone/tablet/laptop/browser/card; rows studio/dark/warm/white.
 const sheet = new PNG({width:1600,height:800});sheet.data.fill(255);
 for(const {device,scene,png} of tiles){
  const ox=devices.indexOf(device)*320,oy=scenes.indexOf(scene)*200;
  // Box downsample only for the overview; native render files are untouched.
  for(let y=0;y<200;y++)for(let x=0;x<320;x++)for(let c=0;c<4;c++){
   let sum=0;for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++)sum+=png.data[((y*4+dy)*1280+x*4+dx)*4+c];
   sheet.data[((oy+y)*1600+ox+x)*4+c]=Math.round(sum/16);
  }
 }
 await writeFile(`${out}/device-scene-overview.png`,PNG.sync.write(sheet));
 await page.goto(server.resolvedUrls.local[0]);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
 await page.screenshot({path:`${out}/ui-desktop-light.png`});
 await page.locator('#interface-theme').click();await page.screenshot({path:`${out}/ui-desktop-dark.png`});await page.locator('#interface-theme').click();
 for(const device of devices){
  await page.getByLabel('Device',{exact:true}).selectOption(device);
  await page.getByLabel('Angle',{exact:true}).selectOption(device==='phone'?'lean':'hero');
  await page.getByLabel('Aspect ratio',{exact:true}).selectOption(device==='phone'?'4:5':'16:9');
  await page.getByLabel('Lighting',{exact:true}).selectOption(device==='laptop'?'dark-glass':'soft-studio');
  await page.waitForFunction(pose=>window.__plinth.getSettings().pose===pose,device==='phone'?'lean':'hero');
  // P-14 composition/view snapshot includes the actual displayed pose; settle it.
  await page.evaluate(()=>window.__plinth.advancePose(1));
  await page.getByLabel('PNG size',{exact:true}).selectOption('2');
  await page.getByRole('button',{name:'Export PNG',exact:true}).click();
  const link=page.locator('#png-download');await link.waitFor({timeout:90000});
  const pending=page.waitForEvent('download');await link.click();const download=await pending;
  const name=`${device}-native-2x.png`;await download.saveAs(`${out}/${name}`);assert.equal(await download.failure(),null);
  report.downloads.push({name,filename:download.suggestedFilename(),settings:await page.evaluate(()=>window.__plinth.getSettings())});
 }
 await page.setViewportSize({width:400,height:800});await page.goto(server.resolvedUrls.local[0]);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
 await page.screenshot({path:`${out}/ui-phone-light.png`});await page.locator('#settings-open').click();
 await page.screenshot({path:`${out}/ui-phone-settings.png`});await page.locator('#interface-theme').click();
 await page.screenshot({path:`${out}/ui-phone-dark.png`});
 await page.setViewportSize({width:820,height:1180});await page.screenshot({path:`${out}/ui-tablet-dark.png`});
 assert.deepEqual(report.errors,[]);report.success=true;
 console.log(`Captured ${report.captures.length} views, ${report.downloads.length} native downloads and desktop/mobile UI.`);
} catch(error){report.success=false;report.errors.push(String(error));throw error;}
finally{await browser.close();await server.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
