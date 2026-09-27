/** Additive P-16 evidence: actual rendered pixels, no baseline replacement. */
import {mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Quaternion,Vector3} from 'three';

export async function captureDeviceDetails(browser,url,out) {
  await mkdir(out,{recursive:true});let count=0;
  for(const shot of [
    {name:'details-phone-front',device:'phone',x:0,y:0},
    {name:'details-phone-back',device:'phone',x:0,y:Math.PI},
    {name:'details-phone-bottom',device:'phone',x:-1.3,y:0},
    {name:'details-tablet-back',device:'tablet',x:0,y:Math.PI},
    {name:'details-laptop-front',device:'laptop',x:0,y:0},
    {name:'details-laptop-back',device:'laptop',x:0,y:Math.PI},
    {name:'details-laptop-underside',device:'laptop',x:-1.7,y:.3},
  ]) {
    const page=await browser.newPage({viewport:{width:1600,height:1600},deviceScaleFactor:1});
    try {
      const errors=[];page.on('pageerror',e=>errors.push(String(e)));
      await page.goto(`${url}?pg=1&capture=square&device=${shot.device}`);
      await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
      const rotation=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),shot.y).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),shot.x)).toArray();
      await page.evaluate(({rotation})=>{
        const s=window.__plinth.getSettings();s.custom.rotation.fromArray(rotation);
        window.__plinth.applySettings({pose:null,custom:s.custom});
        window.__plinth.setCaptureSize(1600,1600);
      },{rotation});
      await page.addStyleTag({content:'#pick,#note {visibility:hidden!important}'});
      await page.locator('#stage').screenshot({path:join(out,shot.name+'.png')});
      if(errors.length)throw new Error(errors.join('\n'));count++;
    } finally {await page.close();}
  }
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  try{
    await mobile.goto(url);await mobile.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
    await mobile.locator('#settings-open').click();await mobile.locator('#free-view').click();
    await mobile.screenshot({path:join(out,'details-mobile-controls.png')});count++;
  }finally{await mobile.close();}
  return count;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const {createServer}=await import('vite'),{chromium}=await import('playwright');
  const server=await createServer({logLevel:'silent',server:{port:4237,strictPort:false,hmr:false}});await server.listen();
  const browser=await chromium.launch({...(process.env.PLINTH_CHROMIUM_PATH?{executablePath:process.env.PLINTH_CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  try{console.log('Captured',await captureDeviceDetails(browser,server.resolvedUrls.local[0],process.argv[2]??'artifacts/device-details'));}
  finally{await browser.close();await server.close();}
}
