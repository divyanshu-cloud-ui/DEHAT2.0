const crypto = require('crypto');
const https = require('https');

function json(res, status, value) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(value));
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
}

function requirePost(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  json(res, 405, { error: 'Method not allowed' });
  return false;
}

function credentials() {
  const clientId = process.env.PAYPAL_FCRA_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_FCRA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('International PayPal credentials are not configured');
  return { clientId, clientSecret };
}

function host() {
  return process.env.PAYPAL_ENVIRONMENT === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
}

function request(path, method, headers, payload) {
  const data = payload == null ? '' : (typeof payload === 'string' ? payload : JSON.stringify(payload));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host(), path, method,
      headers: Object.assign({}, headers, data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      timeout: 15000,
    }, response => {
      let raw = '';
      response.on('data', chunk => { raw += chunk; });
      response.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(raw); } catch (_) {}
        if (response.statusCode >= 200 && response.statusCode < 300) return resolve(parsed);
        const detail = parsed.details && parsed.details[0] && parsed.details[0].description;
        reject(new Error(detail || parsed.message || 'PayPal request failed'));
      });
    });
    req.on('timeout', () => req.destroy(new Error('PayPal request timed out')));
    req.on('error', reject);
    req.end(data || undefined);
  });
}

async function accessToken() {
  const { clientId, clientSecret } = credentials();
  const basic = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  const token = await request('/v1/oauth2/token', 'POST', {
    Authorization: 'Basic ' + basic,
    'Content-Type': 'application/x-www-form-urlencoded',
  }, 'grant_type=client_credentials');
  if (!token.access_token) throw new Error('PayPal authentication failed');
  return token.access_token;
}

async function api(path, method = 'POST', payload, requestId) {
  const token = await accessToken();
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  if (requestId) headers['PayPal-Request-Id'] = requestId;
  return request(path, method, headers, payload);
}

function donation(input) {
  if (input.regime !== 'fcra_foreign') throw new Error('Only foreign contributions are accepted by this endpoint');
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 1 || amount > 1000000) throw new Error('Enter an amount between 1 and 1,000,000');
  const currency = String(input.currency || 'USD').toUpperCase();
  if (!['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'].includes(currency)) throw new Error('That currency is not enabled for international contributions');
  const fullName = String(input.fullName || '').trim();
  const email = String(input.email || '').trim();
  const country = String(input.country || '').trim();
  if (!fullName) throw new Error('Full name is required for an international contribution');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid email is required for an international contribution');
  if (!country) throw new Error('Country is required for an international contribution');
  return {
    amount: amount.toFixed(currency === 'JPY' ? 0 : 2), currency, fullName, email, country,
    idRef: String(input.idRef || '').trim().slice(0, 80),
    purpose: String(input.purpose || 'Unrestricted').trim().slice(0, 120),
    address: String(input.address || '').trim().slice(0, 240),
  };
}

function sign(value) {
  return crypto.createHmac('sha256', credentials().clientSecret).update(value).digest('base64url');
}

function contextToken(context) {
  const encoded = Buffer.from(JSON.stringify(context)).toString('base64url');
  return encoded + '.' + sign(encoded);
}

function readContext(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) throw new Error('Invalid payment context');
  const expected = Buffer.from(sign(parts[0]));
  const supplied = Buffer.from(parts[1]);
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) throw new Error('Invalid payment context');
  const value = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  if (!value.createdAt || Date.now() - value.createdAt > 60 * 60 * 1000) throw new Error('Payment context expired');
  return value;
}

module.exports = { api, body, contextToken, credentials, donation, json, readContext, requirePost };
