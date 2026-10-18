// Turns a captured Razorpay payment into a numbered 80G receipt, once, and emails it.
// No personal data is ever logged: log lines carry the payment id, receipt number and an error class only.
const { financialYear, receiptDate } = require('./format');
const { buildReceiptPdf } = require('./pdf');
const { mailText, validLang } = require('./mail');

const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const EMAIL = /^\S+@\S+\.\S+$/;

function plainNotes(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }

function eligibility(payment, notes) {
  if (!payment || !payment.id) return 'no_payment';
  if (payment.status !== 'captured') return 'not_captured';
  if (payment.currency !== 'INR') return 'not_inr';
  if (notes.payment_regime !== 'domestic_inr') return 'not_domestic';
  if (notes.receipt_80g !== 'requested') return 'receipt_not_requested';
  if (!PAN.test(String(notes.pan || ''))) return 'invalid_pan';
  if (!EMAIL.test(String(notes.donor_email || '').trim())) return 'invalid_email';
  if (!String(notes.donor_name || '').trim()) return 'missing_name';
  if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) < 100) return 'invalid_amount';
  return null;
}

// The PDF is English with a Latin-script font: use the English purpose, or the stored text only when it is plain Latin.
function englishPurpose(notes) {
  const en = String(notes.purpose_en || '').trim();
  if (en) return en;
  const raw = String(notes.purpose || '').trim();
  return /^[\u0020-\u007e\u00a0-\u00ff\u2013\u2018\u2019]+$/.test(raw) && raw ? raw : 'Wherever it is needed most';
}

function addressLine(notes) {
  // Orders from the current form carry one composed address; older orders carry the parts separately.
  if (notes.donor_cc) return String(notes.receipt_address || '').trim();
  const parts = [notes.receipt_address, notes.donor_city, notes.donor_state, notes.donor_postal_code && 'PIN ' + notes.donor_postal_code, notes.donor_country]
    .map(v => String(v || '').trim()).filter(Boolean);
  return parts.join(', ');
}

/**
 * deps: { store, mailer, fetchOrder?(orderId), log(line) }
 * Returns { status, outcome } where status is the HTTP status the webhook should answer with.
 * 5xx means "try again" (Razorpay retries for about 24 hours); 200 means handled or nothing to do.
 */
async function issueReceipt({ payment, eventTime, subscriptionNotes }, deps) {
  const { store, mailer, log } = deps;
  let notes = plainNotes(payment && payment.notes);
  // A recurring charge carries an empty payment 'notes'; the donor's details are on the subscription (subscription.charged event).
  // The subscription's notes win; the payment's own notes (which may be partial) only fill gaps.
  if (subscriptionNotes) notes = Object.assign({}, notes, plainNotes(subscriptionNotes));
  const recurring = Boolean(subscriptionNotes || (payment && payment.invoice_id));
  if (payment && payment.order_id && !payment.invoice_id && !notes.receipt_80g && deps.fetchOrder) {
    try { notes = plainNotes((await deps.fetchOrder(payment.order_id)).notes); } catch (_) { return { status: 503, outcome: 'order_lookup_failed' }; }
  }
  const skip = eligibility(payment, notes);
  if (skip) {
    if (skip !== 'receipt_not_requested' && skip !== 'not_domestic') log({ event: 'receipt_skipped', payment: payment && payment.id, reason: skip });
    return { status: 200, outcome: skip };
  }
  if (!store || !mailer) { log({ event: 'receipt_not_configured', payment: payment.id, store: Boolean(store), mailer: Boolean(mailer) }); return { status: 503, outcome: 'not_configured' }; }

  const paymentId = payment.id;
  let receiptNo = null;
  let locked = false;
  try {
    if (await store.isSent(paymentId)) return { status: 200, outcome: 'already_sent' };
    locked = await store.lock(paymentId);
    if (!locked) return { status: 503, outcome: 'in_progress' };
    const when = Number(eventTime) || Number(payment.created_at) || Math.floor(Date.now() / 1000);
    receiptNo = await store.number(paymentId, financialYear(when));
    const { bytes } = await buildReceiptPdf({
      receiptNo, receivedOn: receiptDate(when), paymentId, method: payment.method,
      purpose: englishPurpose(notes), recurring, amountPaise: Number(payment.amount),
      donorName: notes.donor_name, donorAddress: addressLine(notes), donorPan: notes.pan, donorEmail: notes.donor_email,
    });
    const { subject, text } = mailText(validLang(notes.donor_lang), receiptNo, Number(payment.amount));
    await mailer.send({
      to: String(notes.donor_email).trim(), subject, text,
      attachments: [{ filename: 'DEHAT-80G-receipt-' + receiptNo.replace(/\//g, '-').replace('DEHAT-80G-', '') + '.pdf', content: Buffer.from(bytes), contentType: 'application/pdf' }],
    });
    await store.markSent(paymentId);
    log({ event: 'receipt_sent', payment: paymentId, receipt: receiptNo });
    return { status: 200, outcome: 'sent', receiptNo };
  } catch (error) {
    log({ event: 'receipt_failed', payment: paymentId, receipt: receiptNo, error: String(error && error.name || 'Error') });
    return { status: 503, outcome: 'failed', receiptNo };
  } finally {
    if (locked) { try { await store.unlock(paymentId); } catch (_) {} }
  }
}

module.exports = { addressLine, englishPurpose, eligibility, issueReceipt };
