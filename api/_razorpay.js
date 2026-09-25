const crypto = require('crypto');
const https = require('https');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function requirePost(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  json(res, 405, { error: 'Method not allowed' });
  return false;
}

function credentials() {
  const keyId = process.env.RAZORPAY_DOMESTIC_KEY_ID;
  const keySecret = process.env.RAZORPAY_DOMESTIC_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Domestic payment credentials are not configured');
  return { keyId, keySecret };
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
}

function amountPaise(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 1 || amount > 10000000) throw new Error('Enter an amount between INR 1 and INR 1,00,00,000');
  return Math.round(amount * 100);
}

function notes(input) {
  if (input.regime !== 'domestic_inr') throw new Error('Only domestic INR payments are accepted by this endpoint');
  const wants80G = Boolean(input.receipt80G);
  const pan = String(input.pan || '').trim().toUpperCase();
  if (wants80G && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) throw new Error('A valid PAN is required for an 80G receipt');
  if (wants80G && !String(input.fullName || '').trim()) throw new Error('Full name is required for an 80G receipt');
  if (wants80G && !/^\S+@\S+\.\S+$/.test(String(input.email || '').trim())) throw new Error('A valid email is required for an 80G receipt');
  if (wants80G && !String(input.address || '').trim()) throw new Error('Address is required for an 80G receipt');
  return {
    payment_regime: 'domestic_inr',
    purpose: String(input.purpose || 'Unrestricted').slice(0, 240),
    receipt_80g: wants80G ? 'requested' : 'not_requested',
    pan: wants80G ? pan : '',
    receipt_address: String(input.address || '').slice(0, 240),
    donor_name: String(input.fullName || '').slice(0, 120),
    donor_email: String(input.email || '').slice(0, 120),
    donor_phone: String(input.phone || '').slice(0, 40),
    donor_city: String(input.city || '').slice(0, 80),
    donor_state: String(input.state || '').slice(0, 80),
    donor_postal_code: String(input.postalCode || '').slice(0, 20),
    donor_country: String(input.country || 'India').slice(0, 80),
    publish_name: input.anonymous ? 'no' : 'yes',
  };
}

function api(path, payload, method = 'POST') {
  const { keyId, keySecret } = credentials();
  const data = payload == null ? '' : JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.razorpay.com', path: '/v1/' + path, method,
      auth: keyId + ':' + keySecret,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 15000,
    }, response => {
      let raw = '';
      response.on('data', chunk => { raw += chunk; });
      response.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(raw); } catch (_) {}
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(parsed);
        else reject(new Error((parsed.error && parsed.error.description) || 'Razorpay request failed'));
      });
    });
    request.on('timeout', () => request.destroy(new Error('Razorpay request timed out')));
    request.on('error', reject);
    request.end(data || undefined);
  });
}

function hmac(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function same(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function contextToken(context) {
  const encoded = Buffer.from(JSON.stringify(context)).toString('base64url');
  return encoded + '.' + hmac(encoded, credentials().keySecret);
}

function readContext(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2 || !same(hmac(parts[0], credentials().keySecret), parts[1])) throw new Error('Invalid payment context');
  const parsed = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  if (!parsed.createdAt || Date.now() - parsed.createdAt > 60 * 60 * 1000) throw new Error('Payment context expired');
  return parsed;
}

module.exports = { api, amountPaise, body, contextToken, credentials, hmac, json, notes, readContext, requirePost, same };
