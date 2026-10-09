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

const { validateDonor } = require('../assets/geo/validate.mjs');
const GEO = require('../assets/geo/geo.v1.json');
const DISTRICTS = require('../assets/geo/in-districts.v1.json');

class ValidationError extends Error {
  constructor(fields) { super('Please check the highlighted fields'); this.name = 'ValidationError'; this.fields = fields; }
}

// Razorpay allows at most 15 note keys and 256 characters per value, so the address is stored once, already composed.
function composeAddress(c, countryName) {
  const tail = [c.city, c.district && c.district !== c.city ? c.district : '', c.state, c.postalCode ? 'PIN ' + c.postalCode : '', countryName].filter(Boolean).join(', ');
  const room = Math.max(10, 250 - tail.length - 2);
  return (c.address ? c.address.slice(0, room) + ', ' : '') + tail;
}

function notes(input) {
  if (input.regime !== 'domestic_inr') throw new Error('Only domestic INR payments are accepted by this endpoint');
  const wants80G = Boolean(input.receipt80G);
  const result = validateDonor({
    fullName: input.fullName, email: input.email, phone: input.phone, phoneDial: input.phoneDial,
    countryCode: input.countryCode, state: input.state, district: input.district, districtOther: input.districtOther,
    city: input.city, postalCode: input.postalCode, address: input.address, pan: input.pan, receipt80G: wants80G,
    amount: input.amount, frequency: input.frequency,
  }, { geo: GEO, districts: DISTRICTS });
  if (!result.ok) throw new ValidationError(result.errors);
  const c = result.clean;
  const countryName = (GEO.countries.find(row => row[0] === c.countryCode) || [])[1] || c.countryCode;
  return {
    payment_regime: 'domestic_inr',
    purpose: String(input.purpose || 'Unrestricted').slice(0, 240),
    purpose_en: String(input.purposeEn || '').slice(0, 120),
    receipt_80g: wants80G ? 'requested' : 'not_requested',
    pan: wants80G ? c.pan : '',
    receipt_address: composeAddress(c, countryName),
    donor_name: c.fullName,
    donor_email: c.email,
    donor_phone: c.phoneE164,
    donor_cc: c.countryCode,
    publish_name: input.anonymous ? 'no' : 'yes',
    donor_lang: /^[a-z]{2,3}$/.test(String(input.lang || '')) ? String(input.lang) : 'en',
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

function isAlreadyCaptured(error) { return /already captured|payment has been captured|already been captured/i.test(String(error && error.message || error)); }
async function captureAuthorizedPayment(paymentId, amount, currency) { try { return await api('payments/' + encodeURIComponent(paymentId) + '/capture', { amount, currency }); } catch (error) { if (isAlreadyCaptured(error)) return { status: 'captured' }; throw error; } }
module.exports = { ValidationError, api, amountPaise, body, captureAuthorizedPayment, contextToken, credentials, hmac, isAlreadyCaptured, json, notes, readContext, requirePost, same };
