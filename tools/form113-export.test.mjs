import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv, selectPayments, fetchPayments, COLUMNS } from './form113-export.mjs';

const base = { status: 'captured', currency: 'INR', amount: 100000, created_at: 1791500000 };
const mk = (id, notes, extra = {}) => ({ ...base, id, notes: { receipt_80g: 'requested', pan: 'ABCDE1234F', donor_name: 'Test Donor', ...notes }, ...extra });

test('only captured INR payments with a valid PAN and an 80G request are included', () => {
  const { included, skipped } = selectPayments([
    mk('p1', {}), mk('p2', { receipt_80g: 'not_requested' }), mk('p3', { pan: 'BAD' }), mk('p4', {}, { status: 'authorized' }),
    mk('p5', {}, { currency: 'USD' }), mk('p6', {}, { amount_refunded: 100000 }), mk('p7', { donor_name: ' ' }), { ...mk('p8', {}), notes: [] },
  ]);
  assert.deepEqual(included.map(x => x.p.id), ['p1']);
  assert.equal(skipped.length, 7);
});
test('csv has the Form 113 columns, ordered serials, net of partial refunds, quoted names', () => {
  const { csv, count, totalPaise } = toCsv([
    mk('b', { donor_name: 'Doe, "J"' }, { created_at: 1791500500, amount: 250050 }),
    mk('a', {}, { created_at: 1791500000, amount: 100000, amount_refunded: 40000 }),
  ]);
  const lines = csv.trim().split('\r\n');
  assert.equal(lines[0], COLUMNS.join(','));
  assert.equal(lines[1], '1,,PAN,ABCDE1234F,Test Donor,Voluntary contribution,Electronic,600.00');
  assert.equal(lines[2], '2,,PAN,ABCDE1234F,"Doe, ""J""",Voluntary contribution,Electronic,2500.50');
  assert.equal(count, 2); assert.equal(totalPaise, 60000 + 250050);
});
test('donation type must be one of the portal values', () => {
  assert.throws(() => toCsv([], { type: 'Gift' }), /Donation type/);
  assert.match(toCsv([mk('x', {})], { type: 'Corpus' }).csv, /,Corpus,Electronic,/);
});
test('fetch pages through 100 at a time and uses India-time day bounds', async () => {
  const calls = [];
  const get = async path => { calls.push(path); const skip = Number(/skip=(\d+)/.exec(path)[1]); return { items: Array.from({ length: skip === 0 ? 100 : 5 }, (_, i) => ({ id: 'p' + skip + i })) }; };
  const items = await fetchPayments({ from: '2026-04-01', to: '2026-06-30' }, { keyId: 'k', keySecret: 's' }, get);
  assert.equal(items.length, 105); assert.equal(calls.length, 2);
  assert.match(calls[0], new RegExp('from=' + Math.floor(Date.parse('2026-04-01T00:00:00+05:30') / 1000)));
  await assert.rejects(() => fetchPayments({ from: '2026-06-30', to: '2026-04-01' }, {}, get), /from on or before to/);
});
