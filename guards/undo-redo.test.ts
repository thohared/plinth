import {beforeAll,afterAll,it,expect} from 'vitest';
import {createServer,type ViteDevServer} from 'vite';
import {chromium,type Browser,type Page} from 'playwright';
import {PNG} from 'pngjs';
import {readFile,mkdir} from 'node:fs/promises';
let server:ViteDevServer,browser:Browser,url:string;
beforeAll(async()=>{
  server=await createServer({logLevel:'silent',server:{port:4199,strictPort:false,hmr:false}});await server.listen();url=server.resolvedUrls!.local[0]!;
  browser=await chromium.launch({...(process.env['PLINTH_CHROMIUM_PATH']?{executablePath:process.env['PLINTH_CHROMIUM_PATH']}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
});
afterAll(async()=>{await browser?.close();await server?.close();});
async function open(page:Page) {
  const seed=process.env['PLINTH_HISTORY_SEED'];
  if(seed)await page.route('**/src/state/history.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const body=seed==='undo'?source.replace('cursor += direction;','cursor = cursor;'):
      source.replace('if (!grouped) api.end();','if (true) api.end();');
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  await page.goto(url+'#v2/phone?aspect=3:1');await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
  if(await page.locator('#settings-open').isVisible())await page.locator('#settings-open').click();
}
it.each([1280,390])('P-23 real edits, grouped sliders, upload, Undo→Redo→PNG at %i px',async width=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  try {
    await open(page);expect(await page.locator('#undo').isDisabled()).toBe(true);
    await page.locator('#image-file').setInputFiles('public/demo.png');
    await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');
    const image=await page.evaluate(()=>window.__plinth.getImage());
    await page.locator('#control-scene').selectOption('warm-sunset');
    await page.locator('#control-background').selectOption('transparent');
    await page.evaluate(()=>{document.addEventListener('click',event=>{
      if((event.target as HTMLElement).id==='undo')document.body.dataset.undoUrl=location.hash;
    });});
    await page.locator('#undo').click();
    expect(await page.evaluate(()=>document.body.dataset.undoUrl)).toBe('#v2/phone?scene=warm-sunset&aspect=3:1&fit=cover');
    await page.locator('#undo').click();expect(await page.locator('#undo').isDisabled()).toBe(true);
    expect(await page.locator('#control-scene').inputValue()).toBe('soft-studio');
    await page.locator('#redo').click();await page.locator('#redo').click();expect(await page.locator('#redo').isDisabled()).toBe(true);
    expect(await page.locator('#control-background').inputValue()).toBe('transparent');
    expect(await page.evaluate(()=>window.__plinth.getImage())).toEqual(image);
    // Browser key repeats must constitute one edit even when change fires for each.
    const slider=page.locator('#control-outputPad');await slider.focus();
    await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowRight');await page.keyboard.up('ArrowRight');
    expect(await slider.inputValue()).toBe('3');await page.locator('#undo').click();expect(await slider.inputValue()).toBe('0');
    await page.locator('#redo').click();expect(await slider.inputValue()).toBe('3');
    await page.locator('#undo').click();await page.locator('#control-fit').selectOption('contain');expect(await page.locator('#redo').isDisabled()).toBe(true);
    // Failed decoding cannot erase accepted edits.
    await page.locator('#image-file').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('not an image')});
    await page.waitForFunction(()=>document.querySelector('#note')?.textContent?.includes('Unsupported image'));
    expect(await page.locator('#undo').isEnabled()).toBe(true);
    await page.locator('#undo').click();await page.locator('#redo').click();
    await page.locator('#png-export').click();await page.waitForSelector('#png-download:not([hidden])',{timeout:60000});
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#png-download').click()]);
    const png=PNG.sync.read(await readFile((await download.path())!));expect([png.width,png.height]).toEqual([1920,640]);expect(png.data[3]).toBe(0);
    if(process.env['PLINTH_HISTORY_EVIDENCE']) {await mkdir(process.env['PLINTH_HISTORY_EVIDENCE'],{recursive:true});await page.screenshot({path:`${process.env['PLINTH_HISTORY_EVIDENCE']}/history-${width}.png`});}
    await page.evaluate(()=>{location.hash='#v2/tablet?pose=front';});
    await page.waitForFunction(()=>window.__plinth.getDevice()==='tablet');expect(await page.locator('#undo').isDisabled()).toBe(true);
    await page.locator('#control-scene').selectOption('dark-glass');
    await page.evaluate(()=>{location.hash='#v2/invalid';});await page.waitForFunction(()=>document.querySelector('#share-status')?.textContent?.includes('Invalid'));
    expect(await page.locator('#undo').isEnabled()).toBe(true);
    await page.locator('#image-file').setInputFiles('public/demo.png');
    await page.waitForFunction(()=>document.querySelector<HTMLButtonElement>('#undo')?.disabled);
    expect(await page.locator('#redo').isDisabled()).toBe(true);
  } finally {await page.close();}
},180000);

it('P-23 restores an interrupted frame immediately and commits numeric edits on blur',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:844}});
  try {
    await page.clock.install({time:'2026-01-01T00:00:00Z'});await open(page);await page.clock.pauseAt('2026-01-02T00:00:00Z');
    await page.locator('#control-pose').selectOption('lean');await page.evaluate(()=>window.__plinth.advancePose(.12));
    const before=await page.evaluate(()=>({rotation:window.__plinth.getSettings().custom.rotation.toArray(),direction:window.__plinth.getSettings().custom.direction.toArray()}));
    await page.locator('#control-scene').selectOption('dark-glass');await page.locator('#undo').click();
    expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(false);
    expect(await page.evaluate(()=>({rotation:window.__plinth.getSettings().custom.rotation.toArray(),direction:window.__plinth.getSettings().custom.direction.toArray()}))).toEqual(before);
    await page.locator('#redo').click();expect(await page.locator('#control-pose').inputValue()).toBe('lean');expect(await page.evaluate(()=>window.__plinth.advancePose(0))).toBe(false);
    await page.locator('summary[aria-controls="advanced-controls"]').click();
    const field=page.locator('#control-w');const width=await field.inputValue();
    await field.fill('80');await field.fill('90');await field.blur();await page.locator('#undo').click();expect(await field.inputValue()).toBe(width);
    await field.fill('0');await field.blur();expect(await field.getAttribute('aria-invalid')).toBe('true');
    await page.locator('#redo').click();expect(await page.evaluate(()=>window.__plinth.getSpec().w)).toBe(.09);
  } finally {await page.close();}
},180000);

it('P-23 disables history during upload/export and enters recovery on a seeded restore failure',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:844}});
  try {
    await page.route('**/src/screen/load.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace('const blob = await imageBlob(src);','if (src instanceof Blob) await new Promise(resolve => { window.finishUpload = resolve; }); const blob = await imageBlob(src);');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await page.route('**/src/main.ts',async route=>{
      const response=await route.fetch(),source=await response.text();
      const body=source.replace(/checkGl\(renderer, ["']Restoring edit["']\);/,'throw new Error("Seeded restore failure");');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await open(page);await page.locator('#control-scene').selectOption('warm-sunset');
    await page.locator('#image-file').setInputFiles('public/demo.png');await page.waitForFunction(()=>typeof (window as unknown as {finishUpload?:unknown}).finishUpload==='function');
    expect(await page.locator('#undo').isDisabled()).toBe(true);
    await page.evaluate(()=>(window as unknown as {finishUpload():void}).finishUpload());
    await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');expect(await page.locator('#undo').isDisabled()).toBe(true);
    await page.locator('#control-scene').selectOption('dark-glass');
    const busy=await page.evaluate(()=>{const operation=window.__plinth.exportPng(1);void operation.catch(()=>{});return document.querySelector<HTMLButtonElement>('#undo')!.disabled;});expect(busy).toBe(true);
    await page.waitForFunction(()=>!document.querySelector<HTMLButtonElement>('#undo')!.disabled);
    const hash=new URL(page.url()).hash;await page.locator('#undo').click();
    expect(await page.evaluate(()=>window.__plinth.getRecovery())).toBe('failed');expect(await page.locator('#undo').isDisabled()).toBe(true);expect(new URL(page.url()).hash).toBe(hash);
    expect(await page.locator('#settings-error').innerText()).toContain('Seeded restore failure');
  } finally {await page.close();}
},180000);

it('P-23 drag is one custom-pose edit, native control undo is preserved, and active drag ends before traversal',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:844}});
  try {
    await open(page);await page.locator('#free-view').click();
    const box=(await page.locator('#stage').boundingBox())!;
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
    await page.mouse.move(box.x+box.width/2+90,box.y+box.height/2+30,{steps:8});await page.mouse.up();
    const custom=await page.evaluate(()=>({rotation:window.__plinth.getSettings().custom.rotation.toArray(),framing:window.__plinth.getSettings().custom.framing}));
    expect(custom.framing).toBe('rotation');await page.locator('#undo').click();expect(await page.locator('#undo').isDisabled()).toBe(true);
    expect(await page.locator('#free-view').getAttribute('aria-pressed')).toBe('false');
    await page.locator('#redo').click();expect(await page.evaluate(()=>window.__plinth.getSettings().custom.rotation.toArray())).toEqual(custom.rotation);
    await page.locator('#control-device').focus();await page.keyboard.press('Control+z');expect(await page.locator('#undo').isEnabled()).toBe(true);
    await page.locator('#copy-link').focus();await page.keyboard.press('Control+z');expect(await page.locator('#undo').isDisabled()).toBe(true);
    await page.keyboard.press('Control+Shift+z');expect(await page.locator('#redo').isDisabled()).toBe(true);
    await page.locator('#free-view').click();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2);
    await page.keyboard.press('Control+z');const restored=await page.evaluate(()=>window.__plinth.getSettings().custom.rotation.toArray());
    await page.mouse.move(box.x+box.width/2+80,box.y+box.height/2);await page.mouse.up();
    expect(await page.evaluate(()=>window.__plinth.getSettings().custom.rotation.toArray())).toEqual(restored);
  } finally {await page.close();}
},180000);
