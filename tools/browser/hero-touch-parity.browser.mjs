import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('phone swipes on clock and graph match desktop hero stepping',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const spec=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(spec.startsWith('file:')?spec:pathToFileURL(spec).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
    await context.addInitScript(()=>localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    const page=await context.newPage();
    await page.goto(local.origin+'/');
    await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
    const hero=page.locator('#launch-live .hr-in');
    const beat=()=>hero.getAttribute('data-hero-beat');
    const cdp=await context.newCDPSession(page);
    const centre=async selector=>{const r=await page.locator(selector).boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
    const swipe=async(point,dx,dy)=>{
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+dx,y:point.y+dy}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(450);
    };
    await page.keyboard.press('Home');assert.equal(await beat(),'0');
    await swipe(await centre('#launch-live .hr-clockbox'),0,-90);assert.equal(await beat(),'1');
    await swipe(await centre('#launch-live .hr-canvas'),-100,0);assert.equal(await beat(),'2');
    await swipe(await centre('#launch-live .hr-canvas'),100,0);assert.equal(await beat(),'1');
    await page.screenshot({path:'/private/tmp/dehat-186-0g-phone-stepped.png'});
    await page.keyboard.press('End');assert.equal(await hero.getAttribute('data-hero-state'),'rest');
    await swipe(await centre('#launch-live .hr-canvas'),0,-100);
    assert.equal(await hero.getAttribute('data-hero-state'),'rest');
    assert.ok(await page.evaluate(()=>scrollY)>0,'upward swipe at rest did not scroll the page');
    console.log(JSON.stringify({clockUp:'0→1',graphLeft:'1→2',graphRight:'2→1',restUpScroll:await page.evaluate(()=>scrollY)}));
    await context.close();
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
