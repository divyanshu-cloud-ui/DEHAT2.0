import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('interactive home sections have no axe violations after selection',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE||!process.env.AXE_SOURCE) throw new Error('Set PLAYWRIGHT_MODULE and AXE_SOURCE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','hi','ur']) for(const theme of ['light','dark']) for(const [width,height] of [[320,640],[375,812]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      await page.addInitScript(theme=>{
        localStorage.setItem('dehat.theme',theme);
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      },theme);
      await page.goto(local.origin+(lang==='en'?'/':`/${lang}/`));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      await page.addScriptTag({path:process.env.AXE_SOURCE});
      const states=[
        ['The Method','.loop-phone-button',2],
        ['The Four Programmes','.work-grid > div:first-child button',2],
        ['Who Is Behind This','.who-teaser-faces button',7],
      ];
      for(const [spine,selector,index] of states){
        const section=page.locator(`section[data-spine="${spine}"]`);
        await section.locator(selector).nth(index).click();
        const violations=await section.evaluate(async el=>(await axe.run(el)).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))})));
        assert.deepEqual(violations,[],`${lang} ${theme} ${width}x${height} ${spine}: ${JSON.stringify(violations)}`);
      }
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
