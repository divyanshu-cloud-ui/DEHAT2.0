import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('header Invest label is vertically centred at four widths in three scripts and both themes',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['dark','light'])for(const width of [320,375,768,1280]){
      const context=await browser.newContext({viewport:{width,height:width<400?812:800},reducedMotion:'reduce'});
      await context.addInitScript(t=>{localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));localStorage.setItem('dehat.theme',t);},theme);
      const page=await context.newPage();
      for(const lang of ['hi','ta','ar']){
        await page.goto(local.origin+'/'+lang);
        await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
        const pill=page.locator('.site-nav .donate-link:visible').first();
        const box=await pill.evaluate(el=>{
          const outer=el.getBoundingClientRect(),label=el.querySelector('.sc-interp')?.getBoundingClientRect();
          return {height:outer.height,top:label.top-outer.top,bottom:outer.bottom-label.bottom};
        });
        assert.ok(Math.abs(box.top-box.bottom)<=1,`${theme} ${width} ${lang}: ${JSON.stringify(box)}`);
        if(width<1000)assert.ok(box.height>=44,`${theme} ${width} ${lang}: touch height ${box.height}`);
        if(width===375){
          await page.locator('.nav-burger button[aria-controls="mobile-menu"]').click();
          await page.locator('#mobile-menu').waitFor();
          const open=await pill.evaluate(el=>{const outer=el.getBoundingClientRect(),label=el.querySelector('.sc-interp').getBoundingClientRect();return Math.abs((label.top-outer.top)-(outer.bottom-label.bottom));});
          assert.ok(open<=1,`${theme} ${lang}: menu-open pill is off-centre by ${open}px`);
        }
        console.log(JSON.stringify({theme,width,lang,top:+box.top.toFixed(2),bottom:+box.bottom.toFixed(2)}));
      }
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
