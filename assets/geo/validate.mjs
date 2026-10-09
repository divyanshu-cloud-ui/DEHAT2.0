// One set of donor-form rules, loaded by the page and bundled into the order endpoint, so what the browser accepts is exactly what the server accepts.
// validateDonor(input, ctx) -> { ok, errors: { field: code }, clean }.  Codes are translated by the page; the server only reports them.
// ctx: { geo, districts } (the two JSON files built by tools/build-geo.mjs). Without ctx, list membership is not checked.

const LETTER = /\p{L}/gu;
const NAME_OK = /^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u;
const PLACE_OK = /^[\p{L}\p{M}][\p{L}\p{M} .'’\-(),\/]*$/u;
const EMAIL_OK = /^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\"]+\.[A-Za-z¡-￿]{2,}$/u;
export const PAN_OK = /^[A-Z]{3}[ABCFGHJKLPT][A-Z][0-9]{4}[A-Z]$/;
export const MAX_AMOUNT = 10000000;

const letters = s => (String(s).match(LETTER) || []).length;
const repeated = s => /(.)\1{3,}/u.test(String(s));            // "aaaa", "xxxxx"
const trim = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

export function normalizePhone(dial, national, country) {
  let digits = String(national || '').replace(/[\s\-().]/g, '');
  if (!/^\d+$/.test(digits)) return null;                         // letters, "+" or other symbols
  if (country === 'IN' || dial === '91') digits = digits.replace(/^0+/, '');
  else if (digits.startsWith('0')) digits = digits.slice(1);      // national trunk prefix
  const d = String(dial || '').replace(/\D/g, '');
  if (!d || !digits) return null;
  if (d === '91') { if (!/^[6-9]\d{9}$/.test(digits)) return null; }
  else if (d === '1') { if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null; }
  else if (digits.length < 4 || digits.length > 14) return null;
  if (d.length + digits.length > 15) return null;                  // ITU E.164 maximum
  return '+' + d + digits;
}

export function validateDonor(input, ctx = {}) {
  const e = {};
  const v = input || {};
  const clean = {};
  const geo = ctx.geo, districts = ctx.districts;
  const needAddress = !!v.receipt80G;

  // Name
  const name = trim(v.fullName); clean.fullName = name;
  if (!name) e.fullName = 'required';
  else if (name.length < 2 || letters(name) < 2) e.fullName = 'too_short';
  else if (name.length > 100) e.fullName = 'too_long';
  else if (!NAME_OK.test(name) || repeated(name)) e.fullName = 'invalid_chars';

  // Email
  const email = trim(v.email).toLowerCase(); clean.email = email;
  if (!email) e.email = 'required';
  else if (email.length > 254 || email.split('@')[0].length > 64 || /\.\./.test(email) || !EMAIL_OK.test(email)) e.email = 'invalid_email';

  // Country, state, district, city
  const country = String(v.countryCode || '').toUpperCase(); clean.countryCode = country;
  const countryRow = geo ? geo.countries.find(c => c[0] === country) : null;
  if (!country) e.countryCode = 'required';
  else if (geo && !countryRow) e.countryCode = 'invalid_selection';

  const stateList = geo && geo.states ? geo.states[country] : null;
  const state = trim(v.state); clean.state = state;
  if (stateList && stateList.length) {
    if (!state) e.state = 'required';
    else if (!stateList.includes(state)) e.state = 'invalid_selection';
  } else if (state && (state.length > 80 || !PLACE_OK.test(state))) e.state = 'invalid_chars';

  const district = trim(v.district); clean.district = district;
  if (country === 'IN') {
    if (!district) e.district = 'required';
    else if (districts && state && districts[state] && !districts[state].includes(district)) {
      // "Other / not listed" lets a donor type a district the list does not have yet; it must still look like a place.
      if (!v.districtOther || district.length < 2 || district.length > 80 || !PLACE_OK.test(district) || repeated(district)) e.district = 'invalid_selection';
    }
  } else if (district && (district.length > 80 || !PLACE_OK.test(district))) e.district = 'invalid_chars';

  const city = trim(v.city); clean.city = city;
  if (!city) e.city = 'required';
  else if (city.length < 2 || letters(city) < 2) e.city = 'too_short';
  else if (city.length > 80) e.city = 'too_long';
  else if (!PLACE_OK.test(city) || repeated(city)) e.city = 'invalid_chars';

  // Postal code
  const pin = trim(v.postalCode).toUpperCase(); clean.postalCode = pin;
  if (country === 'IN') {
    if (!pin) e.postalCode = 'required';
    else if (!/^[1-9]\d{5}$/.test(pin)) e.postalCode = 'invalid_pin';
  } else if (pin && !/^[A-Z0-9][A-Z0-9 \-]{1,9}[A-Z0-9]$/.test(pin)) e.postalCode = 'invalid_pin';

  // Phone: the dial code comes from the country dropdown, the number is digits only
  const dial = String(v.phoneDial || (countryRow && countryRow[2]) || (country === 'IN' ? '91' : '')).replace(/\D/g, ''); clean.phoneDial = dial;
  const rawPhone = trim(v.phone); clean.phone = rawPhone;
  if (!rawPhone) e.phone = 'required';
  else {
    const full = normalizePhone(dial, rawPhone, country);
    if (!full) e.phone = 'invalid_phone'; else clean.phoneE164 = full;
  }

  // Address and PAN (an 80G receipt needs both)
  const address = trim(v.address); clean.address = address;
  if (needAddress && !address) e.address = 'required';
  else if (address && (address.length < 5 || letters(address) < 2)) e.address = 'too_short';
  else if (address.length > 200) e.address = 'too_long';
  else if (address && repeated(address)) e.address = 'invalid_chars';

  const pan = trim(v.pan).toUpperCase(); clean.pan = pan;
  if (needAddress) { if (!pan) e.pan = 'required'; else if (!PAN_OK.test(pan)) e.pan = 'invalid_pan'; }

  // Amount in rupees, at most two decimals
  if (v.amount !== undefined) {
    const n = Number(v.amount);
    if (v.amount === '' || v.amount === null || !Number.isFinite(n)) e.amount = 'required';
    else if (n < 1 || n > MAX_AMOUNT) e.amount = 'amount_range';
    else if (Math.round(n * 100) !== n * 100 && !/^\d+(\.\d{1,2})?$/.test(String(v.amount))) e.amount = 'amount_range';
  }
  return { ok: Object.keys(e).length === 0, errors: e, clean };
}

// Display order for focusing the first problem on screen.
export const FIELD_ORDER = ['amount', 'fullName', 'countryCode', 'phone', 'email', 'state', 'district', 'city', 'postalCode', 'address', 'pan'];
