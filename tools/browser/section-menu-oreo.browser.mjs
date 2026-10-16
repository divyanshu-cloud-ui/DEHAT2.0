import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('Who menu lands on Oreo and tracks it, including with reduced motion',async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const reduced of [true,false]){
      const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:reduced?'reduce':'no-preference'});
      await page.addInitScript(()=>{localStorage.setItem('dehat.theme','light');localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}))});
      await page.goto(local.origin+'/who');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      await page.locator('[data-subnav] .subnav-link').filter({hasText:'Oreo'}).click();
      await page.waitForTimeout(4300);
      await page.waitForFunction(()=>{
        const sub=document.querySelector('[data-subnav]');
        const section=document.querySelector('section[data-spine="Oreo"]');
        const current=[...sub.querySelectorAll('.subnav-link[aria-current="true"]')].map(e=>e.textContent.trim());
        return current.length===1&&current[0]==='Oreo'&&Math.abs(section.getBoundingClientRect().top-sub.getBoundingClientRect().bottom-12)<8;
      },null,{timeout:7000}).catch(async error=>{
        console.log('OREO MENU DIAGNOSTIC',reduced,await page.evaluate(()=>({scrollY,current:[...document.querySelectorAll('[data-subnav] .subnav-link[aria-current="true"]')].map(e=>e.textContent),top:document.querySelector('section[data-spine="Oreo"]')?.getBoundingClientRect().top,header:document.querySelector('[data-subnav]')?.getBoundingClientRect().bottom})));
        throw error;
      });
      const result=await page.evaluate(()=>{
        const section=document.querySelector('section[data-spine="Oreo"]');
        const heading=section.querySelector('h2').getBoundingClientRect();
        const next=document.querySelector('section[data-spine="Who Decides"]').getBoundingClientRect();
        const sub=document.querySelector('[data-subnav]').getBoundingClientRect();
        return {headingTop:heading.top,headingBottom:heading.bottom,nextTop:next.top,headerBottom:sub.bottom};
      });
      assert.ok(result.headingTop>=result.headerBottom&&result.headingTop<800,JSON.stringify(result));
      assert.ok(result.nextTop>result.headerBottom+150,JSON.stringify(result));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
