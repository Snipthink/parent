ORGANICABELLE — PROJECT FILES
================================

FOLDER STRUCTURE
  index.html          The page structure (you shouldn't need to edit this).
  css/style.css        All styling.
  js/script.js          All interactivity (cart, modals, theme, etc).
  data/data.json        EVERYTHING you'll want to edit lives here: product
                        names, descriptions, prices/offer prices, image
                        paths, reviews, doctor info, videos, social links,
                        and section show/hide switches.
  images/               Drop your real photos here (see below).

HOW TO EDIT CONTENT
  Open data/data.json in any text editor. It's plain JSON with comments
  in "_note" fields explaining each part. No coding needed to:
    - change a product's name, description, or price
    - set an "mrp" (strikethrough price) to show an offer badge
    - swap in real image file paths
    - add/edit customer reviews (with an optional social media link)
    - add YouTube video URLs for the doctor section, customer video
      stories, or the footer video
    - turn whole sections on/off (site.sections in data.json)
    - set the real WhatsApp number (site.whatsappNumber)

IMAGES
  Each images/ subfolder has a README.txt with the exact filenames the
  site expects (matching data/data.json). Drop a same-named .webp/.jpg/
  .png file in and it will appear automatically everywhere that image
  is used (cards, detail view, cart, hero, etc). If a file is missing,
  the site shows a clean illustrated placeholder instead of a broken
  image icon — nothing breaks.

RUNNING THE SITE
  Because the page loads data/data.json with fetch(), it needs to be
  served over http — it will NOT work if you just double-click
  index.html in some browsers (file:// blocks the fetch).

  Easiest options:
    1. Push this whole folder to GitHub and enable GitHub Pages —
       works immediately, no setup.
    2. Test locally first: open a terminal in this folder and run
         python3 -m http.server 8000
       then visit http://localhost:8000 in your browser.

WHAT STILL NEEDS REAL CONTENT (clearly marked in data.json)
  - site.whatsappNumber          → replace "91XXXXXXXXXX"
  - site.skinExpert.name / qualification / statement / doctorVideoUrl
  - images/doctor/, images/products/, images/models/, images/story/,
    images/ingredients/, images/brand/  → real photos
  - reviews[]                     → real customer reviews (currently
                                     sample placeholders tagged "Sample")
  - site.customerReviewVideos[] and site.footerVideo.youtubeUrl
                                   → real YouTube links
