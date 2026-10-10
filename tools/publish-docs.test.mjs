import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { approvalProblems, mergeManifest, publish, recordFor, sha256 } from './publish-docs.mjs';
import { buildRoutes } from '../launch/edge.mjs';
import { DOCS_ORIGIN } from '../launch/config.mjs';

const pdf = Buffer.from('%PDF-1.7\n1 0 obj<<>>endobj\n%%EOF\n');

async function fixture(entries) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'docs-'));
  await mkdir(path.join(dir, '02_FCRA'), { recursive: true });
  await writeFile(path.join(dir, '02_FCRA', '06_DEHAT_FCRA_Return.pdf'), pdf);
  await writeFile(path.join(dir, 'signoff.json'), JSON.stringify({ approved: entries }));
  return dir;
}

test('approvalProblems refuses held, unsafe and malformed entries', () => {
  assert.deepEqual(approvalProblems({ file: '02_FCRA/06_DEHAT_FCRA_Return.pdf', legacy_key: 'assets/docs/fcra.pdf' }), []);
  assert.ok(approvalProblems({ file: 'HOLD_NOT_FOR_PUBLICATION/x.pdf' }).length);
  assert.ok(approvalProblems({ file: '03_INCOME_TAX/Form_10BE_ACC.pdf' }).length);
  assert.ok(approvalProblems({ file: '../secret.pdf' }).length);
  assert.ok(approvalProblems({ file: '02_FCRA/with space.pdf' }).length);
  assert.ok(approvalProblems({ file: '02_FCRA/a.txt' }).length);
  assert.ok(approvalProblems({ file: '02_FCRA/a.pdf', legacy_key: 'https://evil.example/a.pdf' }).length);
});

test('mergeManifest adds by legacy key and keeps earlier entries', () => {
  const now = new Date('2026-10-10T12:00:00Z');
  const first = mergeManifest({ version: 1, files: { 'assets/docs/old.pdf': { url: '/assets/docs/old.pdf' } } }, [{ legacyKey: 'assets/docs/new.pdf', record: recordFor({ name: 'new.pdf', bytes: 3, hash: 'h', now }) }], now);
  assert.deepEqual(Object.keys(first.files).sort(), ['assets/docs/new.pdf', 'assets/docs/old.pdf']);
  assert.equal(first.files['assets/docs/new.pdf'].url, '/assets/docs/new.pdf');
  assert.equal(first.updated, '2026-10-10T12:00:00.000Z');
});

test('dry run reads and validates but uploads nothing', async () => {
  const dir = await fixture([{ file: '02_FCRA/06_DEHAT_FCRA_Return.pdf', legacy_key: 'assets/docs/fcra-renewal-certificate.pdf' }]);
  const result = await publish({ signoff: path.join(dir, 'signoff.json'), library: dir, dryRun: true, put: () => { throw new Error('must not upload'); } });
  assert.equal(result.dryRun, true);
  assert.equal(result.files[0].name, '06_DEHAT_FCRA_Return.pdf');
});

test('publish uploads each file, then writes the manifest', async () => {
  const dir = await fixture([{ file: '02_FCRA/06_DEHAT_FCRA_Return.pdf', legacy_key: 'assets/docs/fcra-renewal-certificate.pdf', title: 'FCRA return' }]);
  const calls = [];
  const put = async (name, body, options) => { calls.push({ name, options, size: body.length }); };
  const fetchImpl = async () => ({ status: 404, ok: false });
  const result = await publish({ signoff: path.join(dir, 'signoff.json'), library: dir, put, fetchImpl, now: new Date('2026-10-10T00:00:00Z') });
  assert.equal(result.published, 1);
  assert.deepEqual(calls.map(c => c.name), ['docs/06_DEHAT_FCRA_Return.pdf', 'docs/manifest.json']);
  assert.equal(calls[0].options.access, 'public');
  assert.equal(calls[0].options.allowOverwrite, true);
  assert.equal(sha256(pdf).length, 64);
});

test('a refused entry stops the whole run before any upload', async () => {
  const dir = await fixture([{ file: '02_FCRA/06_DEHAT_FCRA_Return.pdf' }, { file: 'HOLD_NOT_FOR_PUBLICATION/x.pdf' }]);
  let uploaded = false;
  await assert.rejects(publish({ signoff: path.join(dir, 'signoff.json'), library: dir, put: async () => { uploaded = true; }, fetchImpl: async () => ({ status: 404, ok: false }) }), /Refused/);
  assert.equal(uploaded, false);
});

test('edge routes proxy /assets/docs to the Blob store and keep the manifest short-lived', () => {
  const routes = buildRoutes({ mode: 'preview', origin: 'https://dehatindia.org', redirects: [], routes: [], publishedPaths: new Set(), files: [], apis: [] });
  const proxy = routes.find(r => r.src === '^/assets/docs/(.+)$');
  assert.equal(proxy.dest, DOCS_ORIGIN + '/docs/$1');
  const manifestRule = routes.find(r => r.src === '^/assets/docs/manifest\\.json$');
  assert.match(manifestRule.headers['Cache-Control'], /max-age=300/);
  assert.ok(routes.indexOf(manifestRule) > routes.findIndex(r => r.src === '^/assets/.*$'));
  assert.ok(routes.indexOf(proxy) < routes.findIndex(r => r.handle === 'filesystem'));
});
