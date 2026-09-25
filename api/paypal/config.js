const { credentials, json } = require('../_paypal');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }
  try {
    const { clientId } = credentials();
    return json(res, 200, {
      clientId,
      environment: process.env.PAYPAL_ENVIRONMENT === 'live' ? 'live' : 'sandbox',
    });
  } catch (error) {
    return json(res, 500, { error: error.message || 'PayPal is not configured' });
  }
};
