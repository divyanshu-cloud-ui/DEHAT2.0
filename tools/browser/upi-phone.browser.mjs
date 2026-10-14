import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('mocked UPI intent puts app action first on touch and QR behind disclosure', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    for (const touch of [true,false]) {
      const context = await browser.newContext({viewport:{width:touch?375:1280,height:touch?812:900},hasTouch:touch,isMobile:touch});
      await context.addInitScript(() => localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
      const page = await context.newPage();
      let posted = null;
      await page.route('**/api/donations/upi-intent',async route => {
        posted = JSON.parse(route.request().postData());
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({code:'TEST-REF',amount:100000,qr:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',uri:'upi://pay?pa=test@example',vpa:'test@example'})});
      });
      await page.goto(local.origin+'/get-involved/give');
      await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
      await page.locator('button[aria-pressed]').filter({hasText:'₹1,000'}).click();
      await page.locator('button.giving-choice').filter({hasText:/80G/}).click();
      await page.locator('#df-fullName').fill('Preview Donor');
      await page.locator('#df-phone').fill('9876543210');
      await page.locator('#df-email').fill('preview@example.com');
      await page.locator('#df-postalCode').fill('271801');
      await page.waitForFunction(() => document.querySelector('#df-state')?.value === 'Uttar Pradesh');
      await page.locator('#df-email').blur();
      await page.locator('section[data-anchor="give"] button').filter({hasText:/UPI QR/i}).first().click();
      const panel = page.locator('[data-anchor="upi-qr"]');
      await panel.waitFor();
      assert.equal(posted.amount,1000);
      assert.ok(await panel.locator('a[href^="upi://"]').isVisible());
      const folded = panel.locator('details.upi-qr-fold');
      if (touch) {
        assert.ok(await folded.isVisible());
        assert.equal(await folded.getAttribute('open'),null);
        assert.equal(await panel.locator('img.upi-qr-inline').isVisible(),false);
        await folded.locator('summary').click();
        assert.ok(await folded.locator('img').isVisible());
      } else {
        assert.equal(await folded.isVisible(),false);
        assert.ok(await panel.locator('img.upi-qr-inline').isVisible());
      }
      console.log(JSON.stringify({touch,upiAmount:posted.amount,appAction:true,qrFolded:touch}));
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve=>local.server.close(resolve));
  }
});
