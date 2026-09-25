// Cumulative Impact page — every figure in the organisation's existence, sliced by lens.
// Category totals are the same org-wide contribution figures used on the homepage (one headline
// figure per project per category, no double count within a project). A project can appear in more
// than one lens because it carries more than one tag — that is tagging, not adding money twice.
// Money uses the audited fiscal-year ledger (finance-data.js), never the project-card figures, because
// several ongoing projects' card totals are not yet fully received.

export const CATEGORY_LABELS = {
  children_learning: 'children and adolescents reached',
  families: 'families securing entitlements or relief',
  institutions: 'community institutions capacity-built',
  youth_trained: 'youth trained and placed in work',
  women: 'women reached and organised',
  farmers: 'farmers in diversified and natural farming',
  protection_cases: 'child protection cases responded to',
  convergence_inr: 'in government convergence the community drew in',
};

// Audited fiscal-year cumulative receipts, FY2005-06 through FY2024-25 (source: finance-data.js).
export const YEARLY = [
  { fy:'2005-06', received:1156970, cumulative:1156970 },
  { fy:'2006-07', received:1357574, cumulative:2514544 },
  { fy:'2007-08', received:1811574, cumulative:4326118 },
  { fy:'2008-09', received:2209829, cumulative:6535947 },
  { fy:'2009-10', received:2893539, cumulative:9429486 },
  { fy:'2010-11', received:6588805, cumulative:16018291 },
  { fy:'2011-12', received:9166801, cumulative:25185092 },
  { fy:'2012-13', received:11339716, cumulative:36524808 },
  { fy:'2013-14', received:13105781, cumulative:49630589 },
  { fy:'2014-15', received:13271999, cumulative:62902588 },
  { fy:'2015-16', received:11618925, cumulative:74521513 },
  { fy:'2016-17', received:18978518, cumulative:93500031 },
  { fy:'2017-18', received:20202819, cumulative:113702850 },
  { fy:'2018-19', received:7253947, cumulative:120956797 },
  { fy:'2019-20', received:7605247, cumulative:128562044 },
  { fy:'2020-21', received:11761462, cumulative:140323506 },
  { fy:'2021-22', received:11439698, cumulative:151763204 },
  { fy:'2022-23', received:7652809, cumulative:159416013 },
  { fy:'2023-24', received:22036289, cumulative:181452302 },
  { fy:'2024-25', received:16068803, cumulative:197521105 },
];

// UNCRC pillar -> { count of projects carrying that tag, category totals across those projects }
export const UNCRC_LENS = {
  Survival:      { count: 30, totals: { children_learning:13102, families:6217, institutions:750, youth_trained:1886, women:5225, farmers:3772, convergence_inr:22993200 } },
  Development:   { count: 30, totals: { children_learning:15297, families:3836, institutions:523, youth_trained:1886, farmers:2624, convergence_inr:22993200, women:1075, protection_cases:3271 } },
  Participation: { count: 21, totals: { children_learning:8370, families:3126, institutions:499, women:2853, farmers:1312, convergence_inr:22993200, protection_cases:5484 } },
  Protection:    { count: 13, totals: { children_learning:240, institutions:336, protection_cases:5484 } },
};

// Schedule VII item -> { count, totals }. Keyed to match projects-data.js CSR export.
export const CSR_LENS = {
  i:   { count: 12, totals: { children_learning:4362, institutions:302, families:2372, farmers:2460, women:1033 } },
  ii:  { count: 25, totals: { children_learning:15297, families:3126, institutions:241, youth_trained:1886, women:42, protection_cases:5484 } },
  iii: { count: 34, totals: { children_learning:10849, families:3379, institutions:1035, youth_trained:1886, women:4875, farmers:2624, convergence_inr:22993200, protection_cases:5484 } },
  iv:  { count: 6,  totals: { farmers:2460, women:683, institutions:104, families:122, children_learning:2783 } },
  x:   { count: 34, totals: { children_learning:10349, families:6086, institutions:567, youth_trained:1886, women:3578, farmers:3772, convergence_inr:22993200, protection_cases:5484 } },
  xii: { count: 1,  totals: { families:2250 } },
};

// SDG/MDG goal -> { count, totals }. Keyed to match projects-data.js SDG export.
export const SDG_LENS = {
  g1:  { count: 5,  totals: { families:2372, farmers:3772, institutions:152, convergence_inr:22993200, women:683 } },
  g2:  { count: 6,  totals: { institutions:222, families:2372, farmers:2460, women:1033 } },
  g3:  { count: 6,  totals: { children_learning:210, institutions:184, families:2250, women:350 } },
  g4:  { count: 8,  totals: { children_learning:4754, institutions:106 } },
  g5:  { count: 15, totals: { children_learning:2674, institutions:229, farmers:2624, convergence_inr:22993200, women:683, families:122, protection_cases:5484 } },
  g6:  { count: 1,  totals: { farmers:1148 } },
  g8:  { count: 6,  totals: { protection_cases:5484, institutions:45 } },
  g10: { count: 5,  totals: { children_learning:700, institutions:86, families:2250, farmers:1312, convergence_inr:22993200 } },
  g13: { count: 2,  totals: { farmers:1312, women:683, institutions:78, families:122 } },
  g15: { count: 2,  totals: { farmers:1312, women:683, institutions:78, families:122 } },
  g16: { count: 13, totals: { institutions:330, farmers:1312, convergence_inr:22993200, protection_cases:5484 } },
  g17: { count: 9,  totals: { institutions:165, farmers:1312, convergence_inr:22993200, protection_cases:382 } },
  m1:  { count: 12, totals: { youth_trained:1886, children_learning:7002, institutions:345, families:2389, women:4192 } },
  m2:  { count: 7,  totals: { children_learning:7693, families:3126, institutions:58, protection_cases:3271 } },
  m3:  { count: 13, totals: { children_learning:4023, families:3257, institutions:337, youth_trained:1886, women:4192, protection_cases:3271 } },
  m4:  { count: 3,  totals: { institutions:40, children_learning:4152 } },
  m5:  { count: 3,  totals: { institutions:40, children_learning:4152 } },
  m7:  { count: 3,  totals: { children_learning:2783, institutions:26 } },
  m8:  { count: 6,  totals: { children_learning:5272, families:3126, institutions:44, youth_trained:1886 } },
};

// Which projects sit under each lens, so a lens can open into the actual projects rather than
// dead-ending in a number. Derived from the tags on each project in projects-data.js.
export const LENS_IDS = {
  uncrc: {
    Survival: [1,2,4,7,9,10,11,12,13,14,15,16,17,19,20,21,22,23,24,25,26,27,28,29,34,36,37,42,43,46],
    Development: [1,2,3,4,5,6,7,8,9,10,11,12,13,18,22,24,26,28,29,30,34,35,37,38,39,40,41,42,46,48],
    Participation: [1,2,3,4,5,6,7,12,13,14,15,18,24,30,31,32,33,34,38,40,44],
    Protection: [3,6,12,18,30,31,32,33,34,36,44,45,47],
  },
  csr: {
    ii: [1,2,3,4,5,6,7,8,9,10,11,12,13,26,30,31,32,33,34,36,37,38,39,40,41],
    iii: [1,2,3,4,5,6,7,8,9,10,11,12,13,15,17,18,20,21,22,24,26,28,29,30,31,32,33,34,36,40,43,44,45,47],
    x: [1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,36,42],
    i: [12,16,17,19,20,21,22,23,27,28,29,46],
    iv: [14,25,27,28,29,37],
    xii: [23],
  },
  sdg: {
    m2: [2,3,10,13,30,38,39],
    m3: [2,3,9,10,11,13,14,15,17,25,26,30,43],
    m8: [2,9,13,16,25,37],
    g4: [4,5,6,7,8,12,40,41],
    g5: [4,7,8,12,18,24,28,29,30,31,32,33,34,36,40],
    g10: [7,18,23,24,48],
    m1: [9,11,13,14,15,17,21,25,26,37,42,43],
    g3: [12,19,20,22,23,46],
    m7: [14,25,37],
    m4: [16,17,21],
    m5: [16,17,21],
    g16: [18,24,30,31,32,33,34,35,36,44,45,47,48],
    g17: [18,19,20,24,31,32,34,35,48],
    g2: [22,23,27,28,29,46],
    g1: [23,24,27,28,29],
    g6: [27],
    g13: [28,29],
    g15: [28,29],
    g8: [30,31,32,33,34,48],
  },
};

// Projects running and projects begun in each year, so the year lens shows the work and not
// only the money. Derived from yearStart/yearEnd in projects-data.js.
export const YEAR_WORK = {
  2005: { running: 4, started: [38] },
  2006: { running: 4, started: [] },
  2007: { running: 5, started: [2,16] },
  2008: { running: 6, started: [39] },
  2009: { running: 8, started: [14,15,42] },
  2010: { running: 9, started: [4,17,37] },
  2011: { running: 10, started: [30,44] },
  2012: { running: 10, started: [9] },
  2013: { running: 9, started: [40,47] },
  2014: { running: 12, started: [3,10,11,21,26] },
  2015: { running: 11, started: [27] },
  2016: { running: 14, started: [5,6,31,41,45] },
  2017: { running: 10, started: [7,18,19,32] },
  2018: { running: 8, started: [8] },
  2019: { running: 5, started: [20,46] },
  2020: { running: 6, started: [22,36] },
  2021: { running: 8, started: [23,48] },
  2022: { running: 8, started: [24,28,35] },
  2023: { running: 10, started: [12,33,34] },
  2024: { running: 8, started: [] },
};

// What a single entitlement is worth to the household that holds it, at the statutory rate.
// These are the rates themselves, not DEHAT figures: they let a reader read the counts above
// for what they are worth without any total being asserted on their behalf.
//
// Sources, for the internal record:
//   Old-age pension  UP Samajwadi/Vridhavastha pension (SSPY), Rs 1,000 a month, paid quarterly.
//   Employment       MGNREGA stood repealed on 1 July 2026 and was replaced by the VB-G RAM G
//                    Act, 2025, which guarantees 125 days a year; the UP wage is Rs 300 a day.
//                    Uttar Pradesh's own published average is nearer 37 days a household a year
//                    (1,768 lakh person-days across 47.76 lakh families, FY2025-26), so the
//                    guarantee is a ceiling and not what a household typically draws.
//   Food             NFSA priority households, 5 kg a person a month. The central issue price
//                    remains on the statute book at Rs 3/2/1 but is not being charged: the grain
//                    is free to the household under PMGKAY to at least December 2028.
export const ENTITLEMENT_VALUE = [
  { k: 'pension',  headline: '\u20b912,000 a year',
    what: 'An old-age pension pays \u20b91,000 every month, for the rest of the pensioner\u2019s life.' },
  { k: 'work',     headline: 'Up to 125 days a year',
    what: 'A job card carries a guarantee of paid work at \u20b9300 a day in Uttar Pradesh. The state\u2019s own data puts the average household actually drawing on it at 37 days a year.' },
  { k: 'food',     headline: '300 kg a year',
    what: 'A ration card entitles every member to 5 kg of grain a month \u2014 for a family of five, 300 kg a year, at no cost.' },
];
