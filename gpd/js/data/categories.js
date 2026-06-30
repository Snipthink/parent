/**
 * categories.js
 * Canonical source: data/categories/categories.csv
 * Drives the "Post a Job" dialog AND the icon shown next to each category
 * chip elsewhere on the site. Lives in its own file (separate from jobs,
 * companies, testimonials, projects) so you can update categories without
 * touching anything else. Edit the CSV, then re-run gen_categories.py to
 * re-sync icons / Google Form links / dates.
 */
window.CATEGORIES_DATA = [
  {
    "serial_no": "1",
    "category_id": "skilled-trade",
    "category_name": "Skilled Trade",
    "sub_category_id": "electrical",
    "sub_category_name": "Electrical",
    "icon": "assets/icons/electrical.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-electrical",
    "last_updated": "2026-06-20"
  },
  {
    "serial_no": "2",
    "category_id": "skilled-trade",
    "category_name": "Skilled Trade",
    "sub_category_id": "plumbing",
    "sub_category_name": "Plumbing",
    "icon": "assets/icons/plumbing.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-plumbing",
    "last_updated": "2026-06-20"
  },
  {
    "serial_no": "3",
    "category_id": "skilled-trade",
    "category_name": "Skilled Trade",
    "sub_category_id": "welding",
    "sub_category_name": "Welding",
    "icon": "assets/icons/welding.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-welding",
    "last_updated": "2026-06-20"
  },
  {
    "serial_no": "4",
    "category_id": "skilled-trade",
    "category_name": "Skilled Trade",
    "sub_category_id": "hvac",
    "sub_category_name": "HVAC",
    "icon": "assets/icons/hvac.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-hvac",
    "last_updated": "2026-06-20"
  },
  {
    "serial_no": "5",
    "category_id": "healthcare",
    "category_name": "Healthcare",
    "sub_category_id": "nursing",
    "sub_category_name": "Nursing",
    "icon": "assets/icons/nursing.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-nursing",
    "last_updated": "2026-06-22"
  },
  {
    "serial_no": "6",
    "category_id": "healthcare",
    "category_name": "Healthcare",
    "sub_category_id": "elderly-care",
    "sub_category_name": "Elderly Care",
    "icon": "assets/icons/elderly-care.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-eldercare",
    "last_updated": "2026-06-22"
  },
  {
    "serial_no": "7",
    "category_id": "it",
    "category_name": "IT",
    "sub_category_id": "software-dev",
    "sub_category_name": "Software Development",
    "icon": "assets/icons/software-dev.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-swdev",
    "last_updated": "2026-06-25"
  },
  {
    "serial_no": "8",
    "category_id": "it",
    "category_name": "IT",
    "sub_category_id": "data",
    "sub_category_name": "Data",
    "icon": "assets/icons/data.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-data",
    "last_updated": "2026-06-25"
  },
  {
    "serial_no": "9",
    "category_id": "manufacturing",
    "category_name": "Manufacturing",
    "sub_category_id": "welding-mfg",
    "sub_category_name": "Welding & Fabrication",
    "icon": "assets/icons/welding.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-mfgwelding",
    "last_updated": "2026-06-18"
  },
  {
    "serial_no": "10",
    "category_id": "construction",
    "category_name": "Construction",
    "sub_category_id": "site-mgmt",
    "sub_category_name": "Site Management",
    "icon": "assets/icons/site-mgmt.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-sitemgmt",
    "last_updated": "2026-06-18"
  },
  {
    "serial_no": "11",
    "category_id": "logistics",
    "category_name": "Logistics",
    "sub_category_id": "warehouse",
    "sub_category_name": "Warehouse",
    "icon": "assets/icons/warehouse.svg",
    "language": "en",
    "google_form_link": "https://forms.gle/sample-category-warehouse",
    "last_updated": "2026-06-15"
  }
];
