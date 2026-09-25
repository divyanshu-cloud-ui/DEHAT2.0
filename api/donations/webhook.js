const { hmac, json, same } = require('../_razorpay');

module.exports = async function handler(req, res) {
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
  json(res, 200, { received: true });
};

module.exports.config = { api: { bodyParser: false } };
