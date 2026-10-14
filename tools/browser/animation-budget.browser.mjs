import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('infinite art pauses off screen and sticky blur drops on low-core devices', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(() => {
      localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      Object.defineProperty(navigator, 'hardwareConcurrency', {value:4,configurable:true});
    });
    const page = await context.newPage();
    await page.goto(local.origin);
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    await page.waitForTimeout(700);
    const first = await page.evaluate(() => ({
      running:document.getAnimations().filter(animation => animation.playState === 'running').length,
      infinite:document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect?.getTiming().iterations === Infinity).length,
      blur:getComputedStyle(document.querySelector('nav[style*="backdrop-filter"]')).backdropFilter,
    }));
    assert.ok(first.infinite <= 1, `off-screen art still animates: ${JSON.stringify(first)}`);
    assert.equal(first.blur, 'none');
    await page.evaluate(() => scrollTo(0,1100));
    await page.waitForTimeout(700);
    const visible = await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect?.getTiming().iterations === Infinity).length);
    assert.ok(visible > first.infinite, 'SVC art resumes when it enters the viewport');
    console.log(JSON.stringify({first,visibleInfinite:visible}));
    await context.close();

    const reduced = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(local.origin);
    await reducedPage.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    assert.equal(await reducedPage.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect?.getTiming().iterations === Infinity).length), 0);
    assert.equal(await reducedPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await reduced.close();
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
