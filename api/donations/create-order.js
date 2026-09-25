const crypto = require('crypto');
const { api, amountPaise, body, contextToken, credentials, json, notes, requirePost } = require('../_razorpay');

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;
  try {
    const input = body(req);
    const amount = amountPaise(input.amount);
    const order = await api('orders', {
      amount, currency: 'INR', receipt: ('dehat_' + crypto.randomUUID()).slice(0, 40),
      notes: notes(input),
    });
    const token = contextToken({ kind: 'order', id: order.id, amount, currency: 'INR', createdAt: Date.now() });
    json(res, 200, { keyId: credentials().keyId, amount, currency: 'INR', orderId: order.id, contextToken: token });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
