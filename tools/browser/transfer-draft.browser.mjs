import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('transfer details prepare an email draft without an arithmetic challenge', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:375,height:812}});
    await page.addInitScript(() => localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    await page.goto(local.origin + '/get-involved/give');
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    assert.equal(await page.getByPlaceholder('What is three plus four?').count(), 0);
    await page.locator('#rt-rtRef').fill('TEST-TRANSFER-186');
    await page.locator('#rt-rtAmount').fill('1000');
    await page.locator('#rt-rtDate').fill(new Date().toISOString().slice(0, 10));
    await page.locator('#rt-rtFirst').fill('Preview');
    await page.locator('#rt-rtEmail').fill('preview@example.com');
    await page.getByRole('button', {name:/Submit Transfer Details/}).click();
    await page.waitForFunction(() => document.querySelector('[data-anchor="report-form"] .ml-sheet'));
    const draft = await page.locator('[data-anchor="report-form"] .ml-sheet').innerText();
    assert.match(draft, /TEST-TRANSFER-186/);
    assert.match(draft, /preview@example.com/);
    console.log(JSON.stringify({challengeFields:0,draftIncludesReference:true,draftIncludesEmail:true}));
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
