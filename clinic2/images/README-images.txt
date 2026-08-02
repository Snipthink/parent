CLINIC WEBSITE IMAGE REQUIREMENTS
==================================

1. DOCTOR IMAGE
----------------

Current dummy filename:
doctor1.jpg

Replace this file with the doctor's photograph.

Recommended:
Width: 800 px
Height: 1000 px
Aspect Ratio: 4:5

Allowed:
JPG
JPEG
PNG
WEBP

Recommended:
WEBP or JPG

Maximum recommended file size:
500 KB

Example:
doctor1.webp

IMPORTANT:
If you change the filename, update:

data/doctor-details.js

Example:

filename: "doctor1.webp"


2. CLINIC LOGO
--------------

Current filename:
logo.png

Recommended:
Width: 512 px
Height: 512 px
Aspect Ratio: 1:1

Allowed:
PNG
WEBP
SVG

Recommended:
PNG or SVG

Maximum recommended file size:
300 KB

If changing the filename, update:

data/clinic-profile.js


3. FAVICON
----------

Current filename:
favicon.png

Recommended:
Width: 512 px
Height: 512 px
Aspect Ratio: 1:1

Allowed:
PNG
WEBP
SVG

Maximum recommended file size:
200 KB

If changing the filename, update:

data/clinic-profile.js


4. SERVICE ICON
---------------

Recommended:
Width: 128 px
Height: 128 px

Aspect Ratio:
1:1

Allowed:
SVG
PNG
WEBP

Note: the current version of this website uses a simple built-in
symbol for every service card, so no service icon files are
required unless a future version adds per-service icons.


IMPORTANT
=========

Do not randomly resize or stretch images.

Doctor photos must use object-fit: cover.

Logos must use object-fit: contain.

Never distort an image to fit a container.

If an image is missing or fails to load, the website automatically
shows a neutral placeholder graphic instead of a broken image icon,
so the layout never breaks.
