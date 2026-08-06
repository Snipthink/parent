# Kaamwale Home Services — Booking Website

A single-page, backend-free service booking site. Bootstrap 5 + vanilla JS, all content driven by JSON.

## Run locally
Any static server works, e.g.:
```
python3 -m http.server 8080
```
Then open `http://localhost:8080`. (Opening `index.html` directly via `file://` will block the `fetch()` calls to the JSON files in most browsers — use a local server.)

## Deploy to GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo Settings → Pages → Deploy from branch → `main` / root.
3. Your site is live at `https://<username>.github.io/<repo>/`.

## What to edit (no code changes needed)
| To change...              | Edit this file                          |
|----------------------------|------------------------------------------|
| Business name, WhatsApp number, budget range, time slots | `data/settings.json` |
| Service categories, pricing, icons | `data/categories.json` (icons are [Bootstrap Icons](https://icons.getbootstrap.com/) class names) |
| FAQ | `data/faq.json` |
| Testimonials | `data/testimonials.json` |
| Color themes | `data/themes.json` |
| UI text (English/Hindi/Bengali) | `languages/english.json`, `languages/hindi.json`, `languages/bengali.json` |

## Worker registration → Google Sheet
`settings.json → workerRegistration.googleFormActionUrl` and `googleFormFieldMap` point submissions at a Google Form so entries land in a linked Google Sheet, in addition to opening WhatsApp.

To wire this up:
1. Create a Google Form with fields matching: name, age, gender, speciality, category, address, contact, vehicle, vehicleType.
2. Open the live form → right-click each field → "Inspect" → find its `entry.XXXXXXXX` name attribute.
3. Replace the placeholder `entry.100000001` etc. values in `googleFormFieldMap` with the real ones.
4. Replace `FORM_ID_PLACEHOLDER` in `googleFormActionUrl` with your form's ID (found in the form's URL) and make sure the path ends in `/formResponse`.
5. Link a Google Sheet to the form (Form → Responses tab → Sheet icon) to see submissions land automatically.

Submissions use `mode: "no-cors"`, which is required for cross-origin posts to Google Forms — this means the browser can't confirm success, so the WhatsApp message is treated as the primary confirmation channel and the Sheet as a backup log.

## Notes
- Language and theme choices persist via `localStorage`.
- JSON responses are cached per-tab via `sessionStorage` to avoid refetching on the same visit.
- GPS uses the browser's Geolocation API and degrades gracefully if permission is denied or unavailable.
- Replace `assets/images/icon-192.png` / `icon-512.png` and the `logo` path in `settings.json` with real brand assets before launch.
- Update the placeholder domain in `robots.txt` and `sitemap.xml`.
