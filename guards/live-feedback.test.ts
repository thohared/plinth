import {beforeAll,afterAll,it,expect} from 'vitest';
import {createServer,type ViteDevServer} from 'vite';
import {chromium,type Browser,type Page} from 'playwright';
import {PNG} from 'pngjs';
import {readFile,mkdir} from 'node:fs/promises';
let server:ViteDevServer,browser:Browser,url:string;
beforeAll(async()=>{
  server=await createServer({logLevel:'silent',server:{port:4224,strictPort:false,hmr:false}});await server.listen();url=server.resolvedUrls!.local[0]!;
  browser=await chromium.launch({...(process.env['PLINTH_CHROMIUM_PATH']?{executablePath:process.env['PLINTH_CHROMIUM_PATH']}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
});
afterAll(async()=>{await browser?.close();await server?.close();});
async function ready(page:Page){
  if(process.env['PLINTH_LIVE_SEED']==='defaults')await page.route('**/src/ui/defaults.ts',async route=>{
    const response=await route.fetch(),source=await response.text();
    const body=source.replace("if (size < 600) return", "if (size < 600) return '4:5'; if (size < 600) return");
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
  if(process.env['PLINTH_LIVE_SEED']==='download')await page.route('**/src/ui/panel.css',async route=>{
    const response=await route.fetch();await route.fulfill({response,body:await response.text()+'\n.editor #png-feedback {max-height:30px!important;overflow:hidden!important;}'});
  });
  await page.goto(url);await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
}
async function capture(page:Page,name:string){const out=process.env['PLINTH_LIVE_EVIDENCE'];if(out){await mkdir(out,{recursive:true});await page.screenshot({path:`${out}/${name}.png`});}}
async function waitForUpload(page:Page,width:number,height:number){
  // Completion is image identity/dimensions, never the fit that the test asserts.
  await page.waitForFunction(({width,height})=>{
    const image=window.__plinth.getImage();
    return image?.identity==='user'&&image.originalWidth===width&&image.originalHeight===height;
  },{width,height});
}
async function disableUploadFill(page:Page){
  await page.route('**/src/settings.ts',async route=>{
    const response=await route.fetch(),source=await response.text(),body=source.replace('if (options.fillUploads) api.apply', 'if (false && options.fillUploads) api.apply');
    expect(body).not.toBe(source);await route.fulfill({response,body});
  });
}
type UploadGateWindow=Window & {uploadDecodeGate:{started:boolean;release():void}};
async function holdUploadDecode(page:Page,name:string){
  await page.evaluate(name=>{
    const native=window.createImageBitmap;
    let release!:()=>void;
    const pending=new Promise<void>(resolve=>{release=resolve;});
    const state:UploadGateWindow['uploadDecodeGate']={started:false,release};
    (window as unknown as UploadGateWindow).uploadDecodeGate=state;
    window.createImageBitmap=((...args:unknown[])=>{
      const decode=()=>Reflect.apply(native,window,args) as Promise<ImageBitmap>;
      if(args[0] instanceof File&&args[0].name===name){
        window.createImageBitmap=native;state.started=true;
        return pending.then(decode);
      }
      return decode();
    }) as typeof createImageBitmap;
  },name);
}
for(const host of [
  {name:'phone',width:400,height:800,touch:true,aspect:'1:1'},
  {name:'phone-landscape',width:800,height:400,touch:true,aspect:'1:1'},
  {name:'tablet',width:1024,height:768,touch:true,aspect:'4:5'},
  {name:'desktop',width:1280,height:800,touch:false,aspect:'16:9'},
])it(`T-P9f ${host.name} defaults, looks and explicit state precedence`,async()=>{
  const page=await browser.newPage({viewport:{width:host.width,height:host.height},hasTouch:host.touch});try{
    await ready(page);
    expect(await page.evaluate(()=>window.__plinth.getSettings())).toMatchObject({aspect:host.aspect,outputPad:0});
    if(host.width<900){expect(await page.locator('#mobile-brand').isVisible()).toBe(true);await capture(page,host.name+'-home');await page.locator('#settings-open').click();}
    await page.locator('#control-aspect').selectOption('9:16');
    for(const id of ['studio-phone','dark-laptop','clean-tablet','warm-card']){
      await page.locator(`[data-composition="${id}"]`).click();
      expect(await page.evaluate(()=>window.__plinth.getSettings())).toMatchObject({aspect:'9:16',outputPad:0});
    }
    await page.locator('[data-composition="clean-tablet"]').click();
    expect(await page.locator('#control-device').inputValue()).toBe('tablet');
    await page.locator('#control-device').selectOption('browser');
    expect(await page.locator('#control-device').inputValue()).toBe('browser');
    await page.setViewportSize({width:host.height,height:host.width});
    expect(await page.evaluate(()=>window.__plinth.getSettings().aspect)).toBe('9:16');
    await page.evaluate(()=>window.__plinth.reset());
    expect(await page.evaluate(()=>window.__plinth.getSettings())).toMatchObject({aspect:host.aspect,outputPad:0});
  }finally{await page.close();}
});
for(const host of [{name:'phone',width:400,height:800},{name:'tablet',width:1024,height:768}])it(`T-P9f ${host.name} complete Download action without scroll or canvas resize`,async()=>{
  const page=await browser.newPage({viewport:host,hasTouch:true});try{
    await ready(page);const before=await page.locator('#stage').boundingBox();
    await page.locator('#png-export').click();await page.locator('#png-download').waitFor({timeout:90000});
    const assertAction=async()=>{
      const box=(await page.locator('#png-download').boundingBox())!,feedback=(await page.locator('#png-feedback').boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);expect(box.y).toBeGreaterThanOrEqual(feedback.y);
      expect(box.y+box.height).toBeLessThanOrEqual(Math.min(feedback.y+feedback.height,host.height));
      for(const offset of [2,box.height-2]) expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('a')?.id,{x:box.x+box.width/2,y:box.y+offset})).toBe('png-download');
    };
    await assertAction();const pending=page.waitForEvent('download');await page.locator('#png-download').click();expect(await(await pending).failure()).toBeNull();
    await assertAction();expect(await page.locator('#stage').boundingBox()).toEqual(before);await capture(page,host.name+'-download');
    if(host.name==='phone'){await page.locator('#settings-open').click();await assertAction();await capture(page,'phone-settings-download');}
  }finally{await page.close();}
});
it('T-P10d every upload fills the screen while current-image Fit image and shared settings retain their meaning',async()=>{
  const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
  const page=await context.newPage();try{
    if(process.env['PLINTH_LIVE_SEED']==='upload')await disableUploadFill(page);
    await ready(page);
    // Picking demo devices must not count as an explicit Fit image preference.
    for(const id of ['tablet','laptop','card','browser','phone'])await page.locator('#control-device').selectOption(id);
    const png=new PNG({width:200,height:380});for(let i=0;i<png.data.length;i+=4){png.data[i]=20;png.data[i+1]=30;png.data[i+2]=40;png.data[i+3]=255;}
    const file={name:'test-upload.png',mimeType:'image/png',buffer:PNG.sync.write(png)};
    await page.locator('#image-file').setInputFiles(file);await waitForUpload(page,200,380);
    expect(await page.evaluate(()=>window.__plinth.getImage())).toMatchObject({fit:'cover',pad:0,width:200,height:380});
    expect(await page.locator('#control-fit').inputValue()).toBe('cover');
    await page.locator('#control-fit').selectOption('contain');
    expect(await page.evaluate(()=>window.__plinth.getImage()?.fit)).toBe('contain');
    const replacement=new PNG({width:320,height:180});replacement.data.fill(255);
    await page.locator('#image-file').setInputFiles({name:'replacement.png',mimeType:'image/png',buffer:PNG.sync.write(replacement)});
    await waitForUpload(page,320,180);
    expect(await page.evaluate(()=>window.__plinth.getImage())).toMatchObject({fit:'cover',pad:0,width:320,height:180});
    expect(await page.locator('#control-fit').inputValue()).toBe('cover');
    await page.locator('#control-fit').selectOption('contain');
    await page.locator('[data-composition="dark-laptop"]').click();
    expect(await page.evaluate(()=>window.__plinth.getImage()?.fit)).toBe('contain');
    await page.evaluate(()=>window.__plinth.advancePose(1));
    await page.waitForFunction(()=>{
      try {
        const saved=JSON.parse(atob(location.hash.slice(3).replace(/-/g,'+').replace(/_/g,'/')));
        return saved.fit==='contain'&&saved.device==='laptop';
      } catch {return false;}
    });
    const shared=page.url();
    // Force a real hash transition: P-14 retains this tab's existing upload.
    await page.locator('#control-fit').selectOption('cover');
    await page.waitForFunction(()=>{
      try{return JSON.parse(atob(location.hash.slice(3).replace(/-/g,'+').replace(/_/g,'/'))).fit==='cover';}
      catch{return false;}
    });
    expect(await page.goto(shared)).toBeNull();
    await page.waitForFunction(()=>window.__plinth.getSettings().fit==='contain');
    expect(await page.evaluate(()=>window.__plinth.getSettings().fit)).toBe('contain');
    expect(await page.locator('#control-fit').inputValue()).toBe('contain');
    expect(await page.evaluate(()=>window.__plinth.getImage())).toMatchObject({identity:'user',width:320,height:180,fit:'contain'});
    // A controlled pending decode reproduces the stale-image precondition without sleeps.
    await holdUploadDecode(page,file.name);
    await page.locator('#image-file').setInputFiles(file);
    await page.waitForFunction(()=>(window as unknown as UploadGateWindow).uploadDecodeGate.started);
    await page.waitForFunction(()=>window.__plinth.getImage()?.identity==='user');
    const pendingImage=await page.evaluate(()=>window.__plinth.getImage());
    expect(pendingImage).toMatchObject({identity:'user',width:320,height:180,fit:'contain',pad:0});
    console.log('T-P10f legacy wait resolved while the requested decode was held',pendingImage);
    if(process.env['PLINTH_LIVE_SEED']==='upload-wait'){
      // Negative probe of the old assertion boundary: must fail on the prior image.
      expect(pendingImage).toMatchObject({fit:'cover',pad:0,width:200,height:380});
    }
    await page.evaluate(()=>(window as unknown as UploadGateWindow).uploadDecodeGate.release());
    await waitForUpload(page,200,380);
    expect(await page.evaluate(()=>window.__plinth.getImage())).toMatchObject({fit:'cover',pad:0,width:200,height:380});
    expect(await page.locator('#control-fit').inputValue()).toBe('cover');
    await page.locator('#control-fit').selectOption('contain');
    expect(await page.evaluate(()=>window.__plinth.getImage()?.fit)).toBe('contain');

    // A fresh recipient is a different document and must start with the demo.
    const recipient=await context.newPage();
    if(process.env['PLINTH_LIVE_SEED']==='upload-shared')await disableUploadFill(recipient);
    expect((await recipient.goto(shared))?.ok()).toBe(true);
    await recipient.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
    expect(await recipient.evaluate(()=>window.__plinth.getImage())).toMatchObject({identity:'demo',fit:'contain'});
    expect(await recipient.evaluate(()=>window.__plinth.getSettings())).toMatchObject({fit:'contain',device:'laptop'});
    expect(await recipient.locator('#control-fit').inputValue()).toBe('contain');
    expect(await recipient.locator('#share-status').innerText()).toBe('Scene loaded. Add your screenshot. Images are not included in links.');
    await recipient.locator('#image-file').setInputFiles(file);await waitForUpload(recipient,200,380);
    expect(await recipient.evaluate(()=>window.__plinth.getImage())).toMatchObject({identity:'user',fit:'cover',pad:0,width:200,height:380});
    expect(await recipient.locator('#control-fit').inputValue()).toBe('cover');
    await recipient.locator('#control-fit').selectOption('contain');
    expect(await recipient.evaluate(()=>window.__plinth.getImage()?.fit)).toBe('contain');
  }finally{await context.close();}
});
it('T-P9f dark and warm thumbnails have their own scene color at every outer edge',async()=>{
  for(const [id,expected] of [['dark-laptop',[15,17,21]],['warm-card',[242,205,169]]] as const){
    const png=PNG.sync.read(await readFile(`public/compositions/${id}.png`));
    expect(png.width).toBe(480);expect(png.height).toBe(300);
    // Compare edges with the top-left background, independent of palette tweaks.
    const reference=[...png.data.subarray(0,3)];
    expect(reference.every((v,i)=>Math.abs(v-expected[i]!)<35)).toBe(true);
    for(const [x,y] of [[240,1],[240,298],[1,150],[478,150]]){
      const offset=(y!*png.width+x!)*4;
      expect([...png.data.subarray(offset,offset+3)]).toEqual(reference);
    }
  }
});
it('T-P9f laptop pointer drag approaches the orbit limit gently and reverses without a dead zone',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:800}});try{
    if(process.env['PLINTH_LIVE_SEED']==='orbit')await page.route('**/src/camera/controller.ts',async route=>{
      const response=await route.fetch(),source=await response.text(),body=source.replace('const orbit = target.getOrbit?.();','const orbit = undefined;');
      expect(body).not.toBe(source);await route.fulfill({response,body});
    });
    await ready(page);await page.locator('#control-device').selectOption('laptop');
    const azimuth=()=>page.evaluate(()=>{const d=window.__plinth.getSettings().custom.direction;return Math.atan2(d.x,d.z);});
    const start=await azimuth(),canvas=(await page.locator('#stage').boundingBox())!;
    const x=canvas.x+40,y=canvas.y+canvas.height/2,drag=(75*Math.PI/180-start+.2)*240;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+drag,y);
    const end=await azimuth();expect(end).toBeGreaterThan(start);expect(end).toBeLessThan(75*Math.PI/180-.001);
    await page.mouse.move(x+drag-24,y);expect(end-await azimuth()).toBeCloseTo(.1,6);await page.mouse.up();
    expect(await page.evaluate(()=>window.__plinth.getPose())).toBeNull();
  }finally{await page.close();}
});
