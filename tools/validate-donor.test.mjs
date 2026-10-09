import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDonor, normalizePhone, FIELD_ORDER } from '../assets/geo/validate.mjs';

const ctx = { geo: JSON.parse(readFileSync('assets/geo/geo.v1.json', 'utf8')), districts: JSON.parse(readFileSync('assets/geo/in-districts.v1.json', 'utf8')) };
const good = { fullName: 'Asha Verma', email: 'asha@example.org', phone: '98765 43210', countryCode: 'IN', state: 'Uttar Pradesh', district: 'Bahraich', city: 'Bahraich', postalCode: '271801', address: '12 Station Road', pan: 'ABCPV1234F', receipt80G: true, amount: '500' };
const codes = (patch, extra) => validateDonor({ ...good, ...patch }, extra || ctx).errors;

test('a complete, correct form passes and normalises the phone', () => {
  const r = validateDonor(good, ctx);
  assert.deepEqual(r.errors, {}); assert.equal(r.clean.phoneE164, '+919876543210');
});
test('a blank form fails on every required field', () => {
  const r = validateDonor({ receipt80G: true, amount: '' }, ctx);
  for (const f of ['amount', 'fullName', 'email', 'countryCode', 'phone', 'city', 'address', 'pan']) assert.equal(r.errors[f], 'required', f);
  assert.ok(FIELD_ORDER.every(f => typeof f === 'string'));
});
test('names: digits, symbols, single letters and keyboard-mash are rejected; real names in many scripts pass', () => {
  for (const n of ['A', '12345', 'Asha123', 'a@b.c', 'xxxxxx', '   ']) assert.ok(codes({ fullName: n }).fullName, n);
  for (const n of ['Asha Verma', "O'Brien", 'Jean-Luc Picard', 'दिव्यांशु चतुर्वेदी', 'محمد علي', '李小龍']) assert.equal(codes({ fullName: n }).fullName, undefined, n);
});
test('email', () => {
  for (const m of ['asha', 'asha@', '@x.org', 'a b@x.org', 'a@x', 'a@x..org', 'a@b.c']) assert.equal(codes({ email: m }).email, 'invalid_email', m);
  assert.equal(codes({ email: 'Asha.V+dehat@Example.ORG' }).email, undefined);
});
test('phone: India needs ten digits starting 6-9; +1 needs a valid NANP number; others 4-14 digits; no letters', () => {
  assert.equal(normalizePhone('91', '09876543210', 'IN'), '+919876543210');
  assert.equal(normalizePhone('91', '1234567890', 'IN'), null);
  assert.equal(normalizePhone('91', '98765', 'IN'), null);
  assert.equal(normalizePhone('1', '2025550123', 'US'), '+12025550123');
  assert.equal(normalizePhone('1', '1025550123', 'US'), null);
  assert.equal(normalizePhone('44', '07911 123456', 'GB'), '+447911123456');
  assert.equal(normalizePhone('971', '501234567', 'AE'), '+971501234567');
  assert.equal(normalizePhone('44', '12', 'GB'), null);
  assert.equal(normalizePhone('91', '98765abcde', 'IN'), null);
  assert.equal(normalizePhone('91', '+919876543210', 'IN'), null);
  assert.equal(codes({ phone: '' }).phone, 'required');
});
test('country, state and district must come from the lists', () => {
  assert.equal(codes({ countryCode: 'XX' }).countryCode, 'invalid_selection');
  assert.equal(codes({ state: 'Atlantis' }).state, 'invalid_selection');
  assert.equal(codes({ state: '' }).state, 'required');
  assert.equal(codes({ district: 'Gotham' }).district, 'invalid_selection');
  assert.equal(codes({ district: 'Gotham', districtOther: true }).district, undefined);
  assert.equal(codes({ district: '1234', districtOther: true }).district, 'invalid_selection');
  assert.equal(codes({ district: 'Mahe', state: 'Puducherry' }).district, undefined);
  assert.equal(codes({ district: 'Bahraich', state: 'Bihar' }).district, 'invalid_selection');
});
test('outside India: state from the list when the country has one, district and PIN optional', () => {
  const us = { countryCode: 'US', state: 'California', district: '', postalCode: '94105', phone: '2025550123', pan: '', receipt80G: false };
  assert.deepEqual(codes(us), {});
  assert.equal(codes({ ...us, state: 'Bavaria' }).state, 'invalid_selection');
  assert.equal(codes({ ...us, postalCode: '!!' }).postalCode, 'invalid_pin');
  // a country with no dial code in the data (Antarctica) cannot give a phone number unless a dial code is chosen
  assert.equal(codes({ ...us, countryCode: 'AQ', state: '' }).phone, 'invalid_phone');
  assert.equal(codes({ ...us, countryCode: 'AQ', state: '', phoneDial: '1' }).phone, undefined);
});
test('India PIN, PAN and address', () => {
  for (const p of ['27180', '0271801', '2718011', 'ABCDEF', '']) assert.ok(codes({ postalCode: p }).postalCode, p);
  for (const p of ['ABCDE1234F', 'abcde1234', 'ABCZE1234F', '1234567890']) assert.equal(codes({ pan: p }).pan, 'invalid_pan', p);
  assert.equal(codes({ pan: 'abcpv1234f' }).pan, undefined);
  assert.equal(codes({ receipt80G: false, pan: '', address: '' }).pan, undefined);
  assert.equal(codes({ address: 'ab' }).address, 'too_short');
  assert.equal(codes({ address: 'x'.repeat(201) }).address, 'too_long');
});
test('amount: between 1 and 1,00,00,000, at most two decimals', () => {
  for (const a of ['', 'abc', '0', '0.5', '10000001', '12.345']) assert.ok(codes({ amount: a }).amount, a);
  for (const a of ['1', '500', '99.5', '10000000', 250.75]) assert.equal(codes({ amount: a }).amount, undefined, String(a));
});
test('without the lists, shape rules still apply but membership is not checked', () => {
  assert.deepEqual(validateDonor(good, {}).errors, {});
  assert.equal(validateDonor({ ...good, email: 'x' }, {}).errors.email, 'invalid_email');
});
