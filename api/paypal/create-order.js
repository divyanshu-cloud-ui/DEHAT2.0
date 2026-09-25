const crypto = require('crypto');
const { api, body, contextToken, donation, json, requirePost } = require('../_paypal');

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;
  try {
    const details = donation(body(req));
    const context = Object.assign({ createdAt: Date.now() }, details);
    const token = contextToken(context);
    const referenceId = crypto.createHash('sha256').update(token).digest('hex').slice(0, 32);
    const order = await api('/v2/checkout/orders', 'POST', {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: referenceId,
        description: ('FCRA contribution: ' + details.purpose).slice(0, 127),
        custom_id: referenceId,
        amount: { currency_code: details.currency, value: details.amount },
      }],
      payer: { email_address: details.email },
      application_context: { brand_name: 'DEHAT', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
    }, referenceId);
    return json(res, 200, { orderId: order.id, contextToken: token });
  } catch (error) {
    return json(res, 400, { error: error.message || 'Unable to prepare PayPal payment' });
  }
};
