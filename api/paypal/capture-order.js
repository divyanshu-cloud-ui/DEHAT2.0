const crypto = require('crypto');
const { api, body, json, readContext, requirePost } = require('../_paypal');

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;
  try {
    const input = body(req);
    const orderId = String(input.orderId || '');
    if (!/^[A-Z0-9]+$/.test(orderId)) throw new Error('Invalid PayPal order');
    const context = readContext(input.contextToken);
    const referenceId = crypto.createHash('sha256').update(String(input.contextToken)).digest('hex').slice(0, 32);
    const captured = await api('/v2/checkout/orders/' + orderId + '/capture', 'POST', {}, orderId + '-capture');
    const unit = captured.purchase_units && captured.purchase_units[0];
    const capture = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
    if (captured.status !== 'COMPLETED' || !capture || capture.status !== 'COMPLETED') throw new Error('PayPal payment was not completed');
    if (!unit || unit.reference_id !== referenceId) throw new Error('PayPal payment reference did not match');
    if (!capture.amount || capture.amount.currency_code !== context.currency || capture.amount.value !== context.amount) throw new Error('PayPal payment amount did not match');
    // A durable donation ledger and receipt mailer must consume the verified data after deployment.
    console.log(JSON.stringify({ source: 'paypal-fcra', orderId, captureId: capture.id, amount: context.amount, currency: context.currency, purpose: context.purpose, donorEmail: context.email, donorCountry: context.country }));
    return json(res, 200, { verified: true, orderId, captureId: capture.id, status: capture.status });
  } catch (error) {
    return json(res, 400, { error: error.message || 'Unable to capture PayPal payment' });
  }
};
