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
    const ordered = await page.locator('section[data-anchor="give"] [id^="df-"]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.deepEqual(ordered.slice(0, 4), ['df-fullName','df-phone-dial','df-phone','df-email']);
    assert.ok(ordered.indexOf('df-postalCode') < ordered.indexOf('df-state'));
    assert.ok(ordered.indexOf('df-countryCode') > ordered.indexOf('df-city'));
    assert.ok(ordered.indexOf('df-pan') > ordered.indexOf('df-email'));
    assert.ok(ordered.indexOf('df-pan') < ordered.indexOf('df-postalCode'));
    const receipt = page.locator('section[data-anchor="give"] button.giving-choice[aria-pressed]').filter({hasText:/80G/i});
    assert.equal(await receipt.getAttribute('aria-pressed'), 'true');
    await receipt.click();
    assert.equal(await receipt.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('#df-pan').count(), 0);
    await receipt.click();
    assert.ok(await page.locator('#df-pan').isVisible());
    await page.locator('#df-postalCode').fill('271801');
    await page.waitForFunction(() => document.querySelector('#df-state')?.value === 'Uttar Pradesh');
    assert.equal(await page.locator('#df-city').inputValue(), 'Bahraich');
    console.log(JSON.stringify({amountSelected:await amount.getAttribute('aria-pressed'),frequencyTargets:targets,fieldOrder:ordered,pinState:await page.locator('#df-state').inputValue()}));
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
