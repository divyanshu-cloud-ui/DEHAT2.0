import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

function luminance(rgb){
  const parts=rgb.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number).map(value=>{
    const channel=value/255;
    return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4;
  });
  return parts[0]*0.2126+parts[1]*0.7152+parts[2]*0.0722;
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}

test('phone menu is opaque, legible, and isolates content with Escape focus return',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['light','dark'])for(const width of [375,768]){
      const page=await browser.newPage({viewport:{width,height:812},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const trigger=page.locator('#launch-live [data-mobile-menu-trigger]');
      await trigger.click();
      const menu=page.locator('#launch-live #mobile-menu');
      await menu.waitFor({state:'visible'});
      if(width===375){
        await page.addStyleTag({content:'#mobile-menu{background:var(--nav)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}'});
        await page.screenshot({path:`/private/tmp/dehat-186-F2-before-${theme}-${width}.png`});
        await page.addStyleTag({content:'#mobile-menu{background:var(--surface)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'});
        await page.screenshot({path:`/private/tmp/dehat-186-F2-after-${theme}-${width}.png`});
      }
      const result=await page.evaluate(()=>{
        const menu=document.querySelector('#launch-live #mobile-menu');
        const main=document.querySelector('#launch-live main');
        const logo=document.querySelector('#launch-live .site-nav button');
        const buttons=[...menu.querySelectorAll('button')].filter(node=>getComputedStyle(node).display!=='none');
        const styles=getComputedStyle(menu);
        return {background:styles.backgroundColor,filter:styles.backdropFilter,ink:getComputedStyle(buttons[0]).color,mainInert:!!main?.closest('[inert]'),logoInert:logo.inert,minButtonHeight:Math.min(...buttons.map(node=>node.getBoundingClientRect().height)),focusInside:menu.contains(document.activeElement)};
      });
      assert.match(result.background,/^rgb\(/,'menu background is solid');
      assert.equal(result.filter,'none');
      assert.ok(contrast(result.ink,result.background)>=7,`${theme} contrast is ${contrast(result.ink,result.background)}`);
      assert.equal(result.mainInert,true,'main content is inert');
      assert.equal(result.logoInert,true,'other header actions are inert');
      assert.ok(result.minButtonHeight>=44,`smallest menu control is ${result.minButtonHeight}px`);
      assert.equal(result.focusInside,true);
      await page.keyboard.press('Escape');
      await menu.waitFor({state:'hidden'});
      await page.waitForFunction(()=>document.activeElement===document.querySelector('#launch-live [data-mobile-menu-trigger]'));
      assert.equal(await page.evaluate(()=>!!document.querySelector('#launch-live main')?.closest('[inert]')),false);
      console.log(JSON.stringify({theme,width,contrast:+contrast(result.ink,result.background).toFixed(2),minimumTargetPx:result.minButtonHeight,behindInert:true,escapeFocusReturned:true}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
