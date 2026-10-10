// Finance tool: reads the IDFC FIRST Bank statement (CSV export), finds UPI credits that carry a DEHAT reference
// code (DH-XXXXX) in the narration, and asks the website to issue the receipt for each. Writes a report CSV.
//   node tools/upi-reconcile.mjs --statement <file.csv> [--dry-run] [--site https://dehatindia.org]
//   The live run needs UPI_RECONCILE_TOKEN in this shell (the same value as in Vercel). It is never printed.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { codeIn } = require('../api/_upi.js');

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
  credit: /^(credit|deposit|cr\b|cr\s*amount|credit\s*amount|deposit\s*amount|amount\s*\(cr\))/i,
  date: /^(value\s*date|transaction\s*date|txn\s*date|date|posting\s*date)/i,
  utr: /utr|ref(erence)?\s*(no|number)?|chq|cheque|rrn/i,
};

// Bank exports often start with account details; the header row is the first one naming a narration and a credit column.
export function findColumns(rows) {
  for (let h = 0; h < Math.min(rows.length, 40); h++) {
    const head = rows[h].map(c => String(c).trim());
    const col = key => head.findIndex(c => PICK[key].test(c));
    const narration = col('narration'), credit = col('credit');
    if (narration > -1 && credit > -1) return { header: h, narration, credit, date: col('date'), utr: col('utr') };
  }
  return null;
}

export function toPaise(value) {
  const clean = String(value || '').replace(/[,\s₹]|INR|Rs\.?/gi, '');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

export function extractCredits(rows) {
  const cols = findColumns(rows);
  if (!cols) throw new Error('Could not find the narration and credit columns in this statement');
  const matched = [], unmatched = [];
  for (const r of rows.slice(cols.header + 1)) {
    const amountPaise = toPaise(r[cols.credit]);
    if (!amountPaise) continue; // debit rows and blanks
    const narration = String(r[cols.narration] || '');
    const code = codeIn(narration);
    const fromCol = cols.utr > -1 ? String(r[cols.utr] || '').replace(/\s/g, '') : '';
    const utr = /^[A-Za-z0-9]{6,35}$/.test(fromCol) ? fromCol : ((/\b(\d{12})\b/.exec(narration) || [])[1] || '');
    const row = { code, utr, amountPaise, date: cols.date > -1 ? String(r[cols.date] || '').trim() : '', narration: narration.slice(0, 120) };
    (code && utr ? matched : unmatched).push(row);
  }
  return { matched, unmatched };
}

function csvLine(values) { return values.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(','); }

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };
  const file = arg('--statement');
  const site = arg('--site') || 'https://dehatindia.org';
  const dry = process.argv.includes('--dry-run');
  if (!file) { console.error('Usage: node tools/upi-reconcile.mjs --statement <file.csv> [--dry-run]'); process.exit(2); }
  const { matched, unmatched } = extractCredits(parseCsv(await readFile(file, 'utf8')));
  let results = matched.map(m => ({ code: m.code, outcome: dry ? 'dry_run' : 'not_sent' }));
  if (!dry && matched.length) {
    const token = process.env.UPI_RECONCILE_TOKEN;
    if (!token) { console.error('UPI_RECONCILE_TOKEN is not set in this shell.'); process.exit(2); }
    const response = await fetch(site + '/api/donations/upi-reconcile', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ items: matched.map(({ code, utr, amountPaise, date }) => ({ code, utr, amountPaise, date })) }),
    });
    const out = await response.json().catch(() => ({}));
    if (!response.ok) { console.error('The site refused the request: HTTP ' + response.status + ' ' + (out.error || '')); process.exit(1); }
    results = out.results;
  }
  const report = path.resolve('upi-reconcile-' + new Date().toISOString().slice(0, 10) + '.csv');
  const lines = [csvLine(['code', 'utr', 'amount_rupees', 'date', 'outcome', 'receipt', 'narration'])];
  matched.forEach((m, i) => lines.push(csvLine([m.code, m.utr, (m.amountPaise / 100).toFixed(2), m.date, (results[i] || {}).outcome, (results[i] || {}).receiptNo || '', m.narration])));
  unmatched.forEach(u => lines.push(csvLine([u.code || '', u.utr, (u.amountPaise / 100).toFixed(2), u.date, u.code ? 'no_utr' : 'no_code', '', u.narration])));
  await writeFile(report, lines.join('\n') + '\n');
  const tally = {};
  results.forEach(r => { tally[r.outcome] = (tally[r.outcome] || 0) + 1; });
  console.log(JSON.stringify({ matched: matched.length, unmatched_credits: unmatched.length, outcomes: tally, report }, null, 2));
}
