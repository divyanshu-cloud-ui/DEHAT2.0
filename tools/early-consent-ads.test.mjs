import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { earlyConsentSource } from '../launch/early-consent.mjs';

function run({ lang = 'en', saved = null } = {}) {
  const values = new Map(saved ? [['dehat.consent', JSON.stringify(saved)]] : []);
  let click;
  const document = {
    documentElement: { lang, dataset: {} },
    addEventListener: (name, fn) => { if (name === 'click') click = fn; },
  };
  const localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  vm.runInNewContext(earlyConsentSource, { document, localStorage, sessionStorage: {}, window: {}, setTimeout: () => {} });
  return { document, values, click };
}

test('old English or Hindi cookie choices are reopened for fresh Ads disclosure', () => {
  for (const lang of ['en', 'hi']) {
    const h = run({ lang, saved: { v: 1, prefs: { targeting: true } } });
    assert.equal(h.document.documentElement.dataset.consent, undefined);
  }
  assert.equal(run({ saved: { v: 2, prefs: { targeting: false } } }).document.documentElement.dataset.consent, 'decided');
  assert.equal(run({ lang: 'fr', saved: { v: 1, prefs: { targeting: true } } }).document.documentElement.dataset.consent, 'decided');
});

test('early accept records the reviewed consent version before hiding the banner', () => {
  const h = run();
  const banner = { hidden: false, setAttribute(name) { if (name === 'hidden') this.hidden = true; } };
  const snapshot = { querySelector: () => banner };
  const button = { dataset: { earlyConsent: 'accept' } };
  h.click({ target: { closest: selector => selector === '#launch-snapshot' ? snapshot : button }, preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(JSON.parse(h.values.get('dehat.consent')).v, 2);
  assert.equal(h.document.documentElement.dataset.consent, 'decided');
  assert.equal(banner.hidden, true);
});
