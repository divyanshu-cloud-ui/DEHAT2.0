import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('story cards clamp titles and open stories expose touch arrows', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
    await context.addInitScript(() => localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    const page = await context.newPage();
    await page.goto(local.origin+'/stories');
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    const card = page.locator('.face-card').first();
    const clamp = await card.locator('.face-card-person').evaluate(node => getComputedStyle(node).webkitLineClamp);
    assert.equal(clamp,'2');
    await card.click();
    const heading = page.locator('article h1').first();
    const firstTitle = await heading.textContent();
    const next = page.locator('article .plate-nav').last();
    const state = await next.evaluate(node => ({opacity:getComputedStyle(node).opacity,pointerEvents:getComputedStyle(node).pointerEvents}));
    assert.ok(Number(state.opacity)>=0.9,JSON.stringify(state));
    assert.equal(state.pointerEvents,'auto');
    await next.click({position:{x:24,y:80}});
    await page.waitForFunction(old => document.querySelector('article h1')?.textContent !== old,firstTitle);
    console.log(JSON.stringify({titleClamp:clamp,touchArrow:state,advanced:true}));
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve=>local.server.close(resolve));
  }
});
