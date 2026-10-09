// Builds the donation rows for Form 113 (statement of donations, Income-tax Act 2025; formerly Form 10BD) from Razorpay payments.
// Usage: node tools/form113-export.mjs --from 2026-04-01 --to 2026-06-30 [--type "Voluntary contribution"] [--out form113.csv]
// Needs RAZORPAY_DOMESTIC_KEY_ID and RAZORPAY_DOMESTIC_KEY_SECRET in the environment (never printed). Output holds donor PAN and names:
// keep the file on the finance computer and do not share or commit it.
import { writeFileSync } from 'node:fs';
import https from 'node:https';
import { pathToFileURL } from 'node:url';

export const COLUMNS = ['Serial number', 'Pre-ARN', 'ID code', 'Unique ID number of donor', 'Donor name', 'Donation type', 'Mode of receipt', 'Donation amount (INR)'];
export const DONATION_TYPES = ['Corpus', 'Voluntary contribution', 'Specific grant', 'CSR', 'Other'];
const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function plainNotes(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }

// Which payments belong in the statement, and why the others do not.
export function selectPayments(payments) {
  const included = []; const skipped = [];
  for (const p of payments) {
    const n = plainNotes(p.notes);
    const net = Number(p.amount) - Number(p.amount_refunded || 0);
    let why = null;
    if (p.status !== 'captured') why = 'not captured';
    else if (p.currency !== 'INR') why = 'not INR';
    else if (n.receipt_80g !== 'requested') why = 'no 80G receipt requested';
    else if (!PAN.test(String(n.pan || ''))) why = 'invalid or missing PAN';
    else if (!String(n.donor_name || '').trim()) why = 'missing donor name';
    else if (net <= 0) why = 'fully refunded';
    if (why) skipped.push({ id: p.id, why }); else included.push({ p, n, net });
  }
  return { included, skipped };
}

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCsv(payments, { type = 'Voluntary contribution' } = {}) {
  if (!DONATION_TYPES.includes(type)) throw new Error('Donation type must be one of: ' + DONATION_TYPES.join(', '));
  const { included, skipped } = selectPayments(payments);
  included.sort((a, b) => a.p.created_at - b.p.created_at);
  const rows = included.map(({ p, n, net }, i) => [i + 1, '', 'PAN', n.pan, n.donor_name.trim(), type, 'Electronic', (net / 100).toFixed(2)]);
  const csv = [COLUMNS, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
  return { csv, count: rows.length, totalPaise: included.reduce((s, x) => s + x.net, 0), skipped };
}

function razorpayGet(path, { keyId, keySecret }) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.razorpay.com', path: '/v1/' + path, method: 'GET', auth: keyId + ':' + keySecret, timeout: 20000 }, res => {
      let raw = ''; res.on('data', c => { raw += c; });
      res.on('end', () => { try { const j = JSON.parse(raw); if (res.statusCode >= 200 && res.statusCode < 300) resolve(j); else reject(new Error((j.error && j.error.description) || 'Razorpay request failed')); } catch (e) { reject(e); } });
    });
    req.on('timeout', () => req.destroy(new Error('Razorpay request timed out')));
    req.on('error', reject); req.end();
  });
}

export async function fetchPayments({ from, to }, creds, get = razorpayGet) {
  const start = Math.floor(Date.parse(from + 'T00:00:00+05:30') / 1000);
  const end = Math.floor(Date.parse(to + 'T23:59:59+05:30') / 1000);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) throw new Error('Use --from and --to as YYYY-MM-DD (India time), from on or before to');
  const all = [];
  for (let skip = 0; ; skip += 100) {
    const page = await get(`payments?from=${start}&to=${end}&count=100&skip=${skip}`, creds);
    all.push(...page.items);
    if (page.items.length < 100) break;
  }
  return all;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = name => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : undefined; };
  const keyId = process.env.RAZORPAY_DOMESTIC_KEY_ID; const keySecret = process.env.RAZORPAY_DOMESTIC_KEY_SECRET;
  if (!keyId || !keySecret || !arg('from') || !arg('to')) { console.error('Set RAZORPAY_DOMESTIC_KEY_ID and RAZORPAY_DOMESTIC_KEY_SECRET, and pass --from and --to (YYYY-MM-DD).'); process.exit(1); }
  const payments = await fetchPayments({ from: arg('from'), to: arg('to') }, { keyId, keySecret });
  const { csv, count, totalPaise, skipped } = toCsv(payments, { type: arg('type') || 'Voluntary contribution' });
  const out = arg('out') || `form113-${arg('from')}-to-${arg('to')}.csv`;
  writeFileSync(out, csv, { mode: 0o600 });
  console.log(`Wrote ${count} donations, total Rs ${(totalPaise / 100).toFixed(2)}, to ${out}`);
  console.log(`Skipped ${skipped.length} payments:`); for (const s of skipped) console.log(' ', s.id, s.why);
  console.log('Check each row, then upload on the e-filing portal (Form 113). The donation type applies to every row: change --type where rows differ.');
}
