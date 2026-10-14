import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';
import {renderSite} from '../site-browser.mjs';

test('Cycle sources are a native disclosure with indexed content',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  let snapshot='';
  await renderSite(process.cwd(),[{path:'/'}],{concurrency:1,onPage:async(_route,html)=>{snapshot=html;}});
  assert.match(snapshot,/<details[^>]*class="cycle-sources"/);
  assert.ok(snapshot.includes('National Family Health Survey'));
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['light','dark'])for(const width of [320,375,768,1280]){
      const page=await browser.newPage({viewport:{width,height:width<600?812:800},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const disclosure=page.locator('#launch-live .cycle-sources');
      const summary=disclosure.locator('summary');
      await summary.scrollIntoViewIfNeeded();
      assert.equal(await disclosure.getAttribute('open'),null);
      assert.ok((await summary.boundingBox()).height>=44);
      if(width===375||width===1280)await page.screenshot({path:`/private/tmp/dehat-186-E1-closed-${theme}-${width}.png`});
      await summary.click();
      assert.notEqual(await disclosure.getAttribute('open'),null);
      assert.equal(await disclosure.locator('p').isVisible(),true);
      if(width===375||width===1280)await page.screenshot({path:`/private/tmp/dehat-186-E1-open-${theme}-${width}.png`});
      await summary.focus();await page.keyboard.press('Enter');
      assert.equal(await disclosure.getAttribute('open'),null);
      console.log(JSON.stringify({theme,width,summaryPx:(await summary.boundingBox()).height,nativeKeyboard:true,contentInSnapshot:true}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
