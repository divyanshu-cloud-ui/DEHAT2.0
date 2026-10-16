import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('phone process keeps the illustrated feature and four linked steps usable',async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','ur']) for(const theme of ['light','dark']) for(const [width,height] of [[320,640],[375,812],[430,932]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      await page.addInitScript(theme=>{
        localStorage.setItem('dehat.theme',theme);
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      },theme);
      await page.goto(local.origin+(lang==='en'?'/':'/ur/'));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const process=page.locator('section[data-spine="The Method"]');
      const steps=process.locator('.loop-station button');
      const feature=process.locator('#home-process-feature');
      assert.equal(await steps.count(),4);
      assert.equal(await process.locator('.loop-arrow').count(),4);
      assert.equal(await process.locator('.loop-phone').count(),0);
      assert.ok(await feature.isVisible());
      const structure=await process.evaluate(el=>{
        const center=el.querySelector('.loop-centre').getBoundingClientRect();
        const first=el.querySelector('.loop-station').getBoundingClientRect();
        return {featureFirst:center.bottom<=first.top,arrows:[...el.querySelectorAll('.loop-arrow')].every(a=>getComputedStyle(a).display!=='none'),overflow:el.scrollWidth>el.clientWidth};
      });
      assert.equal(structure.featureFirst,true);
      assert.equal(structure.arrows,true);
      assert.equal(structure.overflow,false);
      for(const i of [1,2,3,0]) {
        const step=steps.nth(i);
        await step.click();
        await page.waitForTimeout(50);
        assert.deepEqual(await steps.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-pressed'))),Array.from({length:4},(_,j)=>j===i?'true':'false'));
        assert.equal(await step.getAttribute('aria-controls'),'home-process-feature');
        const box=await page.evaluate(()=>{
          const feature=document.querySelector('#home-process-feature').getBoundingClientRect();
          const header=(document.querySelector('[data-subnav]')||document.querySelector('nav')).getBoundingClientRect();
          const rail=document.querySelector('.spine-rail').getBoundingClientRect();
          return {top:feature.top,bottom:feature.bottom,headerBottom:header.bottom,railTop:rail.top,focus:document.activeElement?.id};
        });
        assert.ok(box.top>=box.headerBottom-1&&box.top<=box.headerBottom+24,`${lang} ${theme} ${width} step ${i}: ${JSON.stringify(box)}`);
        assert.ok(box.bottom<=box.railTop-4,`${lang} ${theme} ${width} step ${i}: ${JSON.stringify(box)}`);
        assert.equal(box.focus,'home-process-feature');
      }
      await steps.nth(2).focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(50);
      assert.equal(await steps.nth(2).getAttribute('aria-pressed'),'true');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'home-process-feature',
        await page.evaluate(()=>({active:document.activeElement?.outerHTML,feature:document.querySelector('#home-process-feature')?.outerHTML.slice(0,180)})));
      assert.equal(await steps.first().evaluate(el=>getComputedStyle(el).textAlign),'start');
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
