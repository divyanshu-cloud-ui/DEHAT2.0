import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('domestic checkout cannot display success without server verification', () => {
  const source = readFileSync(new URL('../DEHAT.dc.html', import.meta.url), 'utf8');
  const start = source.indexOf('  async _pay(P) {');
  const end = source.indexOf('  async _payUpi(P) {', start);
  assert.ok(start >= 0 && end > start, 'checkout handler exists');
  const checkout = source.slice(start, end);
  const proofCheck = checkout.indexOf('if (!verified.ok || !proof.verified) throw');
  const success = checkout.indexOf('this.setState({ dStage: 1 });');
  assert.ok(proofCheck >= 0 && success > proofCheck, 'success follows verified API proof');
  assert.equal(checkout.match(/this\.setState\(\{ dStage: 1 \}\);/g)?.length, 1);
  assert.doesNotMatch(checkout.slice(checkout.lastIndexOf('} catch (error) {')), /dStage:\s*1/);
});
