// Reads the first worksheet of an .xlsx file into rows of strings, with no dependencies: an .xlsx is a zip of XML parts.
// Enough for bank and UPI merchant exports (shared, inline and formula strings, numbers); no styles or formulas evaluated.
import { inflateRawSync } from 'node:zlib';

function unzip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Not an .xlsx file (no zip directory found)');
  const files = new Map();
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = buf.readUInt16LE(eocd + 10); n > 0; n--) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('Damaged .xlsx file');
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28), extraLen = buf.readUInt16LE(p + 30), commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + size);
    files.set(name, () => (method === 0 ? raw : inflateRawSync(raw)).toString('utf8'));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const unescape = s => s.replace(/&(lt|gt|quot|apos|amp|#(\d+)|#x([0-9a-f]+));/gi, (m, e, d, h) =>
  d ? String.fromCodePoint(+d) : h ? String.fromCodePoint(parseInt(h, 16)) : { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' }[e.toLowerCase()]);
const texts = xml => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(m => unescape(m[1])).join('');

function firstSheetPath(files) {
  const wb = files.get('xl/workbook.xml')?.() || '';
  const rid = (/<sheet\b[^>]*\br:id="([^"]+)"/.exec(wb) || [])[1];
  const rels = files.get('xl/_rels/workbook.xml.rels')?.() || '';
  const rel = rid && [...rels.matchAll(/<Relationship\b[^>]*>/g)].map(m => m[0]).find(r => r.includes('Id="' + rid + '"'));
  const target = rel && (/Target="([^"]+)"/.exec(rel) || [])[1];
  if (target) return target.startsWith('/') ? target.slice(1) : 'xl/' + target;
  return [...files.keys()].filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)).sort()[0];
}

function colIndex(ref) {
  let n = 0;
  for (const ch of ref) n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
}

export function xlsxRows(buf) {
  const files = unzip(buf);
  const sheet = firstSheetPath(files);
  if (!sheet || !files.has(sheet)) throw new Error('No worksheet found in this .xlsx file');
  const shared = [...(files.get('xl/sharedStrings.xml')?.() || '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => texts(m[1]));
  const rows = [];
  for (const row of files.get(sheet)().matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const out = [];
    for (const c of row[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1], body = c[2] || '';
      const ref = (/\br="([A-Z]+)\d+"/.exec(attrs) || [])[1];
      const type = (/\bt="(\w+)"/.exec(attrs) || [])[1];
      const v = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1];
      const value = type === 's' ? (shared[+v] ?? '') : type === 'inlineStr' ? texts(body) : v == null ? '' : unescape(v);
      out[ref ? colIndex(ref) : out.length] = value;
    }
    rows.push(Array.from(out, x => x ?? ''));
  }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}
