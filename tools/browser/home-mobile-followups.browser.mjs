import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('phone-only CTA sizing and translated RTL labels leave desktop sizing intact',async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','hi','ur']) for(const width of [320,1280]) {
      const page=await browser.newPage({viewport:{width,height:812},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});
      await page.addInitScript(()=>{
        localStorage.setItem('dehat.theme','light');
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      });
      await page.goto(local.origin+(lang==='en'?'/':`/${lang}/`));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const result=await page.evaluate(()=>{
        const process=document.querySelector('.home-process-cta');
        const programme=document.querySelector('.home-programme-cta');
        const picker=document.querySelector('.home-programme-picker button');
        return {processMin:getComputedStyle(process).minHeight,programmeMin:getComputedStyle(programme).minHeight,
          processHeight:process.getBoundingClientRect().height,programmeHeight:programme.getBoundingClientRect().height,
          processText:process.textContent.trim(),pickerAlign:getComputedStyle(picker).textAlign,
          programmeInlineMarginLeft:programme.style.marginLeft,
          programmeMarginStart:getComputedStyle(programme).marginInlineStart};
      });
      assert.equal(result.pickerAlign,'start');
      assert.equal(result.programmeInlineMarginLeft,'');
      assert.ok(parseFloat(result.programmeMarginStart)>=0);
      if(width<760) {
        assert.equal(result.processMin,'44px');
        assert.equal(result.programmeMin,'44px');
        assert.ok(result.processHeight>=44 && result.programmeHeight>=44);
      } else {
        assert.notEqual(result.processMin,'44px');
        assert.notEqual(result.programmeMin,'44px');
      }
      if(lang==='ur') assert.ok(result.processText.endsWith('←'),result.processText);
      const faces=page.locator('section[data-spine="Who Is Behind This"] .who-teaser-faces button');
      await faces.last().click();
      const meta=await page.locator('section[data-spine="Who Is Behind This"] .who-teaser-selected').innerText();
      if(lang==='hi'||lang==='ur') assert.doesNotMatch(meta,/\b(?:BAHRAICH|SHRAWASTI|Bahraich|Shrawasti)\b/);
      if(width===320) for(let i=0;i<8;i++){
        await faces.nth(i).click();
        const detail=await page.evaluate(()=>({bottom:document.querySelector('.who-teaser-selected').getBoundingClientRect().bottom,
          railTop:document.querySelector('.spine-rail').getBoundingClientRect().top}));
        assert.ok(detail.bottom<=detail.railTop,`${lang} portrait ${i} detail clears bottom rail: ${JSON.stringify(detail)}`);
      }
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
