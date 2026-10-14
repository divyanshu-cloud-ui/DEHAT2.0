import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('donation choices expose their selected state and have usable phone targets', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
    await context.addInitScript(() => localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    const page = await context.newPage();
    await page.goto(local.origin + '/get-involved/give');
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    const amount = page.locator('section[data-anchor="give"] button[aria-pressed]').filter({hasText:/Other/i});
    assert.equal(await amount.count(), 1);
    await amount.click();
    assert.equal(await amount.getAttribute('aria-pressed'), 'true');
    assert.ok(await page.getByRole('textbox',{name:/Other.*Invest/i}).isVisible());
    const freqs = page.locator('section[data-anchor="give"] button[aria-pressed]').filter({hasText:/monthly|once/i});
    assert.ok(await freqs.count() >= 1);
    const targets = await freqs.evaluateAll(nodes => nodes.map(node => ({label:node.textContent.trim(),height:node.getBoundingClientRect().height})));
    assert.ok(targets.every(target => target.height >= 44), JSON.stringify(targets));
    console.log(JSON.stringify({amountSelected:await amount.getAttribute('aria-pressed'),frequencyTargets:targets}));
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
