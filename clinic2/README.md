# Clinic Website Template

A production-ready, reusable single-doctor clinic website. No server, no
database, no build step — everything is plain HTML, CSS, and JavaScript, and
all clinic-specific content lives in small, easy-to-edit files in the `data/`
folder.

---

## How to open the website

Just double-click `index.html`. It opens directly in your browser
(`file://...`). No local server, install step, or internet connection is
required for the site to work (an internet connection is only needed to load
the Google Fonts used for the headings/body text — the site still looks fine
without it).

---

## Folder structure

```
clinic-website/
├── index.html                    ← Main website
├── privacy-policy.html
├── terms-and-conditions.html
├── README.md                     ← You are here
│
├── data/                         ← Edit these files to reconfigure the site
│   ├── clinic-profile.js
│   ├── doctor-details.js
│   ├── services.js
│   ├── patient-reviews.js
│   ├── contact-details.js
│   ├── social-media.js
│   ├── appointment.js
│   ├── appointment-categories.js
│   ├── theme-colors.js
│   └── image-settings.js
│
├── css/style.css                 ← Do not edit unless you know CSS
├── js/script.js                  ← Do not edit unless you know JavaScript
└── images/
    ├── doctor1.jpg
    ├── logo.png
    ├── favicon.png
    └── README-images.txt
```

**You should only ever need to edit the files inside `data/` and swap
images inside `images/`.** You should not need to touch `index.html`,
`css/style.css`, or `js/script.js`.

---

## How to change the clinic name, tagline, and description

Edit `data/clinic-profile.js`:

```javascript
const clinicProfile = {
    clinic_name: "DEVIN HEALTH CARE CLINIC",
    tagline: "Trusted Healthcare for Your Family",
    description: "Professional and compassionate healthcare for your everyday needs.",
    ...
};
```

## How to change the doctor's information

Edit `data/doctor-details.js` — name, qualification, designation, specialty,
years of experience, and biography.

## How to replace the doctor's photo

1. Add your image to the `images/` folder.
2. Recommended size: **800 × 1000 px** (4:5 ratio). Allowed formats: JPG,
   JPEG, PNG, WEBP. Keep it under 500 KB.
3. If you use a different filename than `doctor1.jpg`, update it in
   `data/doctor-details.js`:

```javascript
image: {
    filename: "doctor1.webp",
    alt: "Dr. Example - General Physician"
}
```

See `images/README-images.txt` for full details on every image used on the
site.

## How to replace the logo

1. Add your logo to `images/`. Recommended: 512 × 512 px, PNG/WEBP/SVG,
   under 300 KB.
2. If the filename changes, update `data/clinic-profile.js`:

```javascript
logo: {
    filename: "logo.png",
    alt: "Devin Health Care Clinic Logo"
}
```

The favicon (browser tab icon) works the same way, also in
`data/clinic-profile.js`.

## How to add or remove services

Edit `data/services.js`. Add or remove objects from the array:

```javascript
{
    name: "Skin Consultation",
    description: "General assessment and referral for skin concerns."
}
```

Leave the array empty (`const services = [];`) to hide the Services section
entirely.

## How to add or remove patient reviews

Edit `data/patient-reviews.js`. `rating` must be a whole number from 1 to 5
(invalid values are automatically corrected by the website). Leave the
array empty to hide the Reviews section entirely.

## How to change phone, WhatsApp, email, and address

Edit `data/contact-details.js`. Leave any individual value as an empty
string `""` to automatically hide that piece of information everywhere it
appears on the site (hero button, contact section, footer, appointment
form).

```javascript
const contactDetails = {
    phone: "",       // leaving this empty hides all "Call" buttons
    whatsapp: "",     // leaving this empty hides WhatsApp buttons/floating button
    email: "",
    address: { ... },
    google_maps_url: ""
};
```

**Note on WhatsApp:** the number should be in international format with no
`+`, spaces, or dashes — e.g. `919876543210`.

## How to add or hide Facebook / Instagram

Edit `data/social-media.js`:

```javascript
const socialMedia = {
    facebook: "https://facebook.com/example",
    instagram: "https://instagram.com/example"
};
```

To hide a single platform, leave its value as an empty string `""`. To hide
the entire social media section, leave both empty.

## How to change website colors (light & dark theme)

Edit `data/theme-colors.js`. It has two separate palettes, `light` and
`dark`, plus a `settings` block to choose which theme loads by default and
whether the dark-mode toggle is shown at all:

```javascript
settings: {
    default_theme: "light",
    dark_mode_enabled: true
}
```

The website automatically applies these colors everywhere — buttons,
backgrounds, text, cards, borders, and the footer. The defaults included
have already been checked for readable text/background contrast in both
themes; if you introduce your own custom colors, re-check contrast before
publishing.

## How to add appointment reasons ("Reason for Visit")

Edit `data/appointment-categories.js`:

```javascript
{
    id: "skin-problem",
    name: "Skin Problem"
}
```

The dropdown in the appointment form (and the floating WhatsApp modal) is
generated automatically from this file — no HTML or JavaScript changes are
required. Each `id` must be unique.

## How the appointment form works

When a patient submits the form (either the main "Request an Appointment"
section or the pop-up opened by the floating WhatsApp button), the site:

1. Validates the required fields (name, age 0–120, gender, reason for
   visit). Problem Details is optional.
2. Builds a WhatsApp message using the clinic name and the selected reason.
3. Opens `https://wa.me/<number>?text=<message>` in a new tab so the
   patient sends the request from their own WhatsApp.

If `whatsapp` is left empty in `data/contact-details.js`, the floating
WhatsApp button and all "Send to WhatsApp" buttons are hidden automatically,
and a "Call Clinic Instead" button is shown if a phone number is available.

## Light/Dark theme toggle

Visitors can switch themes using the moon/sun icon in the navigation bar.
Their choice is remembered on their device for future visits.

## Accessibility & responsiveness

The site is built with semantic HTML, visible keyboard focus states, and
touch targets of at least 48×48 px. It has been checked at mobile
(320–414 px), tablet (768–1024 px), and desktop (1366–1920 px) widths.

## Legal pages

`privacy-policy.html` and `terms-and-conditions.html` contain general,
template language covering the appointment form and WhatsApp
communication. **Review and adapt both pages** to reflect the clinic's
actual practices and the laws that apply in its region before publishing.

---

## Summary: what a non-technical person edits

| I want to change...          | Edit this file                        |
|-------------------------------|----------------------------------------|
| Clinic name / tagline          | `data/clinic-profile.js`              |
| Doctor details                 | `data/doctor-details.js`              |
| Doctor photo / logo / favicon  | `images/` + matching filename in `data/` |
| Services offered               | `data/services.js`                    |
| Patient reviews                | `data/patient-reviews.js`             |
| Phone / WhatsApp / email / address | `data/contact-details.js`         |
| Facebook / Instagram links     | `data/social-media.js`                |
| Appointment "Reason for Visit" options | `data/appointment-categories.js` |
| Website colors / dark mode     | `data/theme-colors.js`                |

No HTML, CSS, or core JavaScript editing is required for any of the above.
