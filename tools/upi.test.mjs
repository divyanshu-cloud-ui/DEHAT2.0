import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { deflateRawSync } from 'node:zlib';
import { parseCsv, findColumns, extractCredits, toPaise, istDate } from './upi-reconcile.mjs';
import { xlsxRows } from './xlsx-rows.mjs';
const require = createRequire(import.meta.url);
const { codeIn, isCode, makeCode, upiUri, UPI_MAX_PAISE } = require('../backend/_upi.js');
const { memoryKv } = require('../backend/_kv.js');
const intent = require('../backend/donations/upi-intent.js');
const reconcile = require('../backend/donations/upi-reconcile.js');

function res() { const r = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } }; return r; }
const donor = { regime: 'domestic_inr', frequency: 'once', amount: 500, purpose: 'Wherever It Is Needed Most', purposeEn: 'Wherever It Is Needed Most', receipt80G: true, pan: 'AAAPV1234K',
  fullName: 'Asha Verma', email: 'asha@example.org', phone: '9876543210', phoneDial: '91', countryCode: 'IN', state: 'Uttar Pradesh', district: 'Bahraich', city: 'Bahraich', postalCode: '271801', address: 'Main Road', lang: 'en' };

test('codes use the unambiguous alphabet and are found in bank narrations', () => {
  for (let i = 0; i < 50; i++) assert.ok(isCode(makeCode()));
  assert.equal(isCode('DHABCD0'), false);
  assert.equal(codeIn('UPI/412345678901/DH7K2QX/asha@okaxis'), 'DH7K2QX');
  assert.equal(codeIn('upi/412345678901/dh7k2qx/x'), 'DH7K2QX');
  assert.equal(codeIn('UPI/412345678901/no code here'), null);
  // The note is letters and digits only (UPI apps refuse a hyphen); a hand-typed hyphen or space is still recognised.
  assert.equal(isCode('DH-7K2QX'), false);
  assert.equal(codeIn('UPI/412345678901/DH-7K2QX/asha@okaxis'), 'DH7K2QX');
  assert.equal(codeIn('DH TESTA'), 'DHTESTA');
  assert.equal(codeIn('SIDH7K2QX'), null);
});

test('IDFC merchant export: Transaction Amount and RRN columns, failed attempts skipped', () => {
  const csv = 'Transaction ID,Order ID,RRN,Transaction Type,Date & Time,Transaction Amount,Status,Remarks,Payer VPA\n'
    + 'T1,,512345678901,PAY,15/10/2026 21:40,500.00,Completed,DH7K2QX,a@okaxis\n'
    + 'T2,,512345678902,PAY,15/10/2026 21:41,500.00,Failed,DH7K2QY,a@okaxis\n'
    + 'T3,,512345678903,PAY,15/10/2026 21:42,1.00,Completed,DH TESTA,a@okaxis\n'
    + 'T4,,512345678904,PAY,15/10/2026 21:43,51.00,Completed,Payment from PhonePe,b@ybl\n';
  const { matched, unmatched } = extractCredits(parseCsv(csv));
  assert.deepEqual(matched.map(m => [m.code, m.utr, m.amountPaise]), [['DH7K2QX', '512345678901', 50000], ['DHTESTA', '512345678903', 100]]);
  assert.equal(unmatched.length, 1);
});

test('statement dates become Indian time, so a late-evening gift keeps its date on the receipt', () => {
  assert.equal(istDate('2026-10-15T22:00:57'), '2026-10-15T22:00:57+05:30');
  assert.equal(istDate('01/10/2026'), '2026-10-01T00:00:00+05:30'); // 1 October, not 10 January
  assert.equal(istDate('31-Mar-2027 11:59 PM'), '2027-03-31T23:59:00+05:30');
  assert.equal(istDate('46310.5'), '2026-10-15T12:00:00+05:30'); // Excel date number
  assert.equal(istDate('13/13/2026'), '');
  const csv = 'RRN,Date & Time,Transaction Amount,Status,Remarks\n512345678901,,500.00,Completed,DH7K2QX\n';
  const { matched, unmatched } = extractCredits(parseCsv(csv));
  assert.equal(matched.length, 0); assert.equal(unmatched.length, 1);
});

// A minimal .xlsx: a zip holding the workbook, its relationships, shared strings and one sheet.
function xlsx(parts) {
  const local = [], central = []; let offset = 0;
  for (const [name, text] of Object.entries(parts)) {
    const n = Buffer.from(name), data = deflateRawSync(Buffer.from(text)), h = Buffer.alloc(30), c = Buffer.alloc(46);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(8, 8); h.writeUInt32LE(data.length, 18); h.writeUInt16LE(n.length, 26);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(8, 10); c.writeUInt32LE(data.length, 20); c.writeUInt16LE(n.length, 28); c.writeUInt32LE(offset, 42);
    local.push(h, n, data); central.push(c, n); offset += 30 + n.length + data.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(parts).length, 10); end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, dir, end]);
}

test('IDFC .xlsx export is read directly: inline, shared and numeric cells', () => {
  const buf = xlsx({
    'xl/workbook.xml': '<workbook><sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId1" Type="worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/sharedStrings.xml': '<sst><si><t>Completed</t></si><si><r><t>DH </t></r><r><t>TESTA</t></r></si></sst>',
    'xl/worksheets/sheet1.xml': '<worksheet><sheetData>'
      + '<row r="1"><c r="A1" t="str"><v>RRN</v></c><c r="B1" t="inlineStr"><is><t>Date &amp; Time</t></is></c><c r="C1" t="str"><v>Transaction Amount</v></c><c r="D1" t="str"><v>Status</v></c><c r="E1" t="str"><v>Remarks</v></c></row>'
      + '<row r="2"><c r="A2"><v>512345678903</v></c><c r="B2" t="str"><v>2026-10-15T22:00:57</v></c><c r="C2"><v>1</v></c><c r="D2" t="s"><v>0</v></c><c r="E2" t="s"><v>1</v></c></row>'
      + '<row r="3"><c r="A3"><v>512345678904</v></c><c r="C3"><v>51</v></c><c r="D3" t="s"><v>0</v></c><c r="E3" t="str"><v>UPI</v></c></row>'
      + '</sheetData></worksheet>',
  });
  const rows = xlsxRows(buf);
  assert.deepEqual(rows[2], ['512345678904', '', '51', 'Completed', 'UPI']);
  const { matched, unmatched } = extractCredits(rows);
  assert.deepEqual(matched.map(m => [m.code, m.utr, m.amountPaise, m.date]), [['DHTESTA', '512345678903', 100, '2026-10-15T22:00:57+05:30']]);
  assert.equal(unmatched.length, 1);
  assert.throws(() => xlsxRows(Buffer.from('not a zip')), /Not an .xlsx/);
});

test('the UPI link carries the amount, the payee and the code', () => {
  const uri = upiUri({ amountPaise: 50000, code: 'DH7K2QX' });
  assert.equal(uri, 'upi://pay?pa=dehat0684%40idfcbank&pn=DEHAT&am=500.00&cu=INR&tn=DH7K2QX');
});

test('statement parsing finds the header after bank preamble and pairs codes with UTRs', () => {
  const csv = 'Account Statement\nAccount No,XXXX1234\n\nTransaction Date,Value Date,Particulars,Cheque/Ref No,Debit,Credit,Balance\n'
    + '01/10/2026,01/10/2026,"UPI/412345678901/DH7K2QX/asha@okaxis",412345678901,,"500.00","10,500.00"\n'
    + '01/10/2026,01/10/2026,UPI/412345678902/no ref,412345678902,,1000.00,11500.00\n'
    + '02/10/2026,02/10/2026,NEFT charges,,50.00,,11450.00\n';
  const rows = parseCsv(csv);
  const cols = findColumns(rows);
  assert.equal(cols.header, 2);
  const { matched, unmatched } = extractCredits(rows);
  assert.deepEqual(matched.map(m => [m.code, m.utr, m.amountPaise]), [['DH7K2QX', '412345678901', 50000]]);
  assert.equal(unmatched.length, 1);
  assert.equal(toPaise('1,00,000.50'), 10000050);
});

test('intent: refuses monthly gifts, bad forms and amounts over the UPI limit', async () => {
  intent._deps.kv = memoryKv();
  let r = res(); await intent({ method: 'POST', headers: {}, body: { ...donor, frequency: 'monthly' } }, r);
  assert.equal(r.statusCode, 400); assert.equal(JSON.parse(r.body).fields.amount, 'upi_once_only');
  r = res(); await intent({ method: 'POST', headers: {}, body: { ...donor, fullName: '' } }, r);
  assert.equal(r.statusCode, 400); assert.ok(JSON.parse(r.body).fields.fullName);
  r = res(); await intent({ method: 'POST', headers: {}, body: { ...donor, amount: UPI_MAX_PAISE / 100 + 1 } }, r);
  assert.equal(JSON.parse(r.body).fields.amount, 'upi_limit');
  r = res(); await intent({ method: 'GET', headers: {} }, r);
  assert.equal(r.statusCode, 405);
});

test('intent: creates a pending record and returns a QR for the exact amount', async () => {
  const kv = memoryKv();
  intent._deps.kv = kv; intent._deps.makeCode = () => 'DH7K2QX';
  const r = res(); await intent({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.9' }, body: donor }, r);
  assert.equal(r.statusCode, 200);
  const out = JSON.parse(r.body);
  assert.equal(out.code, 'DH7K2QX'); assert.equal(out.amount, 50000); assert.match(out.qr, /^data:image\/svg\+xml;base64,/);
  assert.match(out.uri, /tn=DH7K2QX$/);
  const saved = JSON.parse(kv.data.get('upi:pending:DH7K2QX'));
  assert.equal(saved.amountPaise, 50000); assert.equal(saved.notes.receipt_80g, 'requested'); assert.equal(saved.notes.pan, 'AAAPV1234K');
});

test('reconcile: needs the token, then matches, refuses mismatches and never double-issues', async () => {
  const kv = memoryKv();
  kv.data.set('upi:pending:DH7K2QX', JSON.stringify({ notes: { payment_regime: 'domestic_inr', receipt_80g: 'requested' }, amountPaise: 50000 }));
  const issued = [];
  reconcile._deps.kv = kv; reconcile._deps.store = {}; reconcile._deps.mailer = {};
  reconcile._deps.issue = async ({ payment }) => { issued.push(payment); return { outcome: 'sent', receiptNo: 'DEHAT/80G/2026-27/000099' }; };
  process.env.UPI_RECONCILE_TOKEN = 'x'.repeat(40);
  let r = res(); await reconcile({ method: 'POST', headers: { authorization: 'Bearer wrong' }, body: { items: [] } }, r);
  assert.equal(r.statusCode, 401);
  const auth = { authorization: 'Bearer ' + 'x'.repeat(40) };
  r = res(); await reconcile({ method: 'POST', headers: auth, body: { items: [
    { code: 'DH7K2QX', utr: '412345678901', amountPaise: 40000 },
    { code: 'DHZZZZZ', utr: '412345678909', amountPaise: 50000 },
  ] } }, r);
  assert.deepEqual(JSON.parse(r.body).results.map(x => x.outcome), ['amount_mismatch', 'unknown_code']);
  r = res(); await reconcile({ method: 'POST', headers: auth, body: { items: [{ code: 'DH7K2QX', utr: '412345678901', amountPaise: 50000, date: '2026-10-01' }] } }, r);
  assert.equal(JSON.parse(r.body).results[0].receiptNo, 'DEHAT/80G/2026-27/000099');
  assert.equal(issued[0].id, 'upi_412345678901'); assert.equal(issued[0].method, 'upi_qr');
  r = res(); await reconcile({ method: 'POST', headers: auth, body: { items: [{ code: 'DH7K2QX', utr: '412345678901', amountPaise: 50000 }] } }, r);
  assert.equal(JSON.parse(r.body).results[0].outcome, 'already_matched');
  assert.equal(issued.length, 1);
  delete process.env.UPI_RECONCILE_TOKEN;
});
