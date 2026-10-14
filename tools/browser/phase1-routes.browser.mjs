import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('route data loads only where needed and navigation keeps content', async () => {
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  if (!modulePath) throw new Error('Set PLAYWRIGHT_MODULE');
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const ready = () => page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready', null, {timeout:15000});
    await page.goto(local.origin + '/');
    await ready();
    const homeResources = await page.evaluate(() => performance.getEntriesByType('resource').map(resource => new URL(resource.name).pathname));
    assert.ok(!homeResources.includes('/partner-data.js'), 'home must not fetch the large partner dataset');
    assert.ok(!homeResources.includes('/who-data.js'), 'home must not fetch who data');
    assert.ok(!homeResources.includes('/image-slot.js'), 'home must not fetch the unused image slot component');
    assert.equal(homeResources.filter(path => path === '/stories-data.js').length, 1);
    assert.equal(homeResources.filter(path => path === '/media-data.js').length, 1);
    assert.ok((await page.locator('#launch-live main').innerText()).length > 1000);

    for (const [route, expectedResource] of [
      ['/get-involved/give', '/launch/partner/en.mjs'],
      ['/who', '/who-data.js'],
      ['/impact', '/impact-lenses.js'],
      ['/work', '/journey-data.js'],
      ['/answers', '/faq-data.js'],
    ]) {
      await page.goto(local.origin + route);
      try { await ready(); } catch (error) {
        throw new Error(`${route}: ${error.message}; diagnostics=${JSON.stringify(await page.evaluate(() => window.DEHAT_LAUNCH_DIAGNOSTICS))}; errors=${JSON.stringify(errors)}`);
      }
      const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(resource => new URL(resource.name).pathname));
      assert.ok(resources.includes(expectedResource), `${route} must load ${expectedResource}`);
      assert.ok(!resources.includes('/partner-data.js'), `${route} must not fetch all-language partner data`);
      assert.equal(resources.filter(path => path === '/stories-data.js').length, 1, `${route} must load story data once`);
      if (route !== '/get-involved/give' && route !== '/who') assert.ok(!resources.includes('/image-slot.js'), `${route} must not load unused image-slot code`);
      assert.ok((await page.locator('#launch-live main').innerText()).length > 1000, `${route} must render content`);
    }
    await page.goto(local.origin + '/stories');
    await ready();
    const storyResources = await page.evaluate(() => performance.getEntriesByType('resource').map(resource => new URL(resource.name).pathname));
    assert.ok(storyResources.some(path => /^\/assets\/story\/optimized\/story-\d{3}-(480|800|1100)\.(avif|webp)$/.test(path)), 'story art must use a smaller modern format');
    assert.ok(!storyResources.includes('/assets/story/web/story-002.png'), 'story deck must not fetch the 1.3 MB PNG');
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
});
