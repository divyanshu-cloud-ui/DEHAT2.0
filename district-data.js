// DEHAT district atlas - child-vulnerability indicators.
//
// SOURCING RULE. Every district value is traced to a published official source, or to an estimate
// the government recognises, and named per indicator. Each indicator's `source` names its default
// series. Where one district's value comes from a different series, year or boundary, the exact
// provenance (publisher, report, year, table or page, and the figure) is recorded in `srcOverride`
// and shown in the profile in place of the default, so no value is ever presented under a source it
// did not come from. Nothing is supplied by the programme team. Some cells are older than others,
// and the profile says so for each value.
//
//   - 14 health, nutrition, WASH and gender indicators are read directly from the National Family
//     Health Survey 5 (2019-21) district fact-sheet dataset (MoHFW / IIPS, 707 districts x 109
//     indicators). "Good" columns - institutional births, literacy, clean fuel, improved water and
//     sanitation, menstrual protection, ANC, post-natal care - are inverted to gap-framing so higher
//     = worse.
//   - Schooling and mobility indicators are read from the Unified District Information System for
//     Education Plus (UDISE+) district fact sheets (2024-25): secondary PTR; middle-to-secondary
//     transition gap (100 - transition rate); secondary-stage dropout; CWSN-toilet gap (100 - % of
//     schools with a FUNCTIONAL accessible toilet); minority enrolment share; out-migration and
//     inter-state migration. Girls' dropout (classes 9-10) comes from the UDISE+ dashboard data for
//     2024-25. Lakhimpur Kheri and Basti use the 2025-26 sheet for the fact-sheet indicators,
//     flagged per value; Lakhimpur Kheri's 2024-25 secondary dropout and Basti's 2025-26 secondary
//     dropout (its 2024-25 value is published as 0.0) are read from the UDISE+ dashboard data.
//   - Infant and under-5 mortality: Annual Health Survey 2012-13 (Office of the Registrar General of
//     India), the latest official district series, for the 17 Uttar Pradesh districts it reports.
//     Amethi (created 2010, absent from every government district table) and the five Maharashtra
//     districts use the ICMR-PHFI-IHME 2017 estimates (The Lancet 2020 appendix), a government-
//     recognised series co-led by the Indian Council of Medical Research.
//   - Children aged 5-14 who were working, and SC + ST population share: Census of India 2011 (Table
//     B-01 and the Primary Census Abstract), the latest official district count; there has been no
//     Census since. Amethi and present-day Sultanpur are rebuilt from tehsil rows or parent-district
//     figures, each flagged in `srcOverride`.
//   - People in multidimensional poverty: NITI Aayog, National Multidimensional Poverty Index: A
//     Progress Review 2023 (NFHS-5, 2019-21), district headcount ratio, all 23 districts.
//   - Rural population beyond 5 km of a primary health centre: Census of India 2011 Village
//     Directory (facility positions as in 2009). Amethi and Sultanpur are rebuilt on present blocks.
//     Dharashiv uses the looser Mission Antyodaya 2019-20 village measure because its Census file is
//     defective; it is shown in the profile but left out of the index and the ranking (indexExclude).
//   - MMR comes from SRS and is state-level by construction. Children under 6 with no anganwadi
//     service comes from NFHS-5 state reports only, so it is shown as the state figure (district
//     figures to follow) and held out of the index.
//   - Spousal violence is collected in the NFHS state module only and is therefore shown as the
//     state figure for every district, badged as such - never as a district value.
//
// The schooling / mobility indicators are tagged with their Structural-Vulnerability-Cycle
// relationship - svc:'direct' (labour/trafficking/exploitation), 'indirect' (retention & school
// conditions) or 'intersectional' (overlapping caste/tribe/minority/disability/gender
// disadvantage). Migration is a raw student-volume count (population-confounded), so it is flagged
// noIndex: shadeable and shown in each profile, but held OUT of the composite index. Girls' dropout
// and the state-level anganwadi figure are likewise noIndex. SC + ST share is not a deficit
// (worseHigh:false), so it is shown but never scored.
//
// Lakhimpur Kheri entered the atlas in 2026; its schooling figures come from the Unified District
// Information System for Education Plus 2025-26 sheet.
// tier: 'priority' = current, in-depth investment · 'footprint' = past & ongoing programme presence.

window.ATLAS = (function () {
  const districts = [
    // — Priority: in-depth, intersectional investment —
    { id:'bahraich',      name:'Bahraich',            state:'Uttar Pradesh', sb:'up', lat:27.575, lng:81.594, hq:'Bahraich',    aspirational:true,  tier:'priority',
      why:'Our home district on the open Indo-Nepal border — an Aspirational District and our longest, deepest area of presence. Bahraich carries the highest stunting rate in the matrix (52.1%): half its children hit a cognitive ceiling by age five.' },
    { id:'shravasti',     name:'Shravasti',           state:'Uttar Pradesh', sb:'up', lat:27.510, lng:82.030, hq:'Bhinga',      aspirational:true,  tier:'priority',
      why:'The starkest numbers in the index: 59.2% of women cannot read and 51.9% of girls marry before 18 \u2014 the highest child-marriage rate of any district here. This is where the puberty-exit trap closes hardest.' },
    { id:'balrampur',     name:'Balrampur',           state:'Uttar Pradesh', sb:'up', lat:27.430, lng:82.180, hq:'Balrampur',   aspirational:true,  tier:'priority',
      why:'Where the biological debt runs deepest of our priority districts: 75.4% of children aged 6 to 59 months are anaemic, as are 53.7% of women, and 35.0% of young women were married before 18.' },
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
      why:'Central UP, where 68.3% of mothers did not receive the recommended four antenatal visits at their last birth - a measure of how far care still has to travel.' },
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
      why:'Western edge of the footprint, where more than a third of births still take place outside a health facility - the highest share of any district in this atlas.' },
    { id:'sultanpur',     name:'Sultanpur',           state:'Uttar Pradesh', sb:'up', lat:26.260, lng:82.070, hq:'Sultanpur',   aspirational:false, tier:'footprint',
      why:'Amethi\u2019s parent district, sharing the mid-eastern plains\u2019 entrenched child-development gaps.' },
    { id:'basti',         name:'Basti',               state:'Uttar Pradesh', sb:'up', lat:26.810, lng:82.730, hq:'Basti',       aspirational:false, tier:'footprint',
      scope:'Assessment district \u2014 a Gram Panchayat survey across 14 blocks in 2009, not a programme presence. The profile is carried for comparison.',
      why:'Where DEHAT worked at district scale as a surveyor rather than an implementer, covering 1,047 Gram Panchayats. Its schooling figures sit close to the eastern-plains average; its child-nutrition figures do not - 24.2% of under-fives are wasted, among the highest of the Uttar Pradesh districts in this set.' },
    { id:'washim',        name:'Washim',              state:'Maharashtra',   sb:'mh', lat:20.110, lng:77.130, hq:'Washim',      aspirational:true,  tier:'footprint',
      why:'Our Maharashtra presence in the agrarian-distress belt of Vidarbha, where farm crisis and child nutrition are tightly linked.' },
    { id:'dharashiv',     name:'Dharashiv (Osmanabad)',state:'Maharashtra',  sb:'mh', lat:18.190, lng:76.040, hq:'Dharashiv',   aspirational:false, tier:'footprint',
      why:'A drought-prone Marathwada district where climate stress and distress migration pull children out of school.' },
    { id:'nandurbar',     name:'Nandurbar',           state:'Maharashtra',   sb:'mh', lat:21.370, lng:74.240, hq:'Nandurbar',   aspirational:true,  tier:'footprint',
      why:'A tribal-majority district where 57.2% of under-fives are underweight - the highest share of any district in this atlas - and 30.7% are wasted, where services reach Adivasi communities last.' },
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

  // Every indicator names its own official source; values from a different sheet or vintage are flagged in srcOverride.
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
    { key:'stunting',      node:'n2', label:'Child Stunting (<5y)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Irreversible height-for-age loss — a cognitive ceiling reached by age five.' },
    { key:'wasting',       node:'n2', label:'Child Wasting (<5y)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Acute malnutrition — dangerously low weight for height.' },
    { key:'imr',          node:'n2', label:'Infant Mortality Rate', unit:' per 1,000', worseHigh:true, source:'Annual Health Survey 2012-13, Office of the Registrar General of India, Uttar Pradesh fact sheet (district infant mortality rate, pp. 176-177; 2001 district boundaries)',
      interp:'Babies who die before their first birthday, per 1,000 live births.' },
    { key:'u5mr',          node:'n2', label:'Under-5 Mortality Rate', unit:' per 1,000', worseHigh:true, source:'Annual Health Survey 2012-13, Office of the Registrar General of India, Uttar Pradesh fact sheet (district under-five mortality rate, pp. 182-183; 2001 district boundaries)',
      interp:'Children who die before their fifth birthday, per 1,000 live births.' },
    { key:'noICDS',        node:'n2', label:'Children Under 6 Who Received No Anganwadi Service', unit:'%', worseHigh:true, stateLevel:true, noIndex:true, source:'National Family Health Survey 5 (2019-21), state report Table 65 (state level; district figures to follow)',
      interp:'Children under six who received no service from an anganwadi in the past year. Published for states only; DEHAT will compute district figures from the NFHS-5 survey data.' },
    // Node III — Systemic Exit (Girls)
    { key:'femaleIlliteracy', node:'n3', label:'Female Illiteracy (women 15\u201349)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Women who cannot read or write — the literacy wall.' },
    { key:'menstrualGap',  node:'n3', label:'Women 15\u201324 Without Hygienic Menstrual Protection', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'A dignity barrier that becomes a literal exit point from school.' },
    { key:'transitionGap', node:'n3', label:'Lost at Middle→Secondary Transition', unit:'%', worseHigh:true, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Intersectional SVC · the share of children who do not carry over from middle into secondary school — the exact stage the puberty-exit trap closes on girls, and the last off-ramp before labour and early marriage.' },
    { key:'secDropout',    node:'n3', label:'Secondary-Stage Dropout', unit:'%', worseHigh:true, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets - Dropout Rates - Secondary',
      interp:'Intersectional SVC · dropout at the secondary stage, where caste, gender and household poverty compound; every departure is a child newly exposed to work or marriage.' },
    { key:'girlsDropout',  node:'n3', label:'Girls\u2019 Dropout, Classes 9-10', unit:'%', worseHigh:true, noIndex:true, svc:'intersectional', source:'Unified District Information System for Education Plus (UDISE+) 2024-25, Ministry of Education, gender-wise dropout rate, secondary classes 9-10 (girls), from the official UDISE+ dashboard data',
      interp:'Girls leaving school in classes 9 and 10, the stage the puberty-exit trap closes on.' },
    { key:'secPTR',        node:'n3', label:'Secondary Pupil–Teacher Ratio', unit:'', worseHigh:true, svc:'indirect', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Indirect SVC · students per teacher in secondary grades. Overcrowded classrooms erode retention and learning — a slow push toward the exit.' },
    // Node IV — Exploitation Loop
    { key:'childMarriage', node:'n4', label:'Girls Married Before 18', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'An illegal transition — a direct consequence of broken educational infrastructure.' },
    { key:'adolMothers',   node:'n4', label:'Adolescent Pregnancy (15\u201319)', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'The loop-closer: the child bride becomes the next depleted mother.' },
    { key:'spousalViolence', node:'n4', label:'Women Facing Spousal Violence', unit:'%', worseHigh:true, stateLevel:true, source:'National Family Health Survey 5 (2019-21) state module \u2014 not reported at district level',
      interp:'Domestic trauma that shapes the household a child grows in. The National Family Health Survey collects this in the state module only, so every district carries its state figure.' },
    { key:'childWork',     node:'n4', label:'Children Aged 5-14 Who Were Working', unit:'%', worseHigh:true, source:'Census of India 2011, Table B-01 (Office of the Registrar General and Census Commissioner, India): main and marginal workers aged 5-14 as a share of the population aged 5-14',
      interp:'Children counted as workers, paid or unpaid (family farm and business work included). The latest official district count; there has been no Census since 2011.' },
    // Node V — Economic Flight
    { key:'outMigration',  node:'n5', label:'Child Out-Migration (students)', unit:' students', worseHigh:true, noIndex:true, svc:'direct', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Direct SVC · total school-going children recorded as migrating (within-district, inter-district and inter-state). Unsafe mobility disrupts schooling and opens the labour and trafficking pathways DEHAT\u2019s protection work sits astride. A volume count, not a rate — it tracks population size, so it is shown and shadeable but held out of the composite index.' },
    { key:'interStateMig', node:'n5', label:'Inter-State Child Migration', unit:' students', worseHigh:true, noIndex:true, svc:'direct', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Direct SVC · children moving to another state — the sharpest end of the mobility risk, where service continuity breaks and trafficking and bonded-labour exposure rise. Kept out of the composite index as a raw count.' },
    { key:'mpiPoor',       node:'n5', label:'People in Multidimensional Poverty', unit:'%', worseHigh:true, source:'NITI Aayog, National Multidimensional Poverty Index: A Progress Review 2023 (NFHS-5, 2019-21), district headcount ratio (Uttar Pradesh overview of districts p. 249; Maharashtra p. 158)',
      interp:'Share of people deprived across health, education and living standards at the same time. Counts people, not households; a survey estimate, not a below-poverty-line count.' },
    // Cross-cutting
    { key:'noCleanFuel',   node:'cc', label:'Households Not Using Clean Cooking Fuel', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Indoor smoke harms maternal and child respiratory health.' },
    { key:'noCleanWater',  node:'cc', label:'Households Without an Improved Drinking-Water Source', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Unsafe water drives the diarrhoeal disease that compounds stunting.' },
    { key:'noSanitation',  node:'cc', label:'Households Not Using an Improved Sanitation Facility', unit:'%', worseHigh:true, source:'National Family Health Survey 5 (2019-21) district fact sheets \u2014 Ministry of Health and Family Welfare / International Institute for Population Sciences district dataset',
      interp:'Open defecation sustains the infection\u2013malnutrition cycle.' },
    { key:'cwsnToiletGap', node:'cc', label:'Schools Without Accessible Toilets for Children With Special Needs', unit:'%', worseHigh:true, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Intersectional SVC · schools lacking a functional toilet usable by children with special needs — a disability-exclusion barrier that keeps the most vulnerable children out of the classroom entirely.' },
    { key:'minorityShare', node:'cc', label:'Minority-Community School Enrolment', unit:'%', worseHigh:false, svc:'intersectional', source:'Unified District Information System for Education Plus (2024-25) district fact sheets \u2014 verified against the source sheet for all 22 districts (Lakhimpur Kheri and Basti from the 2025-26 sheet)',
      interp:'Intersectional SVC · minority-community share of school enrolment. Not a deficit in itself — a targeting flag: where it is high, protection and entitlement work must overlay minority-specific barriers to access.' },
    { key:'scstShare',     node:'cc', label:'SC + ST Population Share', unit:'%', worseHigh:false, source:'Census of India 2011, Primary Census Abstract (Office of the Registrar General and Census Commissioner, India), district totals: Scheduled Caste plus Scheduled Tribe population as a share of total population',
      interp:'Scheduled Caste and Scheduled Tribe share of the population: communities who bear the sharpest end of most deficits.' },
    { key:'phcGap',        node:'cc', label:'Rural Population Beyond 5 km of a Primary Health Centre', unit:'%', worseHigh:true, source:'Census of India 2011, Village Directory (District Census Handbook Appendix VD; facility positions as in 2009): share of the population of villages with a recorded PHC distance whose nearest primary health centre is 5 km or more away',
      interp:'Rural people living in villages where the nearest primary health centre is 5 km or more away. Facility positions are as recorded in 2009, the latest official district-wide distance count.' },
  ];

  // ---- Benchmarks (matrix rows: UP State Avg, MH State Avg, India Avg) ----
  const bench = {
    up:    { mmr:167, stunting:38.1, wasting:17.3, anaemia:48.2, homebirth:19.5, noEarlyBF:74.8, noANC:39.9, femaleIlliteracy:31.8, menstrualGap:24.9, childMarriage:14.2, adolMothers:2.5, spousalViolence:33.1, noCleanFuel:47.8, noCleanWater:2, noSanitation:29.9, noPostnatal:28, imr:68, u5mr:90, childWork:4.3, scstShare:21.3, noICDS:33, girlsDropout:5.1 },
    mh:    { mmr:33, stunting:33, wasting:15.6, anaemia:52.2, homebirth:7.5, noEarlyBF:59.8, noANC:31.8, femaleIlliteracy:23.5, menstrualGap:12.8, childMarriage:19.2, adolMothers:3.2, spousalViolence:28.5, noCleanFuel:14.5, noCleanWater:1.5, noSanitation:14.5, noPostnatal:18, imr:22.6, u5mr:26.1, childWork:3.5, scstShare:21.2, noICDS:44, girlsDropout:10.3 },
    india: { mmr:97, stunting:33.8, wasting:19.3, anaemia:53.2, homebirth:9.8, noEarlyBF:56.5, noANC:40.2, femaleIlliteracy:27.8, menstrualGap:19.9, childMarriage:21.5, adolMothers:6.1, spousalViolence:27.5, noCleanFuel:47.8, noCleanWater:3, noSanitation:24.8, noPostnatal:22 },
  };

  // ---- District rows from the matrix (gap-framed) ----
  const exact = {
    bahraich: { mmr:167, stunting:52.1, wasting:14.4, anaemia:48.8, homebirth:32.3, noEarlyBF:83, noANC:65.7, noPostnatal:47.6, femaleIlliteracy:58.4, secDropout:10.4, secPTR:41, transitionGap:48.6, menstrualGap:51.6, childMarriage:37.5, adolMothers:8.4, outMigration:77873, interStateMig:801, noCleanFuel:61.8, noCleanWater:0, noSanitation:55.8, cwsnToiletGap:55.9, minorityShare:31.3, spousalViolence:33.5, imr:66, u5mr:105, childWork:4.4, scstShare:14.9, mpiPoor:54.4, phcGap:66.9, girlsDropout:12.8 },
    shravasti: { mmr:167, stunting:50.9, wasting:20.3, anaemia:44.4, homebirth:19.6, noEarlyBF:85.9, noANC:57.6, noPostnatal:31.7, femaleIlliteracy:59.2, secDropout:11, secPTR:38, transitionGap:36.8, menstrualGap:52.6, childMarriage:51.9, adolMothers:5.3, outMigration:28143, interStateMig:262, noCleanFuel:63.1, noCleanWater:0.7, noSanitation:41.9, cwsnToiletGap:63.5, minorityShare:25.9, spousalViolence:36.1, imr:96, u5mr:130, childWork:6.1, scstShare:17.4, mpiPoor:49.6, phcGap:73.5, girlsDropout:13.1 },
    balrampur: { mmr:167, stunting:41.2, wasting:24.9, anaemia:53.7, homebirth:30.3, noEarlyBF:85.9, noANC:59, noPostnatal:37.9, femaleIlliteracy:55.1, secDropout:1.4, secPTR:41, transitionGap:41.5, menstrualGap:47, childMarriage:35, adolMothers:4.1, outMigration:48198, interStateMig:883, noCleanFuel:60.4, noCleanWater:0.2, noSanitation:40.3, cwsnToiletGap:82.3, minorityShare:28.5, spousalViolence:32.5, imr:87, u5mr:117, childWork:5, scstShare:14.1, mpiPoor:41.6, phcGap:72.3, girlsDropout:3.7 },
    lakhimpur: { mmr:167, stunting:47.6, wasting:15.8, anaemia:53, homebirth:17.2, noEarlyBF:73, noANC:52, noPostnatal:39.5, femaleIlliteracy:38, secPTR:49, transitionGap:33.9, menstrualGap:41.9, childMarriage:19.7, adolMothers:3.6, outMigration:120788, interStateMig:620, noCleanFuel:64.1, noCleanWater:0.1, noSanitation:34.4, cwsnToiletGap:36.2, minorityShare:20.8, imr:78, u5mr:117, childWork:4.2, scstShare:27.7, mpiPoor:34.7, phcGap:66.9, girlsDropout:6.7, secDropout:3.5 },
    ambedkarnagar: { mmr:167, stunting:31.1, wasting:17.8, anaemia:52.7, homebirth:7.8, noEarlyBF:79.6, noANC:55.5, noPostnatal:23.2, femaleIlliteracy:21.5, secDropout:2.8, secPTR:33, transitionGap:18.3, menstrualGap:22.5, childMarriage:5.5, adolMothers:0, outMigration:74136, interStateMig:749, noCleanFuel:67.8, noCleanWater:0, noSanitation:36.4, cwsnToiletGap:49.8, minorityShare:17.9, spousalViolence:30.5, imr:63, u5mr:78, childWork:4.1, scstShare:24.7, mpiPoor:21, phcGap:69.1, girlsDropout:2.6 },
    amethi: { mmr:167, stunting:35.8, wasting:19.9, anaemia:46.1, homebirth:9.2, noEarlyBF:78.4, noANC:68.3, noPostnatal:23.7, femaleIlliteracy:32.7, secDropout:6.3, secPTR:38, transitionGap:29.4, menstrualGap:28.2, childMarriage:14.9, adolMothers:1.9, outMigration:49224, interStateMig:823, noCleanFuel:73.6, noCleanWater:1.3, noSanitation:39.1, cwsnToiletGap:60.7, minorityShare:20.6, spousalViolence:31.5, imr:51.8, u5mr:60.1, childWork:4.1, scstShare:25, mpiPoor:29, phcGap:68.1, girlsDropout:6.7 },
    ayodhya: { mmr:167, stunting:30.6, wasting:12.4, anaemia:52.3, homebirth:10.9, noEarlyBF:87.5, noANC:66.2, noPostnatal:24.5, femaleIlliteracy:22.3, secDropout:3.1, secPTR:30, transitionGap:17.3, menstrualGap:29, childMarriage:7.6, adolMothers:2, outMigration:66823, interStateMig:847, noCleanFuel:58.7, noCleanWater:0, noSanitation:35.6, cwsnToiletGap:45.7, minorityShare:14, spousalViolence:29.5, imr:88, u5mr:115, childWork:4.5, scstShare:22.5, mpiPoor:17.8, phcGap:66.5, girlsDropout:3.4 },
    barabanki: { mmr:167, stunting:41.9, wasting:18.1, anaemia:55.3, homebirth:24, noEarlyBF:69.8, noANC:77.4, noPostnatal:58.5, femaleIlliteracy:38.9, secDropout:6.8, secPTR:43, transitionGap:34.6, menstrualGap:41.9, childMarriage:20.4, adolMothers:3.4, outMigration:89037, interStateMig:380, noCleanFuel:52.2, noCleanWater:1.2, noSanitation:37.6, cwsnToiletGap:41.2, minorityShare:20.4, spousalViolence:32.2, imr:68, u5mr:97, childWork:5.7, scstShare:26.5, mpiPoor:31.7, phcGap:61.2, girlsDropout:8.1 },
    gbnagar: { mmr:167, stunting:25.5, wasting:12, anaemia:59.4, homebirth:13.4, noEarlyBF:66.6, noANC:47.3, noPostnatal:14.6, femaleIlliteracy:19.4, secDropout:1.4, secPTR:24, transitionGap:9.6, menstrualGap:10.4, childMarriage:13.5, adolMothers:2.1, outMigration:64219, interStateMig:5862, noCleanFuel:25, noCleanWater:0.1, noSanitation:26, cwsnToiletGap:55.2, minorityShare:9.4, spousalViolence:21.5, imr:57, u5mr:70, childWork:4.6, scstShare:13.2, mpiPoor:12.2, phcGap:59.7, girlsDropout:2.1 },
    gonda: { mmr:167, stunting:45.9, wasting:12.1, anaemia:49.3, homebirth:18.2, noEarlyBF:82.1, noANC:58.3, noPostnatal:31.4, femaleIlliteracy:39.6, secDropout:6.7, secPTR:40, transitionGap:33.8, menstrualGap:38.6, childMarriage:25.4, adolMothers:4.2, outMigration:88382, interStateMig:1433, noCleanFuel:43.8, noCleanWater:0, noSanitation:55.4, cwsnToiletGap:54, minorityShare:17.4, spousalViolence:31.5, imr:71, u5mr:97, childWork:6, scstShare:15.5, mpiPoor:29.7, phcGap:67.6, girlsDropout:7.4 },
    gorakhpur: { mmr:167, stunting:29.6, wasting:23.3, anaemia:52.9, homebirth:8.4, noEarlyBF:61.2, noANC:43.7, noPostnatal:20.9, femaleIlliteracy:29.9, secDropout:1.9, secPTR:38, transitionGap:16.3, menstrualGap:21.7, childMarriage:14.6, adolMothers:2.4, outMigration:109367, interStateMig:2203, noCleanFuel:33.2, noCleanWater:0.2, noSanitation:30.4, cwsnToiletGap:73.9, minorityShare:8.6, spousalViolence:30.2, imr:62, u5mr:76, childWork:4.5, scstShare:21.5, mpiPoor:15.8, phcGap:64.7, girlsDropout:5 },
    kushinagar: { mmr:167, stunting:32.2, wasting:24.3, anaemia:42.3, homebirth:10.6, noEarlyBF:83.3, noANC:64.2, noPostnatal:20.7, femaleIlliteracy:35.6, secDropout:5, secPTR:52, transitionGap:23.9, menstrualGap:22.7, childMarriage:17.7, adolMothers:2.6, outMigration:96847, interStateMig:1792, noCleanFuel:44.8, noCleanWater:0, noSanitation:26.9, cwsnToiletGap:67.1, minorityShare:17.8, spousalViolence:30.5, imr:80, u5mr:99, childWork:5, scstShare:17.5, mpiPoor:20.5, phcGap:64.6, girlsDropout:8.2 },
    maharajganj: { mmr:167, stunting:40.5, wasting:21.8, anaemia:47.1, homebirth:6.7, noEarlyBF:86.6, noANC:47.5, noPostnatal:22.8, femaleIlliteracy:35.9, secDropout:6.7, secPTR:42, transitionGap:29.5, menstrualGap:19.4, childMarriage:24.1, adolMothers:3.6, outMigration:62527, interStateMig:587, noCleanFuel:34.9, noCleanWater:0, noSanitation:33.3, cwsnToiletGap:74.3, minorityShare:15.8, spousalViolence:32.5, imr:78, u5mr:96, childWork:5.4, scstShare:19, mpiPoor:19.5, phcGap:69.4, girlsDropout:8.8 },
    shahjahanpur: { mmr:167, stunting:44.5, wasting:17, anaemia:60.3, homebirth:36.7, noEarlyBF:72.4, noANC:64.7, noPostnatal:37.2, femaleIlliteracy:40.5, secDropout:6.5, secPTR:37, transitionGap:34.8, menstrualGap:40.4, childMarriage:20.9, adolMothers:4.6, outMigration:79833, interStateMig:1375, noCleanFuel:59.6, noCleanWater:0, noSanitation:30.8, cwsnToiletGap:62.7, minorityShare:15, spousalViolence:31.5, imr:80, u5mr:100, childWork:3.2, scstShare:17.7, mpiPoor:32.6, phcGap:73.5, girlsDropout:9.9 },
    siddharthnagar: { mmr:167, stunting:37.2, wasting:24.8, anaemia:51.2, homebirth:30.3, noEarlyBF:75.1, noANC:39.1, noPostnatal:38.2, femaleIlliteracy:50.9, secDropout:6.8, secPTR:50, transitionGap:29.7, menstrualGap:37, childMarriage:33.9, adolMothers:3.7, outMigration:66451, interStateMig:1505, noCleanFuel:49.4, noCleanWater:0.1, noSanitation:57.2, cwsnToiletGap:78.3, minorityShare:22.1, spousalViolence:33.5, imr:87, u5mr:116, childWork:5.2, scstShare:16.4, mpiPoor:37.7, phcGap:68.7, girlsDropout:6.4 },
    sonbhadra: { mmr:167, stunting:38.3, wasting:26.8, anaemia:44.5, homebirth:23.2, noEarlyBF:70.9, noANC:63.6, noPostnatal:40.1, femaleIlliteracy:35.2, secDropout:7.2, secPTR:42, transitionGap:30.6, menstrualGap:31.1, childMarriage:17.7, adolMothers:6.9, outMigration:61835, interStateMig:1080, noCleanFuel:69.6, noCleanWater:10.4, noSanitation:29.4, cwsnToiletGap:76.2, minorityShare:6, spousalViolence:35.5, imr:69, u5mr:99, childWork:4.5, scstShare:43.3, mpiPoor:30.6, phcGap:75.1, girlsDropout:9.9 },
    sultanpur: { mmr:167, stunting:33.4, wasting:10.7, anaemia:50.2, homebirth:13, noEarlyBF:73.3, noANC:53, noPostnatal:29.5, femaleIlliteracy:25.1, secDropout:1.5, secPTR:38, transitionGap:16.5, menstrualGap:25.2, childMarriage:7.9, adolMothers:1.1, outMigration:80210, interStateMig:1186, noCleanFuel:66.3, noCleanWater:0.5, noSanitation:34.9, cwsnToiletGap:48.5, minorityShare:17.7, spousalViolence:29.5, imr:45, u5mr:66, childWork:4.1, scstShare:21.4, mpiPoor:22.3, phcGap:60.7, girlsDropout:0.2 },
    dharashiv: { mmr:33, stunting:37.2, wasting:16.1, anaemia:49.1, homebirth:1.9, noEarlyBF:38.7, noANC:10.8, noPostnatal:5.6, femaleIlliteracy:16.3, secDropout:14.8, secPTR:25, transitionGap:1.5, menstrualGap:13.5, childMarriage:36.6, adolMothers:16.1, outMigration:55077, interStateMig:223, noCleanFuel:30.3, noCleanWater:3.6, noSanitation:28.8, cwsnToiletGap:44.7, minorityShare:14.2, spousalViolence:27.5, imr:21, u5mr:24.3, childWork:4.5, scstShare:18.2, mpiPoor:5.3, phcGap:49.8, girlsDropout:18.3 },
    gadchiroli: { mmr:33, stunting:35.7, wasting:30, anaemia:66.2, homebirth:2.7, noEarlyBF:34, noANC:13.2, noPostnatal:8.5, femaleIlliteracy:20.6, secDropout:6.8, secPTR:23, transitionGap:1.5, menstrualGap:19.1, childMarriage:10.1, adolMothers:5.1, outMigration:31693, interStateMig:170, noCleanFuel:39.5, noCleanWater:17, noSanitation:37.6, cwsnToiletGap:83.7, minorityShare:4, spousalViolence:30.2, imr:35.6, u5mr:40, childWork:7.2, scstShare:50, mpiPoor:12.8, phcGap:70.4, girlsDropout:8.2 },
    nandurbar: { mmr:33, stunting:45.8, wasting:30.7, anaemia:64.2, homebirth:23.7, noEarlyBF:48.1, noANC:41.8, noPostnatal:25.6, femaleIlliteracy:42.3, secDropout:14.6, secPTR:25, transitionGap:2.1, menstrualGap:52.5, childMarriage:24, adolMothers:10.6, outMigration:55914, interStateMig:482, noCleanFuel:59.7, noCleanWater:5.4, noSanitation:45.9, cwsnToiletGap:72.3, minorityShare:6.8, spousalViolence:33.5, imr:33, u5mr:38.6, childWork:7, scstShare:72.2, mpiPoor:33.2, phcGap:67.6, girlsDropout:19.4 },
    nashik: { mmr:33, stunting:42.2, wasting:27.2, anaemia:56.2, homebirth:9.5, noEarlyBF:53.5, noANC:33.6, noPostnatal:23.5, femaleIlliteracy:20, secDropout:12.4, secPTR:26, transitionGap:3.2, menstrualGap:20.7, childMarriage:29.6, adolMothers:14, outMigration:221015, interStateMig:1756, noCleanFuel:27.5, noCleanWater:13.7, noSanitation:31.7, cwsnToiletGap:9.2, minorityShare:15.3, spousalViolence:28.5, imr:22.9, u5mr:26.7, childWork:5.2, scstShare:34.7, mpiPoor:13.5, phcGap:69.9, girlsDropout:15 },
    washim: { mmr:33, stunting:35.3, wasting:31.7, anaemia:56.4, homebirth:7.1, noEarlyBF:31.2, noANC:40, noPostnatal:16.6, femaleIlliteracy:22, secDropout:2.1, secPTR:31, transitionGap:0.9, menstrualGap:27.5, childMarriage:27.7, adolMothers:14.3, outMigration:40552, interStateMig:120, noCleanFuel:38.6, noCleanWater:26.3, noSanitation:38.5, cwsnToiletGap:28.7, minorityShare:26.2, spousalViolence:27.5, imr:24.8, u5mr:28.2, childWork:4.7, scstShare:25.9, mpiPoor:14.5, phcGap:75.2, girlsDropout:6.2 },
    basti: { mmr:167, stunting:35.9, wasting:24.2, anaemia:39.9, homebirth:6.8, noEarlyBF:87.9, noANC:68.5, noPostnatal:16.2, femaleIlliteracy:34.7, secPTR:33, transitionGap:16.8, menstrualGap:26.7, childMarriage:15.9, adolMothers:1, outMigration:62566, interStateMig:527, noCleanFuel:43, noCleanWater:0, noSanitation:35.8, cwsnToiletGap:53.7, minorityShare:12.5, imr:81, u5mr:106, childWork:3.4, scstShare:21, mpiPoor:19.9, phcGap:70.2, girlsDropout:14.4, secDropout:4.8 },
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
      girlsDropout:'Unified District Information System for Education Plus (UDISE+) 2022-23, official dashboard data, secondary classes 9-10, girls: 14.43%. The 2024-25 value is published as 0.0; latest usable year shown. 2022-23 was the first year of student-wise data and runs higher than later years.',
      secDropout:'Unified District Information System for Education Plus (UDISE+) 2025-26, official dashboard data, secondary classes 9-12, all children: 4.8%. The 2024-25 value is published as 0.0 at every stage; latest usable year shown.',
    },
    lakhimpur: {
      secPTR:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 secondary-level pupil–teacher ratio',
      transitionGap:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 100 \u2212 66.1% middle\u2192secondary transition',
      cwsnToiletGap:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 100 \u2212 63.8% of schools with FUNCTIONAL toilets accessible to Children With Special Needs (67.7% have one present)',
      minorityShare:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 1,85,862 of 8,92,979 enrolments',
      outMigration:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 1,16,693 within-district + 3,475 inter-district + 620 inter-state',
      interStateMig:'Unified District Information System for Education Plus (2025-26) Kheri fact sheet \u2014 migration to a district of another State',
      secDropout:'Unified District Information System for Education Plus (UDISE+) 2024-25, official dashboard data, secondary classes 9-12, all children: 3.5%. Read from the dashboard because no printed 2024-25 fact sheet was collected for Lakhimpur Kheri.',
    },
    ayodhya: {
      imr:'Annual Health Survey 2012-13, Office of the Registrar General of India, Uttar Pradesh fact sheet, p. 176: Faizabad district (renamed Ayodhya in 2018; same boundary), 88 per 1,000 live births',
      u5mr:'Annual Health Survey 2012-13, Office of the Registrar General of India, Uttar Pradesh fact sheet, p. 182: Faizabad district (renamed Ayodhya in 2018; same boundary), 115 per 1,000 live births',
      childWork:'Census of India 2011, Table B-01, Faizabad district (renamed Ayodhya in 2018; same boundary): 27,825 of 6,20,133 children.',
      scstShare:'Census of India 2011, Primary Census Abstract, Faizabad district (renamed Ayodhya in 2018; same boundary): 5,55,978 of 24,70,996 people.',
    },
    sultanpur: {
      imr:'Annual Health Survey 2012-13, Office of the Registrar General of India, Uttar Pradesh fact sheet, p. 177: Sultanpur district on its 2001 boundary, which still included the area made Amethi in 2010, 45 per 1,000 live births',
      u5mr:'Annual Health Survey 2012-13, Office of the Registrar General of India, Uttar Pradesh fact sheet, p. 183: Sultanpur district on its 2001 boundary, which still included the area made Amethi in 2010, 66 per 1,000 live births',
      childWork:'Census of India 2011, Table B-01, Sultanpur district on its 2011 boundary, which included the three tehsils later made Amethi (40,019 of 9,80,271 children).',
      scstShare:'Census of India 2011, Primary Census Abstract, tehsil rows of the town-village directory. Present-day Sultanpur is the 2011 district less the three tehsils that went to Amethi: 4,82,250 of 22,49,036 people (21.44%). Method A, whole tehsils; the 2011 district-boundary figure of 22.5% included Amethi.',
      phcGap:'Census of India 2011, Village Directory (District Census Handbook Appendix VD; facility positions as in 2009), rebuilt on present-day Sultanpur’s 14 blocks (the 2011 Sultanpur file less Amethi’s 10 blocks): 12,57,261 of 20,71,464 people in villages with a recorded distance (60.7%). A further 2,13,135 people live in villages with no recorded status; counting them all as near or all as far gives a range of 55.0% to 64.4%.',
    },
    amethi: {
      imr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 6, p. 86: 2017 point estimate 51.8 per 1,000 live births (95% uncertainty interval 41.4-66.5). A model estimate for 2017, not a survey count. No government source reports Amethi (district created in 2010).',
      u5mr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 10, p. 102: 2017 point estimate 60.1 per 1,000 live births (95% uncertainty interval 48.1-76.6). A model estimate for 2017, not a survey count. No government source reports Amethi (district created in 2010).',
      childWork:'Census of India 2011, Table B-01, Sultanpur district, which then included Amethi’s three main tehsils (40,019 of 9,80,271 children). Amethi became a district in 2010 and has no figure of its own.',
      scstShare:'Census of India 2011, Primary Census Abstract, tehsil rows of the town-village directory. Amethi did not exist in 2011, so it is rebuilt from whole tehsils (Amethi, Gauriganj and Musafirkhana from Sultanpur, Tiloi from Rae Bareli: the composition on amethi.nic.in): 5,12,215 SC + 319 ST = 5,12,534 of 20,50,133 people (25.00%). Method A, whole tehsils; a boundary-adjusted rebuild gives 25.2%.',
      phcGap:'Census of India 2011, Village Directory (District Census Handbook Appendix VD; facility positions as in 2009), rebuilt on Amethi’s present 13 development blocks (10 from the 2011 Sultanpur file, 3 from the 2011 Rae Bareli file): 9,76,264 of 14,33,129 people in villages with a recorded distance live where the nearest PHC is 5 km or more away (68.1%). A further 3,54,790 people live in villages with no recorded status; counting them all as near or all as far gives a range of 54.6% to 74.4%.',
    },
    dharashiv: {
      imr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 6, pp. 94-95: 2017 point estimate 21.0 per 1,000 live births (95% uncertainty interval 15.5-27.4). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
      u5mr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 10, p. 108: 2017 point estimate 24.3 per 1,000 live births (95% uncertainty interval 18.3-31.5). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
      childWork:'Census of India 2011, Table B-01, Osmanabad district (renamed Dharashiv in 2023; same boundary): 14,199 of 3,18,146 children.',
      scstShare:'Census of India 2011, Primary Census Abstract, Osmanabad district (renamed Dharashiv in 2023; same boundary): 3,01,223 of 16,57,576 people.',
      phcGap:'Mission Antyodaya 2019-20 (Ministry of Rural Development) village survey; a looser measure in which a sub-centre also counts, used because the Census 2011 Village Directory file for Osmanabad is defective. Not comparable with other districts. The 49.8% is the share of villages with no health facility in the village and the nearest one 5 km or more away (377 of 757 villages).',
    },
    gadchiroli: {
      imr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 6, pp. 94-95: 2017 point estimate 35.6 per 1,000 live births (95% uncertainty interval 27.5-45.5). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
      u5mr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 10, p. 108: 2017 point estimate 40.0 per 1,000 live births (95% uncertainty interval 31.2-51.3). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
    },
    nandurbar: {
      imr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 6, pp. 94-95: 2017 point estimate 33.0 per 1,000 live births (95% uncertainty interval 25.2-42.0). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
      u5mr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 10, p. 108: 2017 point estimate 38.6 per 1,000 live births (95% uncertainty interval 29.8-48.6). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
    },
    nashik: {
      imr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 6, pp. 94-95: 2017 point estimate 22.9 per 1,000 live births (95% uncertainty interval 17.4-29.5). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
      u5mr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 10, p. 108: 2017 point estimate 26.7 per 1,000 live births (95% uncertainty interval 20.2-34.5). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
    },
    washim: {
      imr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 6, pp. 94-95: 2017 point estimate 24.8 per 1,000 live births (95% uncertainty interval 18.5-31.7). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
      u5mr:'ICMR-PHFI-IHME India State-Level Disease Burden Initiative (co-led by the Indian Council of Medical Research), The Lancet 2020, web appendix to "Subnational mapping of under-5 and neonatal mortality trends in India: the GBD Study 2000-17", Table 10, p. 108: 2017 point estimate 28.2 per 1,000 live births (95% uncertainty interval 21.2-36.4). A model estimate for 2017, not a survey count. Used for Maharashtra because the government district figures are reported administrative rates or older Census 2011 model estimates, not comparable with each other.',
    },
  };

  // Values kept visible in the profile but not comparable with the rest of the set: left out of the
  // composite index and of the per-indicator ranking and shading. Dharashiv's PHC distance is a looser
  // Mission Antyodaya village measure, not the Census 2011 Village Directory series the others use.
  const indexExclude = { dharashiv:['phcGap'] };

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

  return { districts, nodes, indicators, bench, exact, srcOverride, indexExclude, value };
})();
