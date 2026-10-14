import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('header, dropdown, footer and CTA navigation stays in the live page', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:800}});
    await page.addInitScript(() => localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    await page.goto(local.origin + '/');
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    const destinations = [
      ['.nav-parent-link[data-prefetch="who"]','/who'],
      ['.nav-parent-link[data-prefetch="work"]','/work'],
      ['.nav-parent-link[data-prefetch="finance"]','/finance'],
      ['.nav-parent-link[data-prefetch="involved"]','/get-involved/case'],
      ['.footer-nav-link[data-prefetch="home"]','/'],
      ['.footer-nav-link[data-prefetch="who"]','/who'],
      ['.footer-nav-link[data-prefetch="work"]','/work'],
      ['.footer-nav-link[data-prefetch="impact"]','/impact'],
      ['.footer-nav-link[data-prefetch="stories"]','/stories'],
      ['.footer-nav-link[data-prefetch="finance"]','/finance'],
      ['.footer-nav-link[data-prefetch="media"]','/media'],
      ['.footer-nav-link[data-prefetch="answers"]','/answers'],
      ['.footer-nav-link[data-prefetch="involved"]','/get-involved/case'],
    ];
    let checked = 0;
    for (const [selector,path] of destinations) {
      await page.evaluate(() => {window.__navMarker = (window.__navMarker || 0) + 1;});
      const marker = await page.evaluate(() => window.__navMarker);
      await page.locator(selector).click();
      await page.waitForFunction(expected => location.pathname === expected && window.DEHAT_LAUNCH?.route?.canonicalPath === expected, path);
      assert.equal(await page.evaluate(() => window.__navMarker),marker,`${selector} caused a full reload`);
      assert.ok((await page.locator('#launch-live main').innerText()).length > 400,`${path} is empty`);
      checked++;
    }
    for (const [label,path] of [['Impact','/impact'],['Stories','/stories'],['Media','/media'],['Answers','/answers']]) {
      await page.evaluate(() => {window.__navMarker = (window.__navMarker || 0) + 1;});
      const marker = await page.evaluate(() => window.__navMarker);
      if (label === 'Answers') await page.locator('.nav-parent-link[data-prefetch="involved"]').hover();
      else await page.locator('.nav-parent-link[data-prefetch="work"]').hover();
      await page.locator('.nav-child-link').filter({hasText:label}).last().click();
      await page.waitForFunction(expected => location.pathname === expected && window.DEHAT_LAUNCH?.route?.canonicalPath === expected, path);
      assert.equal(await page.evaluate(() => window.__navMarker),marker,`${label} caused a full reload`);
      assert.ok((await page.locator('#launch-live main').innerText()).length > 400,`${path} is empty`);
      checked++;
    }
    assert.equal(checked,17);
    await page.evaluate(() => {window.__navMarker = 99;});
    await page.locator('.footer-nav-link[data-prefetch="home"]').click();
    await page.waitForFunction(() => location.pathname === '/' && window.DEHAT_LAUNCH?.route?.canonicalPath === '/');
    await page.locator('.hr-cta').evaluate(button => button.click());
    await page.waitForFunction(() => location.pathname === '/get-involved/give' && window.DEHAT_LAUNCH?.route?.canonicalPath === '/get-involved/give');
    assert.equal(await page.evaluate(() => window.__navMarker),99,'hero CTA reloaded');
    assert.ok((await page.locator('#launch-live main').innerText()).length > 400,'give route is empty');
    console.log(JSON.stringify({navigationClicks:checked,fullReloads:0,heroCtaReloads:0}));
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
