#!/usr/bin/env node
/**
 * tools/placeholder_parity.js
 *
 * Verifies placeholder parity across all languages against English.
 * For every key, the multiset of {token} placeholders in each language value
 * must equal the English value's multiset.
 *
 * Checks:
 *   1. DEHAT.dc.html (_dict())
 *   2. content-i18n/<lang>.js against content-i18n/en.js
 *
 * Exits with code 0 on clean, or 1 on any mismatch.
 */

const fs = require("fs");
const path = require("path");

const PLACEHOLDER_REGEX = /\{[^{}]+\}/g;

/**
 * Extract all {placeholder} tokens from a string as a sorted array (multiset).
 */
function extractPlaceholders(str) {
  if (typeof str !== "string") return [];
  const matches = str.match(PLACEHOLDER_REGEX);
  return matches ? matches.sort() : [];
}

/**
 * Compare two multisets of placeholders for equality.
 */
function multisetsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Flatten nested objects into dot-delimited paths.
 */
function flattenObject(obj, prefix = "", res = {}) {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenObject(item, prefix ? `${prefix}.${i}` : `${i}`, res));
  } else if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      flattenObject(obj[k], prefix ? `${prefix}.${k}` : k, res);
    }
  } else if (obj !== null && obj !== undefined) {
    res[prefix] = String(obj);
  }
  return res;
}

/**
 * Check placeholder parity for a dictionary map against an English dictionary.
 */
function checkPlaceholderParity(dicts, enDict, file = "DEHAT.dc.html") {
  const mismatches = [];
  const enPlaceholders = {};
  for (const [k, v] of Object.entries(enDict)) {
    const ph = extractPlaceholders(v);
    if (ph.length > 0) {
      enPlaceholders[k] = ph;
    }
  }

  for (const [lang, dict] of Object.entries(dicts)) {
    if (lang === "en") continue;

    // 1. Check all keys that have placeholders in English
    for (const [k, expected] of Object.entries(enPlaceholders)) {
      const val = dict[k] || "";
      const actual = extractPlaceholders(val);
      if (!multisetsEqual(expected, actual)) {
        mismatches.push({
          file,
          lang,
          key: k,
          expected,
          actual,
          enVal: enDict[k],
          val
        });
      }
    }

    // 2. Check if non-English dict has placeholders for keys where English has none
    for (const [k, val] of Object.entries(dict)) {
      if (!enPlaceholders[k]) {
        const actual = extractPlaceholders(val);
        if (actual.length > 0) {
          mismatches.push({
            file,
            lang,
            key: k,
            expected: [],
            actual,
            enVal: enDict[k] || "",
            val
          });
        }
      }
    }
  }
  return mismatches;
}

/**
 * Full audit across DEHAT.dc.html (_dict()) and content-i18n/*.js against en.js.
 */
function auditPlaceholders(rootDir = path.resolve(__dirname, "..")) {
  const mismatches = [];

  // 1. Audit DEHAT.dc.html
  const htmlPath = path.join(rootDir, "DEHAT.dc.html");
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, "utf8");
    const startTag = "<script type=\"text/x-dc\"";
    const startIdx = html.indexOf(startTag);
    if (startIdx !== -1) {
      const scriptContentStart = html.indexOf(">", startIdx) + 1;
      const scriptEnd = html.indexOf("</script>", scriptContentStart);
      const script = html.substring(scriptContentStart, scriptEnd);
      const dictIdx = script.indexOf("_dict() {");
      const retMarker = "return { en: EN, hi: HI";
      const retIdx = script.indexOf(retMarker, dictIdx);
      const endIdx = script.indexOf("\n  }", retIdx);
      const dictCode = "function " + script.substring(dictIdx, endIdx + 4);
      const fn = new Function(dictCode + "; return _dict();");
      const dicts = fn();
      const dcMismatches = checkPlaceholderParity(dicts, dicts.en, "DEHAT.dc.html");
      mismatches.push(...dcMismatches);
    }
  }

  // 2. Audit content-i18n/*.js
  const contentDir = path.join(rootDir, "content-i18n");
  if (fs.existsSync(contentDir) && fs.existsSync(path.join(contentDir, "en.js"))) {
    global.window = {};
    require(path.join(contentDir, "en.js"));
    const enContent = flattenObject((global.window.CONTENT_I18N && global.window.CONTENT_I18N.en) || {});

    const contentDicts = {};
    for (const f of fs.readdirSync(contentDir)) {
      if (!f.endsWith(".js") || f === "en.js") continue;
      const lang = f.replace(".js", "");
      global.window = {};
      const filePath = path.join(contentDir, f);
      delete require.cache[require.resolve(filePath)];
      require(filePath);
      if (global.window.CONTENT_I18N && global.window.CONTENT_I18N[lang]) {
        contentDicts[lang] = flattenObject(global.window.CONTENT_I18N[lang]);
      }
    }
    const cMismatches = checkPlaceholderParity(contentDicts, enContent, "content-i18n");
    mismatches.push(...cMismatches);
  }

  return mismatches;
}

if (require.main === module) {
  const mismatches = auditPlaceholders();
  if (mismatches.length === 0) {
    console.log("OK: Placeholder parity verified across all languages (DEHAT.dc.html & content-i18n).");
    process.exit(0);
  } else {
    console.error(`FAIL: Found ${mismatches.length} placeholder parity mismatch(es):`);
    for (const m of mismatches) {
      console.error(`  [${m.file}] [${m.lang}] ${m.key}: expected [${m.expected.join(", ")}], found [${m.actual.join(", ")}]`);
      console.error(`    EN:  ${m.enVal}`);
      console.error(`    VAL: ${m.val}`);
    }
    process.exit(1);
  }
}

module.exports = {
  extractPlaceholders,
  multisetsEqual,
  flattenObject,
  checkPlaceholderParity,
  auditPlaceholders
};
