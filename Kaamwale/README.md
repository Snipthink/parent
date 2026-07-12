# Kaamwale — Premium One-Page Landing Website

A premium, responsive one-page landing site for **Kaamwale**, an AI-powered
on-demand home services platform. Built with plain HTML5, Bootstrap 5 (grid
+ utilities only), custom CSS3, and vanilla JavaScript — no frameworks.

## Design system: "Dispatch"

The visual identity is built around the idea of *instant matching*: a
pulsing radar in the hero represents Kaamwale's AI finding the nearest
verified professional in real time. That motif (concentric rings, pulse
dots, a monospace "readout" type style for stats and eyebrows) repeats
throughout the page to tie every section back to the core promise: **home
services in minutes, not hours.**

- **Color:** Indigo → cyan brand gradient (`#4F46E5 → #22D3EE`) on a cool
  off-white light surface / deep navy-black dark surface — never pure white
  or pure black. Emerald is reserved for trust/verification signals, amber
  for ratings.
- **Type:** Space Grotesk (display), Inter (body), IBM Plex Mono (data
  readouts — stats, eyebrow labels, timestamps).
- **Icons:** Bootstrap Icons.

## Folder structure

```
Kaamwale/
├── index.html              # All sections, single page
├── css/
│   ├── style.css            # Design tokens + all component styles
│   ├── dark.css              # Dark-mode variable overrides
│   └── responsive.css        # Breakpoints (desktop → mobile)
├── js/
│   ├── app.js                # Nav, ripple, tabs, FAQ, slider, forms
│   ├── animation.js           # Scroll reveals, counters, loader, parallax
│   └── theme.js               # Light/Dark toggle + Local Storage
├── assets/
│   ├── logo/ icons/ illustrations/ screenshots/ phones/ images/
│   └── (reserved — the current build uses inline SVG + Bootstrap Icons
│     so no binary assets are required to run the site)
└── README.md
```

## Running locally

No build step required. Open `index.html` directly in a browser, or serve
the folder with any static server, e.g.:

```bash
cd Kaamwale
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Features implemented

- Sticky, scroll-aware navbar with active-section highlighting and a
  mobile drawer menu
- Light/Dark theme toggle, persisted in Local Storage, applied
  pre-paint to avoid a flash of the wrong theme
- Hero with an animated "dispatch radar" (pure SVG/CSS, no images)
- Animated counters for platform stats (IntersectionObserver-driven)
- 24 service categories (8 shown by default, "View All" expands the rest)
- Tabbed, animated timeline for the Customer and Professional flows
- 10 "Why Kaamwale" feature cards
- Become a Partner + Get Service sections with CSS/HTML phone mockups
  (dashboard, mission/job screens, wallet, booking flow)
- Auto-advancing testimonial slider with dot navigation and verified badges
- Accordion FAQ with animated open/close
- Contact form with client-side validation + confirmation state
- Newsletter subscribe form
- Footer with quick links, services, company links, and newsletter
- Scroll-reveal animations, button ripple effects, and a page loader
- Respects `prefers-reduced-motion`
- Fully responsive: desktop, tablet, and mobile breakpoints

## Notes for handoff

- Replace the placeholder store links (`#`) in the Become a Partner and
  Get Service sections with real App Store / Play Store / APK URLs.
- Replace the placeholder contact details, address, and map section with
  real company information and a live map embed if desired.
- The `assets/` subfolders are scaffolded per the original spec for teams
  that want to swap in real photography, app screenshots, or custom
  illustrations instead of the current inline SVG/CSS mockups.
