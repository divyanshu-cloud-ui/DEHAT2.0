// Gate for the Media Archive string tables (MediaArchive.dc.html + media-i18n/<code>.js).
//  (a) every t('key') the component uses exists in its English table, and every English key is used;
//  (b) every language file defines every English key and every taxonomy name found in media-data.js,
//      keeps the {n} {m} {v} placeholders of the English string, and defines nothing the page does not use.
// English lives in MediaArchive.dc.html (the fallback); a language file is optional until it exists.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile, readdir} from 'node:fs/promises';

const component = await readFile('MediaArchive.dc.html', 'utf8');
const EN = vm.runInNewContext('(' + component.match(/const EN = (\{[\s\S]*?\n\});/)[1] + ')');
const data = {}; vm.runInNewContext(await readFile('media-data.js', 'utf8'), {window: data});
const taxonomy = new Set();
for (const i of data.DEHAT_MEDIA) {
  for (const k of ['scope', 'type', 'lang', 'dist']) if (i[k]) taxonomy.add(i[k]);
  for (const k of ['who', 'mdg', 'sdg', 'csr', 'cr']) (i[k] || []).forEach(v => taxonomy.add(v));
}
const placeholders = s => (String(s).match(/\{\w+\}/g) || []).sort().join(',');

test('every key the component reads exists in its English table, and every English key is read', () => {
  const code = component.slice(component.indexOf('class Component'));
  // t('key') calls, and keys chosen by a condition: t(cond ? 'a' : 'b')
  const used = new Set([...code.matchAll(/\bt\(([^)]*?)(?:,\s*\{|\))/g)].flatMap(m => [...m[1].matchAll(/'(\w+)'/g)].map(x => x[1])));
  for (const k of used) assert.ok(k in EN, 'missing English key: ' + k);
  for (const k of Object.keys(EN)) assert.ok(used.has(k), 'unused English key: ' + k);
});

test('language files are complete, keep placeholders and add nothing unknown', async () => {
  const files = (await readdir('media-i18n').catch(() => [])).filter(f => /^[a-z]{2,3}\.js$/.test(f));
  for (const f of files) {
    const sandbox = {window: {}}; vm.runInNewContext(await readFile('media-i18n/' + f, 'utf8'), sandbox);
    const code = f.slice(0, -3), table = sandbox.window.MEDIA_I18N && sandbox.window.MEDIA_I18N[code];
    assert.ok(table, f + ' must set window.MEDIA_I18N.' + code);
    for (const k of Object.keys(EN)) {
      assert.ok(typeof table[k] === 'string' && table[k].trim(), `${code}: missing ${k}`);
      assert.equal(placeholders(table[k]), placeholders(EN[k]), `${code}: placeholders differ in ${k}`);
    }
    for (const v of taxonomy) assert.ok(typeof table['v.' + v] === 'string' && table['v.' + v].trim(), `${code}: missing taxonomy name "${v}"`);
    for (const k of Object.keys(table)) assert.ok(k in EN || (k.startsWith('v.') && taxonomy.has(k.slice(2))), `${code}: unknown key ${k}`);
  }
});
