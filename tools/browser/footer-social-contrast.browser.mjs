import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

const channel=value=>{const v=value/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};
const luminance=rgb=>{const v=rgb.match(/[\d.]+/g).slice(0,3).map(Number);return .2126*channel(v[0])+.7152*channel(v[1])+.0722*channel(v[2]);};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

test('footer social glyphs keep contrast in rest, hover and focus',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const width of [375,1280])for(const theme of ['dark','light']){
      const page=await browser.newPage({viewport:{width,height:width===375?812:800},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const row=page.locator('#launch-live .footer-social-row');
      await row.scrollIntoViewIfNeeded();
      const icons=row.locator('.footer-social,.footer-share');
      assert.equal(await icons.count(),6);
      await page.screenshot({path:`/private/tmp/dehat-186-0e-rest-${theme}-${width}.png`});
      const names=[];
      for(let i=0;i<6;i++){
        const icon=icons.nth(i);
        const name=await icon.getAttribute('aria-label');
        assert.ok(name&&name.length>3);
        names.push(name);
        const style=()=>icon.evaluate(node=>{const cs=getComputedStyle(node);return {color:cs.color,bg:cs.backgroundColor,footer:getComputedStyle(node.closest('footer')).backgroundColor,outline:cs.outlineColor};});
        const rest=await style();
        assert.ok(contrast(rest.color,rest.footer)>=4.5,`${name} rest`);
        await icon.hover();await page.waitForTimeout(220);
        const hover=await style();
        assert.ok(contrast(hover.color,hover.bg)>=7,`${name} hover ${JSON.stringify(hover)}`);
        if(i===0)await page.screenshot({path:`/private/tmp/dehat-186-0e-hover-${theme}-${width}.png`});
        await icon.focus();await page.waitForTimeout(220);
        const focus=await style();
        assert.ok(contrast(focus.color,focus.bg)>=7,`${name} focus`);
      }
      console.log(JSON.stringify({width,theme,controls:names,minimumContrast:7}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
