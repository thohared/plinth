import {beforeAll,afterAll,it,expect} from 'vitest';
import {createServer,type ViteDevServer} from 'vite';
import {chromium,type Browser,type Page} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import {PNG} from 'pngjs';
let server:ViteDevServer,browser:Browser,url:string;
beforeAll(async()=>{
  server=await createServer({logLevel:'silent',server:{port:4201,strictPort:false,hmr:false}});await server.listen();url=server.resolvedUrls!.local[0]!;
  browser=await chromium.launch({...(process.env['PLINTH_CHROMIUM_PATH']?{executablePath:process.env['PLINTH_CHROMIUM_PATH']}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
});
afterAll(async()=>{await browser?.close();await server?.close();});
async function open(page:Page,device='phone') {
  const seed=process.env['PLINTH_STEPS_SEED'];
  if(seed)await page.route('**/src/ui/panel.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const body=seed==='axis'?source.replace('ArrowRight: [1, 0]','ArrowRight: [-1, 0]'):
      seed==='double'?source.replace('rotation.step(...deltas[key]);','rotation.step(...deltas[key]); rotation.step(...deltas[key]);'):
      seed==='gate'?source.replace("const enabled = () => recovery","const enabled = () => free && recovery"):
      seed==='leak'?source.replace('button.addEventListener("keydown",','window.addEventListener("keydown",').replace('document.activeElement !== button ||',''):
      source;
    if(!['history','rotation'].includes(seed))expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const instrumented=source.replace('step(horizontal, vertical) {','step(horizontal, vertical) { window.endpointCalls = (window.endpointCalls || 0) + 1;');
    const body=seed==='rotation'?instrumented.replace('stage.orbit(da, de);','stage.rotate(da, de);'):seed==='history'?instrumented.replace(/history\.run\(\(\) => \{\s*stage\.orbit\(da, de\);\s*render\(\);\s*\}\);/, 'stage.orbit(da, de); render();'):instrumented;
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  await page.goto('about:blank');
  // Legal custom front view: its right/up axes have independent literal oracles.
  await page.goto(url+`#v2/${device}?aspect=3:1&pose=custom&rotation=0,0,0,1&direction=0,0.08715574274765817,0.9961946980917455`);
  await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
  if(await page.locator('#settings-open').isVisible())await page.locator('#settings-open').click();
}
const quaternion=(page:Page)=>page.evaluate(()=>window.__plinth.getSettings().custom.rotation.toArray());
const direction=(page:Page)=>page.evaluate(()=>window.__plinth.getSettings().custom.direction.toArray());
const calls=(page:Page)=>page.evaluate(()=>(window as unknown as {endpointCalls:number}).endpointCalls);
const orbit=(azimuth:number,elevation:number)=>{const a=azimuth*Math.PI/180,e=elevation*Math.PI/180;return [Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)];};
async function at(page:Page,a:number,e:number){close(await direction(page),orbit(a,e));close(await quaternion(page),[0,0,0,1]);}
function close(actual:number[],expected:number[]) {actual.forEach((n,i)=>expect(n).toBeCloseTo(expected[i]!,10));}
// Literal endpoint degrees below are independent of production constants.
it.each([1280,390])('P-26 real buttons, native keys, history, Copy/reload and PNG at %i px',async width=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  try {
    await page.route('**/src/export/png.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const header = new Uint8Array(13);','if (window.pauseStepExport) await new Promise(resolve => { window.finishStepExport = resolve; }); const header = new Uint8Array(13);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);expect(await page.locator('#turn-right').isEnabled()).toBe(true);
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');
    const image=await page.evaluate(()=>window.__plinth.getImage());
    await page.locator('#turn-right').click();await at(page,75,5);expect(await calls(page)).toBe(1);
    await page.locator('#turn-right').click();await at(page,75,5);
    expect(await page.locator('#undo').isEnabled()).toBe(true);await page.locator('#undo').click();await at(page,0,5);expect(await page.locator('#undo').isDisabled()).toBe(true);
    await page.locator('#redo').click();await at(page,75,5);
    expect(await page.evaluate(()=>window.__plinth.getImage())).toEqual(image);
    await page.locator('#free-view').click();await page.locator('#turn-left').click();await at(page,-75,5);expect(await page.locator('#free-view').getAttribute('aria-pressed')).toBe('false');
    const enterCount=await calls(page);await page.locator('#turn-up').focus();await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.up('Enter');await at(page,0,85);expect(await calls(page)).toBe(enterCount+1);
    const spaceCount=await calls(page);await page.locator('#turn-down').focus();await page.keyboard.down(' ');await page.keyboard.down(' ');await page.keyboard.up(' ');await at(page,0,5);expect(await calls(page)).toBe(spaceCount+1);
    await page.locator('#turn-right').focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');await at(page,75,5);
    await page.locator('#turn-left').focus();await page.keyboard.press(' ');await page.keyboard.press(' ');await at(page,-75,5);
    await page.locator('#turn-right').focus();await page.keyboard.down(' ');await page.locator('#copy-link').focus();await page.keyboard.up(' ');await at(page,-75,5);
    await page.locator('#turn-up').focus();await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowRight');await page.keyboard.up('ArrowRight');await at(page,75,5);
    const before=await direction(page);
    for(const key of ['Shift+ArrowLeft','Control+ArrowDown','Alt+ArrowUp','Meta+ArrowRight'])await page.keyboard.press(key);
    await page.locator('#turn-up').evaluate(el=>{el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,isComposing:true}));const e=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});e.preventDefault();el.dispatchEvent(e);});close(await direction(page),before);
    await page.locator('#control-outputPad').focus();await page.keyboard.press('ArrowRight');close(await direction(page),before);expect(await page.locator('#control-outputPad').inputValue()).toBe('1');
    await page.locator('#png-export').click();await page.waitForSelector('#png-download:not([hidden])',{timeout:60000});
    const [originalDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#png-download').click()]);const originalPng=PNG.sync.read(await readFile((await originalDownload.path())!));
    await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy-link').click();await page.waitForFunction(()=>document.querySelector('#share-status')?.textContent==='Link copied');const hash=await page.evaluate(async()=>new URL(await navigator.clipboard.readText()).hash);expect(hash).not.toContain('framing=rotation');
    await page.goto('about:blank');await page.goto(url+hash);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});close(await direction(page),before);
    if(await page.locator('#settings-open').isVisible())await page.locator('#settings-open').click();
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');
    await page.locator('#free-view').click();expect(await page.locator('#turn-right').isEnabled()).toBe(true);
    await page.evaluate(()=>{(window as unknown as {pauseStepExport:boolean}).pauseStepExport=true;});
    await page.evaluate(()=>document.querySelector('#png-export')!.addEventListener('click',()=>{ const button=document.querySelector<HTMLButtonElement>('#turn-left')!;document.body.dataset.stepBusy=String(button.disabled);button.dispatchEvent(new MouseEvent('click',{bubbles:true})); },{once:true}));
    await page.locator('#png-export').click();expect(await page.evaluate(()=>document.body.dataset.stepBusy)).toBe('true');close(await direction(page),before);
    await page.evaluate(()=>(window as unknown as {finishStepExport():void}).finishStepExport());
    await page.waitForSelector('#png-download:not([hidden])',{timeout:60000});
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#png-download').click()]);
    const png=PNG.sync.read(await readFile((await download.path())!));expect([png.width,png.height]).toEqual([1920,640]);expect(png.data.equals(originalPng.data)).toBe(true);
    if(process.env['PLINTH_STEPS_EVIDENCE']) {await mkdir(process.env['PLINTH_STEPS_EVIDENCE'],{recursive:true});await page.locator('#turn-right').scrollIntoViewIfNeeded();await page.screenshot({path:`${process.env['PLINTH_STEPS_EVIDENCE']}/steps-${width}.png`});}
    expect(await page.locator('#turn-right').isEnabled()).toBe(true);const saved=await direction(page);await page.evaluate(()=>window.__plinth.dispose());await page.locator('#turn-left').dispatchEvent('click');await page.locator('#turn-left').dispatchEvent('keydown',{key:'ArrowLeft'});close(await direction(page),saved);
  }finally{await page.close();}
},180000);
it('P-26 literal endpoints on all five devices',async()=>{
  const page=await browser.newPage();
  try{for(const device of ['phone','tablet','laptop','browser','card']){
    await open(page,device);
    await page.locator('#turn-right').click();await at(page,75,5);
    const elevation = device === 'laptop' ? 65 : 85;
    await page.locator('#free-view').click();
    const box=(await page.locator('#stage').boundingBox())!;
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2+15);await page.mouse.up();
    expect(await quaternion(page)).not.toEqual([0,0,0,1]);
    await page.locator('#turn-up').click();await at(page,0,elevation);
    await page.locator('#turn-left').click();await at(page,-75,elevation);
    await page.getByRole('button',{name:'Front view',exact:true}).click();await at(page,0,5);
    expect(await page.locator('#control-pose').inputValue()).toBe('front');
    expect(await page.evaluate(()=>window.__plinth.getSettings().custom.framing)).not.toBe('rotation');
  }}finally{await page.close();}
},180000);
it('P-26 interrupts the displayed transition and PG disables controls',async()=>{
  const page=await browser.newPage();
  try{
    await page.clock.install({time:'2026-01-01T00:00:00Z'});await open(page);await page.clock.pauseAt('2026-01-02T00:00:00Z');
    await page.locator('#control-pose').selectOption('lean');await page.evaluate(()=>window.__plinth.advancePose(.12));
    const before=await quaternion(page);const prior=await direction(page);await page.locator('#free-view').click();await page.locator('#turn-right').click();
    close(await quaternion(page),before);close(await direction(page),orbit(75,Math.asin(prior[1]!)*180/Math.PI));expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(false);
    await page.locator('#undo').click();close(await quaternion(page),before);close(await direction(page),prior);
    await page.clock.resume();await page.goto(url+'?pg=1&ui=1');await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});expect(await page.locator('#turn-right').isDisabled()).toBe(true);
  }finally{await page.close();}
},180000);
it('P-26 upload/recovery gates, focused arrows and gesture separation',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:844}});
  try{
    await page.route('**/src/screen/load.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const blob = await imageBlob(src);','if (src instanceof Blob) await new Promise(resolve => { window.finishUpload = resolve; }); const blob = await imageBlob(src);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);await page.locator('#free-view').click();
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>typeof (window as unknown as {finishUpload?:unknown}).finishUpload==='function');
    const before=await direction(page);expect(await page.locator('#turn-right').isDisabled()).toBe(true);
    await page.locator('#turn-right').dispatchEvent('click');close(await direction(page),before);
    await page.evaluate(()=>(window as unknown as {finishUpload():void}).finishUpload());await page.waitForFunction(()=>!document.querySelector<HTMLButtonElement>('#turn-right')!.disabled);
    await page.locator('#turn-left').focus();await page.keyboard.press('Tab');expect(await page.locator('#turn-right').evaluate(el=>el===document.activeElement)).toBe(true);
    await page.locator('#copy-link').focus();await page.keyboard.press('ArrowRight');close(await direction(page),before);
    // Complete an active drag before the discrete action; Undo separates both edits.
    const box=(await page.locator('#stage').boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2);
    const dragged=await quaternion(page);const draggedDirection=await direction(page);await page.locator('#turn-right').dispatchEvent('click');await page.mouse.up();
    await page.locator('#undo').click();close(await quaternion(page),dragged);close(await direction(page),draggedDirection);await page.locator('#undo').click();close(await direction(page),before);close(await quaternion(page),[0,0,0,1]);
    await page.locator('#free-view').click();
    await page.locator('#stage').dispatchEvent('webglcontextlost',{cancelable:true});expect(await page.locator('#turn-right').isDisabled()).toBe(true);
    await page.locator('#turn-right').dispatchEvent('click');close(await direction(page),before);
  }finally{await page.close();}
},180000);
it('P-26 rejected orbit does not add history or change the pose',async()=>{
  const page=await browser.newPage();
  try{
    await page.route('**/src/scene.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const orbit = directionToOrbit(display.direction);','throw new Error("Seeded rejected orbit"); const orbit = directionToOrbit(display.direction);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);const before=await direction(page);await page.locator('#free-view').click();await page.locator('#turn-right').click();
    close(await direction(page),before);expect(await page.locator('#undo').isDisabled()).toBe(true);expect(await page.locator('#settings-error').innerText()).toContain('Seeded rejected orbit');
  }finally{await page.close();}
},180000);

it('P-26 same endpoint freezes a named transition without a phantom edit',async()=>{
 const page=await browser.newPage();try{
  await page.clock.install({time:'2026-01-01T00:00:00Z'});await open(page);await page.clock.pauseAt('2026-01-02T00:00:00Z');
  await page.locator('#turn-right').click();await at(page,75,5);
  await page.locator('#control-pose').selectOption('lean');
  const namedHash=await page.evaluate(()=>location.hash);
  await page.locator('#turn-right').click();await at(page,75,5);
  expect(await page.evaluate(()=>location.hash)).toBe(namedHash);
  await page.clock.runFor(249);expect(await page.evaluate(()=>location.hash)).toBe(namedHash);
  // The already-scheduled controller frame can restart the ordinary debounce.
  await page.clock.runFor(100);expect(await page.evaluate(()=>location.hash)).toContain('pose=custom');
  expect(await page.evaluate(()=>window.__plinth.advancePose(1))).toBe(false);await at(page,75,5);
  await page.locator('#undo').click();await at(page,75,5);
  await page.locator('#undo').click();await at(page,0,5);expect(await page.locator('#undo').isDisabled()).toBe(true);
 }finally{await page.close();}
},180000);
