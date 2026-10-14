import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('six routes have no axe violations in either theme', async () => {
  if (!process.env.PLAYWRIGHT_MODULE || !process.env.AXE_SOURCE) throw new Error('Set PLAYWRIGHT_MODULE and AXE_SOURCE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
      await context.addInitScript(selected => {
        localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
        localStorage.setItem('dehat.theme', selected);
      }, theme);
      const page = await context.newPage();
      for (const route of ['/','/hi','/impact','/stories','/finance','/get-involved/give']) {
        await page.goto(local.origin + route);
        await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
        await page.waitForTimeout(700);
        await page.addScriptTag({path:process.env.AXE_SOURCE});
        const violations = await page.evaluate(async () => (await axe.run(document.querySelector('#launch-live')))
          .violations.map(v => ({id:v.id,nodes:v.nodes.map(n => ({target:n.target,summary:n.failureSummary}))})));
        assert.deepEqual(violations, [], `${theme} ${route}: ${JSON.stringify(violations)}`);
        if (route === '/') {
          const focus = await page.evaluate(() => {
            const link = document.querySelector('#launch-live .hr-cta');
            link.focus();
            return {outline:getComputedStyle(link).outlineStyle,width:getComputedStyle(link).outlineWidth};
          });
          assert.equal(focus.outline, 'solid');
          assert.equal(focus.width, '3px');
        }
        console.log(JSON.stringify({theme,route,axeViolations:violations.length}));
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
