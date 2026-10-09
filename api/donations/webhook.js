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
  if (!same(hmac(raw, secret), signature)) {
    // Diagnostic only: no secret, signature value or body content is logged.
    console.log(JSON.stringify({ source: 'razorpay-domestic', rejected: 'invalid_signature', has_signature: Boolean(signature), body_bytes: raw.length, secret_chars: secret.length }));
    return json(res, 400, { error: 'Invalid webhook signature' });
  }
  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }); }
  console.log(JSON.stringify({ source: 'razorpay-domestic', event: event.event, created_at: event.created_at }));
  // Receipts are switched on with RECEIPTS_ENABLED=1 once the store and mailbox are configured.
  const entities = (event.payload && event.payload) || {};
  const payment = entities.payment && entities.payment.entity;
  const subscription = entities.subscription && entities.subscription.entity;
  if ((event.event === 'payment.captured' || event.event === 'subscription.charged') && process.env.RECEIPTS_ENABLED === '1') {
    // subscription.charged is the event that carries the donor's details for monthly and yearly gifts.
    const result = await issueReceipt({ payment, eventTime: event.created_at, subscriptionNotes: event.event === 'subscription.charged' && subscription ? subscription.notes : undefined }, currentDeps());
    // Diagnostic only, no personal data: why a receipt was not issued for this event.
    if (result.outcome !== 'sent') {
      const subNotes = subscription && subscription.notes && typeof subscription.notes === 'object' ? subscription.notes : {};
      console.log(JSON.stringify({ source: 'razorpay-receipts', event: 'receipt_outcome', trigger: event.event, outcome: result.outcome, payment: payment && payment.id, payment_status: payment && payment.status, has_invoice: Boolean(payment && payment.invoice_id), has_subscription: Boolean(subscription), pay_note_keys: payment && payment.notes && typeof payment.notes === 'object' ? Object.keys(payment.notes).join(',').slice(0, 200) : null, pay_regime: payment && payment.notes && payment.notes.payment_regime || null, sub_regime: subNotes.payment_regime || null, sub_note_keys: Object.keys(subNotes).length, sub_receipt_flag: subNotes.receipt_80g || null }));
    }
    return json(res, result.status, { received: true, receipt: result.outcome });
  }
  // A recurring gift that stops (card failed, retries used up, donor cancelled) is logged by id only, so the team can follow it up.
  if (/^subscription\.(pending|halted|cancelled|completed|paused)$/.test(String(event.event))) {
    console.log(JSON.stringify({ source: 'razorpay-subscriptions', event: event.event, subscription: subscription && subscription.id }));
  }
  json(res, 200, { received: true });
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports._deps = deps;
