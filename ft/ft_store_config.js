/* ═══════════════════════════════════════════════════════════════
   FT Book Store — fixed taxonomy (menu labels only).
   The actual question-set data lives in ft_store_data.csv — edit
   that file to add/update Google Drive links. This file rarely
   needs to change.
   ═══════════════════════════════════════════════════════════════ */

const FT_STORE_CLASSES = [
  "Nursery","LKG","UKG",
  "Class 1","Class 2","Class 3","Class 4","Class 5",
  "Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12",
  "12+","Graduation","UG","PG","PhD"
];

const FT_STORE_BOARDS = ["CBSE","ICSE","State Board","IB","Cambridge","Other Boards"];

const FT_STORE_STATE_BOARDS = [
  "Bihar Board","UP Board","Maharashtra Board","West Bengal Board","Rajasthan Board",
  "MP Board","Karnataka Board","Tamil Nadu Board","Kerala Board","Andhra Pradesh Board",
  "Telangana Board","Gujarat Board","Punjab Board","Haryana Board","Odisha Board",
  "Jharkhand Board","Other State Boards"
];

const FT_STORE_LANGUAGES = [
  "English","Hindi","Bengali","Marathi","Tamil","Telugu","Kannada",
  "Malayalam","Gujarati","Punjabi","Urdu"
];

const FT_STORE_COUNTRIES = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "UK", name: "UK", flag: "🇬🇧" }
];

const FT_STORE_EXAMS_BY_COUNTRY = {
  IN: ["UPSC","SSC","Banking","Railway","JEE","NEET","CAT","CUET","State Competitive Exams","Other Competitive Exams"],
  US: ["SAT","ACT","GRE","GMAT","TOEFL","Other Exams"],
  UK: ["GCSE","A-Level","IELTS","Other Exams"]
};

const FT_STORE_HIGHER_ED_LEVELS = ["UG","PG","PhD"];

const FT_STORE_HIGHER_ED_PROGRAMS = {
  UG: ["B.A.","B.Sc.","B.Com.","B.Tech.","BBA","BCA","Other Programs"],
  PG: ["M.A.","M.Sc.","M.Com.","MBA","MCA","M.Tech.","Other Programs"],
  PhD: ["Research / Thesis Resources"]
};
