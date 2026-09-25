// Ask the Record — the question bank behind DEHAT's answers desk.
//
// Every answer here must be checkable against something already published on this
// site or in a document DEHAT can produce on request. The assistant that reads this
// file never composes an answer of its own: it retrieves the entries below, or it
// says it does not know and offers a person to write to. That constraint is the
// point. A transparency page cannot host a tool that invents.
//
// Fields:
//   q       the question, in the words a reader would actually use
//   a       the answer, plain and finite
//   cat     category key (see FAQ.CATS)
//   keys    extra retrieval terms — synonyms, abbreviations, misspellings
//   go      optional { label, view } to send the reader to the page that proves it
window.FAQ = {};

FAQ.CATS = [
  { k: 'give', label: 'Giving and Receipts', col: '#EAAE28' },
  { k: 'foreign', label: 'Giving From Outside India', col: '#4F0E73' },
  { k: 'money', label: 'Accounts and Where Money Goes', col: '#0E5565' },
  { k: 'govern', label: 'Governance and Registration', col: '#556223' },
  { k: 'safe', label: 'Safeguarding and Conduct', col: '#A92719' },
  { k: 'work', label: 'The Work Itself', col: '#D2305C' },
  { k: 'join', label: 'Working With DEHAT', col: '#0E5565' },
  { k: 'data', label: 'Your Data and This Website', col: '#4F0E73' },
];

FAQ.ITEMS = [
  // ---- Giving and receipts ----
  { cat: 'give', q: 'Is my investment tax deductible?',
    keys: ['80g', 'tax', 'deduction', 'exemption', 'save tax', 'rebate'],
    a: 'For Indian taxpayers, yes. DEHAT holds 80G approval AAAAD3793Q25LK02, valid for assessment years 2027–28 to 2031–32, so an investment from an Indian source carries the 80G deduction. Foreign contributions do not carry 80G; Indian tax deductions do not apply to money received under the Foreign Contribution (Regulation) Act.',
    go: { label: 'See the Registrations', view: 'finance' } },

  { cat: 'give', q: 'How do I get my receipt and 80G certificate?',
    keys: ['receipt', '10be', '10bd', 'certificate', 'proof of donation', 'acknowledgement'],
    a: 'Indian investments are reported in DEHAT\u2019s Form 10BD statement and the 80G certificate is issued to you as Form 10BE. You need to give a name, address and PAN for that statement to be filed correctly. If you transferred money by bank and have not heard from us, report the transfer on the Invest page and we will match it against the bank statement.',
    go: { label: 'Report a Transfer', view: 'involved' } },

  { cat: 'give', q: 'What is the smallest amount worth giving?',
    keys: ['minimum', 'small', 'how much', 'amount', 'least'],
    a: 'There is no minimum. Field costs are made of small recurring things \u2014 a child\u2019s travel to a hearing, a night in a shelter, a follow-up visit after a rescue. A regular small amount is more useful than an occasional large one, because it does not stop between grants.' },

  { cat: 'give', q: 'Can I choose what my money is used for?',
    keys: ['restrict', 'earmark', 'specific', 'programme', 'cause', 'designate', 'purpose'],
    a: 'Yes. The Invest page lists the purposes you can direct a contribution to, and you can also leave it unrestricted. Unrestricted money is the most useful kind, because it pays for the parts of the work no grant will fund \u2014 a case that runs three years longer than its project, or a salary between funding cycles.',
    go: { label: 'See the Purposes', view: 'involved' } },

  { cat: 'give', q: 'Can I give something other than money?',
    keys: ['kind', 'goods', 'material', 'equipment', 'books', 'donate items', 'in-kind'],
    a: 'Yes, but write to us first. In-kind contributions have to be valued, recorded and matched to a real need, and material that nobody in Bahraich asked for costs more to store than it is worth. Tell us what you have and we will say honestly whether it is useful.' },

  { cat: 'give', q: 'Can I set up a monthly investment?',
    keys: ['recurring', 'monthly', 'regular', 'standing instruction', 'subscription', 'sip'],
    a: 'Yes. The Invest page lets you choose a regular contribution rather than a single one. Regular giving is what lets DEHAT keep a case worker on a case after the project that funded the case has closed.',
    go: { label: 'Set One Up', view: 'involved' } },

  { cat: 'give', q: 'Can I give anonymously?',
    keys: ['anonymous', 'private', 'without my name', 'hide identity'],
    a: 'You can ask not to be named publicly, and we will not name you. We still have to record your identity in our own books: anonymous cash is exactly what the accounting rules exist to prevent, and an unnamed donation cannot carry an 80G certificate.' },

  { cat: 'give', q: 'Can I get a refund?',
    keys: ['refund', 'money back', 'cancel', 'reverse', 'mistake', 'wrong amount', 'duplicate'],
    a: 'For domestic investments, yes, in the circumstances set out in the refund policy \u2014 a duplicate charge, a wrong amount, a payment you did not authorise. Foreign contributions are different and cannot simply be returned on request; that is a legal restriction, not a policy choice. Read the refund policy in full before assuming either way.',
    go: { label: 'Read the Refund Policy', view: 'policies' } },

  { cat: 'give', q: 'What does a legacy gift involve?',
    keys: ['legacy', 'will', 'bequest', 'estate', 'after death', 'inheritance'],
    a: 'A legacy gift is a share of your estate left to DEHAT in your will, decided calmly and years in advance. It costs nothing now and it is the only kind of gift that can fund work beyond any grant cycle. Talk to us and to your own lawyer before writing it in; we will not draft your will for you.',
    go: { label: 'Read About Legacy Giving', view: 'involved' } },

  // ---- Foreign contributions ----
  { cat: 'foreign', q: 'Can I invest from outside India?',
    keys: ['foreign', 'abroad', 'overseas', 'fcra', 'international', 'usd', 'gbp', 'euro', 'nri'],
    a: 'Yes. DEHAT holds Foreign Contribution (Regulation) Act registration 136260010 and receives foreign contributions only into its designated State Bank of India account at 11 Sansad Marg, New Delhi. Money from a foreign source must enter that account and no other \u2014 sending it to a domestic account would put both of us in breach.',
    go: { label: 'See the Account Details', view: 'involved' } },

  { cat: 'foreign', q: 'What is FCRA and why does it matter to me?',
    keys: ['fcra', 'what is fcra', 'foreign contribution regulation act', 'why'],
    a: 'The Foreign Contribution (Regulation) Act governs how Indian organisations may receive and use money from foreign sources. It matters to you because it decides which account your money must enter, what DEHAT may spend it on, how it is reported to the Ministry of Home Affairs, and whether it can ever be sent back. An organisation without valid registration cannot lawfully accept your money at all.' },

  { cat: 'foreign', q: 'Am I a foreign source if I hold an Indian passport?',
    keys: ['nri', 'passport', 'foreign source', 'oci', 'pio', 'citizen', 'am i foreign'],
    a: 'Broadly, a non-resident Indian who remains an Indian citizen is not a foreign source, so an NRI investment from an Indian citizen is normally treated as domestic. A person of Indian origin holding foreign citizenship generally is a foreign source. The distinction turns on citizenship rather than residence, and it decides which account you must use \u2014 so tell us your citizenship and we will route it correctly rather than guess.' },

  { cat: 'foreign', q: 'What identification do you need from a foreign investor?',
    keys: ['kyc', 'passport', 'documents', 'identity', 'upload', 'verification'],
    a: 'A passport number and a scan of both sides of the passport, in addition to the contact and address details every investor gives. Indian investors instead provide a masked Aadhaar and PAN, also uploaded. These are statutory identification requirements, not marketing data.' },

  { cat: 'foreign', q: 'Where do I find the FC-4 returns?',
    keys: ['fc-4', 'fc4', 'fc-6', 'annual return', 'mha', 'ministry of home affairs', 'filing'],
    a: 'On the Transparency page. Every financial year that received foreign contribution shows its annual return beside that year\u2019s signed balance sheet. Where a return has not yet been published on the site, the row says so and gives you a way to ask us for it, rather than showing a link to a document that is not there.',
    go: { label: 'Open the Year-by-Year Record', view: 'finance' } },

  { cat: 'foreign', q: 'Can a foreign contribution be refunded?',
    keys: ['refund foreign', 'return foreign money', 'fcra refund', 'send back'],
    a: 'Not on request. A contribution in the designated Foreign Contribution (Regulation) Act account cannot simply be sent back: returning it is an outbound foreign remittance from a restricted account, governed by that Act, by the Foreign Exchange Management Act and by the bank holding the account, and it may need the bank\u2019s clearance or the Ministry of Home Affairs\u2019 concurrence. If you believe a contribution was sent in error, write to us and we will examine it with our auditor and our bank, and tell you in writing either way.',
    go: { label: 'Read the Refund Policy', view: 'policies' } },

  // ---- Accounts ----
  { cat: 'money', q: 'How much of my money reaches the work?',
    keys: ['overhead', 'admin', 'percentage', 'ratio', 'salaries', 'how much reaches'],
    a: 'Rather than quote a single ratio, DEHAT publishes what was committed and what was deployed for every financial year since 2005\u201306, each drawn from a signed balance sheet. Work the proportion out yourself from the audited figures \u2014 that is a stronger answer than any number an organisation chooses about itself.',
    go: { label: 'See Every Year', view: 'finance' } },

  { cat: 'money', q: 'Who audits your accounts?',
    keys: ['auditor', 'audit', 'ca', 'chartered accountant', 'statutory auditor', 'who signs'],
    a: 'Every year on the Transparency page names the firm that examined that year\u2019s books, with the Unique Document Identification Number where one exists. The auditor has changed over twenty years and the page shows each one against the years they signed, rather than naming only the current firm.',
    go: { label: 'See Who Signed Each Year', view: 'finance' } },

  { cat: 'money', q: 'Where are the balance sheets?',
    keys: ['balance sheet', 'accounts', 'financials', 'statements', 'pdf', 'annual accounts'],
    a: 'On the Transparency page, one per financial year from 2005\u201306 onwards, opening as a PDF from its row. Open any year to see what partners committed, what reached the work, who examined the books, and what the balance sheet carried into the next April.',
    go: { label: 'Open the Balance Sheets', view: 'finance' } },

  { cat: 'money', q: 'Who funds DEHAT?',
    keys: ['funders', 'funds', 'fund', 'funding', 'donors', 'investors', 'grants', 'who pays', 'who funds', 'supporters', 'backers'],
    a: 'Every institution and company whose funding is recorded against a named project appears on the site, with the years and the projects. Ask about any of them and we will tell you what the partnership covered, what it cost, what it produced, or why it ended.',
    go: { label: 'See the Funders', view: 'finance' } },

  { cat: 'money', q: 'Why do some years show incomplete data?',
    keys: ['partial', 'missing', 'summary only', 'not digitised', 'gap', 'incomplete'],
    a: 'Because the older records are signed paper scans and the per-project detail has not all been transcribed yet. Those years are marked as summary years on the page rather than quietly presented as complete. The headline figures are audited; the breakdown behind them is still being digitised.',
    go: { label: 'See Which Years', view: 'finance' } },

  // ---- Governance ----
  { cat: 'govern', q: 'Is DEHAT a registered organisation?',
    keys: ['registered', 'registration', 'society', 'legal', 'number', 'csr', 'niti'],
    a: 'Yes. Developmental Association for Human Advancement was registered as a society in 2000, eleven years after the work began. It holds 80G approval AAAAD3793Q25LK02, Foreign Contribution (Regulation) Act registration 136260010, and Corporate Social Responsibility registration CSR00001181. Every registration number on the site can be checked against the issuing authority.',
    go: { label: 'See the Registrations', view: 'finance' } },

  { cat: 'govern', q: 'Who runs DEHAT and who holds them accountable?',
    keys: ['board', 'governance', 'trustees', 'general body', 'leadership', 'founder', 'who is in charge'],
    a: 'There is a founder, two boards and a general body, and all of them are named on the site with their roles. The general body is where accountability is exercised rather than observed \u2014 members can question the executive directly.',
    go: { label: 'See Who Is Behind This', view: 'who' } },

  { cat: 'govern', q: 'Has DEHAT ever been investigated or penalised?',
    keys: ['investigation', 'penalty', 'notice', 'compliance', 'inquiry', 'action', 'scrutiny'],
    a: 'The examinations, inspections and statutory checks DEHAT has been through are listed on the Transparency page, including who conducted them. If you think something is missing from that list, ask for the document behind any entry and tell us where you believe the accountability gap is.',
    go: { label: 'Test the Record', view: 'finance' } },

  // ---- Safeguarding ----
  { cat: 'safe', q: 'What is your child protection policy?',
    keys: ['child protection', 'safeguarding', 'pocso', 'policy', 'children', 'safety'],
    a: 'DEHAT works with children who have been trafficked, married as minors, or put to work, so safeguarding is not an annexe to the work \u2014 it is the condition of doing it. The policies and safeguards are published in full, including how concerns are raised and who they reach.',
    go: { label: 'Read the Policies', view: 'policies' } },

  { cat: 'safe', q: 'How do I report a concern or a complaint?',
    keys: ['complaint', 'report', 'concern', 'grievance', 'whistleblow', 'misconduct', 'abuse'],
    a: 'Write to us directly. A concern about a child\u2019s safety, a staff member\u2019s conduct or the handling of money should not go through a contact form and wait its turn \u2014 say what happened and we will tell you who is handling it and by when.',
    go: { label: 'Raise It Now', view: 'finance', anchor: 'raise' } },

  { cat: 'safe', q: 'How do you protect the identity of children in your stories?',
    keys: ['consent', 'identity', 'privacy', 'photographs', 'names', 'anonymise', 'stories'],
    a: 'Historical consent is treated as inadequate for publication. Where a story comes from an old annual report, the family is re-contacted or the account is anonymised before it appears here. A story that cannot clear that bar is not published, however good it would look.' },

  // ---- The work ----
  { cat: 'work', q: 'Where does DEHAT work?',
    keys: ['where', 'where do you work', 'location', 'located', 'district', 'districts', 'bahraich', 'shravasti', 'nepal', 'geography', 'area', 'region', 'operate', 'based'],
    a: 'Bahraich and Shravasti in Uttar Pradesh, on the Nepal border, with cross-border child protection work running into Nepal. Everything in the organisation\u2019s history happens within a day\u2019s travel of Bahraich town.',
    go: { label: 'See the Work', view: 'work' } },

  { cat: 'work', q: 'What does DEHAT actually do?',
    keys: ['what do you do', 'programmes', 'projects', 'activities', 'mission', 'focus'],
    a: 'Child protection and anti-trafficking, education, maternal and child health, livelihoods and rights, and leadership among young people in the same districts. The programmes page sets out each one with the projects and the funding behind it.',
    go: { label: 'See the Programmes', view: 'work' } },

  { cat: 'work', q: 'How do you know the work is having an effect?',
    keys: ['impact', 'evidence', 'results', 'proof', 'evaluation', 'outcomes', 'measure'],
    a: 'The impact page carries the figures with their sources, including the district baselines they are measured against. Where a number comes from DEHAT\u2019s own records rather than an official series, the page says so instead of borrowing authority it does not have.',
    go: { label: 'See the Evidence', view: 'impact' } },

  { cat: 'work', q: 'When did DEHAT start?',
    keys: ['founded', 'history', 'when', 'start', 'origin', 'age', 'how old'],
    a: 'The work began in 1989 with an informal school for Tharu and other forest-dwelling children in Bichhia, run out of a youth group with no building and no registration. The society was registered in 2000. DEHAT counts 1989 as its beginning, eleven years before it existed on paper.',
    go: { label: 'Read the Journey', view: 'who' } },

  // ---- Working with DEHAT ----
  { cat: 'join', q: 'Can I volunteer or intern?',
    keys: ['volunteer', 'intern', 'internship', 'fellowship', 'student', 'work with you', 'placement'],
    a: 'Yes \u2014 fellowships, internships and field roles, in Bahraich and remotely. Find Your Route asks what you can actually offer and how much time you have, then tells you which routes DEHAT can honour this year rather than collecting your details for a list.',
    go: { label: 'Find Your Route', view: 'involved' } },

  { cat: 'join', q: 'Are there paid jobs?',
    keys: ['job', 'career', 'vacancy', 'hiring', 'employment', 'salary', 'recruit'],
    a: 'Field and programme roles open as projects are funded. Write to us with what you do and where you want to work, and we will tell you honestly whether there is capacity this year.' },

  { cat: 'join', q: 'Can my company partner with DEHAT on CSR?',
    keys: ['csr', 'corporate', 'company', 'schedule vii', 'business', 'partnership', 'csr-1'],
    a: 'Yes. DEHAT holds Corporate Social Responsibility registration CSR00001181 and states the Schedule VII alignment on every project in the register. Schedule VII money is decided months before the financial year turns, so bring the decision early and the first year is planned rather than improvised.',
    go: { label: 'Start a Conversation', view: 'involved' } },

  { cat: 'join', q: 'Can I visit the field?',
    keys: ['visit', 'field visit', 'come', 'see the work', 'travel', 'trip'],
    a: 'Yes, field visits in Bahraich and Shravasti can be arranged. Distance is what makes the work abstract, and it is much harder to hold an opinion about a district you have stood in.',
    go: { label: 'Arrange a Visit', view: 'involved' } },

  { cat: 'join', q: 'Can I use your models or research in my own work?',
    keys: ['research', 'academic', 'replicate', 'model', 'data request', 'study', 'adopt'],
    a: 'Yes. DEHAT works with academic research partners and its models are meant to be adopted elsewhere, with community resource persons available to other organisations. Anything published on this site can be requested in its underlying form.',
    go: { label: 'Request It', view: 'involved' } },

  // ---- Data and the site ----
  { cat: 'data', q: 'What do you do with my personal information?',
    keys: ['privacy', 'data', 'personal information', 'gdpr', 'store', 'share', 'sell'],
    a: 'Contact and identification details are used to issue your receipt, meet the statutory reporting DEHAT is bound to, and reply to you. The privacy policy sets out what is kept and for how long.',
    go: { label: 'Read the Privacy Policy', view: 'policies' } },

  { cat: 'data', q: 'Does this site use cookies?',
    keys: ['cookies', 'tracking', 'analytics', 'consent', 'cookie settings'],
    a: 'Some are essential to keep pages working. The rest are optional and off until you accept them. You can accept all, keep only the essential ones, or choose category by category, and change your mind at any time from Cookie Settings in the footer.' },

  { cat: 'data', q: 'Is this site available in Hindi?',
    keys: ['hindi', 'language', 'translate', 'bhasha', 'english'],
    a: 'Yes. Use the language switch in the navigation. The site is written to work in both languages rather than translated as an afterthought.' },
];
