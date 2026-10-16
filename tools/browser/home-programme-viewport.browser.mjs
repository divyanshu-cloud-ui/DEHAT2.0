import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('every phone programme card and its action clear the header and bottom rail', async () => {
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','ur']) for(const [width,height] of [[320,640],[320,812],[375,812]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      await page.addInitScript(()=>{
        localStorage.setItem('dehat.theme','light');
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      });
      await page.goto(local.origin+(lang==='en'?'/':'/ur/'));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const tabs=page.locator('section[data-spine="The Four Programmes"] .work-grid > div:first-child button');
      assert.equal(await tabs.count(),4);
      for(let i=0;i<4;i++){
        await tabs.nth(i).click();
        await page.waitForTimeout(60);
        const box=await page.evaluate(()=>{
          const card=document.querySelector('.home-active-program').getBoundingClientRect();
          const action=document.querySelector('.home-active-program button').getBoundingClientRect();
          const header=document.querySelector('nav').getBoundingClientRect();
          const rail=document.querySelector('.spine-rail').getBoundingClientRect();
          return {cardTop:card.top,cardBottom:card.bottom,actionBottom:action.bottom,headerBottom:header.bottom,railTop:rail.top};
        });
        assert.ok(box.cardTop>=box.headerBottom+5,`${lang} ${width}x${height} programme ${i}: panel top ${JSON.stringify(box)}`);
        assert.ok(box.cardBottom<=box.railTop-4,`${lang} ${width}x${height} programme ${i}: panel bottom ${JSON.stringify(box)}`);
        assert.ok(box.actionBottom<=box.railTop-4,`${lang} ${width}x${height} programme ${i}: action bottom ${JSON.stringify(box)}`);
      }
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
