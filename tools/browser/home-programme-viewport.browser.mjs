import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('original phone programme panel is readable and its action is reachable above the rail', async () => {
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  if(!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const lang of ['en','ur']) for(const [width,height] of [[320,640],[320,812],[375,812]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      page.setDefaultTimeout(12000);
      await page.addInitScript(()=>{
        localStorage.setItem('dehat.theme','light');
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      });
      await page.goto(local.origin+(lang==='en'?'/':'/ur/'));
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const tabs=page.locator('section[data-spine="The Four Programmes"] .work-grid > div:first-child button');
      assert.equal(await tabs.count(),4);
      const cards=await tabs.evaluateAll(nodes=>nodes.map(n=>({top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom,art:getComputedStyle(n.querySelector('.art')).display,tag:getComputedStyle(n.querySelector('.home-programme-tag')).display})));
      assert.ok(cards.every((card,i)=>card.art!=='none'&&card.tag!=='none'&&card.bottom-card.top>=88&&(i===0||card.top>=cards[i-1].bottom)),`${lang} ${width}: full illustrated cards ${JSON.stringify(cards)}`);
      for(let i=0;i<4;i++){
        await tabs.nth(i).click();
        await page.waitForTimeout(60);
        const box=await page.evaluate(()=>{
          const card=document.querySelector('.home-active-program').getBoundingClientRect();
          const action=document.querySelector('.home-active-program button').getBoundingClientRect();
          const header=document.querySelector('nav').getBoundingClientRect();
          const rail=document.querySelector('.spine-rail').getBoundingClientRect();
          const picker=document.querySelector('.home-programme-picker').getBoundingClientRect();
          const body=document.querySelector('.home-active-program-body');
          const detail=document.querySelector('.home-active-program-detail');
          const art=document.querySelector('.home-active-program-head .art');
          const stats=[...document.querySelectorAll('.home-active-program-stats>div')].map(node=>node.getBoundingClientRect().top);
          return {cardTop:card.top,cardBottom:card.bottom,actionBottom:action.bottom,headerBottom:header.bottom,railTop:rail.top,pickerGap:card.top-picker.bottom,bodyPadding:getComputedStyle(body).paddingTop,detailSize:getComputedStyle(detail).fontSize,detailLine:getComputedStyle(detail).lineHeight,artWidth:art.getBoundingClientRect().width,stats,focus:document.activeElement?.id};
        });
        assert.ok(box.cardTop>=box.headerBottom+5,`${lang} ${width}x${height} programme ${i}: panel top ${JSON.stringify(box)}`);
        assert.ok(box.pickerGap>=17,`${lang} ${width}x${height} programme ${i}: original card-to-panel gap ${JSON.stringify(box)}`);
        assert.equal(box.bodyPadding,'20px');
        assert.equal(box.detailSize,'15.5px');
        assert.ok(parseFloat(box.detailLine)>=24.7,`${lang} ${width}x${height} programme ${i}: original body line height ${JSON.stringify(box)}`);
        assert.ok(box.artWidth>=76,`${lang} ${width}x${height} programme ${i}: original illustration ${JSON.stringify(box)}`);
        assert.ok(box.stats[1]>box.stats[0]+20,`${lang} ${width}x${height} programme ${i}: figures stack ${JSON.stringify(box)}`);
        if(height>=812){
          assert.ok(box.cardBottom<=box.railTop-4,`${lang} ${width}x${height} programme ${i}: panel bottom ${JSON.stringify(box)}`);
          assert.ok(box.actionBottom<=box.railTop-4,`${lang} ${width}x${height} programme ${i}: action bottom ${JSON.stringify(box)}`);
        }else{
          // The original 542-583px panel cannot fit between the menu and rail at 320x640.
          // Keep its readable layout and verify that a short page scroll exposes the action.
          await page.evaluate(()=>{
            const action=document.querySelector('.home-programme-cta');
            const rail=document.querySelector('.spine-rail');
            window.scrollBy({top:action.getBoundingClientRect().bottom-rail.getBoundingClientRect().top+12,behavior:'instant'});
          });
          const actionAfter=await page.evaluate(()=>({bottom:document.querySelector('.home-programme-cta').getBoundingClientRect().bottom,railTop:document.querySelector('.spine-rail').getBoundingClientRect().top}));
          assert.ok(actionAfter.bottom<=actionAfter.railTop-4,`${lang} ${width}x${height} programme ${i}: action after short scroll ${JSON.stringify(actionAfter)}`);
        }
        assert.equal(box.focus,'home-active-program');
      }
      await page.close();
    }
  } finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
