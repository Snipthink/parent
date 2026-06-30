/**
 * config.js
 * Central registry of which CSV files exist for each country,
 * and which languages are available per country.
 * Add a new country/language by adding one line here + the CSV file.
 */
window.PORTAL_CONFIG = {
  countries: {
    india:     { label: 'India',     langs: ['en', 'hi'], default: 'en' },
    usa:       { label: 'USA',       langs: ['en'],       default: 'en' },
    germany:   { label: 'Germany',   langs: ['de'],       default: 'de' },
    canada:    { label: 'Canada',    langs: ['en', 'fr'], default: 'en' },
    australia: { label: 'Australia', langs: ['en'],       default: 'en' }
  },
  dataRoot: 'data/job-posts',
  companiesCSV: 'data/companies/companies.csv',
  testimonialsCSV: 'data/testimonials/applicants.csv',
  projectsCSV: 'data/projects/world_projects.csv',
  assessmentsRoot: 'data/assessments',

  /* Experience bands used by the Apply Now dialog + Job Search page filter.
     Matched against each job's experience_required_years. */
  experienceBands: {
    fresher:     { label: 'Fresher (0–1 yrs)',     max: 1 },
    medium:      { label: 'Medium Experience (2–4 yrs)', min: 2, max: 4 },
    experienced: { label: 'Experienced (5+ yrs)',  min: 5 }
  },

  /* Site / legal display details — single source of truth for the footer
     on every page. Edit here once, every page picks it up via renderFooter().
     Contact is handled entirely through the "Stay in Touch" button (an
     Instagram DM to @futuretrack__) instead of a published phone/email/
     address — see initStayInTouchModal() in js/app.js. */
  siteInfo: {
    legalName: 'Kaarigar Global Job Portal',
    tagline: 'Connecting skilled talent with verified employers worldwide — no agents, no fees.',
    parentCompany: 'Snipthink',
    instagramHandle: 'futuretrack__',
    social: {
      linkedin: 'https://linkedin.com/company/kaarigar',
      facebook: 'https://facebook.com/kaarigar',
      twitter: 'https://twitter.com/kaarigar',
      instagram: 'https://instagram.com/kaarigar'
    }
  }
};

/**
 * Resolves which language file to load for a country, following:
 * 1. Browser language (navigator.languages)
 * 2. Browser-inferred country/region match
 * 3. Country's configured default
 * 4. 'en' hard fallback
 */
function resolveLanguage(countryKey) {
  const country = window.PORTAL_CONFIG.countries[countryKey];
  if (!country) return 'en';

  const browserLangs = (navigator.languages || [navigator.language || 'en-US'])
    .map(l => l.toLowerCase());

  // 1. Exact browser language match (e.g. "hi" from "hi-IN")
  for (const bl of browserLangs) {
    const short = bl.split('-')[0];
    if (country.langs.includes(short)) return short;
  }

  // 2. Browser region implies a likely language (e.g. en-DE shouldn't force 'de',
  //    but de-DE matching germany's "de" already covered above). Region-only
  //    fallback: check if any browser locale's region code matches countryKey.
  for (const bl of browserLangs) {
    const region = bl.split('-')[1];
    if (region && region === countryRegionCode(countryKey) && country.langs.includes('en')) {
      return 'en';
    }
  }

  // 3. Country default
  if (country.default) return country.default;

  // 4. Hard fallback
  return country.langs.includes('en') ? 'en' : country.langs[0];
}

function countryRegionCode(countryKey) {
  const map = { india: 'in', usa: 'us', germany: 'de', canada: 'ca', australia: 'au' };
  return map[countryKey];
}

/** Builds the CSV path for a given country + language. */
function csvPathFor(countryKey, lang) {
  return `${window.PORTAL_CONFIG.dataRoot}/${countryKey}/jobpost_${lang}.csv`;
}

window.PortalLang = { resolveLanguage, csvPathFor };
