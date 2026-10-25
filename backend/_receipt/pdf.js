// One-page A4 80G receipt, laid out after receipt-sample.html (owner-approved design). English only.
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const { amountInWords, formatInr } = require('./format');
const assets = require('./assets');

const MM = 72 / 25.4;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT = 16 * MM;
const RIGHT = PAGE_W - 16 * MM;
const GREY = rgb(0.54, 0.56, 0.6);
const INK = rgb(0.13, 0.13, 0.13);
const LINE = rgb(0.85, 0.86, 0.88);

// The organisation's own statements. CONSTANTS FOR THE CA: change wording here only, nothing else in the layout depends on it.
const ORG = {
  name: 'Developmental Association for Human Advancement (DEHAT)',
  registration: 'Registered Society, Reg. No. 370/2000-2001',
  office: 'Registered Office: Amritpur Puraina, Madhvapur Koliahar, Nanpara, Bahraich, Uttar Pradesh, PIN 271855',
  communication: 'Communication Address (Head Office): \u201cSewakunj\u201d, Maseehabad Road via Kati Chauraha, Huzoorpur Marg, Bahraich, Uttar Pradesh, PIN 271801',
  pan: 'AAAAD3793Q',
  urn80g: 'AAAAD3793Q25LK02',
  valid80g: 'valid AY 2027-28 to 2031-32',
  urn12a: 'AAAAD3793Q25LK01',
  valid12a: 'valid AY 2027-28 to 2036-37',
  contact: 'dehatindia.org · joinus@dehatindia.org',
};
const EXEMPTION_TEXT = 'Donation eligible for deduction under section 133 of the Income-tax Act, 2025 (earlier section 80G of the Income-tax Act, 1961). Approval URN ' + ORG.urn80g + ', valid for AY 2027-28 to 2031-32. The deduction is available only to a donor who has not opted for the new tax regime.';
const NOTE_TEXT = 'Thank you for your donation to DEHAT. Please keep this receipt for your tax records.';
const NO_GOODS = 'No goods or services were provided in exchange for this donation.';

const METHOD_TEXT = { card: 'Paid online by card', upi: 'Paid online by UPI', netbanking: 'Paid online by netbanking', wallet: 'Paid online by wallet', emi: 'Paid online by card EMI', upi_qr: 'Paid by UPI QR into the bank account' };
function methodText(method) { return METHOD_TEXT[method] || 'Paid online'; }

async function buildReceiptPdf(r) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle('Donation Receipt ' + r.receiptNo);
  doc.setAuthor('DEHAT');
  doc.setCreator('DEHAT receipts');
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const f = {
    reg: await doc.embedFont(assets.noto400, { subset: true }),
    bold: await doc.embedFont(assets.noto700, { subset: true }),
    regExt: await doc.embedFont(assets.notoExt400, { subset: true }),
    boldExt: await doc.embedFont(assets.notoExt700, { subset: true }),
  };
  const logo = await doc.embedPng(assets.logo);
  const seal = await doc.embedPng(assets.signature);

  // Text helpers. The rupee sign lives in the latin-ext font file; everything else in the latin one.
  const segments = text => String(text).split(/(₹)/).filter(Boolean);
  const fontFor = (seg, bold) => seg === '₹' ? (bold ? f.boldExt : f.regExt) : (bold ? f.bold : f.reg);
  const width = (text, size, bold) => segments(text).reduce((sum, seg) => sum + fontFor(seg, bold).widthOfTextAtSize(seg, size), 0);
  const safe = text => String(text == null ? '' : text).replace(/[\r\n\t]+/g, ' ').replace(/[^ -~ -ÿ₹–‘’“”•]/g, '?').trim();
  function draw(text, x, y, size, { bold = false, color = INK, align = 'left' } = {}) {
    const t = safe(text);
    let cx = align === 'right' ? x - width(t, size, bold) : x;
    for (const seg of segments(t)) {
      page.drawText(seg, { x: cx, y, size, font: fontFor(seg, bold), color });
      cx += fontFor(seg, bold).widthOfTextAtSize(seg, size);
    }
  }
  function wrap(text, size, bold, maxWidth, maxLines = 99) {
    const words = safe(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    const push = () => { if (current) lines.push(current); current = ''; };
    for (let word of words) {
      while (width(word, size, bold) > maxWidth) { // break one very long token
        let cut = word.length - 1;
        while (cut > 1 && width(word.slice(0, cut), size, bold) > maxWidth) cut--;
        push(); lines.push(word.slice(0, cut)); word = word.slice(cut);
      }
      const trial = current ? current + ' ' + word : word;
      if (width(trial, size, bold) <= maxWidth) current = trial; else { push(); current = word; }
    }
    push();
    if (lines.length > maxLines) { const kept = lines.slice(0, maxLines); kept[maxLines - 1] = kept[maxLines - 1].replace(/.{0,3}$/, '...'); return kept; }
    return lines;
  }
  const Y = mmFromTop => PAGE_H - mmFromTop * MM;
  const rule = (yPt, x1 = LEFT, x2 = RIGHT) => page.drawLine({ start: { x: x1, y: yPt }, end: { x: x2, y: yPt }, thickness: 0.6, color: LINE });

  // Header: title, sub-line, meta rows on the left; light-mode logo on the right.
  draw('Donation Receipt', LEFT, Y(22), 22, { bold: true });
  draw('Under Section 133 of the Income-tax Act, 2025 (earlier Section 80G)', LEFT, Y(28), 9.5, { color: GREY });
  const meta = [['Receipt No.:', r.receiptNo], ['Received On:', r.receivedOn], ['Payment Reference:', r.paymentId + ' (Razorpay)']];
  meta.forEach(([k, v], i) => { draw(k, LEFT, Y(36 + i * 5.2), 10, { color: GREY }); draw(v, LEFT + 36 * MM, Y(36 + i * 5.2), 10); });
  const logoW = 62 * MM;
  const logoH = logoW * logo.height / logo.width;
  page.drawImage(logo, { x: RIGHT - logoW, y: Y(14) - logoH, width: logoW, height: logoH });

  // Two columns: Received By / Received From.
  const colTop = 56;
  const leftW = 94 * MM;
  const rightX = LEFT + 103 * MM;
  const rightW = RIGHT - rightX;
  draw('Received By', LEFT, Y(colTop), 9.5, { color: GREY });
  draw('Received From', rightX, Y(colTop), 9.5, { color: GREY });
  function block(x, w, startMm, name, paras, kv) {
    let y = Y(startMm);
    for (const line of wrap(name, 11.5, true, w, 3)) { draw(line, x, y, 11.5, { bold: true }); y -= 15; }
    y -= 2;
    for (const para of paras) for (const line of wrap(para, 9.5, false, w, 4)) { draw(line, x, y, 9.5, { color: rgb(0.2, 0.2, 0.2) }); y -= 12.5; }
    y -= 3;
    for (const [k, v] of kv) {
      draw(k, x, y, 9, { color: GREY });
      const lines = wrap(v, 9, false, w - 42, 3);
      lines.forEach((line, i) => draw(line, x + 42, y - i * 11.5, 9));
      y -= 13 + (lines.length - 1) * 11.5;
    }
    return y;
  }
  const yLeft = block(LEFT, leftW, colTop + 6.5, ORG.name, [ORG.registration, ORG.office, ORG.communication], [
    ['PAN', ORG.pan], ['80G URN', ORG.urn80g + ' · ' + ORG.valid80g], ['12A URN', ORG.urn12a + ' · ' + ORG.valid12a]]);
  const yRight = block(rightX, rightW, colTop + 6.5, r.donorName, [r.donorAddress], [['PAN', r.donorPan], ['Email', r.donorEmail]]);
  let y = Math.min(yLeft, yRight) - 14;

  // Line item table.
  const tableTop = y;
  rule(tableTop);
  draw('Item Description', LEFT, tableTop - 15, 9.5, { color: GREY });
  draw('Amount', RIGHT, tableTop - 15, 9.5, { color: GREY, align: 'right' });
  rule(tableTop - 22);
  draw('Donation', LEFT, tableTop - 37, 11, { bold: true });
  const purposeLines = wrap('Purpose: ' + r.purpose + ' · ' + methodText(r.method) + (r.recurring ? ' · Recurring gift' : ''), 9.5, false, 110 * MM, 3);
  purposeLines.forEach((line, i) => draw(line, LEFT, tableTop - 50 - i * 12, 9.5, { color: rgb(0.42, 0.44, 0.48) }));
  const amountText = '₹' + formatInr(r.amountPaise);
  draw(amountText, RIGHT, tableTop - 37, 11, { bold: true, align: 'right' });
  y = tableTop - 50 - purposeLines.length * 12 - 8;

  // Total block, right aligned.
  const boxX = RIGHT - 78 * MM;
  rule(y, boxX, RIGHT);
  draw('Total', boxX, y - 24, 10.5, { bold: true });
  draw(amountText, RIGHT, y - 26, 20, { bold: true, align: 'right' });
  draw('Amount Received', boxX, y - 46, 10);
  draw(amountText, RIGHT, y - 46, 10, { align: 'right' });
  y -= 70;

  const wordLines = wrap('Amount in words: ' + amountInWords(r.amountPaise), 9.5, false, RIGHT - LEFT, 2);
  wordLines.forEach((line, i) => draw(line, LEFT, y - i * 12, 9.5, { color: rgb(0.27, 0.27, 0.27) }));
  y -= wordLines.length * 12 + 6;
  draw(NO_GOODS, LEFT, y, 9.5, { color: rgb(0.27, 0.27, 0.27) });
  y -= 14;

  // Signature and seal.
  const sealH = 25 * MM;
  const sealW = sealH * seal.width / seal.height;
  page.drawImage(seal, { x: LEFT, y: y - sealH, width: sealW, height: sealH });
  draw('Authorised Signatory', LEFT, y - sealH - 12, 9.5, { color: GREY });
  y -= sealH + 40;

  draw('Tax Deduction for the Donor', LEFT, y, 9.5, { color: GREY });
  y -= 13;
  for (const line of wrap(EXEMPTION_TEXT, 9.5, false, RIGHT - LEFT, 3)) { draw(line, LEFT, y, 9.5); y -= 12.5; }
  y -= 6;
  draw('Note', LEFT, y, 9.5, { color: GREY });
  y -= 13;
  for (const line of wrap(NOTE_TEXT, 9.5, false, RIGHT - LEFT, 2)) { draw(line, LEFT, y, 9.5); y -= 12.5; }

  // Footer.
  rule(10 * MM + 14);
  draw(ORG.contact, LEFT, 10 * MM + 3, 8);
  return { bytes: await doc.save(), contentBottom: y, footerTop: 10 * MM + 14 };
}

module.exports = { buildReceiptPdf, ORG };
