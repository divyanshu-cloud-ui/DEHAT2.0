import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';
import {PROFILES} from '../../who-profiles.js';

test('home process, programme and people sections work on phones', async () => {
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  if (!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    for (const width of [320, 375, 430]) {
      const page = await browser.newPage({viewport:{width,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      await page.addInitScript(() => {
        localStorage.setItem('dehat.theme','light');
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
      });
      await page.goto(local.origin + '/');
      await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');

      const process = page.locator('section[data-spine="The Method"]');
      const steps = process.locator('.loop-phone-button');
      assert.equal(await steps.count(), 4);
      assert.ok(await steps.first().isVisible());
      assert.equal(await process.locator('.loop-grid').isVisible(), false);
      await steps.nth(3).click();
      assert.equal(await steps.nth(3).getAttribute('aria-expanded'), 'true');
      assert.match(await process.locator('.loop-phone-row').nth(3).innerText(), /Once the public system is delivering/);

      const programmes = page.locator('section[data-spine="The Four Programmes"]');
      await programmes.locator('button').filter({hasText:'Human Protection'}).first().click();
      const active = programmes.locator('.home-active-program');
      await assert.doesNotReject(() => active.locator('h3').getByText('Human Protection').waitFor());
      await page.waitForTimeout(150);
      const programmePosition = await active.evaluate(el => ({top:el.getBoundingClientRect().top,ctaHeight:el.querySelector('button')?.getBoundingClientRect().height}));
      assert.ok(programmePosition.top >= 100 && programmePosition.top < 300, `selected programme stays in view at ${width}: ${programmePosition.top}`);
      assert.ok(programmePosition.ctaHeight >= 44);

      const people = page.locator('section[data-spine="Who Is Behind This"]');
      const faces = people.locator('.who-teaser-faces button');
      assert.equal(await faces.count(), 8);
      const ids = ['t33','t28','t17','t34','t10','t21','t12','t15'];
      for (let i = 0; i < ids.length; i++) assert.equal(await faces.nth(i).getAttribute('aria-label'), PROFILES[ids[i]].name);
      await people.locator('.who-teaser-faces').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.querySelectorAll('.who-teaser-faces img')].every(img => img.complete && img.naturalWidth > 0));
      await faces.nth(7).click();
      await assert.doesNotReject(() => people.locator('.who-teaser-selected').getByText(PROFILES.t15.name).waitFor());
      assert.match(await people.locator('.who-teaser-selected').innerText(), /Grassroots Anchor, Human Protection/);
      const peopleLayout = await people.evaluate(el => {
        const faces = [...el.querySelectorAll('.who-teaser-faces button')];
        const grid = el.querySelector('.who-teaser-faces').getBoundingClientRect();
        const selected = el.querySelector('.who-teaser-selected').getBoundingClientRect();
        return {columns: new Set(faces.map(face => Math.round(face.getBoundingClientRect().left))).size,
          faceHeight:faces[0].getBoundingClientRect().height, gridBottom:grid.bottom, selectedTop:selected.top,
          overflow:el.scrollWidth > el.clientWidth};
      });
      assert.equal(peopleLayout.columns, 4);
      assert.ok(peopleLayout.faceHeight >= 44);
      assert.ok(peopleLayout.selectedTop >= peopleLayout.gridBottom);
      assert.equal(peopleLayout.overflow, false);
      await page.screenshot({path:`/private/tmp/dehat-home-mobile-ux-${width}.png`});
      console.log(JSON.stringify({width,process:'inline steps',programmeTop:Math.round(programmePosition.top),peopleColumns:peopleLayout.columns,overflow:false}));
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
