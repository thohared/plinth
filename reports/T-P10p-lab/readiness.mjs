// Actual first-ready timing complements Lighthouse's simulated metrics.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
const servers=[], rows=[];
try {
 for (const [i,root] of [resolve(process.argv[2]),resolve('.')].entries()) servers.push(await preview({configFile:false,root,logLevel:'silent',build:{outDir:resolve(root,'dist')},preview:{host:'127.0.0.1',port:4245+i,strictPort:true}}));
 for(let trial=1;trial<=3;trial++)for(const [i,kind] of ['base','candidate'].entries()) {
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  try {
   const page=await browser.newPage({viewport:{width:412,height:823},deviceScaleFactor:1.75,isMobile:true,hasTouch:true});
   await page.addInitScript(()=>{
    window.timings={tasks:[],ready:null};
    new PerformanceObserver(list=>window.timings.tasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
    new MutationObserver((_,observer)=>{if(document.documentElement?.dataset.plinthReady==='1'){window.timings.ready=performance.now();observer.disconnect();}}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-plinth-ready']});
   });
   const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await page.goto(servers[i].resolvedUrls.local[0]);
   await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:120000});
   const timings=await page.evaluate(()=>window.timings);const row={kind,trial,...timings};rows.push(row);console.log(JSON.stringify(row));
  } finally {await browser.close();}
 }
 await writeFile(resolve('reports/T-P10p-lab/readiness.json'),JSON.stringify(rows,null,2)+'\n');
} finally {await Promise.all(servers.map(s=>new Promise(done=>s.httpServer.close(done))));}
