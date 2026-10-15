// Gate for the District Atlas string table (district-map.html + district-i18n/*.js).
//
//  (a) no visible English string literal in district-map.html outside t()/th()/data-i18n (heuristic below)
//  (b) every key the page uses exists in district-i18n/en.js
//  (c) every key in en.js is used by the page (or is a data-text key that district-data.js generates)
//  (d) the English output is unchanged from the pre-change page: the rendered text of the shell, three
//      district profiles, the metric ranking and the compare view are compared with
//      tools/fixtures/atlas-en/head-snapshot.json, captured from the page before it was made translatable.
//      (d) and the language-hand-off test need a browser: set PLAYWRIGHT_MODULE (and CHROME_PATH); without
//      them they are skipped and only the static checks (a)-(c) run.
//
// Heuristic for (a). The page script is tokenised (comments and regex literals skipped) and every string
// and template literal chunk is checked; the static markup is checked element by element.
//   1. A chunk that holds HTML markup ('<tag' or '</'): after the tags are removed, any run of three or
//      more letters is visible text. Values of title / aria-label / placeholder attributes count too.
//   2. A chunk without markup: two English words in a row (e.g. 'Tap to add') are visible text.
//   3. A literal assigned straight to textContent / innerHTML, or passed to .text() / .html(), may not
//      contain a run of three or more letters.
//   4. Markup: text inside an element, and title / aria-label / placeholder values, must carry data-i18n /
//      data-i18n-attr, and the English fallback written in the markup must equal the en.js value.
// Allowed: the names in ALLOW (font names, geography keys), symbols and numbers, and CSS/selector strings
// (they never contain two English words in a row).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startStatic, launch, openAtlas, capture, PROFILE_NAMES} from './atlas-i18n-capture.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'district-map.html'), 'utf8');
const sandbox = {window: {}};
vm.createContext(sandbox);
vm.runInContext(await readFile(path.join(root, 'district-data.js'), 'utf8'), sandbox);
vm.runInContext(await readFile(path.join(root, 'district-i18n/en.js'), 'utf8'), sandbox);
const A = sandbox.window.ATLAS;
const EN = sandbox.window.ATLAS_I18N.en;
const script = html.match(/<script>\n\(function\(\)\{[\s\S]*?<\/script>/)[0].replace(/^<script>/, '').replace(/<\/script>$/, '');
const ALLOW = ['Bricolage Grotesque', 'Public Sans', 'Sri Lanka', 'Jammu & Kashmir (official boundary)', '.rk-head button'];
const DATA_PREFIXES = ['state', 'node', 'ind', 'district', 'src'];

// ---------- tokenizer: string / template literal chunks of the page script ----------
export function literals(src) {
  const out = [];
  let i = 0;
  const readQuoted = q => { let s = ''; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; } else s += src[i++]; } i++; return s; };
  function template() {
    i++;
    let chunk = '';
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { chunk += src[i] + src[i + 1]; i += 2; }
      else if (src[i] === '$' && src[i + 1] === '{') { chunk += '\u0001'; i += 2; code(true); }
      else chunk += src[i++];
    }
    out.push(chunk); i++;   // the template as one literal, each ${...} shown as \u0001; literals inside the expressions are scanned separately
  }
  function code(inExpr) {
    let depth = 0, prev = '';
    while (i < src.length) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; }
      else if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; }
      else if (c === "'" || c === '"') { out.push(readQuoted(c)); prev = '"'; }
      else if (c === '`') { template(); prev = '`'; }
      else if (c === '/' && /[(,=:[!&|?{};+*%<>~^-]/.test(prev || '(')) {
        i++; let cls = false;
        while (i < src.length && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; }
        i++; while (/[a-z]/.test(src[i])) i++; prev = ')';
      }
      else if (c === '{') { depth++; i++; prev = c; }
      else if (c === '}') { if (inExpr && depth === 0) { i++; return; } depth--; i++; prev = c; }
      else { if (!/\s/.test(c)) prev = c; i++; }
    }
  }
  code(false);
  return out;
}

const plain = s => ALLOW.reduce((t, a) => t.split(a).join(' '), s).replace(/\b(?:drop-shadow|rgba?|translate|color-mix)\((?:[^()]|\([^()]*\))*\)/g, ' ').replace(/\\u[0-9a-fA-F]{4}/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ');
const attrText = chunk => [...chunk.matchAll(/\b(?:title|aria-label|placeholder|alt)="([^"]*)"/g)].map(m => m[1]);

export function visibleEnglish(chunk) {
  const found = [];
  const c = plain(chunk);
  if (/<\/?[a-zA-Z][^>]*>|<\/[a-z]+/.test(c) || /<[a-z]+\b/.test(c)) {
    for (const a of attrText(c)) if (/[A-Za-z]{3,}/.test(a)) found.push(a);
    const text = c.replace(/<[^>]*>/g, ' ');
    if (/[A-Za-z]{3,}/.test(text)) found.push(text.trim());
  } else if (/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(c)) found.push(c.trim());
  return found;
}

export function englishInScript(src) {
  const found = literals(src).flatMap(visibleEnglish);
  for (const m of src.matchAll(/(?:textContent|innerHTML)\s*=\s*(['"`])((?:(?!\1)[^\\])*)\1|\.(?:text|html)\(\s*(['"`])((?:(?!\3)[^\\])*)\3/g)) {
    const text = plain(m[2] ?? m[4] ?? '').replace(/\$\{[^}]*\}/g, ' ').replace(/<[^>]*>/g, ' ');
    if (/[A-Za-z]{3,}/.test(text)) found.push(text.trim());
  }
  return found;
}

// ---------- static markup ----------
function markupProblems(markup) {
  const problems = [];
  const body = markup.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const keys = [];
  const VOID = new Set(['meta', 'link', 'input', 'br', 'img', 'hr']);
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) {
      const text = m[4].replace(/&[a-z]+;/g, ' ').trim();
      const top = stack[stack.length - 1];
      if (!text || !/[A-Za-z]{2,}/.test(text) || !top) continue;
      if (!top.key) problems.push(`text "${text}" in <${top.tag}> has no data-i18n`);
      else if (text !== String(EN[top.key]).replace('{n}', String(A.districts.length))) problems.push(`fallback text "${text}" differs from en.js ${top.key}`);
      continue;
    }
    if (m[1]) { stack.pop(); continue; }
    const attrs = m[3];
    const key = (attrs.match(/\bdata-i18n="([^"]+)"/) || [])[1];
    if (key) keys.push(key);
    const map = Object.fromEntries(((attrs.match(/\bdata-i18n-attr="([^"]+)"/) || [])[1] || '').split(';').filter(Boolean).map(p => p.split(':')));
    for (const a of ['title', 'aria-label', 'placeholder']) {
      const v = (attrs.match(new RegExp(`\\b${a}="([^"]*)"`)) || [])[1];
      if (v === undefined || !/[A-Za-z]{2,}/.test(v)) continue;
      if (!map[a]) problems.push(`${a}="${v}" on <${m[2]}> has no data-i18n-attr`);
      else if (v !== String(EN[map[a]]).replace('{n}', String(A.districts.length))) problems.push(`${a} fallback "${v}" differs from en.js ${map[a]}`);
    }
    Object.values(map).forEach(k => keys.push(k));
    if (!VOID.has(m[2].toLowerCase()) && !attrs.endsWith('/')) stack.push({tag: m[2], key});
  }
  return {problems, keys};
}

// ---------- keys used by the page ----------
const familyOf = key => { const p = key.split('.'); if (!DATA_PREFIXES.includes(p[0])) return null; return p[0] === 'state' ? 'state.*' : p[0] === 'src' ? 'src.*.*' : p[0] === 'ind' ? `ind.*.${p[2]}` : `${p[0]}.*.${p[2]}`; };
const markup = html.replace(script, '');
const mk = markupProblems(markup);
const usedLiteral = new Set([...script.matchAll(/\b(?:t|th|bold)\(\s*'([\w.]+)'/g)].map(m => m[1]).concat(mk.keys));
const usedFamilies = new Set([...script.matchAll(/\bdt\(\s*((?:'[^']*'|[\w.]+)(?:\s*\+\s*(?:'[^']*'|[\w.]+))*)/g)].map(m =>
  m[1].split('+').map(x => x.trim()).map(x => x.startsWith("'") ? x.slice(1, -1) : '*').join('')));

test('(a) district-map.html has no visible English literal outside t()/th()/data-i18n', () => {
  assert.deepEqual(mk.problems, [], 'static markup');
  assert.deepEqual(englishInScript(script), [], 'script literals');
});

test('(a) the heuristic does catch an English literal that is not routed through t()', () => {
  assert.ok(englishInScript("el.innerHTML = `<b>${x}</b> Tap to add`;").length > 0);
  assert.ok(englishInScript("label.textContent = 'Ranking';").length > 0);
  assert.ok(englishInScript("const s = 'Tap two districts on the map';").length > 0);
  assert.deepEqual(englishInScript("const re = /a b/; x.attr('stroke-dasharray', `${4/k} ${3/k}`); const u = a/b; y.innerHTML = `<div class=\"p-pad\">${t('x')}</div>`;"), []);
  assert.ok(markupProblems('<button id="x">Ranking</button>').problems.length > 0);
});

test('(b) every key the page uses is in district-i18n/en.js', () => {
  const missing = [...usedLiteral].filter(k => !(k in EN));
  assert.deepEqual(missing, []);
  const enFamilies = new Set(Object.keys(EN).map(familyOf).filter(Boolean));
  assert.deepEqual([...usedFamilies].filter(f => !enFamilies.has(f)), [], 'data-text key patterns used by the page but absent from en.js');
});

test('(c) every key in en.js is used by the page', () => {
  const unused = Object.keys(EN).filter(k => !usedLiteral.has(k) && !familyOf(k));
  assert.deepEqual(unused, []);
  const unusedFamilies = [...new Set(Object.keys(EN).map(familyOf).filter(Boolean))].filter(f => !usedFamilies.has(f));
  assert.deepEqual(unusedFamilies, [], 'data-text keys in en.js that no renderer reads');
});

test('en.js data keys match district-data.js exactly (id-built keys, same text)', () => {
  const want = {'state.up': 'Uttar Pradesh', 'state.mh': 'Maharashtra'};
  for (const d of A.districts) { want[`state.${d.sb}`] ||= d.state; assert.equal(want[`state.${d.sb}`], d.state, `${d.id} state vs sb`); }
  for (const n of A.nodes) { want[`node.${n.id}.label`] = n.label; want[`node.${n.id}.blurb`] = n.blurb; }
  for (const i of A.indicators) {
    want[`ind.${i.key}.label`] = i.label; want[`ind.${i.key}.interp`] = i.interp; want[`ind.${i.key}.source`] = i.source;
    if (i.unit && i.unit !== '%') want[`ind.${i.key}.unit`] = i.unit;
  }
  for (const d of A.districts) { want[`district.${d.id}.name`] = d.name; want[`district.${d.id}.hq`] = d.hq; want[`district.${d.id}.why`] = d.why; if (d.scope) want[`district.${d.id}.scope`] = d.scope; }
  for (const [did, o] of Object.entries(A.srcOverride)) for (const [k, v] of Object.entries(o)) want[`src.${did}.${k}`] = v;
  const have = Object.fromEntries(Object.entries(EN).filter(([k]) => familyOf(k)));
  assert.deepEqual(have, want);
});

test('en.js has plain strings with {name} tokens only', () => {
  for (const [k, v] of Object.entries(EN)) {
    assert.equal(typeof v, 'string', k);
    assert.ok(!/[{}]/.test(v.replace(/\{\w+\}/g, '')), `${k} has a stray brace`);
  }
});

const browserReady = !!process.env.PLAYWRIGHT_MODULE;
test('(d) English output is unchanged from the pre-change page', {skip: !browserReady && 'set PLAYWRIGHT_MODULE (and CHROME_PATH) to run the browser checks'}, async () => {
  const fixture = JSON.parse(await readFile(path.join(root, 'tools/fixtures/atlas-en/head-snapshot.json'), 'utf8'));
  const srv = await startStatic(root);
  const browser = await launch();
  try {
    for (const query of ['', '?lang=en']) {
      const {page, errors, context} = await openAtlas(browser, srv.origin, query);
      const now = JSON.parse(JSON.stringify(await capture(page, PROFILE_NAMES)));
      assert.deepEqual(errors, []);
      for (const k of Object.keys(fixture)) assert.deepEqual(now[k], fixture[k], `${query || '(no lang)'} ${k}`);
      await context.close();
    }
  } finally { await browser.close(); await srv.close(); }
});

test('language hand-off: ?lang= loads a table, sets lang and dir, postMessage switches, a missing file stays English', {skip: !browserReady && 'set PLAYWRIGHT_MODULE (and CHROME_PATH) to run the browser checks'}, async () => {
  const table = `window.ATLAS_I18N = window.ATLAS_I18N || {}; window.ATLAS_I18N.ar = ${JSON.stringify({'nav.rank': 'RANK-AR', 'metric.overall': 'OVERALL-AR', 'district.bahraich.name': 'NAME-AR', 'state.up': 'STATE-AR', 'ph.title': 'WHY-AR', 'bench.up': 'UPAR', 'ind.stunting.label': 'STUNT-AR'})};`;
  const srv = await startStatic(root);
  const browser = await launch();
  try {
    const shell = async page => page.evaluate(() => ({lang: document.documentElement.lang, dir: document.documentElement.dir, rank: document.getElementById('rankBtn').textContent, cmp: document.getElementById('cmpBtn').textContent, ph: document.querySelector('#ph b')?.textContent, title: document.title}));
    // 1. arabic table supplied (RTL set), English for every key it lacks
    const context = await browser.newContext({viewport: {width: 1280, height: 800}});
    const page = await context.newPage();
    await page.route('**/district-i18n/ar.js*', route => route.fulfill({contentType: 'text/javascript', body: table}));
    await page.goto(`${srv.origin}/district-map.html?lang=ar`);
    await page.waitForFunction(() => document.querySelectorAll('g.dg').length === 23);
    let s = await shell(page);
    assert.deepEqual([s.lang, s.dir, s.rank, s.cmp, s.ph], ['ar', 'rtl', 'RANK-AR', 'Compare', 'WHY-AR']);
    assert.equal(await page.evaluate(() => document.querySelector('#metricSel option').textContent), 'OVERALL-AR');
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('text.dlabel')].map(t => t.textContent).includes('NAME-AR')), true);
    await page.fill('#searchIn', 'Bahraich');
    assert.match(await page.locator('#suggest button').first().textContent(), /NAME-AR.*STATE-AR/);
    await page.locator('#suggest button').first().click();
    const prof = await page.locator('#panelBody').textContent();
    assert.ok(prof.includes('NAME-AR') && prof.includes('STUNT-AR') && prof.includes('UPAR 38.1'), 'profile uses the table, falls back for the rest');
    // 2. parent changes language: back to English without a reload, panel re-rendered
    await page.evaluate(() => window.postMessage({lang: 'en'}, '*'));
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    s = await shell(page);
    assert.deepEqual([s.lang, s.dir, s.rank], ['en', 'ltr', 'Ranking']);
    assert.ok((await page.locator('#panelBody').textContent()).includes('Child Stunting (<5y)'));
    // 3. and forward again
    await page.evaluate(() => window.postMessage({lang: 'ar'}, '*'));
    await page.waitForFunction(() => document.documentElement.dir === 'rtl');
    assert.ok((await page.locator('#panelBody').textContent()).includes('STUNT-AR'));
    await context.close();
    // 4. a language with no file (or an unknown code) is silently English, and lang/dir say so
    for (const code of ['fr', 'xx', '../x']) {
      const o = await openAtlas(browser, srv.origin, `?lang=${encodeURIComponent(code)}`);
      const e = await shell(o.page);
      assert.deepEqual([e.lang, e.dir, e.rank], ['en', 'ltr', 'Ranking'], code);
      assert.deepEqual(o.errors, [], code);
      await o.context.close();
    }
  } finally { await browser.close(); await srv.close(); }
});
