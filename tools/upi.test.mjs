import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { parseCsv, findColumns, extractCredits, toPaise } from './upi-reconcile.mjs';
const require = createRequire(import.meta.url);
const { codeIn, isCode, makeCode, upiUri, UPI_MAX_PAISE } = require('../api/_upi.js');
const { memoryKv } = require('../api/_kv.js');
const intent = require('../api/donations/upi-intent.js');
const reconcile = require('../api/donations/upi-reconcile.js');

function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } }; return r; }
const donor = { regime: 'domestic_inr', frequency: 'once', amount: 500, purpose: 'Wherever It Is Needed Most', purposeEn: 'Wherever It Is Needed Most', receipt80G: true, pan: 'AAAPV1234K',
  fullName: 'Asha Verma', email: 'asha@example.org', phone: '9876543210', phoneDial: '91', countryCode: 'IN', state: 'Uttar Pradesh', district: 'Bahraich', city: 'Bahraich', postalCode: '271801', address: 'Main Road', lang: 'en' };

test('codes use the unambiguous alphabet and are found in bank narrations', () => {
  for (let i = 0; i < 50; i++) assert.ok(isCode(makeCode()));
  assert.equal(isCode('DHABCD0'), false);
  assert.equal(codeIn('UPI/412345678901/DH7K2QX/asha@okaxis'), 'DH7K2QX');
  assert.equal(codeIn('upi/412345678901/dh7k2qx/x'), 'DH7K2QX');
  assert.equal(codeIn('UPI/412345678901/no code here'), null);
  // The note is letters and digits only (UPI apps refuse a hyphen); a hand-typed hyphen or space is still recognised.
  assert.equal(isCode('DH-7K2QX'), false);
  assert.equal(codeIn('UPI/412345678901/DH-7K2QX/asha@okaxis'), 'DH7K2QX');
  assert.equal(codeIn('DH TESTA'), 'DHTESTA');
  assert.equal(codeIn('SIDH7K2QX'), null);
});

test('IDFC merchant export: Transaction Amount and RRN columns, failed attempts skipped', () => {
  const csv = 'Transaction ID,Order ID,RRN,Transaction Type,Date & Time,Transaction Amount,Status,Remarks,Payer VPA\n'
    + 'T1,,512345678901,PAY,15/10/2026 21:40,500.00,Completed,DH7K2QX,a@okaxis\n'
    + 'T2,,512345678902,PAY,15/10/2026 21:41,500.00,Failed,DH7K2QY,a@okaxis\n'
    + 'T3,,512345678903,PAY,15/10/2026 21:42,1.00,Completed,DH TESTA,a@okaxis\n'
    + 'T4,,512345678904,PAY,15/10/2026 21:43,51.00,Completed,Payment from PhonePe,b@ybl\n';
  const { matched, unmatched } = extractCredits(parseCsv(csv));
  assert.deepEqual(matched.map(m => [m.code, m.utr, m.amountPaise]), [['DH7K2QX', '512345678901', 50000], ['DHTESTA', '512345678903', 100]]);
  assert.equal(unmatched.length, 1);
});

test('the UPI link carries the amount, the payee and the code', () => {
  const uri = upiUri({ amountPaise: 50000, code: 'DH7K2QX' });
  assert.equal(uri, 'upi://pay?pa=dehat0684%40idfcbank&pn=DEHAT&am=500.00&cu=INR&tn=DH7K2QX');
});

test('statement parsing finds the header after bank preamble and pairs codes with UTRs', () => {
  const csv = 'Account Statement\nAccount No,XXXX1234\n\nTransaction Date,Value Date,Particulars,Cheque/Ref No,Debit,Credit,Balance\n'
    + '01/10/2026,01/10/2026,"UPI/412345678901/DH7K2QX/asha@okaxis",412345678901,,"500.00","10,500.00"\n'
    + '01/10/2026,01/10/2026,UPI/412345678902/no ref,412345678902,,1000.00,11500.00\n'
    + '02/10/2026,02/10/2026,NEFT charges,,50.00,,11450.00\n';
  const rows = parseCsv(csv);
  const cols = findColumns(rows);
  assert.equal(cols.header, 2);
  const { matched, unmatched } = extractCredits(rows);
  assert.deepEqual(matched.map(m => [m.code, m.utr, m.amountPaise]), [['DH7K2QX', '412345678901', 50000]]);
  assert.equal(unmatched.length, 1);
  assert.equal(toPaise('1,00,000.50'), 10000050);
});

test('intent: refuses monthly gifts, bad forms and amounts over the UPI limit', async () => {
  intent._deps.kv = memoryKv();
  let r = res(); await intent({ method: 'POST', headers: {}, body: { ...donor, frequency: 'monthly' } }, r);
  assert.equal(r.statusCode, 400); assert.equal(JSON.parse(r.body).fields.amount, 'upi_once_only');
  r = res(); await intent({ method: 'POST', headers: {}, body: { ...donor, fullName: '' } }, r);
  assert.equal(r.statusCode, 400); assert.ok(JSON.parse(r.body).fields.fullName);
  r = res(); await intent({ method: 'POST', headers: {}, body: { ...donor, amount: UPI_MAX_PAISE / 100 + 1 } }, r);
  assert.equal(JSON.parse(r.body).fields.amount, 'upi_limit');
  r = res(); await intent({ method: 'GET', headers: {} }, r);
  assert.equal(r.statusCode, 405);
});

test('intent: creates a pending record and returns a QR for the exact amount', async () => {
  const kv = memoryKv();
  intent._deps.kv = kv; intent._deps.makeCode = () => 'DH7K2QX';
  const r = res(); await intent({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.9' }, body: donor }, r);
  assert.equal(r.statusCode, 200);
  const out = JSON.parse(r.body);
  assert.equal(out.code, 'DH7K2QX'); assert.equal(out.amount, 50000); assert.match(out.qr, /^data:image\/svg\+xml;base64,/);
  assert.match(out.uri, /tn=DH7K2QX$/);
  const saved = JSON.parse(kv.data.get('upi:pending:DH7K2QX'));
  assert.equal(saved.amountPaise, 50000); assert.equal(saved.notes.receipt_80g, 'requested'); assert.equal(saved.notes.pan, 'AAAPV1234K');
});

test('reconcile: needs the token, then matches, refuses mismatches and never double-issues', async () => {
  const kv = memoryKv();
  kv.data.set('upi:pending:DH7K2QX', JSON.stringify({ notes: { payment_regime: 'domestic_inr', receipt_80g: 'requested' }, amountPaise: 50000 }));
  const issued = [];
  reconcile._deps.kv = kv; reconcile._deps.store = {}; reconcile._deps.mailer = {};
  reconcile._deps.issue = async ({ payment }) => { issued.push(payment); return { outcome: 'sent', receiptNo: 'DEHAT/80G/2026-27/000099' }; };
  process.env.UPI_RECONCILE_TOKEN = 'x'.repeat(40);
  let r = res(); await reconcile({ method: 'POST', headers: { authorization: 'Bearer wrong' }, body: { items: [] } }, r);
  assert.equal(r.statusCode, 401);
  const auth = { authorization: 'Bearer ' + 'x'.repeat(40) };
  r = res(); await reconcile({ method: 'POST', headers: auth, body: { items: [
    { code: 'DH7K2QX', utr: '412345678901', amountPaise: 40000 },
    { code: 'DHZZZZZ', utr: '412345678909', amountPaise: 50000 },
  ] } }, r);
  assert.deepEqual(JSON.parse(r.body).results.map(x => x.outcome), ['amount_mismatch', 'unknown_code']);
  r = res(); await reconcile({ method: 'POST', headers: auth, body: { items: [{ code: 'DH7K2QX', utr: '412345678901', amountPaise: 50000, date: '2026-10-01' }] } }, r);
  assert.equal(JSON.parse(r.body).results[0].receiptNo, 'DEHAT/80G/2026-27/000099');
  assert.equal(issued[0].id, 'upi_412345678901'); assert.equal(issued[0].method, 'upi_qr');
  r = res(); await reconcile({ method: 'POST', headers: auth, body: { items: [{ code: 'DH7K2QX', utr: '412345678901', amountPaise: 50000 }] } }, r);
  assert.equal(JSON.parse(r.body).results[0].outcome, 'already_matched');
  assert.equal(issued.length, 1);
  delete process.env.UPI_RECONCILE_TOKEN;
});
