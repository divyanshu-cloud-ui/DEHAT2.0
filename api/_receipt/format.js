// Pure helpers: money formatting, amount in words (Indian system), financial year in India Standard Time.
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function below1000(n) {
  const parts = [];
  if (n >= 100) { parts.push(ONES[Math.floor(n / 100)] + ' Hundred'); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')); }
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(' ');
}

function wholeInWords(n) {
  if (n === 0) return 'Zero';
  const units = [[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']];
  const parts = [];
  for (const [size, label] of units) {
    if (n >= size) { parts.push(below1000(Math.floor(n / size)) + ' ' + label); n %= size; }
  }
  if (n > 0) parts.push(below1000(n));
  return parts.join(' ');
}

// paise is an integer number of paise (the amount Razorpay reports)
function amountInWords(paise) {
  const total = Math.round(Number(paise));
  const rupees = Math.floor(total / 100);
  const rest = total % 100;
  let text = 'Rupees ' + wholeInWords(rupees);
  if (rest) text += ' and ' + below1000(rest) + ' Paise';
  return text + ' Only';
}

// Indian digit grouping, always two decimals: 100000 paise-less 1000.00 -> 1,000.00 ; 12345678 -> 1,23,456.78
function groupIndian(intPart) {
  const s = String(intPart);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return rest + ',' + last3;
}

function formatInr(paise) {
  const total = Math.round(Number(paise));
  const rupees = Math.floor(total / 100);
  const rest = String(total % 100).padStart(2, '0');
  return groupIndian(rupees) + '.' + rest;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function istParts(epochSeconds) {
  const d = new Date(epochSeconds * 1000 + IST_OFFSET_MS);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

// Indian financial year runs 1 April to 31 March, judged in IST. Returns e.g. '2026-27'.
function financialYear(epochSeconds) {
  const { year, month } = istParts(epochSeconds);
  const start = month >= 4 ? year : year - 1;
  return start + '-' + String((start + 1) % 100).padStart(2, '0');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function receiptDate(epochSeconds) {
  const { year, month, day } = istParts(epochSeconds);
  return day + ' ' + MONTHS[month - 1] + ' ' + year;
}

function receiptNumber(fy, sequence) {
  return 'DEHAT/80G/' + fy + '/' + String(sequence).padStart(6, '0');
}

module.exports = { amountInWords, financialYear, formatInr, receiptDate, receiptNumber };
