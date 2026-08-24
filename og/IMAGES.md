# Organicabelle — Image Sourcing Brief

Every image the site uses, where it's referenced, what it should show, and the size to shoot/export it at.
All current files are illustrated placeholders (`README.txt` in each folder says so) — drop a real photo
in with the **exact same filename** and it replaces the placeholder automatically, no code changes needed.

Paths are relative to `og/` (the site root, next to `index.html`).

## Product photos — `images/products/`

Square product shots on a clean/plain background. Used in the collection grid, product detail modal
(main image), featured-product section, cart line items, and related-products.

| File | Used where | Should show | Current size (px) | Current file size | Recommended |
|---|---|---|---|---|---|
| `products/neem.webp` | Neem Botanical Soap — card, modal, cart | The Neem bar itself: earthy green-flecked bar, kraft paper + jute wrap per the "Handmade, wrapped in kraft paper and jute thread" brand line | 900×900 | 16.4 KB | 1:1 square, ≥1200×1200px |
| `products/aloe-vera.webp` | Aloe Vera Botanical Soap — card, modal, cart | The Aloe Vera bar, light/pale green tone | 900×900 | 17.1 KB | 1:1 square, ≥1200×1200px |
| `products/rose.webp` | Rose Botanical Soap — card, modal, cart, **featured product (default)** | The Rose bar, muted rose/pink tone — this is the default "Featured Bar" (`site.featuredProductId` in data.json) so it's the highest-visibility product shot on the page | 900×900 | 17.3 KB | 1:1 square, ≥1200×1200px |
| `products/charcoal.webp` | Charcoal Botanical Soap — card, modal, cart | The Charcoal bar, deep matte black/near-black | 900×900 | 17.6 KB | 1:1 square, ≥1200×1200px |
| `products/lavender.webp` | Lavender Botanical Soap — card, modal, cart | The Lavender bar, muted purple tone | 900×900 | 18.2 KB | 1:1 square, ≥1200×1200px |
| `products/red-wine.webp` | Red Wine Botanical Soap — card, modal, cart | The Red Wine bar, deep burgundy tone | 900×900 | 19.6 KB | 1:1 square, ≥1200×1200px |

Rendered at: product card image (responsive, full card width, `aspect-ratio:1/1`), product modal main image
and thumbnails (1:1), cart line thumb (56×56px), related-products thumb (1:1). One square master per
product covers all of these.

## Ingredient / "forest explorer" photos — `images/ingredients/`

Landscape shots of the raw plant/ingredient (leaf, flower, stem — the source material, not the finished bar).
Used in the "From forest to product" ingredient grid and the plant-detail modal hero image.

| File | Used where | Should show | Current size (px) | Current file size | Recommended |
|---|---|---|---|---|---|
| `ingredients/neem.webp` | Ingredient card + plant modal hero for Neem | Fresh neem leaves/sprig | 700×500 | 7.8 KB | 16:10 (card) — shoot ~2000×1250px, also reads fine at plant-modal's 16:9 crop |
| `ingredients/aloe-vera.webp` | Ingredient card + plant modal hero for Aloe Vera | Aloe vera leaves, cut or on the plant | 700×500 | 7.8 KB | 16:10, ~2000×1250px |
| `ingredients/rose.webp` | Ingredient card + plant modal hero for Rose | Rose petals/blooms | 700×500 | 8.1 KB | 16:10, ~2000×1250px |
| `ingredients/charcoal.webp` | Ingredient card + plant modal hero for Charcoal | Activated charcoal powder/lumps (raw material, not a plant) | 700×500 | 9.1 KB | 16:10, ~2000×1250px |
| `ingredients/lavender.webp` | Ingredient card + plant modal hero for Lavender | Lavender stems/buds | 700×500 | 9.2 KB | 16:10, ~2000×1250px |
| `ingredients/red-wine.webp` | Ingredient card + plant modal hero for Red Wine | Grape skins/bunches | 700×500 | 9.8 KB | 16:10, ~2000×1250px |

Note: the same file is used both in the ingredient card (CSS `aspect-ratio:16/10`) and stretched to the
plant-detail modal's hero banner (CSS `aspect-ratio:16/9`) — a 16:10 master crops cleanly to either.

## Lifestyle / model photos — `images/models/`

People using the product — the "Daily Ritual" campaign grid. Referenced via `site.images.models.*` in
`data/data.json`, rendered by `js/script.js`'s `campaignGrid`.

| File | data.json key | Should show | Current size (px) | Current file size | Recommended |
|---|---|---|---|---|---|
| `models/woman-soap.webp` | `site.images.models.woman` | "Woman using Organicabelle soap" | 700×900 | 7.2 KB | Portrait, shoot ≥1200×1600px — grid crops to 3:4 |
| `models/woman-natural-skincare.webp` | `site.images.models.womanNatural` | "Natural skincare ritual" | 700×900 | 6.5 KB | Portrait, ≥1200×1600px, crops to 3:4 |
| `models/man-soap.webp` | `site.images.models.man` | "Man using Organicabelle soap" | 700×900 | 6.9 KB | Portrait, ≥1200×1600px, crops to 3:4 |
| `models/family.webp` | `site.images.models.family` | "A family skincare ritual" | 700×900 | 7.4 KB | Portrait, ≥1200×1600px, crops to 3:4 |

Card crop is `aspect-ratio:3/4` (`.campaign-card`, style.css) with a dark gradient overlay + white caption
text at the bottom-left — leave headroom at the bottom third of the frame for that caption to sit over.

## Story / "our village" photos — `images/story/`

Editorial/documentary shots supporting the "Made by women, made with care" brand story.

| File | data.json key | Used where | Should show | Current size (px) | Current file size | Recommended |
|---|---|---|---|---|---|
| `story/women-artisans.webp` | `site.images.story.women` | "Our Story" section main image (`#storyArt`) | Women artisans at work — the primary story image, largest single use of this set | 900×1100 | 13.8 KB | 4:5 portrait, ≥1600×2000px |
| `story/soap-making.webp` | `site.images.story.making` | Referenced in data.json; available for story/journey content | Hands mid-process making soap | 900×1100 | 14.3 KB | 4:5 portrait, ≥1600×2000px |
| `story/village.webp` | `site.images.story.village` | Referenced in data.json; available for story/journey content | The village / workshop setting | 900×1100 | 12.9 KB | 4:5 portrait, ≥1600×2000px |

## Brand / hero photo — `images/brand/`

| File | Used where | Should show | Current size (px) | Current file size | Recommended |
|---|---|---|---|---|---|
| `brand/hero.webp` | Homepage hero (`#heroSoap`), and the page's `og:image` (social share preview, `index.html` line 11) | The single best "hero" shot of a wrapped Organicabelle bar — this is both the first thing visitors see and what shows up when the site link is shared on social/WhatsApp | 1200×1200 | 25.7 KB | 1:1 square, ≥1600×1600px. Keep it square — social platforms crop `og:image` around the center |

## Skin expert / doctor photo — `images/doctor/`

| File | Used where | Should show | Current size (px) | Current file size | Recommended |
|---|---|---|---|---|---|
| `doctor/doctor.webp` | "Skin Expert's Note" section (`#expert`) | Portrait of the named skin expert/dermatologist (name/qualification currently placeholders `[Doctor Name]` in `data.json` → `site.skinExpert` — needs real name + credentials alongside the photo) | 700×900 | 6.4 KB | 4:5 portrait, ≥1200×1500px. If a `doctorVideoUrl` is set instead, this photo is replaced by a video thumbnail with a play button overlay |

## Not photos — leave alone

- All product icons, badges, leaf/particle decorations, and UI icons (cart, menu, sun/moon, socials) are
  inline SVG in `index.html` / `js/script.js`, not image files — nothing to source there.
- Review avatars use auto-generated initials (no photo files) unless you add real customer photos later —
  not currently wired to a file path.
- `.png` files in the repo root (`79.png`, `logo_test.png`, etc., if present) are unrelated stray artifacts,
  not part of this site.

## How to swap an image in

1. Shoot/export at the recommended size above (or larger — the CSS crops to the aspect ratio, extra
   resolution just gets scaled down).
2. Save as `.webp` (or `.jpg`/`.png` — but then also update the path in `data/data.json` to match the new
   extension).
3. Overwrite the existing file at the exact path in the table, keeping the same filename.
4. Refresh the site (must be served over `http://`, not opened as a local `file://` — see `README.txt`).
