// Launch fail-safe. Reports which Razorpay mode the live site is in and whether receipts are ready, so a deploy
// cannot go out in Test Mode (or with receipts half set up) unnoticed. Returns no secrets, only yes/no and a mode name.
const { credentials, json } = require('../_razorpay');

function mode() {
  try {
    const { keyId } = credentials();
    if (keyId.startsWith('rzp_live_')) return 'live';
    if (keyId.startsWith('rzp_test_')) return 'test';
  } catch (_) {}
  return 'unconfigured';
}

function receiptsReady(env = process.env) {
  const store = Boolean((env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL) && (env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN));
  const mail = Boolean(env.RECEIPT_SMTP_HOST && env.RECEIPT_SMTP_USER && env.RECEIPT_SMTP_PASS && env.RECEIPT_FROM);
  return env.RECEIPTS_ENABLED === '1' && store && mail;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return json(res, 405, { error: 'Method not allowed' }); }
  json(res, 200, { mode: mode(), receipts: receiptsReady(), webhook: Boolean(process.env.RAZORPAY_DOMESTIC_WEBHOOK_SECRET) });
};
module.exports.receiptsReady = receiptsReady;
