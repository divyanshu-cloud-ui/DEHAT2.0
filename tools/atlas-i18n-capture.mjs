// Shared by tools/atlas-i18n.test.mjs: drives district-map.html in a headless browser and returns the
// rendered English (or any language) output of the shell, three district profiles, the metric ranking
// and the compare view as plain JSON, so the output can be compared before and after the i18n change.
//   node tools/atlas-i18n-capture.mjs <out.json> [lang]     (needs PLAYWRIGHT_MODULE and CHROME_PATH)
import http from 'node:http';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';

export async function startStatic(root) {
  const server = http.createServer(async (req, res) => {
    try {
      const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname).slice(1));
      if (!file.startsWith(root + path.sep)) throw new Error('outside root');
      const body = await readFile(file);
      res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve))};
}

export async function launch() {
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
  return chromium.launch({headless: true, ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
}

export async function openAtlas(browser, origin, query = '', viewport = {width: 1280, height: 800}) {
  const context = await browser.newContext({viewport, reducedMotion: 'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${origin}/district-map.html${query}`);
  await page.waitForFunction(() => document.querySelectorAll('g.dg').length === 23, null, {timeout: 30000});
  await page.waitForTimeout(150);
  return {page, context, errors};
}

const attrs = () => [...document.querySelectorAll('#wrap [title],#wrap [aria-label],#wrap [placeholder]')]
  .map(e => [e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), ['title', 'aria-label', 'placeholder'].filter(a => e.hasAttribute(a)).map(a => a + '=' + e.getAttribute(a)).join('|')]);

const grab = async (page, sel) => page.evaluate(s => document.querySelector(s).textContent.replace(/\s+/g, ' ').trim(), sel);
const grabAttrs = page => page.evaluate(attrs);

async function tip(page, id) {
  return page.evaluate(want => {
    const g = [...document.querySelectorAll('g.dg')].find(n => n.__data__.d.id === want);
    g.dispatchEvent(new MouseEvent('mouseenter', {clientX: 300, clientY: 300}));
    return document.getElementById('tt').textContent.replace(/\s+/g, ' ').trim();
  }, id);
}

async function pick(page, text) {
  await page.fill('#searchIn', text);
  await page.locator('#suggest button').first().click();
  await page.waitForTimeout(100);
}

export async function capture(page, names) {
  const out = {};
  out.shell = {
    title: await page.title(),
    htmlLang: await page.evaluate(() => document.documentElement.getAttribute('lang')),
    navbar: await grab(page, '.navbar'),
    selects: await page.evaluate(() => [...document.querySelectorAll('#wrap select')].map(s => [s.id, [...s.options].map(o => o.value + '=' + o.textContent)])),
    attrs: await grabAttrs(page),
    placeholder: await grab(page, '#panelBody'),
    legend: await grab(page, '#legend'),
    buttons: await page.evaluate(() => [...document.querySelectorAll('#wrap button')].map(b => (b.id || b.className) + '=' + b.textContent)),
    labels: await page.evaluate(() => [...document.querySelectorAll('text.dlabel')].map(t => t.textContent)),
  };
  await page.fill('#searchIn', 'zzzz');
  out.shell.noHit = await grab(page, '#suggest');
  await page.fill('#searchIn', 'ut');
  out.shell.suggestUt = await grab(page, '#suggest');
  await page.fill('#searchIn', '');
  out.tips = {};
  for (const id of ['bahraich', 'basti', 'washim']) out.tips[id] = await tip(page, id);
  out.profiles = {};
  for (const [id, name] of names) {
    await pick(page, name);
    out.profiles[id] = {text: await grab(page, '#panelBody'), attrs: await grabAttrs(page), legend: await grab(page, '#legend')};
  }
  await page.click('#rankBtn');
  out.rank = {};
  for (const m of ['overall', 'stunting', 'mmr', 'outMigration', 'phcGap']) {
    await page.selectOption('#metricSel', m);
    await page.waitForTimeout(30);
    out.rank[m] = {rank: await grab(page, '#rankbox'), legendHidden: await page.evaluate(() => document.getElementById('legend').style.display)};
  }
  await page.click('#rankbox .rk-head button[data-k="name"]');
  out.rank.byName = await grab(page, '#rankbox');
  await page.click('#rankBtn');
  await page.selectOption('#metricSel', 'stunting');
  out.legendStunting = await grab(page, '#legend');
  await page.selectOption('#metricSel', 'overall');
  await page.click('#cmpBtn');
  out.compare = {empty: await grab(page, '#panelBody'), tipCmp: await tip(page, 'bahraich')};
  await pick(page, 'Bahraich');
  out.compare.one = await grab(page, '#panelBody');
  await pick(page, 'Dharashiv');
  out.compare.two = await grab(page, '#panelBody');
  out.compare.attrs = await grabAttrs(page);
  return out;
}

export const PROFILE_NAMES = [['bahraich', 'Bahraich'], ['amethi', 'Amethi'], ['dharashiv', 'Dharashiv']];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [outFile, lang] = process.argv.slice(2);
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const srv = await startStatic(root);
  const browser = await launch();
  try {
    const {page, errors} = await openAtlas(browser, srv.origin, lang ? `?lang=${lang}` : '');
    const snap = await capture(page, PROFILE_NAMES);
    if (errors.length) console.error('page errors', errors);
    await writeFile(outFile, JSON.stringify(snap, null, 1).replace(/\u2014/g, '\\u2014') + '\n');   // em dashes written as escapes
    console.log('wrote', outFile);
  } finally { await browser.close(); await srv.close(); }
}
