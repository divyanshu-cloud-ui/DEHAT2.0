const { api, body, credentials, hmac, json, readContext, requirePost, same } = require('../_razorpay');

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;
  try {
    const input = body(req);
    const paymentId = String(input.razorpay_payment_id || '');
    const orderId = String(input.razorpay_order_id || '');
    const subscriptionId = String(input.razorpay_subscription_id || '');
    const signature = String(input.razorpay_signature || '');
    const context = readContext(input.contextToken);
    if (!paymentId || !signature) throw new Error('Incomplete payment confirmation');
    if (context.kind === 'order' && orderId !== context.id) throw new Error('Order confirmation mismatch');
    if (context.kind === 'subscription' && subscriptionId !== context.id) throw new Error('Subscription confirmation mismatch');
    const signedPayload = context.kind === 'order' ? context.id + '|' + paymentId : paymentId + '|' + context.id;
    const expected = hmac(signedPayload, credentials().keySecret);
    if (!same(expected, signature)) return json(res, 400, { verified: false, error: 'Invalid payment signature' });
    const payment = await api('payments/' + encodeURIComponent(paymentId), null, 'GET');
    if (payment.currency !== context.currency || Number(payment.amount) !== Number(context.amount)) throw new Error('Payment amount or currency mismatch');
    if (context.kind === 'order' && payment.order_id !== context.id) throw new Error('Payment is not linked to this order');
    if (context.kind === 'subscription' && payment.subscription_id !== context.id) throw new Error('Payment is not linked to this subscription');
    if (!['authorized', 'captured'].includes(payment.status)) throw new Error('Payment is not authorized');
    json(res, 200, { verified: true, paymentId });
  } catch (error) {
    json(res, 400, { verified: false, error: error.message });
  }
};
