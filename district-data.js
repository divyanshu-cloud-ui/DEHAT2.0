// DEHAT district atlas — child-vulnerability indicators.
//
// SOURCING RULE. Every district value is traced to a published government source, named per
// indicator (and per value where it differs). Nothing is supplied by the programme team.
//
//   · 14 health, nutrition, WASH and gender indicators are read directly from the National Family Health Survey 5 (2019-21)
//     district fact-sheet dataset (MoHFW / IIPS, 707 districts × 109 indicators). "Good" columns
//     — institutional births, literacy, clean fuel, improved water & sanitation, menstrual
//     protection, ANC, post-natal care — are inverted to gap-framing so higher = worse.
//   · Six schooling & mobility indicators are read from the Unified District Information System for Education Plus district fact sheets (2024-25),
//     each value re-derived from the sheet itself: secondary PTR; middle→secondary transition gap
//     (100 − transition rate); CWSN-toilet gap (100 − % of schools with a FUNCTIONAL accessible
//     toilet); minority enrolment share (minority ÷ total enrolments); out-migration (within-district
//     + inter-district + inter-state) and inter-state migration. Lakhimpur Kheri uses the 2025-26
//     sheet, flagged per value. Girls' dropout and secondary-stage dropout are NOT published in these
//     sheets and remain unverified.
//   · MMR comes from SRS and is state-level by construction. IMR and U5MR have NO official
//     district series in India — SRS publishes at state level and AHS is discontinued — so the
//     district figures here are workbook values pending replacement with a cited modelled estimate.
//   · Spousal violence is collected in the NFHS state module only and is therefore shown as the
//     state figure for every district, badged as such — never as a district value.
//   · Five indicators (child labour, ICDS reach, PHC proximity, lowest wealth quintile, SC+ST
//     share) are still carried from the DEHAT Vulnerability Index workbook, attributed to NITI
//     Aayog / Jal Shakti / HMIS / Census but not yet re-verified against those originals.
//
// The seven schooling / mobility indicators are tagged with their Structural-Vulnerability-Cycle
// relationship — svc:'direct' (labour/trafficking/exploitation), 'indirect' (retention & school
// conditions) or 'intersectional' (overlapping caste/tribe/minority/disability/gender
// disadvantage). Migration is a raw student-volume count (population-confounded), so it is flagged
// noIndex: shadeable and shown in each profile, but held OUT of the composite index.
//
// Lakhimpur Kheri entered the atlas in 2026; its schooling figures come from the Unified District Information System for Education Plus 2025-26
// sheet and its IMR / U5MR are unavailable at district level, so they fall back to the UP
// benchmark, badged.
// tier: 'priority' = current, in-depth investment · 'footprint' = past & ongoing programme presence.

window.ATLAS = (function () {
  const districts = [
    // — Priority: in-depth, intersectional investment —
    { id:'bahraich',      name:'Bahraich',            state:'Uttar Pradesh', sb:'up', lat:27.575, lng:81.594, hq:'Bahraich',    aspirational:true,  tier:'priority',
      why:'Our home district on the open Indo-Nepal border — an Aspirational District and our longest, deepest area of presence. Bahraich carries the highest stunting rate in the matrix (52.1%): half its children hit a cognitive ceiling by age five.' },
    { id:'shravasti',     name:'Shravasti',           state:'Uttar Pradesh', sb:'up', lat:27.510, lng:82.030, hq:'Bhinga',      aspirational:true,  tier:'priority',
      why:'The starkest numbers in the index: 59.2% of women cannot read and 51.9% of girls marry before 18 \u2014 the highest child-marriage rate of any district here. This is where the puberty-exit trap closes hardest.' },
    { id:'balrampur',     name:'Balrampur',           state:'Uttar Pradesh', sb:'up', lat:27.430, lng:82.180, hq:'Balrampur',   aspirational:true,  tier:'priority',
      why:'Where the biological debt is deepest — 75.4% of women begin pregnancy anaemic, a state of "biological bankruptcy" — and child marriage peaks at 37.2%.' },
    { id:'lakhimpur',     name:'Lakhimpur Kheri',     state:'Uttar Pradesh', sb:'up', lat:27.950, lng:80.780, hq:'Lakhimpur',   aspirational:false, tier:'priority',
      scope:'Current district of work \u2014 child protection only. DEHAT\u2019s presence here begins in 2026 with the protection programme; the other three fronts are not yet in place.',
      why:'A current district of work: the largest stretch of the Indo-Nepal border, where the Dudhwa forest belt, sugarcane labour and seasonal migration keep children moving and out of school.' },
    // — Programme footprint: past & ongoing presence (see the projects catalogue) —
    { id:'siddharthnagar',name:'Siddharthnagar',      state:'Uttar Pradesh', sb:'up', lat:27.280, lng:83.090, hq:'Naugarh',     aspirational:true,  tier:'footprint',
      why:'A Terai border district with deep intergenerational nutrition gaps, where distance from services compounds every early-childhood risk.' },
    { id:'maharajganj',   name:'Maharajganj',         state:'Uttar Pradesh', sb:'up', lat:27.140, lng:83.560, hq:'Maharajganj', aspirational:false, tier:'footprint',
      why:'The easternmost UP border stretch, where distress migration pulls families — and children — away from stability.' },
    { id:'kushinagar',    name:'Kushinagar',          state:'Uttar Pradesh', sb:'up', lat:26.740, lng:83.890, hq:'Padrauna',    aspirational:false, tier:'footprint',
      why:'A migration-corridor district where children pulled into labour are among the hardest to return to school.' },
    { id:'sonbhadra',     name:'Sonbhadra',           state:'Uttar Pradesh', sb:'up', lat:24.690, lng:83.070, hq:'Robertsganj', aspirational:false, tier:'footprint',
      why:'Southern UP\u2019s forested, tribal-majority district, where Adivasi girls face some of the steepest barriers to staying in school.' },
    { id:'amethi',        name:'Amethi',              state:'Uttar Pradesh', sb:'up', lat:26.160, lng:81.810, hq:'Gauriganj',   aspirational:false, tier:'footprint',
      why:'Central UP, where the matrix records the state\u2019s worst infant mortality (88.4 per 1,000) — a measure of how far care still has to travel.' },
    { id:'gbnagar',       name:'Gautam Buddha Nagar', state:'Uttar Pradesh', sb:'up', lat:28.470, lng:77.500, hq:'Noida',       aspirational:false, tier:'footprint',
      why:'A destination city for distress migration — the far end of the trafficking pathway that begins in the Terai.' },
    { id:'gonda',         name:'Gonda',               state:'Uttar Pradesh', sb:'up', lat:27.130, lng:81.960, hq:'Gonda',       aspirational:false, tier:'footprint',
      why:'Bahraich\u2019s neighbour in the Devipatan division, sharing the same Terai vulnerabilities across the border belt.' },
    { id:'gorakhpur',     name:'Gorakhpur',           state:'Uttar Pradesh', sb:'up', lat:26.760, lng:83.370, hq:'Gorakhpur',   aspirational:false, tier:'footprint',
      why:'Eastern UP\u2019s urban anchor and a hub of the encephalitis belt — a reference district for the region\u2019s child-health burden.' },
    { id:'ambedkarnagar', name:'Ambedkar Nagar',      state:'Uttar Pradesh', sb:'up', lat:26.420, lng:82.700, hq:'Akbarpur',    aspirational:false, tier:'footprint',
      why:'Part of the central-UP belt, where school functionality and basic entitlements remain uneven across Gram Panchayats.' },
    { id:'ayodhya',       name:'Ayodhya',             state:'Uttar Pradesh', sb:'up', lat:26.800, lng:82.150, hq:'Ayodhya',     aspirational:false, tier:'footprint',
      why:'A district of the mid-eastern plains, tracked in the index for its child-development gaps.' },
    { id:'barabanki',     name:'Barabanki',           state:'Uttar Pradesh', sb:'up', lat:26.940, lng:81.190, hq:'Barabanki',   aspirational:false, tier:'footprint',
      why:'On the Lucknow\u2013Bahraich corridor, where school access thins as you move toward the Terai.' },
    { id:'shahjahanpur',  name:'Shahjahanpur',        state:'Uttar Pradesh', sb:'up', lat:27.880, lng:79.910, hq:'Shahjahanpur',aspirational:false, tier:'footprint',
      why:'Western edge of the footprint, with an infant-mortality burden (81.2) second only to Amethi in the matrix.' },
    { id:'sultanpur',     name:'Sultanpur',           state:'Uttar Pradesh', sb:'up', lat:26.260, lng:82.070, hq:'Sultanpur',   aspirational:false, tier:'footprint',
      why:'Amethi\u2019s parent district, sharing the mid-eastern plains\u2019 entrenched child-development gaps.' },
    { id:'basti',         name:'Basti',               state:'Uttar Pradesh', sb:'up', lat:26.810, lng:82.730, hq:'Basti',       aspirational:false, tier:'footprint',
      scope:'Assessment district \u2014 a Gram Panchayat survey across 14 blocks in 2009, not a programme presence. The profile is carried for comparison.',
      why:'Where DEHAT worked at district scale as a surveyor rather than an implementer, covering 1,047 Gram Panchayats. Its schooling figures sit close to the eastern-plains average; its child-nutrition figures do not \u2014 24.2% of under-fives are wasted, higher than every Uttar Pradesh district in this set except Sonbhadra.' },
    { id:'washim',        name:'Washim',              state:'Maharashtra',   sb:'mh', lat:20.110, lng:77.130, hq:'Washim',      aspirational:true,  tier:'footprint',
      why:'Our Maharashtra presence in the agrarian-distress belt of Vidarbha, where farm crisis and child nutrition are tightly linked.' },
    { id:'dharashiv',     name:'Dharashiv (Osmanabad)',state:'Maharashtra',  sb:'mh', lat:18.190, lng:76.040, hq:'Dharashiv',   aspirational:false, tier:'footprint',
      why:'A drought-prone Marathwada district where climate stress and distress migration pull children out of school.' },
    { id:'nandurbar',     name:'Nandurbar',           state:'Maharashtra',   sb:'mh', lat:21.370, lng:74.240, hq:'Nandurbar',   aspirational:true,  tier:'footprint',
      why:'A tribal-majority district carrying the heaviest child-nutrition burden in the index \u2014 30.7% of under-fives are wasted \u2014 where services reach Adivasi communities last.' },
    { id:'gadchiroli',    name:'Gadchiroli',          state:'Maharashtra',   sb:'mh', lat:20.180, lng:80.000, hq:'Gadchiroli',  aspirational:true,  tier:'footprint',
      why:'A remote, heavily-forested district where the state\u2019s reach is thinnest and children are hardest to keep safe.' },
    { id:'nashik',        name:'Nashik',              state:'Maharashtra',   sb:'mh', lat:20.000, lng:73.790, hq:'Nashik',      aspirational:false, tier:'footprint',
      why:'Maharashtra\u2019s reference district in the index — the strongest indicators in the matrix, and the benchmark the others are measured against.' },
  ];

  const nodes = [
    { id:'n1', label:'I · The Biological Origin', color:'#A92719', blurb:'The cycle begins with the physical depletion of the mother — before a child is even born.' },
    { id:'n2', label:'II · The Early-Childhood Trap', color:'#D2305C', blurb:'The first 1,000 days set a permanent floor for survival, growth and cognition.' },
    { id:'n3', label:'III · The Systemic Exit (Girls)', color:'#EAAE28', blurb:'Broken school infrastructure and dignity gaps push girls out at puberty.' },
    { id:'n4', label:'IV · The Exploitation Loop', color:'#4F0E73', blurb:'Early marriage, adolescent motherhood, violence and child labour close the loop.' },
    { id:'n5', label:'V · Economic Flight', color:'#0E5565', blurb:'Poverty at the household level opens the pathways traffickers wait at.' },
    { id:'cc', label:'VI · Cross-cutting Determinants', color:'#556223', blurb:'The intersecting conditions — WASH, energy, exclusion, health access — that shape every node.' },
  ];

  // All from the DEHAT Vulnerability Index matrix; per-node source per its Data Reference Key.
  const indicators = [
    // Node I — Biological & Maternal
    { key:'mmr',           node:'n1', label:'Maternal Mortality Ratio', unit:' per 100,000', worseHigh:true, stateLevel:true, source:'Sample Registration System (state-level)',
      interp:'Mothers lost per 100,000 live births. Reported at state level — the most reliable scale for this measure — so every district in a state shares its figure.' },
    { key:'anaemia',       node:'n1', label:'Anaemic Women (15\u201349)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Women who begin pregnancy anaemic — a nutritional debt passed to the foetus.' },
    { key:'homebirth',     node:'n1', label:'Births Outside Institutions', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Deliveries occurring without professional medical safety.' },
    { key:'noANC',         node:'n1', label:'Mothers Without 4+ Antenatal Visits (last birth)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Pregnancies unmonitored through the recommended check-up schedule.' },
    { key:'noEarlyBF',     node:'n1', label:'No Breastfeeding Within 1 Hour', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Newborns denied the protective first feed.' },
    { key:'noPostnatal',   node:'n1', label:'Mothers Without Post-Natal Care Within 2 Days', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Mothers who received no check-up from a doctor, nurse, LHV, ANM or midwife within two days of delivery.' },
    // Node II — Early-Childhood Trap
    { key:'imr',           node:'n2', label:'Infant Mortality Rate', unit:' per 1,000', worseHigh:true, source:'DEHAT Vulnerability Index workbook \u2014 no official district-level series exists (the Sample Registration System publishes at state level); unverified',
      interp:'Deaths before the first birthday, per 1,000 live births.' },
    { key:'u5mr',          node:'n2', label:'Under-5 Mortality Rate', unit:' per 1,000', worseHigh:true, source:'DEHAT Vulnerability Index workbook \u2014 no official district-level series exists (the Sample Registration System publishes at state level); unverified',
      interp:'Deaths before the fifth birthday, per 1,000 live births.' },
    { key:'stunting',      node:'n2', label:'Child Stunting (<5y)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Irreversible height-for-age loss — a cognitive ceiling reached by age five.' },
    { key:'wasting',       node:'n2', label:'Child Wasting (<5y)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Acute malnutrition — dangerously low weight for height.' },
    { key:'noICDS',        node:'n2', label:'Children Outside ICDS Reach', unit:'%', worseHigh:true, source:'NITI Aayog / Jal Shakti / HMIS (2025-26)',
      interp:'Children the anganwadi system does not reach with food, pre-school and growth monitoring.' },
    // Node III — Systemic Exit (Girls)
    { key:'femaleIlliteracy', node:'n3', label:'Female Illiteracy (women 15\u201349)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Women who cannot read or write — the literacy wall.' },
    { key:'dropout',       node:'n3', label:'Girls\u2019 School Dropout', unit:'%', worseHigh:true, source:'Unified District Information System for Education Plus (2024-25) Education Dashboard',
      interp:'Girls leaving school — the visible edge of the puberty-exit trap.' },
    { key:'menstrualGap',  node:'n3', label:'Women 15\u201324 Without Hygienic Menstrual Protection', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'A dignity barrier that becomes a literal exit point from school.' },
    { key:'transitionGap', node:'n3', label:'Lost at Middle→Secondary Transition', unit:'%', worseHigh:true, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Intersectional SVC · the share of children who do not carry over from middle into secondary school — the exact stage the puberty-exit trap closes on girls, and the last off-ramp before labour and early marriage.' },
    { key:'secDropout',    node:'n3', label:'Secondary-Stage Dropout', unit:'%', worseHigh:true, svc:'intersectional', source:'DEHAT Vulnerability Index workbook \u2014 dropout is not published in the Unified District Information System for Education Plus district fact sheets; unverified',
      interp:'Intersectional SVC · dropout at the secondary stage, where caste, gender and household poverty compound; every departure is a child newly exposed to work or marriage.' },
    { key:'secPTR',        node:'n3', label:'Secondary Pupil–Teacher Ratio', unit:'', worseHigh:true, svc:'indirect', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Indirect SVC · students per teacher in secondary grades. Overcrowded classrooms erode retention and learning — a slow push toward the exit.' },
    // Node IV — Exploitation Loop
    { key:'childMarriage', node:'n4', label:'Girls Married Before 18', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'An illegal transition — a direct consequence of broken educational infrastructure.' },
    { key:'adolMothers',   node:'n4', label:'Adolescent Pregnancy (15\u201319)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'The loop-closer: the child bride becomes the next depleted mother.' },
    { key:'spousalViolence', node:'n4', label:'Women Facing Spousal Violence', unit:'%', worseHigh:true, stateLevel:true, source:'National Family Health Survey 5 (2019-21) state module \u2014 not reported at district level',
      interp:'Domestic trauma that shapes the household a child grows in. The National Family Health Survey collects this in the state module only, so every district carries its state figure.' },
    { key:'childLabor',    node:'n4', label:'Children in Labour', unit:'%', worseHigh:true, source:'NITI Aayog / Jal Shakti / HMIS (2025-26)',
      interp:'Children working instead of learning — exploitation made routine.' },
    // Node V — Economic Flight
    { key:'lowWealth',     node:'n5', label:'Households in Lowest Wealth Quintile', unit:'%', worseHigh:true, source:'DEHAT Vulnerability Index workbook, citing the National Family Health Survey \u2014 not carried in the National Family Health Survey 5 district fact sheet; unverified',
      interp:'Families with the least buffer — where one shock triggers migration, debt or a daughter\u2019s marriage.' },
    { key:'outMigration',  node:'n5', label:'Child Out-Migration (students)', unit:' students', worseHigh:true, noIndex:true, svc:'direct', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Direct SVC · total school-going children recorded as migrating (within-district, inter-district and inter-state). Unsafe mobility disrupts schooling and opens the labour and trafficking pathways DEHAT\u2019s protection work sits astride. A volume count, not a rate — it tracks population size, so it is shown and shadeable but held out of the composite index.' },
    { key:'interStateMig', node:'n5', label:'Inter-State Child Migration', unit:' students', worseHigh:true, noIndex:true, svc:'direct', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Direct SVC · children moving to another state — the sharpest end of the mobility risk, where service continuity breaks and trafficking and bonded-labour exposure rise. Kept out of the composite index as a raw count.' },
    // Cross-cutting
    { key:'noCleanFuel',   node:'cc', label:'Households Not Using Clean Cooking Fuel', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Indoor smoke harms maternal and child respiratory health.' },
    { key:'noCleanWater',  node:'cc', label:'Households Without an Improved Drinking-Water Source', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Unsafe water drives the diarrhoeal disease that compounds stunting.' },
    { key:'noSanitation',  node:'cc', label:'Households Not Using an Improved Sanitation Facility', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Open defecation sustains the infection\u2013malnutrition cycle.' },
    { key:'phcGap',        node:'cc', label:'Population Beyond 5 km of a PHC', unit:'%', worseHigh:true, source:'NITI Aayog / Jal Shakti / HMIS (2025-26)',
      interp:'Distance as a determinant: care that exists but cannot be reached.' },
    { key:'scstShare',     node:'cc', label:'SC + ST Population Share', unit:'%', worseHigh:false, source:'NITI Aayog / Jal Shakti / HMIS (2025-26)',
      interp:'Historically excluded communities who bear the sharpest end of every deficit.' },
    { key:'cwsnToiletGap', node:'cc', label:'Schools Without Accessible Toilets for Children With Special Needs', unit:'%', worseHigh:true, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Intersectional SVC · schools lacking a functional toilet usable by children with special needs — a disability-exclusion barrier that keeps the most vulnerable children out of the classroom entirely.' },
    { key:'minorityShare', node:'cc', label:'Minority-Community School Enrolment', unit:'%', worseHigh:false, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Intersectional SVC · minority-community share of school enrolment. Not a deficit in itself — a targeting flag: where it is high, protection and entitlement work must overlay minority-specific barriers to access.' },
  ];

  // ---- Benchmarks (matrix rows: UP State Avg, MH State Avg, India Avg) ----
  const bench = {
    up:    { imr:50.4, u5mr:59.8, mmr:167, stunting:38.1, wasting:17.3, anaemia:48.2, homebirth:19.5, noEarlyBF:74.8, noANC:39.9, femaleIlliteracy:31.8, dropout:13.2, menstrualGap:24.9, childMarriage:14.2, adolMothers:2.5, spousalViolence:33.1, noCleanFuel:47.8, noCleanWater:2, noSanitation:29.9, lowWealth:21.2, scstShare:21, noICDS:54, childLabor:4.5, noPostnatal:28, phcGap:18 },
    mh:    { imr:22, u5mr:28, mmr:33, stunting:33, wasting:15.6, anaemia:52.2, homebirth:7.5, noEarlyBF:59.8, noANC:31.8, femaleIlliteracy:23.5, dropout:8.1, menstrualGap:12.8, childMarriage:19.2, adolMothers:3.2, spousalViolence:28.5, noCleanFuel:14.5, noCleanWater:1.5, noSanitation:14.5, lowWealth:11, scstShare:20, noICDS:38, childLabor:2.5, noPostnatal:18, phcGap:8 },
    india: { imr:35.2, u5mr:41.9, mmr:97, stunting:33.8, wasting:19.3, anaemia:53.2, homebirth:9.8, noEarlyBF:56.5, noANC:40.2, femaleIlliteracy:27.8, dropout:10.5, menstrualGap:19.9, childMarriage:21.5, adolMothers:6.1, spousalViolence:27.5, noCleanFuel:47.8, noCleanWater:3, noSanitation:24.8, lowWealth:18.5, scstShare:17, noICDS:48, childLabor:3.5, noPostnatal:22, phcGap:12 },
  };

  // ---- District rows from the matrix (gap-framed) ----
  const exact = {
    bahraich: { mmr:167, imr:48.2, u5mr:58.5, stunting:52.1, wasting:14.4, anaemia:48.8, homebirth:32.3, noEarlyBF:83, noANC:65.7, noPostnatal:47.6, femaleIlliteracy:58.4, dropout:17.5, secDropout:10.4, secPTR:41, transitionGap:48.6, menstrualGap:51.6, childMarriage:37.5, adolMothers:8.4, childLabor:8.5, lowWealth:35.5, outMigration:77873, interStateMig:801, noCleanFuel:61.8, noCleanWater:0, noSanitation:55.8, noICDS:65, phcGap:32, scstShare:28, cwsnToiletGap:55.9, minorityShare:31.3, spousalViolence:33.5 },
    shravasti: { mmr:167, imr:46.8, u5mr:56.1, stunting:50.9, wasting:20.3, anaemia:44.4, homebirth:19.6, noEarlyBF:85.9, noANC:57.6, noPostnatal:31.7, femaleIlliteracy:59.2, dropout:23.5, secDropout:11, secPTR:38, transitionGap:36.8, menstrualGap:52.6, childMarriage:51.9, adolMothers:5.3, childLabor:11.2, lowWealth:40.5, outMigration:28143, interStateMig:262, noCleanFuel:63.1, noCleanWater:0.7, noSanitation:41.9, noICDS:70, phcGap:45, scstShare:35, cwsnToiletGap:63.5, minorityShare:25.9, spousalViolence:36.1 },
    balrampur: { mmr:167, imr:47.9, u5mr:57.5, stunting:41.2, wasting:24.9, anaemia:53.7, homebirth:30.3, noEarlyBF:85.9, noANC:59, noPostnatal:37.9, femaleIlliteracy:55.1, dropout:21.5, secDropout:1.4, secPTR:41, transitionGap:41.5, menstrualGap:47, childMarriage:35, adolMothers:4.1, childLabor:9.8, lowWealth:40.8, outMigration:48198, interStateMig:883, noCleanFuel:60.4, noCleanWater:0.2, noSanitation:40.3, noICDS:72.5, phcGap:41.8, scstShare:20.4, cwsnToiletGap:82.3, minorityShare:28.5, spousalViolence:32.5 },
    lakhimpur: { mmr:167, stunting:47.6, wasting:15.8, anaemia:53, homebirth:17.2, noEarlyBF:73, noANC:52, noPostnatal:39.5, femaleIlliteracy:38, secPTR:49, transitionGap:33.9, menstrualGap:41.9, childMarriage:19.7, adolMothers:3.6, outMigration:120788, interStateMig:620, noCleanFuel:64.1, noCleanWater:0.1, noSanitation:34.4, scstShare:26.4, cwsnToiletGap:36.2, minorityShare:20.8 },
    ambedkarnagar: { mmr:167, imr:46.2, u5mr:54.5, stunting:31.1, wasting:17.8, anaemia:52.7, homebirth:7.8, noEarlyBF:79.6, noANC:55.5, noPostnatal:23.2, femaleIlliteracy:21.5, dropout:13.5, secDropout:2.8, secPTR:33, transitionGap:18.3, menstrualGap:22.5, childMarriage:5.5, adolMothers:0, childLabor:3.5, lowWealth:20.2, outMigration:74136, interStateMig:749, noCleanFuel:67.8, noCleanWater:0, noSanitation:36.4, noICDS:52, phcGap:12, scstShare:22, cwsnToiletGap:49.8, minorityShare:17.9, spousalViolence:30.5 },
    amethi: { mmr:167, imr:88.4, u5mr:111, stunting:35.8, wasting:19.9, anaemia:46.1, homebirth:9.2, noEarlyBF:78.4, noANC:68.3, noPostnatal:23.7, femaleIlliteracy:32.7, dropout:14.8, secDropout:6.3, secPTR:38, transitionGap:29.4, menstrualGap:28.2, childMarriage:14.9, adolMothers:1.9, childLabor:4.5, lowWealth:23.5, outMigration:49224, interStateMig:823, noCleanFuel:73.6, noCleanWater:1.3, noSanitation:39.1, noICDS:58, phcGap:18, scstShare:25, cwsnToiletGap:60.7, minorityShare:20.6, spousalViolence:31.5 },
    ayodhya: { mmr:167, imr:44.5, u5mr:52.8, stunting:30.6, wasting:12.4, anaemia:52.3, homebirth:10.9, noEarlyBF:87.5, noANC:66.2, noPostnatal:24.5, femaleIlliteracy:22.3, dropout:14.1, secDropout:3.1, secPTR:30, transitionGap:17.3, menstrualGap:29, childMarriage:7.6, adolMothers:2, childLabor:3.5, lowWealth:20.5, outMigration:66823, interStateMig:847, noCleanFuel:58.7, noCleanWater:0, noSanitation:35.6, noICDS:55, phcGap:10, scstShare:21, cwsnToiletGap:45.7, minorityShare:14, spousalViolence:29.5 },
    barabanki: { mmr:167, imr:45, u5mr:53.2, stunting:41.9, wasting:18.1, anaemia:55.3, homebirth:24, noEarlyBF:69.8, noANC:77.4, noPostnatal:58.5, femaleIlliteracy:38.9, dropout:14.5, secDropout:6.8, secPTR:43, transitionGap:34.6, menstrualGap:41.9, childMarriage:20.4, adolMothers:3.4, childLabor:4.2, lowWealth:22.5, outMigration:89037, interStateMig:380, noCleanFuel:52.2, noCleanWater:1.2, noSanitation:37.6, noICDS:52, phcGap:15, scstShare:24, cwsnToiletGap:41.2, minorityShare:20.4, spousalViolence:32.2 },
    gbnagar: { mmr:167, imr:22.1, u5mr:27.4, stunting:25.5, wasting:12, anaemia:59.4, homebirth:13.4, noEarlyBF:66.6, noANC:47.3, noPostnatal:14.6, femaleIlliteracy:19.4, dropout:7.8, secDropout:1.4, secPTR:24, transitionGap:9.6, menstrualGap:10.4, childMarriage:13.5, adolMothers:2.1, childLabor:1.5, lowWealth:4.5, outMigration:64219, interStateMig:5862, noCleanFuel:25, noCleanWater:0.1, noSanitation:26, noICDS:30, phcGap:2, scstShare:15, cwsnToiletGap:55.2, minorityShare:9.4, spousalViolence:21.5 },
    gonda: { mmr:167, imr:49.1, u5mr:59.2, stunting:45.9, wasting:12.1, anaemia:49.3, homebirth:18.2, noEarlyBF:82.1, noANC:58.3, noPostnatal:31.4, femaleIlliteracy:39.6, dropout:15.8, secDropout:6.7, secPTR:40, transitionGap:33.8, menstrualGap:38.6, childMarriage:25.4, adolMothers:4.2, childLabor:6.2, lowWealth:32.5, outMigration:88382, interStateMig:1433, noCleanFuel:43.8, noCleanWater:0, noSanitation:55.4, noICDS:65, phcGap:25, scstShare:26, cwsnToiletGap:54, minorityShare:17.4, spousalViolence:31.5 },
    gorakhpur: { mmr:167, imr:42.4, u5mr:50.5, stunting:29.6, wasting:23.3, anaemia:52.9, homebirth:8.4, noEarlyBF:61.2, noANC:43.7, noPostnatal:20.9, femaleIlliteracy:29.9, dropout:13.1, secDropout:1.9, secPTR:38, transitionGap:16.3, menstrualGap:21.7, childMarriage:14.6, adolMothers:2.4, childLabor:3.5, lowWealth:20.2, outMigration:109367, interStateMig:2203, noCleanFuel:33.2, noCleanWater:0.2, noSanitation:30.4, noICDS:48, phcGap:12, scstShare:20, cwsnToiletGap:73.9, minorityShare:8.6, spousalViolence:30.2 },
    kushinagar: { mmr:167, imr:46.8, u5mr:55.4, stunting:32.2, wasting:24.3, anaemia:42.3, homebirth:10.6, noEarlyBF:83.3, noANC:64.2, noPostnatal:20.7, femaleIlliteracy:35.6, dropout:14.5, secDropout:5, secPTR:52, transitionGap:23.9, menstrualGap:22.7, childMarriage:17.7, adolMothers:2.6, childLabor:5.5, lowWealth:30.5, outMigration:96847, interStateMig:1792, noCleanFuel:44.8, noCleanWater:0, noSanitation:26.9, noICDS:62, phcGap:24, scstShare:27, cwsnToiletGap:67.1, minorityShare:17.8, spousalViolence:30.5 },
    maharajganj: { mmr:167, imr:47.5, u5mr:56.8, stunting:40.5, wasting:21.8, anaemia:47.1, homebirth:6.7, noEarlyBF:86.6, noANC:47.5, noPostnatal:22.8, femaleIlliteracy:35.9, dropout:15.5, secDropout:6.7, secPTR:42, transitionGap:29.5, menstrualGap:19.4, childMarriage:24.1, adolMothers:3.6, childLabor:5.5, lowWealth:28.5, outMigration:62527, interStateMig:587, noCleanFuel:34.9, noCleanWater:0, noSanitation:33.3, noICDS:62, phcGap:22, scstShare:23, cwsnToiletGap:74.3, minorityShare:15.8, spousalViolence:32.5 },
    shahjahanpur: { mmr:167, imr:81.2, u5mr:101, stunting:44.5, wasting:17, anaemia:60.3, homebirth:36.7, noEarlyBF:72.4, noANC:64.7, noPostnatal:37.2, femaleIlliteracy:40.5, dropout:14.8, secDropout:6.5, secPTR:37, transitionGap:34.8, menstrualGap:40.4, childMarriage:20.9, adolMothers:4.6, childLabor:4.5, lowWealth:26.5, outMigration:79833, interStateMig:1375, noCleanFuel:59.6, noCleanWater:0, noSanitation:30.8, noICDS:58, phcGap:18, scstShare:25, cwsnToiletGap:62.7, minorityShare:15, spousalViolence:31.5 },
    siddharthnagar: { mmr:167, imr:43.1, u5mr:51.4, stunting:37.2, wasting:24.8, anaemia:51.2, homebirth:30.3, noEarlyBF:75.1, noANC:39.1, noPostnatal:38.2, femaleIlliteracy:50.9, dropout:16.8, secDropout:6.8, secPTR:50, transitionGap:29.7, menstrualGap:37, childMarriage:33.9, adolMothers:3.7, childLabor:7.5, lowWealth:30.5, outMigration:66451, interStateMig:1505, noCleanFuel:49.4, noCleanWater:0.1, noSanitation:57.2, noICDS:68, phcGap:35, scstShare:28, cwsnToiletGap:78.3, minorityShare:22.1, spousalViolence:33.5 },
    sonbhadra: { mmr:167, imr:49.5, u5mr:60.2, stunting:38.3, wasting:26.8, anaemia:44.5, homebirth:23.2, noEarlyBF:70.9, noANC:63.6, noPostnatal:40.1, femaleIlliteracy:35.2, dropout:17.8, secDropout:7.2, secPTR:42, transitionGap:30.6, menstrualGap:31.1, childMarriage:17.7, adolMothers:6.9, childLabor:9.5, lowWealth:33.5, outMigration:61835, interStateMig:1080, noCleanFuel:69.6, noCleanWater:10.4, noSanitation:29.4, noICDS:68, phcGap:40, scstShare:38, cwsnToiletGap:76.2, minorityShare:6, spousalViolence:35.5 },
    sultanpur: { mmr:167, imr:43.8, u5mr:51.2, stunting:33.4, wasting:10.7, anaemia:50.2, homebirth:13, noEarlyBF:73.3, noANC:53, noPostnatal:29.5, femaleIlliteracy:25.1, dropout:12.8, secDropout:1.5, secPTR:38, transitionGap:16.5, menstrualGap:25.2, childMarriage:7.9, adolMothers:1.1, childLabor:3.5, lowWealth:19.5, outMigration:80210, interStateMig:1186, noCleanFuel:66.3, noCleanWater:0.5, noSanitation:34.9, noICDS:52, phcGap:12, scstShare:22, cwsnToiletGap:48.5, minorityShare:17.7, spousalViolence:29.5 },
    dharashiv: { mmr:33, imr:24.5, u5mr:31.2, stunting:37.2, wasting:16.1, anaemia:49.1, homebirth:1.9, noEarlyBF:38.7, noANC:10.8, noPostnatal:5.6, femaleIlliteracy:16.3, dropout:8.8, secDropout:14.8, secPTR:25, transitionGap:1.5, menstrualGap:13.5, childMarriage:36.6, adolMothers:16.1, childLabor:2.5, lowWealth:13.5, outMigration:55077, interStateMig:223, noCleanFuel:30.3, noCleanWater:3.6, noSanitation:28.8, noICDS:35, phcGap:5, scstShare:18, cwsnToiletGap:44.7, minorityShare:14.2, spousalViolence:27.5 },
    gadchiroli: { mmr:33, imr:32.1, u5mr:40.5, stunting:35.7, wasting:30, anaemia:66.2, homebirth:2.7, noEarlyBF:34, noANC:13.2, noPostnatal:8.5, femaleIlliteracy:20.6, dropout:11.5, secDropout:6.8, secPTR:23, transitionGap:1.5, menstrualGap:19.1, childMarriage:10.1, adolMothers:5.1, childLabor:5.5, lowWealth:20.5, outMigration:31693, interStateMig:170, noCleanFuel:39.5, noCleanWater:17, noSanitation:37.6, noICDS:40, phcGap:20, scstShare:45, cwsnToiletGap:83.7, minorityShare:4, spousalViolence:30.2 },
    nandurbar: { mmr:33, imr:38.4, u5mr:48.2, stunting:45.8, wasting:30.7, anaemia:64.2, homebirth:23.7, noEarlyBF:48.1, noANC:41.8, noPostnatal:25.6, femaleIlliteracy:42.3, dropout:14.8, secDropout:14.6, secPTR:25, transitionGap:2.1, menstrualGap:52.5, childMarriage:24, adolMothers:10.6, childLabor:7.5, lowWealth:26.5, outMigration:55914, interStateMig:482, noCleanFuel:59.7, noCleanWater:5.4, noSanitation:45.9, noICDS:48, phcGap:35, scstShare:55, cwsnToiletGap:72.3, minorityShare:6.8, spousalViolence:33.5 },
    nashik: { mmr:33, imr:20.8, u5mr:26.4, stunting:42.2, wasting:27.2, anaemia:56.2, homebirth:9.5, noEarlyBF:53.5, noANC:33.6, noPostnatal:23.5, femaleIlliteracy:20, dropout:8.1, secDropout:12.4, secPTR:26, transitionGap:3.2, menstrualGap:20.7, childMarriage:29.6, adolMothers:14, childLabor:1.8, lowWealth:10.5, outMigration:221015, interStateMig:1756, noCleanFuel:27.5, noCleanWater:13.7, noSanitation:31.7, noICDS:28, phcGap:4, scstShare:25, cwsnToiletGap:9.2, minorityShare:15.3, spousalViolence:28.5 },
    washim: { mmr:33, imr:23.1, u5mr:29.5, stunting:35.3, wasting:31.7, anaemia:56.4, homebirth:7.1, noEarlyBF:31.2, noANC:40, noPostnatal:16.6, femaleIlliteracy:22, dropout:9.1, secDropout:2.1, secPTR:31, transitionGap:0.9, menstrualGap:27.5, childMarriage:27.7, adolMothers:14.3, childLabor:3, lowWealth:14.5, outMigration:40552, interStateMig:120, noCleanFuel:38.6, noCleanWater:26.3, noSanitation:38.5, noICDS:32, phcGap:8, scstShare:22, cwsnToiletGap:28.7, minorityShare:26.2, spousalViolence:27.5 },
    basti: { mmr:167, stunting:35.9, wasting:24.2, anaemia:39.9, homebirth:6.8, noEarlyBF:87.9, noANC:68.5, noPostnatal:16.2, femaleIlliteracy:34.7, secPTR:33, transitionGap:16.8, menstrualGap:26.7, childMarriage:15.9, adolMothers:1, outMigration:62566, interStateMig:527, noCleanFuel:43, noCleanWater:0, noSanitation:35.8, cwsnToiletGap:53.7, minorityShare:12.5 },
  };

  // Per-value source overrides. Where a district's figure comes from a different sheet or vintage
  // than the indicator's default source, the exact provenance is recorded here and shown in place
  // of the default in the profile, so no value is ever presented under a source it did not come from.
  const srcOverride = {
    basti: {
      secPTR:'Unified District Information System for Education Plus (2025-26) Basti fact sheet \u2014 secondary-level pupil\u2013teacher ratio',
      transitionGap:'Unified District Information System for Education Plus (2025-26) Basti fact sheet \u2014 100 \u2212 83.2% middle\u2192secondary transition',
      cwsnToiletGap:'Unified District Information System for Education Plus (2025-26) Basti fact sheet \u2014 100 \u2212 46.3% of schools with FUNCTIONAL toilets accessible to Children With Special Needs (50.3% have one present)',
      minorityShare:'Unified District Information System for Education Plus (2025-26) Basti fact sheet \u2014 59,287 of 4,73,704 enrolments',
      outMigration:'Unified District Information System for Education Plus (2025-26) Basti fact sheet \u2014 58,728 within-district + 3,311 inter-district + 527 inter-state',
      interStateMig:'Unified District Information System for Education Plus (2025-26) Basti fact sheet \u2014 migration to a district of another State',
    },
    lakhimpur: {
      scstShare:'Census of India 2011 \u2014 Kheri district: Scheduled Caste share 26.4%. The ST share is not separately sourced, so this figure covers SC only and understates the SC+ST total.',
      secPTR:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 secondary-level pupil–teacher ratio',
      transitionGap:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 100 \u2212 66.1% middle\u2192secondary transition',
      cwsnToiletGap:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 100 \u2212 63.8% of schools with FUNCTIONAL toilets accessible to Children With Special Needs (67.7% have one present)',
      minorityShare:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 1,85,862 of 8,92,979 enrolments',
      outMigration:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 1,16,693 within-district + 3,475 inter-district + 620 inter-state',
      interStateMig:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 migration to a district of another State',
    },
  };

  // value(districtId, indicatorKey) -> { v, kind } where kind = 'exact' | 'state' | 'na'
  function value(did, key) {
    const d = districts.find(x => x.id === did);
    const ind = indicators.find(i => i.key === key);
    // State-level indicators (e.g. MMR) are never district-exact: report the benchmark, badged as such.
    if (ind && ind.stateLevel) {
      const b = bench[d.sb];
      if (b && b[key] != null) return { v: b[key], kind: 'state' };
      return { v: null, kind: 'na' };
    }
    if (exact[did] && exact[did][key] != null) {
      const ov = srcOverride[did] && srcOverride[did][key];
      return { v: exact[did][key], kind: 'exact', src: ov || null };
    }
    const b = bench[d.sb];
    if (b && b[key] != null) return { v: b[key], kind: 'state' };
    return { v: null, kind: 'na' };
  }

  return { districts, nodes, indicators, bench, exact, srcOverride, value };
})();
