import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('hero Space and story arrows, dots, keys, swipe and automatic pause',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const [width,theme] of [[1280,'dark'],[1280,'light'],[375,'dark'],[375,'light']]){
      const phone=width<640;
      const context=await browser.newContext({viewport:{width,height:phone?812:800},isMobile:phone,hasTouch:phone,reducedMotion:'reduce'});
      await context.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      const page=await context.newPage();
      await page.goto(local.origin+'/');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const hero=page.locator('#launch-live .hr-in').first();
      const state=await hero.getAttribute('data-hero-state');
      await page.keyboard.press('Space');
      await page.waitForFunction(previous=>document.querySelector('#launch-live .hr-in')?.dataset.heroState!==previous,state);
      const after=await hero.getAttribute('data-hero-state');
      assert.ok(['playing','paused'].includes(after));
      await page.keyboard.press('Space');
      await page.waitForFunction(previous=>document.querySelector('#launch-live .hr-in')?.dataset.heroState!==previous,after);
      const form=await page.evaluate(()=>{const input=document.createElement('input');document.querySelector('#launch-live .hr-in').append(input);input.focus();return input.tagName;});
      assert.equal(form,'INPUT');
      const heroBeforeInput=await hero.getAttribute('data-hero-state');
      await page.keyboard.press('Space');
      assert.equal(await hero.getAttribute('data-hero-state'),heroBeforeInput,'Space in a form field leaves hero alone');
      const section=page.locator('#launch-live [data-spine="Stories of Change"]');
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await page.screenshot({path:`/private/tmp/dehat-186-0c-after-${theme}-${width}.png`});
      const dots=section.locator('.st-dot');
      assert.equal(await dots.count(),8);
      const boxes=await dots.evaluateAll(nodes=>nodes.map(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height})));
      assert.ok(boxes.every(box=>box.width>=(phone?32:24)&&box.height>=(phone?32:24)));
      const arrows=section.locator('.st-stage .st-arrow');
      assert.equal(await arrows.count(),2);
      const beforeHover=await arrows.first().evaluate(node=>({opacity:getComputedStyle(node).opacity,top:node.getBoundingClientRect().top,stage:node.parentElement.getBoundingClientRect().top,height:node.parentElement.getBoundingClientRect().height}));
      if(phone)assert.equal(beforeHover.opacity,'1');
      else{await section.locator('.st-stage').hover();await page.waitForTimeout(250);assert.equal(await arrows.first().evaluate(node=>getComputedStyle(node).opacity),'1');await page.screenshot({path:`/private/tmp/dehat-186-0c-hover-${theme}-${width}.png`});}
      assert.ok(Math.abs(beforeHover.top+23-(beforeHover.stage+beforeHover.height/2))<2,'arrows must sit at vertical centre');
      assert.equal(await dots.nth(0).getAttribute('aria-current'),'true');
      await dots.nth(4).click();
      assert.equal(await dots.nth(4).getAttribute('aria-current'),'true');
      await page.screenshot({path:`/private/tmp/dehat-186-F3-middle-${theme}-${width}.png`});
      await dots.nth(7).click();
      assert.equal(await dots.nth(7).getAttribute('aria-current'),'true');
      await page.screenshot({path:`/private/tmp/dehat-186-F3-last-${theme}-${width}.png`});
      await dots.nth(4).click();
      await page.keyboard.press('ArrowRight');
      assert.equal(await dots.nth(5).getAttribute('aria-current'),'true');
      await page.keyboard.press('ArrowLeft');
      assert.equal(await dots.nth(4).getAttribute('aria-current'),'true');
      assert.equal(await section.evaluate(node=>getComputedStyle(node).touchAction),'pan-y');
      const heroOffscreen=await hero.getAttribute('data-hero-state');
      await page.keyboard.press('Space');
      assert.equal(await hero.getAttribute('data-hero-state'),heroOffscreen,'Space off the hero leaves it alone');
      if(phone){
        await section.evaluate(node=>{
          const touch=(x,y)=>new Touch({identifier:1,target:node,clientX:x,clientY:y});
          node.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(250,400)]}));
          node.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch(100,405)]}));
        });
        assert.equal(await dots.nth(5).getAttribute('aria-current'),'true');
        await section.evaluate(node=>{
          const touch=(x,y)=>new Touch({identifier:2,target:node,clientX:x,clientY:y});
          node.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(150,400)]}));
          node.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch(154,250)]}));
        });
        assert.equal(await dots.nth(5).getAttribute('aria-current'),'true','vertical gesture must not change story');
      }
      if(width===1280&&theme==='dark'){
        await page.waitForTimeout(7500);
        assert.equal(await dots.nth(4).getAttribute('aria-current'),'true','manual action pauses the next automatic tick');
      }
      await page.goto(local.origin+'/stories/the-right-to-play');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const deckArrows=page.locator('#launch-live .deck-round');
      assert.equal(await deckArrows.count(),2);
      const deckBoxes=await deckArrows.evaluateAll(nodes=>nodes.map(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height,label:node.getAttribute('aria-label')})));
      assert.ok(deckBoxes.every(box=>Math.round(box.width)>=44&&Math.round(box.height)>=44&&box.label));
      const counter=page.locator('#launch-live .deck-count');
      const position=await counter.textContent();
      await deckArrows.nth(1).click();
      await page.waitForFunction(previous=>document.querySelector('#launch-live .deck-count')?.textContent!==previous,position);
      console.log(JSON.stringify({width,theme,heroSpace:true,dots:8,targetPx:boxes[0],arrows:true,swipe:phone,autoPause:width===1280&&theme==='dark'}));
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
