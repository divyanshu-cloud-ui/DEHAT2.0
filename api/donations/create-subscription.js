const { api, amountPaise, body, contextToken, credentials, json, notes, requirePost } = require('../_razorpay');

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;
  try {
    const input = body(req);
    if (!['monthly', 'yearly'].includes(input.frequency)) throw new Error('Unsupported recurring interval');
    const amount = amountPaise(input.amount);
    const period = input.frequency === 'monthly' ? 'monthly' : 'yearly';
    const fallbackCycles = period === 'monthly' ? 120 : 10;
    const configured = Number(process.env[period === 'monthly' ? 'RAZORPAY_SUBSCRIPTION_MONTHLY_CYCLES' : 'RAZORPAY_SUBSCRIPTION_YEARLY_CYCLES']);
    const totalCount = Number.isInteger(configured) && configured > 0 ? configured : fallbackCycles;
    const donorNotes = notes(input);
    const plan = await api('plans', {
      period, interval: 1,
      item: { name: 'DEHAT ' + period + ' domestic contribution', amount, currency: 'INR', description: donorNotes.purpose },
      notes: { payment_regime: 'domestic_inr', purpose: donorNotes.purpose },
    });
    const subscription = await api('subscriptions', {
      plan_id: plan.id, total_count: totalCount, quantity: 1,
      customer_notify: true, notes: donorNotes,
    });
    const token = contextToken({ kind: 'subscription', id: subscription.id, amount, currency: 'INR', createdAt: Date.now() });
    json(res, 200, { keyId: credentials().keyId, amount, currency: 'INR', subscriptionId: subscription.id, contextToken: token });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
