/**
 * tools/script_purity.test.js
 *
 * Unit tests for script_purity tool.
 * Verifies script checking, fixture detection (clean, Hangul-in-mni, Bengali-virama-in-mni, Latin-word-in-hi without allowlist),
 * allowlist functionality, combining mark inheritance, and punctuation handling.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  checkString,
  checkDictionary,
  checkContentI18n,
  SCRIPT_MAP,
  DEFAULT_ALLOWLIST,
  getScript
} = require('./script_purity.js');

describe('Script Purity Gate & Validator Tests', () => {

  test('SCRIPT_MAP contains all expected language-script mappings', () => {
    assert.equal(SCRIPT_MAP.hi, 'Devanagari');
    assert.equal(SCRIPT_MAP.mni, 'Meetei_Mayek');
    assert.equal(SCRIPT_MAP.bn, 'Bengali');
    assert.equal(SCRIPT_MAP.as, 'Bengali');
    assert.equal(SCRIPT_MAP.brx, 'Devanagari');
    assert.equal(SCRIPT_MAP.ar, 'Arabic');
    assert.equal(SCRIPT_MAP.ur, 'Arabic');
    assert.equal(SCRIPT_MAP.ks, 'Arabic');
    assert.equal(SCRIPT_MAP.pa, 'Gurmukhi');
    assert.equal(SCRIPT_MAP.gu, 'Gujarati');
    assert.equal(SCRIPT_MAP.or, 'Oriya');
    assert.equal(SCRIPT_MAP.ta, 'Tamil');
    assert.equal(SCRIPT_MAP.te, 'Telugu');
    assert.equal(SCRIPT_MAP.kn, 'Kannada');
    assert.equal(SCRIPT_MAP.ml, 'Malayalam');
    assert.equal(SCRIPT_MAP.sat, 'Ol_Chiki');
    assert.equal(SCRIPT_MAP.zh, 'Han');
    assert.equal(SCRIPT_MAP.ru, 'Cyrillic');
    assert.equal(SCRIPT_MAP.en, 'Latin');
    assert.equal(SCRIPT_MAP.es, 'Latin');
    assert.equal(SCRIPT_MAP.fr, 'Latin');
  });

  test('Fixture 1: Clean string in mni passes without defects', () => {
    const cleanMni = 'ꯄꯥꯎꯈꯨꯝ ꯑꯃꯁꯨꯡ ꯋꯥꯐꯝ ꯑꯁꯤ ꯃꯌꯦꯛ ꯁꯦꯡꯅꯥ ꯎꯠꯂꯤ꯫';
    const defects = checkString('mni', cleanMni);
    assert.deepEqual(defects, [], 'Clean Meitei Mayek string must have zero defects');
  });

  test('Fixture 2: Clean string in hi passes without defects', () => {
    const cleanHi = 'यह एक शुद्ध हिंदी वाक्य है, जिसमें विराम चिह्न । और अंक 2026 शामिल हैं।';
    const defects = checkString('hi', cleanHi);
    assert.deepEqual(defects, [], 'Clean Hindi Devanagari string must have zero defects');
  });

  test('Fixture 3: Hangul-in-mni fails with offending character details', () => {
    // Corrupted key example from mni nav_answers: ꯄꯥ걶ꯅꯤꯡꯁꯤꯡ
    const corruptedMni = 'ꯄꯥ걶ꯅꯤꯡꯁꯤꯡ';
    const defects = checkString('mni', corruptedMni);
    assert.equal(defects.length, 1, 'Should detect exactly one offending character');
    assert.equal(defects[0].char, '걶');
    assert.equal(defects[0].codepoint, 'U+AC76');
    assert.equal(defects[0].script, 'Hangul');
  });

  test('Fixture 4: Bengali-virama-in-mni fails with offending character details', () => {
    // Corrupted key example containing Bengali virama U+09CD instead of Apun Iyek U+ABED
    const viramaCorrupted = 'ꯅꯇ্ꯇꯅ';
    const defects = checkString('mni', viramaCorrupted);
    assert.equal(defects.length, 1, 'Should detect Bengali virama as defect');
    assert.equal(defects[0].char, '\u09CD');
    assert.equal(defects[0].codepoint, 'U+09CD');
    assert.equal(defects[0].script, 'Bengali');
  });

  test('Fixture 5: Latin-word-in-hi without allowlist fails', () => {
    const textWithLatin = 'यह एक apple है';
    const defects = checkString('hi', textWithLatin, { allowlist: [] });
    assert.equal(defects.length, 5, 'Should flag all 5 letters of apple when allowlist is empty');
    assert.equal(defects[0].char, 'a');
    assert.equal(defects[0].script, 'Latin');
    assert.equal(defects[4].char, 'e');
    assert.equal(defects[4].script, 'Latin');
  });

  test('Fixture 6: Allowlisted Latin word in hi passes', () => {
    const textWithBrand = 'DEHAT की ओर से सादर प्रणाम।';
    const defects = checkString('hi', textWithBrand, { allowlist: ['DEHAT'] });
    assert.deepEqual(defects, [], 'Allowlisted brand name DEHAT in Hindi string must pass');
  });

  test('Common punctuation, formatting controls, and currency symbols pass', () => {
    const textWithSymbols = '“DEHAT · ₹5,000 – विवरण … [सूचना]”';
    const defects = checkString('hi', textWithSymbols, { allowlist: ['DEHAT'] });
    assert.deepEqual(defects, [], 'Quotes, middle dot, rupee, en-dash, ellipsis, brackets must pass');
  });

  test('URLs, emails, and template placeholders are masked and pass', () => {
    const textWithUrls = 'संपर्क: info@dehatindia.org या https://dehatindia.org/impact देखें। कुल {count} गाँव।';
    const defects = checkString('hi', textWithUrls, { allowlist: [] });
    assert.deepEqual(defects, [], 'Valid URLs, emails, and template parameters must not trigger defects');
  });

  test('Combining marks: Bengali virama after Bengali letter passes in bn, fails in mni', () => {
    const bengaliText = 'যুক্ত';
    assert.deepEqual(checkString('bn', bengaliText), [], 'Bengali conjunct must pass in bn');
    const mniWithBengaliVirama = 'ꯀ্';
    const defects = checkString('mni', mniWithBengaliVirama);
    assert.equal(defects.length, 1);
    assert.equal(defects[0].script, 'Bengali');
  });

  test('checkDictionary outputs correct defect schema', () => {
    const mockDict = {
      good_key: 'ꯄꯥꯎꯈꯨꯝ',
      bad_key: 'ꯄꯥ걶ꯅꯤꯡꯁꯤꯡ'
    };
    const results = checkDictionary(mockDict, 'mni', 'DEHAT.dc.html');
    assert.equal(results.length, 1);
    assert.equal(results[0].lang, 'mni');
    assert.equal(results[0].file, 'DEHAT.dc.html');
    assert.equal(results[0].key, 'bad_key');
    assert.equal(results[0].value, 'ꯄꯥ걶ꯅꯤꯡꯁꯤꯡ');
    assert.equal(results[0].offending_chars[0].char, '걶');
  });

  test('checkContentI18n outputs correct defect schema for nested objects', () => {
    const mockContent = {
      section: {
        item: {
          text: 'अधिकाºयांची'
        }
      }
    };
    const results = checkContentI18n(mockContent, 'mr', 'content-i18n/mr.js');
    assert.equal(results.length, 1);
    assert.equal(results[0].lang, 'mr');
    assert.equal(results[0].file, 'content-i18n/mr.js');
    assert.equal(results[0].key, 'section.item.text');
    assert.equal(results[0].offending_chars[0].char, 'º');
    assert.equal(results[0].offending_chars[0].script, 'Latin');
  });

  test('checkDictionary flags ASCII pipe sentence mark in non-Latin languages', () => {
    const dict = {
      test_clean: 'ଏକ ସୁନ୍ଦର କାହାଣୀ ।',
      test_pipe: 'ଏକ ସୁନ୍ଦର କାହାଣୀ |'
    };
    const results = checkDictionary(dict, 'or', 'DEHAT.dc.html');
    assert.equal(results.length, 1);
    assert.equal(results[0].lang, 'or');
    assert.equal(results[0].key, 'test_pipe');
    assert.equal(results[0].offending_chars[0].char, '|');
  });

});
