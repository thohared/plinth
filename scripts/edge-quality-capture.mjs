// T-P9h: same-resolution original/candidate images, never PG baseline writes.
// PLINTH_CHROMIUM_PATH may point to local tooling; the CI pin remains unchanged.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const out=resolve(process.env.PLINTH_EDGE_OUT ?? 'edge-quality-out');
await mkdir(out,{recursive:true});
const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:4217,strictPort:false,hmr:false}});
await server.listen();
const browser=await chromium.launch({
  ...(process.env.PLINTH_CHROMIUM_PATH?{executablePath:process.env.PLINTH_CHROMIUM_PATH}:{}),
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],
});
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  dirty:execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim(),
  node:process.version,browser:browser.version(),platform:process.platform,
  note:'Local software-renderer evidence. Not CI PG candidates, a target-device benchmark or owner acceptance.',cases:[]};
try {
  for(const variant of ['original-eight','candidate']) for(const device of ['browser','phone']) {
    const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errors=[];let replacements=0;
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    if(variant==='original-eight') await page.route('**/src/scene/pipeline.ts',async route=>{
      const response=await route.fetch(),body=await response.text(),installation='installSmaaEdgeSearch(smaa);';
      assert.equal(body.split(installation).length,2,'one production installation');replacements++;
      await route.fulfill({response,body:body.replace(installation,'')});
    });
    try {
      await page.goto(`${server.resolvedUrls.local[0]}?pg=1&device=${device}&scene=soft-studio&pose=hero`);
      await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
      const file=`${device}-${variant}.png`;
      const png=await page.locator('#stage').screenshot({path:resolve(out,file)});
      const measurements=await page.evaluate(()=>{
        const canvas=document.querySelector('#stage'),gl=canvas.getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
        // Readback is the synchronization point; timing command submission
        // alone would not measure the additional fragment-shader work.
        const pixel=new Uint8Array(4);
        const draw=()=>{window.__plinth.setDevice(window.__plinth.getDevice());gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);};
        for(let i=0;i<5;i++)draw();
        const batches=[];
        for(let b=0;b<3;b++){
          const times=[];
          for(let i=0;i<10;i++){const start=performance.now();draw();times.push(performance.now()-start);}
          times.sort((a,b)=>a-b);batches.push({p50:times[5],p99:times[9],samples:times});
        }
        return {width:canvas.width,height:canvas.height,dpr:window.devicePixelRatio,
          renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
          batches,glError:gl.getError()};
      });
      assert.deepEqual([measurements.width,measurements.height,measurements.dpr],[1280,800,1]);
      assert.equal(measurements.glError,0);assert.deepEqual(errors,[]);
      assert.equal(replacements,variant==='original-eight'?1:0);
      const entry={file,device,variant,sha256:createHash('sha256').update(png).digest('hex'),replacements,...measurements,errors};
      report.cases.push(entry);console.log(file,JSON.stringify(measurements.batches.map(b=>({p50:b.p50,p99:b.p99}))));
    } finally {await page.close();}
  }
} finally {
  await writeFile(resolve(out,'receipt.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await server.close();
}
