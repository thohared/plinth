import {beforeAll,afterAll,it,expect} from 'vitest';
import {createServer,type ViteDevServer} from 'vite';
import {chromium,type Browser,type Page} from 'playwright';
let server:ViteDevServer,browser:Browser,url:string;
type RecordedWindow = Window & {addressEvents:{target:string;hash:string}[]};
beforeAll(async()=>{
 server=await createServer({logLevel:'silent',server:{port:4197,strictPort:false,hmr:false}});await server.listen();url=server.resolvedUrls!.local[0]!;
 browser=await chromium.launch({...(process.env['PLINTH_CHROMIUM_PATH']?{executablePath:process.env['PLINTH_CHROMIUM_PATH']}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
});
afterAll(async()=>{await browser?.close();await server?.close();});
async function seed(page:Page) {
 const mode=process.env['PLINTH_ADDRESS_SEED'];if(!mode)return;
 await page.route(mode==='delay'?'**/src/state/navigation.ts':'**/src/main.ts',async route=>{
  const response=await route.fetch(),source=await response.text();
  const body=mode==='delay'?source.replace(/if \(immediate\)\s*synchronize\(\);/,'if (false) synchronize();')
   :source.replace(/snapshotState\(store\.get\(\),\s*false\)/,'snapshotState(store.get(),stage.isTransitioning())');
  expect(body).not.toBe(source);await route.fulfill({response,body});
 });
}
it.each([1280,390])('P-22 selections replace the address within their UI event at width %i',async width=>{
 const page=await browser.newPage({viewport:{width,height:844}});
 try {
  await seed(page);await page.clock.install({time:'2026-01-01T00:00:00Z'});
  await page.goto(url+'#v2/phone');await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
  if(width<900&&await page.locator('#settings-open').getAttribute('aria-expanded')==='false')await page.locator('#settings-open').click();
  await page.clock.pauseAt('2026-01-02T00:00:00Z');
  await page.evaluate(()=>{
   const win=window as unknown as RecordedWindow;win.addressEvents=[];
   const record=(event:Event)=>{
    const target=event.target instanceof Element?event.target.closest('button,select'):null;
    if(!target?.matches('[data-composition],#control-device,#control-scene,#control-pose,#reset-view,#reset'))return;
    if(event.type===(target.tagName==='BUTTON'?'click':'change'))win.addressEvents.push({target:target.id||target.getAttribute('data-composition')!,hash:location.hash});
   };
   document.addEventListener('click',record);document.addEventListener('change',record);
  });
  const check=async(target:string,action:()=>Promise<unknown>,expected:string,transition=false,inspect?:()=>Promise<void>)=>{
   await page.evaluate(()=>{(window as unknown as RecordedWindow).addressEvents=[];});await action();
   // The oracle is captured during the input event, before any timer or animation frame.
   expect(await page.evaluate(()=>(window as unknown as RecordedWindow).addressEvents)).toEqual([{target,hash:expected}]);
   expect(new URL(page.url()).hash).toBe(expected);
   if(transition)expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(true);
   if(inspect)await inspect();
   await page.evaluate(()=>window.__plinth.advancePose(1));await page.clock.runFor(300);
   expect(new URL(page.url()).hash).toBe(expected);
  };
  for(const [id,expected] of [
   ['dark-laptop','#v2/laptop?scene=dark-glass'],
   ['warm-card','#v2/card?scene=warm-sunset&pose=lean'],
   ['clean-tablet','#v2/tablet?scene=clean-white&pose=front'],
   ['studio-phone','#v2/phone'],
  ])await check(id!,()=>page.locator(`[data-composition="${id}"]`).click(),expected!,true);
  await check('control-device',()=>page.locator('#control-device').selectOption('tablet'),'#v2/tablet');
  await check('control-scene',()=>page.locator('#control-scene').selectOption('warm-sunset'),'#v2/tablet?scene=warm-sunset');
  await check('control-pose',()=>page.locator('#control-pose').selectOption('top'),'#v2/tablet?scene=warm-sunset&pose=top',true,async()=>{
   const recipient=await browser.newPage({viewport:{width,height:844}});
   try {
    await recipient.goto(page.url());await recipient.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
    const checkTarget=async()=>{
     expect(await recipient.evaluate(()=>window.__plinth.getSettings())).toMatchObject({device:'tablet',scene:'warm-sunset',pose:'top',aspect:'4:5'});
     const rotation=await recipient.evaluate(()=>window.__plinth.getSettings().custom.rotation.toArray());
     expect(rotation[0]).toBeCloseTo(-Math.SQRT1_2,12);expect(rotation[1]).toBe(0);expect(rotation[2]).toBe(0);expect(rotation[3]).toBeCloseTo(Math.SQRT1_2,12);
     expect(await recipient.evaluate(()=>window.__plinth.advancePose(0))).toBe(false);
    };
    await checkTarget();await recipient.reload();await recipient.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});await checkTarget();
    expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(true);
   } finally {await recipient.close();}
  });
  await check('reset-view',()=>page.locator('#reset-view').click(),'#v2/tablet?scene=warm-sunset',true);
  await check('reset',()=>page.locator('#reset').click(),width===1280?'#v2/phone?aspect=16:9':'#v2/phone?aspect=1:1');
  const before=await page.evaluate(()=>window.__plinth.getSettings());
  await page.clock.resume();await page.reload();await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
  expect(await page.evaluate(()=>window.__plinth.getSettings())).toEqual(before);
  expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(false);
  expect(await page.locator('#png-export').isEnabled()).toBe(true);
 } finally {await page.close();}
});
