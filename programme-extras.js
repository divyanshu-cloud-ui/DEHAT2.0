// Per-programme Sustainable Development Goal highlights and the segment of the
// Structural Vulnerability Cycle each programme addresses.
//
// Every Sustainable Development Goal referenced on the site now has artwork: goals 1, 2, 4, 5, 6, 8, 10,
// 13, 16 and 17 come from the illustration library; goal 3 is a drawn mark in the
// same ink-and-ochre vocabulary (assets/thumb/sdg-good-health.svg).

const S = 'assets/thumb/sdg-';

export const PROG_SDG = {
  sol: {
    label: 'Goals This Programme Reports Against',
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
    label: 'Goals This Programme Reports Against',
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
    label: 'Goals This Programme Reports Against',
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
    label: 'Goals This Programme Reports Against',
    goals: [
      { n: '16', name: 'Peace, Justice and Strong Institutions', img: S + 'peace.png',
        how: 'Case accompaniment, legal aid and follow-through with Child Welfare Committees, Juvenile Justice Boards, Anti-Human Trafficking Units, police, the courts, Legal Services Authorities (DLSA, SLSA, NALSA) and the child rights commissions (SCPCR, NCPCR).' },
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
      'Human Trafficking': 'Interception, rescue and repatriation with the Sashastra Seema Bal, Anti-Human Trafficking Units, police and Child Welfare Committees. A large share of the trafficking caseload is labour trafficking — children moved across the border or between districts into brick kilns, dhabas, domestic service and workshops — so trafficking and child-labour response run as one intersecting caseload, not two separate systems.',
      'Child Marriage': 'Village and block child protection committees, Child Marriage Prohibition Officers, and prevention before the date is fixed.',
      'Child & Bonded Labour': 'Identification, withdrawal, labour-department action and school re-enrolment. Withdrawals from brick kilns, dhabas, workshops and domestic labour are cross-checked against the trafficking register, since many working children were moved into that labour by a trafficker in the first place.',
      'Discrimination and Violence': 'Case accompaniment, legal aid, compensation claims and psychosocial support.',
      'Boys as Bread-Earners': 'Migration tracking that records who is moving, where, and with whom — the same tracking that flags a labour-trafficking risk before a child leaves the village.',
    },
    indirect: ['School Dropout', 'Menstrual Dignity', 'Underage Mother', 'The Next Mother'],
  },
};

// Programme-level results, 2000-2026: the macro, cross-project footprint of each
// programme as a whole. Project-specific detail lives on each project's own record
// under "Impact numbers" — these figures are deliberately not a re-listing of that.
// Indicator-specific by design: these are not added together, and there is no single total.
export const PROG_FIGURES = {
  hp: {
    label: 'What This Programme Has Done',
    note: 'Cumulative across every case this programme has responded to. One child may appear in more than one figure, so these are not added together. Trafficking and child labour are treated as one intersecting caseload, since children are often moved into labour by the same trafficker.',
    items: [
      { n: '3,271', l: 'Children\u2019s Cases Logged and Carried through the Emergency Helpline Register', src: '' },
      { n: '1,831', l: 'Child Marriages Stopped before the Wedding Date', src: '' },
      { n: '1,038', l: 'Lost, Abandoned and Runaway Children Restored to Their Families', src: '' },
      { n: '642', l: 'Child-Labour Cases Resolved, Cross-Checked Against the Trafficking Register', src: '' },
      { n: '382', l: 'Children Intercepted from Cross-Border Trafficking Risk, 72 of Them Carried to a Registered FIR', src: '' },
    ],
  },
  sol: {
    label: 'What This Programme Has Done',
    note: 'Cumulative across every capacity-building activity this programme has carried out with children, adolescents and the community-based organisations around them, since 2000.',
    items: [
      { n: '14,628', l: 'Children and Adolescents Reached through Capacity-Building Activities across Learning Centres, Schools and Bridge Courses', src: '' },
      { n: '1,886', l: 'Rural Youth Trained and Placed in Formal Work', src: '' },
      { n: '263', l: 'Women\u2019s Self-Help Groups Capacity-Built, Running Their Own Savings and Enterprise', src: '' },
      { n: '222', l: 'Village Level Child Protection and Welfare Committees Capacity-Built', src: '' },
      { n: '86', l: 'School Management Committees Capacity-Built, Running Their Own School Development Plans', src: '' },
      { n: '78', l: 'Aajeevika Adhikar Sangathans Capacity-Built as Community-Led Livelihood-Rights Collectives', src: '' },
      { n: '43', l: 'Child Parliaments Capacity-Built, Electing Their Own Child Representatives', src: '' },
      { n: '40', l: 'Parent Teacher Associations Formed and Meeting', src: '' },
      { n: '40', l: 'Mahila Arogya Samitis Mobilised as the Community Health Backbone', src: '' },
      { n: '268', l: 'Village Health and Sanitation Committee Members Capacity-Built', src: '' },
      { n: '40', l: 'Community Health Groups Capacity-Built through Further Training', src: '' },
      { n: '26', l: 'Joint Forest Management Committees Constituted with Forest-Fringe Communities', src: '' },
      { n: '23', l: 'Adolescent and Youth Collectives Capacity-Built \u2014 Bal Adhikar Manch, Kishori Sangathans and Border-Village Youth Groups', src: '' },
      { n: '16', l: 'Gram Sabha Structures Strengthened through Open Meetings and Village Development Plans', src: '' },
    ],
  },
  cj: {
    label: 'What This Programme Has Done',
    note: 'Cumulative across every farming community this programme has worked with. Money the community has drawn from government schemes because of this work is shown once, under Rights & Entitlements. Community-based organisations this work has capacity-built are shown once, under School of Leadership.',
    items: [
      { n: '2,460', l: 'Farmers on the Journey from Low External Input Sustainable Agriculture to Natural Farming, and towards Organic Certification', src: '' },
      { n: '725', l: 'Women Farmers Reached and Organised into Farming Collectives', src: '' },
      { n: '74', l: 'Community Resource Persons Guiding the Shift from Chemical-Input Farming towards Organic Certification', src: '' },
    ],
  },
  re: {
    label: 'What This Programme Has Done',
    note: 'Cumulative across every household and public system this programme has worked with, and the single home for every convergence figure so nothing is counted twice. Community-based organisations this work has capacity-built are shown once, under School of Leadership. Quiet, personal shifts \u2014 a family knowing and acting on a right \u2014 are real but are not counted as a number here.',
    items: [
      { n: '\u20b98,88,39,817', l: 'In Government Schemes and Village Infrastructure the Farmer Collectives Drew into Their Own Villages since 2016, through Community\u2013Administration Convergence', src: '' },
      { n: '5,225', l: 'Women Reached and Organised Around Their Own Entitlements', src: '' },
      { n: '4,051', l: 'Families Securing Statutory Entitlements, Land Rights and Relief', src: '' },
      { n: '903', l: 'Gram Panchayats Surveyed across All Fourteen Development Blocks of Bahraich for the Statutory Employment-Guarantee Perspective Plan', src: '' },
    ],
  },
};
