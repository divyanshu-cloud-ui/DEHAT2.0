// DEHAT financial transparency dataset — audited balance sheets FY2005-06 → FY2024-25.
// Source of truth: signed, audited PDFs (Madhuresh Agrahari & Associates, CA). Where a
// machine-readable soft copy exists (FY2024-25 .xlsx) it is used for exact figures and
// cross-checked against the signed PDF; the signed PDF wins on any conflict.
//
// Amounts are in INR (₹), rupees (not lakhs). "received" = cash/accrual grant RECEIVED
// during the year (Receipts & Payments + Grant Schedules); "utilised" = spent that year
// (Income & Expenditure). Reserves carry year-to-year, so received ≠ utilised in any year.
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
  caritas_germany:  { name:'Caritas Germany',                     type:'foreign_org',  regime:'FCRA', aliases:['Caritas India','Caritas - Swaraksha','Caritass India'] },
  dasra:            { name:'Dasra',                               type:'foreign_org',  regime:'FCRA', aliases:['DASRA','Darsa'] },
  ksc_foundation:   { name:'Kailash Satyarthi Children’s Foundation', type:'foreign_org', regime:'FCRA', aliases:['Kailash Satyarthi','KSCF'] },
  shes_the_first:   { name:"She's The First",                     type:'foreign_org',  regime:'FCRA', aliases:["She's The First Cry",'She is the First -US','Panchi'] },
  edele_give:       { name:'Edele Give Foundation',               type:'foreign_org',  regime:'INR',  aliases:['Edele Give'] },
  appi:             { name:'Azim Premji Philanthropic Initiatives', type:'philanthropy', regime:'INR', pan:'AADCA2473P', aliases:['Azim Premji (APPI)','APPI FASAL','APPI COVID RELIEF','Azim Premji Philanthropic Initiatives'] },
  childline_india:  { name:'Childline India Foundation',          type:'indian_inst',  regime:'INR', pan:'AAATC2486J', aliases:['Childline','Childline Shravasti','Child Line Foundation'] },
  aih:              { name:'Alliance for Immunization & Health',   type:'indian_inst',  regime:'INR', pan:'ABAFA5797K', aliases:['AIH - MAHARASHTRA','AIH - UP','Alliance for Immunization'] },
  acc:              { name:'ACC Limited (Corporate Social Responsibility)',                      type:'csr',          regime:'INR', pan:'AAACT1507C', aliases:['ACC Ltd','Scope of Work for Malnutrition (ACC)'], note:'Corporate CSR (cement); Sch VII' },
  individuals:      { name:'Individual partners',                 type:'individual',   regime:'INR',  aliases:['General Donations','Donation Received'] },
  sciaf:            { name:'Scottish Catholic International Aid Fund', type:'foreign_org', regime:'FCRA', aliases:['SCIAF','Scottish Catholic International Aid Fund'] },
  sanlaap:          { name:'Sanlaap',                                         type:'indian_inst',  regime:'FCRA', aliases:['SANLAAP','Sanlaap - Kolkata'] },
  igsss:            { name:'Indo-Global Social Service Society',  type:'indian_inst',  regime:'FCRA', aliases:['IGSSS','Indo Global Social Service Society'] },
  laher:            { name:'Laher Project (intermediary)',         type:'indian_inst',  regime:'INR',  aliases:['Laher','Lahar','Lahar project','Laher project'] },
  caritas_india_inr:{ name:'Caritas India (INR channel)',         type:'indian_inst',  regime:'INR',  aliases:['Caritas India - Swaraksha INR','Caritas - Swaraksha Project'] },
  // Historical / one-off funders (FY2015-16 → FY2019-20)
  birlasoft:        { name:'Birlasoft India Ltd (CSR)',           type:'csr',          regime:'INR',  aliases:['Birlasoft','Grant From- Birlasoft India Ltd'] },
  centum:           { name:'Centum WorkSkills India (WSI)',        type:'csr',          regime:'INR',  aliases:['Centum','WSI','Centum (WSI)','WSI Learning Centre'] },
  nabard:           { name:'NABARD',                               type:'govt',         regime:'INR',  aliases:['NABARD SHG Formation'] },
  cry:              { name:'Child Rights and You (CRY)',           type:'philanthropy', regime:'INR',  aliases:['CRY','Cry Project'] },
  sdtt:             { name:'Sir Dorabji Tata Trust',        type:'philanthropy', regime:'INR',  aliases:['SDTT','SDTT Fund'] },
  unicef:           { name:'UNICEF',                               type:'un',           regime:'INR',  aliases:['UNICEF-CPP','UNICEF- CPP Project'] },
  action_aid:       { name:'ActionAid (Action on Research/Direct Democracy)', type:'foreign_org', regime:'FCRA', aliases:['Action Aid','ACTION AID Project','Action on Research on Direct Democracy'] },
  sahyog:           { name:'Sahyog Society',                        type:'indian_inst',  regime:'FCRA', aliases:['Sahyog','Sahyog Society FC A/c'] },
  iimpact:          { name:'IIMPACT (E-Vidhya education)',          type:'philanthropy', regime:'INR',  aliases:['E Vidhya','E-Vidhya','Evidhya'] },
  milaan:           { name:'Milaan / Charity Science',             type:'foreign_org',  regime:'INR',  aliases:['Charity Science','Milaan'] },
  geeta_karnal:     { name:'GEETA (Karnal partner)',          type:'indian_inst',  regime:'INR',  aliases:['GEETA Karnal','GEETA','NSE/Geeta','NSE'] },
  rotary:           { name:'Rotary',                                 type:'foreign_org',  regime:'FCRA', aliases:['Rotary','Grant from Rotary'] },
  ipartner:         { name:'iPartner India',                        type:'indian_inst',  regime:'INR',  aliases:['iPartner India','iPartner'] },
  google:           { name:'Google (in-kind / Ad Grants)',          type:'csr',          regime:'INR',  aliases:['Google','Income From Google','Grant from Google'] },
  // Founding-era funders (FY2005-06 → FY2011-12)
  dfid_pacs:        { name:'Department for International Development — Poorest Areas Civil Society Programme (Lokshakti)',      type:'govt',         regime:'FCRA', aliases:['DFID','PACS','PACS Programme','Lokshakti','DFID (PACS PROGRAME)'] },
  baif:             { name:'BAIF Development Research Foundation',   type:'indian_inst',  regime:'FCRA', aliases:['BAIF','RAIF','Sure Start','SURE START PROJECT','BAIF Pune'] },
  kabir:            { name:'Kabir (New Delhi)',                      type:'indian_inst',  regime:'FCRA', aliases:['Kabir','Kabir Project','Kabir New Delhi'] },
  tara_akshar:      { name:'Tara Akshar (women\'s literacy)',        type:'indian_inst',  regime:'INR',  aliases:['Tara Akshar','TARA AKSHAR'] },
  pani:             { name:'PANI, Faizabad (grant intermediary)',             type:'indian_inst',  regime:'INR',  aliases:['PANI','PANI Faizabad','From PANI'] },
  jagdeep_lohani:   { name:'Jagdeep Singh Lohani (individual)',      type:'individual',   regime:'INR',  aliases:['Jagdeep Singh Lohani','Mr. Jagdeep Singh Lohani'] },
  ssa:              { name:'Sarva Shiksha Abhiyan (Govt.)',          type:'govt',         regime:'INR',  aliases:['SSA','Sarva Siksha Abhiyaan'] },
  jica:             { name:'JICA / Japan Bank (UPPFMPAP forest project)', type:'govt', regime:'INR', aliases:['JICA','Japan Bank for International Cooperation','UPPFMPAP','DMU Renukoot','DMU Sonbhadra'], note:'UP Participatory Forest Mgmt & Poverty Alleviation Project, routed through the state Divisional Management Unit' },
  erase_poverty:    { name:'Erase Poverty (Swabhiman)',                type:'foreign_org', regime:'FCRA', aliases:['ERASE POVERTY','Erase Poverty'] },
  light_a_lamp:     { name:'Light A Lamp Foundation',                  type:'foreign_org', regime:'FCRA', aliases:['LIGHT A LAMP','Light A Lamp Foundation'] },
  sit_world:        { name:'SIT / World Learning India',               type:'foreign_org', regime:'INR',  aliases:['SIT-World Learning India','SIT','World Learning'] },
};

// Per-year records. programme/admin split is derived from Income & Expenditure line
// items (see spend.byProject[].admin where the statement itemises it).
FIN.YEARS = [
  {
    fy:'2024-25', period:'1 Apr 2024 – 31 Mar 2025',
    signed:true, softcopy:true, auditor:'Madhuresh Agrahari & Associates', udin:'25528519BMNZFO7507',
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
      { project:'Surokhit Shaishav (Swaraksha)', funder:'caritas_germany', regime:'FCRA', total:3500087, admin:132196 },
      { project:'Access to Justice',             funder:'ksc_foundation',  regime:'FCRA', total:6286034, admin:632571 },
      { project:'Skill Soldiers for a Better Future', funder:'dasra',      regime:'FCRA', total:1484973, admin:172550 },
      { project:'Panchi',                        funder:'shes_the_first',  regime:'FCRA', total:1257835, admin:324993 },
      { project:'DEHAT direct (own foreign contribution fund)',  funder:'__fcra_general',  regime:'FCRA', total:31113,   admin:31113 },
      { project:'Indian grant programmes (Azim Premji Philanthropic Initiatives FASAL etc.)', funder:'appi', regime:'INR', total:5078407, admin:null },
      { project:'DEHAT general expenditure',     funder:'individuals',     regime:'INR', total:1622834, admin:null },
    ],
    depreciation:105405,
    reserves:{ closingBankFCRA:1129346, closingBankINR:691267 },
    balanceSheetTotal:2531500.55,
  },
  // FY2005-06 … FY2023-24 — extracted from signed scanned PDFs (in progress).
  {
    fy:'2023-24', period:'1 Apr 2023 – 31 Mar 2024',
    signed:true, softcopy:false, auditor:'Madhuresh Agrahari & Associates', udin:'24528519BKEGVJ6534',
    received:[
      // FCRA (foreign) — restricted project grants (Receipts & Payments, cash received)
      { funder:'ksc_foundation',  regime:'FCRA', flex:'restricted', grant:4600231, interest:0 },
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:3409467, interest:0 },
      { funder:'shes_the_first',  regime:'FCRA', flex:'restricted', grant:1610970, interest:0 },
      { funder:'dasra',           regime:'FCRA', flex:'restricted', grant:1018932, interest:0 },
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible',   grant:0,        interest:87982, note:'Foreign contribution general fund interest' },
      // INR (domestic)
      { funder:'__inr_grants',    regime:'INR',  flex:'restricted', grant:11236827, interest:71880, note:'INR grants received per schedule; per-funder split pending grant-sheet OCR (bulk = Azim Premji Philanthropic Initiatives FASAL)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:890345,   interest:4196,  note:'Individual contributions' },
    ],
    spend:[
      { project:'Surokhit Shaishav (Swaraksha)', funder:'caritas_germany', regime:'FCRA', total:3278203, admin:174996 },
      { project:'Access to Justice',             funder:'ksc_foundation',  regime:'FCRA', total:4326562, admin:785905 },
      { project:'Skill Soldiers for a Better Future', funder:'dasra',      regime:'FCRA', total:732166,  admin:null },
      { project:'Panchi',                        funder:'shes_the_first',  regime:'FCRA', total:926087,  admin:null },
      { project:'DEHAT direct (own foreign contribution fund)',  funder:'__fcra_general',  regime:'FCRA', total:18288,   admin:18288 },
      { project:'Indian grant programmes',       funder:'__inr_grants',    regime:'INR',  total:9038715, admin:null },
      { project:'DEHAT general expenditure',     funder:'individuals',     regime:'INR',  total:190163,  admin:null },
    ],
    depreciation:150558,
    surplus:623513.53,
    balanceSheetTotal:5296331.59,
  },
  {
    fy:'2022-23', period:'1 Apr 2022 – 31 Mar 2023',
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
      { project:'Surokhit Shaishav (Swaraksha)',  funder:'caritas_germany',  regime:'FCRA', total:465174,   admin:1674 },
      { project:'DEHAT direct (own foreign contribution fund)',   funder:'__fcra_general',   regime:'FCRA', total:17448,    admin:17448 },
      { project:'Azim Premji Philanthropic Initiatives FASAL programme',           funder:'appi',             regime:'INR',  total:3000456.92, admin:null },
      { project:'GROW (Edele Give)',               funder:'edele_give',       regime:'INR',  total:3979558.95, admin:null },
      { project:'ACC Malnutrition',               funder:'acc',              regime:'INR',  total:874613,   admin:null },
      { project:'Childline India Foundation',     funder:'childline_india',  regime:'INR',  total:1404861,  admin:null },
      { project:'Childline Shravasti',            funder:'childline_india',  regime:'INR',  total:1399247,  admin:null },
      { project:'Caritas Swaraksha (INR)',        funder:'caritas_india_inr',regime:'INR',  total:635053,   admin:null },
      { project:'Laher project',                  funder:'laher',            regime:'INR',  total:161874.5, admin:null },
      { project:'DEHAT general expenditure',      funder:'individuals',      regime:'INR',  total:121177,   admin:null },
    ],
    depreciation:200713,
    surplus:-137990.43,
    balanceSheetTotal:null, // scanned; not digitised
  },
  {
    fy:'2021-22', period:'1 Apr 2021 – 31 Mar 2022',
    signed:true, softcopy:true, auditor:'Madhuresh Agrahari & Associates', udin:'22528519BDJWNE2102',
    // Source: DEHAT B.S. Consolidated 2021-22.pdf (text-layer) + Last 3 Year xlsx (FCRA schedule)
    // Balance sheet total ₹54,07,555.45; deficit ₹3,35,011.14; depreciation ₹76,851
    // INR bank closing: ₹48,62,256.85; FCRA bank closing: extracted from consolidated balance sheet
    received:[
      // FCRA — per Last 3 Year Income Expenditure Detail xlsx
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:1518981, interest:0,      note:'Swaraksha / Caritas India channel' },
      { funder:'igsss',           regime:'FCRA', flex:'restricted', grant:517172,  interest:0,      note:'Indo-Global Social Service Society nutrition programme (Suposhan)' },
      { funder:'sanlaap',         regime:'FCRA', flex:'restricted', grant:76740,   interest:0,      note:'Voice for Change / anti-trafficking' },
      { funder:'__fcra_general',  regime:'FCRA', flex:'flexible',   grant:89000,   interest:450459.13, note:'Foreign contribution salary received + interest/local contribution per FC-4' },
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
      { project:'Grant-funded programmes (all foreign contribution)',   funder:'__fcra_general',    regime:'FCRA', total:2112893, admin:null, note:'Caritas + Indo-Global Social Service Society + Sanlaap combined; individual project splits not available in 4-pg filing' },
      { project:'Grant-funded programmes (all — INR)',    funder:'__inr_grants_mixed', regime:'INR',  total:9292625.33, admin:null },
      { project:'DEHAT general expenditure',              funder:'individuals',         regime:'INR',  total:465511.92, admin:null },
    ],
    depreciation:76851,
    surplus:-335011.14,
    balanceSheetTotal:5407555.45,
    closingBankINR:4862256.85,
    closingCashINR:1154,
  },
  {
    fy:'2020-21', period:'1 Apr 2020 – 31 Mar 2021',
    signed:true, softcopy:false, auditor:'Garg Akash & Co (Lucknow, M.No.435464)', udin:'21435464AAAABJ9151',
    // Source: 5. DEHAT Consolidated Balance Sheet 2020-21.pdf (scanned; read visually). Signed 30/05/2021.
    // Actuals on utilised basis (I&E). Balance sheet total ₹23,96,674.49; surplus ₹60,267.03; bank ₹16,88,400.74
    // NB: these ACTUALS supersede the earlier budget-basis figures (SCIAF ₹15.1L etc.) from the Last-3-Year xlsx.
    received:[
      // FCRA
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:997900,  interest:0, note:'Swaraksha (Caritas)' },
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
      { project:'Voice of Change (Sanlaap)',  funder:'sanlaap',         regime:'FCRA', total:76740,   admin:null },
      { project:'Alliance for Immunization & Health Immunization — Maharashtra', funder:'aih',         regime:'INR',  total:1735198, admin:null },
      { project:'Alliance for Immunization & Health Immunization — UP',      funder:'aih',             regime:'INR',  total:1503983, admin:null },
      { project:'Su-Poshan (Indo-Global Social Service Society)',     funder:'igsss',           regime:'FCRA', total:517172,  admin:29514 },
      { project:'IGSSS local contribution',   funder:'igsss',           regime:'INR',  total:43710,   admin:null },
      { project:'Azim Premji Philanthropic Initiatives COVID ration',          funder:'appi',            regime:'INR',  total:1000000, admin:null },
      { project:'Swaraksha (Caritas & Scottish Catholic International Aid Fund)', funder:'caritas_germany', regime:'FCRA', total:1518981, admin:185436 },
      { project:'ACC Malnutrition',           funder:'acc',             regime:'INR',  total:627765,  admin:null },
      { project:'Audit fees (foreign contribution)',          funder:'__fcra_general',  regime:'FCRA', total:15000,   admin:15000 },
      { project:'DEHAT direct own fund',      funder:'individuals',     regime:'INR',  total:2512614.08, admin:null },
    ],
    surplus:60267.03,
    balanceSheetTotal:2396674.49,
    reserves:{ closingBankTotal:1688400.74 },
  },
  {
    fy:'2019-20', period:'1 Apr 2019 – 31 Mar 2020',
    signed:true, softcopy:false, auditor:'Garg Akash & Co (Lucknow, M.No.435464)',
    // Source: DEHAT Consolidated Balance Sheet 2019-20.pdf (scanned; read visually). Signed 24/08/2020.
    // Org books grant amounts on a UTILISED basis (I&E "Grant Utilised" = income); received≈utilised.
    // Balance sheet total ₹23,03,089.37; surplus ₹27,075.46; bank ₹16,31,477.62
    received:[
      // FCRA
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:1840442, interest:0, note:'Swaraksha anti-trafficking' },
      { funder:'igsss',           regime:'FCRA', flex:'restricted', grant:1048799, interest:0, note:'Suposhan / nutrition security (Indo-Global Social Service Society)' },
      { funder:'sanlaap',         regime:'FCRA', flex:'restricted', grant:108910,  interest:0, note:'Stakeholder consultation, anti-trafficking' },
      // INR
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1310995, interest:0, note:'Childline Shravasti' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1388772, interest:0, note:'Childline BRH (Bahraich)', project:'Childline BRH' },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:108326,  interest:0, note:'E-Vidhya education programme' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:767824,  interest:0, note:'Alliance for Immunization & Health immunization — Maharashtra' },
      { funder:'aih',             regime:'INR',  flex:'restricted', grant:538645,  interest:0, note:'Alliance for Immunization & Health immunization — UP', project:'Alliance for Immunization & Health — Uttar Pradesh' },
      { funder:'igsss',           regime:'INR',  flex:'restricted', grant:209050,  interest:0, note:'IGSSS local contribution (Su-Poshan)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:221479.5,interest:62004.46, note:'Individual contributions + bank interest; General Reserve utilised ₹1,27,695.84' },
    ],
    spend:[
      { project:'Childline Shravasti',        funder:'childline_india', regime:'INR',  total:1310995, admin:166244 },
      { project:'Childline BRH',              funder:'childline_india', regime:'INR',  total:1388772, admin:167411 },
      { project:'E-Vidhya',                   funder:'iimpact',         regime:'INR',  total:108326,  admin:null },
      { project:'Alliance for Immunization & Health Immunization — Maharashtra', funder:'aih',         regime:'INR',  total:767824,  admin:null },
      { project:'Alliance for Immunization & Health Immunization — UP',      funder:'aih',             regime:'INR',  total:538645,  admin:null },
      { project:'Su-Poshan (IGSSS local)',    funder:'igsss',           regime:'INR',  total:209050,  admin:null },
      { project:'Stakeholder meeting (Sanlaap)', funder:'sanlaap',      regime:'FCRA', total:108910,  admin:null },
      { project:'Suposhan / nutrition (Indo-Global Social Service Society)', funder:'igsss',    regime:'FCRA', total:1048799, admin:null },
      { project:'Swaraksha (Caritas)',        funder:'caritas_germany', regime:'FCRA', total:1840442, admin:185541 },
      { project:'Audit fees (foreign contribution)',          funder:'__fcra_general',  regime:'FCRA', total:15000,   admin:15000 },
      { project:'DEHAT direct own fund',      funder:'individuals',     regime:'INR',  total:369104.34, admin:null },
    ],
    surplus:27075.46,
    balanceSheetTotal:2303089.37,
    reserves:{ closingBankTotal:1631477.62 },
  },
  {
    fy:'2018-19', period:'1 Apr 2018 – 31 Mar 2019',
    signed:true, softcopy:false, auditor:'Garg Akash & Co (Lucknow, M.No.435464)',
    // Source: Balance Sheet Consolidated 2018-19.pdf (scanned; read visually). Signed 05/06/2019.
    // Utilised basis (I&E "Grant Utilised"). Balance sheet total ₹20,30,614.81; surplus ₹49,488.07
    received:[
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:2317925, interest:0, note:'Swaraksha (Caritas) — anti-trafficking' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:303602,  interest:0, note:'Childline Shravasti' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1292090, interest:0, note:'Childline BRH', project:'Childline BRH' },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:1115216, interest:0, note:'E-Vidhya education programme' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:1226490, interest:0, note:'Sustainable Community Development Project / ACC school & garment skilling' },
      { funder:'nabard',          regime:'INR',  flex:'restricted', grant:87280,   interest:0, note:'Sujlam Suflam (water) project' },
      { funder:'milaan',          regime:'INR',  flex:'restricted', grant:509810,  interest:0, note:'Charity Science project' },
      { funder:'geeta_karnal',    regime:'INR',  flex:'restricted', grant:157616,  interest:0, note:'GEETA Karnal (library / SPICE)' },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:220452,  interest:22439.15, note:'Individual contributions + bank interest; student fees ₹46,400; Google income ₹10,068' },
    ],
    spend:[
      { project:'Swaraksha (Caritas)',    funder:'caritas_germany', regime:'FCRA', total:2317925, admin:186295 },
      { project:'Childline Shravasti',    funder:'childline_india', regime:'INR',  total:303602,  admin:41083 },
      { project:'Childline BRH',          funder:'childline_india', regime:'INR',  total:1292090, admin:172106 },
      { project:'E-Vidhya',               funder:'iimpact',         regime:'INR',  total:1035216, admin:null },
      { project:'Sustainable Community Development Project / ACC',             funder:'acc',             regime:'INR',  total:1226490, admin:188826 },
      { project:'Sujlam Suflam',          funder:'nabard',          regime:'INR',  total:87280,   admin:9680 },
      { project:'Charity Science',        funder:'milaan',          regime:'INR',  total:505440,  admin:44220 },
      { project:'GEETA Karnal',           funder:'geeta_karnal',    regime:'INR',  total:155000,  admin:null },
      { project:'Audit fees (foreign contribution)',      funder:'__fcra_general',  regime:'FCRA', total:7500,    admin:7500 },
      { project:'DEHAT direct own fund',  funder:'individuals',     regime:'INR',  total:319289.08, admin:null },
      { project:'Google Click exp',       funder:'individuals',     regime:'INR',  total:10068,   admin:null },
    ],
    surplus:49488.07,
    balanceSheetTotal:2030614.81,
  },
  {
    fy:'2017-18', period:'1 Apr 2017 – 31 Mar 2018',
    signed:true, softcopy:false, auditor:'Vipin Priyank Gopal & Co (Bahraich, FRN 017849C, M.No.422438)',
    // Source: Balance Sheet Consolidated 2017-18.pdf (scanned; read visually). Signed 29/09/2018.
    // Grant Fund income by funder (I&E). Balance sheet total ₹48,29,613.
    // Big year: Google in-kind (Ad Grants) ₹60,02,387; total income ~₹2.02 crore.
    received:[
      { funder:'unicef',          regime:'INR',  flex:'restricted', grant:270000,  interest:0, note:'UNICEF GPDP' },
      { funder:'rotary',          regime:'FCRA', flex:'restricted', grant:1788590, interest:0, note:'Rotary grant' },
      { funder:'caritas_germany', regime:'FCRA', flex:'restricted', grant:1393305, interest:0, note:'Caritas India / Swaraksha' },
      { funder:'action_aid',      regime:'FCRA', flex:'restricted', grant:1000053, interest:0, note:'ActionAid' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:198792,  interest:0, note:'Childline HS' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:1231568, interest:0, note:'Childline India Foundation', project:'Childline India Foundation' },
      { funder:'geeta_karnal',    regime:'INR',  flex:'restricted', grant:1905517, interest:0, note:'GEETA Karnal project' },
      { funder:'acc',             regime:'INR',  flex:'restricted', grant:1579381, interest:0, note:'Sustainable Community Development Project / ACC' },
      { funder:'ipartner',        regime:'INR',  flex:'restricted', grant:798702,  interest:0, note:'iPartner India' },
      { funder:'milaan',          regime:'INR',  flex:'restricted', grant:150000,  interest:0, note:'Charity Science Foundation' },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:1878800, interest:0, note:'IIMPACT (E-Vidhya)' },
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:1455855, interest:0, note:'Sir Dorabji Tata Trust' },
      { funder:'google',          regime:'INR',  flex:'restricted', grant:6002387, interest:0, note:'Google Ad Grants — IN-KIND (non-cash)', inKind:true },
      { funder:'individuals',     regime:'INR',  flex:'flexible',   grant:448695,  interest:101174, note:'Individual contributions + bank interest' },
    ],
    spend:[
      { project:'ActionAid project',          funder:'action_aid',      regime:'FCRA', total:707205,  admin:112000 },
      { project:'Childline project',          funder:'childline_india', regime:'INR',  total:1191051, admin:131744 },
      { project:'GEETA Karnal project',        funder:'geeta_karnal',    regime:'INR',  total:1086407, admin:null },
      { project:'(other grant programmes — per-project spend partially digitised)', funder:'__mixed', regime:'INR', total:null, admin:null },
    ],
    balanceSheetTotal:4829613, receivedTotal:20202819, utilisedTotal:19034341, surplus:1168478,
    note:'Grant-Fund income fully captured; project-level spend only partially digitised (multi-page I&E). Google ₹60.02L is in-kind Ad Grants, not cash.',
  },
  {
    fy:'2016-17', period:'1 Apr 2016 – 31 Mar 2017',
    signed:false, compiled:true, softcopy:true, auditor:'S. Chandra Gupta & Associates (Lucknow, CA Rajeev Gupta, M.No.089462)',
    // Source: Balance_Sheet_DEHAT_2016-17_-_CONSOLID.xlsx (soft copy of consolidated R&P / I&E / Balance Sheet). Compiled 09.10.2017.
    // "Compiled from the books" — an accountant's compilation, not a full statutory audit.
    // Per-funder received = Grant-Fund income lines on the consolidated I&E; spend = project-cost blocks on the I&E.
    // Google ₹77.6L is in-kind Ad Grants (non-cash) — booked equal on income and expenditure sides.
    // I&E income ₹1,89,78,517.80; I&E expenditure ₹2,17,46,579.40 (excl. the separately-stated depreciation line);
    // deficit therefore ≥ ₹27,68,061.60, funded from prior-year advances/receivables (large Expenses-Payable accruals). Balance sheet total ₹49,97,203.91 (as printed).
    note:'Received = grant income recognised on the I&E; utilised = I&E project-cost blocks (ties to ₹2,17,46,579.40). Cash grants excl. Google in-kind = ₹1,12,18,703.95. Deficit run against prior-year advances.',
    balanceSheetTotal:4997203.91, receivedTotal:18978517.80, utilisedTotal:21746579.40, surplus:-2768061.60,
    fundersActive:['google','iimpact','__rilm','__fcra_general','sdtt','action_aid','childline_india','baif','__sujlam_suflam','individuals'],
    received:[
      { funder:'google',          regime:'INR',  flex:'restricted', grant:7759813.85, interest:0, note:'Google Ad Grants — IN-KIND online advertising (non-cash)', inKind:true },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:3010367.95, interest:0, note:'IIMPACT — School and Community Development Education Programme', project:'School and Community Development Education Programme' },
      { funder:'iimpact',         regime:'INR',  flex:'restricted', grant:2329000,    interest:0, note:'IIMPACT / Rural Girl Child Education Project education programme', project:'Rural Girl Child Education Project' },
      { funder:'__rilm',          regime:'INR',  flex:'restricted', grant:1789805,    interest:0, note:'Rotary India Literacy Mission education / literacy programme (funder not itemised on consolidated statement)' },
      { funder:'__fcra_general',  regime:'FCRA', flex:'restricted', grant:1256256,    interest:0, note:'Foreign Contribution A/c — Bal Prahaari anti-trafficking (FCRA; funder not itemised)' },
      { funder:'sdtt',            regime:'INR',  flex:'restricted', grant:1045897,    interest:0, note:'TCL / Sir Dorabji Tata Trust' },
      { funder:'action_aid',      regime:'FCRA', flex:'restricted', grant:919378,     interest:0, note:'ActionAid — School Management Committee federation / school governance (6 districts)' },
      { funder:'childline_india', regime:'INR',  flex:'restricted', grant:718000,     interest:0, note:'Childline India Foundation (1098 child-protection service)' },
      { funder:'baif',            regime:'INR',  flex:'restricted', grant:150000,     interest:0, note:'BAIF fund (received by cheque)' },
    ],
    spend:[
      { project:'Google Ad Grants (in-kind advertising)', funder:'google',          regime:'INR',  total:7759813.85, admin:null, inKind:true },
      { project:'Rotary India Literacy Mission education / literacy',              funder:'__rilm',           regime:'INR',  total:3136064,    admin:41055 },
      { project:'School and Community Development Education Programme',  funder:'iimpact',          regime:'INR',  total:2880319.27, admin:96500 },
      { project:'Rural Girl Child Education Project education programme',               funder:'iimpact',          regime:'INR',  total:2823887.93, admin:14217.93, project:'Rural Girl Child Education Project' },
      { project:'ActionAid — School Management Committee federation / governance', funder:'action_aid',       regime:'FCRA', total:1288900,    admin:10000 },
      { project:'Sujalam Sufalam (livelihoods / NRM)',     funder:'__sujlam_suflam',  regime:'INR',  total:1222121.93, admin:11000 },
      { project:'Childline (child protection)',            funder:'childline_india',  regime:'INR',  total:1171810.56, admin:10000 },
      { project:'Head office / general administration',    funder:'individuals',      regime:'INR',  total:911508.93,  admin:null },
      { project:'Bal Prahaari anti-trafficking (foreign contribution)',    funder:'__fcra_general',   regime:'FCRA', total:552152.93,  admin:14537.93 },
    ],
  },
  {
    fy:'2015-16', period:'1 Apr 2015 – 31 Mar 2016',
    signed:false, compiled:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow)',
    // Source: DEHAT Consolidated Balance sheet 2015-16.pdf (scanned, sideways; read visually).
    // Receipts & Payments basis. Foreign Contribution (Swabhiman/FCRA) total ~₹5,62,273.26;
    // Local/Society fund receipts ~₹6,38,721.80. Swabhiman grant-in-aid received ₹28,08,718.13.
    partial:true, note:'Compiled statement, sideways scan; summary figures only. Per-funder detail low-confidence — not digitised.',
    fundersActive:['action_aid','centum','sahyog','__swabhiman','__sit_world_learning','individuals'],
    utilisedTotal:2995752.35,
    received:[
      { funder:'action_aid',  regime:'FCRA', flex:'restricted', grant:2808718.13, interest:0, note:'Swabhiman Project grant-in-aid' },
      { funder:'centum',      regime:'INR',  flex:'restricted', grant:54517,      interest:0, note:'Centum WSI (old grant received)' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:133001.35,  interest:28033, note:'Individual contributions + bank interest (Society Home / local fund)' },
    ],
    spend:[],
  },
  {
    fy:'2014-15', period:'1 Apr 2014 – 31 Mar 2015',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: scans/ocr-2014-15.txt (OCR of signed scan). Signed 20.05.2015.
    // Fund-accounting I&E: income recognised = grant applied to the year. Cash R&P (₹2.79 cr)
    // is higher as it includes opening balances and inter-project advances.
    // Balance sheet total ₹76,05,062.18; I&E total ₹1,32,71,999.
    partial:true, note:'Grant income by funder from a multi-account R&P; project-level splits not fully digitised. Totals are audited and reliable.',
    receivedTotal:13271998.80, utilisedTotal:13271998.80, balanceSheetTotal:7605062.18,
    fundersActive:['action_aid','appi','pani','acc','childline_india','iimpact','centum','sahyog','sdtt','unicef','cry','individuals'],
    received:[
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:4882954.95, interest:0, note:'ACC Corporate Social Responsibility — Sustainable Community Development Project (school & skilling); received across 11 Real Time Gross Settlement tranches' },
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:4586870,    interest:0, note:'IIMPACT / Rural Girl Child Education Project education (grant portion)' },
      { funder:'pani',           regime:'INR',  flex:'restricted', grant:2159872,    interest:31139, note:'FASAL programme routed through PANI, Faizabad (Azim Premji Philanthropic Initiatives-funded)' },
      { funder:'action_aid',     regime:'FCRA', flex:'restricted', grant:1580000,    interest:0, note:'Swabhiman Project grant-in-aid' },
      { funder:'centum',         regime:'INR',  flex:'restricted', grant:720700,     interest:0, note:'Centum WorkSkills (WSI) learning centre' },
    ],
    spend:[],
  },
  {
    fy:'2013-14', period:'1 Apr 2013 – 31 Mar 2014',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: re-scanned consolidated R&P/I&E/Balance Sheet 2013-14 (legible copy, signed 12.06.2014).
    // Per-funder = grant RECEIVED in cash during the year (R&P "Grant Received" lines).
    // Consolidated R&P ₹1,71,10,779.04; balance sheet ₹54,77,244.63; deficit ₹4,50,558.81.
    balanceSheetTotal:5477244.63, surplus:-450558.81, utilisedTotal:13081778.70,
    note:'Received = cash grant receipts (R&P); utilised = consolidated I&E expenditure (₹1,30,81,778.70). The two bases differ, so received ≠ utilised; the year ran a ₹4,50,558.81 deficit.',
    received:[
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:4318750, interest:9858, note:'IIMPACT / Rural Girl Child Education Project education programme (Gurgawan); 4 tranches' },
      { funder:'erase_poverty',  regime:'FCRA', flex:'restricted', grant:3897713, interest:0, note:'Swabhiman anti-trafficking (Erase Poverty) — SLRCs, Mid-Day-Meal, Natpurwa' },
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:2073378, interest:0, note:'Sustainable Community Development Project — school & skilling (ACC Cement, Tikriya); 8 Real Time Gross Settlement tranches' },
      { funder:'pani',           regime:'INR',  flex:'restricted', grant:1456330, interest:24002, note:'FASAL programme via PANI, Faizabad (Azim Premji Philanthropic Initiatives-funded); 5 RTGS tranches' },
      { funder:'jagdeep_lohani', regime:'FCRA', flex:'restricted', grant:501936,  interest:0, note:'Action on Research on Direct Democracy — grant from Mr. Jagdeep Singh Lohani' },
      { funder:'centum',         regime:'INR',  flex:'restricted', grant:325717,  interest:0, note:'Centum WorkSkills (WSI) learning centre' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:166806,  interest:0, note:'Childline India Foundation; ₹4,03,492 further receivable (grant fund ₹5,70,298)' },
      { funder:'sit_world',      regime:'INR',  flex:'restricted', grant:79148,   interest:0, note:'SIT / World Learning India (student programme receipts)' },
      { funder:'light_a_lamp',   regime:'FCRA', flex:'restricted', grant:54752,   interest:0, note:'Swabhiman — Light A Lamp Foundation' },
      { funder:'sahyog',         regime:'INR',  flex:'restricted', grant:52400,   interest:0, note:'Tarang project (via Sahyog)' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:131832,  interest:13159, note:'Individual contributions ₹1,03,210 + local contribution ₹28,622 + interest; also Gram Niyojan Kendra programme receipts ₹3,19,258 & insurance claim ₹4,505' },
    ],
    spend:[],
  },
  {
    fy:'2012-13', period:'1 Apr 2012 – 31 Mar 2013',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: re-scanned consolidated R&P/I&E/Balance Sheet 2012-13 (legible copy, signed 01.07.2013).
    // Per-funder = grant RECEIVED in cash during the year. Consolidated R&P ₹1,42,20,181.25; surplus ₹3,80,816.33.
    surplus:380816.33, utilisedTotal:7413593,
    note:'Received = cash grant receipts (R&P). Utilised is the audited I&E expenditure, estimated as receipts net of the ₹3,80,816.33 surplus — the consolidated I&E grand total is not cleanly legible on this scan.',
    received:[
      { funder:'iimpact',        regime:'INR',  flex:'restricted', grant:2527000, interest:0, note:'IIMPACT / Rural Girl Child Education Project education programme (Gurgawan)' },
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:1994820, interest:0, note:'UNICEF child health & nutrition programme' },
      { funder:'pani',           regime:'INR',  flex:'restricted', grant:994200,  interest:0, note:'FASAL programme via PANI, Faizabad (Azim Premji Philanthropic Initiatives-funded)' },
      { funder:'jica',           regime:'INR',  flex:'restricted', grant:568797,  interest:0, note:'UPPFMPAP (JICA, via DMU Sonbhadra) — forest mgmt & poverty alleviation' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:519225,  interest:0, note:'Childline India Foundation; ₹2,19,969 further receivable (grant fund ₹7,39,194)' },
      { funder:'unicef',         regime:'INR',  flex:'restricted', grant:452030,  interest:0, note:'UNICEF-CPP (child protection)', project:'UNICEF-CPP' },
      { funder:'cry',            regime:'INR',  flex:'restricted', grant:145500,  interest:0, note:'CRY — Azadi project (INR channel)', project:'Azadi' },
      { funder:'cry',            regime:'FCRA', flex:'restricted', grant:145800,  interest:3686, note:'Child Rights and You project' },
      { funder:'centum',         regime:'INR',  flex:'restricted', grant:117432,  interest:0, note:'Centum WorkSkills (WSI) learning centre' },
      { funder:'milaan',         regime:'INR',  flex:'restricted', grant:82980,   interest:0, note:'Charity Science / Vidhya Grants scholarship (Hem Nanda – C.S.)' },
      { funder:'acc',            regime:'INR',  flex:'restricted', grant:78510,   interest:0, note:'Sustainable Community Development Project (ACC Cement, Tikariya)' },
      { funder:'jagdeep_lohani', regime:'FCRA', flex:'restricted', grant:20000,   interest:0, note:'Action on Research on Direct Democracy — grant from Mr. Jagdeep Singh Lohani' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:132000,  interest:12429, note:'Local contribution + bank interest (General/Local Fund)' },
    ],
    spend:[],
  },
  {
    fy:'2011-12', period:'1 Apr 2011 – 31 Mar 2012',
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
      { funder:'jica',           regime:'INR',  flex:'restricted', grant:527121,  interest:2985, note:'UPPFMPAP (JICA / Japan Bank, via DMU Renukoot); activities 2011-12' },
      { funder:'childline_india',regime:'INR',  flex:'restricted', grant:415250,  interest:0, note:'Childline India Foundation; ₹3,85,550 further receivable (grant fund ₹8,00,800)' },
      { funder:'pani',           regime:'INR',  flex:'restricted', grant:191800,  interest:0, note:'FASAL programme via PANI, Faizabad (Azim Premji Philanthropic Initiatives-funded)' },
      { funder:'baif',           regime:'FCRA', flex:'restricted', grant:88069,   interest:0, note:'Sure Start (BAIF, Pune) — Payagpur ₹45,548 + Chitaura ₹42,521 (winding down)' },
      { funder:'individuals',    regime:'INR',  flex:'flexible',   grant:8500,    interest:10448, note:'Local contribution & membership fee + bank interest (General/Local Fund)' },
    ],
    spend:[],
  },
  {
    fy:'2010-11', period:'1 Apr 2010 – 31 Mar 2011',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow, CA Subhash Misra, M.No.076388, FRN 007415C)',
    // Source: scans/ocr-2010-11.txt (OCR of signed scan). Signed 19.04.2011.
    // Balance sheet ₹15,91,631.32; income ₹69,20,843.50; expenditure ₹64,00,659.05; surplus ₹5,20,184.45.
    // Grants split by regime (foreign/indian) on the consolidated R&P; per-funder detail not on the summary pages.
    receivedTotal:6588804.75, utilisedTotal:6400659.05, balanceSheetTotal:1591631.32, surplus:520184.45,
    note:'Consolidated R&P groups grants as Foreign vs Indian funds; the funder roster is known but the summary does not split rupees per funder.',
    fundersActive:['cry','baif','kabir','sdtt','iimpact','unicef','nabard'],
    received:[
      { funder:'__fcra_grants', regime:'FCRA', flex:'restricted', grant:1392563,    interest:20315, note:'Foreign-funds grants (Child Rights and You, Sure Start/BAIF, Kabir) — consolidated' },
      { funder:'__inr_grants',  regime:'INR',  flex:'restricted', grant:4379247,    interest:0, note:'Indian-funds grants (Sir Dorabji Tata Trust, IIMPACT, UNICEF, NABARD) — consolidated' },
      { funder:'individuals',   regime:'INR',  flex:'flexible',   grant:0,          interest:796679.75, note:'Local contribution + interest (Indian funds)' },
    ],
    spend:[],
  },
  {
    fy:'2009-10', period:'1 Apr 2009 – 31 Mar 2010',
    signed:true, softcopy:false, auditor:'RJCP Subhash Misra & Co (Lucknow)',
    // Source: scans/ocr-2009-10.txt (OCR of signed scan). Signed 08.07.2010.
    // I&E total ₹15,82,428.88; cash R&P ₹35,95,897 (incl. opening balances & advances).
    partial:true, note:'Multi-account (Society Home + foreign contribution) statement; grant receipts by funder captured, project-level spend not fully digitised.',
    utilisedTotal:1582428.88,
    fundersActive:['sdtt','cry','baif','kabir','nabard','individuals'],
    received:[
      { funder:'baif',        regime:'FCRA', flex:'restricted', grant:929195,  interest:6618.50, note:'Sure Start Project — Payagpur ₹3,97,695 + Chittaura ₹5,31,500 (via BAIF, Pune)' },
      { funder:'kabir',       regime:'FCRA', flex:'restricted', grant:500000,  interest:9184.75, note:'Kabir Project (New Delhi)' },
      { funder:'sdtt',        regime:'INR',  flex:'restricted', grant:474000,  interest:0, note:'Sir Dorabji Tata Trust — Empowering Rural Women' },
      { funder:'cry',         regime:'FCRA', flex:'restricted', grant:450370,  interest:0, note:'Child Rights and You (foreign-funds project)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:95929,   interest:0, note:'NABARD SHG-promotion programme' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:0,       interest:0, note:'Local contribution — General Account' },
    ],
    spend:[],
  },
  {
    fy:'2008-09', period:'1 Apr 2008 – 31 Mar 2009',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2008-09.txt (OCR of signed scan). Signed 08.08.2009.
    // R&P total ₹23,80,751 (incl. opening ₹1,70,922); income for the year ₹22,09,829;
    // surplus ₹1,36,789; balance sheet total ₹6,44,215.
    surplus:136789, balanceSheetTotal:644215, receivedTotal:2209829, utilisedTotal:2073040,
    received:[
      { funder:'baif',        regime:'FCRA', flex:'restricted', grant:806556, interest:0, note:'BAIF (Sure Start) — foreign contribution' },
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:518354, interest:0, note:'Child Rights and You' },
      { funder:'ssa',         regime:'INR',  flex:'restricted', grant:198000, interest:0, note:'Sarva Shiksha Abhiyan (govt)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:4750,   interest:0, note:'NABARD' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:660881, interest:11288, note:'Local contribution ₹4,69,627 + individual contributions ₹1,75,000 + membership ₹5,500 + PANI/PGSS ₹20,754' },
    ],
    spend:[],
  },
  {
    fy:'2007-08', period:'1 Apr 2007 – 31 Mar 2008',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2007-08.txt (OCR of signed scan). Signed 17.05.2008.
    // I&E total ₹18,11,574; surplus ₹1,62,485; balance sheet total ₹4,43,426.
    surplus:162485, balanceSheetTotal:443426, receivedTotal:1811574, utilisedTotal:1649089,
    note:'Income by funder partly legible; headline totals audited and reliable.',
    fundersActive:['cry','baif','nabard','tara_akshar','individuals'],
    received:[
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:766516, interest:0, note:'Child Rights and You (revenue + capex)' },
      { funder:'baif',        regime:'FCRA', flex:'restricted', grant:187233, interest:0, note:'Sure Start Project (BAIF)' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:378368, interest:1602, note:'Membership, consultancy, local and individual contributions + laptop in-kind ₹38,502' },
    ],
    spend:[],
  },
  {
    fy:'2006-07', period:'1 Apr 2006 – 31 Mar 2007',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2006-07.txt (OCR of signed scan). Signed 30.10.2007.
    // Balance sheet total ₹2,30,941; surplus (current period) ₹25,733.
    surplus:25733, balanceSheetTotal:230941, receivedTotal:1284284, utilisedTotal:1258551,
    received:[
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:414169, interest:0, note:'Child Rights and You' },
      { funder:'dfid_pacs',   regime:'FCRA', flex:'restricted', grant:326129, interest:0, note:'Department for International Development — Poorest Areas Civil Society Programme' },
      { funder:'action_aid',  regime:'FCRA', flex:'restricted', grant:165100, interest:0, note:'ActionAid (Making School Functional)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:61490,  interest:0, note:'NABARD (SHG promotion)' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:316580, interest:816, note:'Consultancy ₹62,600 + local contribution ₹45,140 + individual contributions ₹2,06,280 + membership ₹2,560' },
    ],
    spend:[],
  },
  {
    fy:'2005-06', period:'1 Apr 2005 – 31 Mar 2006',
    signed:true, softcopy:false, auditor:'Singh Agarwal & Associates (Bahraich, CA Ashish K. Agarwal)',
    // Source: scans/ocr-2005-06.txt (OCR of signed scan). Signed 18.11.2006. DEHAT's earliest
    // consolidated statement on record. I&E total ₹11,56,970; surplus ₹35,953; balance sheet ₹1,55,208.
    surplus:35953, balanceSheetTotal:155208, receivedTotal:1156970, utilisedTotal:1121017,
    received:[
      { funder:'dfid_pacs',   regime:'FCRA', flex:'restricted', grant:351602, interest:0, note:'Poorest Areas Civil Society (Lokshakti) — Department for International Development programme' },
      { funder:'action_aid',  regime:'FCRA', flex:'restricted', grant:338000, interest:0, note:'ActionAid' },
      { funder:'cry',         regime:'INR',  flex:'restricted', grant:162160, interest:0, note:'Child Rights and You (Azadi)' },
      { funder:'nabard',      regime:'INR',  flex:'restricted', grant:60120,  interest:0, note:'NABARD' },
      { funder:'individuals', regime:'INR',  flex:'flexible',   grant:244505, interest:583, note:'Individual contributions ₹1,45,220 + consultancy ₹55,700 + local contribution ₹41,210 + membership ₹2,375' },
    ],
    spend:[],
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
  cross:      { label:'Organisation-wide',     since:2000, color:'#8a8378' },
};

FIN.SOURCES = {
  csr:           { label:'Corporate Social Responsibility', color:'#D2305C', note:'Company CSR spend under section 135, Companies Act, 2013' },
  philanthropy:  { label:'Philanthropy',                    color:'#EAAE28', note:'Private foundations and philanthropic trusts' },
  institutional: { label:'Institutional grantmakers & international non-government organisations', color:'#0E5565', note:'Grantmaking institutions, intermediary organisations and international non-government organisations' },
  government:    { label:'Government & multilateral',       color:'#556223', note:'Central and state government schemes, bilateral and United Nations agencies' },
  individuals:   { label:'Individual partners',             color:'#7a5cc4', note:'Personal contributions, membership and local contribution' },
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
FIN.FUNDER_TAGS = {
  caritas_germany:  { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  caritas_india_inr:{ prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  sciaf:            { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  ksc_foundation:   { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  sanlaap:          { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  childline_india:  { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  erase_poverty:    { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  light_a_lamp:     { prog:'protection', uncrc:'Protection', csr:'iii', source:'institutional' },
  dasra:            { prog:'leadership', uncrc:'Development', csr:'ii', source:'institutional' },
  shes_the_first:   { prog:'leadership', uncrc:'Development', csr:'ii', source:'institutional' },
  iimpact:          { prog:'leadership', uncrc:'Development', csr:'ii', source:'philanthropy' },
  centum:           { prog:'leadership', uncrc:'Development', csr:'ii', source:'csr' },
  milaan:           { prog:'leadership', uncrc:'Development', csr:'ii', source:'institutional' },
  geeta_karnal:     { prog:'leadership', uncrc:'Development', csr:'ii', source:'institutional', confirm:true },
  birlasoft:        { prog:'leadership', uncrc:'Development', csr:'ii', source:'csr' },
  ipartner:         { prog:'leadership', uncrc:'Development', csr:'ii', source:'institutional', confirm:true },
  tara_akshar:      { prog:'leadership', uncrc:'Development', csr:'ii', source:'institutional' },
  sit_world:        { prog:'leadership', uncrc:'Participation', csr:'ii', source:'institutional' },
  google:           { prog:'cross',      uncrc:'Participation', csr:'none', source:'csr' },
  acc:              { prog:'leadership', uncrc:'Development', csr:'ii', source:'csr' },
  appi:             { prog:'climate',    uncrc:'Development', csr:'iv', source:'philanthropy' },
  pani:             { prog:'climate',    uncrc:'Development', csr:'iv', source:'institutional' },
  edele_give:       { prog:'climate',    uncrc:'Development', csr:'x',  source:'philanthropy', confirm:true },
  jica:             { prog:'climate',    uncrc:'Development', csr:'iv', source:'government' },
  nabard:           { prog:'rights',     uncrc:'Development', csr:'x',  source:'government' },
  baif:             { prog:'rights',     uncrc:'Survival', csr:'i',  source:'institutional' },
  igsss:            { prog:'rights',     uncrc:'Survival', csr:'i',  source:'institutional' },
  aih:              { prog:'rights',     uncrc:'Survival', csr:'i',  source:'institutional' },
  unicef:           { prog:'rights',     uncrc:'Survival', csr:'i',  source:'government' },
  rotary:           { prog:'rights',     uncrc:'Survival', csr:'i',  source:'institutional', confirm:true },
  cry:              { prog:'rights',     uncrc:'Protection', csr:'iii', source:'philanthropy' },
  dfid_pacs:        { prog:'rights',     uncrc:'Participation', csr:'x', source:'government' },
  action_aid:       { prog:'rights',     uncrc:'Participation', csr:'ii', source:'institutional' },
  kabir:            { prog:'rights',     uncrc:'Participation', csr:'x', source:'institutional' },
  ssa:              { prog:'rights',     uncrc:'Development', csr:'ii', source:'government' },
  sdtt:             { prog:'rights',     uncrc:'Development', csr:'iii', source:'philanthropy' },
  sahyog:           { prog:'rights',     uncrc:'Development', csr:'iii', source:'institutional', confirm:true },
  laher:            { prog:'rights',     uncrc:'Development', csr:'iii', source:'institutional' },
  jagdeep_lohani:   { prog:'rights',     uncrc:'Participation', csr:'x', source:'individuals' },
  individuals:      { prog:'cross',      uncrc:'Participation', csr:'none', source:'individuals' },
};

// Project / note keyword overrides, tested in order (first match wins).
FIN.PROJECT_TAGS = [
  { match:/malnutrition|suposhan|su-poshan|nutrition|immuni/i, tags:{ prog:'rights', uncrc:'Survival', csr:'i' } },
  { match:/covid|ration|relief/i,                              tags:{ prog:'rights', uncrc:'Survival', csr:'xii' } },
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
  __fcra_general:     'Foreign contribution account \u2014 general fund',
  __fcra_grants:      'Foreign contribution grants \u2014 funder not itemised',
  __inr_grants:       'Domestic grants \u2014 funder not itemised',
  __inr_grants_mixed: 'Domestic grants \u2014 funder not itemised',
  __mixed:            'Several grants \u2014 combined in the statement',
  __rilm:             'Literacy programme grant \u2014 funder not itemised',
  __sujlam_suflam:    'Sujalam Sufalam water and livelihoods programme',
  __unallocated:      'Not attributed to a funder',
  __balance:          'Other income not itemised by funder',
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
      if (spend.length && (y.utilisedTotal == null || spendSum >= (y.utilisedTotal||0) * 0.6)){
        spend.forEach(function(s){
          var t = FIN.tagsFor(s.funder, (s.project||'') + ' ' + (s.note||''));
          out.push({ fy:y.fy, era:era, amt:s.total, regime:s.regime, funderKey:s.funder, funder:nm(s.funder),
                     project:FIN.publicLabel({ project:s.project, note:s.note }), prog:t.prog, uncrc:t.uncrc, csr:t.csr, source:t.source,
                     confirm:t.confirm, unmapped:t.unmapped, inKind:!!s.inKind,
                     admin:(s.admin == null ? null : s.admin), est:false, flex:null });
        });
      } else {
        var total = y.utilisedTotal != null ? y.utilisedTotal : spendSum;
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
    { k:'Skill Soldiers', v:'A \u20b920 lakh concept attached to institutional grant material. An attached concept is not evidence that an activity was funded.' },
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
