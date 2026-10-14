import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('primary gold calls to action use one bright fill and dark ink in both themes',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['dark','light']){
      const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));localStorage.setItem('dehat.theme',value);},theme);
      for(const route of ['/','/work','/get-involved/case','/get-involved/give','/finance','/get-involved/people']){
        await page.goto(local.origin+route);
        await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
        const controls=await page.evaluate(()=>[...document.querySelectorAll('#launch-live button[style*="var(--ac-gold-fill)"],#launch-live a[style*="var(--ac-gold-fill)"],#launch-live .why-go,#launch-live .hr-cta')]
          .filter(el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getBoundingClientRect().width>0;})
          .map(el=>({text:el.textContent.trim().replace(/\s+/g,' ').slice(0,65),fill:getComputedStyle(el).backgroundColor,ink:getComputedStyle(el).color})));
        assert.ok(controls.length>0,`${theme} ${route} has no gold controls`);
        for(const control of controls){
          assert.equal(control.fill,'rgb(234, 174, 40)',`${theme} ${route} ${control.text} fill`);
          assert.equal(control.ink,'rgb(31, 23, 16)',`${theme} ${route} ${control.text} ink`);
        }
        console.log(JSON.stringify({theme,route,controls}));
      }
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
