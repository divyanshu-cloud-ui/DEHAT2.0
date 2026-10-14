import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('compact phone header keeps Invest and menu separate, with preferences in menu', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  const frames = '/private/tmp/dehat-mobile-nav-186-frames';
  await mkdir(frames,{recursive:true});
  try {
    for (const width of [320,375,414,768]) {
      const context = await browser.newContext({viewport:{width,height:812},isMobile:true,hasTouch:true});
      await context.addInitScript(() => localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
      const page = await context.newPage();
      await page.goto(local.origin);
      await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
      const header = page.locator('nav.site-nav');
      const invest = header.locator('.invest-btn');
      const menu = header.getByRole('button',{name:/menu/i});
      const [headerBox,investBox,menuBox] = await Promise.all([header.boundingBox(),invest.boundingBox(),menu.boundingBox()]);
      assert.ok(headerBox.height <= 54, `header ${width}: ${headerBox.height}px`);
      assert.ok(investBox.height >= 44 && menuBox.height >= 44);
      assert.ok(investBox.x + investBox.width <= menuBox.x, `overlap at ${width}`);
      assert.equal(await header.locator('select.nav-language').isVisible(), false);
      await menu.click();
      const panel = page.locator('#mobile-menu');
      await panel.waitFor();
      assert.ok(await panel.locator('select.nav-language').isVisible());
      assert.ok(await panel.locator('button.theme-toggle').isVisible());
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      if (width === 375) {
        await page.screenshot({path:frames+'/open-'+width+'.png'});
        const initialTheme = await page.locator('html').getAttribute('data-theme');
        const nextTheme = initialTheme === 'dark' ? 'light' : 'dark';
        await panel.locator('button.theme-toggle').click();
        await page.waitForFunction(want => document.documentElement.getAttribute('data-theme') === want,nextTheme);
        assert.equal(await page.locator('html').getAttribute('data-theme'),nextTheme);
      }
      console.log(JSON.stringify({width,headerHeight:headerBox.height,investHeight:investBox.height,menuHeight:menuBox.height,gap:menuBox.x-investBox.x-investBox.width}));
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
