// The homepage and impact stat tiles and the Our Work total hard-code the audited social-investment
// total so they paint with the snapshot. This keeps them equal to the ledger in finance-data.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

test('hard-coded social investment total matches the audited ledger', async () => {
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(await readFile('finance-data.js', 'utf8'), ctx);
  const total = Math.round(ctx.FIN.flows('received').reduce((a, x) => a + (+x.amt || 0), 0));
  const source = await readFile('DEHAT.dc.html', 'utf8');
  const literal = source.match(/const socialInvestmentTotalRaw = '₹([\d,]+)'/)[1];
  assert.equal(Number(literal.replace(/,/g, '')), total, 'socialInvestmentTotalRaw');
  const crore = (total / 1e7).toFixed(2);
  const tiles = [...source.matchAll(/\{ to: ([\d.]+), dec: 2, comma: false, suffix: ' Cr', prefix: '\\u20b9',[^}]*label: T\.(stat_invested|stat_lbl_investment)\b/g)];
  assert.equal(tiles.length, 2);
  for (const t of tiles) assert.equal(t[1], crore, t[2]);
});

test('the "years of audited accounts" tile matches the ledger', async () => {
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(await readFile('finance-data.js', 'utf8'), ctx);
  const years = ctx.FIN.YEARS.length;
  const source = await readFile('DEHAT.dc.html', 'utf8');
  const tile = source.match(/\{ to: (\d+), dec: 0, comma: false, suffix: '', prefix: '', color: '#4F0E73', label: T\.stat_lbl_years \}/);
  assert.ok(tile, 'years tile not found');
  assert.equal(Number(tile[1]), years);
});

test('the year-by-year lens covers every audited year and matches the ledger', async () => {
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(await readFile('finance-data.js', 'utf8'), ctx);
  const {YEARLY, YEAR_WORK} = await import('../impact-lenses.js');
  const byFy = {};
  for (const f of ctx.FIN.flows('received')) byFy[f.fy] = (byFy[f.fy] || 0) + (+f.amt || 0);
  assert.equal(YEARLY.length, ctx.FIN.YEARS.length, 'one lens row per audited year');
  let cumulative = 0;
  for (const row of YEARLY) {
    assert.equal(row.received, Math.round(byFy[row.fy]), row.fy);
    cumulative += row.received;
    assert.equal(row.cumulative, cumulative, row.fy + ' cumulative');
    assert.ok(YEAR_WORK[parseInt(row.fy, 10)], row.fy + ' has running/begun counts');
  }
});
