import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

const root = process.cwd();
const output = '/private/tmp/dehat-hero-186-frames';
const playwright = process.env.PLAYWRIGHT_MODULE;

test('hero replays on full load, rests after in-app return, and stays accessible', async () => {
  if (!playwright) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium} = await import(playwright.startsWith('file:') ? playwright : pathToFileURL(playwright).href);
  const local = await proofServer(root);
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  await mkdir(output, {recursive:true});
  const ready = page => page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready', null, {timeout:20000});
  const consent = context => context.addInitScript(() => localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
  const beat = page => page.locator('#launch-live .hr-in').getAttribute('data-hero-beat');
  const state = page => page.locator('#launch-live .hr-in').getAttribute('data-hero-state');
  const accessible = async page => {
    assert.equal(await page.getByRole('heading', {level:1, name:/This Cycle Doesn.t Break/i}).count(), 1);
    assert.equal(await page.getByRole('button', {name:'Invest in This Work', exact:true}).count(), 1);
    assert.equal(await page.getByRole('button', {name:'Skip film'}).count(), 0);
  };
  try {
    const desktop = await browser.newContext({viewport:{width:1440,height:900}, reducedMotion:'no-preference'});
    await consent(desktop);
    const page = await desktop.newPage();
    await page.goto(local.origin + '/'); await ready(page);
    assert.equal(await state(page), 'playing');
    await accessible(page);
    await page.locator('#launch-live .hr-cta').focus();
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('#launch-live .hr-link').evaluate(node => node === document.activeElement));
    await page.locator('#launch-live .hr-cta').evaluate(node => node.blur());
    await page.screenshot({path:output + '/desktop-playing.png'});
    await page.keyboard.press('Home'); assert.equal(await beat(page), '0');
    await page.mouse.wheel(0, 120); await page.waitForTimeout(500);
    assert.equal(await beat(page), '1');
    await page.mouse.wheel(0, -120); await page.waitForTimeout(500);
    assert.equal(await beat(page), '0');
    await page.keyboard.press('ArrowDown'); assert.equal(await beat(page), '1');
    await page.keyboard.press('ArrowUp'); assert.equal(await beat(page), '0');
    await page.keyboard.press('PageDown'); assert.equal(await beat(page), '1');
    await page.keyboard.press('Home'); assert.equal(await beat(page), '0');
    await page.keyboard.press('End'); assert.equal(await state(page), 'rest');
    await page.mouse.wheel(0,-120); await page.waitForTimeout(450); assert.equal(await beat(page), '11');
    await page.keyboard.press('ArrowDown'); assert.equal(await state(page), 'rest');
    await accessible(page);
    await page.screenshot({path:output + '/desktop-rest.png'});
    await page.reload(); await ready(page); assert.equal(await state(page), 'playing');
    await page.locator('.footer-nav-link[data-prefetch="stories"]').click();
    await page.waitForFunction(() => window.DEHAT_LAUNCH?.route?.view === 'stories');
    await page.locator('.footer-nav-link[data-prefetch="home"]').click();
    await page.waitForFunction(() => window.DEHAT_LAUNCH?.route?.view === 'home');
    assert.equal(await state(page), 'rest');
    await page.locator('#launch-live .hr-ctl').click(); assert.equal(await state(page), 'playing');
    await page.keyboard.press('Escape'); assert.equal(await state(page), 'rest');
    await desktop.close();

    const phone = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
    await consent(phone);
    const mobile = await phone.newPage();
    await mobile.goto(local.origin + '/'); await ready(mobile);
    assert.equal(await state(mobile), 'playing');
    await accessible(mobile);
    assert.equal(await mobile.locator('#launch-live .hr-mobile-identity').count(), 0);
    await mobile.screenshot({path:output + '/phone-playing.png'});
    await mobile.keyboard.press('Home'); assert.equal(await beat(mobile), '0');
    const rect = await mobile.locator('#launch-live .hr-words').boundingBox();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    const cdp = await phone.newCDPSession(mobile);
    const touch = async (a,b) => {
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:a}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:b}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    await touch(y,y-100); assert.equal(await beat(mobile), '1');
    await mobile.waitForTimeout(450);
    await touch(y,y+100); assert.equal(await beat(mobile), '0');
    await mobile.keyboard.press('End'); assert.equal(await state(mobile), 'rest');
    await mobile.screenshot({path:output + '/phone-rest.png'});
    await phone.close();

    const reduced = await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
    await consent(reduced);
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(local.origin + '/'); await ready(reducedPage);
    assert.equal(await state(reducedPage), 'rest');
    await reduced.close();

    const fresh = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
    const firstVisit = await fresh.newPage();
    await firstVisit.goto(local.origin + '/'); await ready(firstVisit);
    await firstVisit.getByRole('dialog').waitFor();
    assert.equal(await state(firstVisit), 'paused', 'consent banner must pause the film while covering it');
    await firstVisit.getByRole('button',{name:'Reject All'}).click();
    await firstVisit.locator('#launch-live .hr-in[data-hero-state="playing"]').waitFor();
    await fresh.close();

    const timed = await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    await consent(timed);
    const timedPage = await timed.newPage();
    await timedPage.goto(local.origin + '/'); await ready(timedPage);
    const started = Date.now();
    await timedPage.locator('#launch-live .hr-in[data-hero-state="rest"]').waitFor({timeout:33000});
    const duration = Date.now() - started;
    assert.ok(duration >= 29000 && duration <= 31000, `autoplay duration ${duration} ms`);
    console.log(JSON.stringify({heroDurationMs:duration,frames:output}));
    await timed.close();
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
