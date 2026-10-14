import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('safeguarding draft links contain focused text before a no-blur click or touch', async () => {
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath)throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const touch of [false,true]){
      const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:touch,isMobile:touch});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(local.origin+'/finance#raise');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready',null,{timeout:60000});
      const detail=page.locator('#raise-detail');
      const unique=`Safeguarding detail ${touch?'touch':'click'} 186`;
      await detail.fill(unique);
      await page.waitForTimeout(300);
      const before=await page.evaluate(()=>{
        const section=document.querySelector('#raise-detail').closest('section');
        const mail=section.querySelector('a.ml-press[href^="mailto:"]');
        return [...mail.parentElement.querySelectorAll('a[href]')].map(a=>a.href);
      });
      console.log(JSON.stringify({touch,active:await page.evaluate(()=>document.activeElement?.id),linkCount:before.length,contains:before.map(href=>decodeURIComponent(href).includes(unique))}));
      assert.equal(before.length,3);
      assert.ok(before.every(href=>decodeURIComponent(href).includes(unique)));
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'raise-detail');
      const mail=page.locator('#raise-detail').locator('xpath=ancestor::section[1]').locator('a.ml-press[href^="mailto:"]').first();
      await page.evaluate(()=>{window.__draftClicked='';document.addEventListener('click',e=>{const a=e.target.closest('a[href^="mailto:"]');if(a){e.preventDefault();window.__draftClicked=a.href;}},{capture:true,once:true});});
      if(touch){
        await mail.tap();
      }else{
        await mail.evaluate(element=>element.click());
      }
      const clicked=await page.evaluate(()=>window.__draftClicked);
      assert.ok(decodeURIComponent(clicked).includes(unique),`stale ${touch?'touch':'programmatic'} draft`);
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({mode:touch?'touch':'programmatic-click',focusedTextInThreeLinks:true,clickedHrefContainsText:true,errors:errors.length}));
      await context.close();
    }
  }finally{
    await browser.close();
    await new Promise(resolve=>local.server.close(resolve));
  }
});
