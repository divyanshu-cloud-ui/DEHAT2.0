// audit_all_28_languages.js
// Comprehensive audit across all 28 supported languages for DEHAT

const fs = require('fs');
const path = require('path');

const ALL_LANGUAGES = [
  // Canonical (2)
  'en', 'hi',
  // UN / Global (5)
  'es', 'fr', 'ru', 'ar', 'zh',
  // Indian Scheduled & Regional (21)
  'ur', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'mai', 'as', 'ne', 
  'kok', 'sa', 'sd', 'or', 'ml', 'pa', 'doi', 'brx', 'sat', 'mni', 'ks'
];

async function runAudit() {
  console.log('================================================================');
  console.log(`Starting Comprehensive Audit across all ${ALL_LANGUAGES.length} languages...`);
  console.log('================================================================\n');

  // 1. Load Layer 1: DEHAT.dc.html _dict()
  const html = fs.readFileSync(path.join(__dirname, 'DEHAT.dc.html'), 'utf8');
  const startTag = '<script type="text/x-dc"';
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) throw new Error('Could not extract script from DEHAT.dc.html');
  const scriptContentStart = html.indexOf('>', startIdx) + 1;
  const scriptEnd = html.indexOf('</script>', scriptContentStart);
  const script = html.substring(scriptContentStart, scriptEnd);
  
  const dictIdx = script.indexOf('_dict() {');
  const retMarker = 'return { en: EN, hi: HI';
  const retIdx = script.indexOf(retMarker, dictIdx);
  const endIdx = script.indexOf('\n  }', retIdx);
  const dictCode = 'function ' + script.substring(dictIdx, endIdx + 4);
  const fn = new Function(dictCode + '; return _dict();');
  const dicts = fn();
  const enDictKeys = Object.keys(dicts.en);

  // 2. Load Layer 2: content-i18n was split per-language (content-i18n/<code>.js) because the
  // combined file was 31MB, shipped to every visitor regardless of their language. Load every
  // split file here so this audit still sees the full 28-language set in one pass.
  global.window = global;
  const contentI18nDir = path.join(__dirname, 'content-i18n');
  for (const f of fs.readdirSync(contentI18nDir)) {
    if (f.endsWith('.js')) require(path.join(contentI18nDir, f));
  }
  const i18n = window.CONTENT_I18N;
  const hiContent = i18n.hi;

  // Flatten canonical content fields
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
  const canonicalContentLeaves = getLeaves(hiContent);
  const canonicalContentCount = Object.keys(canonicalContentLeaves).length;

  // 3. Load Layer 3: partner-data.js
  const partnerModule = await import(path.join(__dirname, 'partner-data.js'));
  const P = partnerModule.PARTNER || partnerModule.default;
  const canonicalPartnerLeaves = getLeaves(P.en);
  const canonicalPartnerCount = Object.keys(canonicalPartnerLeaves).length;

  console.log(`Canonical Baseline:`);
  console.log(`  Layer 1 (_dict().en): ${enDictKeys.length} keys`);
  console.log(`  Layer 2 (CONTENT_I18N.hi): ${canonicalContentCount} leaf fields across ${Object.keys(hiContent).length} sections`);
  console.log(`  Layer 3 (PARTNER.en): ${canonicalPartnerCount} leaf fields\n`);

  // Pre-Audit: Renderer Reads vs Data Has Audit (§3 ANTIGRAVITY_HANDOFF_NEXT.md)
  console.log('----------------------------------------------------------------');
  console.log('Running Pre-Audit: Renderer-Reads-vs-Data-Has & English Invariants...');
  
  // 1. T.<key> template reads vs _dict().en
  const tMatches = [...html.matchAll(/\bT\.([a-zA-Z0-9_]+)\b/g)].map(m => m[1]);
  const uniqueT = [...new Set(tMatches)];
  const missingTInEn = uniqueT.filter(k => !(k in dicts.en));
  if (missingTInEn.length > 0) {
    console.error(`✖ FAIL: ${missingTInEn.length} T.<key> reads missing in _dict().en:`, missingTInEn);
  } else {
    console.log(`✔ PASS: All ${uniqueT.length} renderer T.<key> reads exist in _dict().en`);
  }

  // 2. P.<prop> reads in _partnerView vs PARTNER.en
  const pStart = html.indexOf('_partnerView(allProjects');
  const pEnd = html.indexOf('render()', pStart);
  const pCode = html.substring(pStart, pEnd !== -1 ? pEnd : pStart + 20000);
  const pMatches = [...pCode.matchAll(/\bP\.([a-zA-Z0-9_]+)\b/g)].map(m => m[1]);
  const uniqueP = [...new Set(pMatches)];
  const missingPInEn = uniqueP.filter(prop => !(prop in P.en));
  if (missingPInEn.length > 0) {
    console.error(`✖ FAIL: ${missingPInEn.length} P.<field> reads missing in PARTNER.en:`, missingPInEn);
  } else {
    console.log(`✔ PASS: All ${uniqueP.length} _partnerView P.<field> reads exist in PARTNER.en`);
  }

  // 3. EN Canonical Non-Empty Invariants & Global Stub Detection
  const STUB_REGEX = /^\{\{\s*T\.[a-zA-Z0-9_]+\s*\}\}$/;
  let totalStubs = 0;
  for (const l of ALL_LANGUAGES) {
    if (dicts[l]) {
      const stubs = Object.keys(dicts[l]).filter(k => typeof dicts[l][k] === 'string' && STUB_REGEX.test(dicts[l][k].trim()));
      if (stubs.length > 0) {
        console.error(`✖ FAIL: ${l} contains ${stubs.length} self-referencing template stubs:`, stubs);
        totalStubs += stubs.length;
      }
    }
  }
  if (totalStubs === 0) {
    console.log(`✔ PASS: Zero self-referencing template stubs across all ${ALL_LANGUAGES.length} dictionaries`);
  }

  // 4. Invariant: No frozen 'twenty' in ledger keys
  const twentyCheckKeys = ['fin_twenty_years', 'fin_explore_title', 'fin_all_twenty_years', 'stat_lbl_investment'];
  const enFrozen = twentyCheckKeys.filter(k => /\btwenty\b/i.test(dicts.en[k]));
  if (enFrozen.length > 0) {
    console.error(`✖ FAIL: English dictionary contains frozen 'twenty' in ledger keys:`, enFrozen);
  } else {
    console.log(`✔ PASS: Ledger span and explorer keys contain no frozen 'twenty' in English`);
  }

  const enDictEmpties = Object.keys(dicts.en).filter(k => typeof dicts.en[k] !== 'string' || dicts.en[k].trim() === '');
  const enContentLeaves = getLeaves(i18n.en);
  const enContentEmpties = Object.keys(enContentLeaves).filter(k => typeof enContentLeaves[k] !== 'string' || enContentLeaves[k].trim() === '');
  const enPartnerEmpties = Object.keys(canonicalPartnerLeaves).filter(k => typeof canonicalPartnerLeaves[k] !== 'string' || canonicalPartnerLeaves[k].trim() === '');
  
  if (enDictEmpties.length === 0 && enContentEmpties.length === 0 && enPartnerEmpties.length === 0) {
    console.log(`✔ PASS: Zero empty strings across all English canonical layers (Dict: ${Object.keys(dicts.en).length}, Content: ${Object.keys(enContentLeaves).length}, Partner: ${canonicalPartnerCount})`);
  } else {
    console.error(`✖ FAIL: Empty strings found in EN (Dict: ${enDictEmpties.length}, Content: ${enContentEmpties.length}, Partner: ${enPartnerEmpties.length})`);
  }
  console.log('----------------------------------------------------------------\n');

  // 5. Template Attribute Residue Gate (Handoff 143)
  const templatePortion = html.substring(0, startIdx);
  const attrRegex = /\b(aria-label|title|alt|placeholder)\s*=\s*"([^"]*)"/gi;
  let attrMatch;
  const attributeResidues = [];
  while ((attrMatch = attrRegex.exec(templatePortion)) !== null) {
    const attr = attrMatch[1];
    const val = attrMatch[2];
    // Check if attribute contains literal text (not an interpolation) with 2+ English words
    if (!val.includes("{{") && /\b[a-zA-Z]{2,}\b.*\b[a-zA-Z]{2,}\b/.test(val)) {
      const line = templatePortion.substring(0, attrMatch.index).split("\n").length;
      attributeResidues.push({ line, attr, val });
    }
  }
  if (attributeResidues.length > 0) {
    console.error(`✖ FAIL: ${attributeResidues.length} literal attribute residues found in template:`, attributeResidues);
  } else {
    console.log(`✔ PASS: Zero literal attribute residues across template aria-label, title, alt, and placeholder attributes`);
  }

  // 6. Handoff 145 Verification Gates: Human Roster & CSR Categorisation
  console.log('Running Handoff 145 Verification: Human Roster & CSR Categorisation...');
  let handoff145Failures = [];

  // (a) Template wiring checks
  const requiredTemplateCalls = [
    "this._tc('team', sel, 'name'",
    "this._tc('team', id, 'name'",
    "this._tc('team', 'founder', 'name'",
    "this._tc('team', 'founder', 'quote'",
    "this._tc('team', 'founder', 'story'",
    "this._tc('team', 'founder', 'story2'",
    "this._tc('team', t.id, 'name'",
    "this._tc('team', t.id, 'quote'",
    "this._tc('team', t.id, 'story'",
    "this._tc('team', t.id, 'story2'",
    "this._tc(boardSection, m.id, 'name'"
  ];
  for (const call of requiredTemplateCalls) {
    if (!html.includes(call)) {
      handoff145Failures.push(`Template missing required call: ${call}`);
    }
  }

  // (b) Content-i18n team, board, advisory, csr_word checks across all 28 languages
  const expectedTeamIds = [
    't01', 't02', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10',
    't11', 't12', 't13', 't14', 't15', 't16', 't17', 't18', 't19', 't20',
    't21', 't22', 't23', 't24', 't25', 't26', 't27', 't28', 't29', 't30',
    't31', 't32', 't33', 't34', 'founder'
  ];
  const expectedBoardIds = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
  const expectedAdvisoryIds = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a10'];
  const expectedCsrKeys = ['i', 'ii', 'iii', 'iv', 'x', 'xii'];

  for (const l of ALL_LANGUAGES) {
    const langData = i18n[l];
    if (!langData) {
      handoff145Failures.push(`${l}: missing in CONTENT_I18N`);
      continue;
    }
    // Team check
    if (!langData.team) {
      handoff145Failures.push(`${l}: missing 'team' section`);
    } else {
      for (const tid of expectedTeamIds) {
        const mem = langData.team[tid];
        if (!mem) {
          handoff145Failures.push(`${l}: team missing ${tid}`);
        } else {
          for (const field of ['name', 'quote', 'story', 'story2']) {
            if (!mem[field] || typeof mem[field] !== 'string' || mem[field].trim() === '') {
              handoff145Failures.push(`${l}: team.${tid}.${field} is empty or missing`);
            }
          }
        }
      }
    }
    // Board check
    if (!langData.board) {
      handoff145Failures.push(`${l}: missing 'board' section`);
    } else {
      for (const gid of expectedBoardIds) {
        if (!langData.board[gid] || !langData.board[gid].name || langData.board[gid].name.trim() === '') {
          handoff145Failures.push(`${l}: board.${gid}.name is empty or missing`);
        }
      }
    }
    // Advisory check
    if (!langData.advisory) {
      handoff145Failures.push(`${l}: missing 'advisory' section`);
    } else {
      if ('a9' in langData.advisory) handoff145Failures.push(`${l}: advisory contains defunct a9`);
      if ('a11' in langData.advisory) handoff145Failures.push(`${l}: advisory contains defunct a11`);
      for (const aid of expectedAdvisoryIds) {
        if (!langData.advisory[aid] || !langData.advisory[aid].name || langData.advisory[aid].name.trim() === '') {
          handoff145Failures.push(`${l}: advisory.${aid}.name is empty or missing`);
        }
      }
    }
    // CSR tagMaps check
    const csrMap = (langData.tagMaps || {}).csr_word;
    if (!csrMap) {
      handoff145Failures.push(`${l}: missing tagMaps.csr_word`);
    } else {
      for (const k of expectedCsrKeys) {
        if (!csrMap[k] || typeof csrMap[k] !== 'string' || csrMap[k].trim() === '') {
          handoff145Failures.push(`${l}: tagMaps.csr_word.${k} is empty or missing`);
        }
      }
    }
  }

  if (handoff145Failures.length > 0) {
    console.error(`✖ FAIL: ${handoff145Failures.length} Handoff 145 validation errors:`, handoff145Failures.slice(0, 10));
  } else {
    console.log(`✔ PASS: All Handoff 145 invariants satisfied: 35 team portraits, 7 board names, 9 advisory names (no a9/a11), and 6 CSR categories across all 28 languages!`);
  }
  console.log('----------------------------------------------------------------\n');

  const results = [];
  let allPassed = (missingTInEn.length === 0 && missingPInEn.length === 0 && totalStubs === 0 && enFrozen.length === 0 && enDictEmpties.length === 0 && enContentEmpties.length === 0 && enPartnerEmpties.length === 0 && attributeResidues.length === 0 && handoff145Failures.length === 0);

  for (const lang of ALL_LANGUAGES) {
    let l1Pass = false, l2Pass = false, l3Pass = false;
    let l1Details = '', l2Details = '', l3Details = '';

    // Check Layer 1
    const d = dicts[lang];
    if (!d) {
      l1Details = 'MISSING';
    } else {
      const dKeys = Object.keys(d);
      const missing = enDictKeys.filter(k => !(k in d));
      const empties = dKeys.filter(k => typeof d[k] !== 'string' || d[k].trim() === '');
      const stubs = dKeys.filter(k => typeof d[k] === 'string' && STUB_REGEX.test(d[k].trim()));
      if (missing.length === 0 && empties.length === 0 && stubs.length === 0) {
        l1Pass = true;
        l1Details = `${dKeys.length} keys (0 missing, 0 empty, 0 stubs)`;
      } else {
        l1Details = `FAIL: ${missing.length} missing, ${empties.length} empty, ${stubs.length} stubs`;
      }
    }

    // Check Layer 2
    if (lang === 'en') {
      // Content layer canonical is hi, but en has canonical in canonical_layer2_en.json or content-i18n.js
      const c = i18n[lang];
      if (c) {
        const cLeaves = getLeaves(c);
        l2Pass = true;
        l2Details = `${Object.keys(cLeaves).length} fields (Canonical EN)`;
      } else {
        l2Details = 'MISSING';
      }
    } else {
      const c = i18n[lang];
      if (!c) {
        l2Details = 'MISSING';
      } else {
        const cLeaves = getLeaves(c);
        const cKeys = Object.keys(cLeaves);
        const missing = Object.keys(canonicalContentLeaves).filter(k => !(k in cLeaves));
        const empties = cKeys.filter(k => typeof cLeaves[k] !== 'string' || cLeaves[k].trim() === '');
        if (missing.length === 0 && empties.length === 0 && cKeys.length === canonicalContentCount) {
          l2Pass = true;
          l2Details = `${cKeys.length} fields (100% match, 0 empty)`;
        } else {
          l2Details = `FAIL: ${missing.length} missing, ${empties.length} empty, total ${cKeys.length}/${canonicalContentCount}`;
        }
      }
    }

    // Check Layer 3
    const p = P[lang];
    if (!p) {
      l3Details = 'MISSING';
    } else {
      const pLeaves = getLeaves(p);
      const pKeys = Object.keys(pLeaves);
      const missing = Object.keys(canonicalPartnerLeaves).filter(k => !(k in pLeaves));
      const empties = pKeys.filter(k => typeof pLeaves[k] !== 'string' || pLeaves[k].trim() === '');
      if (missing.length === 0 && empties.length === 0 && pKeys.length === canonicalPartnerCount) {
        l3Pass = true;
        l3Details = `${pKeys.length} fields (100% match, 0 empty)`;
      } else {
        l3Details = `FAIL: ${missing.length} missing, ${empties.length} empty, total ${pKeys.length}/${canonicalPartnerCount}`;
      }
    }

    const langPassed = l1Pass && l2Pass && l3Pass;
    if (!langPassed) allPassed = false;

    results.push({
      lang,
      langPassed,
      l1Pass, l1Details,
      l2Pass, l2Details,
      l3Pass, l3Details
    });
  }

  // Print Summary Table
  console.log('| Code | Language | Layer 1 (Dict) | Layer 2 (Content) | Layer 3 (Partner) | Status |');
  console.log('|---|---|---|---|---|---|');
  for (const r of results) {
    const mark = r.langPassed ? '✔ PASS' : '✖ FAIL';
    console.log(`| **${r.lang.toUpperCase()}** | ${r.lang} | ${r.l1Pass ? '✔' : '✖'} ${r.l1Details} | ${r.l2Pass ? '✔' : '✖'} ${r.l2Details} | ${r.l3Pass ? '✔' : '✖'} ${r.l3Details} | **${mark}** |`);
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('\x1b[32m✔ OVERALL AUDIT RESULT: 100% COMPLETE & VERIFIED ACROSS ALL 28 LANGUAGES!\x1b[0m');
  } else {
    console.log('\x1b[31m✖ OVERALL AUDIT RESULT: PARITY FAILURES DETECTED.\x1b[0m');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
