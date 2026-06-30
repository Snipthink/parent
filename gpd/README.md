# Kaarigar — Global Job Portal

A fully static site. Double-click `index.html` (or open any page) and it works —
no server, no build step, no CORS issues.

## Where the data lives (each entity is now its own file)

Browsers block `fetch()` of local `.csv`/`.json` files when a page is opened
directly (`file://...`) — there's no server to serve them, so CORS blocks the
request. To keep "just open index.html, no server" working, your data is
**pre-baked into small JS files**, one per entity, that embed the CSV contents
as JS objects (`window.SOMETHING_DATA = [...]`):

| Source CSV (canonical) | Generated JS file |
|---|---|
| `data/categories/categories.csv` | `js/data/categories.js` |
| `data/job-posts/india/jobpost_<lang>.csv` | `js/data/jobs-india.js` |
| `data/job-posts/usa/jobpost_<lang>.csv` | `js/data/jobs-usa.js` |
| `data/job-posts/germany/jobpost_<lang>.csv` | `js/data/jobs-germany.js` |
| `data/job-posts/canada/jobpost_<lang>.csv` | `js/data/jobs-canada.js` |
| `data/job-posts/australia/jobpost_<lang>.csv` | `js/data/jobs-australia.js` |
| `data/companies/companies.csv` | `js/data/companies.js` |
| `data/testimonials/applicants.csv` | `js/data/testimonials.js` |
| `data/projects/world_projects.csv` | `js/data/projects.js` |

**Why split into separate files this round:** previously `siteData.js` mixed
companies + testimonials + projects together, and all five countries' jobs
were baked into one large `jobsData.js`. That made every update touch one
giant shared file. Now each entity/country has its own file under `js/data/`,
so updating (say) just the Canada job listings, or just testimonials, means
editing one small file — nothing else needs to change, and nothing else risks
breaking.

**To update data:** edit the source CSV, then re-run whatever generator
script produced the matching JS file (the comment at the top of each file
notes this, e.g. `gen_categories.py`). Send over the generator script or the
raw CSVs any time and I'll wire up regeneration or do it for you directly.

All the `js/data/*.js` files are included as plain `<script>` tags before
`js/config.js` and `js/app.js` on every page — order between them doesn't
matter, since each one only adds its own piece (e.g. each `jobs-<country>.js`
does `window.JOBS_DATA = window.JOBS_DATA || {}` then sets just its own key).

If you ever *do* deploy this behind a real web server (Netlify, GitHub Pages,
nginx, etc.), live CSV/JSON fetching becomes possible too — just say so and
I'll add a small loader as an alternative path.

## What I changed this round

- **Footer contact info removed.** No more published phone number, email
  address, or postal address anywhere on the site (footer, Terms, Privacy).
  In its place there's a **"Stay in Touch"** button (footer, every page) that
  opens a small dialog (name + message) and, on submit, opens a direct
  message to **@futuretrack__ on Instagram** (copies your message to the
  clipboard first, since Instagram's DM links can't pre-fill text). Wired up
  in `initStayInTouchModal()` in `js/app.js`; the handle lives in
  `js/config.js → siteInfo.instagramHandle` so it's a one-place change.
- **Footer bottom line cleaned up.** Removed the "CIN: ... no server or SQL
  required" disclaimer line. It now reads **"A Snipthink company"** —
  `siteInfo.parentCompany` in `js/config.js`, one place to change.
- **Post a Job dialog — Step 1 icon fix.** The category-selection cards
  (Skilled Trade, Healthcare, IT, Manufacturing, Construction, Logistics)
  were rendering as plain text with no icon at all. Added real icon SVGs
  (`assets/icons/category-*.svg`) and wired them into the Step 1 cards via
  the same `iconHTML()` fallback pattern used elsewhere, so they show a real
  icon and gracefully fall back to an emoji if a file ever 404s.
- **Real icon + flag SVGs added.** `assets/icons/*.svg` (10 sub-category
  icons + 6 top-level category icons) and `assets/flags/*.svg` (India, USA,
  Germany, Canada, Australia) — these were referenced in code but missing
  from the upload, so every icon/flag was either a broken image or silently
  falling back to an emoji. They're real files now.
- **Homepage section order changed.** Was Hero → How it Works → Find Jobs →
  Partners → Testimonials. Now: **Hero → Find Jobs → How it Works → Post a
  Job → Partners → Testimonials.** "Post a Job" is a brand-new dedicated
  section (not just the nav button) with its own heading, blurb, and a
  **Post Now** button that opens the same Post-a-Job dialog as the nav
  button. Nav links across all pages were reordered to match, and a
  "Post a Job" nav link was added.

## What was added in earlier rounds

- **Dashboard-style "Find a job" section on the homepage** — three live stat
  cards (Available Jobs, Countries Hiring, Candidates Hired) and a single
  **Apply Now** button that opens a Country / Category / Experience dialog
  and redirects into…
- **`job-search.html`** — dedicated job-search page, reads filters from the
  URL, lists 10 jobs per page with pagination, **Know More** / **Apply Now**
  links per card, **"Assessment Needed"** badge when relevant.
- **Full footer on every page**, rendered once from `js/config.js →
  siteInfo` by `renderFooter()` in `js/app.js`.
- **`terms.html`** and **`privacy.html`** — static legal pages, linked from
  the footer.
- **Post-a-Job modal** — 3-step "Choose category → sub-category → confirm &
  apply" dialog, fully styled.
- **`how-to-apply.html`** and **`job-detail.html`**.

## Structure
```
index.html              homepage (dashboard stats, Find Jobs, How it Works, Post a Job, partners, testimonials)
job-search.html          dedicated job search page (filters + 10/page results)
how-to-apply.html        applicant guide
job-detail.html          individual job page (?id=...&country=...)
terms.html               Terms & Conditions
privacy.html             Privacy Policy
css/style.css            theme (dark/light via data-theme + CSS vars)
js/app.js                all rendering + filtering logic
js/config.js             country/language config, experience bands, site info, CSV path resolver
js/data/
  jobs-india.js          India job listings (generated from CSV)
  jobs-usa.js            USA job listings
  jobs-germany.js        Germany job listings
  jobs-canada.js         Canada job listings
  jobs-australia.js      Australia job listings
  companies.js           hiring-partner companies (generated from CSV)
  testimonials.js        applicant testimonials (generated from CSV)
  projects.js            per-country project/hiring stats (generated from CSV)
  categories.js          category/sub-category + Post-a-Job data (generated from CSV)
assets/icons/            category + sub-category icons (svg)
assets/flags/            country flags (svg)
data/categories/categories.csv   canonical source for js/data/categories.js
```

## Known gaps (didn't touch, since you didn't ask — flag if you want these)
- `assets/logos/*.png` (company logos) and `assets/photos/*.jpg` (testimonial
  photos) are referenced in `js/data/companies.js` / `js/data/testimonials.js`
  but aren't currently rendered anywhere in `app.js` (logos fall back to
  initials avatars already) — just unused data otherwise.
- No live map for `PROJECTS_DATA` (lat/long per country) — it's loaded but
  not visualized.
- "Candidates Hired" on the dashboard sums `total_hires` from
  `PROJECTS_DATA` (all-time, not month-by-month) since the source data has
  no monthly breakdown.
- Terms/Privacy content is solid boilerplate for this kind of listing
  portal but isn't a substitute for review by an actual lawyer before you
  rely on it in production.
- The "Stay in Touch" Instagram handoff copies the message to the clipboard
  (best-effort) and opens the DM thread — it can't auto-paste into
  Instagram's own message box, since Instagram doesn't expose that via URL.
