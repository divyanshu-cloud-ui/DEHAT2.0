// Creates a one-time UPI QR for a donor who has filled the form: a reference code, a pending record and the QR itself.
// The money goes straight to DEHAT's domestic bank account; the receipt follows when the statement is reconciled.
const QRCode = require('qrcode');
const { amountPaise, body, json, notes, requirePost } = require('../_razorpay');
const { kvFromEnv } = require('../_kv');
const { PENDING_TTL_SECONDS, UPI_MAX_PAISE, UPI_PAYEE, UPI_VPA, makeCode, upiUri } = require('../_upi');

const RATE_LIMIT = 30; // per address per hour

const deps = { kv: undefined, makeCode, now: () => new Date() };
function currentKv() { if (deps.kv === undefined) deps.kv = kvFromEnv(); return deps.kv; }

function clientAddress(req) {
  const forwarded = String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim();
  return forwarded || (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function handler(req, res) {
  if (!requirePost(req, res)) return;
  let input;
  try { input = body(req); } catch (_) { return json(res, 400, { error: 'Invalid request' }); }
  if (input.frequency && input.frequency !== 'once') return json(res, 400, { error: 'UPI QR is for one-time gifts', fields: { amount: 'upi_once_only' } });
  let donorNotes, amount;
  try {
    donorNotes = notes(Object.assign({}, input, { frequency: 'once' }));
    amount = amountPaise(input.amount);
  } catch (error) {
    return json(res, 400, error.fields ? { error: error.message, fields: error.fields } : { error: error.message });
  }
  if (amount > UPI_MAX_PAISE) return json(res, 400, { error: 'Amount above the UPI limit', fields: { amount: 'upi_limit' } });
  const kv = currentKv();
  if (!kv) return json(res, 503, { error: 'UPI QR is not available right now' });
  try {
    const rateKey = 'upi:rl:' + clientAddress(req);
    const count = await kv.cmd(['INCR', rateKey]);
    if (Number(count) === 1) await kv.cmd(['EXPIRE', rateKey, '3600']);
    if (Number(count) > RATE_LIMIT) return json(res, 429, { error: 'Too many requests. Please try again later.' });
    const record = JSON.stringify({ notes: donorNotes, amountPaise: amount, created: deps.now().toISOString() });
    let code = null;
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const candidate = deps.makeCode();
      if ((await kv.cmd(['SET', 'upi:pending:' + candidate, record, 'NX', 'EX', String(PENDING_TTL_SECONDS)])) === 'OK') code = candidate;
    }
    if (!code) return json(res, 503, { error: 'UPI QR is not available right now' });
    const uri = upiUri({ amountPaise: amount, code });
    const svg = await QRCode.toString(uri, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
    console.log(JSON.stringify({ source: 'upi', event: 'intent_created', code }));
    return json(res, 200, { code, amount, vpa: UPI_VPA, payee: UPI_PAYEE, uri, qr: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') });
  } catch (error) {
    console.log(JSON.stringify({ source: 'upi', event: 'intent_failed', error: String(error && error.name || 'Error') }));
    return json(res, 503, { error: 'UPI QR is not available right now' });
  }
}

module.exports = handler;
module.exports._deps = deps;
