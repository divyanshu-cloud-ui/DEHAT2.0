const { api, hmac, json, same } = require('../_razorpay');
const { issueReceipt } = require('../_receipt/issue');
const { storeFromEnv } = require('../_receipt/store');
const { transportFromEnv } = require('../_receipt/mail');

// Tests replace these; production builds them from the environment on first use.
const deps = { store: undefined, mailer: undefined };
function currentDeps() {
  if (deps.store === undefined) deps.store = storeFromEnv();
  if (deps.mailer === undefined) deps.mailer = transportFromEnv();
  return { store: deps.store, mailer: deps.mailer, fetchOrder: id => api('orders/' + encodeURIComponent(id), null, 'GET'), log: line => console.log(JSON.stringify(Object.assign({ source: 'razorpay-receipts' }, line))) };
}

async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const secret = process.env.RAZORPAY_DOMESTIC_WEBHOOK_SECRET;
  if (!secret) return json(res, 503, { error: 'Webhook secret is not configured' });
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks);
  const signature = req.headers['x-razorpay-signature'];
  if (!same(hmac(raw, secret), signature)) return json(res, 400, { error: 'Invalid webhook signature' });
  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }); }
  console.log(JSON.stringify({ source: 'razorpay-domestic', event: event.event, created_at: event.created_at }));
  // Receipts are switched on with RECEIPTS_ENABLED=1 once the store and mailbox are configured.
  if (event.event === 'payment.captured' && process.env.RECEIPTS_ENABLED === '1') {
    const payment = event.payload && event.payload.payment && event.payload.payment.entity;
    const result = await issueReceipt({ payment, eventTime: event.created_at }, currentDeps());
    return json(res, result.status, { received: true, receipt: result.outcome });
  }
  json(res, 200, { received: true });
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports._deps = deps;
