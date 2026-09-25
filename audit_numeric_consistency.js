// audit_numeric_consistency.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const indicMap = {
  '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
  '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9',
  '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9',
  '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
  '੦':'0','੧':'1','੨':'2','੩':'3','੪':'4','੫':'5','੬':'6','੭':'7','੮':'8','੯':'9',
  '૦':'0','૧':'1','૨':'2','૩':'3','૪':'4','૫':'5','૬':'6','૭':'7','૮':'8','૯':'9',
  '୦':'0','୧':'1','୨':'2','୩':'3','୪':'4','୫':'5','୬':'6','୭':'7','୮':'8','୯':'9',
  '௦':'0','௧':'1','௨':'2','௩':'3','௪':'4','௫':'5','௬':'6','௭':'7','௮':'8','௯':'9',
  '౦':'0','౧':'1','౨':'2','౩':'3','౪':'4','౵':'5','౬':'6','౭':'7','౮':'8','౯':'9',
  '೦':'0','೧':'1','೨':'2','೩':'3','೪':'4','೫':'5','೬':'6','೭':'7','೮':'8','೯':'9',
  '൦':'0','൧':'1','൨':'2','൩':'3','൪':'4','൫':'5','൬':'6','൭':'7','൮':'8','൯':'9'
};

function extractNumbers(str) {
  if (typeof str !== 'string') return [];
  // replace Indic digits
  let norm = str.split('').map(c => indicMap[c] || c).join('');
  // collapse numbers with commas e.g. 1,000 -> 1000, 80,00,000 -> 8000000
  norm = norm.replace(/(\d+),(\d+)/g, '$1$2').replace(/(\d+),(\d+)/g, '$1$2');
  const matches = norm.match(/\d+/g) || [];
  return matches;
}

async function runNumericAudit() {
  console.log('=== SYSTEMATIC NUMERIC-CONSISTENCY AUDIT ===\n');

  // 1. Layer 1: DEHAT.dc.html _dict()
  console.log('--- Checking Layer 1: DEHAT.dc.html _dict() ---');
  const html = fs.readFileSync(path.join(ROOT, 'DEHAT.dc.html'), 'utf8');
  const scriptMatch = html.match(/<script type=\"text\/x-dc\"[^>]*>([\s\S]*?)<\/script>/);
  const script = scriptMatch[1];
  const dictIdx = script.indexOf('_dict() {');
  const retMarker = 'return { en: EN, hi: HI';
  const retIdx = script.indexOf(retMarker, dictIdx);
  const endIdx = script.indexOf('\n  }', retIdx);
  const dictCode = 'function ' + script.substring(dictIdx, endIdx + 4);
  const dicts = (new Function(dictCode + '; return _dict();'))();

  const enDict = dicts.en;
  let dictMismatches = [];

  for (const [lang, d] of Object.entries(dicts)) {
    if (lang === 'en') continue;
    for (const [k, enVal] of Object.entries(enDict)) {
      const enNums = extractNumbers(enVal);
      if (enNums.length === 0) continue;
      const langVal = d[k] || '';
      const langNums = extractNumbers(langVal);

      // Compare sorted numbers
      const sortedEn = [...enNums].sort();
      const sortedLang = [...langNums].sort();
      if (sortedEn.join(',') !== sortedLang.join(',')) {
        // Filter out false positives (e.g. FY 2023-24 vs 2023-2024 or 2016-17 vs 2016, 2017)
        dictMismatches.push({
          lang, key: k,
          en: enNums, langNums,
          enText: enVal, langText: langVal
        });
      }
    }
  }

  console.log(`Found ${dictMismatches.length} potential numeral differences in Layer 1 across all 27 languages.`);
  // Group by key
  const byKey = {};
  for (const m of dictMismatches) {
    byKey[m.key] = (byKey[m.key] || 0) + 1;
  }
  console.log('Most frequent keys with numeral differences:');
  for (const [k, count] of Object.entries(byKey).sort((a,b)=>b[1]-a[1]).slice(0, 10)) {
    console.log(`  ${k}: ${count} languages (sample EN: "${enDict[k]}")`);
  }

  // 2. Layer 2: content-i18n was split per-language (content-i18n/<code>.js) — load every
  // split file so this check still sees the full 28-language set.
  console.log('\n--- Checking Layer 2: content-i18n/*.js ---');
  global.window = global;
  const contentI18nDir = path.join(ROOT, 'content-i18n');
  for (const f of fs.readdirSync(contentI18nDir)) {
    if (f.endsWith('.js')) require(path.join(contentI18nDir, f));
  }
  const I18N = window.CONTENT_I18N;

  function getLeaves(obj, p='', res={}) {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => getLeaves(item, p ? `${p}.${i}` : `${i}`, res));
    } else if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        getLeaves(obj[k], p ? `${p}.${k}` : k, res);
      }
    } else {
      res[p] = String(obj);
    }
    return res;
  }

  const enContentLeaves = getLeaves(I18N.en);
  let contentMismatches = [];

  for (const [lang, c] of Object.entries(I18N)) {
    if (lang === 'en') continue;
    const langLeaves = getLeaves(c);
    for (const [k, enVal] of Object.entries(enContentLeaves)) {
      const enNums = extractNumbers(enVal);
      if (enNums.length === 0) continue;
      const langVal = langLeaves[k] || '';
      const langNums = extractNumbers(langVal);

      const sortedEn = [...enNums].sort();
      const sortedLang = [...langNums].sort();
      if (sortedEn.join(',') !== sortedLang.join(',')) {
        contentMismatches.push({
          lang, path: k,
          en: enNums, langNums,
          enText: enVal.slice(0, 80), langText: langVal.slice(0, 80)
        });
      }
    }
  }

  console.log(`Found ${contentMismatches.length} potential numeral differences in Layer 2 across all 27 languages.`);

  // 3. Layer 3: partner-data.js
  console.log('\n--- Checking Layer 3: partner-data.js ---');
  const m = await import(path.join(ROOT, 'partner-data.js'));
  const P = m.PARTNER;
  const enPartnerLeaves = getLeaves(P.en);
  let partnerMismatches = [];

  for (const [lang, p] of Object.entries(P)) {
    if (lang === 'en') continue;
    const langLeaves = getLeaves(p);
    for (const [k, enVal] of Object.entries(enPartnerLeaves)) {
      const enNums = extractNumbers(enVal);
      if (enNums.length === 0) continue;
      const langVal = langLeaves[k] || '';
      const langNums = extractNumbers(langVal);

      const sortedEn = [...enNums].sort();
      const sortedLang = [...langNums].sort();
      if (sortedEn.join(',') !== sortedLang.join(',')) {
        partnerMismatches.push({
          lang, path: k,
          en: enNums, langNums,
          enText: enVal.slice(0, 80), langText: langVal.slice(0, 80)
        });
      }
    }
  }

  console.log(`Found ${partnerMismatches.length} potential numeral differences in Layer 3 across all 27 languages.`);
  console.log('\nNumeric audit complete!');
}

runNumericAudit().catch(console.error);
