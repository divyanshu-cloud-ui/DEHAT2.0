// Finance tool: reads the IDFC FIRST Bank statement or UPI merchant export (.csv or .xlsx), finds UPI credits that carry a DEHAT reference
// code (DHXXXXX) in the narration, and asks the website to issue the receipt for each. Writes a report CSV.
//   node tools/upi-reconcile.mjs --statement <file.csv|file.xlsx> [--dry-run] [--site https://dehatindia.org]
//   The live run needs UPI_RECONCILE_TOKEN in this shell (the same value as in Vercel). It is never printed.
//   To reach a protected preview deployment, also set VERCEL_AUTOMATION_BYPASS_SECRET (Vercel > Deployment Protection).
import { readFile, writeFile } from 'node:fs/promises';
import { xlsxRows } from './xlsx-rows.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { codeIn } = require('../backend/_upi.js');

// RFC 4180 CSV (quotes, commas and newlines inside quotes).
export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  const src = String(text).replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && src[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

const PICK = {
  narration: /narration|description|particulars|remarks|details|transaction\s*details/i,
  credit: /^(credit|deposit|cr\b|cr\s*amount|credit\s*amount|deposit\s*amount|amount\s*\(cr\)|transaction\s*amount)/i,
  status: /^(status|result)$/i,
  date: /^(value\s*date|transaction\s*date|txn\s*date|date|posting\s*date)/i,
  utr: /utr|ref(erence)?\s*(no|number)?|chq|cheque|rrn/i,
};

// Bank exports often start with account details; the header row is the first one naming a narration and a credit column.
export function findColumns(rows) {
  for (let h = 0; h < Math.min(rows.length, 40); h++) {
    const head = rows[h].map(c => String(c).trim());
    const col = key => head.findIndex(c => PICK[key].test(c));
    const narration = col('narration'), credit = col('credit');
    if (narration > -1 && credit > -1) return { header: h, narration, credit, date: col('date'), utr: col('utr'), status: head.reduce((a, c, i) => PICK.status.test(c) ? a.concat(i) : a, []) };
  }
  return null;
}

export function toPaise(value) {
  const clean = String(value || '').replace(/[,\s₹]|INR|Rs\.?/gi, '');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const two = n => String(n).padStart(2, '0');

// The receipt is dated from this, so it must not drift: statements give Indian wall-clock time without a zone
// (2026-10-15T22:00:57, 15/10/2026 22:00, 15-Oct-2026, or an Excel date number). Returns ISO with +05:30, or ''.
export function istDate(value) {
  const s = String(value || '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(s);
  let y, mo, d, h = 0, mi = 0, se = 0;
  if (m) {
    if (m[7]) return new Date(s).toISOString();
    [y, mo, d, h, mi, se] = [m[1], m[2], m[3], m[4] || 0, m[5] || 0, m[6] || 0].map(Number);
  } else if ((m = /^(\d{1,2})[\/.\- ]([A-Za-z]{3}|\d{1,2})[A-Za-z]*[\/.\- ](\d{2}|\d{4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?)?$/.exec(s))) {
    d = +m[1]; mo = MONTHS[m[2].toLowerCase()] || +m[2]; y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    h = +(m[4] || 0); mi = +(m[5] || 0); se = +(m[6] || 0);
    if (m[7]) h = (h % 12) + (/p/i.test(m[7]) ? 12 : 0);
  } else if (/^\d{5}(\.\d+)?$/.test(s)) {
    const t = new Date(Date.UTC(1899, 11, 30) + Math.round(Number(s) * 86400) * 1000);
    [y, mo, d, h, mi, se] = [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()];
  } else return '';
  if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && h < 24 && mi < 60 && se < 60)) return '';
  return y + '-' + two(mo) + '-' + two(d) + 'T' + two(h) + ':' + two(mi) + ':' + two(se) + '+05:30';
}

export function extractCredits(rows) {
  const cols = findColumns(rows);
  if (!cols) throw new Error('Could not find the narration and credit columns in this statement');
  const matched = [], unmatched = [];
  for (const r of rows.slice(cols.header + 1)) {
    const amountPaise = toPaise(r[cols.credit]);
    if (!amountPaise) continue; // debit rows and blanks
    // UPI merchant exports list failed and pending attempts too: only completed payments count.
    if (cols.status.some(i => /fail|pending|declin|revers|refund|timeout/i.test(String(r[i] || '')))) continue;
    const narration = String(r[cols.narration] || '');
    const code = codeIn(narration);
    const fromCol = cols.utr > -1 ? String(r[cols.utr] || '').replace(/\s/g, '') : '';
    const utr = /^[A-Za-z0-9]{6,35}$/.test(fromCol) ? fromCol : ((/\b(\d{12})\b/.exec(narration) || [])[1] || '');
    const row = { code, utr, amountPaise, date: cols.date > -1 ? istDate(r[cols.date]) : '', narration: narration.slice(0, 120) };
    // A receipt must carry the payment date, never today's by default: rows without a readable date are left for finance.
    (code && utr && row.date ? matched : unmatched).push(row);
  }
  return { matched, unmatched };
}

function csvLine(values) { return values.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(','); }

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };
  const file = arg('--statement');
  const site = arg('--site') || 'https://dehatindia.org';
  const dry = process.argv.includes('--dry-run');
  if (!file) { console.error('Usage: node tools/upi-reconcile.mjs --statement <file.csv|file.xlsx> [--dry-run]'); process.exit(2); }
  const rows = /\.xlsx$/i.test(file) ? xlsxRows(await readFile(file)) : parseCsv(await readFile(file, 'utf8'));
  const { matched, unmatched } = extractCredits(rows);
  let results = matched.map(m => ({ code: m.code, outcome: dry ? 'dry_run' : 'not_sent' }));
  if (!dry && matched.length) {
    const token = process.env.UPI_RECONCILE_TOKEN;
    if (!token) { console.error('UPI_RECONCILE_TOKEN is not set in this shell.'); process.exit(2); }
    const response = await fetch(site + '/api/donations/upi-reconcile', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {}),
      body: JSON.stringify({ items: matched.map(({ code, utr, amountPaise, date }) => ({ code, utr, amountPaise, date })) }),
    });
    const out = await response.json().catch(() => ({}));
    if (!response.ok) { console.error('The site refused the request: HTTP ' + response.status + ' ' + (out.error || '')); process.exit(1); }
    results = out.results;
  }
  const report = path.resolve('upi-reconcile-' + new Date().toISOString().slice(0, 10) + '.csv');
  const lines = [csvLine(['code', 'utr', 'amount_rupees', 'date', 'outcome', 'receipt', 'narration'])];
  matched.forEach((m, i) => lines.push(csvLine([m.code, m.utr, (m.amountPaise / 100).toFixed(2), m.date, (results[i] || {}).outcome, (results[i] || {}).receiptNo || '', m.narration])));
  unmatched.forEach(u => lines.push(csvLine([u.code || '', u.utr, (u.amountPaise / 100).toFixed(2), u.date, !u.code ? 'no_code' : !u.utr ? 'no_utr' : 'no_date', '', u.narration])));
  await writeFile(report, lines.join('\n') + '\n');
  const tally = {};
  results.forEach(r => { tally[r.outcome] = (tally[r.outcome] || 0) + 1; });
  console.log(JSON.stringify({ matched: matched.length, unmatched_credits: unmatched.length, outcomes: tally, report }, null, 2));
}
