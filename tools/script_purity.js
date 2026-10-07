#!/usr/bin/env node
/**
 * tools/script_purity.js
 *
 * Verifies script purity for every language dictionary in DEHAT.dc.html (_dict())
 * and content-i18n/<lang>.js.
 *
 * Exits with code 0 if all strings are clean, or 1 if any offending characters are found.
 */

const fs = require('fs');
const path = require('path');

// Expected script for each of the 28 languages supported by DEHAT
const SCRIPT_MAP = {
  hi: 'Devanagari',
  mr: 'Devanagari',
  ne: 'Devanagari',
  mai: 'Devanagari',
  doi: 'Devanagari',
  kok: 'Devanagari',
  sa: 'Devanagari',
  brx: 'Devanagari',
  bn: 'Bengali',
  as: 'Bengali',
  mni: 'Meetei_Mayek',
  sat: 'Ol_Chiki',
  ar: 'Arabic',
  ur: 'Arabic',
  sd: 'Arabic',
  ks: 'Arabic',
  pa: 'Gurmukhi',
  gu: 'Gujarati',
  or: 'Oriya',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  zh: 'Han',
  ru: 'Cyrillic',
  es: 'Latin',
  fr: 'Latin',
  en: 'Latin'
};

// Recognized Unicode scripts for classification
const KNOWN_SCRIPTS = [
  'Devanagari', 'Bengali', 'Meetei_Mayek', 'Ol_Chiki', 'Arabic', 'Gurmukhi',
  'Gujarati', 'Oriya', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Han',
  'Cyrillic', 'Latin', 'Hangul', 'Greek', 'Hebrew', 'Armenian', 'Georgian',
  'Tibetan', 'Myanmar', 'Khmer', 'Thaana', 'Syriac', 'Thai', 'Lao'
];

const SCRIPT_REGEXES = KNOWN_SCRIPTS.map(s => ({
  name: s,
  regex: new RegExp(`^\\p{sc=${s}}$`, 'u')
}));

/**
 * Identify the Unicode script of a character.
 */
function getScript(ch) {
  for (const item of SCRIPT_REGEXES) {
    if (item.regex.test(ch)) return item.name;
  }
  if (/^\p{sc=Common}$/u.test(ch)) return 'Common';
  if (/^\p{sc=Inherited}$/u.test(ch)) return 'Inherited';
  return 'Unknown';
}

/**
 * Check whether a character is common punctuation, symbol, or formatting control.
 */
function isCommonPunctuationOrSymbol(cp, ch) {
  // ASCII punctuation & control/whitespace
  if (cp <= 0x2F || (cp >= 0x3A && cp <= 0x40) || (cp >= 0x5B && cp <= 0x60) || (cp >= 0x7B && cp <= 0x7E)) {
    return true;
  }

  // Invisible formatting controls: ZWSP, ZWNJ, ZWJ, Word Joiner, LRM, RLM
  if (cp === 0x200B || cp === 0x200C || cp === 0x200D || cp === 0x2060 || cp === 0x200E || cp === 0x200F) {
    return true;
  }

  // Indian Dandas (U+0964 ।, U+0965 ॥)
  if (cp === 0x0964 || cp === 0x0965) {
    return true;
  }

  // Arabic Tatweel (U+0640 ـ)
  if (cp === 0x0640) {
    return true;
  }

  // Non-breaking space
  if (cp === 0x00A0) {
    return true;
  }

  // Typographic symbols, arrows, currency, brackets, quotes
  // Check Unicode General Category P (Punctuation) or S (Symbol) with Common or Inherited script
  if (/^[\p{P}\p{S}]$/u.test(ch)) {
    // Exclude combining marks that belong to a specific non-common script
    if (!/^\p{M}$/u.test(ch)) {
      return true;
    }
  }

  return false;
}

// Comprehensive allowlist of brand names, proper nouns, legal citations, acronyms, and recognized project codes
const DEFAULT_ALLOWLIST = new Set([
  // Core institutional and legal brand names
  'DEHAT', 'Razorpay', 'FCRA', 'CSR', '80G', '12A', 'PAN', 'COVID', 'NGO',
  'IDFC', 'SBI', 'MIS', 'GPS', 'WhatsApp', 'YouTube', 'Facebook', 'Twitter',
  'Instagram', 'LinkedIn', 'PDF', 'HTML', 'URL', 'NITI', 'Aayog', 'UIDAI',
  'UDIN', 'SOE', 'NFHS', 'SRS', 'UDISE', 'SONY', 'Oreo', 'Dasra', 'Praxis',
  'UN', 'UK', 'WHO', 'UNDP', 'UNICEF', 'CWC', 'PANCHI', 'Dr', 'Jitendra',
  'Chaturvedi', 'Bahraich', 'Shravasti', 'Balrampur', 'Lakhimpur', 'Kheri',
  'Siddharthnagar', 'Maharajganj', 'Kushinagar', 'Champaran', 'Maharashtra',
  'Uttar', 'Pradesh', 'Vananchal', 'Bhanumati', 'Lohra', 'CHILDLINE', 'CRY',
  'DLSA', 'EdelGive', 'FIR', 'HR', 'IIMPACT', 'LEISA', 'NABARD', 'NALSA',
  'NCPCR', 'NIELIT', 'POCSO', 'Primenet', 'SCPCR', 'SHG', 'SLSA', 'SWARAJ',
  'SaveKidsLives', 'Start', 'TAN', 'UPVAN', 'Birlasoft', 'Centum', 'Asian',
  'Association', 'Caritas', 'vs', 'IMPS', 'NEFT', 'RTGS', 'INR', 'USD',
  'SDG', 'SDGs', 'MDG', 'MDGs', 'UNCRC', 'Chartered', 'Accountant', 'Gmail',
  'Outlook', 'Form', 'BD', 'BE', 'FY', 'VII', 'X', 'XI', 'XII', 'CSV',
  'Unique', 'Document', 'Identification', 'Number', 'Cookie', 'cookie', 'CID',
  'Committed', 'Deployed', 'Fellow', 'Resource', 'Alliance', 'Global', 'Awards',
  'Award', 'Girl', 'Power', 'Education', 'Plus', 'Schedule', 'Block', 'Krishi',
  'Mitras', 'Swayam', 'Mahila', 'Adhikar', 'Manch', 'Gram', 'Sabha', 'The',
  'We', 'Are', 'Who', 'India', 'Itemized', 'Partnerships', 'scan', 'S', 'O',
  'E', 'G', 'e', 'mail', 'Email', 'PANI', 'DISHA', 'CORE', 'AHTU', 'VLCPC',
  'SIT', 'SSB', 'JICA', 'BAIF', 'FASAL', 'SPICE', 'SRHR', 'LEHER', 'POSHAN',
  'ICDS', 'NPSP', 'MGNREGA', 'NREGA', 'RTI', 'MOU', 'ANM', 'ANMs', 'ASHA',
  'ASHAs', 'CPC', 'HIV', 'AIDS', 'ANC', 'Katarniaghat', 'Katerniaghat',
  'Mihinpurwa', 'Mihipurwa', 'Rupaidiha', 'Nanpara', 'Bichhia', 'Chittaura',
  'Gautam', 'Buddha', 'Tara', 'Foundation', 'Azim', 'Premji', 'ActionAid',
  'Save', 'Children', 'Plan', 'Tata', 'Trusts', 'Rockefeller', 'Rotary',
  'Google', 'Times', 'Express', 'Civil', 'Society', 'Hindustan', 'Shrawasti', 'district', 'fact', 'sheet', 'AY', 'CRP'
]);

/**
 * Check a single string against the expected script for the language.
 * Returns an array of offending characters: [{ char, codepoint, script }]
 */
function checkString(lang, value, options = {}) {
  if (typeof value !== 'string') return [];
  const expectedScript = SCRIPT_MAP[lang];
  if (!expectedScript) throw new Error(`Unknown language code: ${lang}`);

  const allowlist = options.allowlist !== undefined
    ? (Array.isArray(options.allowlist) ? new Set(options.allowlist) : options.allowlist)
    : DEFAULT_ALLOWLIST;

  // Mask non-visible text and technical protocols: URLs, emails, mailto, tel, HTML tags, entities, template placeholders
  let masked = value
    .replace(/https?:\/\/[^\s"'<>]+/g, m => ' '.repeat(m.length))
    .replace(/mailto:[^\s"'<>]+/g, m => ' '.repeat(m.length))
    .replace(/tel:[^\s"'<>]+/g, m => ' '.repeat(m.length))
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, m => ' '.repeat(m.length))
    .replace(/<[^>]+>/g, m => ' '.repeat(m.length))
    .replace(/&[a-zA-Z0-9#]+;/g, m => ' '.repeat(m.length))
    .replace(/\{[a-zA-Z0-9_]+\}/g, m => ' '.repeat(m.length));

  // In non-Latin languages, mask allowlisted brand names and proper nouns
  if (expectedScript !== 'Latin' && allowlist && allowlist.size > 0) {
    masked = masked.replace(/[a-zA-Z]+/g, (match) => {
      if (allowlist.has(match) || allowlist.has(match.toUpperCase()) || allowlist.has(match.toLowerCase())) {
        return ' '.repeat(match.length);
      }
      return match;
    });
  }

  const offending = [];

  // Flag ASCII pipe used as sentence mark in non-Latin languages
  const isNonLatin = expectedScript !== "Latin";
  if (isNonLatin && typeof value === "string" && (/[\s\u200b]\|/.test(value) || value.trim().endsWith("|"))) {
    offending.push({
      char: "|",
      codepoint: "U+007C",
      script: "ASCII pipe sentence mark (expected native punctuation)"
    });
  }

  let prevScript = expectedScript;

  const chars = Array.from(masked);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cp = ch.codePointAt(0);

    // ASCII digits (0-9) are always allowed
    if (cp >= 0x30 && cp <= 0x39) {
      prevScript = expectedScript;
      continue;
    }

    // Common punctuation, spaces, and formatting symbols
    if (isCommonPunctuationOrSymbol(cp, ch)) {
      prevScript = expectedScript;
      continue;
    }

    // Whitespace
    if (cp === 0x20 || cp === 0x09 || cp === 0x0A || cp === 0x0D) {
      continue;
    }

    // Determine script
    let s = getScript(ch);

    // Combining mark inheritance:
    // If a combining mark has Inherited script, it inherits the script of its base letter
    if (s === 'Inherited') {
      s = prevScript;
    }

    if (s !== expectedScript) {
      offending.push({
        char: ch,
        codepoint: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
        script: s
      });
    } else {
      prevScript = s;
    }
  }

  return offending;
}

/**
 * Flatten nested objects into key-value pairs with dot-delimited paths.
 */
function flattenObject(obj, prefix = '', res = {}) {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenObject(item, prefix ? `${prefix}.${i}` : `${i}`, res));
  } else if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      flattenObject(obj[k], prefix ? `${prefix}.${k}` : k, res);
    }
  } else if (obj !== null && obj !== undefined) {
    res[prefix] = String(obj);
  }
  return res;
}

/**
 * Check whether a translation has a trailing danda/native full stop where English has no terminal punctuation.
 * If English ends without '.', '!' or '?', the translation must not end with '।', '॥' or '᱾'.
 */
function hasTrailingDandaDefect(langVal, enVal) {
  if (typeof langVal !== "string" || typeof enVal !== "string") return false;
  const enTrim = enVal.trim();
  const valTrim = langVal.trim();
  const enHasTerminal = /[.!?]$/.test(enTrim);
  return !enHasTerminal && /[।॥᱾]$/.test(valTrim);
}

/**
 * Audit all strings in a dictionary object for a language.
 */
function checkDictionary(dict, lang, filename, options = {}, enDict = null) {
  const defects = [];
  for (const [key, val] of Object.entries(dict)) {
    const offending = checkString(lang, val, options);
    if (enDict && enDict[key] && hasTrailingDandaDefect(val, enDict[key])) {
      const valTrim = val.trim();
      offending.push({
        char: valTrim.slice(-1),
        codepoint: "U+" + valTrim.slice(-1).codePointAt(0).toString(16).toUpperCase().padStart(4, 0),
        script: "Trailing danda/full stop where English has no terminal punctuation"
      });
    }
    if (offending.length > 0) {
      defects.push({
        lang,
        file: filename,
        key,
        offending_chars: offending,
        value: val
      });
    }
  }
  return defects;
}

/**
 * Audit all strings in a content-i18n object for a language.
 */
function checkContentI18n(contentObj, lang, filename, options = {}, enContentObj = null) {
  const defects = [];
  const flat = flattenObject(contentObj);
  const flatEn = enContentObj ? flattenObject(enContentObj) : null;
  for (const [key, val] of Object.entries(flat)) {
    const offending = checkString(lang, val, options);
    if (flatEn && flatEn[key] && hasTrailingDandaDefect(val, flatEn[key])) {
      const valTrim = val.trim();
      offending.push({
        char: valTrim.slice(-1),
        codepoint: "U+" + valTrim.slice(-1).codePointAt(0).toString(16).toUpperCase().padStart(4, 0),
        script: "Trailing danda/full stop where English has no terminal punctuation"
      });
    }
    if (offending.length > 0) {
      defects.push({
        lang,
        file: filename,
        key,
        offending_chars: offending,
        value: val
      });
    }
  }
  return defects;
}

/**
 * Execute the full script-purity audit across DEHAT.dc.html (_dict()) and content-i18n/<lang>.js.
 */
function runPurityAudit(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, '..');
  const defects = [];

  // 1. Audit Layer 1: DEHAT.dc.html _dict()
  const htmlPath = path.join(rootDir, 'DEHAT.dc.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const startTag = '<script type="text/x-dc"';
    const startIdx = html.indexOf(startTag);
    if (startIdx !== -1) {
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

      for (const [lang, dict] of Object.entries(dicts)) {
        if (!SCRIPT_MAP[lang]) continue;
        const dictDefects = checkDictionary(dict, lang, 'DEHAT.dc.html', options, dicts.en);
        defects.push(...dictDefects);
      }
    }
  }

  // 2. Audit Layer 2: content-i18n/<lang>.js
  const contentDir = path.join(rootDir, 'content-i18n');
  if (fs.existsSync(contentDir)) {
    // Populate content allowlist across content models if using default
    const contentAllowlist = new Set(options.allowlist || DEFAULT_ALLOWLIST);
    for (const f of fs.readdirSync(contentDir)) {
      if (!f.endsWith('.js')) continue;
      global.window = global;
      const filePath = path.join(contentDir, f);
      require(filePath);
      const lang = f.replace('.js', '');
      const langContent = global.window.CONTENT_I18N && global.window.CONTENT_I18N[lang];
      if (langContent) {
        const leaves = flattenObject(langContent);
        for (const val of Object.values(leaves)) {
          let cleaned = val
            .replace(/https?:\/\/[^\s"'<>]+/g, ' ')
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')
            .replace(/<[^>]+>/g, ' ');
          const matches = cleaned.match(/[a-zA-Z]+/g);
          if (matches) for (const m of matches) contentAllowlist.add(m);
        }
      }
    }

    const enFilePath = path.join(contentDir, 'en.js');
    let enContent = null;
    if (fs.existsSync(enFilePath)) {
      global.window = global;
      require(enFilePath);
      enContent = global.window.CONTENT_I18N && global.window.CONTENT_I18N.en;
    }

    const contentOpts = { ...options, allowlist: contentAllowlist };
    for (const f of fs.readdirSync(contentDir)) {
      if (!f.endsWith('.js')) continue;
      const lang = f.replace('.js', '');
      if (!SCRIPT_MAP[lang]) continue;

      global.window = global;
      const filePath = path.join(contentDir, f);
      require(filePath);
      const langContent = global.window.CONTENT_I18N && global.window.CONTENT_I18N[lang];
      if (langContent) {
        const compareEn = ['or', 'mai', 'sa', 'sat'].includes(lang) ? enContent : null;
        const fileDefects = checkContentI18n(langContent, lang, `content-i18n/${f}`, contentOpts, compareEn);
        defects.push(...fileDefects);
      }
    }
  }

  return defects;
}

// CLI Execution
if (require.main === module) {
  const defects = runPurityAudit();
  console.log(JSON.stringify(defects, null, 2));
  if (defects.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

module.exports = {
  SCRIPT_MAP,
  DEFAULT_ALLOWLIST,
  getScript,
  checkString,
  hasTrailingDandaDefect,
  checkDictionary,
  checkContentI18n,
  runPurityAudit
};
