// DEHAT financial transparency dataset — audited balance sheets FY2005-06 → FY2024-25.
// Source of truth: signed, audited PDFs (Madhuresh Agrahari & Associates, CA). Where a
// machine-readable soft copy exists (FY2024-25 .xlsx) it is used for exact figures and
// cross-checked against the signed PDF; the signed PDF wins on any conflict.
//
// Amounts are in INR (₹), rupees (not lakhs). `received` normally records cash/accrual
// grant receipts from R&P and grant schedules. Where a surviving signed consolidated
// statement recognises grants only on a utilised/appropriation basis, the year-specific
// source comment says so and preserves the statutory cash cross-reference. `spend` records
// expenditure/utilisation. Reserves carry year-to-year, so received ≠ utilised in any year.
//
// ---- TAXONOMY ----------------------------------------------------------------------
// Top split:  institutional  vs  individual (personal donations).
// Institutional sub-types (type):
//   'un'            UN / multilateral
//   'govt'          Government (central/state/scheme)
//   'csr'           Corporate CSR (Companies Act Sch. VII)
//   'philanthropy'  Private foundations / philanthropies (Azim Premji, Tata Trusts…) — NOT CSR
//   'foreign_org'   Foreign / FCRA-source organisation
//   'indian_inst'   Indian institutional partner / intermediary NGO
//   'individual'    Individual donations
// regime:  'FCRA' (foreign contribution a/c)  |  'INR' (domestic a/c)
// flex:    'restricted' (project-tied)  |  'flexible' (general/unrestricted fund)
// ------------------------------------------------------------------------------------

window.FIN = window.FIN || {};

// ---- REPORTING STANDARDS & BENCHMARKS ----------------------------------------------
// Grounded in Indian NGO practice so the page reads correctly to a layman AND an auditor.
//   • FCRA 2010: foreign contributions kept in a SEPARATE designated account & books,
//     reported to MHA via FC-4 (due 30 Jun). Admin expense capped at 20% of FC since
//     the 2020 amendment (was 50% before FY2020-21).
//   • Income-tax s.11: ≥85% of income must be applied to charitable purposes each year.
//   • Fund accounting: RESTRICTED (project/donor-tied) vs UNRESTRICTED/FLEXIBLE (general).
//   • Accrual basis; presentation per ICAI Technical Guide on Accounting of NGOs (2022)
//     & Guidance Note on Financial Statements of Non-Corporate Entities.
FIN.STANDARDS = {
  fcraAdminCapPct:      { before2020:50, from2020:20, note:'Foreign Contribution (Regulation) Act administrative-expense ceiling as a percentage of foreign contribution' },
  incomeApplicationPct: 85,
  fundModel:            ['restricted','flexible'],
  regimes:              ['FCRA','INR'],
  refs: [
    'Foreign Contribution (Regulation) Act, 2010 & Amendment Rules (administrative cap 20%, single foreign contribution account)',
    'Income-tax Act s.11 (85% application)',
    'Institute of Chartered Accountants of India Technical Guide on Accounting of Non-Governmental Organisations, 2022',
  ],
};

// ---- STATUTORY & COMPLIANCE FRAMEWORK ----------------------------------------------
// DEHAT is a registered Society (Societies Registration Act, 1860). Registrations from
// the audited statements' own footer. The annual compliance cycle below is what an
// auditor/Big-4 reviewer expects to see evidenced — the page can show DEHAT meets each.
FIN.COMPLIANCE = {
  registrations: [
    { code:'Society Reg. 370/2000-01', what:'Registered under the Societies Registration Act, 1860; renewal valid 2025–2030' },
    { code:'12AB(1)(b)',               what:'Income-tax registration of the institution. Unique Registration Number AAAAD3793Q25LK01, Form 10AD order of 17 February 2026, valid for assessment years 2027-28 to 2036-37' },
    { code:'80G(5)',                   what:'Approval under clause (ii) of the second proviso, so Indian donors may claim a deduction. Unique Registration Number AAAAD3793Q25LK02, order of 17 February 2026, valid for assessment years 2027-28 to 2031-32' },
    { code:'Foreign Contribution (Regulation) Act 136260010',           what:'Registered under the Foreign Contribution (Regulation) Act, 2010, nature \u201cSocial\u201d. Renewal valid for five years with effect from 1 October 2023; foreign contribution is received only in the designated account and booked separately' },
    { code:'CSR-1 \u00b7 CSR00001181',    what:'Registered with the Registrar of Companies on 8 April 2021 to undertake corporate social responsibility activity' },
    { code:'PAN AAAAD3793Q',           what:'Permanent Account Number of the Society' },
    { code:'TAN LKND07117F',           what:'Tax Deduction Account Number, allotted 28 March 2012, used for all tax deducted at source' },
  ],
  calendar: [
    { by:'31 May', form:'Form 10BD + 10BE', body:'Income Tax', what:'Donor-wise statement of donations; donor certificates issued' },
    { by:'30 Sep', form:'Form 10B (audit)', body:'Income Tax', what:'Statutory audit — Form 10B applies because DEHAT receives foreign contribution' },
    { by:'31 Oct', form:'ITR-7',            body:'Income Tax', what:'Return of income for the trust/institution' },
    { by:'31 Dec', form:'Form FC-4',        body:'Ministry of Home Affairs', what:'Foreign contributions received & utilised, donor-wise, with 20% admin-cap check; NIL return mandatory' },
    { by:'annual', form:'Annual return',    body:'Registrar of Societies', what:'Society governance & accounts filing' },
  ],
  rules: [
    { key:'85% Application', detail:'≥85% of income applied to charitable purposes each year; up to 15% accumulable, Form 10 for more (5 yrs).' },
    { key:'Foreign Contribution (Regulation) Act 20% Administrative Cap', detail:'Administrative expense ≤20% of foreign contribution (since FY2020-21; 50% before).' },
    { key:'Separate FC Books', detail:'Foreign contribution held & audited separately from domestic (INR) funds — DEHAT keeps distinct foreign contribution and domestic rupee statements.' },
    { key:'s.13 \u2014 No Private Benefit', detail:'No undue benefit to trustees/specified persons.' },
    { key:'Independent Audit', detail:'Accounts audited by a practising Chartered Accountant (Madhuresh Agrahari & Associates), signed with a Unique Document Identification Number.' },
  ],
};

// ---- CREDENTIALS & DOCUMENTS -------------------------------------------------------
// Statutory registrations, approvals and third-party validations, uploaded as scanned
// PDFs. Each links to a copy under assets/docs/. `group` drives display bucketing.
FIN.DOCUMENTS = [
  // Statutory registration & tax
  { title:'Society Registration Renewal', issuer:'Registrar of Societies, U.P.', period:'Valid 2025–2030', group:'statutory',
    desc:'Renewal of DEHAT’s registration under the Societies Registration Act, 1860 (Reg. 370/2000-01).', file:'assets/docs/society-registration-renewal-2025-2030.pdf' },
  { title:'Memorandum of Association & By-Laws', issuer:'DEHAT', period:'Governing document', group:'statutory',
    desc:'The Society’s constitution — objects, membership, governing body and rules of operation.', file:'assets/docs/moa-bylaws.pdf' },
  { title:'PAN Card', issuer:'Income Tax Department', period:'AAAAD3793Q', group:'statutory',
    desc:'Permanent Account Number of the Society.', file:'assets/docs/pan-card.pdf' },
  { title:'Form 10AB Approval — 12A Registration', issuer:'Income Tax Department', period:'Order 17 Feb 2026', group:'statutory',
    desc:'Renewal of the institution’s income-tax registration under section 12A (tax exemption on income applied to charity).', file:'assets/docs/form-10ab-approval-1.pdf' },
  { title:'Form 10AB Approval — 80G', issuer:'Income Tax Department', period:'Order 17 Feb 2026', group:'statutory',
    desc:'Renewal of 80G approval — Indian donors can claim a tax deduction on their gifts.', file:'assets/docs/form-10ab-approval-2.pdf' },
  { title:'CSR-1 Approval Letter', issuer:'Ministry of Corporate Affairs', period:'Registered', group:'statutory',
    desc:'Form CSR-1 registration on the Ministry of Corporate Affairs portal — allows DEHAT to receive corporate social responsibility funds.', file:'assets/docs/csr1-approval-letter.pdf' },
  // Foreign contribution (FCRA)
  { title:'Foreign Contribution (Regulation) Act Renewal Certificate', issuer:'Ministry of Home Affairs', period:'Registration 136260010', group:'fcra',
    desc:'Renewed clearance to receive foreign contributions; foreign funds are kept in a separate Foreign Contribution (Regulation) Act account and audited apart from domestic funds.', file:'assets/docs/fcra-renewal-certificate.pdf' },
  { title:'Tax Deduction Account Number (TAN) Allotment', issuer:'Income Tax Department', period:'TAN LKND07117F', group:'statutory',
    desc:'Allotment of the Society’s TAN, quoted on every tax deducted at source challan, certificate and return.', file:'assets/docs/fcra-designated-bank-account.pdf' },
  // Third-party validations & recognition
  { title:'CAF India Validation Certificate', issuer:'CAF India', period:'Validated', group:'validation',
    desc:'Due-diligence validation by Charities Aid Foundation India — an independent check of governance, finance and compliance.', file:'assets/docs/caf-validation-certificate.pdf' },
  { title:'Tata Institute of Social Sciences Empanelment Certificate', issuer:'Tata Institute of Social Sciences', period:'Empanelled — Public Sector Undertaking', group:'validation',
    desc:'Empanelled with the Tata Institute of Social Sciences as an implementing partner for Public Sector Undertaking corporate social responsibility programmes.', file:'assets/docs/tiss-empanelment-certificate.pdf' },
  { title:'BSE Sammaan Listing', issuer:'BSE (Bombay Stock Exchange)', period:'Listed organisation', group:'validation',
    desc:'Listed on the BSE Sammaan platform, the Bombay Stock Exchange’s vetted registry connecting corporates with credible non-governmental organisations for corporate social responsibility.', file:'assets/docs/bse-sammaan.pdf' },
];

// ---- TIME-VERSIONED REGULATORY TIMELINE --------------------------------------------
// Statutory rules changed across DEHAT's life (registered 2000-01). Each year MUST be
// judged against the regime then in force — not today's. `effectiveFrom` = first FY the
// rule applied. Use fcraAdminCapFor(fy) to get the correct admin cap for any year.
FIN.REG_TIMELINE = [
  { fy:'—',        event:'DEHAT registered as a Society (Societies Registration Act, 1860)', when:'2000-01', domain:'org' },
  { fy:'pre-2011', event:'Foreign Contribution (Regulation) Act 1976 in force — foreign funds under the older regime',        when:'…2010-11', domain:'fcra' },
  { fy:'2011-12',  event:'Foreign Contribution (Regulation) Act 2010 replaces the 1976 Act; administrative-expense cap 50% of foreign contribution',         when:'2011',    domain:'fcra' },
  { fy:'2016-17',  event:'Foreign contribution online returns (Form FC-4) & annual online filing regime matures',  when:'2015-16', domain:'fcra' },
  { fy:'2020-21',  event:'Foreign Contribution (Regulation) Act 2020 amendment: administrative cap cut 50%→20%, single State Bank of India, Delhi foreign contribution account, sub-granting between organisations banned', when:'Sep 2020', domain:'fcra' },
  { fy:'2021-22',  event:'12A → 12AB re-registration (5-yr renewable); Form 10BD/10BE donor reporting introduced', when:'2021', domain:'incometax' },
  { fy:'2023-24',  event:'Audit report split into Form 10B (foreign contribution / >₹5cr / income applied abroad) vs 10BB', when:'AY 2023-24', domain:'incometax' },
];
// Admin cap applicable to a given financial year (start year int or 'YYYY-YY').
FIN.fcraAdminCapFor = function(fy){
  var y = parseInt(String(fy).slice(0,4), 10);
  return y >= 2020 ? 20 : 50; // 20% from FY2020-21; 50% before
};




// Funder registry — canonical entities across all years (aliases map OCR variants).
FIN.FUNDERS = {
  caritas_germany:  { name:'Caritas Germany (Deutscher Caritasverband e.V.)', type:'foreign_org', regime:'FCRA', aliases:['Deutscher Caritasverband e.V.','DCV'], note:'Legal donor for Surokhit Shaishav. Caritas India provides programme support but is not the same legal entity.' },
  dasra:            { name:'Dasra',                               type:'foreign_org',  regime:'FCRA', aliases:['DASRA','Darsa'] },
  ksc_foundation:   { name:'Kailash Satyarthi Children’s Foundation', type:'foreign_org', regime:'FCRA', aliases:['Kailash Satyarthi','KSCF'] },
  shes_the_first:   { name:"She's The First",                     type:'foreign_org',  regime:'FCRA', aliases:["She's The First Cry",'She is the First -US','Panchi'] },
  edele_give:       { name:'EdelGive Foundation',                 type:'philanthropy', regime:'INR',  aliases:['Edele Give Foundation','Edele Give','EdeleGive'] },
  appi:             { name:'Azim Premji Philanthropic Initiatives', type:'philanthropy', regime:'INR', pan:'AADCA2473P', aliases:['Azim Premji (APPI)','APPI FASAL','APPI COVID RELIEF','Azim Premji Philanthropic Initiatives'] },
  childline_india:  { name:'Childline India Foundation',          type:'indian_inst',  regime:'INR', pan:'AAATC2486J', aliases:['Childline','Childline Shravasti','Child Line Foundation'] },
  aih:              { name:'Alliance for Immunization & Health',   type:'indian_inst',  regime:'INR', pan:'ABAFA5797K', aliases:['AIH - MAHARASHTRA','AIH - UP','Alliance for Immunization'] },
  acc:              { name:'ACC Limited (Corporate Social Responsibility)',                      type:'csr',          regime:'INR', pan:'AAACT1507C', aliases:['ACC Ltd','Scope of Work for Malnutrition (ACC)'], note:'Corporate CSR (cement); Sch VII' },
  individuals:      { name:'Individual Partners',                 type:'individual',   regime:'INR',  aliases:['General Donations','Donation Received'] },
  sciaf:            { name:'Scottish Catholic International Aid Fund', type:'foreign_org', regime:'FCRA', aliases:['SCIAF','Scottish Catholic International Aid Fund'] },
  caritas_india_fcra:{ name:'Caritas India (SCIAF-funded Swaraksha channel)', type:'indian_inst', regime:'FCRA', aliases:['Caritas India','Caritas - Swaraksha','Caritass India'], note:'Historical Swaraksha agreement identifies Caritas India as facilitator/reviewer and states “Agency Allocation: SCIAF”. Kept distinct from Caritas Germany.' },
  sanlaap:          { name:'Sanlaap',                                         type:'indian_inst',  regime:'FCRA', aliases:['SANLAAP','Sanlaap - Kolkata'] },
  igsss:            { name:'Indo-Global Social Service Society',  type:'indian_inst',  regime:'FCRA', aliases:['IGSSS','Indo Global Social Service Society'] },
  laher:            { name:'Laher Project (Intermediary)',         type:'indian_inst',  regime:'INR',  aliases:['Laher','Lahar','Lahar project','Laher project'] },
  caritas_india_inr:{ name:'Caritas India (INR Channel)',         type:'indian_inst',  regime:'INR',  aliases:['Caritas India - Swaraksha INR','Caritas - Swaraksha Project'] },
  // Historical / one-off funders (FY2015-16 → FY2019-20)
  birlasoft:        { name:'Birlasoft India Ltd (CSR)',           type:'csr',          regime:'INR',  aliases:['Birlasoft','Grant From- Birlasoft India Ltd','e-vidya','E-Vidhya','E Vidhya','Evidhya'], note:'"e-vidya" — computer-skills CSR programme for girl students, Government Girls Inter College, Sector 51, Noida (CSR Enabler Agreement, 12 April 2018). Not affiliated with IIMPACT despite the similar-sounding name.' },
  centum:           { name:'Centum WorkSkills India (WSI)',        type:'csr',          regime:'INR',  aliases:['Centum','WSI','Centum (WSI)','WSI Learning Centre'] },
  tmn:              { name:'TMN (Seed Treatment Programme)',        type:'indian_inst',  regime:'INR',  aliases:['TMN'], note:'FY2012-13 Society Home Account component, per the audited workbook (sheet "DEHAT -GENERAL").' },
  vidhya:           { name:'Vidhya (Scholarship Programme)',        type:'indian_inst',  regime:'INR',  aliases:['Vidhya','Vidhya Grants'], note:'FY2012-13 Society Home Account component, per the audited workbook (sheet "DEHAT -GENERAL").' },
  nabard:           { name:'NABARD',                               type:'govt',         regime:'INR',  aliases:['NABARD SHG Formation'] },
  ssk:              { name:'Sahbhagi Shikshan Kendra',               type:'institutional', regime:'INR', aliases:['SSK', 'SSK, Lucknow', 'SSK Training Project', 'Sahbhagi Shiksha Kendra'] },
  cry:              { name:'Child Rights and You (CRY)',           type:'philanthropy', regime:'INR',  aliases:['CRY','Cry Project'] },
  sdtt:             { name:'Sir Dorabji Tata Trust',        type:'philanthropy', regime:'INR',  aliases:['SDTT','SDTT Fund'] },
  unicef:           { name:'UNICEF',                               type:'un',           regime:'INR',  aliases:['UNICEF-CPP','UNICEF- CPP Project'] },
  action_aid:       { name:'ActionAid (Action on Research/Direct Democracy)', type:'foreign_org', regime:'FCRA', aliases:['Action Aid','ACTION AID Project','Action on Research on Direct Democracy'] },
  milaan_swabhiman: { name:'Milaan Be The Change (Swabhiman programme)', type:'indian_inst', regime:'FCRA', aliases:['Milaan','Milaan Foundation','Swabhiman Programme'], note:'The executed amendment dated 6 September 2014 identifies Milaan and DEHAT as the parties to the Swabhiman programme MoU dated 7 July 2014. The audited schedule separately labels the fund “Swabhiman (Erase Poverty)”.' },
  sahyog:           { name:'Sahyog Society',                        type:'indian_inst',  regime:'FCRA', aliases:['Sahyog','Sahyog Society FC A/c'] },
  iimpact:          { name:'IIMPACT (Rural Girl Child Education)', type:'philanthropy', regime:'INR',  aliases:[] },
  // Renamed from a shared 'milaan' key: every use in this dataset actually describes Charity Science
  // (a distinct organisation) — none reference Milaan Be The Change, the contracting counterparty for
  // the FY2014-15 Swabhiman programme. The two must not be conflated.
  charity_science:  { name:'Charity Science',                       type:'foreign_org',  regime:'INR',  aliases:['Charity Science Foundation'] },
  geeta_karnal:     { name:'GEETA (Karnal Partner)',          type:'indian_inst',  regime:'INR',  aliases:['GEETA Karnal','GEETA','NSE/Geeta','NSE'] },
  ipartner:         { name:'iPartner India',                        type:'indian_inst',  regime:'INR',  aliases:['iPartner India','iPartner'] },
  google:           { name:'Google (In-Kind / Ad Grants)',          type:'csr',          regime:'INR',  aliases:['Google','Income From Google','Grant from Google'] },
  // Founding-era funders (FY2005-06 → FY2011-12)
  dfid_pacs:        { name:'Department for International Development — Poorest Areas Civil Society Programme (Lokshakti)',      type:'govt',         regime:'FCRA', aliases:['DFID','PACS','PACS Programme','Lokshakti','DFID (PACS PROGRAME)'] },
  baif:             { name:'BAIF Development Research Foundation',   type:'indian_inst',  regime:'FCRA', aliases:['BAIF','RAIF','Sure Start','SURE START PROJECT','BAIF Pune'] },
  kabir:            { name:'United Nations Development Programme (Routed via Kabir, New Delhi)', type:'un', regime:'FCRA', aliases:['Kabir','Kabir Project','Kabir New Delhi','UNDP'], note:'Kabir was the implementing intermediary; the funding this project drew on is credited to the United Nations Development Programme, one of Kabir’s own recorded funding sources for this period.' },
  tara_akshar:      { name:'Tara Akshar (Women\'s Literacy)',        type:'indian_inst',  regime:'INR',  aliases:['Tara Akshar','TARA AKSHAR'] },
  pani:             { name:'PANI, Faizabad (Grant Intermediary)',             type:'indian_inst',  regime:'INR',  aliases:['PANI','PANI Faizabad','From PANI'] },
  jagdeep_lohani:   { name:'Jagdeep Singh Lohani (Individual)',      type:'individual',   regime:'INR',  aliases:['Jagdeep Singh Lohani','Mr. Jagdeep Singh Lohani'] },
  ssa:              { name:'Sarva Shiksha Abhiyan (Govt.)',          type:'govt',         regime:'INR',  aliases:['SSA','Sarva Siksha Abhiyaan'] },
  jica:             { name:'JICA / Japan Bank (UPFMPAP Forest Project)', type:'govt', regime:'INR', aliases:['JICA','Japan Bank for International Cooperation','UPFMPAP','DMU Renukoot','DMU Sonbhadra'], note:'UP Participatory Forest Mgmt & Poverty Alleviation Project, routed through the state Divisional Management Unit' },
  // These three were previously folded into the 'individuals' bucket as "one-off domestic consultancy
  // grants." They are not individuals — each is a distinct institution with its own agreement.
  afc:              { name:'Agricultural Finance Corporation Ltd',   type:'indian_inst',  regime:'INR', aliases:['AFC','AFC, Lucknow'], note:'Signed letter dated 26.03.2009 (AFC:LKO:PP Basti:2009), on AFC letterhead (21 Vidhan Sabha Marg, Lucknow; Regd. Office Mumbai) — DEHAT was the paid service provider for a Gram Panchayat–level survey of Basti District under the NREGA Perspective Plan, not a grant recipient in the usual sense; a fee-for-service consultancy contract.' },
  primenet:         { name:'Primenet, Lucknow',                     type:'indian_inst',  regime:'INR', aliases:['PRIMENET','Primenet'], note:'Same NREGA Perspective Plan survey structure as the AFC contract above (Bahraich District rather than Basti), per the signed FY2009-10 statement\'s own parallel "PRIMENET-Perspective Plan of Bahraich Dist. under NREGA" heading. No separate signed agreement letter has been located on file for this one — treated as an institutional consultancy on the strength of the audited statement\'s own structure, not an individual.' },
  upvan:            { name:'Uttar Pradesh Voluntary Action Network', type:'indian_inst', regime:'INR', aliases:['UPVAN','UPVAN, Lucknow'], note:'Name corrected per direct confirmation — not the Forest Department, which was an earlier, unsupported guess drawn only from a coincidentally-similar partner-logo filename elsewhere on this site, not a citation. UPVAN funded a Right to Information campaign in FY2009-10 per the signed statement\'s "UPVAN -RTI Compaign Expenses" heading, which fits a civil-society voluntary-action network far better than a state forestry department.' },
  erase_poverty:    { name:'Erase Poverty (Swabhiman)',                type:'foreign_org', regime:'FCRA', aliases:['ERASE POVERTY','Erase Poverty'] },
  light_a_lamp:     { name:'Light A Lamp Foundation',                  type:'foreign_org', regime:'FCRA', aliases:['LIGHT A LAMP','Light A Lamp Foundation'] },
  sit_world:        { name:'SIT / World Learning India',               type:'foreign_org', regime:'INR',  aliases:['SIT-World Learning India','SIT','World Learning'] },
  rilm:             { name:'Rotary South Asia Society for Development and Cooperation (RSAS)', type:'indian_inst', regime:'INR', aliases:['RSAS','RILM','Rotary India Literacy Mission','Rotary','Grant from Rotary'], note:'The executed 2016 MoU identifies RSAS as the contracting Indian society and Rotary India Literacy Mission (RILM) as its authorised programme/committee. The historical project-facing name remains RILM / Asha Kiran.' },
};

// Per-year records. programme/admin split is derived from Income & Expenditure line
// items (see spend.byProject[].admin where the statement itemises it).
// Publishing a foreign-contribution return: add BOTH keys to that year below.
//   fcReturn:'assets/docs/<actual-file>.pdf'  — a file that really exists in assets/docs
//   fcReturnForm:'FC-4'                        — the form that year was ACTUALLY filed on,
//                                                as confirmed by DEHAT's auditor
// Omit both and the row shows "Return on request" instead of a broken link. Never derive
// the path or the form name from the year: the filing history is a matter of record.
FIN.YEARS = [
  {
    fy:'2024-25', doc:'assets/docs/balance-sheet-2024-25.pdf', period:'1 Apr 2024 – 31 Mar 2025',
    signed:true, softcopy:true, auditor:'Madhuresh Agrahari & Associates', udin:'25528519BMNZFO7507',
    // Basis disclosure — RESOLVED: source is DEHAT's own "Activity wise utilisation" FC-4
    // preparation working paper (govt.-format schedule, cross-checked line by line, every row
    // balances exactly: Previous Balance + Receipt + "Utilised Support by DEHAT" = Utilised + Balance).
    // For Caritas/Surokhit Shaishav: opening ₹1,31,263.64 + FY24-25 grant ₹32,25,694 = ₹33,56,957.64
    // available; actual audited spend was ₹35,00,087, exceeding availability by ₹1,43,129.36.
    // For KSCF/Access to Justice: opening ₹2,73,669 + grant ₹46,17,487 = ₹48,91,156 available;
    // actual audited spend was ₹62,86,034, exceeding availability by ₹13,94,878. Both shortfalls were
    // covered from DEHAT's own (non-FCRA) funds — the "Utilised Support by DEHAT" column — not from
    // any further foreign contribution. ₹1,43,129.36 + ₹13,94,878 = ₹15,38,007.36, matching the
    // live-vs-FC-4 difference (₹15,38,007.04, the small residual being paisa rounding). The submitted
    // FC-4 (24/12/2025) correctly reports only the foreign-contribution-funded portion of utilisation
    // (available balance minus year-end carryforward = ₹1,10,22,034.96); the audited consolidated
    // books correctly report full programme spend including DEHAT's own top-up (₹1,25,60,042.32).
    // Both figures are right, on their own basis — this is not an error requiring correction.
    received:[
      // FCRA (foreign) — all restricted project grants
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:3225694, interest:0 },
      { funder:'ksc_foundation',  regime:'FCRA', flex:'restricted', grant:4617487, interest:0 },
      { funder:'shes_the_first',  regime:'FCRA', flex:'restricted', grant:1876655, interest:0 },
      { funder:'dasra',           regime:'FCRA', flex:'restricted', grant:1045404, interest:0 },
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible',   grant:0,       interest:104520, note:'Foreign contribution general fund interest' },
      // INR (domestic)
      { funder:'appi',            regime:'INR',  flex:'restricted', grant:5031000, interest:56887, note:'Azim Premji Philanthropic Initiatives FASAL' },
      { funder:'edele_give',      regime:'INR',  flex:'restricted', grant:0,       interest:3375 },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:0,       interest:958,  note:'Childline Shravasti (carryover)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:96760,   interest:10063, note:'Individual contributions' },
    ],
    // Spend by project (utilised). admin = amount the I&E itemises as admin/overhead.
    spend:[
      { project:'Surokhit Shaishav — Promoting Safe Childhood', funder:'caritas_germany', regime:'FCRA', total:3500087, admin:132196 },
      { project:'Access to Justice',             funder:'ksc_foundation',  regime:'FCRA', total:6286034, admin:632571 },
      { project:'Skill Soldiers for a Better Future', funder:'dasra',      regime:'FCRA', total:1484973, admin:172550 },
      { project:'Panchi',                        funder:'shes_the_first',  regime:'FCRA', total:1257835, admin:324993 },
      { project:'DEHAT direct (own foreign contribution fund)',  funder:'__fcra_general',  regime:'FCRA', total:31113,   admin:31113 },
      { project:'Indian grant programmes (Azim Premji Philanthropic Initiatives FASAL etc.)', funder:'appi', regime:'INR', total:5078407, admin:0, adminChecked:true },
      { project:'DEHAT general expenditure',     funder:'individuals',     regime:'INR', total:1622834, admin:1622834 },
    ],
    depreciation:105405,
    reserves:{ closingBankFCRA:1129346, closingBankINR:691267 },
    balanceSheetTotal:2531500.55,
  },
  // FY2005-06 … FY2023-24 — extracted from signed scanned PDFs (in progress).
  {
    fy:'2023-24', doc:'assets/docs/balance-sheet-2023-24.pdf', period:'1 Apr 2023 – 31 Mar 2024',
    signed:true, softcopy:false, auditor:'Madhuresh Agrahari & Associates', udin:'24528519BKEGVJ6534',
    fcReturnStatus:'Filed FC-4 confirmed 27 August 2026 — no draft watermark, signed by DEVYANI CHATURVEDI, organisational seal present, footer reads "FCRA Annual Returns for the financial year has been Submitted on 26/12/2024" on every page. Supersedes the earlier draft-only copies.',
    // Source: "FC-4 FY 2023-24.pdf" — a genuinely filed, signed, sealed return, distinct from every
    // earlier-located copy that carried the "DRAFT COPY FINAL SUBMISSION IS NEEDED" watermark. Its
    // donor-level figures (KSCF 46,00,231; Caritas Germany 34,09,467; She's the First 16,10,970;
    // Dasra 10,18,932; interest 87,982; utilisation 92,81,306.48) match exactly what was already
    // independently verified from the draft copy and the audited consolidated workbook — this document
    // only changes the filing-status finding, not any figure.
    //
    // FCRA admin source-basis conflict (disclosed, not forced to one figure): the audited workbook
    // ("Balance sheet 2023-24 - DEHAT Consolidate.xlsx", sheet "FCRA Income & Exp.") gives per-project
    // admin figures — Caritas Germany 1,74,996.36 + KSC Foundation 7,85,905 + Dasra 93,700 + She's the
    // First 1,43,757 + DEHAT direct fund 18,288.12 — summing to 12,16,646.48 (13.11% of total spend).
    // The filed FC-4 (page 3, Section 3(a)(ii), verified directly against the primary document) states
    // "Total administrative expenses as provided in rule 5... : 909784.48" (9.80% of total spend) as one
    // aggregate statutory figure, not broken down per project. Both bases are compliant with the 20%
    // statutory cap regardless of which is used. The live per-project admin figures below follow the
    // audited workbook basis (consistent with how every other project in this dataset sources its admin
    // split); the FC-4's own aggregate total is disclosed here as the alternate statutory-basis figure,
    // not silently reconciled against it.
    // Source: "Balance sheet 2023-24 - DEHAT Consolidate.xlsx", sheet " INR Grant Sheet" (Schedule -
    // Indian Grants) and sheet "Cons Inc & Exp" (signed I&E account). The I&E account itself prints
    // "GRANTS INR (INCL. INTEREST) — Received During the Year: 10,414,166" as its own line, with
    // "Donations (INR): General Donations 8,90,345.08 + Bank Interest 4,196" as a SEPARATE income
    // category — confirming the four named grants below (which the Grant Sheet's own TOTAL row also
    // sums to 10,346,482 + 67,684 interest = 10,414,166) exclude the general fund entirely. The
    // previous entry here lumped the grant-sheet's grand total (project grants + general fund,
    // 11,236,827 + 71,880) into one placeholder, which double-counted the general fund against the
    // separate `individuals` line below it.
    receivedTotal:22036289,
    received:[
      // FCRA (foreign) — restricted project grants (Receipts & Payments, cash received)
      { funder:'ksc_foundation',  regime:'FCRA', flex:'restricted', grant:4600231, interest:0 },
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:3409467, interest:0 },
      { funder:'shes_the_first',  regime:'FCRA', flex:'restricted', grant:1610970, interest:0 },
      { funder:'dasra',           regime:'FCRA', flex:'restricted', grant:1018932, interest:0 },
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible',   grant:0,        interest:87982, note:'Foreign contribution general fund interest' },
      // INR (domestic) — named per the Schedule of Indian Grants
      { funder:'appi',            regime:'INR',  flex:'restricted', grant:4470000, interest:56297, note:'Azim Premji Philanthropic Initiatives FASAL' },
      { funder:'edele_give',      regime:'INR',  flex:'restricted', grant:4000000, interest:10848, note:'GROW project' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:697392,  interest:0,     note:'Childline India Foundation' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1179090, interest:539,   note:'Childline Shravasti', project:'Childline Shravasti' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:890345,   interest:4196,  note:'Individual contributions' },
    ],
    spend:[
      { project:'Surokhit Shaishav — Promoting Safe Childhood', funder:'caritas_germany', regime:'FCRA', total:3278203, admin:174996 },
      { project:'Access to Justice',             funder:'ksc_foundation',  regime:'FCRA', total:4326562, admin:785905 },
      { project:'Skill Soldiers for a Better Future', funder:'dasra',      regime:'FCRA', total:732166, admin:93700 },
      { project:'Panchi',                        funder:'shes_the_first',  regime:'FCRA', total:926087, admin:143757 },
      { project:'DEHAT direct (own foreign contribution fund)',  funder:'__fcra_general',  regime:'FCRA', total:18288,   admin:18288 },
      // Indian grant programmes, itemised per the same "INR Grant Sheet" utilised (F) column used for
      // the received side above: APPI 41,26,802.70 + EdelGive 38,43,033.58 + Childline India Foundation
      // 5,62,892.00 + Childline Shravasti 5,05,987.02 = 90,38,715.30, to the rupee.
      //
      // APPI admin: sourced from "2110-10970_...reporting sheet-2.xlsx" (Budget Report sheet), APPI's own
      // Budgeted-vs-Actuals half-year utilisation report for this same FASAL grant (its Budgeted totals tie
      // exactly, to the rupee, to the OneDrive-held "APPI-DEHAT FASAL V.2.budget_19th Aug.xlsx"). FY2023-24
      // (Apr 2023–Mar 2024) spans the second half of HY3 (Jan–Jun 2023), all of HY4 (Jul–Dec 2023), and the
      // first half of HY5 (Jan–Jun 2024). "Office Administration Cost" actuals: HY3 ₹76,182 (half ₹38,091),
      // HY4 ₹1,66,285 (fully in-year, no proration), HY5 ₹72,022 (half ₹36,011) = ₹2,40,387 — office rent,
      // power backup, staff meeting/hospitality and communication costs for the FASAL project office, as
      // distinct from that project's own Salary/Travel/Program lines (field staff and farmer-facing
      // activity, not DEHAT-office administration). Edge-half-year figures are linearly prorated by month
      // and the source notes some HY3-to-HY4 carryover adjustment, so this is a close estimate from real
      // actuals, not a document stating the fiscal-year figure directly.
      //
      // EdelGive admin: "Final Budget sheet_2023_14th JUNE'23.xlsx" (sheet "2nd Year'2023-24"; Q5–Q8 =
      // FY2023-24 per the sheet's own key) shows this entire GROW Fund grant is institutional-strengthening
      // spend — Core Cost (Executive Director/Joint Director/COO/core-team salaries, head-office rent,
      // audit, non-programmatic travel, communications) plus Organisation Development and Capacity Building
      // (staff trainings, website, fundraising event) — with no beneficiary-facing programme line anywhere
      // in the budget. None of it supports a DEHAT programme; all of it supports DEHAT's own office and
      // organisational capacity, so the full amount is Administration & Governance.
      { project:'Azim Premji Philanthropic Initiatives FASAL programme', funder:'appi',            regime:'INR', total:4126802.70, admin:240387.00 },
      { project:'GROW (EdelGive)',                                       funder:'edele_give',      regime:'INR', total:3843033.58, admin:3843033.58 },
      // Childline admin: signed Childline India Foundation utilisation/audit reports (File Nos.
      // BG/N/DCL/C/23-24/80/FI for Bahraich and .../214/FI for Shravasti, "Head Services" Sandeep Kumar
      // Mitra), each with its own explicit "Administrative Expenses" sub-total distinct from Staff Salary
      // and Client Related Expenses. Bahraich: Grant Utilised (As per Accounts) ₹5,62,892 = Staff Salary
      // ₹3,80,000 + Client Related (incl. Travel) ₹1,27,474 + Administrative Expenses ₹55,418 — the total
      // matches the already-recorded figure to the rupee. Shravasti: this report's own total (₹5,05,897) is
      // ₹90.02 below the already-recorded ₹5,05,987.02 (immaterial, not adjusted); its Administrative
      // Expenses sub-total is ₹49,782, applied directly as this line's admin figure.
      { project:'Childline India Foundation',                            funder:'childline_india', regime:'INR', total:562892,     admin:55418.00 },
      { project:'Childline Shravasti',                                   funder:'childline_india', regime:'INR', total:505987.02,  admin:49782.00 },
      { project:'DEHAT general expenditure',     funder:'individuals',     regime:'INR',  total:190163, admin:190163 },
    ],
    depreciation:150558,
    surplus:623513.53,
    balanceSheetTotal:5296331.59,
  },
  {
    fy:'2022-23', doc:'assets/docs/balance-sheet-2022-23.pdf', period:'1 Apr 2022 – 31 Mar 2023',
    signed:true, softcopy:true, auditor:'Madhuresh Agrahari & Associates', udin:'23528519BGXVMU3256',
    // Source: DEHAT B.S. Consolidated 2022-23.pdf (signed) + Financial Summary 2022-23 xlsx (per-funder INR schedule)
    received:[
      // FCRA
      { funder:'dasra',           regime:'FCRA', flex:'restricted', grant:999600,    interest:0 },
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:449282,    interest:0 },
      { funder:'shes_the_first',  regime:'FCRA', flex:'restricted', grant:126301,    interest:0 },
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible',   grant:0,         interest:8314, note:'Foreign contribution general fund interest' },
      // INR — per-funder from Financial Summary 2022-23 xlsx
      { funder:'appi',            regime:'INR',  flex:'restricted', grant:0,         interest:45542,    note:'Azim Premji Philanthropic Initiatives FASAL — carryover only; opening ₹27,20,272.77; utilised ₹30,00,456.92' },
      { funder:'edele_give',      regime:'INR',  flex:'restricted', grant:2000000,   interest:25587,    note:'GROW project; opening ₹19,98,549; utilised ₹39,79,558.95' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:911954.5,  interest:0,        note:'Scope of Work for Malnutrition; opening -₹71,548.10; utilised ₹8,74,613' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1695454,   interest:0,        note:'Childline India Foundation; opening -₹8,43,913; utilised ₹14,04,861' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:941113,    interest:1627,     note:'Childline Shravasti; opening -₹7,75,121.80; utilised ₹13,99,247', project:'Childline Shravasti' },
      { funder:'caritas_india_inr',regime:'INR', flex:'restricted', grant:100000,    interest:0,        note:'Caritas India INR Swaraksha; opening -₹12,812; utilised ₹6,35,053' },
      { funder:'laher',           regime:'INR',  flex:'restricted', grant:155000,    interest:0,        note:'Laher project; opening ₹0; utilised ₹1,61,874.50' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:187736.34, interest:5298,     note:'Individual contributions' },
    ],
    spend:[
      { project:'Surokhit Shaishav — Promoting Safe Childhood', funder:'caritas_germany', regime:'FCRA', total:465174, admin:1674 },
      { project:'DEHAT direct (own foreign contribution fund)',   funder:'__fcra_general',   regime:'FCRA', total:17448,    admin:17448 },
      { project:'Azim Premji Philanthropic Initiatives FASAL programme',           funder:'appi',             regime:'INR',  total:3000456.92, admin:0, adminChecked:true },
      { project:'GROW (EdelGive)',                 funder:'edele_give',       regime:'INR',  total:3979558.95, admin:0, adminChecked:true },
      { project:'ACC Malnutrition',               funder:'acc',              regime:'INR',  total:874613,   admin:0, adminChecked:true },
      { project:'Childline India Foundation',     funder:'childline_india',  regime:'INR',  total:1404861,  admin:0, adminChecked:true },
      { project:'Childline Shravasti',            funder:'childline_india',  regime:'INR',  total:1399247,  admin:0, adminChecked:true },
      { project:'Caritas Swaraksha (INR)',        funder:'caritas_india_inr',regime:'INR',  total:635053,   admin:0, adminChecked:true },
      { project:'Laher project',                  funder:'laher',            regime:'INR',  total:161874.5, admin:0, adminChecked:true },
      { project:'DEHAT general expenditure',      funder:'individuals',      regime:'INR',  total:121177, admin:121177 },
    ],
    depreciation:200713,
    surplus:-137990.43,
    balanceSheetTotal:null, // scanned; not digitised
  },
  {
    fy:'2021-22', doc:'assets/docs/balance-sheet-2021-22.pdf', period:'1 Apr 2021 – 31 Mar 2022',
    signed:true, softcopy:true, auditor:'Madhuresh Agrahari & Associates', udin:'22528519BDJWNE2102',
    // Source: signed consolidated statement + submitted FC-4 (02/08/2022). The workbook titled
    // "Last 3 Year Income Expenditure Detail" labels its FY2021-22 Caritas/IGSSS/Sanlaap columns
    // Total Budget Amount and Utilization; they are not cash receipts. Earlier live rows wrongly
    // imported those values as receipts. FC-4 reports no direct or local foreign contribution
    // received during FY2021-22 and FCRA bank interest of ₹20,346; that statutory receipt evidence
    // controls the corrected FCRA received side below. The ₹89,000 FCRA salary transfer shown in
    // consolidated R&P is an internal/local transfer, not foreign contribution.
    // Balance sheet total ₹54,07,555.45; deficit ₹3,35,011.14; depreciation ₹76,851
    // INR bank closing: ₹48,62,256.85; FCRA bank closing: extracted from consolidated balance sheet
    received:[
      // FCRA — submitted FC-4: NIL foreign contribution receipts; interest only.
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible', grant:0, interest:20346, note:'FCRA bank interest per submitted FC-4; no direct or local foreign contribution received during the year' },
      // INR — identified from donation register (soft copy; source: finance-data note)
      // Confirmed opening balances from FY2022-23 Financial Summary (= FY2021-22 closing):
      // Azim Premji Philanthropic Initiatives COVID Relief ₹1,45,756 | Azim Premji Philanthropic Initiatives FASAL ₹27,20,272.77 | EdelGive ₹19,98,549
      // AIH Mah ₹36,969 | ACC -₹71,548 | Childline -₹8,43,913 | CL Shravasti -₹7,75,121.80
      { funder:'appi',            regime:'INR',  flex:'restricted', grant:5060000, interest:0,      note:'Azim Premji Philanthropic Initiatives FASAL ₹50.60L; closing bal ₹27,20,272.77 (net of utilisation)' },
      { funder:'edele_give',      regime:'INR',  flex:'restricted', grant:2000000, interest:0,      note:'GROW project ₹20.0L; opening bal FY22-23 = ₹19,98,549' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:1953000, interest:0,      note:'Alliance for Immunization & Health (~₹19.53L); residual Maharashtra carryover ₹36,969' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:968000,  interest:0,      note:'ACC CSR (~₹9.68L); closing -₹71,548 (overdrawn)' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1231000, interest:0,      note:'Childline ~₹12.31L; closing -₹8,43,913 (overdrawn)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:163820.78, interest:43531, note:'Individual contributions + interest (including UPI micro-contributions)' },
    ],
    spend:[
      // Source: FCRA-2021-22.pdf (Form FC-4 annual return, Ministry of Home Affairs, submitted
      // 02/08/2022), Section 3(a) — replaces an earlier placeholder figure (₹21,12,893) that
      // didn't match this filing. The two rows below are the return's own two named activities;
      // they sum to its Total Utilised, ₹12,58,465.80, exactly.
      // Swaraksha admin, corrected: "Draft Balance sheet 2021-22 - DEHAT.xlsx" (Foreign Contribution
      // Accounts R&P/I&E, 1 Apr 2021 - 31 Mar 2022, signed by CA Madhuresh Agrahari & Associates — the
      // same auditor and year already cited above) itemises Swaraksha's ₹9,94,752 as: Administration
      // Costs ₹1,20,526 + Capacity Building ₹6,416 + Partnership ₹3,000 + Sensitization and Awareness
      // Raising ₹53,860 + Staffing Costs ₹7,63,472 + Youth/Children/Women Group ₹28,549 + Rescue
      // ₹18,929 = ₹9,94,752 exactly. The previous admin:0 had no citation and did not survive
      // re-verification against this signed schedule.
      { project:'Swaraksha — Anti-Human Trafficking', funder:'caritas_india_fcra', regime:'FCRA', total:994752, admin:120526.00 },
      { project:'DEHAT Core FCRA Activities & Inverter Asset', funder:'__fcra_general', regime:'FCRA', total:263713.80, admin:24913.80, note:'Admin ₹24,913.80 is the statutory Rule 5 figure printed on the return; the remaining ₹2,38,800 covers the ₹21,520 inverter asset purchase and direct operations.' },
      // Source: signed "Schedule - Indian Grants" (Madhuresh Agrahari & Associates, FRN 026205N),
      // recovered from a Gmail attachment, cross-checked against the audited consolidated I&E account.
      // RESOLVED — the audited "Expenditure met from Grant" total of ₹92,92,625.33 is exactly:
      // Indian restricted-project utilisation ₹82,97,873.33 (the 8 lines below) + FCRA Swaraksha
      // utilisation ₹9,94,752.00 (the caritas_india_fcra line above, already counted there). The
      // ₹7,78,849.88 previously disclosed as an unidentified residual was a population-mismatch
      // artefact from comparing this line against the fuller schedule total including General Fund
      // spend — not a real gap. No admin sub-split is shown on this schedule for the remaining lines
      // below, so admin stays null (not separately disclosed) rather than assumed.
      { project:'Azim Premji Philanthropic Initiatives — COVID Relief', funder:'appi', regime:'INR', total:1498000.00, admin:0, adminChecked:true, note:'Confirmed fully programme cost; no administrative allocation on this grant' },
      // APPI FASAL admin: same source and methodology already used for FY2023-24's APPI FASAL line —
      // "2110-10970_...reporting sheet.xlsx" (Budget Report sheet), APPI's own Budgeted-vs-Actuals
      // half-year utilisation report for this grant. Per that same established mapping (HY3 = Jan-Jun
      // 2023), HY1 = Jan-Jun 2022, so FY2021-22 (Apr 2021-Mar 2022) spans only the first quarter (Jan-Mar
      // 2022) of HY1 — half of HY1 by month-count. "Office Administration Cost" HY1 actual = ₹2,24,411;
      // half = ₹1,12,205.50. Cross-checked against FY2022-23's total (half-HY1 + full HY2 + half-HY3 =
      // ₹30,42,824, vs the live ₹30,00,456.92 — within 1.4%), supporting this same HY-start assumption.
      // Same disclosure as FY2023-24: a close estimate from real actuals, not a document stating the
      // fiscal-year figure directly.
      { project:'Azim Premji Philanthropic Initiatives FASAL',          funder:'appi', regime:'INR', total:775418.23,  admin:112205.50 },
      { project:'GROW (EdelGive)',                                     funder:'edele_give', regime:'INR', total:1451.00, admin:1451.00, adminChecked:true, note:'Confirmed fully administrative — this small residual amount carries no programme component' },
      // AIH admin, MODELLED (estimated:true) — no functional-cost schedule for FY2021-22 survives that
      // isn't stale duplicate data: every "AiH - Utilization Sheet" / "AIH Project Expenditure Sheet"
      // file located, regardless of what year its filename claims, was independently verified (rendered
      // and read directly) to contain the same Oct 2019-Feb 2020 content, repeatedly re-saved under
      // later-dated filenames. The project has no FY2022-23 entry (ended after this year), so unlike CRY
      // this is trend extrapolation from the two real, audited backward years, not bracketed
      // interpolation:
      //   Maharashtra: FY2019-20 10,800/7,67,824 = 1.41% -> FY2020-21 32,056/17,35,198 = 1.85% ->
      //   linear trend projects 2.29% for FY2021-22 = admin 29,958.
      //   Uttar Pradesh: FY2019-20 9,600/5,38,645 = 1.78% -> FY2020-21 32,397/15,03,983 = 2.15% ->
      //   linear trend projects 2.53% for FY2021-22 = admin 27,066.
      // A separately-sourced claim of 8.12%/15.50% (citing the same stale utilisation-sheet file, plus a
      // PCA contract and a completion report neither independently confirmed to carry a cost breakdown)
      // was not applied — a 4-7x jump from AIH's own established multi-year pattern with no verifiable
      // document behind it did not survive scrutiny.
      { project:'Alliance for Immunization & Health — Maharashtra',     funder:'aih', regime:'INR', total:1309208.00, admin:29958.00, estimated:true },
      { project:'Alliance for Immunization & Health — Uttar Pradesh',   funder:'aih', regime:'INR', total:1071522.00, admin:27066.00, estimated:true },
      // ACC Malnutrition admin, resolved from real monthly actuals and bank-confirmed invoice numbers
      // spanning the full fiscal year (Apr 2021 - Mar 2022), cross-checked against the "Cons. Grant
      // sheet.pdf" Schedule - Indian Grants (which confirms the ₹9,78,616 total to the rupee) and a
      // sequence of ACC NEFT payment advices confirming each monthly bill:
      //   Apr-Jul 2021 (old PO's Year-1 tail, invoices 8-11 per the grant-receive ledger: 53,410 +
      //   67,256 + 68,372 + 1,41,332 = 3,30,370): admin = Reporting/Comm 9,882 + NGO overhead 40,000
      //   (10,000 x 4) + Office rent 8,000 + Audit fees 7,500 = 65,382.
      //   Aug-Dec 2021 (old PO invoices 01-05: 48,660+1,82,609+1,17,407+68,424+82,819 = 4,99,919):
      //   admin = Reporting/Comm 6,891 + NGO overhead 50,000 (10,000 x 5) + Office furniture 14,999 =
      //   71,890.
      //   Jan 2022 (old PO invoice 06, ₹92,331 — bank-confirmed via NEFT payment advice dated
      //   15.02.2022): admin = NGO overhead 10,000 (matching the unbroken monthly pattern) + IT/
      //   stationery/antivirus 15,454 (dated invoices: Ankit Computers, Bhumi Enterprises Gauriganj) =
      //   25,454.
      //   Feb-Mar 2022 (new PO's first invoice, ₹95,996, four dated vouchers): admin = Reporting/Comm
      //   1,996 + NGO overhead 20,000 (10,000 x 2) = 21,996.
      // Total admin = 65,382 + 71,890 + 25,454 + 21,996 = 1,84,722.
      // Basis note: summing every individually-dated monthly bill above gives ₹10,18,616 — ₹40,000
      // above the audited ₹9,78,616. The old PO's 6-month cycle (Aug 2021-Jan 2022) reconciles exactly
      // to its own ₹6,20,050 budget (₹5,92,250 utilised, ₹27,800 underspent), so the ₹40,000 gap sits in
      // the new PO's Feb-Mar 2022 invoice — most likely an accrual-basis split between FY2021-22 and
      // FY2022-23 that no located document resolves precisely. Not knowing which specific rupees of
      // that invoice fall outside FY2021-22, the shortfall is left in programme rather than admin.
      { project:'Scope of Work for Malnutrition (ACC)',                 funder:'acc', regime:'INR', total:978616.00,  admin:184722.00 },
      // Childline India Foundation admin, resolved: "Budget of CHILDLINE Bahraich Collab 21-22.xlsx",
      // sheet "2021-22" — a complete Apr 2021-Mar 2022 monthly utilisation sheet for the "Childline-1098
      // Project, Non-Metro Collab-Bahraich." Grand Total ₹13,91,162 matches this line exactly. Its own
      // "B.3 Administative costs" category (Rent/office maintenance 30,000 + Communication 14,080 +
      // Computer Maintenance 3,600 + Stationery 6,992 + Accountant Honorarium 30,000 + Auditors fees
      // 5,000 + Awareness Material 14,930 + Postage 295 + Travel/conveyance 4,805 + Staff welfare 18,000
      // + Miscellaneous 6,665 + Training and Orientation 35,986 = 1,70,353) is admin; B.1 Staff
      // honoraria (9,12,000), B.2 Client Related Contingency (Medical+Nutrition+Shelter+Restoration =
      // 1,67,343), B.4 Travel(outreach) (1,36,826 — its own note: "No conveyance incurred for admin
      // purpose can be booked under this head"), and B.5 Open House (4,640) are programme.
      // Admin 1,70,353 + Programme 12,20,809 = 13,91,162 exactly. Independently re-confirmed by a
      // signed CA utilisation certificate (Garg Akash & Co., UDIN 22435464AMOJPZ7117, period
      // 1 Apr 2021 - 31 Mar 2022) with the identical admin line items and total, to the rupee.
      { project:'Childline India Foundation',                          funder:'childline_india', regime:'INR', total:1391162.00, admin:170353.00 },
      // Childline Shravasti admin, resolved: signed CA utilisation certificate (Garg Akash & Co.,
      // UDIN 22435464AMOJOZ8331, period 1 Apr 2021 - 31 Mar 2022). Its "(iii) Administrative Expenses"
      // category (Rent/office maintenance 30,000 + Communication 15,497 + Computer Maintenance 300 +
      // Stationery 6,689 + Accountant Honorarium 30,000 + Auditors fees 5,000 + Awareness Material
      // 14,966 + Postage 252 + Travel/conveyance 6,841 + Staff welfare 17,950 + Miscellaneous 3,204 +
      // Training and Orientation 35,567 = 1,66,266) is admin; Staff Salary (9,12,000), Client Related
      // Expenses (Medical+Restoration+Nutrition = 45,407), Travel(outreach) (1,43,533), and Open House
      // (4,875) are programme. Admin 1,66,266 + Programme 11,05,815 = 12,72,081 — the certificate's own
      // total, which is ₹415.10 below the live total (12,72,496.10, sourced from the audited consolidated
      // balance sheet); an immaterial basis variance, not a citation problem — the admin figure is applied
      // against the live total as the best available real split.
      { project:'Childline Shravasti',                                 funder:'childline_india', regime:'INR', total:1272496.10, admin:166266.00 },
      // Same schedule's item 8, disclosed separately — it is NOT part of the ₹92,92,625.33
      // reconciliation above (that figure excludes it), but it is real, cited spend in its own right.
      { project:'General Fund',                                        funder:'individuals', regime:'INR', total:215902.12, admin:null },
      { project:'DEHAT general expenditure',              funder:'individuals',         regime:'INR',  total:465511.92, admin:465511.92 },
    ],
    depreciation:76851,
    surplus:-335011.14,
    balanceSheetTotal:5407555.45,
    closingBankINR:4862256.85,
    closingCashINR:1154,
  },
  {
    fy:'2020-21', doc:'assets/docs/balance-sheet-2020-21.pdf', period:'1 Apr 2020 – 31 Mar 2021',
    signed:true, softcopy:false, auditor:'Garg Akash & Co (Lucknow, M.No.435464)', udin:'21435464AAAABJ9151',
    // Source: 5. DEHAT Consolidated Balance Sheet 2020-21.pdf (scanned; read visually). Signed 30/05/2021.
    // Actuals on utilised/income-recognised basis (I&E): Caritas ₹9,97,900; SCIAF ₹5,21,081;
    // IGSSS ₹5,17,172; Sanlaap ₹76,740. Those four printed "Grant Utilised" lines match this
    // public ledger exactly; they are not missing cash-receipt rows. The statutory FC-4 cash view is:
    // SCIAF ₹15,09,417; Caritas India ₹7,68,900; IGSSS ₹5,09,625; Sanlaap ₹76,740; FCRA interest
    // ₹34,917.03; total contribution ₹28,64,682. The page retains its prevailing audited-consolidated
    // convention and records this FC-4 cross-reference explicitly rather than silently mixing bases.
    // Balance sheet total ₹23,96,674.49; surplus ₹60,267.03; bank ₹16,88,400.74.
    // NB: these ACTUALS supersede the earlier budget-basis figures (SCIAF ₹15.1L etc.) from the Last-3-Year xlsx.
    received:[
      // FCRA
      { funder:'caritas_india_fcra', regime:'FCRA', flex:'restricted', grant:997900, interest:0, note:'Swaraksha; Caritas India channel, separate from direct SCIAF receipt below' },
      { funder:'sciaf',           regime:'FCRA', flex:'restricted', grant:521081,  interest:0, note:'Swaraksha (Scottish Catholic International Aid Fund)' },
      { funder:'igsss',           regime:'FCRA', flex:'restricted', grant:517172,  interest:0, note:'Su-Poshan / nutrition (Indo-Global Social Service Society)' },
      { funder:'sanlaap',         regime:'FCRA', flex:'restricted', grant:76740,   interest:0, note:'Voice for Change anti-trafficking' },
      // INR
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1300113, interest:0, note:'Childline Shravasti' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1399292, interest:0, note:'Childline BRH', project:'Childline BRH' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:1735198, interest:0, note:'Alliance for Immunization & Health immunization — Maharashtra' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:1503983, interest:0, note:'Alliance for Immunization & Health immunization — UP', project:'Alliance for Immunization & Health — Uttar Pradesh' },
      { funder:'igsss',           regime:'INR',  flex:'restricted', grant:43710,   interest:0, note:'IGSSS local contribution' },
      { funder:'appi',            regime:'INR',  flex:'restricted', grant:1000000, interest:0, note:'Azim Premji Philanthropic Initiatives COVID relief — dry ration' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:627765,  interest:0, note:'Scope of Work for Malnutrition (ACC)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:1955094.63, interest:83413.03, note:'Individual contributions (COVID year) + interest; student fees ₹50,400; General Reserve utilised ₹4,98,973.45' },
    ],
    spend:[
      { project:'Childline Shravasti',        funder:'childline_india', regime:'INR',  total:1300113, admin:167665 },
      { project:'Childline BRH',              funder:'childline_india', regime:'INR',  total:1399292, admin:164511 },
      { project:'Voice of Change (Sanlaap)',  funder:'sanlaap',         regime:'FCRA', total:76740,   admin:0, adminChecked:true },
      { project:'Alliance for Immunization & Health Immunization — Maharashtra', funder:'aih',         regime:'INR',  total:1735198, admin:32056 },
      { project:'Alliance for Immunization & Health Immunization — UP',      funder:'aih',             regime:'INR',  total:1503983, admin:32397 },
      { project:'Su-Poshan (Indo-Global Social Service Society)',     funder:'igsss',           regime:'FCRA', total:517172,  admin:29514 },
      { project:'IGSSS local contribution',   funder:'igsss',           regime:'INR',  total:43710, admin:0, adminChecked:true },
      { project:'Azim Premji Philanthropic Initiatives COVID ration',          funder:'appi',            regime:'INR',  total:1000000, admin:0, adminChecked:true },
      { project:'Swaraksha — Anti-Human Trafficking', funder:'caritas_india_fcra', regime:'FCRA', total:1518981, admin:185436, note:'SCIAF-funded programme facilitated through Caritas India; direct SCIAF and Caritas India receipt lines remain separately disclosed.' },
      { project:'ACC Malnutrition',           funder:'acc',             regime:'INR',  total:627765, admin:0, adminChecked:true },
      { project:'Audit fees (foreign contribution)',          funder:'__fcra_general',  regime:'FCRA', total:15000,   admin:15000 },
      { project:'DEHAT direct own fund',      funder:'individuals',     regime:'INR',  total:2512614.08, admin:2512614.08 },
    ],
    surplus:60267.03,
    balanceSheetTotal:2396674.49,
    reserves:{ closingBankTotal:1688400.74 },
  },
  {
    fy:'2019-20', doc:'assets/docs/balance-sheet-2019-20.pdf', period:'1 Apr 2019 – 31 Mar 2020',
    signed:true, softcopy:false, auditor:'Garg Akash & Co (Lucknow, M.No.435464)',
    // Source: DEHAT Consolidated Balance Sheet 2019-20.pdf (scanned; read visually). Signed 24/08/2020.
    // Org books grant amounts on a UTILISED basis (I&E "Grant Utilised" = income); received≈utilised.
    // Balance sheet total ₹23,03,089.37; surplus ₹27,075.46; bank ₹16,31,477.62
    received:[
      // FCRA
      { funder:'caritas_india_fcra', regime:'FCRA', flex:'restricted', grant:1840442, interest:0, note:'Swaraksha; SCIAF allocation facilitated through Caritas India' },
      { funder:'igsss',           regime:'FCRA', flex:'restricted', grant:1048799, interest:0, note:'Suposhan / nutrition security (Indo-Global Social Service Society)' },
      { funder:'sanlaap',         regime:'FCRA', flex:'restricted', grant:108910,  interest:0, note:'Stakeholder consultation, anti-trafficking' },
      // INR
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1310995, interest:0, note:'Childline Shravasti' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1388772, interest:0, note:'Childline BRH (Bahraich)', project:'Childline BRH' },
      { funder:'birlasoft',       regime:'INR',  flex:'restricted', grant:108326,  interest:0, note:'"e-vidya" computer-skills programme (CSR Enabler Agreement, 12 Apr 2018) — Government Girls Inter College, Sector 51, Noida; not an IIMPACT project despite the similar name' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:767824,  interest:0, note:'Alliance for Immunization & Health immunization — Maharashtra' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:538645,  interest:0, note:'Alliance for Immunization & Health immunization — UP', project:'Alliance for Immunization & Health — Uttar Pradesh' },
      { funder:'igsss',           regime:'INR',  flex:'restricted', grant:209050,  interest:0, note:'IGSSS local contribution (Su-Poshan)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:221479.5,interest:62004.46, note:'Individual contributions + bank interest; General Reserve utilised ₹1,27,695.84' },
    ],
    spend:[
      { project:'Childline Shravasti',        funder:'childline_india', regime:'INR',  total:1310995, admin:166244 },
      { project:'Childline BRH',              funder:'childline_india', regime:'INR',  total:1388772, admin:167411 },
      { project:'e-vidya (Birlasoft CSR)',    funder:'birlasoft',       regime:'INR',  total:108326, admin:47833 },
      { project:'Alliance for Immunization & Health Immunization — Maharashtra', funder:'aih',         regime:'INR',  total:767824, admin:10800 },
      { project:'Alliance for Immunization & Health Immunization — UP',      funder:'aih',             regime:'INR',  total:538645, admin:9600 },
      { project:'Su-Poshan (IGSSS local)',    funder:'igsss',           regime:'INR',  total:209050, admin:0, adminChecked:true },
      { project:'Stakeholder meeting (Sanlaap)', funder:'sanlaap',      regime:'FCRA', total:108910,  admin:0, adminChecked:true },
      { project:'Suposhan / nutrition (Indo-Global Social Service Society)', funder:'igsss',    regime:'FCRA', total:1048799, admin:56390 },
      { project:'Swaraksha — Anti-Human Trafficking', funder:'caritas_india_fcra', regime:'FCRA', total:1840442, admin:185541 },
      { project:'Audit fees (foreign contribution)',          funder:'__fcra_general',  regime:'FCRA', total:15000,   admin:15000 },
      { project:'DEHAT direct own fund',      funder:'individuals',     regime:'INR',  total:369104.34, admin:369104.34 },
    ],
    surplus:27075.46,
    balanceSheetTotal:2303089.37,
    reserves:{ closingBankTotal:1631477.62 },
  },
  {
    fy:'2018-19', doc:'assets/docs/balance-sheet-2018-19.pdf', period:'1 Apr 2018 – 31 Mar 2019',
    signed:true, softcopy:false, auditor:'Garg Akash & Co (Lucknow, M.No.435464)',
    // Source: Balance Sheet Consolidated 2018-19.pdf (scanned; read visually). Signed 05/06/2019.
    // Utilised basis (I&E "Grant Utilised"). Balance sheet total ₹20,30,614.81; surplus ₹49,488.07
    // Source conflict bounded by the primary FCRA bank ledger: the consolidated statement records
    // bank interest ₹22,439.15 and the filed FC-4 records ₹42,372.94. The 24-page PNB statement for
    // FCRA account 0072000100151405 shows four explicit quarterly interest credits: ₹12,708,
    // ₹9,878, ₹10,771 and ₹8,948, totalling ₹42,305. Thus neither signed figure exactly matches the
    // bank statement (FC-4 is ₹67.94 higher; consolidated is ₹19,865.85 lower). DEHAT's own internal
    // "FCRA Calculation 2019.xlsx" working paper — the source computation behind that year's FC-4 —
    // independently uses ₹42,372.94 as "Interest Received in Bank," confirming the FC-4 figure was a
    // deliberate calculation, not a filing error. The live figure below continues to follow the
    // consolidated-statement convention used across this page, with the conflict disclosed rather
    // than silently absorbed.
    received:[
      { funder:'caritas_india_fcra', regime:'FCRA', flex:'restricted', grant:2317925, interest:0, note:'Swaraksha; SCIAF allocation facilitated through Caritas India' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:303602,  interest:0, note:'Childline Shravasti' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1292090, interest:0, note:'Childline BRH', project:'Childline BRH' },
      { funder:'birlasoft',       regime:'INR',  flex:'restricted', grant:1115216, interest:0, note:'"e-vidya" computer-skills programme (CSR Enabler Agreement, 12 Apr 2018) — Government Girls Inter College, Sector 51, Noida; not an IIMPACT project despite the similar name' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:1226490, interest:0, note:'Sustainable Community Development Project / ACC school & garment skilling' },
      // Funder correction: Sujlam Suflam's own signed project I&E ("Developmental Association for
      // Human Advancement — Sujlam Suflam Project, Income and Expenditure Account, 1 Apr 2018 – 31 Mar
      // 2019", CA Akash Garg) states its income line as "Grant Utilised-SDTT ₹87,280.00" plus its own
      // "Bank Interest ₹1,026.40" — this is a Sir Dorabji Tata Trust project (consistent with SDTT's
      // recurring Sujalam/Sujlam Suflam NRM/livelihoods project in other years), not NABARD.
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:87280,   interest:1026.40, note:'Sujlam Suflam (water/NRM) project' },
      { funder:'charity_science',regime:'INR',  flex:'restricted', grant:509810,  interest:0, note:'Charity Science project' },
      { funder:'geeta_karnal',    regime:'INR',  flex:'restricted', grant:157616,  interest:0, note:'GEETA Karnal (library / SPICE)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:220452,  interest:22439.15, note:'Individual contributions + bank interest; student fees ₹46,400; Google income ₹10,068' },
    ],
    spend:[
      { project:'Swaraksha — Anti-Human Trafficking', funder:'caritas_india_fcra', regime:'FCRA', total:2317925, admin:186295 },
      { project:'Childline Shravasti',    funder:'childline_india', regime:'INR',  total:303602,  admin:41083 },
      { project:'Childline BRH',          funder:'childline_india', regime:'INR',  total:1292090, admin:172106 },
      { project:'e-vidya (Birlasoft CSR)', funder:'birlasoft',       regime:'INR',  total:1035216, admin:0, adminChecked:true },
      { project:'Sustainable Community Development Project / ACC',             funder:'acc',             regime:'INR',  total:1226490, admin:188826 },
      // Sujlam Suflam admin: signed I&E schedule splits ₹87,280 into Personal (Program ₹48,400 +
      // Admin ₹14,520), Program Cost ₹14,680 (Capacity Building + Travel), and Overhead Cost ₹9,680
      // (Rent + Stationery + Staff Welfare) — sums exactly. Admin = Personal-Admin + Overhead = ₹24,200.
      { project:'Sujlam Suflam',          funder:'sdtt',            regime:'INR',  total:87280,   admin:24200 },
      { project:'Charity Science',        funder:'charity_science',regime:'INR',  total:505440,  admin:44220 },
      { project:'GEETA Karnal',           funder:'geeta_karnal',    regime:'INR',  total:155000,  admin:0, adminChecked:true },
      { project:'Audit fees (foreign contribution)',      funder:'__fcra_general',  regime:'FCRA', total:7500,    admin:7500 },
      { project:'DEHAT direct own fund',  funder:'individuals',     regime:'INR',  total:319289.08, admin:319289.08 },
      { project:'Google Click exp',       funder:'individuals',     regime:'INR',  total:10068, admin:0, adminChecked:true },
    ],
    surplus:49488.07,
    balanceSheetTotal:2030614.81,
  },
  {
    fy:'2017-18', doc:'assets/docs/balance-sheet-2017-18.pdf', period:'1 Apr 2017 – 31 Mar 2018',
    signed:true, softcopy:false, auditor:'Vipin Priyank Gopal & Co (Bahraich, FRN 017849C, M.No.422438)',
    // Source: DEHAT Balance Sheet Consolidated. 2017-18.pdf (signed, text-readable, re-read directly
    // page by page — not the earlier scan). Balance Sheet signed 29/09/2018; Income & Expenditure and
    // Receipts & Payments schedules signed 29/10/2018. Balance sheet total ₹48,29,613.
    // Google ₹60,02,387 is in-kind Ad Grants, booked equal on income and expenditure sides.
    // Per-project totals below include that project's own fixed-asset purchases, matching how the
    // signed I&E itself presents each project block (e.g. Childline's total includes its ₹70,000
    // fixed-asset line; Swaraksha's includes ₹34,500; Bal Prahari's includes ₹9,650).
    received:[
      { funder:'unicef',          regime:'INR',  flex:'restricted', grant:270000,  interest:0, note:'UNICEF GPDP' },
      // Source: "Rotary 2016-ocr.pdf" (signed MoU, West Bengal stamp paper 95AA 859531) — the legal
      // remitter is Rotary South Asia Society for Development and Cooperation (RSAS), a registered
      // Indian society, operating through its committee Rotary India Literacy Mission (RILM). Not a
      // foreign_org/FCRA entity — corrected to the same `rilm`/INR funder already used for FY2015-16
      // and FY2016-17's RILM receipts.
      { funder:'rilm',            regime:'INR',  flex:'restricted', grant:1788590, interest:0, note:'RILM / Asha Kiran grant' },
      { funder:'caritas_india_fcra', regime:'FCRA', flex:'restricted', grant:1393305, interest:0, note:'Swaraksha; SCIAF allocation facilitated through Caritas India' },
      { funder:'action_aid',      regime:'FCRA', flex:'restricted', grant:1000053, interest:0, note:'ActionAid' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:198792,  interest:0, note:'Childline HS' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1231568, interest:0, note:'Childline India Foundation', project:'Childline India Foundation' },
      { funder:'geeta_karnal',    regime:'INR',  flex:'restricted', grant:1905517, interest:0, note:'GEETA Karnal project' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:1579381, interest:0, note:'Sustainable Community Development Project / ACC' },
      { funder:'ipartner',        regime:'INR',  flex:'restricted', grant:798702,  interest:0, note:'iPartner India' },
      { funder:'charity_science',regime:'INR',  flex:'restricted', grant:150000,  interest:0, note:'Charity Science Foundation' },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:1878800, interest:0, note:'RGCEP appropriation on grant — genuinely IIMPACT’s, unrelated to Birlasoft/"e-vidya"; most of it carried forward unspent (see spend[] note)' },
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:1455855, interest:0, note:'Sir Dorabji Tata Trust' },
      { funder:'google',          regime:'INR',  flex:'restricted', grant:6002387, interest:0, note:'Google Ad Grants — IN-KIND (non-cash)', inKind:true },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:448695,  interest:101174, note:'Individual contributions + bank interest' },
    ],
    spend:[
      { project:'ActionAid project',                    funder:'action_aid',      regime:'FCRA', total:707205,  admin:112000 },
      { project:'Childline project (Bahraich + HS)',    funder:'childline_india', regime:'INR',  total:1261051, admin:131744 },
      { project:'GEETA Karnal / NSE project',           funder:'geeta_karnal',    regime:'INR',  total:2226297, admin:404632 },
      { project:'Sustainable Community Development Project (ACC)', funder:'acc', regime:'INR',  total:2034461, admin:598921 },
      { project:'UNICEF project (GPDP)',                funder:'unicef',          regime:'INR',  total:270000,  admin:78000 },
      { project:'Google Ad Grants (in-kind advertising)', funder:'google',        regime:'INR',  total:6002387, admin:0, adminChecked:true, inKind:true },
      { project:'Sujalam Sufalam project',              funder:'sdtt',            regime:'INR',  total:1527759, admin:360881 },
      // Source: YEAR 2017 - 2018.pdf, re-read directly page by page. This ₹19,89,935 block (Education
      // Material ₹98,985 + Training for Teachers ₹1,37,614 + Evaluation ₹13,180 + Project Staff Salary
      // ₹15,19,465 + Travel ₹4,035 = ₹17,73,279 programme, + its own printed "Administrative Expenses"
      // ₹2,16,656) carries no project-name header on the expenditure page, but by elimination against
      // every other funder's own explicitly-labelled block on the same statement, it belongs to Rotary
      // (RILM/Asha Kiran) — not IIMPACT. RGCEP's real, separately labelled FY2017-18 entry is the much
      // smaller line below; a prior submission had merged the two.
      { project:'RILM / Asha Kiran Project', funder:'rilm', regime:'INR', total:1989935, admin:216656 },
      // RGCEP's own explicit page ("RGCEP PROJECT: Staff Cost 1,76,721") carries no further admin
      // sub-header of its own — the entity-wide "General Administrative Expenses" (₹4,32,747) that
      // follows it on the statement is DEHAT's general admin, not RGCEP-specific, and is already
      // captured in the "DEHAT general administrative expenses" line below (this is the same line
      // already present as "RGCEP project (staff cost)" further down — not duplicated here).
      { project:'Bal Prahari (iPartner India)',         funder:'ipartner',        regime:'INR',  total:937520,  admin:62896 },
      { project:'Swaraksha — Anti-Human Trafficking', funder:'caritas_india_fcra', regime:'FCRA', total:1372498, admin:87424 },
      { project:'Charity Science Foundation',           funder:'charity_science',regime:'INR',  total:95760,   admin:4060 },
      { project:'RGCEP project (staff cost)',           funder:'iimpact',         regime:'INR',  total:176721,  admin:0, adminChecked:true },
      { project:'DEHAT general administrative expenses', funder:'individuals',   regime:'INR',  total:432747,  admin:432747 },
    ],
    balanceSheetTotal:4829613, receivedTotal:20202819, utilisedTotal:19034341, surplus:1168478,
    note:'Grant-Fund income and full project-level expenditure directly transcribed from the signed statutory audit (Vipin Priyank Gopal & Co, dated 29/10/2018 on the I&E). Google ₹60.02L is in-kind Ad Grants, not cash.',
  },
  {
    fy:'2016-17', doc:'assets/docs/balance-sheet-2016-17.pdf', period:'1 Apr 2016 – 31 Mar 2017',
    signed:true, compiled:true, softcopy:false, auditor:'Rajeev Parul & Co (Lucknow, CA Atul Kumar Srivastava, M.No.407637)',
    // Source: signed scanned copy in PUBLIC_DOCUMENTS/01_BALANCE_SHEETS/DEHAT_Audited_Balance_Sheet_FY_2016-17.pdf
    // — every page carries the Rajeev Parul & Co round stamp, and page 3's Auditor's Report is wet-signed
    // "FOR RAJEEV PARUL & CO, Chartered Accountants / (CA Atul Kumar Srivastava) / Partner, M.No.407637 /
    // Date: 09.10.2017 / Place: Lucknow" — the same 09.10.2017 date already noted below, confirming this is
    // the signed version of the same compilation, not a different document. The previously-recorded auditor
    // ("S. Chandra Gupta & Associates, CA Rajeev Gupta, M.No.089462") does not appear anywhere in this
    // document and was an error; corrected here from the primary source. All figures below are unaffected —
    // they already match this signed copy to the rupee (balanceSheetTotal 4,997,203.91 ties to its own
    // printed "Total Rs." on the Balance Sheet page).
    // "Compiled from the books" — an accountant's compilation (per the Auditor's Report's own wording), not a full statutory audit.
    // Per-funder received = Grant-Fund income lines on the consolidated I&E; spend = project-cost blocks on the I&E.
    // Google ₹77.6L is in-kind Ad Grants (non-cash) — booked equal on income and expenditure sides.
    // I&E income ₹1,89,78,517.80; I&E expenditure ₹2,17,46,579.40 (excl. the separately-stated depreciation line);
    // deficit therefore ≥ ₹27,68,061.60, funded from prior-year advances/receivables (large Expenses-Payable accruals). Balance sheet total ₹49,97,203.91 (as printed).
    // "Bal Prahaari anti-trafficking" (border-village programme, ₹12,56,256 received / ₹5,52,152.93
    // utilised) was previously carried under a "funder not itemised" placeholder — grounded to iPartner
    // India via "iPartner Baal Prahari Project Assessment Report - June 2017", the same funder already
    // used for iPartner's FY2017-18 entries. "Sujalam Sufalam (livelihoods / NRM)" (₹12,22,121.93
    // utilised) was previously carried under its own unmapped placeholder — grounded to Sir Dorabji Tata
    // Trust via "An overview on DEHAT's 'Sujlam-Sufalam' Initiative" (Sept 2016), which prints "Supported
    // by: Sir Dorabji Tata Trust" on its own title page. This is a separate project from the smaller,
    // NABARD-funded "Sujlam Suflam (water) project" in FY2018-19 — same near-identical name, unrelated
    // funder and activity; kept distinct.
    note:'Received = grant income recognised on the I&E; utilised = I&E project-cost blocks (ties to ₹2,17,46,579.40). Cash grants excl. Google in-kind = ₹1,12,18,703.95. Deficit run against prior-year advances.',
    balanceSheetTotal:4997203.91, receivedTotal:18978517.80, utilisedTotal:21746579.40, surplus:-2768061.60,
    fundersActive:['google','iimpact','rilm','ipartner','sdtt','action_aid','childline_india','baif','individuals'],
    received:[
      { funder:'google',          regime:'INR',  flex:'restricted', grant:7759813.85, interest:0, note:'Google Ad Grants — IN-KIND online advertising (non-cash)', inKind:true },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:3010367.95, interest:0, note:'IIMPACT — School and Community Development Education Programme', project:'School and Community Development Education Programme' },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:2329000,    interest:0, note:'IIMPACT / Rural Girl Child Education Project education programme', project:'Rural Girl Child Education Project' },
      { funder:'rilm',          regime:'INR',  flex:'restricted', grant:1789805,    interest:0, note:'Rotary India Literacy Mission — Asha Kiran & T-E-A-C-H child literacy programme' },
      // Signed Foreign Contribution Account, I&E and R&P, year ended 31.03.2017:
      // total grant-fund receipts ₹12,56,256 = IIMPACT ₹5,31,000 + iPartner ₹6,80,734
      // + donations ₹44,522. A prior version assigned the full total to iPartner.
      { funder:'iimpact',         regime:'FCRA', flex:'restricted', grant:531000,     interest:0, note:'IIMPACT — Bal Prahaari / foreign-contribution account', project:'Bal Prahaari' },
      { funder:'ipartner',        regime:'FCRA', flex:'restricted', grant:680734,     interest:0, note:'iPartner India — Bal Prahaari anti-trafficking, border villages', project:'Bal Prahaari' },
      { funder:'individuals',     regime:'FCRA', flex:'flexible',   grant:44522,      interest:0, note:'Foreign-contribution donations, as separately printed in the signed account' },
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:1045897,    interest:0, note:'TCL / Sir Dorabji Tata Trust' },
      { funder:'action_aid',      regime:'FCRA', flex:'restricted', grant:919378,     interest:0, note:'ActionAid — School Management Committee federation / school governance (6 districts)' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:718000,     interest:0, note:'Childline India Foundation (1098 child-protection service)' },
      { funder:'baif',            regime:'INR',  flex:'restricted', grant:150000,     interest:0, note:'BAIF fund (received by cheque)' },
    ],
    spend:[
      { project:'Google Ad Grants (in-kind advertising)', funder:'google',          regime:'INR',  total:7759813.85, admin:0, adminChecked:true, inKind:true },
      { project:'Rotary India Literacy Mission education / literacy',              funder:'rilm',           regime:'INR',  total:3136064,    admin:41055 },
      { project:'School and Community Development Education Programme',  funder:'iimpact',          regime:'INR',  total:2880319.27, admin:96500 },
      { project:'Rural Girl Child Education Project education programme',               funder:'iimpact',          regime:'INR',  total:2823887.93, admin:14217.93, project:'Rural Girl Child Education Project' },
      { project:'ActionAid — School Management Committee federation / governance', funder:'action_aid',       regime:'FCRA', total:1288900,    admin:10000 },
      { project:'Sujalam Sufalam (livelihoods / NRM)',     funder:'sdtt',  regime:'INR',  total:1222121.93, admin:11000 },
      { project:'Childline (child protection)',            funder:'childline_india',  regime:'INR',  total:1171810.56, admin:10000 },
      { project:'Head office / general administration',    funder:'individuals',      regime:'INR',  total:911508.93, admin:911508.93 },
      { project:'Bal Prahaari anti-trafficking (foreign contribution)',    funder:'ipartner',   regime:'FCRA', total:552152.93,  admin:14537.93 },
    ],
  },
  {
    fy:'2015-16', doc:'assets/docs/balance-sheet-2015-16.pdf', period:'1 Apr 2015 – 31 Mar 2016',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: DEHAT_Consolidated__Balance_sheet_2015-16.pdf — the full 14-page signed consolidated
    // Income & Expenditure Account (dated 10.09.2016), re-read directly page by page. Total Income
    // ₹1,16,18,925.21 (Foreign Contribution ₹1,80,538.00 + Local Contribution ₹1,14,38,387.21) =
    // Total Expenditure ₹1,15,83,464.53 (all 9 project lines below, ₹1,13,68,133.55, + Depreciation on
    // Fixed Assets ₹2,15,330.98) + Surplus ₹35,460.68 — every one of these figures is a specific,
    // labelled printed line, independently re-added and confirmed to the rupee. An earlier "Local
    // Contribution Account (Centum, Sahyog, Grant-in-Aid)" residual line (₹2,50,791.66) has been
    // removed: Centum, Sahyog and the Pooling Account grant are already fully counted inside the
    // Society Home Account total below, and the real depreciation + surplus (which coincidentally sum
    // to almost the same figure) were never itemised at all — that line was double-counting, not a
    // genuine unresolved residual.
    receivedTotal:11618925.21, utilisedTotal:11583464.53, surplus:35460.68,
    received:[
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:4146876,    interest:19201, note:'RGCEP learning centres — audited appropriation on grant ₹41,46,876 + bank interest ₹19,201' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:3539343,    interest:0, note:'SCDP/ACC Tikriya' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1161567.83, interest:0, note:'Childline 1098' },
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:1050328.13, interest:9342, note:'Sujalam Sufalam (SSP/TCL/Sir Dorabji Tata Trust) — appropriation on grant + bank interest' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:736603.35,  interest:28033, note:'Society Home Account — donations, insurance claim, SIT/World Learning + bank interest' },
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:231773,     interest:0.90, note:'FASAL programme, pre-2022 phase — audited appropriation on grant + bank interest' },
      { funder:'rilm',          regime:'INR',  flex:'restricted', grant:207384,     interest:0, note:'Rotary India Literacy Mission, received through Rotary' },
      { funder:'action_aid',      regime:'FCRA', flex:'restricted', grant:165688,     interest:0, note:'Swabhiman Project — appropriation on grant' },
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible',   grant:0,          interest:14850, note:'FCRA-Others: bank interest' },
      // Source: YEAR 2015 - 2016.pdf, Page 3 (Society Home Account schedule), rotation-corrected read.
      // The existing `individuals` line above (736,603.35 + 28,033 interest = 764,636.35) already
      // reproduces this page's own "Others" total (Donation 1,33,001.35 + Insurance Claim 14,085 + SIT
      // 60,000 + Old Grant Received 54,517 + Receivable from Centum 4,75,000 = 7,36,603.35) plus its
      // "Bank Interest" line (28,033) exactly. RESOLVED: the four Society Home Account lines together
      // (764,636.35 + 145,500 Pooling Account + 106,235 Centum + 56,200 Sahyog) sum to exactly
      // ₹10,72,571.35, matching the signed schedule's own stated total income for this account to the
      // rupee, with nothing left over. The former `__unallocated` ₹28,339.07 line was therefore not a
      // genuine unidentified receipt. It was the balancing effect of using expenditure totals as receipt
      // figures for RGCEP and FASAL while omitting the separately printed RGCEP, Sujalam Sufalam and FASAL
      // interest lines. Those three projects are now recorded from the audited I&E income column above;
      // all receipt lines sum exactly to ₹1,16,18,925.21 and the printed surplus is ₹35,460.68.
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:145500,     interest:0, note:'Grant-in-Aid from Pooling Account' },
      { funder:'centum',          regime:'INR',  flex:'restricted', grant:106235,     interest:0, note:'Grant from Centum — received ₹11,080 + receivable ₹95,155' },
      { funder:'sahyog',          regime:'INR',  flex:'restricted', grant:56200,      interest:0, note:'Grant from Sahyog Society (Tarang Project)' },
    ],
    spend:[
      { project:'RGCEP (IIMPACT)',                         funder:'iimpact',         regime:'INR', total:4147057.98, admin:399092 },
      { project:'SCDP/ACC Tikriya',                        funder:'acc',             regime:'INR', total:3539343,    admin:0, adminChecked:true },
      { project:'Childline 1098',                          funder:'childline_india', regime:'INR', total:1161567.83, admin:179866.83 },
      { project:'Sujalam Sufalam (SDTT/Tata Trusts)',      funder:'sdtt',            regime:'INR', total:1050328.13, admin:255614.13 },
      { project:'Society Home Account (general administration)', funder:'individuals', regime:'INR', total:864092.78, admin:864092.78 },
      { project:'FASAL (SDTT, pre-2022 phase)',            funder:'sdtt',            regime:'INR', total:231795.85,  admin:12361 },
      { project:'RILM (Rotary India Literacy Mission)',    funder:'rilm',          regime:'INR', total:207384,     admin:7240 },
      { project:'Swabhiman',                                funder:'action_aid',      regime:'FCRA', total:165688,    admin:13495 },
      { project:'FCRA-Others (bank charges & renewal)',    funder:'__fcra_general',  regime:'FCRA', total:875.98,     admin:875.98 },
      { project:'Depreciation on Fixed Assets (Local & FCRA)', funder:'individuals', regime:'INR', total:215330.98, admin:215330.98 },
    ],
  },
  {
    fy:'2014-15', doc:'assets/docs/balance-sheet-2014-15.pdf', period:'1 Apr 2014 – 31 Mar 2015',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: scans/ocr-2014-15.txt (OCR of signed scan). Signed 20.05.2015.
    // Fund-accounting I&E: income recognised = grant applied to the year. Cash R&P (₹2.79 cr)
    // is higher as it includes opening balances and inter-project advances.
    // Balance sheet total ₹76,05,062.18; I&E total ₹1,32,71,999.
    // receivedTotal is the I&E account's appropriation-basis income (same convention established for
    // FY2012-13): each project's "grant transferred from balance sheet to the extent utilised," not a
    // cash-receipts figure. Source: Financial-Audit-Report-for-the-year-of-2014-15.pdf, Pages 10-12,
    // six schedules (Foreign Contribution Account; Society Home Account, incl. Centum's WSI Fund and
    // Candidate Claims; FASAL; RGCEP Local; ACC/SCDP; Childline), summing to ₹1,32,71,998.80 exactly.
    // Four of six rows below reproduce the already-independently-verified spend[] total for the same
    // project to the rupee (ACC, Childline, IIMPACT-FCRA, and Swabhiman). The signed audit schedule names
    // the latter "Swabhiman (Erase Poverty)"; the executed amendment dated 6 September 2014 identifies
    // Milaan and DEHAT as the parties to the underlying MoU dated 7 July 2014. The direct contracting
    // counterparty is therefore published as Milaan, while the schedule wording remains disclosed. This replaces a
    // prior received[] that didn't itemise interest/receivable components and, for three of five lines,
    // didn't match the same project's own independently-verified spend-side total at all.
    note:'Received and utilised are both stated on the appropriation basis of the audited Income & Expenditure account, as established for FY2012-13.',
    receivedTotal:13271998.80, utilisedTotal:12859914.51, surplus:412084.29, balanceSheetTotal:7605062.18,
    fundersActive:['milaan_swabhiman','appi','acc','childline_india','iimpact','centum','sahyog','sdtt','unicef','cry','individuals'],
    received:[
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:5491245,   interest:0,     note:'SCDP Community Development Project — appropriation on grant' },
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:3889537,   interest:31139, note:'RGCEP Project (Local account) — appropriation on grant', project:'RGCEP Project (Local)' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:1090299,   interest:0,     note:'Childline Project — appropriation on grant' },
      { funder:'sdtt',           regime:'INR',  flex:'restricted', grant:966252,    interest:21250, note:'FASAL programme, pre-2022 phase, routed through PANI — appropriation on grant' },
      { funder:'iimpact',        regime:'FCRA', flex:'restricted', grant:585398,    interest:0,     note:'RGCEP Project (Foreign Contribution / IIMPACT Gurgaon) — appropriation on grant', project:'RGCEP Project (FCRA)' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:177243,    interest:0,     note:'Society Home Account — general account (donations, bank interest, travel reimbursement, project support)' },
      { funder:'centum',         regime:'INR',  flex:'restricted', grant:804368.80, interest:0,     note:'WSI Learning Centre — Centum Fund ₹83,668.80 + candidate claims ₹7,20,700, via Society Home Account' },
      { funder:'milaan_swabhiman', regime:'FCRA', flex:'restricted', grant:148157,  interest:0,     note:'Swabhiman Project — appropriation on grant; executed Milaan–DEHAT MoU amendment dated 6 September 2014' },
      { funder:'__fcra_general', regime:'FCRA', flex:'flexible',   grant:0,         interest:67110, note:'FCRA-Others — bank interest ₹7,874 + donation ₹59,236' },
    ],
    // Source: Financial year 2014-15.pdf (RJCP Subhash Misra & Co., signed 20.05.2015), re-read directly
    // page by page. Every spend line below reproduces a specific named line on the signed page and the
    // nine lines sum to the cent (₹1,28,59,914.51); utilisedTotal corrected from a placeholder that had
    // wrongly equalled receivedTotal (implying zero surplus) — the audited surplus is ₹4,12,084.29.
    spend:[
      { project:'SCDP Community Development Project (ACC Cement CSR)', funder:'acc', regime:'INR', total:5491245, admin:483988 },
      { project:'RGCEP Project (IIMPACT Girls Education, Local)', funder:'iimpact', regime:'INR', total:3889704.40, admin:270174 },
      { project:'Child Line Project (Childline India Foundation)', funder:'childline_india', regime:'INR', total:1090299, admin:172602 },
      { project:'FASAL Project (SDTT, pre-2022 phase, routed through PANI)', funder:'sdtt', regime:'INR', total:966522.40, admin:73810 },
      { project:'IIMPACT Learning Centres (Foreign Contribution Account)', funder:'iimpact', regime:'FCRA', total:585398, admin:24425 },
      { project:'Society Home Account / Local Development Programmes', funder:'individuals', regime:'INR', total:499113.40, admin:15566 },
      { project:'Swabhiman Child Rights Project (Milaan)', funder:'milaan_swabhiman', regime:'FCRA', total:148157, admin:12854 },
      { project:'Depreciation on Fixed Assets (Local & FCRA)', funder:'individuals', regime:'INR', total:174509.91, admin:174509.91 },
      { project:'FCRA General Operational Bank & Misc Charges', funder:'__fcra_general', regime:'FCRA', total:14965.40, admin:14965.40 },
    ],
  },
  {
    fy:'2013-14', doc:'assets/docs/balance-sheet-2013-14.pdf', period:'1 Apr 2013 – 31 Mar 2014',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: re-scanned consolidated R&P/I&E/Balance Sheet 2013-14 (legible copy, signed 12.06.2014).
    // Per-funder = grant RECEIVED in cash during the year (R&P "Grant Received" lines).
    // Consolidated R&P ₹1,71,10,779.04; balance sheet ₹54,77,244.63; deficit ₹4,50,558.81.
    balanceSheetTotal:5477244.63, surplus:-450558.81, utilisedTotal:13532337.51,
    note:'Received = cash grant receipts (R&P); utilised = full audited I&E expenditure (₹1,35,32,337.51). The two bases differ, so received ≠ utilised; the year ran a ₹4,50,558.81 deficit (utilised − received).',
    received:[
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:4318750, interest:9858, note:'IIMPACT / Rural Girl Child Education Project education programme (Gurgawan); 4 tranches' },
      { funder:'erase_poverty',  regime:'FCRA', flex:'restricted', grant:3897713, interest:0, note:'Swabhiman anti-trafficking (Erase Poverty) — SLRCs, Mid-Day-Meal, Natpurwa' },
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:2073378, interest:0, note:'Sustainable Community Development Project — school & skilling (ACC Cement, Tikriya); 8 Real Time Gross Settlement tranches' },
      { funder:'sdtt',           regime:'INR',  flex:'restricted', grant:1456330, interest:24002, note:'FASAL programme, pre-2022 phase — Sir Dorabji Tata Trust, routed through PANI, Faizabad; 5 RTGS tranches' },
      { funder:'jagdeep_lohani', regime:'FCRA', flex:'restricted', grant:501936,  interest:0, note:'Action on Research on Direct Democracy — grant from Mr. Jagdeep Singh Lohani' },
      { funder:'centum',         regime:'INR',  flex:'restricted', grant:325717,  interest:0, note:'Centum WorkSkills (WSI) learning centre' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:166806,  interest:0, note:'Childline India Foundation; ₹4,03,492 further receivable (grant fund ₹5,70,298)' },
      { funder:'sit_world',      regime:'INR',  flex:'restricted', grant:79148,   interest:0, note:'SIT / World Learning India (student programme receipts)' },
      { funder:'light_a_lamp',   regime:'FCRA', flex:'restricted', grant:54752,   interest:0, note:'Swabhiman — Light A Lamp Foundation' },
      { funder:'sahyog',         regime:'INR',  flex:'restricted', grant:52400,   interest:0, note:'Tarang project (via Sahyog)' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:131832,  interest:13159, note:'Individual contributions ₹1,03,210 + local contribution ₹28,622 + interest; also Gram Niyojan Kendra programme receipts ₹3,19,258 & insurance claim ₹4,505' },
    ],
    // Source: YEAR 2013 - 2014.pdf, re-read directly page by page (Pages 6-8). The nine lines sum to
    // ₹1,35,32,337.51 exactly. ACC's admin figure is its own literal "Administation" line (Page 7,
    // Line 33, ₹1,13,913.00) — a prior draft had mistakenly copied Childline's admin figure here.
    // Swabhiman's spend is tagged to 'erase_poverty' (not 'action_aid') to match this year's own
    // received[] funder key for the same SLRC/Mid-Day-Meal/Natpurwa programme. Admin = any printed
    // "Administration"/"Overhead"/"Management Cost"/"Support Cost" sub-line (RGCEP's admin here is
    // its "Management Cost" line; Society Home's is its own Salary/Rent/Printing/Travel/Audit Fee
    // sub-lines, ₹3,22,710; FASAL's is its own Administrative Expenses + Overhead Cost + Bank Charges
    // sub-lines, ₹1,19,310.70). Swabhiman has no such sub-line identified in the source, so its admin
    // stays 0.
    spend:[
      { project:'Swabhiman Learning & Child Rights Project (SLRC / Mid-Day-Meal / Natpurwa)', funder:'erase_poverty', regime:'FCRA', total:3939275, admin:0, adminChecked:true },
      { project:'Action on Research on Direct Democracy (Jagdeep Lohani)', funder:'jagdeep_lohani', regime:'FCRA', total:490000, admin:0, adminChecked:true },
      { project:'FCRA General Operational Bank Charges', funder:'__fcra_general', regime:'FCRA', total:97.85, admin:97.85 },
      { project:'Society Home Account / Local Development Programmes (Centum, GNK, Sahyog)', funder:'individuals', regime:'INR', total:1251988.70, admin:322710 },
      { project:'FASAL Project (SDTT, pre-2022 phase, routed through PANI)', funder:'sdtt', regime:'INR', total:1072508.70, admin:119310.70 },
      { project:'RGCEP Project (IIMPACT Girls Education)', funder:'iimpact', regime:'INR', total:3569742.70, admin:277739 },
      { project:'SCDP Project (ACC Cement, Tikariya)', funder:'acc', regime:'INR', total:2444446, admin:113913 },
      { project:'Child Line Project (Childline India Foundation)', funder:'childline_india', regime:'INR', total:568298, admin:121378 },
      { project:'Depreciation on Fixed Assets (Local & FCRA)', funder:'individuals', regime:'INR', total:195980.56, admin:195980.56 },
    ],
  },
  {
    fy:'2012-13', doc:'assets/docs/balance-sheet-2012-13.pdf', period:'1 Apr 2012 – 31 Mar 2013',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: YEAR 2012 - 2013.pdf, re-read directly page by page (Pages 7-8), rotation-corrected.
    // receivedTotal is the audited Income & Expenditure Account's income total — an appropriation
    // basis (grant income recognised = grant applied that year), not a cash-receipts figure; it
    // equals utilisedTotal + surplus exactly (₹1,09,04,308.77 + ₹4,35,407.43 = ₹1,13,39,716.20). The
    // 15 lines below reproduce every "Appropriation on Grant" / "Total Income of ..." block on pages
    // 7-8 and sum to the same total to the rupee. A prior cash-receipts received[] (summing to only
    // ₹77,94,409) was comparing a cash-basis array against an appropriation-basis total, which is
    // where the long-flagged ₹35.45L "gap" came from — not a missing grant. Consolidated R&P (a
    // different, cash basis, including brought-forward balances) totals ₹1,42,20,181.25 separately.
    receivedTotal:11339716.20, surplus:435407.43, utilisedTotal:10904308.77,
    note:'Both received and utilised are stated on the appropriation basis of the audited Income & Expenditure account: grant income recognised equals grant applied that year, so received[] entries are each project’s appropriated income for the year, not a cash-receipts figure.',
    received:[
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:2718219, interest:18788, note:'UNICEF-CPP (child protection) — appropriation on grant; ₹18,788 is a contribution from the Society Home Account, not bank interest', project:'UNICEF-CPP' },
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:2777982, interest:0,     note:'RGCEP / Rural Girl Child Education Project — appropriation on grant' },
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:2048588, interest:27391.20, note:'UNICEF-CHNI (child health & nutrition) — appropriation on grant; interest incl. ₹24,042 bank interest + ₹3,349.20 contribution from the Society Home Account', project:'UNICEF-CHNI' },
      { funder:'sdtt',           regime:'INR',  flex:'restricted', grant:879174,  interest:12940, note:'FASAL programme, pre-2022 phase, routed through PANI — appropriation on grant' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:739194,  interest:0,     note:'Childline India Foundation — ₹5,19,225 grant received + ₹2,19,969 receivable' },
      { funder:'jica',           regime:'INR',  flex:'restricted', grant:550392,  interest:0,     note:'UPFMPAP, via DMU Sonbhadra — appropriation on grant' },
      // Note deliberately doesn't name the recouping projects (UNICEF-CHNI/CPP, JICA/UPFMPAP) — each of
      // their own grant lines is already itemised, separately and correctly tagged, elsewhere in this same
      // year's accounts. Naming them here caused a real classification bug: this line's first-match
      // keyword tagger read "JICA" in the note text and mistagged this general, mixed Society Home receipt
      // as prog:'climate' (caught by Codex Handoff #3). This is a recoupment credited back to the general
      // fund, not project spend, so it correctly falls through to the base 'individuals' tag (cross /
      // Participation) with the project names left out of the matched text on purpose.
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:947796,  interest:0,     note:'Society Home Account — local contribution, bank interest and inter-project overhead/travel recoupments credited back from partner-funded projects, each separately itemised elsewhere in this year’s accounts under its own funder' },
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:78510,   interest:0,     note:'Sustainable Community Development Project (ACC Cement, Tikariya), via Society Home Account' },
      { funder:'charity_science', regime:'INR', flex:'restricted', grant:82980,   interest:0,     note:'Charity Science / Vidhya Grants scholarship (Hem Nanda – C.S.), via Society Home Account' },
      { funder:'centum',         regime:'INR',  flex:'restricted', grant:117432,  interest:0,     note:'WSI Learning Centre (Centum Fund), via Society Home Account' },
      { funder:'cry',            regime:'INR',  flex:'restricted', grant:140951,  interest:0,     note:'Azadi Project — CRY local (INR) fund', project:'Azadi' },
      { funder:'cry',            regime:'FCRA', flex:'restricted', grant:155293,  interest:0,     note:'CRY Project — foreign contribution fund' },
      { funder:'jagdeep_lohani', regime:'FCRA', flex:'restricted', grant:20000,   interest:0,     note:'Action on Research on Direct Democracy — grant from Mr. Jagdeep Singh Lohani' },
      { funder:'__fcra_general', regime:'FCRA', flex:'flexible',   grant:0,       interest:3686,  note:'Foreign contribution account bank interest' },
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:20400,   interest:0,     note:'ACC Project (Tikriya, direct)' },
    ],
    // Source: YEAR 2012 - 2013.pdf, re-read directly page by page (Pages 7-10). The 12 operational
    // lines plus depreciation sum to ₹1,09,04,308.77; + surplus ₹4,35,407.43 = the printed grand
    // balancing total ₹1,13,39,716.20 exactly. Admin = any printed "Administration"/"Overhead"/
    // "Management"/"Support Cost"/"Bank Charges" sub-line (ACC's admin combines its "Administration"
    // ₹9,000 + "Overhead" ₹8,400 lines).
    //
    // Society Home Account's own 13-line schedule (page 8), verified directly against the source scan:
    // Audit Fees ₹6,554 (admin) + Fuel & Maintenance ₹94,595 (admin) + Miscellaneous ₹68,660 (admin) +
    // Nukad Natak ₹21,600 (programme — street theatre) + Office Rent ₹22,800 (admin) + Printing/
    // Stationery/Postage/Telephone ₹13,223 (admin) + Salary & Honorarium ₹1,20,555 (admin) + Staff
    // Meeting ₹1,377 (admin) + Travel ₹45,654 (admin) + Xylo Insurance ₹19,336 (admin) + Interest on
    // Loan ₹14,689 (admin) + Contribution to Unicef-CPP ₹18,788 (programme — real transfer, counted on
    // the receiving side) + Contribution to Unicef-CHNI ₹3,349.20 (programme) = ₹4,51,180.20 exactly.
    // Salary & Honorarium carries no role/project specification on the page — classified admin per the
    // same-year, same-auditor (CA Subhash Misra) precedent on page 7: the CRY project's own schedule
    // explicitly puts generic "Salary to Accountant" and "Salary to Project Coordinator" under
    // Administration, while only role-specific field titles (Child Right Activist, Community Organizer)
    // count as programme. This is the general/head-office account, not a named field project, so an
    // unspecified salary line here follows the coordination/accounting precedent, not the field-role one.
    // Admin total = 6554+94595+68660+22800+13223+120555+1377+45654+19336+14689 = ₹4,07,443.
    // A prior ₹2,77,446 admin figure here did not correspond to any printed subset of these lines and
    // did not survive re-verification.
    spend:[
      { project:'CRY Project (Foreign Contribution)', funder:'cry', regime:'FCRA', total:155293, admin:60655 },
      { project:'Action on Research on Direct Democracy (Jagdeep Lohani)', funder:'jagdeep_lohani', regime:'FCRA', total:20000, admin:0, adminChecked:true },
      { project:'FCRA General Operational Bank Charges', funder:'__fcra_general', regime:'FCRA', total:5, admin:5 },
      // Source: Financial year 2012-13.pdf, Society Home Account schedule, cross-checked against the
      // fuller audited workbook Balance_Sheet_2012-2013-2.xlsx (sheet "DEHAT -GENERAL"). The former
      // single ₹6,58,671.20 line is decomposed into its four named activities plus the remaining
      // Society/General Home Account, which is NOT distributed across those four merely to force a
      // split: 78510+4845+120377+3759+451180.20 = 658671.20 exactly, no residual.
      { project:'ACC Amethi (Providing Career Counsellor Program)', funder:'acc', regime:'INR', total:78510.00, admin:0, adminChecked:true },
      { project:'TMN (Seed Treatment)', funder:'tmn', regime:'INR', total:4845.00, admin:0, adminChecked:true },
      // Centum's own workbook does not use the word "administration" — it gives a natural-account split:
      // Office Expenses ₹36,715 + Salary ₹83,662 = ₹1,20,377. Classified per standing rule: office/overhead
      // costs → admin, direct-delivery salary → programme. Admin = Office Expenses ₹36,715.
      { project:'Centum (WSI Learning Centre Program): Office ₹36,715 + Salary ₹83,662', funder:'centum', regime:'INR', total:120377.00, admin:36715.00, adminChecked:true },
      { project:'Vidhya (Scholarship Program)', funder:'vidhya', regime:'INR', total:3759.00, admin:0, adminChecked:true },
      { project:'Society / General Home Account', funder:'individuals', regime:'INR', total:451180.20, admin:407443.00 },
      // UNICEF-CHNI's schedule prints two overhead-shaped figures: a 7% institutional overhead
      // credited to the Society Home Account (₹1,34,020, counted in that line's received[] entry
      // above) and this project's own "Direct Program Support Cost" (₹3,29,854). UNICEF-CPP's
      // already-established admin (₹4,36,144, below) is that project's equivalent "support cost"
      // figure, not its matching 7% overhead (₹2,27,321) — so CHNI's admin is its support-cost figure
      // too, for the same treatment across both UNICEF projects. The previously-used ₹3,15,486 was
      // this project's separate "Travel Cost" line, not an admin/overhead sub-header.
      { project:'UNICEF-CHNI Project (Child Health & Nutrition)', funder:'unicef', regime:'INR', total:2048588, admin:329854 },
      { project:'FASAL Project (SDTT, pre-2022 phase, routed through PANI)', funder:'sdtt', regime:'INR', total:879629, admin:61000 },
      { project:'Azadi Project (CRY Local Funds)', funder:'cry', regime:'INR', total:140951, admin:36715 },
      { project:'UNICEF-CPP Project (Child Protection)', funder:'unicef', regime:'INR', total:2718219, admin:436144 },
      { project:'RGCEP Project (IIMPACT Girls Education)', funder:'iimpact', regime:'INR', total:2777982, admin:233353 },
      { project:'ACC Tikariya SCDP Project', funder:'acc', regime:'INR', total:20400, admin:17400 },
      { project:'Childline Project (Childline India Foundation)', funder:'childline_india', regime:'INR', total:739194, admin:166478 },
      { project:'UPFMPAP Project (Forestry / JICA Support)', funder:'jica', regime:'INR', total:550392, admin:73472 },
      { project:'Depreciation on Fixed Assets (Local & FCRA)', funder:'individuals', regime:'INR', total:194984.57, admin:194984.57 },
    ],
  },
  {
    fy:'2011-12', doc:'assets/docs/balance-sheet-2011-12.pdf', period:'1 Apr 2011 – 31 Mar 2012',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: re-scanned consolidated R&P/I&E/Balance Sheet 2011-12 (legible copy, signed 29.08.2012).
    // Per-funder = grant RECEIVED in cash during the year (R&P "Grant Received" lines).
    // Consolidated R&P ₹1,24,38,017.78; I&E ₹1,13,75,513.50; balance sheet ₹42,29,220.94; surplus ₹5,73,803.17.
    balanceSheetTotal:4229220.94, surplus:573803.17, utilisedTotal:10801710.33,
    note:'Received = cash grant receipts (R&P); utilised = consolidated I&E expenditure (₹1,13,75,513.50 total less ₹5,73,803.17 surplus). The two bases differ, so received ≠ utilised.',
    received:[
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:2670000, interest:2985, note:'IMPACT education programme' },
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:2431224, interest:18085, note:'UNICEF child health & nutrition programme; + ₹1,78,954 receivable from 2010-11' },
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:1404288, interest:0, note:'UNICEF-CPP (child protection); ₹8,32,450 further receivable', project:'UNICEF-CPP' },
      { funder:'sdtt',           regime:'INR',  flex:'restricted', grant:813000,  interest:2986, note:'Sir Dorabji Tata Trust — Empowering Rural Women; ₹65,655 refunded' },
      { funder:'cry',            regime:'FCRA', flex:'restricted', grant:573284,  interest:6776, note:'Child Rights and You project; ₹29,435 unutilised at year end' },
      { funder:'jica',           regime:'INR',  flex:'restricted', grant:527121,  interest:2985, note:'UPFMPAP (JICA / Japan Bank, via DMU Renukoot); activities 2011-12' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:415250,  interest:0, note:'Childline India Foundation; ₹3,85,550 further receivable (grant fund ₹8,00,800)' },
      { funder:'sdtt',           regime:'INR',  flex:'restricted', grant:191800,  interest:0, note:'FASAL programme, pre-2022 phase — Sir Dorabji Tata Trust, routed through PANI, Faizabad' },
      { funder:'baif',           regime:'FCRA', flex:'restricted', grant:88069,   interest:0, note:'Sure Start (BAIF, Pune) — Payagpur ₹45,548 + Chitaura ₹42,521 (winding down)' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:8500,    interest:10448, note:'Local contribution & membership fee + bank interest (General/Local Fund)' },
    ],
    // Source: Income and Expenditure 2011-2012.docx — the full 4-page consolidated, typed (not
    // scanned-longhand) I&E account, dated 29.08.2012, read directly page by page. Every total and
    // every admin figure below reproduces a specific named, printed line on those pages (e.g. IIMPACT's
    // admin is its own "Management Cost" line, UNICEF-CHNI's is its own "Reimbursement of 7% of Indirect
    // Cost" line — none are formulas). The nine lines below sum to exactly ₹1,08,01,710.34, matching
    // utilisedTotal to the cent.
    spend:[
      { project:'Child Line Project (Childline India Foundation)', funder:'childline_india', regime:'INR', total:800800, admin:64900 },
      { project:'FASAL (SDTT, pre-2022 phase, routed through PANI)', funder:'sdtt', regime:'INR', total:58910, admin:42000 },
      { project:'IIMPACT Project', funder:'iimpact', regime:'INR', total:2477241, admin:167610 },
      { project:'UNICEF-CHNI Project', funder:'unicef', regime:'INR', total:2635220, admin:172398 },
      { project:'UNICEF-CPP Project', funder:'unicef', regime:'INR', total:2236738, admin:96835 },
      { project:'UPFMPAP Project (JICA)', funder:'jica', regime:'INR', total:684911, admin:91714 },
      { project:'SDTT-ERW Project', funder:'sdtt', regime:'INR', total:750331, admin:107367 },
      { project:'Sure Start Programme — Chaitura (BAIF)', funder:'baif', regime:'FCRA', total:57839, admin:4285 },
      { project:'Sure Start Programme — Payagpur (BAIF)', funder:'baif', regime:'FCRA', total:61758, admin:4575 },
      { project:'CRY Project Cost', funder:'cry', regime:'FCRA', total:589437, admin:211749 },
      { project:'FCRA Other Funds (bank charges, Mahila Shakti Sammelan)', funder:'__fcra_general', regime:'FCRA', total:9285, admin:25 },
      { project:'General Account (Local Fund)', funder:'individuals', regime:'INR', total:241480, admin:241480 },
      { project:'Depreciation on fixed assets (Society Home + Foreign Contribution accounts)', funder:'individuals', regime:'INR', total:197760.34, admin:197760.34 },
    ],
  },
  {
    fy:'2010-11', doc:'assets/docs/balance-sheet-2010-11.pdf', period:'1 Apr 2010 – 31 Mar 2011',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Sources: YEAR 2010 - 2011(1)-ocr.pdf and the recovered 22-page signed scan
    // "Balance Sheet 2010-11.pdf.pdf" (R&P/I&E/Balance Sheet plus Annexures I-VII, signed 19.04.2011).
    // Balance sheet ₹15,91,631.32; income ₹69,20,843.50; expenditure ₹64,00,659.05; surplus ₹5,20,184.45.
    //
    // Annexure II of that recovered scan ("Details of Grant Receipts, Utilisation, Refund and Unutilised
    // Balance for 2010-11") is the per-project schedule this year lacked all session — it itemises every
    // FCRA and Indian project's Opening / Received / Refund / Utilisation / Closing to the rupee, and every
    // row and every subtotal reconciles exactly against the audited totals:
    //   FCRA: Sure Start-Payagpur (util. ₹3,98,825) + Sure Start-Chittaura (₹4,05,744) + CRY (₹5,54,208) +
    //   Kabir (₹50,000) = ₹14,08,777.00, matching the audited Foreign Activities Expenses exactly.
    //   Indian: ERW/SDTT (₹3,25,736) + IIMPACT (₹18,40,996) + UPFMPAP/JICA (₹8,61,797.75) + UNICEF
    //   (₹15,49,146) + SSK Training (₹1,10,020) + NABARD Training (₹12,455) = ₹47,00,150.75, matching the
    //   audited Indian Activities Expenses exactly. Grand total ₹61,08,927.75, + Depreciation ₹1,27,554.30
    //   + Other Expenses ₹1,64,177.00 = ₹64,00,659.05 = utilisedTotal, to the rupee.
    // JICA, BAIF, SDTT-ERW, IIMPACT, and SSK admin splits are confirmed directly from each project's own
    // Receipts & Payments / Income & Expenditure schedule within the 47-page compendium: JICA's "Overheads
    // Expenses" line (page 7, ₹1,18,336.75), BAIF's Chittaura+Payagpur "Overheads Expenses (Admin)" lines
    // (pages 27-34, ₹30,054+₹29,544=₹59,598), SDTT-ERW's "Administration Expenses" subtotal (₹80,420),
    // IIMPACT's "IIMPACT Management Cost" heading (₹1,09,623, with ₹9,000 reconciliation variance against
    // Annexure II ₹18,40,996), and SSK's schedule (100% programme, admin: 0).
    // UNICEF admin was previously carried as ₹1,01,346, attributed to "Form 10B (Disclosure §17-18), page
    // 7" per an earlier dossier (handoff_57). A full page-by-page transcript of this same 47-page compendium
    // (all sections mapped to exact page ranges) shows page 7 is the JICA Receipts & Payments account, not
    // a Form 10B disclosure — no Form 10B section exists anywhere in the compendium, and ₹1,01,346 does not
    // appear on any page. It is almost exactly 6.542% of UNICEF's ₹15,49,146 utilisation, consistent with a
    // computed ratio rather than a transcribed figure. Reverted to admin: null pending an actual citation.
    // CRY (₹5,54,208), Kabir (₹50,000), and NABARD (₹12,455) remain genuine documentary dead ends without
    // admin schedules (admin: null) — Annexure II shows only their opening/refund/utilisation movement.
    //
    // This corrects two lines this project got wrong before finding Annexure II: Kabir was previously
    // recorded as ₹2,66,034.75 (Annexure I's opening-to-closing account movement, read as if the whole
    // balance were spent) and CRY as ₹3,25,871.28 (an arithmetic remainder) — Annexure II shows Kabir's
    // account actually REFUNDED ₹2,15,000.00 back to the donor and utilised only ₹50,000, and CRY actually
    // utilised ₹5,54,208.00, not a remainder figure. SDTT-ERW was previously ₹3,41,584.00 (its opening
    // balance) — Annexure II shows ₹19,185.00 of that was refunded, leaving ₹3,25,736.00 actually utilised.
    // The "Other Funds" line (₹12,301.97) is removed entirely — it is not one of Annexure II's named
    // projects and has no place in the Activities Expenses figure; the schedule's four FCRA rows already
    // sum to the audited total without it. IIMPACT, SSK and NABARD were previously bundled into a single
    // "not itemised" residual and are now named individually with real utilisation figures.
    //
    // Annexure II does not contain a separate Society Home programme-spend row. Crucially, the named
    // Indian project rows already sum to the full audited Indian Activities Expenses, so no Society Home
    // programme residual remains to be allocated.
    receivedTotal:6588804.75, utilisedTotal:6400659.05, balanceSheetTotal:1591631.32, surplus:520184.45,
    note:'Every FY2010-11 grant receipt and utilisation is itemised by project from audited Annexure II, with project-level R&P/I&E schedules confirming admin splits for JICA, BAIF, SDTT-ERW, IIMPACT, SSK, and UNICEF. IIMPACT schedule documents ₹17,22,373 programme + ₹1,09,623 admin = ₹18,31,996 vs published Annexure II total ₹18,40,996 (₹9,000 variance). UNICEF admin (₹1,76,968, resolved from the R&P account\'s "Direct Programme Support Cost" + indirect-cost reimbursement, same-auditor classification precedent as SDTT-ERW) is drawn from the R&P cash total (₹14,88,230), while the live total (₹15,49,146) is the Annexure II statutory figure; the ₹60,916 difference is fully reconciled as an additional accrual receivable, not an unexplained gap. A prior dossier\'s claim that this figure came from "Form 10B, page 7" was checked and rejected — no such section exists in the 47-page compendium. Admin splits remain unavailable in primary records for CRY (₹5,54,208), Kabir (₹50,000), and NABARD (₹12,455) — no expenditure schedule of any kind exists for these three, confirmed against two independently-sourced copies of the compendium.',
    fundersActive:['cry','baif','kabir','sdtt','iimpact','unicef','nabard','jica','ssk'],
    received:[
      { funder:'baif',           regime:'FCRA', flex:'restricted', grant:805567,  interest:0, note:'Audited Annexure II cash receipts: Sure Start Payagpur ₹3,89,708 + Chittaura ₹4,15,859' },
      { funder:'cry',            regime:'FCRA', flex:'restricted', grant:586996,  interest:0, note:'Audited Annexure II cash receipt' },
      { funder:'__fcra_general', regime:'FCRA', flex:'flexible',   grant:0,       interest:20315, note:'Foreign-account interest / other income (Annexure III)' },
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:2050000, interest:0, note:'Audited Annexure II cash receipt for Rural Girl Child Education' },
      { funder:'jica',           regime:'INR',  flex:'restricted', grant:849167,  interest:0, note:'Audited Annexure II cash receipt through DMU Renukoot' },
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:1370060, interest:0, note:'Audited Annexure II cash receipt' },
      { funder:'ssk',            regime:'INR',  flex:'restricted', grant:110020,  interest:0, note:'Audited Annexure II cash receipt — Sahbhagi Shikshan Kendra, Community Based Disaster Management Committees (CBDMC) training, Mihinpurwa block' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:0,       interest:796679.75, note:'Local contribution + interest (Indian funds)' },
    ],
    spend:[
      { project:'UPFMPAP Project (JICA, through DMU Renukoot)', funder:'jica', regime:'INR', total:861797.75, admin:118336.75 },
      // UNICEF admin, resolved: the project's own R&P account (pages 1-4) has a "Direct Programme Support
      // Cost" bucket — Office Rent ₹36,000 + Accountant (part-time) ₹30,000 + Office Assistant ₹18,000 +
      // Stationery ₹13,368 + Telephone ₹39,170 = ₹1,36,538 — category-for-category identical to what this
      // same auditor (RJCP Subhash Misra & Co) explicitly labelled "Administration Expenses" in SDTT-ERW's
      // report, same audit engagement. Plus "Reimbursement of 7% Indirect Cost (NGO Share)" ₹40,430,
      // explicitly labelled an indirect/overhead cost. Admin = 136,538 + 40,430 = ₹1,76,968.
      // Basis note: this admin figure is drawn from the R&P's cash total (₹14,88,230), while the live
      // `total` (₹15,49,146) is the audited statutory Annexure II figure. The ₹60,916 difference is fully
      // reconciled: Annexure II's closing receivable (₹1,78,954) less the project balance sheet's own
      // receivable (₹1,18,038) = ₹60,916 additional accrual recognised on the statutory basis, with no
      // itemised cost of its own — corroborated independently by FY2011-12's own received[] note, already
      // live before this reconciliation, recording "+₹1,78,954 receivable from 2010-11" received in cash.
      // (A prior dossier's ₹1,01,346 "Form 10B, page 7" figure was checked and does not exist in the
      // 47-page compendium — page 7 is the JICA R&P account, not Form 10B.)
      { project:'Comprehensive Health & Nutrition Intervention (UNICEF, Lucknow)', funder:'unicef', regime:'INR', total:1549146.00, admin:176968.00 },
      { project:'Sure Start Project (BAIF, Pune)', funder:'baif', regime:'FCRA', total:804569.00, admin:59598.00 },
      { project:'Depreciation on Fixed Assets (Indian Funds Related)', funder:'individuals', regime:'INR', total:127554.30, admin:127554.30 },
      { project:'Other Expenses (Foreign ₹4,950 + Indian ₹1,59,227)', funder:'individuals', regime:'INR', total:164177.00, admin:164177.00 },
      // Admin MODELLED, not audited -- the only estimated (rather than cited) admin figure in this
      // 20-year dataset. Confirmed via two independently-sourced copies of the 47-page compendium: CRY's
      // FY2010-11 utilisation (₹5,54,208) is printed only as a flat total in Annexure II, with no
      // functional-cost schedule anywhere in either copy -- unlike Kabir/NABARD above, this is not a
      // "flat total = admin:0" situation, because CRY's own FCRA-regime admin ratio in every year it IS
      // measured is real and substantial, never near zero:
      //   FY2009-10 (backward): ₹1,35,389 / ₹4,31,322 = 31.39%
      //   FY2011-12 (forward):  ₹2,11,749 / ₹5,89,437 = 35.92%
      //   FY2012-13 (forward):  ₹60,655 / ₹1,55,293 = 39.06%
      // FY2010-11 sits directly between the two years bracketing it. Admin = the midpoint of the
      // immediately-adjacent FY2009-10 and FY2011-12 ratios (31.39% + 35.92%) / 2 = 33.66%, applied to
      // ₹5,54,208 = ₹1,86,528. Cross-checked by linear regression across all three known FCRA years
      // (2009-10, 2011-12, 2012-13), which independently interpolates to ₹1,87,214 at FY2010-11 -- within
      // 0.4% of the simple midpoint, giving good convergence between two different methods.
      { project:'Child Right Project (CRY, New Delhi)', funder:'cry', regime:'FCRA', total:554208.00, admin:186528.00, estimated:true },
      // Statutory cross-check: the signed FC-3 for FY2010-11 (submitted 29.06.2011) shows a Kabir
      // Project line on a cash basis — opening balance ₹2,65,000 fully utilised during the year, i.e.
      // ₹2,65,000 cash utilisation — differing from the ₹50,000 audited I&E "utilised on transfer from
      // balance sheet" figure used here. Same accrual-vs-cash distinction already documented for other
      // years (FY2009-10, FY2020-21); the I&E figure remains the live basis per this dataset's
      // established convention. No admin schedule accompanies either figure for this project — printed
      // as one flat total with no sub-header, the same situation as Kabir/NABARD/Primenet/AFC/UPVAN in
      // FY2009-10, where the established convention (already live, adminChecked:true) is admin:0 rather
      // than guessed. Applying the same treatment here for consistency, not as a new estimate.
      { project:'Action Research on Right to Information (Kabir Project, New Delhi)', funder:'kabir', regime:'FCRA', total:50000.00, admin:0, adminChecked:true },
      // Source: Balance Sheet 2010-11.pdf, SDTT-ERW Income & Expenditure schedule — an actual account,
      // not a proposal budget. Programme ₹50,316 activities + ₹1,95,000 programme salary = ₹2,45,316.
      // Administration: Accountant ₹38,500 + Travel/fuel ₹14,411 + Printing ₹6,037 + Phone/postage
      // ₹9,472 + Office rent ₹12,000 = ₹80,420. This supersedes the earlier admin:null.
      { project:'Empowering Rural Women (SDTT), ERW Project', funder:'sdtt', regime:'INR', total:325736.00, admin:80420 },
      // Source: Balance Sheet 2010-11.pdf (Pages 10-12 & Annexure II). Documented Programme = ₹17,22,373
      // (Salary ₹12,52,492 + TLM ₹2,62,514 + Other Programme ₹2,07,367); Documented Admin = ₹1,09,623
      // (Auditors ₹3,930 + Office rent ₹36,000 + Phone/postage ₹30,283 + Travel/transport ₹39,410). Subtotal
      // documented spend = ₹18,31,996.00 vs published Annexure II total = ₹18,40,996.00 (reconciliation variance = ₹9,000.00).
      { project:'Rural Girl Child Education (IIMPACT, Gurgaon)', funder:'iimpact', regime:'INR', total:1840996.00, admin:109623 },
      // Source: Balance Sheet 2010-11.pdf, Society Home Account — the actual payment line reads
      // "Expenses on Programme – Formation & Training of CBDMC (SSK) ₹1,10,020," a direct account
      // entry, not a proposal budget. 100% programme, no administration shown.
      { project:'Community Based Disaster Management Committees (Sahbhagi Shikshan Kendra, Mihinpurwa block)', funder:'ssk', regime:'INR', total:110020.00, admin:0, adminChecked:true },
      // Same situation as Kabir above: printed as one flat total with no sub-header anywhere in either
      // copy of the compendium. Applying the same established FY2009-10 convention (admin:0 rather than
      // guessed) for consistency, not as a new estimate.
      { project:'NABARD Training Project (Lucknow)', funder:'nabard', regime:'INR', total:12455.00, admin:0, adminChecked:true },
    ],
  },
  {
    fy:'2009-10', doc:'assets/docs/balance-sheet-2009-10.pdf', period:'1 Apr 2009 – 31 Mar 2010',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow)',
    // Source: scans/ocr-2009-10.txt (OCR of signed scan). Signed 08.07.2010.
    // I&E total ₹15,82,428.88; cash R&P ₹35,95,897 (incl. opening balances & advances).
    note:'Full audited I&E expenditure (₹27,59,020.13), independently itemised from the signed statement. The prior utilisedTotal (₹15,82,428.88) was an incomplete placeholder ahead of full digitisation.',
    receivedTotal:2893539.00, surplus:134518.88, utilisedTotal:2759020.13,
    fundersActive:['sdtt','cry','baif','kabir','iimpact','jica','nabard','afc','primenet','upvan','individuals'],
    // Receipt-side basis is the signed I&E appropriation schedule, matching receivedTotal and the
    // expenditure/surplus presentation. The FC-3 cash return is retained as a separate statutory
    // cross-check: it reports current-year foreign cash receipts ₹18,79,565 and interest ₹8,688.
    received:[
      { funder:'baif',        regime:'FCRA', flex:'restricted', grant:1036085, interest:6618.50, note:'Sure Start Payagpur + Chittaura — audited grant appropriation ₹10,36,085 + interest ₹6,618.50' },
      { funder:'cry',         regime:'FCRA', flex:'restricted', grant:431322,  interest:1034.75, note:'CRY foreign-contribution project — appropriation + allocated interest' },
      { funder:'kabir',       regime:'FCRA', flex:'restricted', grant:235000,  interest:1034.75, note:'Kabir/UNDP action research — appropriation + allocated interest' },
      { funder:'sdtt',        regime:'INR',  flex:'restricted', grant:132416,  interest:0, note:'Sir Dorabji Tata Trust — Empowering Rural Women appropriation' },
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:123965,  interest:0, note:'CRY local-funds project appropriation' },
      { funder:'iimpact',     regime:'INR',  flex:'restricted', grant:178180,  interest:0, note:'IIMPACT Rural Girl Child Education — receivable recognised' },
      { funder:'jica',        regime:'INR',  flex:'restricted', grant:71965,   interest:0, note:'UPFMPAP/JICA — receivable recognised' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:220490,  interest:0, note:'NABARD ₹28,075 project income + ₹1,92,415 SHG-formation grant' },
      { funder:'afc',         regime:'INR',  flex:'restricted', grant:43500,   interest:0, note:'Agricultural Finance Corporation Ltd — Gram Panchayat survey, Basti District (NREGA Perspective Plan)' },
      { funder:'primenet',    regime:'INR',  flex:'restricted', grant:90300,   interest:0, note:'Primenet, Lucknow — Gram Panchayat survey, Bahraich District (NREGA Perspective Plan)' },
      { funder:'upvan',       regime:'INR',  flex:'restricted', grant:17000,   interest:0, note:'Uttar Pradesh Voluntary Action Network — Right to Information campaign' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:304628,  interest:0, note:'General Account, after separately classifying the NABARD SHG grant and the AFC/Primenet/UPVAN institutional lines above' },
    ],
    // Source: YEAR 2009 - 2010.pdf, re-read directly page by page (Pages 5-7). The 14 lines sum to
    // ₹27,59,020.13; + surplus ₹1,34,518.88 = the printed grand total ₹28,93,539.00. AFC and Primenet
    // are institutional NREGA-perspective-plan survey consultancies (Basti and Bahraich Districts
    // respectively) — AFC's own signed 26.03.2009 letter confirms DEHAT was the paid service provider
    // for a Gram Panchayat–level survey, not a grant recipient. UPVAN is the Uttar Pradesh Voluntary
    // Action Network — a civil-society RTI-campaign network, per direct confirmation, not the state
    // Forest Department this dataset previously and wrongly guessed from a coincidental logo filename.
    // None of the three are individuals; each now has its own funder-registry entry rather than being
    // folded into the domestic 'individuals' bucket.
    // Admin = any printed "Administration"/"Overhead"/"Management"/"Support Cost" sub-line. Re-verified
    // directly against YEAR 2009 - 2010.pdf pages 5-7 (the full 11-page consolidated statement, not
    // just the 8-page excerpt used earlier): BAIF Chittaura/Payagpur admin = their own printed "Project
    // Support Costs" + "Overheads" sub-lines; CRY (FCRA)'s admin is its own "Administrator Expenses"
    // line; SDTT-ERW and CRY (Local)'s admin are each their own "Administrativte Expenses" sub-total.
    // IIMPACT's page has no such sub-header at all — its "Program Expenses" are one flat list with no
    // admin split drawn by the auditor, so a prior claim of ₹17,500 admin for this line (built from
    // Rent + Phone/Postage + a "Salary ₹13k" that isn't what the page actually says, which prints
    // "Salary to Suppervisior 10000") did not survive re-verification and admin stays at 0. General
    // Account's admin is its own "Administrativte Expenses" sub-line, ₹88,517, out of five components.
    // Kabir, Primenet, AFC, NABARD and UPVAN are each printed as one flat figure with no admin
    // sub-header, so admin stays at 0 for those rather than guessed.
    spend:[
      { project:'Sure Start Project — Chittaura (BAIF)', funder:'baif', regime:'FCRA', total:592883, admin:129796 },
      { project:'Sure Start Project — Payagpur (BAIF)', funder:'baif', regime:'FCRA', total:447683, admin:111525 },
      { project:'CRY Project (Foreign Contribution)', funder:'cry', regime:'FCRA', total:431322, admin:135389 },
      { project:'Kabir Project (United Nations Development Programme channel)', funder:'kabir', regime:'FCRA', total:235000, admin:0, adminChecked:true },
      { project:'IIMPACT Rural Girl Child Education Programme', funder:'iimpact', regime:'INR', total:178180, admin:0, adminChecked:true },
      { project:'SDTT — Empowering Rural Women (ERW)', funder:'sdtt', regime:'INR', total:132416, admin:43539 },
      { project:'CRY Project (Local Indian Funds)', funder:'cry', regime:'INR', total:123965, admin:54835 },
      { project:'Primenet — NREGA Perspective Plan, Bahraich', funder:'primenet', regime:'INR', total:90300, admin:0, adminChecked:true },
      { project:'UPFMPAP Project (JICA)', funder:'jica', regime:'INR', total:71965, admin:0, adminChecked:true },
      { project:'AFC — NREGA Perspective Plan, Basti', funder:'afc', regime:'INR', total:43500, admin:0, adminChecked:true },
      { project:'NABARD Programme', funder:'nabard', regime:'INR', total:28159, admin:0, adminChecked:true },
      { project:'UPVAN — Right to Information Campaign', funder:'upvan', regime:'INR', total:17000, admin:0, adminChecked:true },
      { project:'General Account & Adjustments', funder:'individuals', regime:'INR', total:297842, admin:88517 },
      { project:'Depreciation on Fixed Assets', funder:'individuals', regime:'INR', total:68805.13, admin:68805.13 },
    ],
  },
  {
    fy:'2008-09', doc:'assets/docs/balance-sheet-2008-09.pdf', period:'1 Apr 2008 – 31 Mar 2009',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2008-09.txt (OCR of signed scan). Signed 08.08.2009.
    // R&P total ₹23,80,751 (incl. opening ₹1,70,922); income for the year ₹22,09,829;
    // surplus ₹1,36,789; balance sheet total ₹6,44,215.
    surplus:136789, balanceSheetTotal:644215, receivedTotal:2209829, utilisedTotal:2073040,
    // Source: YEAR 2008 - 2009.pdf (Singh Agarwal & Associates, signed 08.08.2009), re-read directly
    // page by page. Every spend line below reproduces a specific named line on the signed page and
    // the seven lines sum to the utilisedTotal exactly.
    received:[
      { funder:'baif',        regime:'FCRA', flex:'restricted', grant:806556, interest:0, note:'BAIF (Sure Start) — foreign contribution' },
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:518354, interest:0, note:'Child Rights and You' },
      { funder:'ssa',         regime:'INR',  flex:'restricted', grant:198000, interest:0, note:'Sarva Shiksha Abhiyan (govt)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:4750,   interest:0, note:'NABARD' },
      // Re-read the signed Income & Expenditure page directly (Singh Agarwal & Associates): "From PANI"
      // ₹10,754 + "From PGSS" (Purvanchal Gramin Seva Samiti) ₹10,000 are each their own printed grant
      // line, ₹20,754 combined — the PGSS ₹10,000 half of that had been dropped from this figure,
      // which is exactly the ₹10,000 gap this year's __balance line had been carrying.
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:670881, interest:11288, note:'Local contribution ₹4,69,627 + individual contributions ₹1,75,000 + membership ₹5,500 + PANI ₹10,754 + PGSS ₹10,000' },
    ],
    spend:[
      { project:'Child Right Project (CRY)', funder:'cry', regime:'INR', total:490788, admin:0, adminChecked:true },
      { project:'Sure Start Project — Chittaura (BAIF)', funder:'baif', regime:'FCRA', total:416968, admin:0, adminChecked:true },
      { project:'Sure Start Project — Payagpur (BAIF)', funder:'baif', regime:'FCRA', total:374268, admin:0, adminChecked:true },
      { project:'Sarva Siksha Abhiyaan (SSA)', funder:'ssa', regime:'INR', total:210818, admin:0, adminChecked:true },
      { project:'Expence on Village Development Programme', funder:'individuals', regime:'INR', total:45739, admin:0, adminChecked:true },
      { project:'General community programmes (flood relief, RTI, sanitation, workshops)', funder:'individuals', regime:'INR', total:416360, admin:0, adminChecked:true },
      { project:'Head office administrative expenses', funder:'individuals', regime:'INR', total:118099, admin:118099 },
    ],
  },
  {
    fy:'2007-08', doc:'assets/docs/balance-sheet-2007-08.pdf', period:'1 Apr 2007 – 31 Mar 2008',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2007-08.txt (OCR of signed scan). Signed 17.05.2008.
    // I&E total ₹18,11,574; surplus ₹1,62,485; balance sheet total ₹4,43,426.
    // Disclosed, unresolved: which bank account (Foreign Contribution vs Indian) specific FY2006-08
    // receipts actually routed through is not fully settled — the signed R&P opening/closing balances
    // for this period show both a "Balance With Bank F.C. A/c" and a "Balance With Bank Indian" line
    // (FY2006-07: ₹29,837.00 FC / ₹1,160.00 Indian opening; FY2007-08: ₹1,14,598.00 FC / ₹56,324.00
    // Indian closing), but per-funder attachment to one account vs the other isn't independently
    // confirmed for every line below. See Dash/financial_reconciliation/gmail_evidence/
    // gmail_income_route_evidence_2006-09_2018-19.md for the fuller research trail. The regime tags
    // below reflect the funder's usual channel, not a line-by-line bank-statement trace.
    surplus:162485, balanceSheetTotal:443426, receivedTotal:1811574, utilisedTotal:1649089,
    // Source: "Income & Expenditure 2007-08.docx" (embedded scan of the signed statement, Singh Agarwal
    // & Associates, 17.05.2008), read directly. The income side reads: To Membership fees 4,520 / To
    // Consultancy charges 72,500 / To Contribution from Public 85,460 / To Donation and Charity
    // 1,74,061 / To Interest 1,602 / To Grant in Aid — CRY-Child Rights & You 4,48,918 + SURE START
    // PROJECT 7,66,516 + NABARD (After Old Balance) 1,87,233 + TARA AKSHAR (cash 32,262 + laptop
    // in-kind 38,502) — summing to 18,11,574 exactly. The three received[] lines this replaces had CRY
    // and BAIF's figures swapped (766,516 tagged as CRY is actually the Sure Start/BAIF figure; 187,233
    // tagged as BAIF is actually NABARD's), and never separately carried NABARD or Tara Akshar on the
    // received side at all despite both already being spend-side funders for this same year.
    note:'Income by funder now fully itemised from the signed statement.',
    fundersActive:['cry','baif','nabard','tara_akshar','individuals'],
    received:[
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:448918, interest:0, note:'Child Rights and You' },
      { funder:'baif',        regime:'FCRA', flex:'restricted', grant:766516, interest:0, note:'Sure Start Project (BAIF)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:187233, interest:0, note:'NABARD (after old balance)' },
      { funder:'tara_akshar', regime:'INR',  flex:'restricted', grant:32262,  interest:0, note:'Tara Akshar — grant in cash' },
      { funder:'tara_akshar', regime:'INR',  flex:'restricted', grant:38502,  interest:0, note:'Tara Akshar — laptop receipt, in-kind at market value', inKind:true },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:336541, interest:1602, note:'Membership fees ₹4,520 + consultancy charges ₹72,500 + contribution from public ₹85,460 + donation and charity ₹1,74,061' },
    ],
    // Source: YEAR 2007 - 2008.pdf (Singh Agarwal & Associates, signed 17.05.2008), re-read directly
    // page by page. Every spend line below reproduces a specific named line on the signed page and
    // the seven lines sum to the utilisedTotal exactly (₹16,49,089.00).
    spend:[
      { project:'Child Right Project (CRY)', funder:'cry', regime:'INR', total:463070, admin:0, adminChecked:true },
      { project:'Sure Start Project — Chittaura (BAIF)', funder:'baif', regime:'FCRA', total:329814, admin:0, adminChecked:true },
      { project:'Sure Start Project — Payagpur (BAIF)', funder:'baif', regime:'FCRA', total:324393, admin:0, adminChecked:true },
      { project:'NABARD (SHG Promotion Programme)', funder:'nabard', regime:'INR', total:194522, admin:0, adminChecked:true },
      { project:'Tara Akshar (Women\'s Literacy Programme)', funder:'tara_akshar', regime:'INR', total:43016, admin:0, adminChecked:true },
      { project:'General community programmes', funder:'individuals', regime:'INR', total:177606, admin:0, adminChecked:true },
      { project:'Head office administrative expenses', funder:'individuals', regime:'INR', total:116668, admin:116668 },
    ],
  },
  {
    fy:'2006-07', doc:'assets/docs/balance-sheet-2006-07.pdf', period:'1 Apr 2006 – 31 Mar 2007',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: Income & Expenditure 2006-07 (i).docx and (ii).docx — the two-page signed I&E account
    // (dated 30.10.2007), re-read directly as images (the scan is rotated and heavily degraded, which
    // the previous OCR pass misread). This corrects three real errors carried in this entry since it
    // was first built: (1) the printed "Excess of Income over Expenditure transfer to Capital A/c" line
    // reads ₹1,25,733.00, not ₹25,733 — the account's own totals (income ₹13,57,574 − expenditure
    // ₹12,31,841) confirm this; (2) utilisedTotal was ₹12,58,551 including a ₹26,710 "Depreciation" line
    // that does not appear anywhere on the signed pages — the real total is ₹12,31,841; (3) the DFID
    // (PACS Programme) grant received was recorded as ₹3,26,129 — the signed page reads ₹3,49,419.
    // A "To Grant Receivable NABARD REDP" income line (₹50,000) is on the same page and is added below
    // as its own line so receivedTotal reconciles to the signed total exactly.
    surplus:125733, balanceSheetTotal:230941, receivedTotal:1357574, utilisedTotal:1231841,
    received:[
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:414169, interest:0, note:'Child Rights and You' },
      { funder:'dfid_pacs',   regime:'FCRA', flex:'restricted', grant:349419, interest:0, note:'Department for International Development — Poorest Areas Civil Society Programme' },
      { funder:'action_aid',  regime:'FCRA', flex:'restricted', grant:165100, interest:0, note:'ActionAid (Making School Functional)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:61490,  interest:0, note:'NABARD (SHG promotion)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:50000,  interest:0, note:'NABARD REDP — recorded as a grant receivable on the signed income page' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:316580, interest:816, note:'Consultancy ₹62,600 + local contribution ₹45,140 + individual contributions ₹2,06,280 + membership ₹2,560' },
    ],
    spend:[
      { project:'Making School Functional (ActionAid)', funder:'action_aid', regime:'FCRA', total:150697, admin:0, adminChecked:true },
      { project:'PACS Programme (DFID)', funder:'dfid_pacs', regime:'FCRA', total:349431, admin:0, adminChecked:true, note:'Expenditure-side figure as printed; the income-side DFID grant this year reads ₹3,49,419 — a ₹12 difference present on the signed statement itself' },
      { project:'Child Rights Project (CRY) — revenue expenses', funder:'cry', regime:'INR', total:361607, admin:0, adminChecked:true },
      { project:'SHG Promotion Programme (NABARD)', funder:'nabard', regime:'INR', total:56040, admin:0, adminChecked:true },
      { project:'REDP Project (NABARD)', funder:'nabard', regime:'INR', total:50214, admin:0, adminChecked:true },
      { project:'General community programmes (RTI, health, sanitation, workshops)', funder:'individuals', regime:'INR', total:144107, admin:0, adminChecked:true },
      { project:'Head office administrative expenses', funder:'individuals', regime:'INR', total:119745, admin:119745 },
    ],
  },
  {
    fy:'2005-06', doc:'assets/docs/balance-sheet-2005-06.pdf', period:'1 Apr 2005 – 31 Mar 2006',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2005-06.txt (OCR of signed scan). Signed 18.11.2006. DEHAT's earliest
    // consolidated statement on record. I&E total ₹11,56,970; surplus ₹35,953; balance sheet ₹1,55,208.
    surplus:35953, balanceSheetTotal:155208, receivedTotal:1156970, utilisedTotal:1121017,
    // Source: YEAR 2005 - 2006.pdf (Singh Agarwal & Associates, signed 18.11.2006), re-read directly
    // page by page. Every spend line below reproduces a specific named line on the signed page and
    // the six lines sum to the utilisedTotal exactly.
    received:[
      { funder:'dfid_pacs',   regime:'FCRA', flex:'restricted', grant:351602, interest:0, note:'Poorest Areas Civil Society (Lokshakti) — Department for International Development programme' },
      { funder:'action_aid',  regime:'FCRA', flex:'restricted', grant:338000, interest:0, note:'ActionAid' },
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:162160, interest:0, note:'Child Rights and You (Azadi)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:60120,  interest:0, note:'NABARD' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:244505, interest:583, note:'Individual contributions ₹1,45,220 + consultancy ₹55,700 + local contribution ₹41,210 + membership ₹2,375' },
    ],
    spend:[
      { project:'PACS Programme (DFID / Lokshakti)', funder:'dfid_pacs', regime:'FCRA', total:351590, admin:0, adminChecked:true },
      { project:'ActionAid Project', funder:'action_aid', regime:'FCRA', total:337840, admin:0, adminChecked:true },
      { project:'CRY Azadi Project', funder:'cry', regime:'INR', total:130896, admin:0, adminChecked:true },
      { project:'NABARD (SHG promotion)', funder:'nabard', regime:'INR', total:60281, admin:0, adminChecked:true },
      { project:'General community programmes (health, sanitation, training, agri/horticulture)', funder:'individuals', regime:'INR', total:139998, admin:0, adminChecked:true },
      { project:'Head office administrative expenses', funder:'individuals', regime:'INR', total:100412, admin:100412 },
    ],
  },


];


// ============================================================================
// LENS LAYER — classification of every rupee across the dimensions the
// Transparency page lets a visitor slice by. Mappings are declared here (not
// in the UI) so they can be audited line by line.
// ============================================================================

FIN.PROGRAMMES = {
  rights:     { label:'Rights & Entitlements', since:2003, color:'#0E5565' },
  leadership: { label:'School of Leadership',  since:2005, color:'#EAAE28' },
  climate:    { label:'Climate Justice',       since:2007, color:'#556223' },
  protection: { label:'Human Protection',      since:2011, color:'#D2305C' },
  cross:      { label:'Institutional & Enabling Costs', since:2000, color:'#8a8378' },
};

FIN.SOURCES = {
  csr:           { label:'Corporate Social Responsibility', color:'#D2305C', note:'Company CSR spend under section 135, Companies Act, 2013' },
  philanthropy:  { label:'Philanthropy',                    color:'#EAAE28', note:'Private foundations and philanthropic trusts' },
  institutional: { label:'Institutional Grantmakers & International Non-Government Organisations', color:'#0E5565', note:'Grantmaking institutions, intermediary organisations and international non-government organisations' },
  government:    { label:'Government & Multilateral',       color:'#556223', note:'Central and state government schemes, bilateral and United Nations agencies' },
  individuals:   { label:'Individual Partners',             color:'#7a5cc4', note:'Personal contributions, membership and local contribution' },
};

FIN.UNCRC = {
  Survival:      { label:'Survival',      color:'#A92719', note:'Life, health, nutrition, water and a standard of living adequate for development' },
  Development:   { label:'Development',   color:'#EAAE28', note:'Education, play, skills and the fullest possible development of the child' },
  Protection:    { label:'Protection',    color:'#D2305C', note:'Freedom from exploitation, trafficking, abuse, neglect and harmful work' },
  Participation: { label:'Participation', color:'#0E9CB8', note:'The right to be heard, to information, association and a say in decisions' },
};

// Schedule VII to the Companies Act, 2013 — clause text as currently in force
// (Schedule VII as substituted 27 Feb 2014 and amended up to the Companies
// (CSR Policy) Amendment Rules; item numbering is the statutory numbering).
FIN.CSR7 = {
  i:   { ref:'Schedule VII (i)',   short:'Hunger, poverty, malnutrition, health care, sanitation, safe drinking water', color:'#A92719',
         text:'Eradicating hunger, poverty and malnutrition, promoting health care including preventive health care and sanitation including contribution to the Swachh Bharat Kosh set-up by the Central Government for the promotion of sanitation and making available safe drinking water.' },
  ii:  { ref:'Schedule VII (ii)',  short:'Education, special education, vocational skills, livelihood enhancement', color:'#EAAE28',
         text:'Promoting education, including special education and employment enhancing vocation skills especially among children, women, elderly and the differently abled and livelihood enhancement projects.' },
  iii: { ref:'Schedule VII (iii)', short:'Gender equality, women\u2019s empowerment, reducing inequalities', color:'#D2305C',
         text:'Promoting gender equality, empowering women, setting up homes and hostels for women and orphans; setting up old age homes, day care centres and such other facilities for senior citizens and measures for reducing inequalities faced by socially and economically backward groups.' },
  iv:  { ref:'Schedule VII (iv)',  short:'Environmental sustainability, ecological balance, natural resources', color:'#556223',
         text:'Ensuring environmental sustainability, ecological balance, protection of flora and fauna, animal welfare, agroforestry, conservation of natural resources and maintaining quality of soil, air and water including contribution to the Clean Ganga Fund set-up by the Central Government for rejuvenation of river Ganga.' },
  x:   { ref:'Schedule VII (x)',   short:'Rural development projects', color:'#0E5565',
         text:'Rural development projects.' },
  xii: { ref:'Schedule VII (xii)', short:'Disaster management, relief, rehabilitation, reconstruction', color:'#7a5cc4',
         text:'Disaster management, including relief, rehabilitation and reconstruction activities.' },
  none:{ ref:'Outside Schedule VII', short:'Not aligned to a Schedule VII item', color:'#8a8378',
         text:'General organisational income and expenditure that is not attributed to a Schedule VII item.' },
};

FIN.ERAS = {
  mdg: { label:'Millennium Development Goals', span:'2000\u20132015', color:'#0E5565' },
  sdg: { label:'Sustainable Development Goals', span:'2016 onwards',  color:'#556223' },
};

// Default tags per funder. Overridden per project where a single funder
// supported work in more than one programme (see PROJECT_TAGS).
// confirm:true means this funder's classification was checked against actual grant or project
// evidence. SSK was confirmed against its signed May 2010 assignment and TOR; see its audit note
// below. The flag drives "Mapping under confirmation" in the explorer for any future unresolved entry.
// Audit trail: EVIDENCE_VAULT/_HANDOFF_OUTPUT/funder_tags_audit.md (2026-08-21).
// unicef: FIN.SOURCES has no distinct UN/multilateral bucket, so 'un' funders are
// filed under 'institutional' (its UNICEF-CPP/nutrition work ran as bilateral
// partnership MoUs, not a sovereign statutory scheme) rather than 'government'.
// laher: corrected from Development/iii to Survival/i — the real project is water
// disinfection/disease-prevention, not a rights/governance intervention.
// world_neighbors: tag prepared ahead of any FIN.YEARS entry — no signed grant
// agreement or UC has been located yet for this funder (only a proposal budget and
// a budget-ceiling email), so no dollars are attributed to it in FIN.YEARS. This
// entry is inert until real audited figures exist.
FIN.FUNDER_TAGS = {
  // Every occurrence of __fcra_general across all 20 years is DEHAT's own core FCRA-account operating
  // cost — bank interest, audit fees, bank charges, general operations (verified line by line: never a
  // large unidentified grant, always a small institutional running cost). That classification is genuinely
  // settled, even though no single external funder is attached to it, so it is marked confirmed rather than
  // "Mapping Under Confirmation." This does NOT apply to __balance, which represents a real amount
  // whose funder AND theme are still genuinely unknown — that stays unmapped.
  __fcra_general:   { prog:'cross',      uncrc:'Participation', csr:'none', source:'institutional', confirm:true },
  caritas_germany:  { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  caritas_india_fcra:{ prog:'protection', uncrc:'Protection',  csr:'iii',  source:'institutional', confirm:true },
  caritas_india_inr:{ prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  sciaf:            { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  ksc_foundation:   { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  sanlaap:          { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  childline_india:  { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  erase_poverty:    { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  light_a_lamp:     { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  dasra:            { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'institutional', confirm:true },
  shes_the_first:   { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'institutional', confirm:true },
  iimpact:          { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'philanthropy',  confirm:true },
  centum:           { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'csr',           confirm:true },
  tmn:              { prog:'climate',    uncrc:'Development',  csr:'iv',   source:'institutional', confirm:true },
  vidhya:           { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'institutional', confirm:true },
  charity_science:  { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'institutional', confirm:true },
  geeta_karnal:     { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'csr',           confirm:true },
  birlasoft:        { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'csr',           confirm:true },
  ipartner:         { prog:'protection', uncrc:'Protection',   csr:'iii',  source:'institutional', confirm:true },
  tara_akshar:      { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'institutional', confirm:true },
  sit_world:        { prog:'leadership', uncrc:'Participation',csr:'ii',   source:'institutional', confirm:true },
  google:           { prog:'cross',      uncrc:'Participation',csr:'none', source:'csr',           confirm:true },
  acc:              { prog:'leadership', uncrc:'Development',  csr:'ii',   source:'csr',           confirm:true },
  appi:             { prog:'climate',    uncrc:'Development',  csr:'iv',   source:'philanthropy',  confirm:true },
  pani:             { prog:'climate',    uncrc:'Development',  csr:'iv',   source:'institutional', confirm:true },
  edele_give:       { prog:'cross',      uncrc:'Development',  csr:'none', source:'philanthropy',  confirm:true },
  jica:             { prog:'climate',    uncrc:'Development',  csr:'iv',   source:'government',    confirm:true },
  nabard:           { prog:'rights',     uncrc:'Development',  csr:'x',    source:'government',    confirm:true },
  afc:              { prog:'rights',     uncrc:'Development',  csr:'x',    source:'institutional', confirm:true },
  primenet:         { prog:'rights',     uncrc:'Development',  csr:'x',    source:'institutional', confirm:true },
  upvan:            { prog:'rights',     uncrc:'Participation',csr:'x',    source:'institutional', confirm:true },
  // Confirmed via the signed assignment form "Sahbhagi Shikshan Kendra May 2010.pdf" (Ref.
  // SSK/Finance/DMRC/04/10-11, 15.05.2010): "Formation of Community Based Disaster Management Committees
  // (CBDMC) in 2 selected flood prone Gram Panchayat of Mihinpurwa block, Bahraich" — five task forces
  // (Early Warning, Search & Rescue, First Aid, WATSAN & Hygiene, Social Inclusion). Genuine disaster-risk-
  // reduction/relief work, not generic institutional training despite the org's name. Tagged to match this
  // dataset's existing disaster/relief-work convention (the covid|ration|relief keyword override), and
  // Schedule VII item xii is a precise match: "Disaster management, relief, rehabilitation, reconstruction".
  ssk:              { prog:'rights',     uncrc:'Survival',     csr:'xii',  source:'institutional', confirm:true },
  baif:             { prog:'rights',     uncrc:'Survival',     csr:'i',    source:'institutional', confirm:true },
  igsss:            { prog:'rights',     uncrc:'Survival',     csr:'i',    source:'institutional', confirm:true },
  aih:              { prog:'rights',     uncrc:'Survival',     csr:'i',    source:'institutional', confirm:true },
  unicef:           { prog:'rights',     uncrc:'Survival',     csr:'i',    source:'institutional', confirm:true },
  cry:              { prog:'rights',     uncrc:'Protection',   csr:'iii',  source:'philanthropy',  confirm:true },
  dfid_pacs:        { prog:'rights',     uncrc:'Participation',csr:'x',    source:'government',    confirm:true },
  action_aid:       { prog:'rights',     uncrc:'Participation',csr:'ii',   source:'institutional', confirm:true },
  kabir:            { prog:'rights',     uncrc:'Participation',csr:'x',    source:'institutional', confirm:true },
  ssa:              { prog:'rights',     uncrc:'Development',  csr:'ii',   source:'government',    confirm:true },
  sdtt:             { prog:'rights',     uncrc:'Development',  csr:'iii',  source:'philanthropy',  confirm:true },
  sahyog:           { prog:'leadership', uncrc:'Participation',csr:'iii',  source:'institutional', confirm:true },
  laher:            { prog:'rights',     uncrc:'Survival',     csr:'i',    source:'institutional', confirm:true },
  jagdeep_lohani:   { prog:'rights',     uncrc:'Participation',csr:'x',    source:'individuals',   confirm:true },
  individuals:      { prog:'cross',      uncrc:'Participation',csr:'none',source:'individuals',   confirm:true },
  world_neighbors:  { prog:'climate',    uncrc:'Development',  csr:'iv',   source:'institutional', confirm:true },
  rilm:             { prog:'leadership',  uncrc:'Development',  csr:'ii',   source:'institutional', confirm:true },
};

// Project / note keyword overrides, tested in order (first match wins).
FIN.PROJECT_TAGS = [
  { match:/malnutrition|suposhan|su-poshan|nutrition|immuni/i, tags:{ prog:'rights', uncrc:'Survival', csr:'i' } },
  // Word boundaries are essential here: bare /ration/ also matches "administration" and used to
  // misclassify two general-administration lines as COVID/relief expenditure.
  { match:/\bcovid\b|\bration\b|\brelief\b/i,               tags:{ prog:'rights', uncrc:'Survival', csr:'xii' } },
  { match:/sujlam|sujalam|water|forest|uppfmpap|jica/i,        tags:{ prog:'climate', uncrc:'Survival', csr:'iv' } },
  { match:/fasal/i,                                            tags:{ prog:'climate', uncrc:'Development', csr:'iv' } },
  { match:/azadi|swabhiman|swaraksha|surokhit|trafficking|bal prahaari|childline|child line|access to justice|voice (of|for) change|protection/i,
                                                               tags:{ prog:'protection', uncrc:'Protection', csr:'iii' } },
  { match:/chni|health/i,                                      tags:{ prog:'rights', uncrc:'Survival', csr:'i' } },
  { match:/gpdp|panchayat|direct democracy|research/i,         tags:{ prog:'rights', uncrc:'Participation', csr:'x' } },
  { match:/skill|scdp|garment|vocation|worksskill|workskill/i, tags:{ prog:'leadership', uncrc:'Development', csr:'ii' } },
  { match:/school|educat|vidhya|vidya|library|rgcep|scdep|rilm|literacy|panchi|scholar/i,
                                                               tags:{ prog:'leadership', uncrc:'Development', csr:'ii' } },
  { match:/women|rural women|erw|gender/i,                     tags:{ prog:'rights', uncrc:'Development', csr:'iii' } },
];

FIN.eraFor = function(fy){ return parseInt(String(fy).slice(0,4),10) >= 2016 ? 'sdg' : 'mdg'; };

FIN.tagsFor = function(funderKey, text){
  var base = FIN.FUNDER_TAGS[funderKey] || { prog:'cross', uncrc:'Participation', csr:'none', source:'institutional', unmapped:true };
  var out = { prog:base.prog, uncrc:base.uncrc, csr:base.csr, source:base.source, confirm:!!base.confirm, unmapped:!!base.unmapped };
  var s = String(text || '');
  if (s) for (var i=0;i<FIN.PROJECT_TAGS.length;i++){
    if (FIN.PROJECT_TAGS[i].match.test(s)){ var t = FIN.PROJECT_TAGS[i].tags; out.prog=t.prog; out.uncrc=t.uncrc; out.csr=t.csr; break; }
  }
  return out;
};


// ---- PUBLIC DISPLAY LAYER ----------------------------------------------------------
// Internal keys and audit-workflow notes must never reach a visitor. Placeholder funder
// keys get a plain-English name; notes are only shown when they describe the work.
FIN.PLACEHOLDER_NAMES = {
  __fcra_general:     'Foreign Contribution Account \u2014 General Fund',
  __fcra_grants:      'Foreign Contribution Grants \u2014 Funder Not Itemised',
  __inr_grants:       'Domestic Grants \u2014 Funder Not Itemised',
  __mixed:            'Several Grants \u2014 Combined in the Statement',
  __sujlam_suflam:    'Sujalam Sufalam Water and Livelihoods Programme',
  __balance:          'Other Income Not Itemised by Funder',
  __unitemised_spend: 'Spend Not Itemised by Funder',
  __fcra_other_funds: 'Foreign Contribution — Other Funds (Residual Account)',
};
FIN.displayName = function(k){
  if (!k) return '\u2014';
  if (FIN.FUNDERS[k] && FIN.FUNDERS[k].name) return FIN.FUNDERS[k].name;
  if (FIN.PLACEHOLDER_NAMES[k]) return FIN.PLACEHOLDER_NAMES[k];
  return String(k).replace(/^__/,'').replace(/_/g,' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
};
// Internal bookkeeping language that must not be published.
FIN.INTERNAL_NOTE = /ocr|pending|not itemised|itemis(ed|ation) |digitis|low-confidence|confidence|supersede|per schedule|opening bal|closing bal|carryover only|receivable|refunded|tranche|rtgs|net of|estimated as|xlsx|scan/i;
FIN.publicLabel = function(entry){
  if (entry && entry.project) return String(entry.project);
  var n = entry && entry.note ? String(entry.note) : '';
  if (!n) return '';
  n = n.split(';')[0].trim();
  n = n.replace(/\s*\([^)]*(?:not itemised|funder|OCR|pending|non-cash|carryover)[^)]*\)/ig, '').trim();
  n = n.replace(/\s*[\u2014-]?\s*grant from (mr\.?|mrs\.?|ms\.?|shri|smt\.?)\s+[^,;]+$/i, '').trim();
  n = n.replace(/\s*[\u2014-]?\s*IN-?KIND.*$/i, '').trim();
  n = n.replace(/\s*\u20b9\s?[\d.,]+\s?(L|Cr|lakh|crore)?\.?$/i, '').trim();
  n = n.replace(/[\s,;:\u2014-]+$/, '').trim();
  if (!n || FIN.INTERNAL_NOTE.test(n)) return '';
  return n;
};

// Flatten every audited line into a taggable flow record.
//   basis 'received' — grants + interest received in the year
//   basis 'utilised' — expenditure applied in the year. Where the audited
//   statement does not itemise spend by project, the audited utilised total is
//   apportioned pro-rata across that year's funders and flagged est:true.
FIN.flows = function(basis){
  var out = [];
  FIN.YEARS.forEach(function(y){
    var era = FIN.eraFor(y.fy);
    var nm = FIN.displayName;
    if (basis === 'received'){
      var lineSum = 0;
      (y.received||[]).forEach(function(r){
        var amt = (r.grant||0) + (r.interest||0);
        if (!amt) return;
        lineSum += amt;
        var t = FIN.tagsFor(r.funder, (r.project||'') + ' ' + (r.note||''));
        out.push({ fy:y.fy, era:era, amt:amt, regime:r.regime, funderKey:r.funder, funder:nm(r.funder),
                   project:FIN.publicLabel(r), prog:t.prog, uncrc:t.uncrc, csr:t.csr, source:t.source,
                   confirm:t.confirm, unmapped:t.unmapped, inKind:!!r.inKind, admin:null, est:false, flex:r.flex });
      });
      // Tie to the audited receipts total: any part of the audited figure that the
      // statement does not attribute to a named funder is shown as its own line,
      // so the explorer and the headline figures agree to the rupee.
      var diff = (y.receivedTotal != null) ? (y.receivedTotal - lineSum) : 0;
      if (Math.abs(diff) > 1){
        out.push({ fy:y.fy, era:era, amt:diff, regime:'INR', funderKey:'__balance',
                   funder:FIN.PLACEHOLDER_NAMES.__balance,
                   project: diff > 0 ? 'Other audited income for the year' : 'Adjustment to the audited receipts total \u2014 under reconciliation',
                   prog:'cross', uncrc:'Participation', csr:'none', source:'institutional',
                   confirm:false, unmapped:true, inKind:false, admin:null, est:true, flex:null });
      }
    } else {
      var spend = (y.spend||[]).filter(function(s){ return s.total; });
      var spendSum = spend.reduce(function(a,s){ return a + (s.total||0); }, 0);
      var total = y.utilisedTotal != null ? y.utilisedTotal : spendSum;
      if (spend.length){
        spend.forEach(function(s){
          var t = FIN.tagsFor(s.funder, (s.project||'') + ' ' + (s.note||''));
          out.push({ fy:y.fy, era:era, amt:s.total, regime:s.regime, funderKey:s.funder, funder:nm(s.funder),
                     project:FIN.publicLabel({ project:s.project, note:s.note }), prog:t.prog, uncrc:t.uncrc, csr:t.csr, source:t.source,
                     confirm:t.confirm, unmapped:t.unmapped, inKind:!!s.inKind,
                     admin:(s.admin == null ? null : s.admin), adminChecked:!!s.adminChecked, est:false, flex:null });
        });
        // Named spend[] lines don't always cover the full audited utilised total for a year (e.g.
        // FY2010-11, where three projects' shares were itemised via a Form 10B disclosure but the
        // rest of that year's spend never was). The genuine shortfall is its own honest "not
        // itemised" residual — it must never silently discard the real, itemised lines above and
        // re-apportion the whole year proportionally across received-side funders instead, which
        // would fabricate a specific per-funder utilised split that no audited document supports.
        var residual = total - spendSum;
        if (residual > 1){
          out.push({ fy:y.fy, era:era, amt:residual, regime:'INR', funderKey:'__unitemised_spend',
                     funder:FIN.PLACEHOLDER_NAMES.__unitemised_spend,
                     project:'Spend not itemised by project in the audited statement',
                     prog:'cross', uncrc:'Participation', csr:'none', source:'institutional',
                     confirm:false, unmapped:true, inKind:false, admin:null, est:true, flex:null });
        }
      } else {
        var recs = (y.received||[]).filter(function(r){ return (r.grant||0)+(r.interest||0) > 0; });
        var recSum = recs.reduce(function(a,r){ return a + (r.grant||0) + (r.interest||0); }, 0) || 1;
        if (!total) return;
        recs.forEach(function(r){
          var share = ((r.grant||0)+(r.interest||0)) / recSum;
          var t = FIN.tagsFor(r.funder, (r.project||'') + ' ' + (r.note||''));
          out.push({ fy:y.fy, era:era, amt:total * share, regime:r.regime, funderKey:r.funder, funder:nm(r.funder),
                     project:FIN.publicLabel(r), prog:t.prog, uncrc:t.uncrc, csr:t.csr, source:t.source,
                     confirm:t.confirm, unmapped:t.unmapped, inKind:!!r.inKind, admin:null, est:true, flex:r.flex });
        });
      }
    }
  });
  return out;
};


// ---- LEGAL IDENTITY ----------------------------------------------------------------
// Every field below is taken from a primary document held in assets/docs/.
FIN.IDENTITY = {
  intro: 'DEHAT publishes its full legal identity so that any investment partner, auditor, journalist or community member can verify the organisation independently, without asking us first.',
  rows: [
    { k:'Legal name', v:'Developmental Association for Human Advancement', note:'Known publicly as DEHAT.' },
    { k:'Legal form', v:'Society registered under the Societies Registration Act, 1860', note:'Not a company and not a public trust.' },
    { k:'Registration number', v:'370/2000-2001', note:'Registrar of Firms, Societies and Chits, Uttar Pradesh. Registered 21 August 2000; renewal issued 26 August 2025 and valid to 2030.' },
    { k:'Registered office', v:'\u201cSewakunj\u201d, Maseehabad Road via Kati Chauraha, Huzoorpur Marg, Bahraich, Uttar Pradesh 271801', note:'The registered office is also the working head office.' },
    { k:'Permanent Account Number', v:'AAAAD3793Q', note:'Nature of activities recorded by the Income Tax Department as charitable.' },
    { k:'Tax Deduction Account Number', v:'LKND07117F', note:'Allotted 28 March 2012.' },
    { k:'Income-tax registration', v:'12AB(1)(b) \u00b7 AAAAD3793Q25LK01', note:'Form 10AD order of 17 February 2026, valid for assessment years 2027-28 to 2036-37.' },
    { k:'Donor deduction approval', v:'80G(5) \u00b7 AAAAD3793Q25LK02', note:'Form 10AD order of 17 February 2026, valid for assessment years 2027-28 to 2031-32.' },
    { k:'Foreign contribution', v:'Foreign Contribution (Regulation) Act registration 136260010', note:'Renewal valid five years from 1 October 2023. Foreign contribution is received only in the designated account at State Bank of India, 11 Sansad Marg, New Delhi.' },
    { k:'Corporate social responsibility', v:'CSR00001181', note:'Form CSR-1 approved by the Registrar of Companies on 8 April 2021.' },
    { k:'Statutory auditor', v:'Subhash Mishra and Company, Lekhraj Khazana, Indira Nagar, Lucknow', note:'Named as the organisation\u2019s auditor in the November 2016 organisation profile. The current appointment is confirmed each year by the Governing Board on acceptance of the statutory audit.' },
    { k:'Banking history', v:'Punjab National Bank, Raja Heera Singh Market branch, Bahraich', note:'The national-fund and earlier foreign-contribution accounts were both held here (accounts 0072000100606833 and 0072000100151405, per the November 2016 profile). Foreign contribution moved to the State Bank of India designated account at 11 Sansad Marg, New Delhi, under the amended Foreign Contribution (Regulation) Act rules.' },
    { k:'Founder and chief functionary', v:'Dr Jitendra Chaturvedi', note:'The current list of office bearers is filed each year in the Society\u2019s annual return to the Registrar.' },
  ],
};

FIN.ACCOUNTS = {
  intro: 'Two accounts, and the line between them is a legal one. Domestic contributions go to the IDFC FIRST account in Bahraich. Foreign contributions may only be received in the designated State Bank of India account in New Delhi \u2014 no other account may take them. Both are published in full so you can remit without asking us first.',
  holder: 'Developmental Association for Human Advancement',
  list: [
    {
      key: 'inr', kind: 'Domestic contributions', tone: 'olive',
      bank: 'IDFC FIRST Bank',
      note: 'For contributions from within India.',
      rows: [
        { k:'Account name', v:'Developmental Association for Human Advancement DEHAT' },
        { k:'Account number', v:'10241380684', mono:true },
        { k:'Branch', v:'Bahraich Branch' },
        { k:'Branch address', v:'Ground Floor, 220A, Mohalla Akbarpura Nai, Bahraich 271801, Uttar Pradesh' },
        { k:'IFSC', v:'IDFB0021962', mono:true },
        { k:'Transfer', v:'National Electronic Funds Transfer (NEFT), Real Time Gross Settlement (RTGS) or Immediate Payment Service (IMPS)' },
      ],
    },
    {
      key: 'fcra', kind: 'Foreign contributions', tone: 'teal',
      bank: 'State Bank of India',
      note: 'The designated account under the Foreign Contribution (Regulation) Act. Foreign contribution received anywhere else would be unlawful.',
      rows: [
        { k:'Account name', v:'Developmental Association for Human Advancement' },
        { k:'Account number', v:'40117125170', mono:true },
        { k:'Branch', v:'New Delhi Main Branch \u00b7 00691' },
        { k:'Branch address', v:'11 Sansad Marg, New Delhi 110001, India' },
        { k:'IFSC', v:'SBIN0000691', mono:true },
        { k:'SWIFT / BIC', v:'SBININBB104', mono:true, note:'Not printed on the cancelled cheque \u2014 confirm against a bank letter before publishing.' },
        { k:'MICR', v:'110002087', mono:true },
      ],
    },
  ],
};

// ---- GOVERNANCE STRUCTURE ----------------------------------------------------------
// Source: DEHAT Organisation Structure v.3, as on 10 May 2022 (one-page chart).
// Every node carries two readings of the same line: the authority passed DOWN it,
// and the accountability owed back UP it. The site lets a reader flip between them.
FIN.GOVERNANCE = {
  intro: 'DEHAT is a registered Society, so it is governed by its members and not by its staff. Every line in this chart runs both ways. Read it downward and it is a delegation of authority; read it upward and it is a line of accountability. Flip the direction, or click any body to trace its chain. Two standing committees carry the executive work under written terms of reference: the Strategic Leadership Team takes what concerns the institution, the Core Team takes what concerns the programmes. Below them the chart is drawn in two-headed arrows \u2014 anchor to anchor, anchor to project, project to grassroots, grassroots to community \u2014 and one line runs the full height of it, connecting the Strategic Leadership Team directly to the community bodies at the base.',
  source: 'Organisation Structure version 3, as on 10 May 2022, with the Terms of Reference for the Strategic Leadership Team and the Core Team, May 2022.',
  note: 'The names of General Body and Governing Board members are filed each year in the Society\u2019s annual return to the Registrar of Societies, where they are a matter of public record.',
  nodes: [
    { id:'gb', title:'General Body', count:'11 members', color:'#4F0E73', role:'Members of the Society',
      down:'The Society\u2019s ultimate authority. It elects the Governing Board, approves the Memorandum of Association and the By-Laws, and receives the audited accounts each year.',
      up:'Answerable to no one inside DEHAT, and outside it to the Registrar of Societies through the annual return.',
      gives:'Elects the Governing Board', owes:'Files the annual return' },
    { id:'gov', parent:'gb', title:'Governing Board', count:'7 members', color:'#0E5565', role:'Elected members',
      down:'Holds the organisation between General Body meetings: policy, the annual budget, the appointment of the Executive Director, and formal acceptance of the statutory audit.',
      up:'Elected by the General Body, which can replace it, and reports to it with the audited accounts.',
      gives:'Appoints the Executive Director', owes:'Reports to the General Body' },
    { id:'adv', parent:'slt', kind:'advisory', title:'Advisory Committee', count:'Independent advisers with long experience in DEHAT\u2019s thematic areas', color:'#EAAE28', role:'External advisers',
      down:'Counsels the Strategic Leadership Team on programme direction and technical questions. It advises; it does not vote and it does not instruct.',
      up:'Sits outside the line of command, so it carries no executive responsibility and cannot be held to delivery.',
      gives:'Advice, not instruction', owes:'No line responsibility' },
    { id:'slt', parent:'gov', title:'Strategic Leadership Team', color:'#D2305C', role:'Executive leadership \u00b7 standing committee',
      count:'Anchored by the Executive Director (Secretary)',
      members:['Executive Director (Secretary)','Programme Anchors','Chief Finance Officer'],
      down:'Holds the institution. It develops and approves institutional and programmatic plans and budgets, approves policy, approves the structures and systems the organisation runs on, consults and approves every partnership or agreement DEHAT enters, strategises fundraising and oversees donor management, and takes the final decision on recruitment at Programme Anchor level and above. Its stated process is to inform, consult, decide. The Executive Director signs every filing made in DEHAT\u2019s name.',
      up:'Appointed by the Governing Board and answerable to it, and constituted to hold strategic decisions in the absence of an active Governing Board. The Executive Director sits on the Board as Secretary, so the Board hears the executive account first-hand, and each person accountable for an action owes a report on it.',
      gives:'Sets strategy and holds delivery', owes:'Answers to the Governing Board' },
    { id:'core', parent:'slt', title:'Core Team', color:'#556223', role:'Operating core \u00b7 standing committee',
      count:'Anchored by the Chief Operating Officer',
      members:['Chief Operating Officer','Executive Director (Secretary)','Programme Director','Programme Anchors','Joint Reflection, Learning and Change Anchor','Social Enterprise Development Anchor','Management Information Systems Officer','Chief Finance Officer'],
      down:'Holds the programmes. It oversees and tracks implementation against the Annual Plan, oversees the people the plan needs, tracks budget against utilisation every month, and oversees the timely completion of programmatic compliances.',
      up:'Answerable to the Strategic Leadership Team for delivery against the plan the Board approved, and for the accuracy of what is measured. Anything it cannot settle is passed up to the Strategic Leadership Team.',
      gives:'Turns strategy into operations', owes:'Answers for delivery and for the numbers' },
    { id:'prog_team', parent:'core', kind:'wing', title:'Programme Implementation Team', color:'#D2305C', role:'Delivery',
      down:'Owns everything a community actually sees: programme design, project teams, and the quality of what is delivered in each block.',
      up:'Reports coverage, results and failure honestly enough that the Board can act on it.',
      gives:'Runs the programmes', owes:'Reports what was delivered' },
    { id:'a_sol', parent:'prog_team', title:'School of Leadership Anchor', count:'Programme Anchor', color:'#EAAE28', role:'Programme anchor',
      down:'Holds the leadership programme end to end \u2014 design, curriculum, the fellows and the collectives it builds.',
      up:'Accountable to the Core Team for the programme\u2019s quality, spend and reach.',
      gives:'Holds one programme', owes:'Accountable for that programme' },
    { id:'a_re', parent:'prog_team', title:'Rights and Entitlements Anchor', count:'Programme Anchor', color:'#0E9CB8', role:'Programme anchor',
      down:'Holds the entitlements work: which schemes, which blocks, which households, and what counts as a claim actually settled.',
      up:'Accountable to the Core Team for the programme\u2019s quality, spend and reach.',
      gives:'Holds one programme', owes:'Accountable for that programme' },
    { id:'a_cj', parent:'prog_team', title:'Climate Justice Anchor', count:'Programme Anchor', color:'#556223', role:'Programme anchor',
      down:'Holds the climate and livelihoods work with the farmer collectives it is built around.',
      up:'Accountable to the Core Team for the programme\u2019s quality, spend and reach.',
      gives:'Holds one programme', owes:'Accountable for that programme' },
    { id:'a_hp', parent:'prog_team', title:'Human Protection Anchor', count:'Programme Anchor', color:'#A92719', role:'Programme anchor',
      down:'Holds the protection work \u2014 trafficking, child marriage, rescue and restoration \u2014 and the safeguarding standard the rest of the organisation is held to.',
      up:'Accountable to the Core Team for the programme\u2019s quality, spend and reach, and answerable first to the child.',
      gives:'Holds one programme', owes:'Answerable first to the child' },
    { id:'proj', parent:'prog_team', title:'Project Anchors', count:'Added as geography and grant design require', color:'#D2305C', role:'Project line',
      down:'Holds a single grant end to end within a programme: work plan, budget, reporting and the promises made to the funder.',
      up:'Accountable to the programme anchor for that project\u2019s targets, spend and reports.',
      gives:'Holds one grant', owes:'Accountable for targets and spend' },
    { id:'grass', parent:'proj', title:'Grassroots Anchors', count:'Block and cluster level', color:'#A92719', role:'Block level',
      down:'Runs the work where it happens and holds the relationship with block-level officials.',
      up:'Reports what is really happening in the villages, including what is not working.',
      gives:'Runs the work in a block', owes:'Reports what is really happening' },
    { id:'crp', parent:'comm', title:'Community Resource Persons', count:'Drawn from the villages served', color:'#556223', role:'Village level',
      down:'The daily contact between DEHAT and a household, and the reason the work reaches the last village. In the chart they sit inside Community Leaders, not below it.',
      up:'Answerable first to the community they come from and live in, and only then to the office.',
      gives:'Daily contact with households', owes:'Answers to their own village' },
    { id:'fin_team', parent:'prog_team', kind:'wing', title:'Finance and Admin Team', color:'#0E5565', role:'Money, people and systems',
      members:['Chief Finance Officer','Management Information Systems Officer','Administration and human resources'],
      down:'Controls how money enters, is held and is spent \u2014 including the separate handling the Foreign Contribution (Regulation) Act requires \u2014 and holds recruitment, records and office administration.',
      up:'Produces the books the statutory auditor examines and the Board accepts, and is answerable for whether policy on paper is policy in practice.',
      gives:'Controls the money and the records', owes:'Produces the audited books' },
  ],
  community: {
    title:'Community Leaders',
    count:'Community Resource Persons \u00b7 Child Parliaments \u00b7 Youth Collectives \u00b7 Rights-based Community Based Organisations \u00b7 Constitutional Fellows',
    color:'#EAAE28',
    down:'Not beneficiaries of the structure but the base of it. These bodies set priorities, review the work in their own villages and carry demands into public systems.',
    up:'The chart ends here on paper and begins here in practice. If the work fails a village, this is where it is said first.',
  },
};


// ---- WORKFORCE ---------------------------------------------------------------------
// Source: DEHAT organisation profile, November 2016, section 1.13 Staff Strength.
FIN.WORKFORCE = {
  intro: 'In 2007–08 DEHAT had 16 people on its team — a chief executive, an accountant, and fourteen field and community staff, four of them part-time. By November 2016 it had 147, 77 of them women. The shape matters more than the total: 92 of the 147 were community-level workers and field animators recruited from the villages the programmes serve, and 67 of those 92 were women. The organisation is widest at the point closest to the community and narrowest at the top.',
  total: '147 staff · 70 men, 77 women',
  note: 'The table is published as a 2016 figure, and the 2007–08 comparison is drawn from that year’s annual report, which names all sixteen. A current staff table will replace it once the payroll register has been reconciled. Qualification bands are reproduced as recorded in the profile.',
  rows: [
    { role:'Project Director', qual:'Postgraduate or professional, 18 years’ experience', m:1, w:0, group:'Field' },
    { role:'Project Coordinators and Managers', qual:'Postgraduate or professional', m:8, w:1, group:'Field' },
    { role:'Associate and Block Coordinators', qual:'Graduate, postgraduate or professional', m:14, w:4, group:'Field' },
    { role:'Field Coordinators', qual:'Graduate or postgraduate', m:16, w:5, group:'Field' },
    { role:'Documentation Officers', qual:'Graduate or postgraduate', m:2, w:0, group:'Field' },
    { role:'Community-level workers and field animators', qual:'Matriculate and above', m:25, w:67, group:'Field' },
    { role:'Accountant', qual:'Postgraduate with accountancy qualification', m:1, w:0, group:'Office' },
    { role:'Assistant Accountants', qual:'Graduate and above', m:2, w:0, group:'Office' },
    { role:'Office Assistant', qual:'Intermediate and above', m:1, w:0, group:'Office' },
  ],
};

// ---- WHO WE ANSWER TO --------------------------------------------------------------
FIN.ACCOUNTABILITY = {
  intro: 'Accountability upward to investment partners is the easy half. These are the four constituencies DEHAT considers itself answerable to, and the mechanism that makes each one real.',
  parties: [
    { title:'Children, first', color:'#D2305C',
      body:'No child is identified on this website. Names, photographs, case details and traceable combinations of identity and village are withheld unless there is documented informed consent and a completed safeguarding review \u2014 and even then, only where publication serves the child.',
      how:'Safeguarding review before publication' },
    { title:'The Communities we work with', color:'#556223',
      body:'Child Parliaments, youth collectives, women farmers\u2019 Aajeevika Adhikar Sangathans and their clusters and federation review the work in their own villages and set what comes next. Village and Gram Sabha processes are where the programme is judged.',
      how:'Community Institutions and Gram Sabha Review' },
    { title:'Government and Regulators', color:'#0E5565',
      body:'The Registrar of Societies, the Income Tax Department, the Ministry of Home Affairs under the Foreign Contribution (Regulation) Act and the Ministry of Corporate Affairs. Each filing in the compliance calendar above is a point at which DEHAT is examined.',
      how:'Statutory Filings and Inspection' },
    { title:'Social Investors', color:'#EAAE28',
      body:'Every grant carries a reporting obligation, an audited utilisation statement and, in several cases, an external evaluation. Where a figure is investor-reported or implementer-reported rather than independently verified, this website says so on the project entry itself.',
      how:'Audited Utilisation and Grant Reporting' },
  ],
  raise: {
    title:'Raise a concern',
    body:'Anyone \u2014 a community member, a colleague, a partner or a member of the public \u2014 can raise a concern about DEHAT\u2019s conduct, safeguarding practice or use of funds. Write, call or come to the registered office. Concerns about the conduct of staff or the use of funds are placed before the Governing Board.',
    email:'joinus@dehatindia.org', phone:'+91 94150 54079',
    address:'\u201cSewakunj\u201d, Maseehabad Road via Kati Chauraha, Huzoorpur Marg, Bahraich, Uttar Pradesh 271801',
  },
};

// ---- PUBLISHING AND EVIDENCE STANDARDS ---------------------------------------------
// The editorial rules the programme and project pages are written under.
FIN.STANDARDS = {
  intro: 'These are the rules the programme pages on this website are written under. They exist because the easiest way for a non-profit to mislead is not to lie, but to let a proposal read like a result.',
  rules: [
    { k:'A proposal is not a result', v:'A target, an output, a budget line or an implementer-reported figure is never presented as a verified outcome. Where a number is donor-reported or programme-reported, the entry says so.' },
    { k:'Money is never quietly added up', v:'Currency values are not summed across currencies or converted without a dated exchange-rate method, and a grant shared across themes is counted once only.' },
    { k:'One project, one place', v:'Each project is published under a single primary programme. A cross-tag shows a relationship; it never creates a second investment.' },
    { k:'No child is identifiable', v:'No names, telephone numbers, case details or traceable combinations of child or family identity and village are published without documented informed consent and safeguarding review.' },
    { k:'Schedule VII mapping is editorial', v:'The corporate social responsibility mapping is a thematic reading, not a legal opinion on eligibility. Section 135 and Schedule VII took effect on 1 April 2014, so any tag on an earlier project is retrospective.' },
    { k:'The right development framework for the period', v:'Millennium Development Goals for projects ending before 2016, Sustainable Development Goals from 2016, and a transition note where a project crosses the boundary.' },
    { k:'Social investor, and the legal name too', v:'\u201cSocial investor\u201d is the preferred public term, but the legal name on an agreement is retained wherever accuracy requires it.' },
  ],
};

// ---- OPEN REGISTER -----------------------------------------------------------------
// What is deliberately not published yet, and why.
FIN.OPEN_REGISTER = {
  intro: 'A transparency page that only shows what is settled is a marketing page. This is the working list of what DEHAT knows about but is not publishing yet, and the evidence each item is waiting for.',
  items: [
    { k:'SWADHIKAR', v:'A 2026-27 proposal exists. No executed funding approval or implementation evidence has been located, so there is no project page.' },
    { k:'Youth Constitutional Fellowship', v:'A curriculum and concept record exists. No signed award or verified implementation record has been located.' },
    { k:'Surokhit Shaishav Phase III', v:'A submitted proposal only. It is not described as approved or active anywhere on this site.' },
    { k:'Thin-evidence archival partnerships', v:'PANI, Rotary, PGSS, Kabir, JAGDEEP, ISMW, BRIAT, SAHAYOG and similar files need agreement and report reconciliation before they become project entries.' },
    { k:'Five funder mappings under confirmation', v:'EdelGive GROW, GEETA Karnal, iPartner, Rotary and Sahyog are marked \u201cmapping under confirmation\u201d in the explorer while the signed agreements are re-read.' },
    { k:'Unallocated older grant cycles', v:'The sum of published project budgets is lower than audited twenty-year income, because several older grant cycles are not yet attributed to a named project. The difference is shown in the explorer rather than hidden.' },
    { k:'Headline impact counters', v:'Internal presentation figures are not published as verified results until they are matched to project records, a stated time period and a deduplication method.' },
    { k:'Named case stories', v:'Legacy stories contain identifiable children and community members. They stay unpublished until consent, safeguarding review and a current factual check are complete.' },
  ],
};

// ---- INDEPENDENT REVIEW ------------------------------------------------------------
FIN.REVIEW = {
  intro: 'Work that has been examined by someone other than DEHAT.',
  items: [
    { title:'Statutory audit', by:'Madhuresh Agrahari & Associates, Chartered Accountants', when:'Every financial year', color:'#556223',
      body:'Signed audited statements from FY2005-06 to FY2024-25, with foreign contribution accounted and audited separately from domestic funds. Each report carries the auditor\u2019s Unique Document Identification Number.' },
    { title:'Swaraksha external evaluation', by:'Shanto Baksi, independent evaluator', when:'November 2018', color:'#D2305C',
      body:'An evaluation of the anti-trafficking programme covering May 2017 to October 2018. It named DEHAT as the Bahraich partner, found a credible early journey and recommended stronger documentation, collaboration and sustainability planning.' },
    { title:'Baal Prahari project assessment', by:'Phoebe Rawell for iPartner India', when:'June 2017', color:'#0E5565',
      body:'An external assessment of the border anti-trafficking prevention work in Bahraich district.' },
    { title:'Due-diligence validation', by:'Charities Aid Foundation India', when:'On file', color:'#4F0E73',
      body:'An independent check of governance, financial management and statutory compliance.' },
    { title:'Empanelment', by:'Tata Institute of Social Sciences', when:'On file', color:'#0E9CB8',
      body:'Empanelled as an implementing partner for public sector undertaking corporate social responsibility programmes.' },
    { title:'Listing', by:'BSE Sammaan', when:'Registration ID 6341', color:'#EAAE28',
      body:'Listed on the Bombay Stock Exchange\u2019s vetted registry connecting corporates with credible non-profits, with audited statements, governing document, tax and Foreign Contribution (Regulation) Act certificates submitted.' },
  ],
};
