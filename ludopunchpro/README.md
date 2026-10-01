# Ludo Punch Pro — official website

Static HTML, CSS and vanilla JavaScript. Open `index.html` directly, or upload this folder to a static host. No installation, build, CDN, external font request, or JavaScript framework is required.

## Configure before public launch

All editable data is at the top of `js/script.js`:

1. Set `GOOGLE_PLAY_URL` to the actual listing. Every download CTA uses this single value. Until configured, buttons show an honest announcement rather than opening a broken placeholder URL.
2. Set `WEBSITE_URL` to the final absolute website URL, ending in `/`. The script sets canonical, Open Graph URL and absolute social images. Also add `<link rel="canonical" href="YOUR_FINAL_URL">`, `<meta property="og:url" ...>` and **absolute** `og:image`/`twitter:image` URLs in the HTML before deployment, since social crawlers may not run JavaScript. The canonical placeholder is documented in the HTML; no invented domain is published.
3. Set `INSTAGRAM_URL`, `FACEBOOK_URL`, `YOUTUBE_URL`, `DISCORD_URL`. Empty entries display an announcement, not an invented profile.
4. Set `GAME_CONFIG.privacyPolicyUrl`, `termsUrl`, and `contactUrl` to developer-approved public links. Current dialogs transparently identify missing information; they are not substitutes for approved legal documents. Contact supports `mailto:`.
5. Set `GAME_TRAILER_URL` to a YouTube URL or direct MP4. Video loads only after a click; no background video or autoplay audio. Empty means “Gameplay trailer coming soon.”
6. Add a real QR image and set `GAME_CONFIG.qrCode`. The current QR panel is visibly a placeholder, not a fake code.
7. Add real images to the asset directories and fill `GAME_ASSETS`. Add/edit entries in `CHARACTERS`, `BOARDS`, and `SCREENSHOTS` to extend the collections.

## Supplied artwork and authenticity

Only **two unique images** were supplied (three attachments repeat the square cover):

| Local asset | Supplied source | Usage |
| --- | --- | --- |
| `assets/images/ludo-punch-pro-cover.png` | `ChatGPT Image Sep 28, 2026, 04_05_16 PM.png` | Branding, character showcase, cover phone preview, download panel |
| `assets/images/ludo-punch-action-banner.png` | `ChatGPT Image Sep 27, 2026, 09_43_05 PM.png` | Hero, promotional board view, features, trailer poster |

These are copied unchanged. The provided wide artwork says “Ludo Punch”; the website identifies the product as “Ludo Punch Pro” without editing the supplied artwork. Source ownership and distribution rights remain the developer’s responsibility; no third-party stock art is included.

No actual menu, lobby, gameplay, character-selection, garden-board or individual character images were supplied. Missing screenshots have clearly labeled placeholders **inside CSS phone frames**. Promotional art is explicitly identified, never presented as a screenshot. Character symbols are UI markers, not fabricated character artwork. Future boards are labeled Coming Soon. Confirm each board’s availability before changing `comingSoon`.

Character image fields accept real transparent art when available. Use optimized WebP/AVIF or reasonably sized PNG/JPEG files. Keep aspect ratios intact. Phone images use `object-fit: contain`, so images are not stretched or cropped to manufacture a screen. Wide supplied art is deliberately cropped only as promotional decoration.

## Files

```text
index.html
css/style.css
js/script.js
assets/images/        # Two actual supplied PNGs
assets/characters/    # Put real individual character artwork here
assets/boards/        # Put actual board previews here
assets/screenshots/   # Put actual game screenshots here
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
- Add real gameplay images to complete the intended screenshot showcase.
- Confirm product character/board availability and free-to-play positioning with the shipped build.
- Verify mobile layout, keyboard use, actual store destination and social sharing on the deployed URL.
- Use HTTPS and hosting compression/cache headers. The original PNGs total roughly 4.5 MB; replacing the configurable paths with optimized copies can improve first-load speed without adding runtime libraries.

The site is deployable as static files. A fully public-ready marketing launch still requires the genuine store link, approved legal/support information and the missing game assets.

## Verification — 2026-10-01

Tested directly from `file://` in headless Google Chrome at 320, 375, 390, 430, 480, 768, 1024, 1440 and 1920 CSS pixels. All nine widths passed the horizontal-overflow and loaded-image checks. No JavaScript runtime exceptions were reported.

Passed interaction checks: fighter selection (19 entries), board selection/Coming Soon state, phone-frame gallery (8 slots), FAQ expansion, unified download URLs and missing-link announcement, legal dialog open/close, mobile menu open/link-close, valid in-page anchor targets, and reduced-motion animation disablement. JavaScript syntax passed `node --check js/script.js`. Desktop and mobile screenshots were visually inspected.

Actual store/social destinations, video playback with a supplied trailer, QR scanning, physical-device touch behavior and final legal content still need checking after those real inputs are supplied. No claim of cross-browser or real-device certification is made.
