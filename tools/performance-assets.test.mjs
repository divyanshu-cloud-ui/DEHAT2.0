import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {REACT_URL,REACT_DOM_URL,REACT_ASSET,REACT_DOM_ASSET,resourceHints} from '../launch/performance-assets.mjs';
import {publicAsset} from './package-launch.mjs';
import {PARTNER_TABS} from '../launch/partner-tabs.mjs';
import {PARTNER} from '../partner-data.js';

const expected = new Map([
  [REACT_ASSET, 'sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z'],
  [REACT_DOM_ASSET, 'sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1'],
]);
test('local React copies match the runtime SRI and content-addressed paths', async () => {
  assert.match(REACT_URL, /react@18\.3\.1/);
  assert.match(REACT_DOM_URL, /react-dom@18\.3\.1/);
  for (const [asset,sri] of expected) {
    const bytes = await readFile('.' + asset);
    const sha384 = createHash('sha384').update(bytes).digest('base64');
    const sha256 = createHash('sha256').update(bytes).digest('hex').slice(0,16);
    assert.equal('sha384-' + sha384,sri);
    assert.ok(asset.endsWith(sha256+'.js'));
    assert.equal(publicAsset(asset.slice(1)),true);
  }
});
test('launch hints name local resources and the requested language only', () => {
  const english = resourceHints('en');
  const hindi = resourceHints('hi');
  // Heavy runtime files load from bootstrap.mjs; preloading them delayed the first paint.
  for (const heavy of [REACT_ASSET, REACT_DOM_ASSET, '/support.js', '/launch/runtime-template.html']) assert.ok(!english.includes(heavy), heavy);
  assert.ok(english.includes('as="font" crossorigin type="font/woff2"'));
  assert.ok(!english.includes('/content-i18n/'));
  assert.ok(hindi.includes('/content-i18n/hi.js'));
  assert.ok(!hindi.includes('/content-i18n/ar.js'));
  assert.ok(english.includes('/launch/partner-tabs.mjs'));
});
test('small shared navigation labels exactly match the partner dataset',async()=>{
  assert.ok((await readFile('launch/partner-tabs.mjs')).length<12_000);
  for(const [lang,data] of Object.entries(PARTNER)){
    assert.deepEqual(PARTNER_TABS[lang].tabs,(data.tabs||[]).map(({k,label})=>({k,label})));
  }
});
test('language partner chunks preserve copy without shipping every language',async()=>{
  for(const [lang,data] of Object.entries(PARTNER)){
    const chunk=await import(`../launch/partner/${lang}.mjs`);
    assert.deepEqual(chunk.DATA,data);
    assert.ok(publicAsset(`launch/partner/${lang}.mjs`));
  }
  assert.ok((await readFile('launch/partner/en.mjs')).length<50_000);
});

import vm from 'node:vm';
import {splitRuntimeDictionaries,runtimeTemplate} from './proof-server.mjs';
test('runtime template carries English only and preserves all translated values', async () => {
  const source = await readFile('DEHAT.dc.html','utf8');
  const start = source.indexOf('  _dict() {');
  const end = source.indexOf('\n  _canonName(',start);
  const original = vm.runInNewContext('({' + source.slice(start,end) + '})')._dict();
  const split = splitRuntimeDictionaries(source);
  const runtime = runtimeTemplate(split.source);
  assert.ok(Buffer.byteLength(runtime)<1_000_000);
  for (const file of ['stories-data.js','media-data.js','image-slot.js']) {
    assert.ok(source.includes(`<script src="./${file}"></script>`));
    assert.ok(!runtime.includes(`<script src="./${file}"></script>`), `${file} must not load twice`);
  }
  assert.equal(Object.keys(split.dictionaries).length,27);
  for (const lang of Object.keys(split.dictionaries)) {
    const context = {window:{}};vm.runInNewContext(split.dictionaries[lang],context);
    assert.deepEqual(JSON.parse(JSON.stringify(context.window.__LAUNCH_DICTIONARY[lang])),JSON.parse(JSON.stringify(original[lang])));
  }
  const ctx={window:{DEHAT_LAUNCH_DIAGNOSTICS:{},__LAUNCH_DICTIONARY:{hi:original.hi}}};
  const runtimeMethod=split.source.slice(split.source.indexOf('  _dict() {'),split.source.indexOf('\n  _canonName(',split.source.indexOf('  _dict() {')));
  const instance=vm.runInNewContext('({' + runtimeMethod + '})',ctx);
  instance.state={lang:'hi'};
  assert.equal(instance._dict(),instance._dict(),'split dictionary must retain Phase 0 memoisation');
  assert.equal(ctx.window.DEHAT_LAUNCH_DIAGNOSTICS.dictBuilds,1);
});
test('bootstrap waits for the snapshot to paint before the heavy downloads', async () => {
  const source = await readFile('launch/bootstrap.mjs', 'utf8');
  const wait = source.indexOf('await afterFirstPaint();');
  assert.ok(wait > 0, 'start() must await afterFirstPaint');
  for (const heavy of ["fetch('/launch/runtime-template.html')", "script('/stories-data.js')", "import('/finance-data.js')"]) {
    assert.ok(source.indexOf(heavy) > wait, `${heavy} must start after the first paint`);
  }
  assert.match(source, /setTimeout\(go, 1500\)/, 'a cap keeps background tabs and old browsers booting');
});
test('identifier keys never change between languages',()=>{
  // The code compares these keys to English literals ('route', 'once', 'unrestricted', 'inr' ...) and
  // to the donation form's default state. A translated key silently breaks the lookup: the Get
  // Involved nav falls back to the raw English word and no frequency/purpose/regime shows as selected.
  for(const arr of ['tabs','freqs','purposes','regimes','who']){
    const expected=PARTNER.en[arr].map(x=>x.k);
    for(const [lang,data] of Object.entries(PARTNER)){
      assert.deepEqual((data[arr]||[]).map(x=>x.k),expected,`${lang}.${arr} keys must equal the English keys`);
    }
  }
});
