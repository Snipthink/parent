# Ludo Punch Pro — official website

Static HTML, CSS and vanilla JavaScript. Open `index.html` directly, or upload this folder to a static host. No installation, build, CDN, external font request, or JavaScript framework is required.

## Configure before public launch

All editable data is at the top of `js/script.js`:

1. Set `GOOGLE_PLAY_URL` to the actual listing. Every download CTA uses this single value. Until configured, buttons show an honest announcement rather than opening a broken placeholder URL.
2. Set `WEBSITE_URL` to the final absolute website URL, ending in `/`. The script sets canonical, Open Graph URL and absolute social images. Also add `<link rel="canonical" href="YOUR_FINAL_URL">`, `<meta property="og:url" ...>` and **absolute** `og:image`/`twitter:image` URLs in the HTML before deployment, since social crawlers may not run JavaScript. The canonical placeholder is documented in the HTML; no invented domain is published.
3. Set `INSTAGRAM_URL`, `FACEBOOK_URL`, `YOUTUBE_URL`, `DISCORD_URL`. Empty entries display an announcement, not an invented profile.
4. `GAME_CONFIG.privacyPolicyUrl` and `termsUrl` now link to `privacy.html` and `terms.html`. The privacy page is a **website-scoped notice**, not a completed mobile-app privacy policy. Confirm the app’s SDKs, data practices, retention/deletion, age group and privacy contact before using it as an app policy. Add `contactUrl` when confirmed; it supports `mailto:`. Have the legal text reviewed against the actual released app and operating jurisdictions; it is not a guarantee against claims.
5. Set `GAME_TRAILER_URL` to a YouTube URL or direct MP4. Video loads only after a click; no background video or autoplay audio. Empty means “Gameplay trailer coming soon.”
6. Add a real QR image and set `GAME_CONFIG.qrCode`. The current QR panel is visibly a placeholder, not a fake code.
7. Add real images to the asset directories and fill `GAME_ASSETS`. Add/edit entries in `CHARACTERS`, `BOARDS`, and `SCREENSHOTS` to extend the collections.

## Supplied artwork and authenticity

The original promotional uploads contained **two unique images** (three attachments repeated the square cover). On 2 October, 18 additional app captures were supplied in `assets/screenshots/`:

| Local asset | Supplied source | Usage |
| --- | --- | --- |
| `assets/images/ludo-punch-pro-cover.png` | `ChatGPT Image Sep 28, 2026, 04_05_16 PM.png` | Branding, character showcase, cover phone preview, download panel |
| `assets/images/ludo-punch-action-banner.png` | `ChatGPT Image Sep 27, 2026, 09_43_05 PM.png` | Hero, promotional board view, features, trailer poster |

These are copied unchanged. The provided wide artwork says “Ludo Punch”; the website identifies the product as “Ludo Punch Pro” without editing the supplied artwork. Source ownership and distribution rights remain the developer’s responsibility; no third-party stock art is included.

The gallery now contains ten real screens: menu, two fighter-selection pages, Classic/Pro/Forest gameplay, board selection, nearby play, online matchmaking and settings. Three feature sections also use real screens inside CSS phones. Older captures and the profile/match-found captures remain untouched in the folder; not every uploaded image needs to appear in the gallery.

Source captures already contained device frames. `SCREEN_CROP` in `js/script.js` hides those surrounds using CSS, preventing nested phone frames. `BOARD_CROP` displays just the board inside the real gameplay screenshot. Original PNGs are unchanged; no AI-generated pixels are substituted in actual screenshots. The crop rectangle is expressed in source pixels; update it if replacing these screenshots with different dimensions. The board selector shows actual Classic, Pro and Forest boards, plus a clearly labeled **Forest Friends concept**, which is not presented as an available game board.

Character image fields accept real transparent art when available. Use optimized WebP/AVIF or reasonably sized PNG/JPEG files. Keep aspect ratios intact. Actual screenshot crops preserve the game screen proportions and remove only the surrounding device/capture border; board previews intentionally isolate the square board. Individual-character images have not been supplied separately, so the character selection markers remain labeled as symbols.

## Files

```text
index.html
css/style.css
css/game-gallery.css  # Real screenshot crops, phone and board presentation
css/legal.css         # Privacy/terms page styling
js/script.js
privacy.html          # Website notice; app details still need confirmation
terms.html            # Brief general-use terms; statutory rights preserved
assets/images/        # Two actual supplied PNGs
assets/characters/    # Put real individual character artwork here
assets/boards/        # Transparent, explicitly labeled concept artwork
assets/screenshots/   # Original supplied app captures, unchanged
```

Design tokens are at the top of `css/style.css`. Theme: navy `#080e20`, red `#ff3f4c`, blue `#287bff`, green `#38d88b`, yellow `#ffda32`, gold `#ffbc2c`. Barlow Condensed ExtraBold is hosted locally for consistent arcade headings; body text uses system fonts. The Barlow font comes from the Google Fonts repository (`ofl/barlowcondensed`), by Jeremy Tribby, under the SIL Open Font License bundled at `assets/images/FONT-LICENSE.txt`. No font service is contacted by visitors.

## Interactions and accessibility

- Sticky navigation, keyboard-operable mobile menu, Escape close, focus loop while menu is open.
- Character buttons with pressed-state announcements; board selection; keyboard arrows and native touch swiping.
- Reusable `.phone-mockup`, `.phone-black`, `.phone-gold`, `.phone-purple` components.
- Native FAQ details, information dialogs, visible focus states, skip link and status announcements.
- IntersectionObserver reveals and lightweight CSS effects, disabled/simplified for reduced motion.
- No tracking scripts, cookies, external dependencies, autoplay sound, fabricated reviews or statistics.

Core page content stays readable without JavaScript. Dynamic collections, FAQ generation and configured download links require JavaScript. A noscript notice explains the limitation.

## Release check

- Replace the download/domain/social/legal/contact/trailer/QR placeholders as applicable.
- Screenshot gallery and Classic/Pro/Forest board previews now use real supplied images.
- Confirm product character/board availability and free-to-play positioning with the shipped build.
- Verify mobile layout, keyboard use, actual store destination and social sharing on the deployed URL.
- Use HTTPS and hosting compression/cache headers. The original PNGs total roughly 4.5 MB; replacing the configurable paths with optimized copies can improve first-load speed without adding runtime libraries.

The site is deployable as static files. The genuine Google Play link and screenshots are configured. App privacy facts, approved legal/support information, website domain and optional social/trailer/QR information still need confirmation.

## Verification — 2026-10-01

Tested directly from `file://` in headless Google Chrome at 320, 375, 390, 430, 480, 768, 1024, 1440 and 1920 CSS pixels. All nine widths passed the horizontal-overflow and loaded-image checks. No JavaScript runtime exceptions were reported.

Passed interaction checks: fighter selection (19 entries), board selection/Coming Soon state, phone-frame gallery (8 slots), FAQ expansion, unified download URLs and missing-link announcement, legal dialog open/close, mobile menu open/link-close, valid in-page anchor targets, and reduced-motion animation disablement. JavaScript syntax passed `node --check js/script.js`. Desktop and mobile screenshots were visually inspected.

Actual store/social destinations, video playback with a supplied trailer, QR scanning, physical-device touch behavior and final legal content still need checking after those real inputs are supplied. No claim of cross-browser or real-device certification is made.

## Asset work — 2026-10-02

`assets/boards/forest-friends-concept.png` was generated with the built-in imagegen tool, using the real Forest board as a **style reference**, with a transparent background. It is marketing concept art, not edited gameplay and not a claim that the illustrated board is available. The original screenshots were inspected before use and kept untouched.

Final generation prompt:

> Use case: stylized-concept. Create an original promotional concept illustration for the Ludo Punch Pro website, NOT a gameplay screenshot. Reference image is style/reference only: forest Ludo board screenshot. Render one large square Ludo board in a gentle isometric view with four yards red green yellow blue, recognizably Ludo cross-track and center home, lush miniature tree houses in forest yards, little friendly frog, owl and dog characters standing as game pieces on different yard circles. Include a small football player, cricket batsman, smiling elderly man with walking stick and cheerful kid as small stylized toy-like game pieces in the remaining yards. Keep all characters tiny relative to board; readable board structure first. Polished vibrant miniature game-diorama, dark green foliage, glossy colorful tiles, golden edging, playful kid-friendly style. Entire board fully visible, centered with 8 percent padding. Cutout isolated on genuinely transparent background, no room, no sky, no large outside objects, no phone/device frame, no UI, no labels, no text, no logo, no watermark. This is concept art and will be explicitly labeled on website.

Privacy drafting reference: [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311), consulted 2 October 2026. Its disclosure requirements depend on the app’s actual data handling and included SDKs. The developer was asked for the real support/privacy email, ads/analytics/crash SDKs, accounts, purchases and online-server details; these have not yet been supplied. The site therefore does not publish invented statements about app data collection, fixed retention periods, child-directed status or liability immunity.

## Gallery verification — 2026-10-02

Chrome checks passed at 320, 375, 390, 430, 480, 768, 1024, 1440 and 1920 pixels: no page overflow, broken loaded images or JavaScript exceptions. Verified all three actual board switches, separately labeled concept selection, ten real gallery phones, three feature phones, unchanged 316 × 644 screenshot sources, correct Google Play links, privacy/terms navigation, character selection, FAQ, Escape-to-close mobile navigation and reduced motion. Privacy and terms pages passed overflow checks at 320 and 1440 pixels. PNG inspection confirmed an alpha channel in the generated concept. Desktop board and mobile gallery screenshots were visually inspected.
