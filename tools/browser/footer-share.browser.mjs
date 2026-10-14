import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('footer social icons and share action use one accessible row',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['light','dark']){
      const page=await browser.newPage({viewport:{width:375,height:812},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}},configurable:true});});
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const row=page.locator('#launch-live .footer-social-row');
      await row.scrollIntoViewIfNeeded();
      const links=row.locator('a');
      assert.equal(await links.count(),5);
      for(const link of await links.all()){
        const label=await link.getAttribute('aria-label');
        assert.match(label,/^DEHAT on /);
        assert.equal(await link.getAttribute('title'),label);
        assert.equal(await link.locator('span.sr-only').textContent(),label);
        assert.equal(await link.locator('svg').getAttribute('aria-hidden'),'true');
        assert.ok(await link.locator('path').getAttribute('d'));
      }
      const share=row.locator('button.footer-share');
      assert.equal(await share.count(),1);
      const rect=await share.boundingBox();
      assert.ok(rect.width>=44&&rect.height>=44);
      assert.ok(await share.getAttribute('aria-label'));
      await page.screenshot({path:`/private/tmp/dehat-186-E3-after-${theme}-375.png`});
      await share.click();
      await row.locator('[role="status"]').waitFor({state:'visible'});
      assert.ok((await row.locator('[role="status"]').textContent()).trim().length>0);
      console.log(JSON.stringify({theme,socialIcons:5,sharePx:rect.width,copiedStatus:true}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
