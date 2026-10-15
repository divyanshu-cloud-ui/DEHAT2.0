import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('hero rest holds all four full programme lines at phone and desktop widths',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const spec=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(spec.startsWith('file:')?spec:pathToFileURL(spec).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['light','dark'])for(const width of [375,1280])for(const motion of ['no-preference','reduce']){
      const page=await browser.newPage({viewport:{width,height:width===375?812:800},reducedMotion:motion});
      await page.addInitScript(value=>{localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));localStorage.setItem('dehat.theme',value);},theme);
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      if(motion==='no-preference')await page.keyboard.press('End');
      const hero=page.locator('#launch-live .hr-in');
      assert.equal(await hero.getAttribute('data-hero-state'),'rest');
      const lines=hero.locator('.hr-rest-programmes li');
      assert.equal(await lines.count(),4);
      for(const [i,name] of ['Rights & Entitlements','School of Leadership','Human Protection','Climate Justice'].entries()){
        assert.equal(await lines.nth(i).locator('.hr-rest-name').innerText(),name);
        assert.ok((await lines.nth(i).locator('.hr-rest-tag').innerText()).length>0);
        assert.equal(await lines.nth(i).isVisible(),true);
      }
      if(motion==='no-preference')await page.screenshot({path:`/private/tmp/dehat-186-0h-rest-${theme}-${width}.png`});
      console.log(JSON.stringify({theme,width,motion,lines:await lines.allInnerTexts()}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
