// T-P9f: four full-frame 480×300 canvas renders, demo only.
// UI aspect is 8:5; avoid baking output-format letterboxing into the assets.
import {mkdirSync} from 'node:fs';
import {createServer} from 'vite';
import {chromium} from 'playwright';
const server=await createServer({logLevel:'silent',server:{port:4179,strictPort:false}}); await server.listen();
const browser=await chromium.launch({...(process.env.PLINTH_CHROMIUM_PATH?{executablePath:process.env.PLINTH_CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
mkdirSync('public/compositions',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:480,height:300},deviceScaleFactor:1});
 await page.goto(`${server.resolvedUrls.local[0]}?pg=1`);
 await page.waitForSelector('html[data-plinth-ready="1"]',{timeout:60000});
 const rows=await page.evaluate(async()=>{const {COMPOSITIONS}=await import('/src/ui/compositions.ts');return COMPOSITIONS;});
 await page.addStyleTag({content:'#pick,#note{display:none}'});
 for(const row of rows){
   await page.evaluate(row=>{window.__plinth.compose(row.id);window.__plinth.setCaptureSize(480,300);},row);
   await page.locator('#stage').screenshot({path:`public/compositions/${row.id}.png`});
 }
 await page.evaluate(()=>window.__plinth.dispose());
} finally {await browser.close();await server.close();}
