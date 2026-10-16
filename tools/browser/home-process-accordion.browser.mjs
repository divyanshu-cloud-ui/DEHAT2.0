import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('phone process rows stay reachable when switching or collapsing steps',async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','ur']) for(const theme of ['light','dark']) for(const [width,height] of [[320,640],[375,812]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      await page.addInitScript(theme=>{
        localStorage.setItem('dehat.theme',theme);
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      },theme);
      await page.goto(local.origin+(lang==='en'?'/':'/ur/'));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const rows=page.locator('section[data-spine="The Method"] .loop-phone-row');
      assert.equal(await rows.count(),4);
      for(const i of [1,2,3,0]) {
        const button=rows.nth(i).locator('button');
        await button.scrollIntoViewIfNeeded();
        const before=await button.evaluate(el=>el.getBoundingClientRect().top);
        await button.click();
        await page.waitForTimeout(80);
        assert.equal(await button.getAttribute('aria-expanded'),'true');
        assert.equal(await rows.locator('button[aria-expanded="true"]').count(),1);
        const after=await page.evaluate(i=>{
          const button=document.querySelectorAll('section[data-spine="The Method"] .loop-phone-button')[i].getBoundingClientRect();
          const header=document.querySelector('nav').getBoundingClientRect();
          const rail=document.querySelector('.spine-rail').getBoundingClientRect();
          return {top:button.top,bottom:button.bottom,headerBottom:header.bottom,railTop:rail.top};
        },i);
        assert.ok(after.top>=after.headerBottom+4 && after.bottom<=after.railTop-4,`${lang} ${theme} ${width}x${height} step ${i}: ${JSON.stringify(after)}`);
        assert.ok(Math.abs(after.top-before)<110,`${lang} ${theme} ${width}x${height} step ${i} jumped ${Math.round(after.top-before)}px`);
      }
      const last=rows.first().locator('button');
      await last.click();
      assert.equal(await last.getAttribute('aria-expanded'),'false');
      assert.equal(await rows.locator('button[aria-expanded="true"]').count(),0);
      await last.focus();
      await page.keyboard.press('Enter');
      assert.equal(await last.getAttribute('aria-expanded'),'true');
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
