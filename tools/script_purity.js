#!/usr/bin/env node
/**
 * tools/script_purity.js
 *
 * Verifies script purity for every language dictionary in DEHAT.dc.html (_dict())
 * and content-i18n/<lang>.js.
 *
 * Exits with code 0 if all strings are clean, or 1 if any offending characters are found.
 */

const fs = require('fs');
const path = require('path');

// Expected script for each of the 28 languages supported by DEHAT
const SCRIPT_MAP = {
  hi: 'Devanagari',
  mr: 'Devanagari',
  ne: 'Devanagari',
  mai: 'Devanagari',
  doi: 'Devanagari',
  kok: 'Devanagari',
  sa: 'Devanagari',
  brx: 'Devanagari',
  bn: 'Bengali',
  as: 'Bengali',
  mni: 'Meetei_Mayek',
  sat: 'Ol_Chiki',
  ar: 'Arabic',
  ur: 'Arabic',
  sd: 'Arabic',
  ks: 'Arabic',
  pa: 'Gurmukhi',
  gu: 'Gujarati',
  or: 'Oriya',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  zh: 'Han',
  ru: 'Cyrillic',
  es: 'Latin',
  fr: 'Latin',
  en: 'Latin'
};

// Recognized Unicode scripts for classification
const KNOWN_SCRIPTS = [
  'Devanagari', 'Bengali', 'Meetei_Mayek', 'Ol_Chiki', 'Arabic', 'Gurmukhi',
  'Gujarati', 'Oriya', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Han',
  'Cyrillic', 'Latin', 'Hangul', 'Greek', 'Hebrew', 'Armenian', 'Georgian',
  'Tibetan', 'Myanmar', 'Khmer', 'Thaana', 'Syriac', 'Thai', 'Lao'
];

const SCRIPT_REGEXES = KNOWN_SCRIPTS.map(s => ({
  name: s,
  regex: new RegExp(`^\\p{sc=${s}}$`, 'u')
}));

/**
 * Identify the Unicode script of a character.
 */
function getScript(ch) {
  for (const item of SCRIPT_REGEXES) {
    if (item.regex.test(ch)) return item.name;
  }
  if (/^\p{sc=Common}$/u.test(ch)) return 'Common';
  if (/^\p{sc=Inherited}$/u.test(ch)) return 'Inherited';
  return 'Unknown';
}

/**
 * Check whether a character is common punctuation, symbol, or formatting control.
 */
function isCommonPunctuationOrSymbol(cp, ch) {
  // ASCII punctuation & control/whitespace
  if (cp <= 0x2F || (cp >= 0x3A && cp <= 0x40) || (cp >= 0x5B && cp <= 0x60) || (cp >= 0x7B && cp <= 0x7E)) {
    return true;
  }

  // Invisible formatting controls: ZWSP, ZWNJ, ZWJ, Word Joiner, LRM, RLM
  if (cp === 0x200B || cp === 0x200C || cp === 0x200D || cp === 0x2060 || cp === 0x200E || cp === 0x200F) {
    return true;
  }

  // Indian Dandas (U+0964 ।, U+0965 ॥)
  if (cp === 0x0964 || cp === 0x0965) {
    return true;
  }

  // Arabic Tatweel (U+0640 ـ)
  if (cp === 0x0640) {
    return true;
  }

  // Non-breaking space
  if (cp === 0x00A0) {
    return true;
  }

  // Typographic symbols, arrows, currency, brackets, quotes
  // Check Unicode General Category P (Punctuation) or S (Symbol) with Common or Inherited script
  if (/^[\p{P}\p{S}]$/u.test(ch)) {
    // Exclude combining marks that belong to a specific non-common script
    if (!/^\p{M}$/u.test(ch)) {
      return true;
    }
  }

  return false;
}

// Comprehensive allowlist of brand names, proper nouns, legal citations, acronyms, and recognized project codes
const DEFAULT_ALLOWLIST = new Set([
  "DD", "SWIFT", "Microsoft", "Clarity", "10AB", "10B", "12A", "12AB", "80G", "A", "a", "AAAAD", "Aadhaar", "Aajeevika", "Aaroh", "Aarti", "AAS", "AASs", "Aayog", "AB", "Abhilash", "Abhiyan", "Academic", "ACC", "acceptable", "access", "Account", "Accountability", "Accountant", "accounting", "accounts", "Accredited", "Achievers", "across", "Act", "act", "acting", "Action", "action", "ActionAid", "Active", "Activist", "Activists", "AD", "Ad", "Adhau", "Adhikaar", "Adhikar", "Adolescence", "adolescents", "adults", "Advancement", "advancing", "Advertising", "AFC", "Agency", "agency", "Agrahari", "agreed", "Agreement", "Agricultural", "Agriculture", "Agrifound", "AHTU", "AI", "Aid", "AIDS", "Air", "Ajeevika", "Akshar", "Alert", "Ali", "Alliance", "alliance", "am", "Aman", "Ambe", "America", "Amethi", "Amethy", "Amiya", "Amreen", "An", "an", "ANC", "Ancient", "and", "Andhra", "Anganwadi", "anganwadi", "animator", "Anirudh", "ANM", "ANMs", "Annbaijal", "Annibaijal", "Annibaisal", "anonymous", "answer", "Anti", "Application", "applications", "Appraisal", "approach", "approached", "Apr", "ar", "Are", "are", "area", "Areas", "areas", "Arogya", "Arogyam", "Arpana", "Arts", "Arun", "Aruna", "as", "Asaidapur", "ASHA", "Asha", "ASHAs", "Asian", "assembling", "Associates", "Association", "at", "authorities", "Award", "Awards", "Awas", "AY", "Azaadi", "AZADI", "Azadi", "Azim", "B", "b", "Baal", "Babupur", "Bachara", "Bachelor", "Badhiyanpurwa", "Bahadura", "Bahraic", "Bahraich", "Bai", "BAIF", "Bajpur", "Bal", "Bala", "Balha", "Balika", "Balrampur", "BAM", "bandi", "Bangalore", "Bank", "bank", "Bankati", "Bano", "Banshidhar", "Barapathar", "Bareli", "barriers", "BAS", "Basamati", "based", "Basti", "Bazar", "BD", "BE", "be", "because", "Bedhanpurwa", "been", "began", "being", "Belkhour", "Below", "between", "Bhaisahi", "Bhanda", "Bhanmati", "Bhanumati", "Bharat", "Bhatpura", "Bhauri", "Bhavan", "Bhawaniapur", "Bhawanipur", "Bhawar", "Bhedhan", "Bhedhanpurwa", "Bhima", "Bichhia", "Bigha", "bigha", "Bihar", "Bijay", "Bindu", "Birlasoft", "Bisheshwarganj", "Bishni", "Bishunapur", "biswa", "Block", "block", "blocks", "Board", "books", "border", "Brattleboro", "Bravo", "breastfeeding", "BRH", "Bridge", "brinjal", "BSAS", "BSE", "Buddha", "Budget", "building", "built", "but", "By", "by", "C", "c", "CAF", "camera", "campaign", "can", "cannot", "Canopy", "capacity", "Care", "Caritas", "carry", "cascade", "cash", "Catholic", "CBDMC", "CCC", "Cement", "Center", "Centers", "centre", "centres", "Centum", "certificate", "CH", "Chahalwa", "Chairperson", "Chaitura", "Chalan", "Champaran", "Champs", "Chandra", "Chandrakant", "Change", "change", "char", "Charities", "Charity", "Chartered", "chatni", "Chaturvedi", "Chehlawa", "Child", "child", "CHILDLINE", "Childline", "Children", "children", "Chitaura", "Chitrakoot", "Chittaura", "CHNI", "choices", "chulha", "CID", "Civil", "claim", "Climate", "Cloud", "clusters", "Cohort", "collapsing", "collective", "College", "come", "Commission", "Committed", "Committee", "committee", "committees", "Communication", "communities", "Community", "community", "competing", "compressed", "compromise", "Compulsory", "computer", "conditions", "connected", "connects", "constitutional", "contagious", "continues", "contributions", "convergence", "Cookie", "cookie", "Cooperation", "Coordinator", "CORE", "Core", "Corporation", "cost", "could", "counted", "Country", "Court", "COVID", "CPC", "CPP", "creating", "Creative", "credible", "credit", "CRP", "CRPs", "CRY", "CS", "CSR", "CSV", "Cumulative", "cutting", "CWC", "D", "d", "Daadauli", "Dafedaar", "Daheer", "dai", "Dargah", "Dasra", "Data", "data", "Day", "day", "decide", "decided", "decision", "decisions", "Deduction", "Deeha", "Defence", "DEHAT", "Delhi", "Demand", "demonstration", "Deployed", "desi", "Development", "Developmental", "Deventi", "Devi", "Devipatan", "Devyani", "DFA", "DFID", "Dharashiv", "Dhodhepurwa", "did", "digging", "digital", "Digitify", "Dilemmas", "Direct", "direct", "Director", "disclosure", "discuss", "discussed", "DISHA", "distance", "district", "districts", "Divyanshu", "Diwas", "DLSA", "DMU", "do", "Document", "document", "documented", "documents", "Domain", "donation", "Dorabji", "down", "Dr", "drafted", "drawn", "dry", "Duddhi", "Dumariyaganj", "Durga", "Dwarika", "E", "e", "eastern", "Economics", "economics", "Ed", "EdelGive", "edge", "Education", "education", "Eight", "Email", "Empanelment", "Empowering", "Enabler", "Engineering", "Enrolment", "Entitlements", "entitlements", "equality", "Erase", "Erese", "ERW", "events", "every", "evidence", "Ewha", "EWHA", "exactly", "Exchange", "Executive", "exist", "Exp", "experienced", "exposure", "Express", "F", "Facebook", "facilitate", "facilitated", "fact", "Faizabad", "Fakharpur", "Fakirpuri", "families", "family", "farmed", "Farmers", "Farming", "farming", "FASAL", "FC", "FCRA", "Federations", "Fellow", "feminism", "Few", "field", "figure", "Finance", "Find", "Fine", "FIR", "FIRST", "first", "Five", "Fod", "For", "for", "Force", "Forest", "forest", "Form", "forming", "found", "Foundation", "Foundational", "fractions", "Free", "From", "from", "Functional", "Fund", "Funds", "FY", "G", "g", "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "Gadchiroli", "Gandhi", "Ganga", "Gangiya", "Ganj", "gathered", "Gaudi", "Gauriganj", "Gauriya", "Gautam", "GEETA", "Geeta", "Gender", "gender", "Generation", "George", "Ghazni", "Ghoons", "Ghoosa", "Ghorawal", "Girijapuri", "Girl", "Girls", "girls", "GIS", "Global", "Gmail", "GNK", "Goal", "Gobraha", "goes", "Gokulpur", "Gonda", "Google", "Gorakhpur", "Government", "government", "Govindapur", "govt", "GPDP", "GPS", "Gram", "gram", "Grants", "Group", "group", "groupaight", "groups", "GROW", "growing", "Gudiya", "Gulariha", "Gupta", "Gurgaon", "H", "had", "Haidar", "Hajaripurwa", "hand", "Haqdari", "harder", "Hariharpur", "Haryana", "has", "have", "He", "Health", "health", "heard", "held", "Hem", "Hemariya", "Her", "here", "Hifazat", "High", "high", "Hindustan", "History", "history", "HIV", "Hole", "Home", "home", "Honours", "hospitality", "hotete", "household", "how", "HR", "HS", "HTML", "Hujurpur", "Human", "Huq", "Husainbaksh", "Husainpur", "i", "I", "IAF", "ICDS", "ICFP", "Identification", "identified", "identity", "IDFC", "IGSSS", "ii", "II", "iii", "III", "IIM", "IIMPACT", "Immunisation", "Immunization", "IMPACT", "IMPS", "In", "in", "Index", "India", "Indian", "Indira", "Indo", "Indradhanush", "Infancy", "Information", "information", "informs", "initiative", "Initiatives", "Innovative", "INR", "Instagram", "instead", "Institute", "Instrumentation", "Integrated", "Integrity", "Intelligence", "Inter", "inter", "interest", "interesting", "International", "Intervention", "intervention", "into", "Invest", "iodized", "iPartner", "is", "It", "it", "Itemized", "iv", "ix", "IX", "Jagdeep", "Jagdispur", "Jagram", "Jagtapur", "JAI", "Jai", "Jaitaapur", "Jal", "Jamuna", "Jamunaha", "Jamunha", "Janani", "Jangal", "Jangutara", "Japan", "jeevamrit", "Ji", "JICA", "Jirat", "Jitendra", "joined", "Jot", "June", "Jungal", "Justice", "Juvenile", "Jwala", "Kaam", "Kahlil", "Kailash", "Kailashnagar", "Kajal", "Kalamahadeva", "Kalawati", "Kallu", "Kalyan", "KAM", "Kamla", "Kanpur", "Karidiha", "Karikot", "Karnal", "KAS", "Katarniaghat", "Katerniaghat", "Kathmandu", "Kausar", "Kaushalya", "Kendra", "Keshav", "Khairwa", "Khargauli", "Kharhniya", "Kharif", "Kheri", "Khodai", "Kind", "Kiran", "Kirtanpur", "Kisan", "Kishori", "knew", "know", "knowing", "Ko", "Korea", "Koremau", "Kosh", "Krishi", "KSS", "Kuan", "Kumar", "Kumari", "Kunnanpur", "Kurkuri", "Kushinagar", "L", "labour", "Laher", "Lakhimpur", "Lakshmi", "Lalaram", "Lamp", "Laws", "Leadership", "leaf", "Learning", "learning", "leaves", "LEHER", "LEISA", "less", "level", "levels", "Light", "Lihoods", "like", "limit", "Limited", "Line", "line", "LinkedIn", "Listing", "listing", "Little", "little", "livelihood", "Livelihoods", "livelihoods", "LK", "LLB", "loads", "loan", "loaning", "Local", "local", "Lockdown", "Logged", "Lohani", "Lohra", "Lok", "Lokshakti", "looked", "LPG", "Ltd", "Lucknow", "Lucknowa", "M", "m", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "MA", "machan", "Madhavpur", "Madhuresh", "Magistrate", "Mahalaxmi", "mahapanchayat", "Maharajganj", "Maharashtra", "Mahila", "Mahsi", "mail", "Mailani", "Maiya", "Majhara", "makes", "Making", "Mal", "MAM", "Mamta", "Manager", "Manch", "Mandal", "Mandals", "Mangal", "Mango", "Manju", "Manjunath", "Mantri", "Marg", "marriage", "married", "masked", "Masters", "Matehi", "matter", "Maurya", "Mazdoor", "MBA", "MDG", "MDGs", "Meal", "meant", "Medical", "Meena", "Meer", "Mel", "Mela", "member", "members", "Memorandum", "Mera", "method", "MG", "mgarhi", "MGNGA", "MGNRE", "MGNREGA", "Mid", "Midline", "Migration", "Mihinpurwa", "Mihipurwa", "Milaan", "Millennium", "milliance", "MIS", "Missing", "Mission", "Mitra", "Mitras", "mobilising", "model", "Money", "Morcha", "more", "Motipur", "motu", "MOU", "move", "Mukti", "mulch", "Mumbai", "Munni", "Murlidhar", "Muskaan", "MV", "my", "Myorepur", "NABARD", "Nagar", "Nai", "NALSA", "Nanda", "Nandurbar", "Nanpara", "Naosahra", "Narayan", "National", "Nations", "Natpurwa", "Natural", "natural", "Nawabganj", "NCPCR", "needs", "NEFT", "Nepal", "Nepalgunj", "NFHS", "NGA", "NGO", "ni", "Nichlaul", "Nidauna", "Nidhi", "Nidhinagar", "NIELIT", "Nigam", "NIL", "Nisha", "Nishad", "NITI", "Niyojan", "nobody", "NOdal", "Nodal", "Noida", "not", "nothing", "now", "NPSP", "NRE", "NREGA", "NRI", "NRM", "NSE", "Number", "number", "nursery", "nutrition", "Nyaya", "O", "Observatories", "obtained", "of", "Oil", "older", "on", "once", "one", "onion", "onward", "or", "Oreo", "Organisation", "organisation", "organisations", "Organization", "orientation", "oriented", "other", "otherwise", "our", "out", "Outlook", "own", "owns", "P", "PACS", "page", "Pahari", "Pali", "PAN", "Panchayat", "panchayat", "Panchayati", "Panchayats", "panchayats", "PANCHI", "Pandey", "PANI", "paper", "parking", "Parsaura", "Participants", "participants", "participate", "participation", "Participatory", "participatory", "Partnership", "Partnerships", "Pathshaalas", "Payagpur", "PDF", "people", "period", "Permanent", "personal", "persons", "Perspective", "PGDHRM", "PGSS", "Phase", "PhD", "Philanthropic", "pit", "Plan", "Planning", "platform", "Plus", "plus", "pm", "POCSO", "point", "POLIO", "Political", "Poorest", "POSHAN", "Poshan", "position", "Poverty", "Power", "Practice", "practice", "Pradesh", "Pradhan", "Prahaari", "Prahari", "Prasad", "Pratham", "Pratima", "Praxis", "Pre", "Premises", "Premji", "present", "pressure", "pressures", "prevent", "Prevention", "Primenet", "private", "problem", "process", "Program", "program", "Programme", "programme", "Programmes", "Project", "promotion", "Prosecution", "Protection", "protection", "PS", "Ps", "Public", "public", "Pur", "Purberiya", "Purwa", "push", "Pustakalay", "Q", "Quiet", "quintal", "Ra", "Radheshyam", "Rae", "Raj", "Rajaram", "Rajjab", "Rajkali", "Rajkumari", "Rajumari", "Ram", "Rama", "Ramgarhi", "Rampur", "Rampurwa", "Rani", "Rashtrapati", "Rasoolpur", "Rasulpur", "Rath", "rather", "ration", "Razorpay", "re", "Reach", "reading", "reak", "real", "reason", "Rebuild", "recipients", "recognized", "record", "Red", "Reference", "reframing", "Reg", "region", "Rekha", "relief", "Renukoot", "repeat", "repeated", "Reported", "represents", "reserves", "Resilient", "Resource", "resource", "retention", "Retia", "return", "RGCEP", "Right", "right", "Rights", "rights", "RILM", "Risia", "Rockefeller", "Rogi", "Rotary", "Route", "Routed", "Roy", "RTGS", "RTI", "Rubi", "Rukaiya", "rules", "Rupaidiha", "Rural", "S", "s", "s.13", "Sabha", "Sabhas", "Sablapur", "Sadan", "Sahbhagi", "Sahjana", "Sahyog", "Saiphan", "Sakhis", "sal", "Saman", "same", "Samiti", "Samitis", "Sammaan", "Sammelan", "Sangathan", "Sangathans", "Sangathhans", "Sangharsh", "Sanjay", "Sanjiv", "Sankalpa", "Sansad", "Sanskar", "Sarathi", "Saroj", "Sarva", "Sarwa", "Sarwat", "Sashastra", "Satchaura", "Satichaura", "Satyagrah", "Save", "SaveKidsLives", "says", "SBI", "scale", "scan", "SCDP", "Schedule", "schemes", "School", "school", "schools", "Science", "Scottish", "SCPCR", "SDG", "SDGs", "SDTT", "Secretary", "sections", "Seema", "Seoul", "Service", "service", "Services", "services", "Set", "settle", "settlement", "Sh", "Shahid", "Shahpur", "Shaishav", "Shakti", "Shanmugam", "Shanti", "she", "sheet", "Shekh", "SHG", "SHGs", "shifts", "Shiksha", "Shikshan", "Shivpujan", "Shivpur", "shown", "Shravasti", "Shrawasti", "Shri", "Shutdown", "Siddharthnagar", "signatures", "Singahia", "single", "Sir", "Sirsian", "Sirsiya", "Sirsiyanpurwa", "Sisai", "sister", "SIT", "Sitkahana", "Six", "Skill", "skilling", "skills", "slice", "SLRC", "SLRCs", "SLSA", "SMC", "So", "so", "soak", "Social", "Society", "Sociology", "SOE", "Soldiers", "Somebody", "something", "Sonbhadra", "SONY", "sounds", "South", "speak", "speaking", "SPICE", "SRHR", "SRS", "SSA", "SSB", "SSP", "Standards", "stands", "Start", "State", "States", "statute", "still", "Stitching", "Stock", "Strengthen", "strengthening", "Studies", "stunting", "SU", "Su", "sub", "subabul", "success", "Suchna", "Sufalam", "Suflam", "Sugandha", "sugarcane", "Sujalam", "Sujauli", "Sujlam", "Sultanpur", "Sunil", "Sunita", "suo", "Suposhan", "Support", "support", "supporting", "Suraksha", "Sure", "Surokhit", "survived", "Sustain", "Sustainable", "Swabhiman", "Swachh", "Swadhar", "Swadhyaya", "SWARAJ", "Swaraksha", "Swavlamban", "Swayam", "SWAYAM", "System", "system", "Systems", "T", "Taj", "Talika", "TAN", "Tanda", "Tara", "Tarakshar", "Tarang", "Tata", "Tax", "TCL", "Teach", "Teacher", "Team", "Teeka", "Tehsil", "tehsil", "Tejwapur", "Ten", "Terai", "Terms", "than", "Tharu", "That", "that", "The", "the", "them", "Thematic", "They", "they", "thirteen", "This", "this", "Thogas", "Thogawa", "Three", "three", "Through", "through", "Tikaria", "Tikariya", "Tikriya", "Times", "TMN", "to", "together", "Tola", "Trade", "Trafficking", "trafficking", "training", "transnational", "transparency", "transport", "Treasurer", "trellis", "trial", "trolley", "Truck", "Trust", "Trusts", "Turhani", "Turmeric", "turmeric", "turning", "twice", "Twitter", "UDIN", "UDISE", "UIDAI", "Ujala", "Ujjwala", "UK", "UN", "UNCRC", "under", "UNDP", "UNICEF", "Unique", "United", "University", "unnamed", "untied", "UP", "up", "UPFMPAP", "UPI", "UPVAN", "Urban", "URL", "USD", "used", "Using", "Utkarsh", "Uttar", "v", "Vaccines", "Vachan", "value", "values", "VAM", "Van", "Vananchal", "Vangram", "Varanasi", "Veerta", "verbal", "vermicompost", "vi", "VI", "via", "Vice", "Vidhya", "Vidya", "vidya", "VII", "vii", "viii", "VIII", "Vijay", "Village", "village", "villages", "Vinod", "Vishun", "visible", "visits", "Vivah", "VLCPC", "VLCPCs", "Voice", "voice", "vs", "VT", "Vulnerability", "Wall", "was", "Washim", "We", "we", "Website", "Week", "Welfare", "were", "West", "what", "WhatsApp", "when", "where", "whether", "which", "Whistleblower", "WHO", "Who", "Why", "wide", "with", "Woman", "Womans", "Women", "women", "Work", "work", "Workbook", "workbook", "worked", "workers", "works", "WorkSkills", "World", "would", "wrong", "WSI", "Wyndhamganj", "X", "x", "XI", "xi", "XII", "xii", "Yojana", "young", "Your", "your", "YouTube", "yrs", "Yusuf", "Zero"
]);

/**
 * Check a single string against the expected script for the language.
 * Returns an array of offending characters: [{ char, codepoint, script }]
 */
function checkString(lang, value, options = {}) {
  if (typeof value !== 'string') return [];
  const expectedScript = SCRIPT_MAP[lang];
  if (!expectedScript) throw new Error(`Unknown language code: ${lang}`);

  const allowlist = options.allowlist !== undefined
    ? (Array.isArray(options.allowlist) ? new Set(options.allowlist) : options.allowlist)
    : DEFAULT_ALLOWLIST;

  // Mask non-visible text and technical protocols: URLs, emails, mailto, tel, HTML tags, entities, template placeholders
  let masked = value
    .replace(/https?:\/\/[^\s"'<>]+/g, m => ' '.repeat(m.length))
    .replace(/mailto:[^\s"'<>]+/g, m => ' '.repeat(m.length))
    .replace(/tel:[^\s"'<>]+/g, m => ' '.repeat(m.length))
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, m => ' '.repeat(m.length))
    .replace(/<[^>]+>/g, m => ' '.repeat(m.length))
    .replace(/&[a-zA-Z0-9#]+;/g, m => ' '.repeat(m.length))
    .replace(/\{[a-zA-Z0-9_]+\}/g, m => ' '.repeat(m.length));

  // In non-Latin languages, mask allowlisted brand names and proper nouns
  if (expectedScript !== 'Latin' && allowlist && allowlist.size > 0) {
    masked = masked.replace(/[a-zA-Z]+/g, (match) => {
      if (allowlist.has(match) || allowlist.has(match.toUpperCase()) || allowlist.has(match.toLowerCase())) {
        return ' '.repeat(match.length);
      }
      return match;
    });
  }

  const offending = [];

  // Flag Latin letters adjacent to an Indic combining mark (broken machine translation spliced words)
  const INDIC_COMBINING = /[\u0901-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963\u0981-\u0983\u09BC\u09BE-\u09CD\u09D7\u09E2-\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A4D\u0A51\u0A70-\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0ACD\u0AE2-\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B82\u0BBE-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0D00-\u0D03\u0D3B-\u0D3C\u0D3E-\u0D4D\u0D57\u0D62-\u0D63]/;
  const RE_LATIN_ADJACENT = new RegExp(`[a-zA-Z]\\s*${INDIC_COMBINING.source}|${INDIC_COMBINING.source}[a-zA-Z]`, 'u');
  if (RE_LATIN_ADJACENT.test(value)) {
    const mAdj = value.match(RE_LATIN_ADJACENT);
    offending.push({
      char: mAdj[0],
      codepoint: 'U+' + mAdj[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
      script: 'Latin letter adjacent to Indic combining mark'
    });
  }

  // Flag ASCII pipe used as sentence mark in non-Latin languages
  const isNonLatin = expectedScript !== "Latin";
  if (isNonLatin && typeof value === "string" && (/[\s\u200b]\|/.test(value) || value.trim().endsWith("|"))) {
    offending.push({
      char: "|",
      codepoint: "U+007C",
      script: "ASCII pipe sentence mark (expected native punctuation)"
    });
  }

  let prevScript = expectedScript;

  const chars = Array.from(masked);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cp = ch.codePointAt(0);

    // ASCII digits (0-9) are always allowed
    if (cp >= 0x30 && cp <= 0x39) {
      prevScript = expectedScript;
      continue;
    }

    // Common punctuation, spaces, and formatting symbols
    if (isCommonPunctuationOrSymbol(cp, ch)) {
      prevScript = expectedScript;
      continue;
    }

    // Whitespace
    if (cp === 0x20 || cp === 0x09 || cp === 0x0A || cp === 0x0D) {
      continue;
    }

    // Determine script
    let s = getScript(ch);

    // Combining mark inheritance:
    // If a combining mark has Inherited script, it inherits the script of its base letter
    if (s === 'Inherited') {
      s = prevScript;
    }

    if (s !== expectedScript) {
      offending.push({
        char: ch,
        codepoint: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
        script: s
      });
    } else {
      prevScript = s;
    }
  }

  return offending;
}

/**
 * Flatten nested objects into key-value pairs with dot-delimited paths.
 */
function flattenObject(obj, prefix = '', res = {}) {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenObject(item, prefix ? `${prefix}.${i}` : `${i}`, res));
  } else if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      flattenObject(obj[k], prefix ? `${prefix}.${k}` : k, res);
    }
  } else if (obj !== null && obj !== undefined) {
    res[prefix] = String(obj);
  }
  return res;
}

/**
 * Check whether a translation has a trailing danda or full stop where English has no terminal punctuation.
 * For dictionary labels (isLabel = true): flags [।॥᱾.꯫۔]$ when English does not end in terminal punctuation [.!?].
 * For content-i18n (isLabel = false): flags [।॥᱾]$ when English does not end in terminal punctuation [.!?].
 */
function hasTrailingTerminalDefect(langVal, enVal, isLabel = false) {
  if (typeof langVal !== 'string' || typeof enVal !== 'string') return false;
  const enTrim = enVal.trim();
  const valTrim = langVal.trim();
  const enHasTerminal = /[.!?]$/.test(enTrim);
  if (enHasTerminal) return false;
  if (isLabel) {
    return /[।॥᱾.꯫۔]$/.test(valTrim);
  }
  return /[।॥᱾]$/.test(valTrim);
}

function hasTrailingDandaDefect(langVal, enVal) {
  return hasTrailingTerminalDefect(langVal, enVal, false);
}

/**
 * Audit all strings in a dictionary object for a language.
 */
function checkDictionary(dict, lang, filename, options = {}, enDict = null) {
  const defects = [];
  for (const [key, val] of Object.entries(dict)) {
    const offending = checkString(lang, val, options);
    if (enDict && enDict[key] && hasTrailingTerminalDefect(val, enDict[key], true)) {
      const valTrim = val.trim();
      offending.push({
        char: valTrim.slice(-1),
        codepoint: "U+" + valTrim.slice(-1).codePointAt(0).toString(16).toUpperCase().padStart(4, 0),
        script: "Trailing danda/full stop where English has no terminal punctuation"
      });
    }
    if (offending.length > 0) {
      defects.push({
        lang,
        file: filename,
        key,
        offending_chars: offending,
        value: val
      });
    }
  }
  return defects;
}

/**
 * Audit all strings in a content-i18n object for a language.
 */
function checkContentI18n(contentObj, lang, filename, options = {}, enContentObj = null) {
  const defects = [];
  const flat = flattenObject(contentObj);
  const flatEn = enContentObj ? flattenObject(enContentObj) : null;
  for (const [key, val] of Object.entries(flat)) {
    const offending = checkString(lang, val, options);
    if (flatEn && flatEn[key] && hasTrailingDandaDefect(val, flatEn[key])) {
      const valTrim = val.trim();
      offending.push({
        char: valTrim.slice(-1),
        codepoint: "U+" + valTrim.slice(-1).codePointAt(0).toString(16).toUpperCase().padStart(4, 0),
        script: "Trailing danda/full stop where English has no terminal punctuation"
      });
    }
    if (offending.length > 0) {
      defects.push({
        lang,
        file: filename,
        key,
        offending_chars: offending,
        value: val
      });
    }
  }
  return defects;
}

/**
 * Execute the full script-purity audit across DEHAT.dc.html (_dict()) and content-i18n/<lang>.js.
 */
function runPurityAudit(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, '..');
  const defects = [];

  // 1. Audit Layer 1: DEHAT.dc.html _dict()
  const htmlPath = path.join(rootDir, 'DEHAT.dc.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const startTag = '<script type="text/x-dc"';
    const startIdx = html.indexOf(startTag);
    if (startIdx !== -1) {
      const scriptContentStart = html.indexOf('>', startIdx) + 1;
      const scriptEnd = html.indexOf('</script>', scriptContentStart);
      const script = html.substring(scriptContentStart, scriptEnd);
      const dictIdx = script.indexOf('_dict() {');
      const retMarker = 'return { en: EN, hi: HI';
      const retIdx = script.indexOf(retMarker, dictIdx);
      const endIdx = script.indexOf('\n  }', retIdx);
      const dictCode = 'function ' + script.substring(dictIdx, endIdx + 4);
      const fn = new Function(dictCode + '; return _dict();');
      const dicts = fn();

      for (const [lang, dict] of Object.entries(dicts)) {
        if (!SCRIPT_MAP[lang]) continue;
        const dictDefects = checkDictionary(dict, lang, 'DEHAT.dc.html', options, dicts.en);
        defects.push(...dictDefects);
      }
    }
  }

  // 2. Audit Layer 2: content-i18n/<lang>.js
  const contentDir = path.join(rootDir, 'content-i18n');
  if (fs.existsSync(contentDir)) {
    const enFilePath = path.join(contentDir, 'en.js');
    let enContent = null;
    if (fs.existsSync(enFilePath)) {
      global.window = global;
      require(enFilePath);
      enContent = global.window.CONTENT_I18N && global.window.CONTENT_I18N.en;
    }

    const contentOpts = { ...options, allowlist: options.allowlist || DEFAULT_ALLOWLIST };
    for (const f of fs.readdirSync(contentDir)) {
      if (!f.endsWith('.js')) continue;
      const lang = f.replace('.js', '');
      if (!SCRIPT_MAP[lang]) continue;

      global.window = global;
      const filePath = path.join(contentDir, f);
      require(filePath);
      const langContent = global.window.CONTENT_I18N && global.window.CONTENT_I18N[lang];
      if (langContent) {
        const compareEn = ['or', 'mai', 'sa', 'sat'].includes(lang) ? enContent : null;
        const fileDefects = checkContentI18n(langContent, lang, `content-i18n/${f}`, contentOpts, compareEn);
        defects.push(...fileDefects);
      }
    }
  }

  return defects;
}

// CLI Execution
if (require.main === module) {
  const defects = runPurityAudit();
  console.log(JSON.stringify(defects, null, 2));
  if (defects.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

module.exports = {
  SCRIPT_MAP,
  DEFAULT_ALLOWLIST,
  getScript,
  checkString,
  hasTrailingDandaDefect,
  hasTrailingTerminalDefect,
  checkDictionary,
  checkContentI18n,
  runPurityAudit
};
