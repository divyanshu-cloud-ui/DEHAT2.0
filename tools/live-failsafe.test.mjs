import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { runPreflight } from './preflight-live.mjs';
const require = createRequire(import.meta.url);
const status = require('../backend/donations/status.js');

const run = async (env, method = 'GET') => {
  const keep = { ...process.env };
  for (const k of Object.keys(process.env)) if (/^(RAZORPAY_|RECEIPT|KV_|UPSTASH_)/.test(k)) delete process.env[k];
  Object.assign(process.env, env);
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } };
  try { await status({ method }, res); } finally { for (const k of Object.keys(process.env)) if (!(k in keep)) delete process.env[k]; Object.assign(process.env, keep); }
  return { code: res.statusCode, body: res.body ? JSON.parse(res.body) : null, headers: res.headers };
};
const READY = { RECEIPTS_ENABLED: '1', KV_REST_API_URL: 'u', KV_REST_API_TOKEN: 't', RECEIPT_SMTP_HOST: 'h', RECEIPT_SMTP_USER: 'u', RECEIPT_SMTP_PASS: 'p', RECEIPT_FROM: 'f' };

test('status names the Razorpay mode from the key prefix and never leaks a secret', async () => {
  const live = await run({ RAZORPAY_DOMESTIC_KEY_ID: 'rzp_live_abc', RAZORPAY_DOMESTIC_KEY_SECRET: 'sss', RAZORPAY_DOMESTIC_WEBHOOK_SECRET: 'w', ...READY });
  assert.deepEqual(live.body, { mode: 'live', receipts: true, webhook: true });
  assert.equal(live.headers['Cache-Control'], 'no-store');
  assert.ok(!JSON.stringify(live.body).includes('sss') && !JSON.stringify(live.body).includes('abc'));
  assert.equal((await run({ RAZORPAY_DOMESTIC_KEY_ID: 'rzp_test_abc', RAZORPAY_DOMESTIC_KEY_SECRET: 's' })).body.mode, 'test');
  assert.equal((await run({})).body.mode, 'unconfigured');
  assert.equal((await run({ RAZORPAY_DOMESTIC_KEY_ID: 'other', RAZORPAY_DOMESTIC_KEY_SECRET: 's' })).body.mode, 'unconfigured');
});
test('receipts count as ready only with the switch, the store and the mailbox', async () => {
  const base = { RAZORPAY_DOMESTIC_KEY_ID: 'rzp_live_a', RAZORPAY_DOMESTIC_KEY_SECRET: 's' };
  assert.equal((await run({ ...base, ...READY })).body.receipts, true);
  for (const drop of ['RECEIPTS_ENABLED', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'RECEIPT_SMTP_PASS', 'RECEIPT_FROM']) {
    const env = { ...READY }; delete env[drop];
    assert.equal((await run({ ...base, ...env })).body.receipts, false, drop);
  }
});
test('status only answers GET', async () => { assert.equal((await run({}, 'POST')).code, 405); });

const fakeSite = ({ mode = 'live', receipts = true, webhook = true, paypal = 404, blank = 400 } = {}) => async (url, init = {}) => {
  const path = new URL(url).pathname; const j = (status, body) => ({ status, json: async () => body });
  if (path === '/api/donations/status') return j(200, { mode, receipts, webhook });
  if (path === '/api/donations/webhook') return j(400, { error: 'Invalid webhook signature' });
  if (path === '/api/donations/create-order') return init.method === 'POST' ? j(blank, { error: 'x', fields: { fullName: 'required' } }) : j(405, {});
  if (path === '/api/paypal/config') return j(paypal, {});
  return j(404, {});
};
test('preflight passes on a correct live site and fails on test mode, missing receipts or leftover PayPal', async () => {
  assert.equal((await runPreflight('https://x.test', fakeSite())).ok, true);
  for (const [patch, name] of [[{ mode: 'test' }, 'LIVE mode'], [{ receipts: false }, 'receipts'], [{ webhook: false }, 'webhook secret'], [{ paypal: 200 }, 'PayPal'], [{ blank: 200 }, 'blank donor form']]) {
    const r = await runPreflight('https://x.test', fakeSite(patch));
    assert.equal(r.ok, false, name);
    assert.ok(r.checks.some(c => !c.ok && c.name.includes(name)), name);
  }
  assert.equal((await runPreflight('https://x.test', async () => { throw new Error('offline'); })).ok, false);
});
