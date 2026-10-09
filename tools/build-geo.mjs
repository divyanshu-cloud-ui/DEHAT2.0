// Builds the form's geography files from two open datasets. Run: node tools/build-geo.mjs
//   countries, dial codes, states/provinces  <- countries-states-cities (MIT)
//   India states and districts               <- data/in-districts.source.json (KTBsomen/Indian-state-district-json, MIT; scraped from igod.gov.in)
// Output (public, served as static assets): assets/geo/geo.v1.json and assets/geo/in-districts.v1.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Verified corrections to the source, each with its reason. Puducherry UT has four districts; the source lists two.
export const DISTRICT_FIXES = { Puducherry: { add: ['Mahe', 'Yanam'], why: 'Puducherry UT has four districts: Puducherry, Karaikal, Mahe, Yanam' } };

export function cleanDial(raw) {
  const m = /^\+?(\d{1,4})/.exec(String(raw || '').trim());
  return m ? m[1] : '';
}

export function build({ countries, states, indiaSource }) {
  const inStates = {};
  for (const s of indiaSource) {
    const name = (s.state || s.name || '').trim();
    const list = [...new Set((s.districts || []).map(d => String(d).trim()).filter(Boolean))];
    const fix = DISTRICT_FIXES[name];
    if (fix) for (const d of fix.add) if (!list.includes(d)) list.push(d);
    inStates[name] = list.sort((a, b) => a.localeCompare(b, 'en'));
  }
  const byCountry = {};
  for (const s of states) (byCountry[s.country_code] ||= []).push(s.name.trim());
  const out = { v: 1, countries: [], states: {} };
  for (const c of countries) {
    out.countries.push([c.iso2, c.name, cleanDial(c.phone_code)]);
    const list = c.iso2 === 'IN' ? Object.keys(inStates) : [...new Set(byCountry[c.iso2] || [])];
    if (list.length) out.states[c.iso2] = list.sort((a, b) => a.localeCompare(b, 'en'));
  }
  out.countries.sort((a, b) => a[1].localeCompare(b[1], 'en'));
  return { geo: out, districts: inStates };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const countries = require('countries-states-cities/dist/lib/countries.json');
  const states = require('countries-states-cities/dist/lib/states.json');
  const indiaSource = JSON.parse(readFileSync('data/in-districts.source.json', 'utf8'));
  const { geo, districts } = build({ countries, states, indiaSource });
  mkdirSync('assets/geo', { recursive: true });
  writeFileSync('assets/geo/geo.v1.json', JSON.stringify(geo));
  writeFileSync('assets/geo/in-districts.v1.json', JSON.stringify(districts));
  writeFileSync('assets/geo/NOTICE.txt', `Geography data used by the donation forms.

Countries, dial codes and states/provinces: "countries-states-cities" by Thiago Bueno, MIT licence (https://github.com/thiagobueno/countries-states-cities).
India states and districts: "Indian-state-district-json" by Somen Das, MIT licence (https://github.com/KTBsomen/Indian-state-district-json), compiled from the Government of India igod.gov.in directory. India's state list is taken from this source so that it reflects the 2020 merger of Dadra and Nagar Haveli with Daman and Diu.
DEHAT correction: ${DISTRICT_FIXES.Puducherry.why} (Mahe and Yanam were missing from the source).
Rebuild with: node tools/build-geo.mjs
`);
  const d = Object.values(districts).reduce((n, l) => n + l.length, 0);
  console.log(`countries ${geo.countries.length}, with dial code ${geo.countries.filter(c => c[2]).length}, countries with states ${Object.keys(geo.states).length}, India states ${Object.keys(districts).length}, India districts ${d}`);
}
