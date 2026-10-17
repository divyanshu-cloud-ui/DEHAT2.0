// Publishes OWNER-APPROVED statutory PDFs to the public Vercel Blob store and updates docs/manifest.json.
// Run by a person, never by the site build. The token is read from the environment and is never printed.
//   BLOB_READ_WRITE_TOKEN=... node tools/publish-docs.mjs --signoff <approved.json> [--library <folder>] [--dry-run]
// approved.json: { "approved": [ { "file": "02_FCRA/06_DEHAT_...pdf", "legacy_key": "assets/docs/fcra-renewal-certificate.pdf", "title": "..." } ] }
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DOCS_ORIGIN } from '../launch/config.mjs';

export const MAX_BYTES = 12 * 1024 * 1024;
const LEGACY = /^assets\/docs\/[A-Za-z0-9._-]+\.pdf$/;
const SAFE_NAME = /^[A-Za-z0-9._-]+\.pdf$/;
const FORBIDDEN = ['HOLD_NOT_FOR_PUBLICATION', 'Form_10BE', '10BE'];

export function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

// Returns the list of problems with an approval record; an empty list means it may be published.
export function approvalProblems(entry) {
  const problems = [];
  if (!entry || typeof entry !== 'object') return ['not an object'];
  if (typeof entry.file !== 'string' || !entry.file.endsWith('.pdf')) problems.push('file must be a .pdf path');
  else {
    if (entry.file.includes('..') || path.isAbsolute(entry.file)) problems.push('file must be a relative path inside the library');
    if (FORBIDDEN.some(word => entry.file.includes(word))) problems.push('file is in a held or privacy-restricted category');
    if (!SAFE_NAME.test(path.basename(entry.file))) problems.push('file name must be ASCII letters, digits, dot, dash and underscore');
  }
  if (entry.legacy_key !== null && entry.legacy_key !== undefined && !LEGACY.test(entry.legacy_key)) problems.push('legacy_key must look like assets/docs/<name>.pdf');
  return problems;
}

export function mergeManifest(existing, additions, now = new Date()) {
  const files = { ...((existing && existing.files) || {}) };
  for (const add of additions) if (add.legacyKey) files[add.legacyKey] = add.record;
  return { version: 1, updated: now.toISOString(), files };
}

export function recordFor({ name, title, bytes, hash, pages, now = new Date() }) {
  return { url: '/assets/docs/' + name, title: title || '', bytes, sha256: hash, pages: pages || null, published: now.toISOString() };
}

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }

async function fetchExistingManifest(fetchImpl = fetch) {
  // The store's CDN caches the manifest for 60 seconds; a unique query bypasses it, so two
  // publishes run back to back never rebuild the list from a stale copy and drop entries.
  const response = await fetchImpl(DOCS_ORIGIN + '/docs/manifest.json?fresh=' + Date.now(), { cache: 'no-store' });
  if (response.status === 404) return { version: 1, files: {} };
  if (!response.ok) throw new Error('Could not read the current manifest (HTTP ' + response.status + ')');
  return response.json();
}

export async function publish({ signoff, library, dryRun = false, put, fetchImpl = fetch, now = new Date() }) {
  const input = await readJson(signoff);
  const approved = Array.isArray(input.approved) ? input.approved : [];
  if (!approved.length) throw new Error('No approved documents in the sign-off file');
  const prepared = [];
  for (const entry of approved) {
    const problems = approvalProblems(entry);
    if (problems.length) throw new Error('Refused ' + (entry && entry.file) + ': ' + problems.join('; '));
    const bytes = await readFile(path.join(library, entry.file));
    if (bytes.length > MAX_BYTES) throw new Error('Refused ' + entry.file + ': larger than ' + MAX_BYTES + ' bytes');
    if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error('Refused ' + entry.file + ': not a PDF');
    const name = path.basename(entry.file);
    prepared.push({ entry, name, bytes, record: recordFor({ name, title: entry.title, bytes: bytes.length, hash: sha256(bytes), pages: entry.pages, now }), legacyKey: entry.legacy_key || null });
  }
  const names = prepared.map(p => p.name);
  if (new Set(names).size !== names.length) throw new Error('Two approved files share a name');
  if (dryRun) return { dryRun: true, files: prepared.map(p => ({ name: p.name, bytes: p.record.bytes, legacy_key: p.legacyKey })) };
  const existing = await fetchExistingManifest(fetchImpl);
  for (const p of prepared) {
    await put('docs/' + p.name, p.bytes, { access: 'public', contentType: 'application/pdf', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 3600 });
  }
  const manifest = mergeManifest(existing, prepared, now);
  await put('docs/manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)), { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  return { dryRun: false, published: prepared.length, total: Object.keys(manifest.files).length };
}

function arg(name) { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; }

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const signoff = arg('--signoff');
  const library = arg('--library') || path.resolve(process.env.HOME || '.', 'Downloads/DEHAT 2.0/DEHAT2.0_FRESH_CLONE/_internal/doc-library/PUBLIC_DOCUMENTS_v2');
  const dryRun = process.argv.includes('--dry-run');
  if (!signoff) { console.error('Usage: node tools/publish-docs.mjs --signoff <approved.json> [--library <folder>] [--dry-run]'); process.exit(2); }
  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) { console.error('BLOB_READ_WRITE_TOKEN is not set in this shell.'); process.exit(2); }
  const { put } = dryRun ? {} : await import('@vercel/blob');
  publish({ signoff, library, dryRun, put }).then(result => { console.log(JSON.stringify(result, null, 2)); }).catch(error => { console.error(String(error.message || error)); process.exit(1); });
}
