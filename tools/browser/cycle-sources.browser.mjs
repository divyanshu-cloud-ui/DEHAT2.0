import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';
import {renderSite} from '../site-browser.mjs';

test('Cycle Sources switch reveals only three approved source names',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  let snapshot='';
  await renderSite(process.cwd(),[{path:'/'}],{concurrency:1,onPage:async(_route,html)=>{snapshot=html;}});
  assert.match(snapshot,/<button[^>]*class="cycle-sources-toggle"[^>]*role="switch"/);
  assert.ok(snapshot.includes('National Family Health Survey'));
  assert.ok(snapshot.includes('Unified District Information System for Education Plus'));
  assert.ok(snapshot.includes('Sample Registration System'));
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['light','dark'])for(const width of [320,375,768,1280]){
      const page=await browser.newPage({viewport:{width,height:width<600?812:800},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const block=page.locator('#launch-live .cycle-sources');
      const control=block.getByRole('switch');
      const list=block.locator('.cycle-sources-list');
      await control.scrollIntoViewIfNeeded();
      assert.equal(await control.getAttribute('aria-checked'),'false');
      assert.equal(await control.innerText(),'Sources');
      assert.equal(await list.isVisible(),false);
      assert.ok((await control.boundingBox()).height>=44);
      assert.equal(await block.evaluate(node=>getComputedStyle(node).borderTopWidth),'0px');
      assert.equal(await block.evaluate(node=>getComputedStyle(node).borderBottomWidth),'0px');
      if(width===375||width===1280)await page.screenshot({path:`/private/tmp/dehat-186-E1-closed-${theme}-${width}.png`});
      await control.click();
      assert.equal(await control.getAttribute('aria-checked'),'true');
      assert.equal(await list.isVisible(),true);
      assert.deepEqual(await list.locator('li').allInnerTexts(),[
        'National Family Health Survey 5 (district fact sheets and state module)',
        'Unified District Information System for Education Plus (district fact sheets)',
        'Sample Registration System',
      ]);
      await page.waitForTimeout(220);
      if(width===375||width===1280)await page.screenshot({path:`/private/tmp/dehat-186-E1-open-${theme}-${width}.png`});
      await control.focus();await page.keyboard.press('Space');
      assert.equal(await control.getAttribute('aria-checked'),'false');
      assert.equal(await list.isVisible(),false);
      await page.keyboard.press('Enter');
      assert.equal(await control.getAttribute('aria-checked'),'true');
      assert.equal(await list.isVisible(),true);
      console.log(JSON.stringify({theme,width,controlPx:(await control.boundingBox()).height,keyboard:['Space','Enter'],sourceCount:await list.locator('li').count(),contentInSnapshot:true}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
