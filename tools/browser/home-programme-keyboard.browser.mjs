import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('programme buttons expose selection and retain visible keyboard focus', async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','ur']) for(const [width,height] of [[320,640],[375,812]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      await page.addInitScript(()=>{
        localStorage.setItem('dehat.theme','light');
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      });
      await page.goto(local.origin+(lang==='en'?'/':'/ur/'));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const tabs=page.locator('section[data-spine="The Four Programmes"] .work-grid > div:first-child button');
      for(const i of [1,2,3,0]) {
        await tabs.nth(i).scrollIntoViewIfNeeded();
        await tabs.nth(i).focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(80);
        assert.deepEqual(await tabs.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-pressed'))),nodesFor(i));
        assert.equal(await tabs.nth(i).getAttribute('aria-controls'),'home-active-program');
        const focus=await page.evaluate(()=>{
          const tab=document.activeElement?.getBoundingClientRect();
          const header=document.querySelector('nav').getBoundingClientRect();
          const rail=document.querySelector('.spine-rail').getBoundingClientRect();
          return {top:tab?.top,bottom:tab?.bottom,headerBottom:header.bottom,railTop:rail.top};
        });
        assert.ok(focus.top>=focus.headerBottom-1 && focus.bottom<=focus.railTop-1,`${lang} ${width}x${height} panel ${i}: ${JSON.stringify(focus)}`);
        assert.equal(await page.evaluate(()=>document.activeElement?.id),'home-active-program');
      }
      await tabs.nth(2).click();
      await page.waitForTimeout(80);
      const pointerFocus=await page.evaluate(()=>{
        const tab=document.activeElement;
        const box=tab?.getBoundingClientRect();
        const subnav=document.querySelector('[data-subnav]')?.getBoundingClientRect();
        const rail=document.querySelector('.spine-rail').getBoundingClientRect();
        return {pressed:tab?.getAttribute('aria-pressed'),top:box?.top,bottom:box?.bottom,headerBottom:subnav?.bottom,railTop:rail.top};
      });
      assert.equal(await tabs.nth(2).getAttribute('aria-pressed'),'true');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'home-active-program');
      assert.ok(pointerFocus.top>=pointerFocus.headerBottom-1 && pointerFocus.bottom<=pointerFocus.railTop-1,
        `${lang} ${width}x${height} pointer focus: ${JSON.stringify(pointerFocus)}`);
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});

function nodesFor(index){return Array.from({length:4},(_,i)=>i===index?'true':'false');}
