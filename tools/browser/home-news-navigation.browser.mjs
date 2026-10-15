import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('home news data loads after in-app navigation',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const start of ['/','/stories','/finance','/hi']){
      const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
      await page.addInitScript(()=>localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
      await page.goto(local.origin+start);
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      if(start!=='/'){
        await page.evaluate(()=>{window.__homeNavMarker=1;});
        await page.locator('.footer-nav-link[data-prefetch="home"]').click();
        await page.waitForFunction(()=>window.DEHAT_LAUNCH?.route?.view==='home');
        if(start!=='/hi')assert.equal(await page.evaluate(()=>window.__homeNavMarker),1,`${start} reloaded`);
      }
      const section=page.locator('#launch-live section[data-spine="In the News"]');
      await section.waitFor();
      const cards=section.locator('a[target="_blank"]');
      assert.equal(await cards.count(),8,`${start} home news cards`);
      assert.equal(await page.evaluate(()=>Array.isArray(window.DEHAT_MEDIA)),true,`${start} media data missing`);
      const text=await section.innerText();
      assert.match(text,/100/,`${start} archive count missing`);
      assert.doesNotMatch(text,/Media Archive/,`${start} fallback label appeared`);
      if(start!=='/hi')assert.match(text,/All 100 Items/);
      if(start==='/stories')await page.screenshot({path:'/private/tmp/dehat-186-0-news-from-stories.png',fullPage:true});
      console.log(JSON.stringify({start,cards:await cards.count(),allItems:text.match(/[^\n]*100[^\n]*/)?.[0].trim(),mediaLoaded:true}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
