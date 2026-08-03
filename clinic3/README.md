# Reusable Medical Clinic Website Template

This project is refactored from the supplied clinic source so that clinic-specific information is maintained in JSON files rather than embedded in the main HTML/logic.

## Run
Because JSON is loaded with `fetch()`, use a local server:

    python -m http.server 8000

Open `http://localhost:8000`.

## Change a clinic
Edit only the appropriate JSON and images:

- `data/clinic.json` — clinic name, location, tagline, hero copy
- `data/doctor.json` — doctor name, qualification, experience, biography, specialties
- `data/services.json` — services
- `data/reviews.json` — patient reviews
- `data/contact.json` — phone, WhatsApp, email, address, hours, map
- `data/appointment.json` — appointment reasons
- `data/experience.json` — experience timeline
- `data/consultation.json` — patient-care checks
- `data/images.json` — image paths
- `data/languages/*.json` — language text
- `data/site.json` — default language/theme and feature settings
- `themes/theme.json` — available color palettes

## Theme
The floating theme selector is generated from `themes/theme.json`. Add a theme object to make it available; remove it to hide it. Dark-mode secondary colors are intentionally close to the dark background.

## Images
Replace the three doctor image files with distinct real images before production: hero, about, and consultation.


## Language support

The template supports language switching from JSON files. Available languages are stored in `data/languages/`. The header contains desktop and mobile language selectors.

- `data/languages/en.json` = English
- `data/languages/hi.json` = Hindi

The selected language is stored in `localStorage` as `clinic_language`. Add another locale JSON file, for example `fr.json`, and add its selector option in `index.html`. Locale files can contain both UI translations under `ui` and localized clinic/doctor/services/reviews/appointment data. The application merges the locale over the base JSON data, so the same website structure can be reused without editing the layout.


## Patient review images

Patient review data is controlled by `data/reviews.json`.

Each review may contain an `image` path.

A single global switch in `data/site.json` controls whether patient images are displayed:

```json
{
  "site": {
    "patient_image": true
  }
}
```

- `true` = show the patient image, name, rating, category, and review.
- `false` = show only the name, rating, category, and review.

The supplied patient images are local illustrative placeholders. For a real clinic, replace them with real patient photographs only when the clinic has appropriate patient consent.

## Appointment WhatsApp flow

The floating WhatsApp button opens the appointment dialog first.

The dialog collects:

- Patient name
- Phone
- Age
- Gender
- Email (optional)
- Reason for visit
- Preferred date
- Preferred time
- Brief/additional message

After submission, WhatsApp opens with a pre-filled appointment message addressed to the configured number in `data/contact.json`.

## Contact section working hours

The detailed Contact Us working-hours card is populated from:

`data/contact.json` → `contact.working_hours`

Changing that array automatically changes the right-side Contact Us hours card.

## GitHub Pages and direct opening

On GitHub Pages, the browser loads the JSON files normally.

For direct `index.html` opening, `js/utils.js` falls back to the generated `js/offline.js` bundle when browser `file://` security prevents JSON `fetch()`.

The JSON files remain the editable source of truth. After changing JSON and wanting direct-file/offline behavior, regenerate `js/offline.js` from the project's build process if one is supplied.

## New JSON-driven features

### Doctor video messages
Edit `data/video.json`.

- `video_website: true` shows the video section.
- `video_website: false` hides it.
- Add one or more objects to `videos`.
- Each video supports `youtube_url`, `title`, `description`, `category`, and `thumbnail`.
- Videos appear in a horizontal scroll row.
- Clicking the play button opens the YouTube video in an accessible dialog.
- The section heading supports `{doctor}`.
- Replace the demo YouTube URLs and thumbnails before production.

### Online consultancy / Google Form
Edit `data/online_consultancy.json`.

Set:

```json
"enabled": true
```

and replace `google_form_url` with the clinic's real Google Form URL. Set `enabled` to `false` to hide the entire section.

### SEO
Edit `data/seo.json` for:

- title
- meta description
- keywords
- robots
- canonical URL
- Open Graph title/description/image
- Physician/MedicalClinic structured data

### Privacy Policy and Terms & Conditions
Edit `data/legal.json`. Long content is rendered inside scrollable dialogs. Do not publish template legal wording without replacing it with the clinic's final approved policy.

### Data source / GitHub Pages
On GitHub Pages the website loads the JSON files from `data/` over HTTPS. The JSON files are the source of truth. `js/offline.js` is only a local `file://` fallback so the template can also open directly without a server.
