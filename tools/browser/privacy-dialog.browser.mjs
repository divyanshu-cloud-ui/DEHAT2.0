import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('privacy preferences trap focus, inert the page, and return focus on Escape', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(() => localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    const page = await context.newPage();
    await page.goto(local.origin);
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    const trigger = page.locator('[data-privacy-trigger]');
    await trigger.click();
    const dialog = page.locator('[data-privacy-dialog]');
    await dialog.waitFor();
    await page.waitForFunction(() => document.querySelector('[data-privacy-dialog]')?.contains(document.activeElement));
    assert.equal(await page.evaluate(() => document.querySelector('#launch-live nav')?.inert), true);
    assert.equal(await page.evaluate(() => document.querySelector('[data-privacy-dialog]')?.contains(document.activeElement)), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.querySelector('[data-privacy-dialog]')?.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'detached'});
    await page.waitForFunction(() => document.activeElement?.matches('[data-privacy-trigger]'));
    assert.equal(await page.evaluate(() => document.querySelector('#launch-live nav')?.inert), false);
    console.log(JSON.stringify({opened:true,focusTrapped:true,backgroundInert:true,escapeReturnedFocus:true}));
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
