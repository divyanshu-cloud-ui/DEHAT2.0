// Builds assets/geo/in-pins.v1.json (PIN -> state, district, place) from India Post's "All India Pincode Directory" (Government Open Data Licence).
// Usage: node tools/build-pins.mjs <path to the directory CSV>
// A district is filled in only when its name matches today's district list for that state exactly (ignoring case and punctuation);
// otherwise the PIN still gives state and place, and the donor chooses the district.
import { readFileSync, writeFileSync } from 'node:fs';

const DNHDD = 'Dadra and Nagar Haveli and Daman and Diu';
const STATE_ALIAS = { 'CHATTISGARH': 'Chhattisgarh', 'PONDICHERRY': 'Puducherry', 'DADRA & NAGAR HAVELI': DNHDD, 'DAMAN & DIU': DNHDD,
  'ANDAMAN & NICOBAR ISLANDS': 'Andaman and Nicobar Islands', 'JAMMU & KASHMIR': 'Jammu and Kashmir' };

// Old spellings and official renames in the 2017 directory -> today's names. Only one-to-one cases: districts that were split or merged
// (Bardhaman, the Midnapores, Delhi's old eleven) are left unmatched so the donor chooses.
export const DISTRICT_ALIAS = {
  'Karnataka|Belgaum': 'Belagavi', 'Karnataka|Bangalore': 'Bengaluru Urban', 'Karnataka|Bangalore Rural': 'Bengaluru Rural', 'Karnataka|Mysore': 'Mysuru',
  'Karnataka|Tumkur': 'Tumakuru', 'Karnataka|Shimoga': 'Shivamogga', 'Karnataka|Bellary': 'Ballari', 'Karnataka|Chickmagalur': 'Chikkamagaluru',
  'Karnataka|Davangere': 'Davanagere', 'Karnataka|Bijapur(KAR)': 'Vijayapura', 'Karnataka|Gulbarga': 'Kalaburagi', 'Karnataka|Bagalkot': 'Bagalkote',
  'Karnataka|Chikkaballapur': 'Chikkaballapura', 'Karnataka|Chamrajnagar': 'Chamarajanagar', 'Karnataka|Ramanagar': 'Bengaluru South',
  'Tamil Nadu|Kanchipuram': 'Kancheepuram', 'Tamil Nadu|Tuticorin': 'Thoothukkudi', 'Tamil Nadu|Villupuram': 'Viluppuram', 'Tamil Nadu|Tiruvarur': 'Thiruvarur',
  'Tamil Nadu|Tiruvallur': 'Thiruvallur', 'Tamil Nadu|Kanyakumari': 'Kanniyakumari', 'Tamil Nadu|Nilgiris': 'The Nilgiris',
  'Andhra Pradesh|Ananthapur': 'Ananthapuramu', 'Andhra Pradesh|Cuddapah': 'Y.S.R. Kadapa',
  'Maharashtra|Ahmed Nagar': 'Ahilyanagar', 'Maharashtra|Raigarh(MH)': 'Raigad', 'Maharashtra|Aurangabad': 'Chhatrapati Sambhajinagar', 'Maharashtra|Osmanabad': 'Dharashiv',
  'West Bengal|Darjiling': 'Darjeeling', 'West Bengal|North Dinajpur': 'Uttar Dinajpur', 'West Bengal|South Dinajpur': 'Dakshin Dinajpur', 'West Bengal|Puruliya': 'Purulia',
  'Odisha|Khorda': 'Khordha', 'Odisha|Baleswar': 'Baleshwar', 'Odisha|Jajapur': 'Jajpur', 'Odisha|Kendrapara': 'Kendrapada', 'Odisha|Bargarh': 'Baragada',
  'Odisha|Kandhamal': 'Kandhamala', 'Odisha|Nayagarh': 'Nayagada', 'Odisha|Angul': 'Anugola', 'Odisha|Sundergarh': 'Sundaragada', 'Odisha|Nabarangapur': 'Nabarangpur',
  'Odisha|Debagarh': 'Debagada', 'Odisha|Cuttack': 'Kataka', 'Odisha|Sonapur': 'Subarnapur',
  'Telangana|K.V.Rangareddy': 'Ranga Reddy',
  'Uttar Pradesh|Allahabad': 'Prayagraj', 'Uttar Pradesh|Faizabad': 'Ayodhya', 'Uttar Pradesh|Maharajganj': 'Mahrajganj', 'Uttar Pradesh|Bagpat': 'Baghpat',
  'Uttar Pradesh|Jyotiba Phule Nagar': 'Amroha', 'Uttar Pradesh|Sant Ravidas Nagar': 'Bhadohi',
  'Himachal Pradesh|Hamirpur(HP)': 'Hamirpur', 'Himachal Pradesh|Bilaspur (HP)': 'Bilaspur', 'Himachal Pradesh|Lahul & Spiti': 'Lahaul And Spiti',
  'Rajasthan|Jhujhunu': 'Jhunjhunu', 'Rajasthan|Jalor': 'Jalore', 'Haryana|Gurgaon': 'Gurugram', 'Assam|Sibsagar': 'Sivasagar',
  'Bihar|East Champaran': 'Purbi Champaran', 'Bihar|West Champaran': 'Pashchim Champaran', 'Bihar|Aurangabad(BH)': 'Aurangabad',
  'Punjab|Nawanshahr': 'Shahid Bhagat Singh Nagar', 'Punjab|Firozpur': 'Ferozepur', 'Punjab|Muktsar': 'Sri Muktsar Sahib', 'Punjab|Ropar': 'Rupnagar',
  'Punjab|Mohali': 'S.A.S Nagar',
  'Jharkhand|East Singhbhum': 'East Singhbum', 'Jharkhand|Giridh': 'Giridih', 'Jharkhand|Hazaribag': 'Hazaribagh', 'Jharkhand|Seraikela-kharsawan': 'Saraikela Kharsawan',
  'Jharkhand|Palamau': 'Palamu', 'Jharkhand|Sahibganj': 'Sahebganj',
  'Kerala|Kasargod': 'Kasaragod', 'Puducherry|Pondicherry': 'Puducherry',
  'Chhattisgarh|Bilaspur(CGH)': 'Bilaspur', 'Chhattisgarh|Koriya': 'Korea', 'Chhattisgarh|Bijapur(CGH)': 'Bijapur',
  'Madhya Pradesh|Hoshangabad': 'Narmadapuram', 'Madhya Pradesh|Narsinghpur': 'Narsimhapur',
  'Jammu and Kashmir|Ananthnag': 'Anantnag', 'Jammu and Kashmir|Rajauri': 'Rajouri', 'Ladakh|Leh': 'Leh Ladakh',
  'Andaman and Nicobar Islands|South Andaman': 'South Andamans', 'Lakshadweep|Lakshadweep': 'Lakshadweep District', 'Mizoram|Mammit': 'Mamit', 'Gujarat|The Dangs': 'Dangs',
};
const key = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function parseCsv(text) {
  const rows = []; let f = [], c = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); rows.push(f); f = []; c = ''; }
    else if (ch !== '\r') c += ch;
  }
  if (c || f.length) { f.push(c); rows.push(f); }
  return rows;
}

const title = s => String(s).toLowerCase().replace(/(^|[\s(\-\/])([a-z])/g, (m, a, b) => a + b.toUpperCase());
export function cleanPlace(office) {
  let name = String(office).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  // "Bangalore G.P.O. S.O" carries two suffixes: strip until nothing more comes off.
  for (let before = ''; before !== name;) { before = name; name = name.replace(/\s+(?:G\.?\s?P\.?\s?O\.?|[HSB]\.?\s?O\.?)$/i, '').trim(); }
  return title(name);
}
const RANK = { 'H.O': 0, 'S.O': 1, 'B.O': 2 };
const rank = t => RANK[String(t).replace(/\s/g, '').toUpperCase()] ?? 3;

export function missingAliasTargets(districtsByState) {
  return Object.entries(DISTRICT_ALIAS).filter(([k, v]) => { const st = k.split('|')[0]; return !(districtsByState[st] || []).some(d => key(d) === key(v)); }).map(([k, v]) => k + ' -> ' + v);
}

export function build(csvRows, districtsByState) {
  const h = csvRows[0].map(x => x.toLowerCase());
  const col = n => h.indexOf(n);
  const [iOff, iPin, iType, iTaluk, iDist, iState] = ['officename', 'pincode', 'officetype', 'taluk', 'districtname', 'statename'].map(col);
  const states = Object.keys(districtsByState);
  const stateOf = new Map(states.map((s, i) => [key(s), i]));
  const distIndex = states.map(s => new Map(districtsByState[s].map((d, i) => [key(d), i])));
  const byPin = new Map();
  let skipped = 0;
  for (const r of csvRows.slice(1)) {
    const pin = (r[iPin] || '').trim();
    if (!/^[1-9]\d{5}$/.test(pin)) { skipped++; continue; }
    let sName = STATE_ALIAS[(r[iState] || '').trim().toUpperCase()] || (r[iState] || '').trim();
    const dRaw = (r[iDist] || '').trim();
    // Ladakh became its own union territory after this directory was compiled.
    if (key(sName) === 'jammuandkashmir' && ['leh', 'kargil', 'lehladakh'].includes(key(dRaw))) sName = 'Ladakh';
    const si = stateOf.get(key(sName));
    if (si === undefined) { skipped++; continue; }
    const aliased = DISTRICT_ALIAS[states[si] + '|' + dRaw];
    const di = distIndex[si].get(key(aliased || dRaw)) ?? -1;
    const e = byPin.get(pin) || { votes: new Map(), offices: [] };
    const vk = si + ':' + di;
    e.votes.set(vk, (e.votes.get(vk) || 0) + 1);
    e.offices.push({ rank: rank(r[iType]), name: cleanPlace(r[iOff]), taluk: title((r[iTaluk] || '').trim()) });
    byPin.set(pin, e);
  }
  const pins = {}; let matched = 0;
  for (const [pin, e] of [...byPin].sort()) {
    const [vk] = [...e.votes].sort((a, b) => b[1] - a[1])[0];
    const [si, di] = vk.split(':').map(Number);
    e.offices.sort((a, b) => a.rank - b.rank);
    const place = e.offices[0].rank < 2 ? e.offices[0].name : (e.offices[0].taluk && e.offices[0].taluk !== 'Na' ? e.offices[0].taluk : e.offices[0].name);
    pins[pin] = [si, di, place];
    if (di >= 0) matched++;
  }
  return { out: { v: 1, states, pins }, stats: { pins: byPin.size, districtMatched: matched, skippedRows: skipped } };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const src = process.argv[2];
  if (!src) { console.error('Pass the path to the All India Pincode Directory CSV.'); process.exit(1); }
  const districts = JSON.parse(readFileSync('assets/geo/in-districts.v1.json', 'utf8'));
  const miss = missingAliasTargets(districts);
  if (miss.length) console.log('Alias targets not in the district list (these aliases do nothing):\n  ' + miss.join('\n  '));
  const { out, stats } = build(parseCsv(readFileSync(src, 'utf8')), districts);
  writeFileSync('assets/geo/in-pins.v1.json', JSON.stringify(out));
  console.log(`PINs ${stats.pins}; district matched today's list for ${stats.districtMatched} (${Math.round(100 * stats.districtMatched / stats.pins)}%); rows skipped ${stats.skippedRows}`);
}
