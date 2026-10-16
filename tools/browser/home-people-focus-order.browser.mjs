import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('people portraits precede actions in phone reading and focus order',async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','ur']) for(const width of [320,375,1280]) {
      const page=await browser.newPage({viewport:{width,height:812},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});
      await page.addInitScript(()=>{
        localStorage.setItem('dehat.theme','light');
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      });
      await page.goto(local.origin+(lang==='en'?'/':'/ur/'));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const section=page.locator('section[data-spine="Who Is Behind This"]');
      const faces=section.locator('.who-teaser-faces button');
      assert.equal(await faces.count(),8);
      const details=await section.evaluate(el=>{
        const grid=el.querySelector('.who-teaser-faces');
        const actions=el.querySelector('.who-teaser-actions');
        const intro=el.querySelector('.who-teaser-intro');
        const selected=el.querySelector('.who-teaser-selected');
        const rect=x=>x.getBoundingClientRect();
        return {sourceOrder:!!(grid.compareDocumentPosition(actions)&Node.DOCUMENT_POSITION_FOLLOWING),
          grid:rect(grid).toJSON(),actions:rect(actions).toJSON(),intro:rect(intro).toJSON(),selected:rect(selected).toJSON(),
          overflow:el.scrollWidth>el.clientWidth};
      });
      assert.equal(details.sourceOrder,true);
      assert.equal(details.overflow,false);
      if(width<760) {
        assert.ok(details.grid.top>=details.intro.bottom-1,`${lang} ${width}: grid follows intro`);
        assert.ok(details.selected.top>=details.grid.bottom-1,`${lang} ${width}: selection follows portraits`);
        assert.ok(details.actions.top>=details.selected.bottom-1,`${lang} ${width}: actions follow selection`);
        await faces.last().focus();
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(()=>document.activeElement?.closest('.who-teaser-actions')!==null),true);
      } else {
        assert.ok(Math.abs(details.grid.left-details.intro.left)>50,'desktop portraits remain in a separate column');
      }
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
