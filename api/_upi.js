// UPI QR gifts into DEHAT's domestic IDFC FIRST Bank account (no gateway). Pure helpers, no I/O.
// The reference code travels in the UPI payment note; the reconciliation tool finds it in the bank statement.
const crypto = require('crypto');

const UPI_VPA = 'dehat0684@idfcbank';
const UPI_PAYEE = 'DEHAT';
const UPI_MAX_PAISE = 100000 * 100; // one UPI payment to a merchant is normally capped at Rs 1,00,000
const PENDING_TTL_SECONDS = 45 * 24 * 60 * 60;
// No 0/O, 1/I/L: a donor may read the code aloud or retype it.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
// Letters and digits only: UPI apps refuse a hyphen or other symbols in the payment note.
const CODE = /^DH[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/;

function makeCode(random = crypto.randomBytes) {
  const bytes = random(5);
  let out = '';
  for (let i = 0; i < 5; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return 'DH' + out;
}

function isCode(value) { return CODE.test(String(value || '')); }

// Payers who type the note by hand sometimes add a hyphen or a space, or change the case; all are recognised.
function codeIn(text) {
  const m = /(?<![A-Z0-9])DH[-\s]?([ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5})(?![A-Z0-9])/i.exec(String(text || '').toUpperCase());
  return m ? 'DH' + m[1] : null;
}

function upiUri({ amountPaise, code, vpa = UPI_VPA, payee = UPI_PAYEE }) {
  const am = (Number(amountPaise) / 100).toFixed(2);
  return 'upi://pay?pa=' + encodeURIComponent(vpa) + '&pn=' + encodeURIComponent(payee) + '&am=' + am + '&cu=INR&tn=' + encodeURIComponent(code);
}

module.exports = { ALPHABET, PENDING_TTL_SECONDS, UPI_MAX_PAISE, UPI_PAYEE, UPI_VPA, codeIn, isCode, makeCode, upiUri };
