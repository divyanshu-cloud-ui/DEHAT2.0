import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('Invest answer menu lands on and highlights accountability, not partners',async()=>{
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const from of ['/get-involved/case','/get-involved/people']) for(const width of [375,1280]){
      const page=await browser.newPage({viewport:{width,height:812},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});
      await page.addInitScript(()=>{localStorage.setItem('dehat.theme','light');localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}))});
      await page.goto(local.origin+from);
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const answer=page.locator('[data-subnav] .subnav-link').filter({hasText:'Who We Answer To'});
      assert.equal(await answer.count(),1);
      await answer.click();
      await page.waitForFunction(()=>location.pathname==='/finance'&&document.querySelector('section[data-spine="Who We Answer To"]'));
      await page.waitForTimeout(4300);
      await page.waitForFunction(()=>{
        const section=document.querySelector('section[data-spine="Who We Answer To"]');
        const nav=document.querySelector('[data-subnav]');
        const current=[...nav.querySelectorAll('.subnav-link[aria-current="true"]')].map(el=>el.textContent.trim());
        return current.length===1&&current[0]==='Who We Answer To'&&Math.abs(section.getBoundingClientRect().top-nav.getBoundingClientRect().bottom-12)<10;
      },null,{timeout:7000}).catch(async error=>{
        console.log('ANSWER MENU DIAGNOSTIC',from,width,await page.evaluate(()=>({scrollY,current:[...document.querySelectorAll('[data-subnav] .subnav-link[aria-current="true"]')].map(e=>e.textContent),top:document.querySelector('section[data-spine="Who We Answer To"]')?.getBoundingClientRect().top,header:document.querySelector('[data-subnav]')?.getBoundingClientRect().bottom})));
        throw error;
      });
      const result=await page.evaluate(()=>({current:[...document.querySelectorAll('[data-subnav] .subnav-link[aria-current="true"]')].map(el=>el.textContent.trim()),sectionTop:document.querySelector('section[data-spine="Who We Answer To"]').getBoundingClientRect().top,headingTop:document.querySelector('section[data-spine="Who We Answer To"] h2')?.getBoundingClientRect().top,headerBottom:document.querySelector('[data-subnav]').getBoundingClientRect().bottom}));
      assert.deepEqual(result.current,['Who We Answer To']);
      assert.ok(result.sectionTop>result.headerBottom,`${from} ${width}: ${JSON.stringify(result)}`);
      console.log(JSON.stringify({from,width,...result}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
