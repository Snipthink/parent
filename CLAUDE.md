# SnipThinK — Project Guide

Static marketing website for SnipThinK, deployed to GitHub Pages at **snipthink.org**.

## Repo & deployment

- **Remote:** `https://github.com/Snipthink/parent.git`
- **Live branch:** `live` (GitHub Pages source — `/ (root)`)
- Other branches: `code`, `master`, `advance`, `all`
- **Custom domain:** `snipthink.org` (set via `CNAME` file at repo root)
- No build step — plain HTML/CSS/JS served directly by Pages
- A Jekyll/Pages Actions workflow runs on push; site is live once that job turns green

## Top-level pages

Main marketing site (flat at root):

- `index.html` — landing page (the large file; inline `<style>` blocks define the product sections)
- `about.html`, `about-us.html` — about pages
- `service.html`, `portfolio.html`, `elements.html` — marketing sections
- `blog.html`, `single-blog.html` — blog templates
- `contact.html` + `contact_process.php` — contact form (PHP not executed on Pages; form likely posts elsewhere)
- `tcpp.html` — terms / privacy combined
- `app-ads.txt` — ad network verification
- `CNAME` — **do not delete**; controls the custom domain

## Sub-sites (product landing pages)

Each product has its own folder with self-contained HTML/CSS/JS/assets:

- `futuretrack/` — FutureTrack product
  - `futuretrack.html` (main), `about_us.html`, `privacy-policy.html`, `terms-conditions.html`
  - `assets/`, `css/`, `js/`, `images/`, `webfonts/`, `php/`
- `socialmapwork/` — SocialMapWork product
  - `socialmapwork.html`, `about_us.html`, `privacy-policy.html`, `terms-conditions.html`
  - same asset layout as futuretrack
  - **History note:** previously tracked as a broken git submodule (no `.gitmodules`), which caused GitHub Pages builds to fail with `exit code 128`. Converted to regular tracked files in commit `c11236f`. Do not re-add as a submodule.
- `crinit/` — Crinit product (small: `crinit.html`, `style.css`, `script.js`)

## Shared assets

- `assets/` — primary asset bundle used by `index.html`
  - `assets/css/bootstrap.min.css`, `assets/css/style.css`
  - `assets/js/`, `assets/img/`, `assets/fonts/`
- `css/`, `js/`, `fonts/`, `img/`, `scss/` — legacy theme assets used by the older marketing pages (`about.html`, `service.html`, etc.)
- `vendors/` — third-party libraries (owl-carousel, isotope, revolution slider, counterup, magnify-popup, progress, circle-bar)
- `scss/` — source SCSS; compiled via **Prepros** (`prepros-6.config` present). No npm toolchain.

## Tech stack

- Plain HTML5 + Bootstrap 4/5 + jQuery-era vendor plugins
- Fonts: Google Fonts (Fraunces, Manrope) loaded via CDN
- CookieYes consent banner loaded via CDN on `index.html`
- No bundler, no package.json, no tests

## Conventions

- Product pages live under their own folder and are fully self-contained — don't reach into `/assets` from inside `futuretrack/` etc.
- `index.html` uses inline `<style>` blocks per section rather than external stylesheets for new sections — keep that pattern when adding sections there
- Edit SCSS in `scss/` only if you have Prepros; otherwise edit compiled CSS in `css/` or `assets/css/` directly
- Root files like `test.txt`, `test.txt1`, `79.png`, `logo_test.png`, `email templates (2) (5).png` appear to be stray artifacts — avoid referencing them

## Common gotchas

- **Pages build failing?** Check the Actions tab. Past failure: broken submodule in `socialmapwork` (fixed). Another common one: missing `.gitmodules` after adding a folder that still has its own `.git` directory inside.
- **Custom domain drops** when switching Pages source branches — re-enter `snipthink.org` in Settings → Pages → Custom domain.
- **Case-sensitive paths** on Pages — local macOS/Windows hides mismatches that break in production.
- `contact_process.php` won't run on GitHub Pages (static only).
