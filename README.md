# SnipThinK Web Project

This repository contains the main SnipThinK website along with multiple product or campaign landing pages maintained as static HTML, CSS, JavaScript, image, and vendor asset files.

## Project Overview

The project is organized around one primary website and several standalone sub-sites:

- `index.html` is the main SnipThinK landing page.
- Core marketing pages such as `about.html`, `about-us.html`, `contact.html`, `portfolio.html`, `service.html`, `blog.html`, and `elements.html` live at the top level.
- `crinit/` contains a dedicated smart agriculture landing page.
- `futuretrack/` contains a standalone product landing page and related policy pages.
- `socialmapwork/` contains another standalone product website with its own assets and forms.

## Project Structure

```text
parent/
|-- index.html                  # Main SnipThinK homepage
|-- about.html                  # About page
|-- about-us.html               # Company/about-us page
|-- contact.html                # Contact page
|-- portfolio.html              # Portfolio page
|-- service.html                # Services page
|-- blog.html                   # Blog landing page
|-- single-blog.html            # Single blog template
|-- elements.html               # UI/component reference page
|-- tcpp.html                   # Additional standalone page
|-- app-ads.txt                 # App advertising verification file
|-- CNAME                       # Custom domain configuration
|-- contact_process.php         # PHP contact form handler
|-- README.txt                  # Original template notes
|-- prepros-6.config            # Prepros build configuration
|-- test.txt
|-- test.txt1
|
|-- assets/                     # Asset set used mainly by the main homepage
|   |-- css/                    # Compiled stylesheet files
|   |-- fonts/                  # Custom font files
|   |-- img/                    # Homepage images, social icons, product artwork
|   `-- js/                     # Frontend scripts
|
|-- css/                        # Shared compiled CSS for top-level pages
|-- fonts/                      # Font Awesome and related webfont files
|-- img/                        # Shared images for top-level pages
|-- js/                         # Shared JavaScript for top-level pages
|-- scss/                       # Source Sass stylesheets for the main site
|
|-- vendors/                    # Third-party frontend libraries
|   |-- circle-bar/
|   |-- counterup/
|   |-- isotope/
|   |-- magnify-popup/
|   |-- owl-carousel/
|   |-- progress/
|   `-- revolution/             # Slider Revolution assets, scripts, fonts, PHP helpers
|
|-- crinit/                     # Crinit smart agriculture microsite
|   |-- index.html              # Crinit landing page
|   |-- style.css               # Crinit styling
|   `-- script.js               # Crinit interactions
|
|-- futuretrack/                # FutureTrack standalone landing site
|   |-- index.html              # Main landing page
|   |-- about_us.html
|   |-- privacy-policy.html
|   |-- terms-conditions.html
|   |-- styles.css
|   |-- CNAME
|   |-- LICENSE
|   |-- README.md
|   |-- resources.txt
|   |-- css/                    # Local stylesheets
|   |-- js/                     # Local scripts
|   |-- php/                    # Form handlers
|   |-- images/                 # Product screenshots, logos, backgrounds
|   |-- webfonts/               # Icon/webfont assets
|   `-- assets/                 # Extra site asset directory
|
|-- socialmapwork/              # SocialMapWork standalone product site
|   |-- index.html              # Main landing page
|   |-- about_us.html
|   |-- privacy-policy.html
|   |-- terms-conditions.html
|   |-- CNAME
|   |-- LICENSE
|   |-- README.md
|   |-- resources.txt
|   |-- .gitignore
|   |-- css/                    # Local stylesheets
|   |-- js/                     # Local scripts
|   |-- php/                    # Contact/privacy form handlers
|   |-- images/                 # Product visuals and screenshots
|   `-- webfonts/               # Font assets
|
`-- miscellaneous images/files  # Logos, screenshots, exports, and legacy assets
```

## Directory Notes

### Main site

The top-level files plus `assets/`, `css/`, `img/`, `js/`, and `scss/` make up the primary SnipThinK website. The SCSS source files are stored in `scss/`, while compiled CSS is stored in `css/` and `assets/css/`.

### Crinit

`crinit/` is a self-contained microsite with only three files, which makes it the most compact section of the repository.

### FutureTrack

`futuretrack/` is a standalone landing page bundle with its own CSS, JavaScript, images, font files, documentation, and PHP form handlers.

### SocialMapWork

`socialmapwork/` is another standalone landing page bundle, also maintained with its own static assets and backend form-processing scripts.

### Vendor libraries

`vendors/` stores third-party plugins used by the static pages, including carousels, popups, counters, progress visuals, isotope filtering, and the Revolution Slider package.

## Development Notes

- This project is static-site based and does not use a package manager in the current structure.
- Most pages can be previewed directly by opening the relevant HTML file in a browser.
- PHP files such as `contact_process.php`, `futuretrack/php/*`, and `socialmapwork/php/*` require a PHP-enabled server if you want to test form submissions.

## Summary

If you are navigating the repository for the first time, start with:

1. `index.html` for the main SnipThinK website.
2. `crinit/` for the agriculture product microsite.
3. `futuretrack/` for the FutureTrack landing site.
4. `socialmapwork/` for the SocialMapWork landing site.
