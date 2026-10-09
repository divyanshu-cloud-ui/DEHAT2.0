import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
const require = createRequire(import.meta.url);
const fmt = require('../api/_receipt/format.js');
const { memoryStore, upstashStore } = require('../api/_receipt/store.js');
const { buildReceiptPdf } = require('../api/_receipt/pdf.js');
const { issueReceipt } = require('../api/_receipt/issue.js');
const mail = require('../api/_receipt/mail.js');
const { PDFDocument } = require('pdf-lib');

const notes = { payment_regime: 'domestic_inr', receipt_80g: 'requested', pan: 'ABCDE1234F', donor_name: 'Test Donor', donor_email: 'test.donor@example.com', receipt_address: '12 Sample Road', donor_city: 'Sample City', donor_state: 'Uttar Pradesh', donor_postal_code: '226001', donor_country: 'India', purpose: 'Wherever It Is Needed Most', donor_lang: 'hi' };
const pay = (id = 'pay_1', extra = {}) => ({ id, status: 'captured', currency: 'INR', amount: 100000, method: 'card', created_at: 1791500000, notes, ...extra });
function rig(over = {}) {
  const sent = []; const logs = [];
  const mailer = { async send(m) { if (over.fail) throw new Error('smtp down'); sent.push(m); } };
  return { sent, logs, deps: { store: over.store || memoryStore(), mailer, log: l => logs.push(l) } };
}

test('amount in words', () => {
  assert.equal(fmt.amountInWords(100), 'Rupees One Only');
  assert.equal(fmt.amountInWords(10000), 'Rupees One Hundred Only');
  assert.equal(fmt.amountInWords(250000), 'Rupees Two Thousand Five Hundred Only');
  assert.equal(fmt.amountInWords(10000000), 'Rupees One Lakh Only');
  assert.equal(fmt.amountInWords(1000000000), 'Rupees One Crore Only');
  assert.equal(fmt.amountInWords(10050), 'Rupees One Hundred and Fifty Paise Only');
  assert.equal(fmt.formatInr(12345678), '1,23,456.78');
  assert.equal(fmt.formatInr(100000), '1,000.00');
});
test('financial year rolls over at 1 April IST', () => {
  const t = iso => Date.parse(iso) / 1000;
  assert.equal(fmt.financialYear(t('2027-03-31T23:59:00+05:30')), '2026-27');
  assert.equal(fmt.financialYear(t('2027-04-01T00:01:00+05:30')), '2027-28');
  assert.equal(fmt.financialYear(t('2027-03-31T18:31:00Z')), '2027-28'); // 00:01 IST
});
test('sequence is consecutive, per FY, reused for the same payment', async () => {
  const s = memoryStore();
  assert.equal(await s.number('a', '2026-27'), 'DEHAT/80G/2026-27/000001');
  assert.equal(await s.number('b', '2026-27'), 'DEHAT/80G/2026-27/000002');
  assert.equal(await s.number('a', '2026-27'), 'DEHAT/80G/2026-27/000001');
  assert.equal(await s.number('c', '2027-28'), 'DEHAT/80G/2027-28/000001');
});
test('upstash store uses INCR once and NX set', async () => {
  const db = new Map(); const calls = [];
  const fetchImpl = async (u, o) => { const a = JSON.parse(o.body); calls.push(a[0]); let r = null;
    if (a[0] === 'GET') r = db.get(a[1]) ?? null; if (a[0] === 'INCR') { r = (db.get(a[1]) || 0) + 1; db.set(a[1], r); }
    if (a[0] === 'SET') { if (a.includes('NX') && db.has(a[1])) r = null; else { db.set(a[1], a[2]); r = 'OK'; } }
    return { ok: true, json: async () => ({ result: r }) }; };
  const s = upstashStore({ url: 'https://x', token: 't', fetchImpl });
  assert.equal(await s.number('p', '2026-27'), 'DEHAT/80G/2026-27/000001');
  assert.equal(await s.number('p', '2026-27'), 'DEHAT/80G/2026-27/000001');
  assert.equal(calls.filter(c => c === 'INCR').length, 1);
});
test('purpose in the PDF is English even when the donor paid from a Hindi page', async () => {
  const { englishPurpose } = require('../api/_receipt/issue.js');
  assert.equal(englishPurpose({ purpose: '\u0905\u092d\u0940', purpose_en: 'Wherever It Is Needed Most' }), 'Wherever It Is Needed Most');
  assert.equal(englishPurpose({ purpose: '\u0905\u092d\u0940' }), 'Wherever it is needed most');
  assert.equal(englishPurpose({ purpose: 'Girls Education' }), 'Girls Education');
});
test('receipt wording follows the Income-tax Act, 2025', () => {
  const src = require('fs').readFileSync(new URL('../api/_receipt/pdf.js', import.meta.url), 'utf8');
  assert.match(src, /section 133 of the Income-tax Act, 2025/);
  assert.match(src, /earlier section 80G/);
  assert.doesNotMatch(src, /exemption u\/s 80G/);
});
test('PDF names the communication address as well as the registered office', async () => {
  const src = require('fs').readFileSync(new URL('../api/_receipt/pdf.js', import.meta.url), 'utf8');
  assert.match(src, /Communication Address \(Head Office\)/);
  assert.match(src, /Huzoorpur Marg, Bahraich, Uttar Pradesh, PIN 271801/);
});
test('PDF: one page, text, seal and logo embedded', async () => {
  const { bytes, contentBottom, footerTop } = await buildReceiptPdf({ receiptNo: 'DEHAT/80G/2026-27/000001', receivedOn: '9 Oct 2026', paymentId: 'pay_1', method: 'card', purpose: 'Wherever It Is Needed Most', amountPaise: 100000, donorName: 'Test Donor '.repeat(8), donorAddress: 'A very long address, '.repeat(6), donorPan: 'ABCDE1234F', donorEmail: 'test.donor@example.com' });
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  assert.ok(contentBottom > footerTop, 'content must not reach the footer');
  assert.ok(Buffer.from(bytes).toString('latin1').includes('/Subtype /Image'));
  assert.ok(Buffer.from(bytes).length < 900000);
});
test('sends once, to donor with finance and donate on BCC default', async () => {
  const r = rig();
  const first = await issueReceipt({ payment: pay(), eventTime: 1791500000 }, r.deps);
  const second = await issueReceipt({ payment: pay(), eventTime: 1791500000 }, r.deps);
  assert.equal(first.status, 200); assert.equal(second.outcome, 'already_sent');
  assert.equal(r.sent.length, 1);
  assert.equal(r.sent[0].to, 'test.donor@example.com');
  assert.equal(r.sent[0].attachments[0].contentType, 'application/pdf');
  assert.match(r.sent[0].subject, /DEHAT\/80G\/2026-27\/000001/);
  assert.equal(mail.DEFAULT_BCC, 'finance@dehatindia.org,donate@dehatindia.org');
  assert.ok(!JSON.stringify(r.logs).includes('ABCDE1234F') && !JSON.stringify(r.logs).includes('test.donor'));
});
test('Hindi mail text is chosen from donor_lang', () => {
  assert.notEqual(mail.mailText('hi', 'R1', 100000).subject, mail.mailText('en', 'R1', 100000).subject);
  assert.equal(mail.mailText('zz', 'R1', 100000).subject, mail.mailText('en', 'R1', 100000).subject);
  assert.match(mail.mailText('en', 'R1', 123456).text, /Rs 1,234\.56/);
  const en = mail.mailText('en', 'DEHAT/80G/2026-27/000001', 100000);
  assert.equal(en.text.split('DEHAT/80G/2026-27/000001').length - 1, 1);
  assert.match(en.text, /Love and Peace/);
  assert.equal(mail.DEFAULT_REPLY_TO, 'joinus@dehatindia.org');
});
test('nothing issued when not eligible', async () => {
  for (const [p, why] of [[pay('p2', { notes: { ...notes, receipt_80g: 'not_requested' } }), 'receipt_not_requested'], [pay('p3', { notes: { ...notes, pan: 'BAD' } }), 'invalid_pan'], [pay('p4', { notes: { ...notes, donor_email: 'x' } }), 'invalid_email'], [pay('p5', { status: 'authorized' }), 'not_captured']]) {
    const r = rig(); const out = await issueReceipt({ payment: p }, r.deps);
    assert.equal(out.outcome, why); assert.equal(out.status, 200); assert.equal(r.sent.length, 0);
  }
});
test('mail failure answers 503 and the retry reuses the number', async () => {
  const store = memoryStore();
  const bad = rig({ fail: true, store });
  const a = await issueReceipt({ payment: pay(), eventTime: 1791500000 }, bad.deps);
  assert.equal(a.status, 503);
  const good = rig({ store });
  const b = await issueReceipt({ payment: pay(), eventTime: 1791500000 }, good.deps);
  assert.equal(b.status, 200); assert.equal(b.receiptNo, a.receiptNo); assert.equal(good.sent.length, 1);
});
test('webhook: bad signature issues nothing; good one sends', async () => {
  process.env.RAZORPAY_DOMESTIC_KEY_ID = 'k'; process.env.RAZORPAY_DOMESTIC_KEY_SECRET = 's';
  process.env.RAZORPAY_DOMESTIC_WEBHOOK_SECRET = 'whsec'; process.env.RECEIPTS_ENABLED = '1';
  const handler = require('../api/donations/webhook.js');
  const r = rig(); handler._deps.store = r.deps.store; handler._deps.mailer = r.deps.mailer;
  const body = JSON.stringify({ event: 'payment.captured', created_at: 1791500000, payload: { payment: { entity: pay('pay_w') } } });
  const call = async sig => { const res = { setHeader() {}, end(b) { this.body = b; } }; const req = { method: 'POST', headers: { 'x-razorpay-signature': sig }, async *[Symbol.asyncIterator]() { yield Buffer.from(body); } }; await handler(req, res); return res; };
  assert.equal((await call('bad')).statusCode, 400); assert.equal(r.sent.length, 0);
  const ok = await call(crypto.createHmac('sha256', 'whsec').update(body).digest('hex'));
  assert.equal(ok.statusCode, 200); assert.equal(r.sent.length, 1);
});
