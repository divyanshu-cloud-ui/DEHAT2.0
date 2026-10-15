import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

// The Cycle ring turns one way while each thumbnail turns back the other way to stay upright.
// The animation budget must pause and resume them together: budgeted separately, a slow scroll
// past the ring left the thumbnails tilted (5 to 28 degrees on 62f1adf).
test('Cycle thumbnails stay upright after a slow scroll past the ring', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:1280,height:800}});
    await context.addInitScript(() => localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
    const page = await context.newPage();
    await page.goto(local.origin);
    await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
    const ring = '#launch-live .cyc-ring';
    const top = await page.evaluate(selector => document.querySelector(selector).getBoundingClientRect().top + scrollY, ring);
    for (const y of [top - 650, top - 500, top - 350, top - 200, top - 50, top + 250, top + 450]) {
      await page.evaluate(y => scrollTo(0, y), y);
      await page.waitForTimeout(1200);
    }
    await page.locator(ring).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const tilts = await page.evaluate(selector => {
      const angle = element => {
        const matrix = getComputedStyle(element).transform;
        if (!matrix || matrix === 'none') return 0;
        const [a, b] = matrix.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);
        return Math.atan2(b, a) * 180 / Math.PI;
      };
      const spinner = document.querySelector(selector + ' > div');
      return [...spinner.querySelectorAll('.cyc-node')].map(node => Math.abs(((angle(spinner) + angle(node.parentElement)) % 360 + 540) % 360 - 180));
    }, ring);
    assert.equal(tilts.length, 16);
    assert.ok(Math.max(...tilts) <= 2, `thumbnails tilted: ${tilts.map(t => t.toFixed(1)).join(', ')}`);
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
