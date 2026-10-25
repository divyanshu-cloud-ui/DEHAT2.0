import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const source = readFileSync(new URL('../DEHAT.dc.html', import.meta.url), 'utf8');
const start = source.indexOf('  _adsGate() {');
const end = source.indexOf('\n  _investBand(', start);
assert.ok(start >= 0 && end > start, 'Google Ads measurement methods exist');

function harness({ version = 2, targeting = true, lang = 'en', mode = 'live', host = 'dehatindia.org' } = {}) {
  const scripts = [];
  const cookies = new Map();
  let consent = { v: version, prefs: { targeting } };
  const window = {
    location: { hostname: host }, crypto: webcrypto,
    localStorage: { getItem: key => key === 'dehat.consent' ? JSON.stringify(consent) : null },
  };
  const document = {
    head: { appendChild: script => scripts.push(script) },
    createElement: tag => ({ tagName: tag, dataset: {} }),
    get cookie() { return [...cookies].map(([k, v]) => `${k}=${v}`).join('; '); },
    set cookie(value) {
      const [key, val] = value.split(';')[0].split('=');
      if (value.includes('Max-Age=0')) cookies.delete(key);
      else cookies.set(key, val);
    },
  };
  const methods = vm.runInNewContext('({' + source.slice(start, end).replace('\n  async _recordAdsDonation', ',\n  async _recordAdsDonation') + '})', { window, document, TextEncoder, Uint8Array, Number, Set });
  const app = { state: { ckDecided: true, ckPrefs: { targeting }, lang }, _pmode: mode, ...methods };
  return { app, window, scripts, cookies, setConsent: value => { consent = value; } };
}

test('tag stays absent before fresh consent, outside English/Hindi, or outside live canonical site', () => {
  for (const options of [
    { version: 1 }, { targeting: false }, { lang: 'fr' }, { mode: 'test' },
    { mode: 'unconfigured' }, { host: '127.0.0.1' }, { host: 'www.dehatindia.org' },
  ]) {
    const h = harness(options);
    assert.equal(h.app._adsGate(), false, JSON.stringify(options));
    assert.equal(h.scripts.length, 0, JSON.stringify(options));
  }
});

test('verified INR payment is measured once, without donor details or a raw payment ID', async () => {
  const h = harness();
  assert.equal(h.app._adsGate(), true);
  assert.equal(h.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=AW-940501892');
  const proof = { paymentId: 'pay_TEST123', amount: 12345, currency: 'INR' };
  await h.app._recordAdsDonation(proof);
  await h.app._recordAdsDonation(proof);
  const events = h.window.dataLayer.filter(args => args[0] === 'event');
  assert.equal(events.length, 1);
  assert.equal(events[0][2].value, 123.45);
  assert.equal(events[0][2].send_to, 'AW-940501892/5FYmCJiNhKUdEITXu8AD');
  assert.match(events[0][2].transaction_id, /^dehat-[a-f0-9]{32}$/);
  assert.ok(!JSON.stringify(events[0][2]).includes(proof.paymentId));

  h.cookies.set('_gcl_aw', 'click');
  h.app.state.ckPrefs.targeting = false;
  h.setConsent({ v: 2, prefs: { targeting: false } });
  assert.equal(h.app._adsGate(), false);
  assert.equal(h.cookies.has('_gcl_aw'), false);
  await h.app._recordAdsDonation({ paymentId: 'pay_SECOND', amount: 10000, currency: 'INR' });
  assert.equal(h.window.dataLayer.filter(args => args[0] === 'event').length, 1);
});

test('consent grants ad storage and user data but never personalisation, and withdrawal revokes both', () => {
  const h = harness();
  assert.equal(h.app._adsGate(), true);
  const consent = () => h.window.dataLayer.filter(args => args[0] === 'consent');
  assert.deepEqual({ ...consent()[0][2] }, { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'denied' });
  h.app.state.ckPrefs.targeting = false;
  h.setConsent({ v: 2, prefs: { targeting: false } });
  h.app._adsGate();
  const update = consent().at(-1);
  assert.equal(update[1], 'update');
  assert.deepEqual({ ...update[2] }, { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
});

test('a transfer report or invalid proof is never a donation conversion', async () => {
  const h = harness();
  for (const proof of [null, {}, { paymentId: 'pay_A', amount: 0, currency: 'INR' },
    { paymentId: 'pay_A', amount: 100, currency: 'USD' }, { paymentId: 'transfer-ref', amount: 100, currency: 'INR' }]) {
    await h.app._recordAdsDonation(proof);
  }
  assert.equal((h.window.dataLayer || []).filter(args => args[0] === 'event').length, 0);
});
