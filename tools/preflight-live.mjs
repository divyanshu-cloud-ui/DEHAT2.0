// Run against the live site before and after switching Razorpay to Live:  node tools/preflight-live.mjs https://dehatindia.org
// Exit code 0 only when every check passes. It sends no real payment and needs no secrets.
import { pathToFileURL } from 'node:url';

export async function runPreflight(origin, fetchImpl = fetch) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail });
  const call = async (path, init) => { try { const r = await fetchImpl(origin + path, { redirect: 'manual', ...init }); let body = null; try { body = await r.json(); } catch (_) {} return { status: r.status, body }; } catch (e) { return { status: 0, body: null, error: String(e.message || e) }; } };

  const st = await call('/api/donations/status');
  add('status endpoint answers', st.status === 200, 'HTTP ' + st.status);
  add('Razorpay is in LIVE mode (not test)', st.body && st.body.mode === 'live', 'mode = ' + (st.body && st.body.mode));
  add('webhook secret is set', st.body && st.body.webhook === true, String(st.body && st.body.webhook));
  add('receipts are ready (store, mailbox, switch)', st.body && st.body.receipts === true, String(st.body && st.body.receipts));
  const hook = await call('/api/donations/webhook', { method: 'POST', headers: { 'x-razorpay-signature': 'bad' }, body: '{}' });
  add('webhook rejects an unsigned request', hook.status === 400, 'HTTP ' + hook.status);
  const blank = await call('/api/donations/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ regime: 'domestic_inr', amount: 10 }) });
  add('order endpoint refuses a blank donor form', blank.status === 400 && blank.body && blank.body.fields && blank.body.fields.fullName === 'required', 'HTTP ' + blank.status);
  const get = await call('/api/donations/create-order');
  add('order endpoint refuses GET', get.status === 405, 'HTTP ' + get.status);
  const pp = await call('/api/paypal/config');
  add('PayPal endpoints are gone', pp.status === 404, 'HTTP ' + pp.status);
  return { ok: checks.every(c => c.ok), checks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const origin = (process.argv[2] || 'https://dehatindia.org').replace(/\/$/, '');
  const { ok, checks } = await runPreflight(origin);
  for (const c of checks) console.log((c.ok ? 'PASS ' : 'FAIL ') + c.name + '  [' + c.detail + ']');
  console.log(ok ? '\nAll checks passed.' : '\nNOT READY: fix the FAIL lines above.');
  process.exit(ok ? 0 : 1);
}
