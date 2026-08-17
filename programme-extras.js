// Per-programme Sustainable Development Goal highlights and the segment of the
// Structural Vulnerability Cycle each programme addresses.
//
// Every Sustainable Development Goal referenced on the site now has artwork: goals 1, 2, 4, 5, 6, 8, 10,
// 13, 16 and 17 come from the illustration library; goal 3 is a drawn mark in the
// same ink-and-ochre vocabulary (assets/thumb/sdg-good-health.svg).

const S = 'assets/thumb/sdg-';

export const PROG_SDG = {
  sol: {
    label: 'Goals this programme reports against',
    goals: [
      { n: '4', name: 'Quality Education', img: S + 'quality-education.png',
        how: 'Bridge learning, re-enrolment and retention for children who have left school or never entered it.' },
      { n: '5', name: 'Gender Equality', img: S + 'gender-equality.png',
        how: 'Adolescent girls\u2019 collectives, menstrual health and dignity, and work against gendered restrictions on mobility and study.' },
      { n: '8', name: 'Decent Work and Economic Growth', img: S + 'decent-work.png',
        how: 'Skilling and livelihood pathways for young people so earning does not have to replace learning.' },
      { n: '10', name: 'Reduced Inequalities', img: S + 'reduced-inequalities.png',
        how: 'Child Parliaments and School Management Committees give children a place in decisions that are usually made without them.' },
    ],
  },
  re: {
    label: 'Goals this programme reports against',
    goals: [
      { n: '1', name: 'No Poverty', img: S + 'no-poverty.png',
        how: 'Facilitation of pensions, certificates and social protection entitlements the household is already eligible for.' },
      { n: '2', name: 'Zero Hunger', img: S + 'no-hunger.png',
        how: 'Convergence with Anganwadi and nutrition services so supplementary nutrition actually reaches the child.' },
      { n: '3', name: 'Good Health and Well-being', img: 'assets/thumb/sdg-good-health.png',
        how: 'Antenatal and postnatal care, immunisation follow-up and health-system convergence at the village level.' },
      { n: '10', name: 'Reduced Inequalities', img: S + 'reduced-inequalities.png',
        how: 'Work with the households least able to navigate administrative complexity alone.' },
      { n: '17', name: 'Partnerships for the Goals', img: S + 'partnership.png',
        how: 'Gram Sabha, Gram Panchayat and district administration coordination rather than parallel delivery.' },
    ],
  },
  cj: {
    label: 'Goals this programme reports against',
    goals: [
      { n: '2', name: 'Zero Hunger', img: S + 'no-hunger.png',
        how: 'Nutrition-sensitive agriculture, kitchen gardens, pulse cultivation and diversified local food production.' },
      { n: '6', name: 'Clean Water and Sanitation', img: S + 'clean-water.png', inv: true,
        how: 'Soil and water conservation, water testing and irrigation access in flood- and drought-exposed geographies.' },
      { n: '13', name: 'Climate Action', img: 'assets/story/sdg-climate-action.png',
        how: 'Low external input sustainable agriculture, seed conservation and adaptation led by women farmers.' },
      { n: '8', name: 'Decent Work and Economic Growth', img: S + 'decent-work.png',
        how: 'Local livelihoods and market linkage that reduce distress-driven migration.' },
      { n: '17', name: 'Partnerships for the Goals', img: S + 'partnership.png',
        how: 'Farmer federations working with the agriculture, horticulture and rural development departments.' },
    ],
  },
  hp: {
    label: 'Goals this programme reports against',
    goals: [
      { n: '16', name: 'Peace, Justice and Strong Institutions', img: S + 'peace.png',
        how: 'Case accompaniment, legal aid and follow-through with Child Welfare Committees, Anti-Human Trafficking Units, police and the courts.' },
      { n: '5', name: 'Gender Equality', img: S + 'gender-equality.png',
        how: 'Prevention of child marriage, response to violence and abuse, and support for girls after rescue.' },
      { n: '8', name: 'Decent Work and Economic Growth', img: S + 'decent-work.png',
        how: 'Target 8.7 in practice: child labour, bonded labour and trafficking for work.' },
      { n: '10', name: 'Reduced Inequalities', img: S + 'reduced-inequalities.png',
        how: 'Rehabilitation that continues after the case closes, so a rescued child is still safe a year later.' },
    ],
  },
};

// Keys below are the `short` labels of the cycle stages on the home page, so the
// same sixteen stages and the same figures are used everywhere.
export const PROG_CYCLE = {
  sol: {
    lede: 'The School of Leadership works at the point where a child leaves education, and at the pressures that push them out.',
    direct: {
      'School Dropout': 'Bridge learning centres, re-enrolment by name, and School Management Committees that follow up on absence.',
      'Menstrual Dignity': 'Adolescent health education and menstrual hygiene support so that a period does not end a girl\u2019s schooling.',
      'Boys as Bread-Earners': 'Skilling and livelihood pathways for adolescents, and work with parents on why earning need not replace study.',
      'Malnourished Child': 'Life skills and health education in learning centres, with referral to nutrition services.',
    },
    indirect: ['Child Marriage', 'Child & Bonded Labour', 'Discrimination and Violence', 'The Next Mother'],
  },
  re: {
    lede: 'Rights and Entitlements works where an eligible household cannot reach the service that was designed for it.',
    direct: {
      'No Ante- or Post-Natal Care': 'Facilitation of antenatal registration and follow-up, and convergence with the health system at village level.',
      'Irregular Immunisation': 'Immunisation tracking with Anganwadi and health workers, and household counselling on missed doses.',
      'Malnourished Child': 'Linkage to supplementary nutrition, growth monitoring and household-level care practices.',
      'Undernourished at Birth': 'Counselling on early and exclusive breastfeeding, and newborn care follow-up.',
      'Underage Mother': 'Anaemia screening, nutrition entitlements and maternal-health services for young mothers.',
    },
    indirect: ['Maternal Deaths', 'High Infant Mortality', 'Under-5 Deaths', 'The Next Mother'],
  },
  cj: {
    lede: 'Climate Justice works on the household economy and food system that decide whether a child has to leave.',
    direct: {
      'Malnourished Child': 'Kitchen gardens, pulse cultivation and diversified household food production.',
      'Boys as Bread-Earners': 'Local livelihoods and farmer collectives that reduce the need to send a son away for work.',
      'Undernourished at Birth': 'Year-round household food availability through nutrition-sensitive agriculture.',
    },
    indirect: ['School Dropout', 'Child & Bonded Labour', 'Child Marriage', 'Underage Mother'],
  },
  hp: {
    lede: 'Human Protection works where accumulated vulnerability turns into exploitation, and on the systems that should have noticed earlier.',
    direct: {
      'Human Trafficking': 'Interception, rescue and repatriation with the Sashastra Seema Bal, Anti-Human Trafficking Units, police and Child Welfare Committees.',
      'Child Marriage': 'Village and block child protection committees, Child Marriage Prohibition Officers, and prevention before the date is fixed.',
      'Child & Bonded Labour': 'Identification, withdrawal, labour-department action and school re-enrolment.',
      'Discrimination and Violence': 'Case accompaniment, legal aid, compensation claims and psychosocial support.',
      'Boys as Bread-Earners': 'Migration tracking that records who is moving, where, and with whom.',
    },
    indirect: ['School Dropout', 'Menstrual Dignity', 'Underage Mother', 'The Next Mother'],
  },
};

// Programme results drawn from the project register, 2000-2026. Indicator-specific by design:
// these are not added together, and there is no single total.
export const PROG_FIGURES = {
  hp: {
    label: 'What this programme has done',
    note: 'Counted from project reports and case files. Service events are not the same as children: one child may appear in several. We do not add these together.',
    items: [
      { n: '1,038', l: 'lost and runaway children restored to their families', src: '2010–2023' },
      { n: '640', l: 'children repatriated to Nepal through legal process', src: '2023–2025' },
      { n: '261', l: 'child marriages stopped in Shravasti', src: '2024–2025' },
    ],
  },
  sol: {
    label: 'What this programme has done',
    note: 'Education and livelihood counts from project reports. Where a figure covers several years, it is the reconciled total for that period.',
    items: [
      { n: '2,096', l: 'children completed the six-month bridge-centre cycle', src: '2016' },
      { n: '1,886', l: 'young people placed in work after training', src: '2012–2015' },
      { n: '1,287', l: 'girls enrolled in alternative learning centres', src: '2011' },
    ],
  },
  cj: {
    label: 'What this programme has done',
    note: 'Farming counts from project MIS. Reach means a household inside the intervention area; practice means the method was taken up.',
    items: [
      { n: '1,940', l: 'farmers in the intervention area', src: '2022–2025' },
      { n: '603', l: 'women farmers trained', src: '2022–2025' },
      { n: '302', l: 'farmers who reached a named government scheme', src: '2023–2025' },
    ],
  },
  re: {
    label: 'What this programme has done',
    note: 'Entitlement and land outcomes are counted where the household received the service or the title, not where a form was filed.',
    items: [
      { n: '1,670', l: 'families reached a government scheme they were already entitled to', src: '2003–2007' },
      { n: '141', l: 'families recovered land', src: '2003–2007' },
      { n: '53', l: 'families titled at Gokulpur, the first UP forest village made a revenue village', src: '2010' },
    ],
  },
};
