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
    const body=seed==='axis'?source.replace('ArrowRight: [Math.PI / 36, 0]','ArrowRight: [-Math.PI / 36, 0]'):
      seed==='double'?source.replace('attempt(button, () => rotation.step(...deltas[key]));','attempt(button, () => { rotation.step(...deltas[key]); rotation.step(...deltas[key]); });'):
      seed==='leak'?source.replace('button.addEventListener("keydown",','window.addEventListener("keydown",').replace('document.activeElement !== button ||',''):
      source;
    if(seed!=='history')expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  if(seed==='history')await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const body=source.replace(/history\.run\(\(\) => \{\s*stage\.rotate\(horizontal, vertical\);\s*render\(\);\s*\}\);/, 'stage.rotate(horizontal, vertical); render();');
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  await page.goto('about:blank');
  // Legal custom front view: its right/up axes have independent literal oracles.
  await page.goto(url+`#v2/${device}?aspect=3:1&pose=custom&rotation=0,0,0,1&direction=0,0.08715574274765817,0.9961946980917455`);
  await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
  if(await page.locator('#settings-open').isVisible())await page.locator('#settings-open').click();
}
const quaternion=(page:Page)=>page.evaluate(()=>window.__plinth.getSettings().custom.rotation.toArray());
function close(actual:number[],expected:number[]) {actual.forEach((n,i)=>expect(n).toBeCloseTo(expected[i]!,10));}
// sin/cos(2.5°), independent of the production step constants.
const right=[0,0.0434534024273578,-0.003801680104023675,0.9990482215818578];
it.each([1280,390])('P-25 real buttons, native keys, history, Copy/reload and PNG at %i px',async width=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  try {
    await page.route('**/src/export/png.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const header = new Uint8Array(13);','if (window.pauseStepExport) await new Promise(resolve => { window.finishStepExport = resolve; }); const header = new Uint8Array(13);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);expect(await page.locator('#turn-right').isDisabled()).toBe(true);
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');
    const image=await page.evaluate(()=>window.__plinth.getImage());
    await page.locator('#free-view').click();close(await quaternion(page),[0,0,0,1]);
    await page.locator('#turn-right').click();close(await quaternion(page),right);
    expect(await page.locator('#undo').isEnabled()).toBe(true);await page.locator('#undo').click();close(await quaternion(page),[0,0,0,1]);expect(await page.locator('#turn-right').isDisabled()).toBe(true);
    await page.locator('#redo').click();close(await quaternion(page),right);
    expect(await page.evaluate(()=>window.__plinth.getImage())).toEqual(image);
    await page.locator('#free-view').click();await page.locator('#turn-left').click();close(await quaternion(page),[0,0,0,1]);
    await page.locator('#turn-up').focus();await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.up('Enter');
    close(await quaternion(page),[-0.043619387365336,0,0,0.9990482215818578]);
    await page.locator('#turn-down').focus();await page.keyboard.down(' ');await page.keyboard.down(' ');await page.keyboard.up(' ');close(await quaternion(page),[0,0,0,1]);
    await page.locator('#turn-right').focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');close(await quaternion(page),[0,0.08682408883346517,-0.007596123493895969,0.9961946980917455]);
    await page.locator('#turn-left').focus();await page.keyboard.press(' ');await page.keyboard.press(' ');close(await quaternion(page),[0,0,0,1]);
    await page.locator('#turn-right').focus();await page.keyboard.down(' ');await page.locator('#copy-link').focus();await page.keyboard.up(' ');close(await quaternion(page),[0,0,0,1]);
    await page.locator('#turn-up').focus();await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowRight');await page.keyboard.up('ArrowRight');close(await quaternion(page),right);
    const before=await quaternion(page);
    for(const key of ['Shift+ArrowLeft','Control+ArrowDown','Alt+ArrowUp','Meta+ArrowRight'])await page.keyboard.press(key);
    await page.locator('#turn-up').evaluate(el=>{el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,isComposing:true}));const e=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});e.preventDefault();el.dispatchEvent(e);});close(await quaternion(page),before);
    await page.locator('#control-outputPad').focus();await page.keyboard.press('ArrowRight');close(await quaternion(page),before);expect(await page.locator('#control-outputPad').inputValue()).toBe('1');
    await page.locator('#png-export').click();await page.waitForSelector('#png-download:not([hidden])',{timeout:60000});
    const [originalDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#png-download').click()]);const originalPng=PNG.sync.read(await readFile((await originalDownload.path())!));
    await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy-link').click();await page.waitForFunction(()=>document.querySelector('#share-status')?.textContent==='Link copied');const hash=await page.evaluate(async()=>new URL(await navigator.clipboard.readText()).hash);expect(hash).toContain('framing=rotation');
    await page.goto('about:blank');await page.goto(url+hash);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});close(await quaternion(page),before);
    if(await page.locator('#settings-open').isVisible())await page.locator('#settings-open').click();
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');
    await page.locator('#free-view').click();expect(await page.locator('#turn-right').isEnabled()).toBe(true);
    await page.evaluate(()=>{(window as unknown as {pauseStepExport:boolean}).pauseStepExport=true;});
    await page.evaluate(()=>document.querySelector('#png-export')!.addEventListener('click',()=>{ const button=document.querySelector<HTMLButtonElement>('#turn-right')!;document.body.dataset.stepBusy=String(button.disabled);button.dispatchEvent(new MouseEvent('click',{bubbles:true})); },{once:true}));
    await page.locator('#png-export').click();expect(await page.evaluate(()=>document.body.dataset.stepBusy)).toBe('true');close(await quaternion(page),before);
    await page.evaluate(()=>(window as unknown as {finishStepExport():void}).finishStepExport());
    await page.waitForSelector('#png-download:not([hidden])',{timeout:60000});
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#png-download').click()]);
    const png=PNG.sync.read(await readFile((await download.path())!));expect([png.width,png.height]).toEqual([1920,640]);expect(png.data.equals(originalPng.data)).toBe(true);
    if(process.env['PLINTH_STEPS_EVIDENCE']) {await mkdir(process.env['PLINTH_STEPS_EVIDENCE'],{recursive:true});await page.locator('#turn-right').scrollIntoViewIfNeeded();await page.screenshot({path:`${process.env['PLINTH_STEPS_EVIDENCE']}/steps-${width}.png`});}
    expect(await page.locator('#turn-right').isEnabled()).toBe(true);const saved=await quaternion(page);await page.evaluate(()=>window.__plinth.dispose());await page.locator('#turn-right').dispatchEvent('click');await page.locator('#turn-right').dispatchEvent('keydown',{key:'ArrowRight'});close(await quaternion(page),saved);
  }finally{await page.close();}
},180000);
it('P-25 literal signs and inverse steps on all five devices',async()=>{
  const page=await browser.newPage();
  try{for(const device of ['phone','tablet','laptop','browser','card']){
    await open(page,device);await page.locator('#free-view').click();
    await page.locator('#turn-right').click();close(await quaternion(page),right);
    await page.locator('#turn-left').click();close(await quaternion(page),[0,0,0,1]);
    await page.locator('#turn-down').click();close(await quaternion(page),[0.043619387365336,0,0,0.9990482215818578]);
    await page.locator('#turn-up').click();close(await quaternion(page),[0,0,0,1]);
    expect(await page.evaluate(()=>window.__plinth.getSettings().custom.framing)).toBe('rotation');
  }}finally{await page.close();}
},180000);
it('P-25 interrupts the displayed transition and PG disables controls',async()=>{
  const page=await browser.newPage();
  try{
    await page.clock.install({time:'2026-01-01T00:00:00Z'});await open(page);await page.clock.pauseAt('2026-01-02T00:00:00Z');
    await page.locator('#control-pose').selectOption('lean');await page.evaluate(()=>window.__plinth.advancePose(.12));
    const before=await quaternion(page);const direction=await page.evaluate(()=>window.__plinth.getSettings().custom.direction.toArray());await page.locator('#free-view').click();await page.locator('#turn-right').click();
    // Quaternion product delta * displayed, computed independently from scalar components.
    const [dx,dy,dz]=direction as [number,number,number];const length=Math.hypot(dx,dz);const ax=-dx*dy/length*0.043619387365336,ay=length*0.043619387365336,az=-dy*dz/length*0.043619387365336,w=0.9990482215818578;const [x,y,z,qw]=before as [number,number,number,number];
    close(await quaternion(page),[w*x+ax*qw+ay*z-az*y,w*y-ax*z+ay*qw+az*x,w*z+ax*y-ay*x+az*qw,w*qw-ax*x-ay*y-az*z]);expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(false);
    await page.locator('#undo').click();close(await quaternion(page),before);
    await page.clock.resume();await page.goto(url+'?pg=1&ui=1');await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});expect(await page.locator('#turn-right').isDisabled()).toBe(true);
  }finally{await page.close();}
},180000);
it('P-25 upload/recovery gates, focused arrows and gesture separation',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:844}});
  try{
    await page.route('**/src/screen/load.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const blob = await imageBlob(src);','if (src instanceof Blob) await new Promise(resolve => { window.finishUpload = resolve; }); const blob = await imageBlob(src);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);await page.locator('#free-view').click();
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>typeof (window as unknown as {finishUpload?:unknown}).finishUpload==='function');
    const before=await quaternion(page);expect(await page.locator('#turn-right').isDisabled()).toBe(true);
    await page.locator('#turn-right').dispatchEvent('click');close(await quaternion(page),before);
    await page.evaluate(()=>(window as unknown as {finishUpload():void}).finishUpload());await page.waitForFunction(()=>!document.querySelector<HTMLButtonElement>('#turn-right')!.disabled);
    await page.locator('#turn-left').focus();await page.keyboard.press('Tab');expect(await page.locator('#turn-right').evaluate(el=>el===document.activeElement)).toBe(true);
    await page.locator('#copy-link').focus();await page.keyboard.press('ArrowRight');close(await quaternion(page),before);
    // Complete an active drag before the discrete action; Undo separates both edits.
    const box=(await page.locator('#stage').boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2);
    const dragged=await quaternion(page);await page.locator('#turn-right').dispatchEvent('click');await page.mouse.up();
    await page.locator('#undo').click();close(await quaternion(page),dragged);await page.locator('#undo').click();close(await quaternion(page),before);
    await page.locator('#free-view').click();
    await page.locator('#stage').dispatchEvent('webglcontextlost',{cancelable:true});expect(await page.locator('#turn-right').isDisabled()).toBe(true);
    await page.locator('#turn-right').dispatchEvent('click');close(await quaternion(page),before);
  }finally{await page.close();}
},180000);
it('P-25 rejected rotation does not add history or change the pose',async()=>{
  const page=await browser.newPage();
  try{
    await page.route('**/src/scene.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const rotation = rotateInView(display.rotation, display.direction, horizontal, vertical);','throw new Error("Seeded rejected rotation"); const rotation = rotateInView(display.rotation, display.direction, horizontal, vertical);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);const before=await quaternion(page);await page.locator('#free-view').click();await page.locator('#turn-right').click();
    close(await quaternion(page),before);expect(await page.locator('#undo').isDisabled()).toBe(true);expect(await page.locator('#settings-error').innerText()).toContain('Seeded rejected rotation');
  }finally{await page.close();}
},180000);
