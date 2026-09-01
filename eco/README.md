# INNOP Global India — Website

Static Bootstrap 5 / vanilla JS single-page site for INNOP Global India, a Purnia (Bihar, India)
based startup and innovation ecosystem initiative connected to the wider INNOP Global organization.

No build step. Open `index.html` directly in a browser, or serve the `eco/` folder as static files.

## Project structure

```
eco/
├── index.html              INNOP Global India site
├── eco.html                 Unrelated pre-existing "Ecosystem" page (untouched)
├── README.md                 This file
└── assets/
    ├── css/style.css         All page styles
    ├── js/main.js             All page logic, content data and MOCK_DATA
    └── images/                Empty — see "Images to add" below
```

## Parent website research

**Source:** https://innopglobal.com/ (plus its `/about-us/` page)
**Research date:** 2026-09-01
**Method:** automated fetch of the live public pages listed below. No PDFs, brochures or private
documents were available/inspected.

### Verified facts used on this site, with source

| Fact | Value used | Source URL |
|---|---|---|
| Organization name | INNOP Global Accelerator | https://innopglobal.com/ |
| Tagline | "Innovate, Launch and Accelerate" | https://innopglobal.com/ |
| Description | "Convenient, Accessible, and Affordable mentorship hub for Entrepreneurs, Startup Teams, and Independent Professionals" | https://innopglobal.com/ |
| Mission statement | "Develop and lead a venture ecosystem that leverages impact investment." | https://innopglobal.com/about-us/ |
| Vision statement | "Establish a global startup ecosystem, facilitate technology transfer, and accelerate startups to drive economic growth." | https://innopglobal.com/about-us/ |
| Startups supported (2019–2025) | 45 | https://innopglobal.com/about-us/ |
| Capital raise facilitated (2019–2025) | $50 million | https://innopglobal.com/about-us/ |
| Focus sectors | AgTech, BioTech, CleanTech, AI, Big Data, IoT, Quantum | https://innopglobal.com/, https://innopglobal.com/about-us/ |
| Headquarters | 2430 6th Ave, Suite A1, Greeley, CO 80631, USA | https://innopglobal.com/ |
| Phone | +1 (970) 988-8121 | https://innopglobal.com/ |
| Email | info@innopglobal.com | https://innopglobal.com/ |
| Facebook | https://www.facebook.com/Innovative-Preneurship-InnoP-869392506772440/ | https://innopglobal.com/ |
| LinkedIn | https://www.linkedin.com/company/innop/ | https://innopglobal.com/ |
| X / Twitter | https://twitter.com/innopglobal | https://innopglobal.com/ |

### Not verified / not stated on the parent website

These are **not** shown as facts anywhere on the India site:

- Founder, Director or CTO names — not listed on the parent site
- Year the organization was established — not stated
- Any office or presence outside Greeley, Colorado — the parent site references "local and global
  entrepreneurs" and "Accelerate Beyond USA" but does not name a second physical location; the
  India site is careful to say "USA-based parent organization" / "international connections,"
  never "USA office network" or similar
- Instagram / YouTube accounts — no links found
- Any India-specific office, staff, funding, clients, testimonials, certifications or awards

**No information above was invented.** Anything not in the verified table is either omitted or
clearly marked as mock/placeholder content (see below).

## Mock data (development placeholders — not real people)

`assets/js/main.js` contains a single `MOCK_DATA` object (search for
`MOCK DATA — REPLACE BEFORE PRODUCTION`) with 8 placeholder team entries:

- 1 Director
- 1 CTO
- 4 Mentors
- 2 Advisors

Every entry uses a generic placeholder name (e.g. `"Director Name — Mock Profile"`), not a real
person's identity, and is flagged with `mock: true`. The rendered team cards show a visible
**"MOCK PROFILE"** badge. Replace each entry with a real, verified profile before production —
do not simply remove the badge.

The Google Form URL (`INNOP_CONFIG.googleFormUrl` in `assets/js/main.js`) is also a literal
placeholder (`YOUR_GOOGLE_FORM_URL_HERE`) and is guarded in code so clicking "Continue to Google
Form" shows an alert instead of silently failing until it's configured.

## Before production — replacement checklist

```
[ ] Replace Director profile
[ ] Replace CTO profile
[ ] Replace Mentor profiles (4)
[ ] Replace Advisor profiles (2)
[ ] Add real team photographs (assets/images/team/)
[ ] Re-verify parent organization information against https://innopglobal.com/
[ ] Add official INNOP Global India social links (currently only the parent's are shown, labeled as such)
[ ] Add Google Form URL (INNOP_CONFIG.googleFormUrl in assets/js/main.js)
[ ] Verify WhatsApp number (+91-9959059985)
[ ] Verify India office/contact details for Purnia, Bihar
[ ] Verify accelerator eligibility criteria and FAQ answers
[ ] Legal review of all copy (no guaranteed-outcome language should be added)
[ ] Write and publish a real Privacy Policy (replaces the modal placeholder)
[ ] Write and publish real Terms of Use if required (replaces the modal placeholder)
[ ] Replace placeholder logo/favicon (currently an inline "I" mark)
[ ] Add real images to assets/images/{logo,team,about,network}/
[ ] Re-run SEO review (title/description/OG/schema) once content is final
[ ] Test all forms end-to-end (WhatsApp + Google Form paths)
[ ] Test on mobile (320–768px) and desktop (1024–1920px)
```

## Images to add

`assets/images/` is scaffolded but currently empty — the page uses inline SVG icons and CSS
gradients instead of photography so it works before real assets exist. Suggested subfolders:

```
assets/images/
├── logo/     brand mark / favicon source
├── team/     director, CTO, mentor and advisor photos
├── about/    Purnia/Bihar imagery for the About section
└── network/  any supporting network/ecosystem graphics
```

## Configuration

All easily-changeable values live at the top of `assets/js/main.js`:

```js
const INNOP_CONFIG = {
  organizationName: "INNOP Global India",
  parentWebsite: "https://innopglobal.com/",
  headquarters: "Purnia, Bihar, India",
  whatsappNumber: "919959059985",
  googleFormUrl: "YOUR_GOOGLE_FORM_URL_HERE",
  socialLinks: { ... }
};
```

## Notes on claims and language

- The site never claims guaranteed funding, guaranteed acceptance, or a guaranteed development
  team — copy consistently uses "access to," "subject to program availability," "guidance and
  support."
- As a static site with no backend, submission flows only ever open WhatsApp (`wa.me`) or a
  configured Google Form in a new tab — nothing is claimed to be "stored" or "saved to a database."
