import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCsv, cleanPlace, build, DISTRICT_ALIAS, missingAliasTargets } from './build-pins.mjs';

const districts = JSON.parse(readFileSync('assets/geo/in-districts.v1.json', 'utf8'));
const pins = JSON.parse(readFileSync('assets/geo/in-pins.v1.json', 'utf8'));

test('place names lose their post-office suffixes, however many', () => {
  assert.equal(cleanPlace('Bangalore G.P.O. S.O'), 'Bangalore');
  assert.equal(cleanPlace('Bahraich H.O'), 'Bahraich');
  assert.equal(cleanPlace('A Narayanapuram B.O'), 'A Narayanapuram');
  assert.equal(cleanPlace('Kochi (Ernakulam) S.O'), 'Kochi');
});
test('csv parser handles quotes and blank cells', () => {
  assert.deepEqual(parseCsv('a,b,c\n1,"x, y",\n'), [['a', 'b', 'c'], ['1', 'x, y', '']]);
});
test('every district alias points at a district that exists today', () => {
  assert.deepEqual(missingAliasTargets(districts), []);
  assert.ok(Object.keys(DISTRICT_ALIAS).length > 80);
});
test('build maps old state names, splits Ladakh from J&K, and only fills a district that matches today\'s list', () => {
  const csv = parseCsv([
    'officename,pincode,officeType,Deliverystatus,divisionname,regionname,circlename,Taluk,Districtname,statename',
    'Bahraich H.O,271801,H.O,Delivery,x,x,x,Bahraich,BAHRAICH,UTTAR PRADESH',
    'Leh S.O,194101,S.O,Delivery,x,x,x,Leh,Leh,JAMMU & KASHMIR',
    'Pondy S.O,605001,S.O,Delivery,x,x,x,Pondy,Pondicherry,PONDICHERRY',
    'Old S.O,110005,S.O,Delivery,x,x,x,Karol Bagh,Old Split District,DELHI',
    'Bad S.O,12345,S.O,Delivery,x,x,x,x,x,DELHI',
  ].join('\n'));
  const { out, stats } = build(csv, districts);
  const at = pin => { const v = out.pins[pin]; return v && [out.states[v[0]], v[1] >= 0 ? districts[out.states[v[0]]][v[1]] : null, v[2]]; };
  assert.deepEqual(at('271801'), ['Uttar Pradesh', 'Bahraich', 'Bahraich']);
  assert.deepEqual(at('194101'), ['Ladakh', 'Leh Ladakh', 'Leh']);
  assert.deepEqual(at('605001'), ['Puducherry', 'Puducherry', 'Pondy']);
  assert.deepEqual(at('110005'), ['Delhi', null, 'Old']);
  assert.equal(at('12345'), undefined);
  assert.equal(stats.pins, 4);
});
test('the shipped PIN file is internally consistent', () => {
  assert.ok(pins.states.length === 36 && pins.states.every(s => districts[s]));
  const entries = Object.entries(pins.pins);
  assert.ok(entries.length > 19000);
  let matched = 0;
  for (const [pin, [si, di, place]] of entries) {
    assert.match(pin, /^[1-9]\d{5}$/);
    assert.ok(Number.isInteger(si) && si >= 0 && si < pins.states.length, pin);
    assert.ok(Number.isInteger(di) && di >= -1 && di < districts[pins.states[si]].length, pin);
    assert.ok(typeof place === 'string' && place.length > 0, pin);
    if (di >= 0) matched++;
  }
  assert.ok(matched / entries.length > 0.95, 'district match rate ' + matched / entries.length);
  const at = pin => pins.pins[pin] && [pins.states[pins.pins[pin][0]], districts[pins.states[pins.pins[pin][0]]][pins.pins[pin][1]]];
  assert.deepEqual(at('271801'), ['Uttar Pradesh', 'Bahraich']);
  assert.deepEqual(at('400001'), ['Maharashtra', 'Mumbai']);
  assert.deepEqual(at('560001'), ['Karnataka', 'Bengaluru Urban']);
});
