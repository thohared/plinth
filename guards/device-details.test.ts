/** P-16 real input, reload and export coverage. Seeds alter served source only. */
import {beforeAll,afterAll,it,expect} from 'vitest';
import {createServer,type ViteDevServer} from 'vite';
import {chromium,type Browser,type Page} from 'playwright';
import {PNG} from 'pngjs';
let server:ViteDevServer,browser:Browser,url:string;
beforeAll(async()=>{
  server=await createServer({logLevel:'silent',server:{port:4238,strictPort:false,hmr:false}});await server.listen();url=server.resolvedUrls!.local[0]!;
  browser=await chromium.launch({...(process.env['PLINTH_CHROMIUM_PATH']?{executablePath:process.env['PLINTH_CHROMIUM_PATH']}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
});
afterAll(async()=>{await browser?.close();await server?.close();});
async function ready(page:Page){
  if(process.env['PLINTH_DETAILS_SEED']==='rotation') await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const body=source.replace('stage.rotate(horizontal, vertical)','stage.orbit(horizontal, vertical)');
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  await page.goto(url);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
}
async function drag(page:Page,dx:number,dy=0){
  const b=(await page.locator('#stage').boundingBox())!;
  const x=b.x+b.width*.15,y=b.y+b.height*.4;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up();
}
const pose=(page:Page)=>page.evaluate(()=>{const s=window.__plinth.getSettings();return {pose:s.pose,rotation:s.custom.rotation.toArray(),direction:s.custom.direction.toArray()};});
it('Free view reaches the back, reverses, persists v1, exports and resets without changing settings',async()=>{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  try{
    await ready(page);const start=await pose(page);
    await page.locator('#free-view').click();expect(await pose(page)).toEqual(start);
    await drag(page,Math.PI*240);
    const back=await pose(page);expect(back.pose).toBeNull();expect(back.direction).toEqual(start.direction);
    // Literal half-turn: scalar component is zero, irrespective of camera-relative axis.
    expect(Math.abs(back.rotation[3]!)).toBeLessThan(.01);
    await drag(page,-80);expect(Math.abs((await pose(page)).rotation[3]!)).toBeGreaterThan(.1);
    const restored=await pose(page);
    await page.waitForFunction(()=>location.hash.startsWith('#s='));
    await page.waitForFunction(({r})=>{
      const state=JSON.parse(atob(location.hash.slice(3).replace(/-/g,'+').replace(/_/g,'/')));
      return state.view.pose===null&&state.view.rotation.every((v:number,i:number)=>Math.abs(v-r[i]!)<1e-7);
    },{r:restored.rotation});
    await page.reload();await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
    const after=await pose(page);after.rotation.forEach((v,i)=>expect(v).toBeCloseTo(restored.rotation[i]!,9));
    expect(await page.locator('#free-view').getAttribute('aria-pressed')).toBe('false');
    await page.locator('#control-aspect').selectOption('1:1');
    await page.locator('#png-export').click();await page.locator('#png-download').waitFor({timeout:90000});
    const png=PNG.sync.read(Buffer.from(await page.evaluate(async()=>Array.from(new Uint8Array(await(await fetch((document.querySelector('#png-download') as HTMLAnchorElement).href)).arrayBuffer())))));
    expect([png.width,png.height]).toEqual([1080,1080]);
    // Export must contain real opaque model pixels, not an empty/transparent canvas.
    let dark=0;for(let i=0;i<png.data.length;i+=4)if(png.data[i]!<160&&png.data[i+3]!>240)dark++;
    expect(dark).toBeGreaterThan(1000);
    await page.locator('#reset-view').click();
    expect(await page.locator('#control-pose').inputValue()).toBe('hero');
    expect(await page.locator('#control-aspect').inputValue()).toBe('1:1');
    expect(await page.locator('#free-view').getAttribute('aria-pressed')).toBe('false');
  }finally{await page.close();}
});
it('phone touch drags continue beyond old limits; footer and named-angle escape remain usable',async()=>{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  try{
    await ready(page);await page.locator('#settings-open').click();await page.locator('#free-view').click();await page.locator('#sheet-close').click();
    const client=await page.context().newCDPSession(page);const b=(await page.locator('#stage').boundingBox())!;
    for(let turn=0;turn<4;turn++){
      const x=b.x+b.width*.1,y=b.y+b.height*.45;
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+180*i/5,y}]});
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    const p=await pose(page);expect(p.pose).toBeNull();expect(Math.abs(p.rotation[3]!)).toBeLessThan(.15);
    const button=(await page.locator('#png-export').boundingBox())!;expect(button.y+button.height).toBeLessThanOrEqual(844);
    await page.locator('#settings-open').click();await page.locator('#control-pose').selectOption('front');
    expect(await page.locator('#free-view').getAttribute('aria-pressed')).toBe('false');
    await page.locator('#free-view').click();await page.locator('[data-composition="dark-laptop"]').click();
    expect(await page.locator('#free-view').getAttribute('aria-pressed')).toBe('false');
  }finally{await page.close();}
});
