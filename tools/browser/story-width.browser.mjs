import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('story art selects a width candidate for 1x and 2x desktop',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const dpr of [1,2]){
      const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr,reducedMotion:'reduce'});
      await context.addInitScript(()=>localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
      const page=await context.newPage();
      const artRequests=[];
      page.on('request',request=>{if(request.url().includes('story-002'))artRequests.push(request.url());});
      await page.goto(local.origin+'/stories/the-right-to-play');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const art=page.locator('#launch-live .story-art-plate img');
      await art.scrollIntoViewIfNeeded();
      const result=await art.evaluate(async image=>{await image.decode();return {src:image.currentSrc,width:image.getBoundingClientRect().width,sourceSet:image.parentElement.querySelector('source')?.getAttribute('srcset')};});
      assert.match(result.src,new RegExp(`story-002-${dpr===1?800:1100}\\.avif$`));
      assert.ok(result.width>=500&&result.width<=550);
      assert.match(result.sourceSet,/480w.*800w.*1100w/);
      assert.ok(artRequests.some(url=>url===result.src));
      await page.screenshot({path:`/private/tmp/dehat-186-R4-after-1440-${dpr}x.png`});
      console.log(JSON.stringify({dpr,displayWidth:result.width,currentSrc:result.src.split('/').at(-1),requests:artRequests.map(url=>url.split('/').at(-1))}));
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
