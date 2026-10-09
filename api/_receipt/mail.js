const nodemailer = require('nodemailer');
const { formatInr } = require('./format');
const { mailStrings } = require('./assets');

const LANGS = Object.keys(mailStrings);
// Every receipt is also copied (BCC, so the donor does not see it) to the organisation's finance and donations mailboxes.
const DEFAULT_BCC = 'finance@dehatindia.org,donate@dehatindia.org';

function validLang(value) { return LANGS.includes(String(value || '')) ? String(value) : 'en'; }

// Plain string replacement, no template engine.
function fill(template, values) {
  let out = String(template);
  for (const [key, value] of Object.entries(values)) out = out.split('{' + key + '}').join(value);
  return out;
}

function mailText(lang, receiptNo, amountPaise) {
  const strings = mailStrings[validLang(lang)] || mailStrings.en;
  const values = { receipt: receiptNo, amount: 'Rs ' + formatInr(amountPaise) };
  return { subject: fill(strings.receipt_mail_subject, values), text: fill(strings.receipt_mail_body, values) };
}

function transportFromEnv(env = process.env) {
  const host = env.RECEIPT_SMTP_HOST;
  const user = env.RECEIPT_SMTP_USER;
  const pass = env.RECEIPT_SMTP_PASS;
  const from = env.RECEIPT_FROM;
  if (!host || !user || !pass || !from) return null;
  const port = Number(env.RECEIPT_SMTP_PORT || 587);
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, connectionTimeout: 15000, socketTimeout: 20000 });
  return {
    async send(message) {
      const info = await transport.sendMail({ from, bcc: env.RECEIPT_BCC || DEFAULT_BCC, replyTo: env.RECEIPT_REPLY_TO || undefined, ...message });
      if (!info.accepted || !info.accepted.length) throw new Error('Mail server accepted no recipient');
      return info;
    },
  };
}

module.exports = { DEFAULT_BCC, fill, mailText, transportFromEnv, validLang };
