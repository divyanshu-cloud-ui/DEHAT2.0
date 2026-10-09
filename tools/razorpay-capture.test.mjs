import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';

const require = createRequire(import.meta.url);
process.env.RAZORPAY_DOMESTIC_KEY_ID = 'rzp_test_unit';
process.env.RAZORPAY_DOMESTIC_KEY_SECRET = 'unit-test-secret';
const https = require('https');
const z = require('../api/_razorpay.js');
const createOrder = require('../api/donations/create-order.js');
const verify = require('../api/donations/verify.js');

const realRequest = https.request;
function mockRazorpay(route) {
  const calls = [];
  https.request = (opts, cb) => {
    const req = new EventEmitter();
    req.destroy = () => {};
    req.end = (data) => {
      const payload = data ? JSON.parse(data) : null;
      calls.push({ method: opts.method, path: opts.path, payload });
      const r = route(opts.method, opts.path, payload);
      const res = new EventEmitter();
      res.statusCode = r.status;
      process.nextTick(() => { cb(res); res.emit('data', JSON.stringify(r.body)); res.emit('end'); });
    };
    return req;
  };
  return calls;
}
const restore = () => { https.request = realRequest; };
function call(handler, bodyObj, method = 'POST') {
  return new Promise((resolve) => {
    const res = { statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(s) { resolve({ status: this.statusCode, body: JSON.parse(s) }); } };
    Promise.resolve(handler({ method, body: bodyObj, headers: {} }, res));
  });
}
function confirmation({ amount = 10000, currency = 'INR', order = 'order_A', pay = 'pay_A', badSig = false, age = 0 } = {}) {
  const contextToken = z.contextToken({ kind: 'order', id: order, amount, currency, createdAt: Date.now() - age });
  const signature = badSig ? 'deadbeef' : z.hmac(order + '|' + pay, process.env.RAZORPAY_DOMESTIC_KEY_SECRET);
  return { razorpay_payment_id: pay, razorpay_order_id: order, razorpay_signature: signature, contextToken };
}
const DONOR = {
  regime: 'domestic_inr', purpose: 'Test', purposeEn: 'Test', receipt80G: true, pan: 'ABCPV1234F', lang: 'hi',
  fullName: 'Asha Verma', email: 'asha@example.org', phone: '98765 43210', phoneDial: '91', countryCode: 'IN',
  state: 'Uttar Pradesh', district: 'Bahraich', city: 'Bahraich', postalCode: '271801', address: '12 Station Road',
};
const payment = (status, extra = {}) => ({ id: 'pay_A', order_id: 'order_A', amount: 10000, currency: 'INR', status, ...extra });

test('create-order asks Razorpay to capture automatically and sends the donor notes', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: { id: 'order_A' } }));
  try {
    const r = await call(createOrder, { ...DONOR, amount: 100 });
    assert.equal(r.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/v1/orders');
    assert.equal(calls[0].payload.payment_capture, true);
    assert.equal(calls[0].payload.amount, 10000);
    assert.equal(calls[0].payload.currency, 'INR');
  } finally { restore(); }
});

test('create-order stores one composed address, an E.164 phone, and at most 15 note keys', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: { id: 'order_A' } }));
  try {
    await call(createOrder, { ...DONOR, amount: 100 });
    const n = calls[0].payload.notes;
    assert.ok(Object.keys(n).length <= 15);
    assert.equal(n.donor_phone, '+919876543210');
    assert.equal(n.donor_cc, 'IN');
    assert.equal(n.receipt_address, '12 Station Road, Bahraich, Uttar Pradesh, PIN 271801, India');
    assert.ok(Object.values(n).every(v => String(v).length <= 256));
  } finally { restore(); }
});

test('create-order refuses blank or wrong donor details and never calls Razorpay', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: { id: 'order_A' } }));
  try {
    for (const patch of [{ fullName: '' }, { email: 'nope' }, { phone: '12345' }, { countryCode: 'ZZ' }, { state: 'Atlantis' }, { postalCode: '12' }, { pan: 'BAD' }, { amount: 0 }, { district: 'Gotham' }]) {
      const r = await call(createOrder, { ...DONOR, amount: 100, ...patch });
      assert.equal(r.status, 400, JSON.stringify(patch));
      assert.ok(r.body.fields || r.body.error, JSON.stringify(patch));
    }
    const blank = await call(createOrder, { regime: 'domestic_inr', amount: 100 });
    assert.equal(blank.status, 400);
    assert.equal(blank.body.fields.fullName, 'required');
    assert.equal(calls.length, 0);
  } finally { restore(); }
});

test('verify captures an authorized payment using the amount from the signed token', async () => {
  const calls = mockRazorpay((m, p) => p.endsWith('/capture') ? { status: 200, body: payment('captured') } : { status: 200, body: payment('authorized') });
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.status, 200);
    assert.equal(r.body.verified, true);
    const cap = calls.find(c => c.path.endsWith('/capture'));
    assert.ok(cap, 'capture was called');
    assert.deepEqual(cap.payload, { amount: 10000, currency: 'INR' });
  } finally { restore(); }
});

test('verify does not capture a payment that is already captured', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: payment('captured') }));
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.body.verified, true);
    assert.equal(calls.filter(c => c.path.endsWith('/capture')).length, 0);
  } finally { restore(); }
});

test('verify treats an "already captured" reply from Razorpay as success', async () => {
  mockRazorpay((m, p) => p.endsWith('/capture')
    ? { status: 400, body: { error: { description: 'This payment has already been captured' } } }
    : { status: 200, body: payment('authorized') });
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.status, 200);
    assert.equal(r.body.verified, true);
  } finally { restore(); }
});

test('verify fails, without capturing, on a bad signature', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: payment('authorized') }));
  try {
    const r = await call(verify, confirmation({ badSig: true }));
    assert.equal(r.status, 400);
    assert.equal(r.body.verified, false);
    assert.equal(calls.length, 0, 'no Razorpay call is made for an unsigned confirmation');
  } finally { restore(); }
});

test('verify fails, without capturing, when the paid amount differs from the signed amount', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: payment('authorized', { amount: 100 }) }));
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.status, 400);
    assert.equal(r.body.verified, false);
    assert.equal(calls.filter(c => c.path.endsWith('/capture')).length, 0);
  } finally { restore(); }
});

test('verify fails, without capturing, when the payment is linked to a different order', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: payment('authorized', { order_id: 'order_OTHER' }) }));
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.status, 400);
    assert.equal(calls.filter(c => c.path.endsWith('/capture')).length, 0);
  } finally { restore(); }
});

test('verify fails, without capturing, when the payment is neither authorized nor captured', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: payment('failed') }));
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.status, 400);
    assert.equal(r.body.verified, false);
    assert.equal(calls.filter(c => c.path.endsWith('/capture')).length, 0);
  } finally { restore(); }
});

test('verify reports failure when capture fails for another reason', async () => {
  mockRazorpay((m, p) => p.endsWith('/capture')
    ? { status: 400, body: { error: { description: 'Bank is down' } } }
    : { status: 200, body: payment('authorized') });
  try {
    const r = await call(verify, confirmation());
    assert.equal(r.status, 400);
    assert.equal(r.body.verified, false);
  } finally { restore(); }
});

test('verify rejects an expired confirmation without calling Razorpay', async () => {
  const calls = mockRazorpay(() => ({ status: 200, body: payment('authorized') }));
  try {
    const r = await call(verify, confirmation({ age: 2 * 60 * 60 * 1000 }));
    assert.equal(r.status, 400);
    assert.equal(calls.length, 0);
  } finally { restore(); }
});
