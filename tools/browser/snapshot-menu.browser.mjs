import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

// The pre-rendered snapshot shows the section menu long before the live page takes over (more than
// ten seconds on a slow phone). Its buttons must already move the reader to the matching section.
test('snapshot section menu jumps to its section before the live page is ready', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:375,height:812}, reducedMotion:'reduce'});
    await page.goto(local.origin + '/launch/runtime-template.html');
    const sections = ['Where This Is', 'The Journey', 'The Roster', 'Who Decides'];
    await page.setContent(`<!doctype html><html><body style="margin:0">
      <main id="launch-snapshot">
        <nav style="position:sticky;top:0;height:50px;background:#fff">logo</nav>
        <div data-subnav style="position:sticky;top:50px;height:40px;background:#eee">${sections.map(s => `<button class="subnav-link" aria-current="false">${s}</button>`).join('')}</div>
        ${sections.map(s => `<section data-spine="${s}" style="height:1400px"><h2>${s}</h2></section>`).join('')}
      </main></body></html>`);
    await page.addScriptTag({type:'module', content:`import {snapshotSectionMenu} from '${local.origin}/launch/bootstrap.mjs'; snapshotSectionMenu(document.getElementById('launch-snapshot')); window.__menuReady = true;`});
    await page.waitForFunction(() => window.__menuReady === true);
    for (const [index, label] of sections.entries()) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('.subnav-link', {hasText: label}).click();
      await page.waitForTimeout(200);
      const state = await page.evaluate(index => {
        const bar = document.querySelector('[data-subnav]').getBoundingClientRect().bottom;
        const top = document.querySelectorAll('[data-spine]')[index].getBoundingClientRect().top;
        const current = [...document.querySelectorAll('.subnav-link')].filter(b => b.getAttribute('aria-current') === 'true').map(b => b.textContent);
        return {bar, top, current};
      }, index);
      assert.ok(Math.abs(state.top - state.bar) <= 2, `${label}: section top ${state.top} should sit at the menu bar bottom ${state.bar}`);
      assert.deepEqual(state.current, [label]);
    }
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
