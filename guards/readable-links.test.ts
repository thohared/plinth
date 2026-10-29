import { beforeAll,afterAll,it,expect } from 'vitest';
import { createServer,type ViteDevServer } from 'vite';
import { chromium,type Browser,type Page } from 'playwright';
let server:ViteDevServer,browser:Browser,url:string;
beforeAll(async()=>{
  server=await createServer({logLevel:'silent',server:{port:4196,strictPort:false,hmr:false}});await server.listen();url=server.resolvedUrls!.local[0]!;
  browser=await chromium.launch({...(process.env['PLINTH_CHROMIUM_PATH']?{executablePath:process.env['PLINTH_CHROMIUM_PATH']}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
});
afterAll(async()=>{await browser?.close();await server?.close();});
async function ready(page:Page,suffix='') {await page.goto(url+suffix);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});}
async function seed(page:Page) {
  const mode=process.env['PLINTH_READABLE_SEED'];if(!mode)return;
  await page.route('**/src/state/codec.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const body=mode==='opaque' ? source.replace('return encodeReadable(decodeV1(state));',"return '#s=' + btoa(JSON.stringify(decodeV1(state)));") : source.replace('value > max','false');
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
}
it.each([1280,390])('P-21 real controls, copy and reload keep readable links at width %i',async width=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  try {
    await seed(page);await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:undefined});});await ready(page);
    if(width<900)await page.locator('#settings-open').click();
    await page.locator('#control-device').selectOption('laptop');
    await page.locator('#control-scene').selectOption('warm-sunset');
    await page.locator('#control-aspect').selectOption('16:9');
    await page.waitForFunction(()=>location.hash.startsWith('#v2/laptop?')&&location.hash.includes('scene=warm-sunset')&&location.hash.includes('aspect=16:9'));
    const edited=await page.evaluate(()=>location.hash);
    expect(edited.length).toBeLessThan(100);expect(edited).not.toContain('#s=');
    const before=await page.evaluate(()=>window.__plinth.getSettings());
    await page.locator('#copy-link').click();
    expect(await page.locator('#share-status').innerText()).toBe('Copy this link manually');
    const shared=await page.locator('#share-url').inputValue();
    expect(shared).toBe(url+edited);expect(new URL(shared).search).toBe('');
    expect(await page.locator('#share-url').isVisible()).toBe(true);
    const recipient=await browser.newPage({viewport:{width,height:844}});
    try {
      await recipient.goto(shared);await recipient.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
      expect(await recipient.evaluate(()=>window.__plinth.getSettings())).toEqual(before);
      expect(await recipient.evaluate(()=>window.__plinth.getImage()?.identity)).toBe('demo');
      await recipient.reload();await recipient.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
      expect(await recipient.evaluate(()=>window.__plinth.getSettings())).toEqual(before);
      expect(await recipient.locator('#png-export').isEnabled()).toBe(true);
    } finally {await recipient.close();}
  } finally {await page.close();}
});
it('P-21 migrates a literal legacy scene and rejects malformed v2 without changing upload or history',async()=>{
  const page=await browser.newPage();
  try {
    await seed(page);
    const legacy={v:1,device:'phone',spec:{w:.07266,h:.15,depth:.01,cornerRadius:.01,bezel:.0042,screenInset:.0008,frameMetalness:.95,frameRoughness:.18,glassClearcoat:1,standType:'none',hingeAngle:1.5707963267948966},view:{pose:'hero'},scene:'soft-studio',tone:'agx',msaa:false,aspect:'4:5',outputPad:0,background:{mode:'preset',solid:'#ffffff',top:'#f2f4f8',bottom:'#c8d3e3'},fit:'contain',pad:0,padColor:'#ffffff',pngScale:1};
    await ready(page,'#s='+Buffer.from(JSON.stringify(legacy)).toString('base64url'));
    expect(new URL(page.url()).hash).toBe('#v2/phone');
    await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=29;c.height=17;await window.__plinth.setImage(await new Promise<Blob>(r=>c.toBlob(b=>r(b!))));});
    await page.waitForFunction(()=>location.hash.includes('fit=cover'));
    const before=await page.evaluate(()=>({settings:window.__plinth.getSettings(),image:window.__plinth.getImage()}));
    for(const hash of ['#v2/phone?pad=0.251','#v2/phone?pad=0&pad=0.1','#v3/laptop']) {
      await page.evaluate(hash=>new Promise<void>(resolve=>{addEventListener('hashchange',()=>resolve(),{once:true});location.hash=hash;}),hash);
      expect(await page.locator('#share-status').innerText()).toMatch(/Invalid|Unsupported/);
      expect(await page.evaluate(()=>window.__plinth.getRecovery())).toBe('ready');
      expect(await page.evaluate(()=>({settings:window.__plinth.getSettings(),image:window.__plinth.getImage()}))).toEqual(before);
      expect(new URL(page.url()).hash).toBe(hash);
    }
    await page.evaluate(()=>{location.hash='#v2/card?pose=front&fit=cover&scale=2';});await page.waitForFunction(()=>window.__plinth.getDevice()==='card');
    expect(await page.evaluate(()=>window.__plinth.getSettings().pngScale)).toBe(2);
    expect(await page.evaluate(()=>window.__plinth.getImage())).toEqual(before.image);
    await page.reload();await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
    expect(await page.evaluate(()=>window.__plinth.getDevice())).toBe('card');
    expect(await page.evaluate(()=>window.__plinth.getImage()?.identity)).toBe('demo');
  } finally {await page.close();}
});
