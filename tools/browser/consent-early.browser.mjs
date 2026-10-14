import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';
import {renderSite} from '../site-browser.mjs';
import {earlyConsentSource,injectEarlyConsent} from '../../launch/early-consent.mjs';

test('pre-rendered cookie controls respond before the live page is ready', async () => {
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  assert.ok(Buffer.byteLength(earlyConsentSource)<1024,'pre-paint inline handler exceeds 1 KB');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  let snapshot;
  await renderSite(process.cwd(),[{path:'/'}],{concurrency:1,onPage:async(_route,html)=>{snapshot=html;}});
  const local=await proofServer(process.cwd());
  local.snapshots.set('/',injectEarlyConsent(snapshot));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const [kind,allowed] of [['accept',true],['reject',false]]){
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
      await context.addInitScript(()=>{
        window.__consentWrites=0;
        const original=Storage.prototype.setItem;
        Storage.prototype.setItem=function(key,value){if(key==='dehat.consent')window.__consentWrites++;return original.call(this,key,value);};
      });
      const page=await context.newPage();
      await page.route('**/support.js',async route=>{await new Promise(resolve=>setTimeout(resolve,4000));await route.continue();});
      await page.goto(local.origin+'/',{waitUntil:'domcontentloaded'});
      await page.locator('#launch-snapshot [data-cookie-banner]').waitFor({state:'visible'});
      await page.waitForTimeout(1000);
      assert.notEqual(await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase),'ready');
      if(kind==='accept')await page.screenshot({path:'/private/tmp/dehat-186-H1-phone-before.png'});
      const start=Date.now();
      await page.locator(`#launch-snapshot [data-early-consent="${kind}"]`).click();
      await page.locator('#launch-snapshot [data-cookie-banner]').waitFor({state:'hidden',timeout:300});
      const elapsed=Date.now()-start;
      assert.ok(elapsed<300,`${kind} took ${elapsed} ms to hide`);
      if(kind==='accept')await page.screenshot({path:'/private/tmp/dehat-186-H1-phone-after.png'});
      const early=await page.evaluate(()=>({record:JSON.parse(localStorage.getItem('dehat.consent')),writes:window.__consentWrites}));
      assert.equal(early.record.v,1);assert.match(early.record.at,/^\d{4}-\d\d-\d\dT/);
      assert.deepEqual(early.record.prefs,{performance:allowed,functional:allowed,targeting:allowed});
      assert.equal(early.writes,1);
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      assert.equal(await page.locator('#launch-live [data-cookie-banner]').count(),0);
      assert.equal(await page.evaluate(()=>window.__consentWrites),1);
      console.log(JSON.stringify({kind,hiddenMs:elapsed,persisted:true,writes:1}));
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage();
    await page.route('**/support.js',async route=>{await new Promise(resolve=>setTimeout(resolve,4000));await route.continue();});
    await page.goto(local.origin+'/',{waitUntil:'domcontentloaded'});
    await page.locator('#launch-snapshot [data-early-consent="manage"]').click();
    assert.equal(await page.locator('#launch-snapshot [data-early-consent="manage"]').getAttribute('aria-busy'),'true');
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('dehat.openPrefs')),'1');
    await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
    await page.locator('[data-privacy-dialog]').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('dehat.openPrefs')),null);
    console.log(JSON.stringify({manageOpened:true,sessionFlagCleared:true}));
    await context.close();

    const desktop=await browser.newContext({viewport:{width:1280,height:800}});
    const desktopPage=await desktop.newPage();
    await desktopPage.route('**/support.js',async route=>{await new Promise(resolve=>setTimeout(resolve,4000));await route.continue();});
    await desktopPage.goto(local.origin+'/',{waitUntil:'domcontentloaded'});
    await desktopPage.locator('#launch-snapshot [data-cookie-banner]').waitFor({state:'visible'});
    await desktopPage.screenshot({path:'/private/tmp/dehat-186-H1-desktop-before.png'});
    await desktopPage.locator('#launch-snapshot [data-early-consent="reject"]').click();
    await desktopPage.locator('#launch-snapshot [data-cookie-banner]').waitFor({state:'hidden',timeout:300});
    await desktopPage.screenshot({path:'/private/tmp/dehat-186-H1-desktop-after.png'});
    await desktop.close();

    const returning=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await returning.addInitScript(()=>localStorage.setItem('dehat.consent',JSON.stringify({v:1,at:new Date().toISOString(),prefs:{performance:false,functional:false,targeting:false}})));
    const returnPage=await returning.newPage();
    await returnPage.route('**/support.js',async route=>{await new Promise(resolve=>setTimeout(resolve,4000));await route.continue();});
    await returnPage.goto(local.origin+'/',{waitUntil:'domcontentloaded'});
    for(let i=0;i<10;i++){
      assert.equal(await returnPage.locator('#launch-snapshot [data-cookie-banner]').isVisible(),false,`returning visitor flash at sample ${i}`);
      await returnPage.screenshot({path:`/private/tmp/dehat-186-H1-returning-${i}.png`});
      await returnPage.waitForTimeout(300);
    }
    await returnPage.locator('#launch-snapshot button:not([data-early-consent]):visible').first().click();
    assert.equal(await returnPage.evaluate(()=>document.documentElement.dataset.earlyLoading),'');
    assert.equal(await returnPage.locator('#launch-snapshot button[data-early-busy]').count(),1);
    console.log(JSON.stringify({returningSamples:10,bannerFlashes:0}));
    await returning.close();
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
