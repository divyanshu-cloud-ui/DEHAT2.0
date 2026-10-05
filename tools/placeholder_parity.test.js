const test = require("node:test");
const assert = require("node:assert/strict");
const {
  extractPlaceholders,
  multisetsEqual,
  checkPlaceholderParity,
  flattenObject
} = require("./placeholder_parity");

test("extractPlaceholders extracts sorted placeholder tokens", () => {
  assert.deepEqual(extractPlaceholders("{shown} of {all} stories"), ["{all}", "{shown}"]);
  assert.deepEqual(extractPlaceholders("{n} stories"), ["{n}"]);
  assert.deepEqual(extractPlaceholders("No placeholders here"), []);
  assert.deepEqual(extractPlaceholders(null), []);
  assert.deepEqual(extractPlaceholders(123), []);
});

test("multisetsEqual compares placeholder arrays regardless of input position if sorted", () => {
  assert.equal(multisetsEqual(["{all}", "{shown}"], ["{all}", "{shown}"]), true);
  assert.equal(multisetsEqual(["{n}"], ["{n}"]), true);
  assert.equal(multisetsEqual(["{all}"], ["{all}", "{shown}"]), false);
  assert.equal(multisetsEqual(["{n}"], ["{x}"]), false);
  assert.equal(multisetsEqual(["{n}"], ["{न}"]), false);
});

test("checkPlaceholderParity passes clean dictionaries", () => {
  const enDict = {
    stories_count: "{shown} of {all} stories",
    items: "All {n} items",
    simple: "Clean string"
  };
  const dicts = {
    en: enDict,
    fr: {
      stories_count: "{shown} sur {all} histoires",
      items: "Tous les {n} éléments",
      simple: "Chaîne propre"
    },
    hi: {
      stories_count: "{all} कहानियों में से {shown}",
      items: "सभी {n} आइटम",
      simple: "साफ स्ट्रिंग"
    }
  };

  const mismatches = checkPlaceholderParity(dicts, enDict, "test.html");
  assert.equal(mismatches.length, 0);
});

test("checkPlaceholderParity flags translated placeholders", () => {
  const enDict = {
    stories_count: "{shown} of {all} stories"
  };
  const dicts = {
    en: enDict,
    zh: {
      stories_count: "{显示}（共 {所有} 个故事）"
    }
  };

  const mismatches = checkPlaceholderParity(dicts, enDict, "test.html");
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].lang, "zh");
  assert.equal(mismatches[0].key, "stories_count");
  assert.deepEqual(mismatches[0].expected, ["{all}", "{shown}"]);
  assert.deepEqual(mismatches[0].actual, ["{所有}", "{显示}"]);
});

test("checkPlaceholderParity flags missing placeholders", () => {
  const enDict = {
    more: "Show {n} More"
  };
  const dicts = {
    en: enDict,
    es: {
      more: "Cargar más proyectos"
    }
  };

  const mismatches = checkPlaceholderParity(dicts, enDict, "test.html");
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].lang, "es");
  assert.equal(mismatches[0].key, "more");
  assert.deepEqual(mismatches[0].actual, []);
});

test("checkPlaceholderParity flags renamed placeholders", () => {
  const enDict = {
    narrow: "Narrow These {n} Projects"
  };
  const dicts = {
    en: enDict,
    es: {
      narrow: "Filtrar por: {x}"
    }
  };

  const mismatches = checkPlaceholderParity(dicts, enDict, "test.html");
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].lang, "es");
  assert.deepEqual(mismatches[0].expected, ["{n}"]);
  assert.deepEqual(mismatches[0].actual, ["{x}"]);
});

test("checkPlaceholderParity flags extra placeholders where English has none", () => {
  const enDict = {
    simple: "Plain English title"
  };
  const dicts = {
    en: enDict,
    fr: {
      simple: "Titre avec {extra} token"
    }
  };

  const mismatches = checkPlaceholderParity(dicts, enDict, "test.html");
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].lang, "fr");
  assert.deepEqual(mismatches[0].expected, []);
  assert.deepEqual(mismatches[0].actual, ["{extra}"]);
});

test("flattenObject correctly flattens nested objects and arrays", () => {
  const nested = {
    a: {
      b: "val_b",
      c: ["item0", "item1"]
    },
    d: "val_d"
  };
  const flat = flattenObject(nested);
  assert.equal(flat["a.b"], "val_b");
  assert.equal(flat["a.c.0"], "item0");
  assert.equal(flat["a.c.1"], "item1");
  assert.equal(flat["d"], "val_d");
});
