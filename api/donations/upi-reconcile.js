// Finance-only. Receives UPI credits matched in the bank statement (code, UTR, amount, date) and issues the
// numbered 80G receipt for each, through the same code that issues Razorpay receipts. Protected by a shared token.
const { body, json, requirePost, same } = require('../_razorpay');
const { kvFromEnv } = require('../_kv');
const { isCode } = require('../_upi');
const { issueReceipt } = require('../_receipt/issue');
const { storeFromEnv } = require('../_receipt/store');
const { transportFromEnv } = require('../_receipt/mail');

const MAX_ITEMS = 200;
const deps = { kv: undefined, store: undefined, mailer: undefined, issue: issueReceipt };
function current() {
  if (deps.kv === undefined) deps.kv = kvFromEnv();
  if (deps.store === undefined) deps.store = storeFromEnv();
  if (deps.mailer === undefined) deps.mailer = transportFromEnv();
  return deps;
}
const log = line => console.log(JSON.stringify(Object.assign({ source: 'upi-reconcile' }, line)));

async function reconcileOne(item, d) {
  const code = String(item && item.code || '').toUpperCase();
  const utr = String(item && item.utr || '').trim();
  const amount = Math.round(Number(item && item.amountPaise));
  if (!isCode(code)) return { code, outcome: 'bad_code' };
  if (!/^[A-Za-z0-9]{6,35}$/.test(utr)) return { code, outcome: 'bad_utr' };
  if (!Number.isFinite(amount) || amount < 100) return { code, outcome: 'bad_amount' };
  const done = await d.kv.cmd(['GET', 'upi:done:' + code]);
  if (done) return { code, outcome: done === utr ? 'already_matched' : 'code_used_by_other_payment' };
  const raw = await d.kv.cmd(['GET', 'upi:pending:' + code]);
  if (!raw) return { code, outcome: 'unknown_code' };
  const pending = JSON.parse(raw);
  if (Number(pending.amountPaise) !== amount) return { code, outcome: 'amount_mismatch', expected: pending.amountPaise, received: amount };
  const when = Date.parse(item.date || '') ? Math.floor(Date.parse(item.date) / 1000) : Math.floor(Date.now() / 1000);
  const payment = { id: 'upi_' + utr, status: 'captured', currency: 'INR', amount, method: 'upi_qr', notes: pending.notes, created_at: when };
  const result = await d.issue({ payment, eventTime: when }, { store: d.store, mailer: d.mailer, log });
  if (['sent', 'already_sent', 'receipt_not_requested'].includes(result.outcome)) await d.kv.cmd(['SET', 'upi:done:' + code, utr]);
  return { code, outcome: result.outcome, receiptNo: result.receiptNo };
}

async function handler(req, res) {
  if (!requirePost(req, res)) return;
  const token = process.env.UPI_RECONCILE_TOKEN || '';
  const given = String((req.headers && req.headers.authorization) || '').replace(/^Bearer\s+/i, '');
  if (token.length < 32 || !same(given, token)) return json(res, 401, { error: 'Not authorised' });
  let input;
  try { input = body(req); } catch (_) { return json(res, 400, { error: 'Invalid request' }); }
  const items = Array.isArray(input.items) ? input.items : [];
  if (!items.length || items.length > MAX_ITEMS) return json(res, 400, { error: 'Send between 1 and ' + MAX_ITEMS + ' items' });
  const d = current();
  if (!d.kv || !d.store || !d.mailer) return json(res, 503, { error: 'Receipts are not configured' });
  const results = [];
  for (const item of items) {
    try { results.push(await reconcileOne(item, d)); } catch (error) { results.push({ code: item && item.code, outcome: 'error' }); }
  }
  for (const r of results) log({ event: 'reconciled', code: r.code, outcome: r.outcome, receipt: r.receiptNo || null });
  return json(res, 200, { results });
}

module.exports = handler;
module.exports._deps = deps;
module.exports.reconcileOne = reconcileOne;
