/* ============================================================
   ORGANICABELLE — SITE SCRIPT
   All editable content (products, prices, reviews, doctor info,
   videos, social links, section on/off switches) lives in
   data/data.json — this file only renders it and handles
   interactions. Edit data.json, not this file, to update content.

   NOTE: because this loads data.json with fetch(), the site must
   be served over http (GitHub Pages, or any local dev server —
   e.g. `python3 -m http.server`). Opening index.html directly by
   double-clicking it (file://) will block the fetch in some
   browsers; a small built-in fallback below keeps the page
   working either way, but data.json is the real source of truth.
   ============================================================ */

/* ---------- fallback data, used only if data.json can't be fetched ---------- */
const FALLBACK_DATA = {
  site: {
    whatsappNumber: "91XXXXXXXXXX",
    images: { hero: "images/brand/hero.webp", doctor: "images/doctor/doctor.webp",
      models: { woman:"images/models/woman-soap.webp", womanNatural:"images/models/woman-natural-skincare.webp", man:"images/models/man-soap.webp", family:"images/models/family.webp" },
      story: { women:"images/story/women-artisans.webp", making:"images/story/soap-making.webp", village:"images/story/village.webp" } },
    sections: { featuredProduct:true, ourStory:true, womenArtisans:true, modelCampaign:true, skinExpert:true, customerReviews:true, reviewVideos:true, productDetailReviews:true, mission:true, social:true, footerVideo:true },
    featuredProductId: "rose",
    skinExpert: { enabled:true, name:"[Doctor Name]", qualification:"[Qualification]", statement:"Skin suitability varies between individuals.", doctorVideoUrl:"" },
    customerReviewVideos: [], footerVideo: { title:"A glimpse into Organicabelle", description:"", youtubeUrl:"" },
    social: [{ name:"Instagram", url:"#", icon:"instagram" }, { name:"WhatsApp", url:"#", icon:"whatsapp", isWhatsApp:true }]
  },
  products: [{ id:"neem", name:"Neem Botanical Soap", category:"Neem", mood:"Fresh", accent:"#4E5E3A", icon:"neem", mrp:249, price:249, image:"images/products/neem.webp", ingredientImage:"images/ingredients/neem.webp", desc:"", about:"", benefits:[], ingredients:[], skinFeel:"", suitableFor:"" }],
  reviews: []
};

/* ---------- botanical icon paths, keyed by name (referenced from data.json) ---------- */
const ICONS = {
  neem:     (a)=>`<path d="M16 2C6 6 4 18 16 30C28 18 26 6 16 2Z" fill="${a}"/><path d="M16 5 L16 27" stroke="#fff" stroke-width="1" opacity=".35"/>`,
  aloe:     (a)=>`<path d="M10 30 Q6 14 16 2 Q26 14 22 30Z" fill="${a}"/><path d="M16 6 L16 26" stroke="#fff" stroke-width="1" opacity=".35"/>`,
  rose:     (a)=>`<circle cx="16" cy="16" r="10" fill="${a}"/><circle cx="16" cy="16" r="6" fill="#fff" opacity=".22"/><circle cx="16" cy="16" r="2.4" fill="#fff" opacity=".4"/>`,
  charcoal: (a)=>`<path d="M6 20 L10 8 L20 6 L26 14 L22 26 L10 28Z" fill="${a}"/>`,
  lavender: (a)=>`<line x1="16" y1="30" x2="16" y2="10" stroke="${a}" stroke-width="2"/><circle cx="16" cy="8" r="3" fill="${a}"/><circle cx="12" cy="12" r="2.5" fill="${a}"/><circle cx="20" cy="12" r="2.5" fill="${a}"/>`,
  redwine:  (a)=>`<circle cx="12" cy="10" r="4" fill="${a}"/><circle cx="20" cy="10" r="4" fill="${a}"/><circle cx="16" cy="16" r="4" fill="${a}"/><circle cx="12" cy="22" r="4" fill="${a}"/><circle cx="20" cy="22" r="4" fill="${a}"/>`
};
function iconFor(p){ return ICONS[p.icon] || ICONS.neem; }

/* ============================================================
   SIGNATURE ILLUSTRATED FALLBACKS (used only when a real photo
   at the configured path is missing) — never a broken-image icon.
   ============================================================ */
function soapArt(accent, iconFn, variant="front"){
  const rot = variant==="lifestyle" ? "rotate(-6 100 130)" : variant==="closeup" ? "rotate(3 100 130)" : "";
  const icon = iconFn(accent);
  return `<svg viewBox="0 0 200 260" class="soap-art" role="img" aria-label="Kraft-paper wrapped Organicabelle soap tied with jute thread">
    <g transform="${rot}">
      <ellipse cx="100" cy="246" rx="66" ry="9" fill="rgba(20,15,8,.14)"/>
      <rect x="32" y="28" width="136" height="192" rx="16" fill="#EFDFBD" stroke="#9C7B45" stroke-width="1.4"/>
      <path d="M32 58 Q100 38 168 58 L168 30 Q100 16 32 30 Z" fill="#E4CE9F" opacity=".65"/>
      <rect x="60" y="34" width="80" height="18" rx="4" fill="${accent}" opacity=".55"/>
      <path d="M32 98 Q100 88 168 98" stroke="#8A6633" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M32 106 Q100 116 168 106" stroke="#6E5227" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M96 30 Q84 125 96 218" stroke="#8A6633" stroke-width="4.5" fill="none"/>
      <path d="M106 30 Q118 125 106 218" stroke="#6E5227" stroke-width="2" fill="none"/>
      <g transform="translate(100,103)">
        <path d="M-16 -6 Q-30 -18 -34 0 Q-30 15 -16 5 Z" fill="#8A6633" stroke="#6E5227" stroke-width="1"/>
        <path d="M16 -6 Q30 -18 34 0 Q30 15 16 5 Z" fill="#8A6633" stroke="#6E5227" stroke-width="1"/>
        <path d="M-10 8 L-4 22" stroke="#8A6633" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M10 8 L4 22" stroke="#8A6633" stroke-width="3.5" stroke-linecap="round"/>
        <circle r="6.5" fill="#6E5227"/>
      </g>
      <circle cx="100" cy="168" r="32" fill="${accent}" opacity=".14"/>
      <circle cx="100" cy="168" r="27" fill="none" stroke="${accent}" stroke-width="1.6"/>
      <g transform="translate(84,152) scale(0.92)">${icon}</g>
      <path d="M150 210 C158 200 156 190 148 186" stroke="var(--moss-bright,#4F7A3B)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M148 186 C144 190 140 189 138 184" stroke="var(--moss-bright,#4F7A3B)" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}
function avatarArt(){
  return `<svg viewBox="0 0 200 260" role="img" aria-label="Portrait placeholder"><rect width="200" height="260" fill="#E7D9BC"/><circle cx="100" cy="98" r="42" fill="#B98F52" opacity=".6"/><path d="M40 230c0-44 27-70 60-70s60 26 60 70" fill="#8A6633" opacity=".5"/></svg>`;
}
function personArt(accent){
  return `<svg viewBox="0 0 200 260" role="img" aria-label="Illustrated figure with Organicabelle soap"><rect width="200" height="260" fill="#EFE7D3"/>
    <circle cx="100" cy="70" r="26" fill="#C6A05E"/>
    <path d="M60 230c0-46 18-84 40-84s40 38 40 84" fill="#3C4A30" opacity=".85"/>
    <rect x="82" y="150" width="36" height="46" rx="8" fill="${accent}" opacity=".9"/>
    <path d="M84 150 Q100 140 116 150" stroke="#8A6633" stroke-width="3" fill="none"/>
    <path d="M150 40c-18 6-26 26-8 54" stroke="#4F7A3B" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>
  </svg>`;
}
function leafCluster(){
  return `<svg viewBox="0 0 200 260" role="img" aria-label="Botanical greenery"><rect width="200" height="260" fill="#EFE7D3"/>
    <path d="M100 40C60 60 50 120 100 220C150 120 140 60 100 40Z" fill="#4F7A3B" opacity=".75"/>
    <path d="M60 90C40 110 40 150 70 180" stroke="#3C4A30" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M140 90C160 110 160 150 130 180" stroke="#3C4A30" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
  </svg>`;
}
function assetImage(path, fallbackHTML, alt, extraClass){
  return `<div class="asset-img ${extraClass||''}">
    <img src="${path}" alt="${alt}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <div class="asset-fallback">${fallbackHTML}</div>
  </div>`;
}
function initialsAvatar(name, accent){
  const initials = (name||"?").replace(/\(sample\)/i,"").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return `<div class="initials-avatar" style="background:${accent||'#8A6633'};">${initials}</div>`;
}
/* ---- journey/story scene illustrations (abstract, non-photorealistic) ---- */
function bowlArt(accent){
  return `<svg viewBox="0 0 400 240" role="img" aria-label="Washing and preparing ingredients"><rect width="400" height="240" fill="#EFE7D3"/>
    <ellipse cx="200" cy="150" rx="110" ry="60" fill="#E4CE9F" stroke="#9C7B45" stroke-width="3"/>
    <ellipse cx="200" cy="140" rx="90" ry="42" fill="${accent}" opacity=".35"/>
    <ellipse cx="170" cy="130" rx="16" ry="10" fill="${accent}"/>
    <ellipse cx="215" cy="122" rx="14" ry="9" fill="${accent}"/>
    <ellipse cx="235" cy="138" rx="13" ry="8" fill="${accent}"/>
    <path d="M120 60c40-30 120-30 160 0" stroke="#4F7A3B" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
  </svg>`;
}
function pourArt(accent){
  return `<svg viewBox="0 0 400 240" role="img" aria-label="Pouring the natural mixture into molds"><rect width="400" height="240" fill="#EFE7D3"/>
    <rect x="150" y="20" width="26" height="70" rx="6" fill="#E4CE9F" stroke="#9C7B45" stroke-width="2"/>
    <path d="M176 40 Q220 70 214 110" stroke="${accent}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/>
    <rect x="170" y="120" width="150" height="70" rx="10" fill="#E4CE9F" stroke="#9C7B45" stroke-width="3"/>
    <rect x="178" y="150" width="134" height="34" rx="6" fill="${accent}" opacity=".55"/>
  </svg>`;
}
function forestSceneArt(accent){
  return `<svg viewBox="0 0 400 240" role="img" aria-label="A forest clearing"><rect width="400" height="240" fill="#EFE7D3"/>
    <path d="M60 240C60 170 90 120 140 120C190 120 220 170 220 240Z" fill="${accent}" opacity=".55"/>
    <path d="M220 240C220 190 250 150 290 150C330 150 350 190 350 240Z" fill="${accent}" opacity=".35"/>
    <circle cx="330" cy="55" r="30" fill="#F2E2B8" opacity=".7"/>
  </svg>`;
}
function gatherArt(accent){
  return `<svg viewBox="0 0 400 240" role="img" aria-label="Gathering ingredients by hand"><rect width="400" height="240" fill="#EFE7D3"/>
    <circle cx="130" cy="90" r="26" fill="#C6A05E"/>
    <path d="M90 240c0-60 18-110 40-110s40 50 40 110" fill="#3C4A30" opacity=".85"/>
    <ellipse cx="230" cy="150" rx="60" ry="34" fill="#E4CE9F" stroke="#9C7B45" stroke-width="3"/>
    <ellipse cx="210" cy="140" rx="14" ry="9" fill="${accent}"/>
    <ellipse cx="240" cy="132" rx="12" ry="8" fill="${accent}"/>
    <ellipse cx="255" cy="150" rx="13" ry="8" fill="${accent}"/>
  </svg>`;
}
function finishedArt(accent, iconFn){ return soapArt(accent, iconFn, "front"); }
function journeyStepArt(stepIndex, p){
  const a = p.accent;
  switch(stepIndex){
    case 0: return forestSceneArt(a);
    case 1: return gatherArt(a);
    case 2: return bowlArt(a);
    case 3: return pourArt(a);
    default: return finishedArt(a, iconFor(p));
  }
}

const socialIcons = {
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
  facebook:'<path d="M15 8h-2a2 2 0 00-2 2v10M8 13h6"/><path d="M9 3h6a6 6 0 016 6v6a6 6 0 01-6 6H9a6 6 0 01-6-6V9a6 6 0 016-6z"/>',
  youtube:'<rect x="2" y="6" width="20" height="12" rx="4"/><path d="M10 9l6 3-6 3z" fill="currentColor" stroke="none"/>',
  whatsapp:'<path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2z"/><path d="M8.5 8.7c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4.2.5.6 1.6.6 1.7.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.2.1.9-.2 1.4-.4.6-1.6 1.1-2.2 1.1-.6.1-1.2.1-3.9-1.6-3.2-2-4.3-5.3-4.4-5.6-.1-.2-.6-1-.6-1.9 0-1 .5-1.5.7-1.7z" fill="currentColor" stroke="none"/>'
};

/* ============ STATE ============ */
let DATA = null;
let CART = JSON.parse(localStorage.getItem("organicabelle_cart") || "[]");

function saveCart(){ localStorage.setItem("organicabelle_cart", JSON.stringify(CART)); }
function findProduct(id){ return DATA.products.find(p=>p.id===id); }
function fmt(n){ return "₹" + n.toLocaleString("en-IN"); }
function ytId(url){ if(!url) return null; const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? m[1] : null; }
function priceRowHTML(p){
  const hasOffer = p.mrp && p.mrp > p.price;
  const off = hasOffer ? Math.round((p.mrp - p.price) / p.mrp * 100) : 0;
  return `<div class="price-row">
    <span class="price-current">${fmt(p.price)}</span>
    ${hasOffer ? `<span class="price-mrp">${fmt(p.mrp)}</span><span class="price-off">${off}% OFF</span>` : ''}
  </div>`;
}

/* ============ LOAD DATA, THEN BUILD PAGE ============ */
fetch("data/data.json").then(r=>{ if(!r.ok) throw new Error("bad response"); return r.json(); })
  .then(json => { DATA = json; init(); })
  .catch(() => { console.warn("Organicabelle: could not fetch data/data.json (serve over http, not file://). Using built-in fallback content."); DATA = FALLBACK_DATA; init(); });

function init(){
  const site = DATA.site;
  const products = DATA.products;
  const sec = site.sections || {};

  /* ---- HERO ---- */
  document.getElementById("heroSoap").innerHTML = assetImage(site.images.hero, soapArt(products[0].accent, iconFor(products[0]), "front"), "Organicabelle handmade soap wrapped in kraft paper and jute thread");

  /* ---- COLLECTION ---- */
  document.getElementById("collectionGrid").innerHTML = products.map(p => `
    <article class="product-card reveal">
      <div class="product-media" data-open="${p.id}" tabindex="0" role="button" aria-label="View ${p.name} details">
        <span class="product-badge" style="color:${p.accent};">${p.category}</span>
        ${assetImage(p.image, soapArt(p.accent, iconFor(p), "front"), p.name+" — Organicabelle handmade soap")}
      </div>
      <div class="product-body">
        <span class="product-cat" style="color:${p.accent};">${p.category}</span>
        <h3 data-open="${p.id}">${p.name}</h3>
        <span class="product-mood">${p.mood}</span>
        <p class="product-desc">${p.desc}</p>
        <div class="product-foot">${priceRowHTML(p)}</div>
        <div class="product-actions">
          <button class="btn btn-ghost btn-sm" data-open="${p.id}">View Details</button>
          <button class="btn btn-primary btn-sm" data-add="${p.id}">Add to Cart</button>
        </div>
      </div>
    </article>`).join("");

  /* ---- INGREDIENTS / FOREST EXPLORER ---- */
  if(sec.forestExplorer === false){ document.getElementById("ingredients").remove(); }
  else document.getElementById("ingredientGrid").innerHTML = products.map(p => `
    <div class="ingredient-card reveal" data-plant="${p.id}" tabindex="0" role="button" aria-label="Explore ${p.category}">
      <span class="ing-explore-tag">Explore</span>
      ${assetImage(p.ingredientImage, leafCluster(), p.category+" natural ingredient")}
      <div class="ing-body"><h4>${p.category}</h4><p>${p.about}</p></div>
    </div>`).join("");

  /* ---- FEATURED PRODUCT ---- */
  const featuredSection = document.getElementById("featured");
  if(sec.featuredProduct === false){ featuredSection.remove(); }
  else {
    const p = findProduct(site.featuredProductId) || products[0];
    document.getElementById("featuredProduct").innerHTML = `
      ${assetImage(p.image, soapArt(p.accent, iconFor(p), "closeup"), p.name)}
      <div class="featured-copy">
        <span class="eyebrow" style="color:${p.accent};">Featured · ${p.category}</span>
        <h3 style="font-size:clamp(24px,3.4vw,34px); margin:10px 0;">${p.name}</h3>
        <p class="desc">${p.about}</p>
        ${priceRowHTML(p)}
        <div class="pd-actions" style="margin-top:20px;">
          <button class="btn btn-primary" data-open="${p.id}">View Details</button>
          <button class="btn btn-ghost" data-add="${p.id}">Add to Cart</button>
        </div>
      </div>`;
  }

  /* ---- OUR STORY ---- */
  if(sec.ourStory === false){ document.getElementById("story").remove(); }
  else document.getElementById("storyArt").innerHTML = assetImage(site.images.story.women, personArt("var(--moss)"), "Women artisans handcrafting Organicabelle soap");

  /* ---- WOMEN ARTISANS ---- */
  if(sec.womenArtisans === false){ document.getElementById("artisans").remove(); }

  /* ---- MODEL / LIFESTYLE CAMPAIGN ---- */
  if(sec.modelCampaign === false){ document.getElementById("campaign").remove(); }
  else{
    const cards = [
      { img: site.images.models.woman, label:"Woman using Organicabelle soap", fallback: personArt("#A85268") },
      { img: site.images.models.womanNatural, label:"Natural skincare ritual", fallback: personArt("#6F8E52") },
      { img: site.images.models.man, label:"Man using Organicabelle soap", fallback: personArt("#4E5E3A") },
      { img: site.images.models.family, label:"A family skincare ritual", fallback: personArt("#8073A6") }
    ];
    document.getElementById("campaignGrid").innerHTML = cards.map(c => `
      <div class="campaign-card">${assetImage(c.img, c.fallback, c.label)}<span class="cc-label">${c.label}</span></div>`).join("");
  }

  /* ---- SOCIAL ---- */
  if(sec.social === false){ document.getElementById("social").remove(); }
  else document.getElementById("socialGrid").innerHTML = site.social.map(s => `
    <a class="social-card" href="${s.isWhatsApp ? '#' : s.url}" ${s.isWhatsApp ? 'onclick="openWhatsApp(); return false;"' : 'target="_blank" rel="noopener"'}>
      <svg viewBox="0 0 24 24">${socialIcons[s.icon]}</svg><span>Follow ${s.name}</span>
    </a>`).join("");

  /* ---- SKIN EXPERT ---- */
  const expertWrap = document.getElementById("expert");
  if(sec.skinExpert === false || !site.skinExpert.enabled){ expertWrap.remove(); }
  else{
    const e = site.skinExpert;
    const hasVideo = !!ytId(e.doctorVideoUrl);
    const mediaBlock = hasVideo
      ? `<div class="expert-media">${assetImage(site.images.doctor, avatarArt(), e.name)}<button class="play-btn" id="playExpertVideo" aria-label="Play skin expert video"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button></div>`
      : `<div class="expert-media">${assetImage(site.images.doctor, avatarArt(), e.name)}</div>`;
    expertWrap.innerHTML = `
      <div class="wrap expert-grid">
        <div class="reveal">${mediaBlock}</div>
        <div class="expert-copy reveal">
          <span class="eyebrow">The Skin Expert's Note</span>
          <h2>${e.name}</h2>
          <p class="cred">${e.qualification}</p>
          <p class="expert-quote">${e.statement}</p>
          <p class="expert-disclaimer">Skin suitability varies between individuals. For persistent skin concerns, please consult a qualified dermatologist. Organicabelle products are not intended to diagnose, treat, or cure any condition.</p>
          <p class="config-note">Doctor image and video are set in <code>data/data.json</code> → <code>site.skinExpert</code>.</p>
        </div>
      </div>`;
    const playBtn = document.getElementById("playExpertVideo");
    if(playBtn) playBtn.addEventListener("click", ()=> openVideoModal(e.doctorVideoUrl));
  }

  /* ---- REVIEWS + VIDEO STORIES ---- */
  const reviewsSection = document.getElementById("reviews");
  if(sec.customerReviews === false){ reviewsSection.remove(); }
  else{
    document.getElementById("reviewGrid").innerHTML = (DATA.reviews||[]).map(r => {
      const rp = findProduct(r.product) || {};
      return `
      <div class="review-card">
        <div class="review-stars" aria-hidden="true">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-who">
          <div class="review-avatar">${initialsAvatar(r.name, rp.accent)}</div>
          <div>
            <div class="review-name">${r.name} ${r.verified ? `<span class="verified-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Verified</span>` : ''}</div>
            <div class="review-product">${rp.name || r.product}${r.placeholder ? ' · <span class="review-placeholder-tag">Sample</span>' : ''}</div>
          </div>
          ${r.social && r.social.url ? `<a class="review-social-link" href="${r.social.url}" target="_blank" rel="noopener" aria-label="${r.name} on ${r.social.platform}"><svg viewBox="0 0 24 24">${socialIcons[r.social.platform]||socialIcons.instagram}</svg></a>` : ''}
        </div>
      </div>`;
    }).join("");

    const videoTabBtn = document.querySelector('[data-tab="video-reviews"]');
    if(sec.reviewVideos === false && videoTabBtn){ videoTabBtn.remove(); }
    else{
      const grid = document.getElementById("reviewVideoGrid");
      const vids = (site.customerReviewVideos||[]).filter(v=>ytId(v.youtubeUrl));
      if(!vids.length){
        grid.innerHTML = `<div class="video-empty" style="grid-column:1/-1;">No customer video stories configured yet. Add YouTube links to <code>site.customerReviewVideos</code> in data/data.json to feature them here.</div>`;
      } else {
        grid.innerHTML = vids.map(v => `
          <div class="video-card" data-video="${v.youtubeUrl}">
            <div class="video-thumb">
              <img src="https://img.youtube.com/vi/${ytId(v.youtubeUrl)}/hqdefault.jpg" alt="${v.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
              <button class="play-btn" aria-label="Play ${v.title}"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
            </div>
            <div class="video-body"><h4>${v.title}</h4><span>${v.category||''}</span></div>
          </div>`).join("");
        grid.querySelectorAll("[data-video]").forEach(card=> card.addEventListener("click", ()=> openVideoModal(card.dataset.video)));
      }
    }
  }

  /* ---- MISSION ---- */
  if(sec.mission === false){ document.getElementById("mission").remove(); }

  /* ---- FOOTER VIDEO ---- */
  const footerVideoBlock = document.getElementById("footerVideoBlock");
  if(sec.footerVideo === false){ footerVideoBlock.closest(".footer-video").remove(); }
  else{
    const fv = site.footerVideo; const id = ytId(fv.youtubeUrl);
    footerVideoBlock.innerHTML = `
      <div><h3>${fv.title}</h3><p>${fv.description}</p></div>
      <div class="video-thumb" id="footerVideoThumb" style="${id ? 'cursor:pointer;' : 'opacity:.5;'}">
        ${id ? `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="${fv.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<span style="color:rgba(239,231,211,.6); font-size:13px; padding:0 20px; text-align:center;">Add a YouTube URL to <code>site.footerVideo.youtubeUrl</code> in data/data.json to feature a video here.</span>`}
        ${id ? `<button class="play-btn" aria-label="Play ${fv.title}"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>` : ''}
      </div>`;
    if(id) document.getElementById("footerVideoThumb").addEventListener("click", ()=> openVideoModal(fv.youtubeUrl));
  }

  bindInteractions();
  renderCart();
  document.getElementById("year").textContent = new Date().getFullYear();
  observeReveals();
  setTimeout(observeReveals, 60);
}

/* ============ THEME ============ */
const themeToggle = document.getElementById("themeToggle");
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  themeToggle.setAttribute("aria-pressed", t === "dark");
  localStorage.setItem("organicabelle_theme", t);
}
applyTheme(localStorage.getItem("organicabelle_theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeToggle.addEventListener("click", ()=>{ applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); });

/* ============ HEADER COMPACT ON SCROLL ============ */
const header = document.getElementById("siteHeader");
window.addEventListener("scroll", ()=>{ header.classList.toggle("compact", window.scrollY > 40); }, {passive:true});

/* ============ SCROLL REVEAL ============ */
const io = new IntersectionObserver((entries)=>{ entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }); }, {threshold:.12});
function observeReveals(){ document.querySelectorAll(".reveal:not(.in), .reveal-stagger:not(.in)").forEach(el=>io.observe(el)); }

/* ============ MOBILE NAV ============ */
const mobileNav = document.getElementById("mobileNav");
document.getElementById("menuToggle").addEventListener("click", ()=>{ mobileNav.classList.add("open"); document.body.style.overflow="hidden"; });
function closeMobileNav(){ mobileNav.classList.remove("open"); document.body.style.overflow=""; }
document.getElementById("closeMenu").addEventListener("click", closeMobileNav);
document.querySelectorAll(".mnav-link").forEach(a=>a.addEventListener("click", closeMobileNav));

/* ============ TABS ============ */
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/* ============ CART ============ */
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartBody = document.getElementById("cartBody");
const cartFoot = document.getElementById("cartFoot");
const cartCount = document.getElementById("cartCount");
const cartHeadCount = document.getElementById("cartHeadCount");

function cartTotal(){ return CART.reduce((s,i)=> s + findProduct(i.id).price * i.qty, 0); }
function cartQty(){ return CART.reduce((s,i)=> s + i.qty, 0); }

function renderCart(){
  if(!DATA) return;
  const qty = cartQty();
  cartCount.textContent = qty; cartCount.classList.toggle("show", qty > 0); cartHeadCount.textContent = qty;

  if(CART.length === 0){
    const p0 = DATA.products[1] || DATA.products[0];
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="empty-art">${soapArt("#B98F52", iconFor(p0), "front")}</div>
        <h4>Your Organicabelle ritual is waiting.</h4>
        <p>Explore our handcrafted collection and choose your botanical companion.</p>
        <button class="btn btn-primary btn-sm" id="emptyExplore">Explore Collection</button>
      </div>`;
    cartFoot.style.display = "none";
    document.getElementById("emptyExplore")?.addEventListener("click", ()=>{ closeCart(); document.getElementById("collection").scrollIntoView({behavior:"smooth"}); });
    return;
  }

  cartBody.innerHTML = CART.map(item => {
    const p = findProduct(item.id);
    return `
    <div class="cart-item" data-id="${p.id}">
      <div class="ci-img">${assetImage(p.image, soapArt(p.accent, iconFor(p), "front"), p.name)}</div>
      <div style="flex:1;">
        <div class="ci-name">${p.name}</div>
        <div class="ci-cat">${p.category} · ${fmt(p.price)}</div>
        <div class="ci-row">
          <div class="qty-control">
            <button data-dec="${p.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-inc="${p.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="ci-remove" data-remove="${p.id}">Remove</button>
        </div>
      </div>
    </div>`;
  }).join("");
  cartFoot.style.display = "block";
  const total = cartTotal();
  document.getElementById("cartSubtotal").textContent = fmt(total);
  document.getElementById("cartTotal").textContent = fmt(total);
  saveCart();
}

function addToCart(id, qty=1){
  const existing = CART.find(i=>i.id===id);
  if(existing) existing.qty += qty; else CART.push({id, qty});
  renderCart();
  showToast(`${findProduct(id).name} added to your Organicabelle ritual`);
  cartCount.classList.remove("show"); void cartCount.offsetWidth; cartCount.classList.add("show");
}
function changeQty(id, delta){
  const item = CART.find(i=>i.id===id); if(!item) return;
  item.qty += delta; if(item.qty <= 0) CART = CART.filter(i=>i.id!==id);
  renderCart();
}
function removeItem(id){ CART = CART.filter(i=>i.id!==id); renderCart(); }

cartBody.addEventListener("click", (e)=>{
  const inc = e.target.closest("[data-inc]"); const dec = e.target.closest("[data-dec]"); const rm = e.target.closest("[data-remove]");
  if(inc) changeQty(inc.dataset.inc, 1);
  if(dec) changeQty(dec.dataset.dec, -1);
  if(rm) removeItem(rm.dataset.remove);
});

function openCart(){ cartDrawer.classList.add("show"); overlay.classList.add("show"); document.body.style.overflow="hidden"; }
function closeCart(){ cartDrawer.classList.remove("show"); overlay.classList.remove("show"); document.body.style.overflow=""; }
document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", ()=>{ closeCart(); closeProductModal(); closeConfirm(); closeVideoModal(); closePlantModal(); closeJourneyModal(); });

/* ============ PRODUCT MODAL (with per-product "Customers Say" reviews) ============ */
const productModal = document.getElementById("productModal");
const pdContent = document.getElementById("pdContent");

function productReviewsHTML(p){
  if(DATA.site.sections && DATA.site.sections.productDetailReviews === false) return "";
  const items = (DATA.reviews||[]).filter(r=>r.product===p.id);
  return `<div class="pd-reviews">
    <h4>Customers Say</h4>
    ${items.length ? items.map(r=>`
      <div class="pd-review-item">
        <div class="pd-review-avatar">${initialsAvatar(r.name, p.accent)}</div>
        <div class="pd-review-body">
          <div class="pd-review-top">
            <span class="pd-review-name">${r.name}</span>
            ${r.verified ? `<span class="verified-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Verified</span>` : ''}
            <span class="pd-review-stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span>
            ${r.social && r.social.url ? `<a class="pd-review-social" href="${r.social.url}" target="_blank" rel="noopener" aria-label="${r.name} on ${r.social.platform}"><svg viewBox="0 0 24 24">${socialIcons[r.social.platform]||socialIcons.instagram}</svg></a>` : ''}
          </div>
          <p class="pd-review-text">"${r.text}"</p>
        </div>
      </div>`).join("") : `<p class="pd-reviews-empty">No reviews yet for this soap. Add some in data/data.json → "reviews".</p>`}
  </div>`;
}

function relatedProductsHTML(p){
  const related = DATA.products.filter(x=>x.id!==p.id).slice(0,3);
  if(!related.length) return "";
  return `<div class="pd-related">
    <h4>You Might Also Like</h4>
    <div class="pd-related-grid">
      ${related.map(rp => `
        <div class="pd-related-item" data-open="${rp.id}">
          ${assetImage(rp.image, soapArt(rp.accent, iconFor(rp), "front"), rp.name)}
          <span>${rp.category}</span>
        </div>`).join("")}
    </div>
  </div>`;
}

function openProductModal(id){
  const p = findProduct(id); let qty = 1;
  const variants = ["front","closeup","lifestyle"];
  pdContent.innerHTML = `
    <div class="pd-gallery">
      <div class="pd-main-art" id="pdMainArt">${assetImage(p.image, soapArt(p.accent, iconFor(p), "front"), p.name)}</div>
      <div class="pd-thumbs">
        ${variants.map((v,i)=>`<button class="pd-thumb ${i===0?'active':''}" data-variant="${v}" aria-label="View ${v} image">${soapArt(p.accent, iconFor(p), v)}</button>`).join("")}
      </div>
    </div>
    <div class="pd-info">
      <span class="brand-tag">Organicabelle</span>
      <h2 id="pdName">${p.name}</h2>
      <div class="mood">${p.mood}</div>
      <div class="pd-top-actions">
        ${priceRowHTML(p)}
        <div class="pd-qty">
          <div class="qty-control">
            <button id="pdDec" aria-label="Decrease quantity">−</button><span id="pdQty">1</span><button id="pdInc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="pd-actions">
          <button class="btn btn-primary" id="pdAdd">Add to Cart</button>
          <button class="btn btn-whatsapp" id="pdOrder">Order This Soap</button>
        </div>
      </div>
      <div class="pd-block" style="margin-top:22px;"><h4>About</h4><p>${p.about}</p></div>
      <div class="pd-block"><h4>Botanical Benefits</h4><ul>${p.benefits.map(b=>`<li>${b}</li>`).join("")}</ul></div>
      <div class="pd-block"><h4>Key Ingredients</h4><ul>${p.ingredients.map(b=>`<li>${b}</li>`).join("")}</ul></div>
      <div class="pd-block"><h4>How to Use</h4><p>${p.howToUse || 'Lather between wet hands, cleanse, then rinse well.'}</p></div>
      <div class="pd-block"><h4>Skin Feel</h4><p>${p.skinFeel}</p></div>
      <div class="pd-block"><h4>Suitable For</h4><p>${p.suitableFor}</p></div>
      <div class="pd-block"><h4>Ingredient Origin</h4><p>${p.origin || 'Sourced with care from small, trusted growers.'}</p></div>
      <div class="pd-block"><h4>Handmade Story</h4><p>${p.production || "Wrapped in kraft paper and tied by hand with natural jute thread by a woman artisan — the Organicabelle signature."}</p></div>
      <div class="discover-card" id="pdDiscover">
        <div class="dc-ic"><svg viewBox="0 0 24 24"><path d="M4 20c8-1 13-6 14-14-8 1-13 6-14 14z"/></svg></div>
        <div class="dc-copy"><b>🌿 Discover How It's Made</b><span>See the journey from forest to finished bar.</span></div>
        <span class="dc-arrow">→</span>
      </div>
      ${relatedProductsHTML(p)}
      ${productReviewsHTML(p)}
    </div>`;

  document.getElementById("pdDiscover").addEventListener("click", ()=>{ closeProductModal(); openJourneyModal(p.id); });

  pdContent.querySelectorAll("[data-variant]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      pdContent.querySelectorAll("[data-variant]").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("pdMainArt").innerHTML = btn.dataset.variant === "front" ? assetImage(p.image, soapArt(p.accent, iconFor(p), "front"), p.name) : soapArt(p.accent, iconFor(p), btn.dataset.variant);
    });
  });
  document.getElementById("pdInc").addEventListener("click", ()=>{ qty++; document.getElementById("pdQty").textContent = qty; });
  document.getElementById("pdDec").addEventListener("click", ()=>{ if(qty>1){ qty--; document.getElementById("pdQty").textContent = qty; } });
  document.getElementById("pdAdd").addEventListener("click", ()=>{ addToCart(p.id, qty); });
  document.getElementById("pdOrder").addEventListener("click", ()=>{ addToCart(p.id, qty); closeProductModal(); openConfirm(); });

  productModal.classList.add("show"); overlay.classList.add("show"); document.body.style.overflow="hidden";
}
function closeProductModal(){ productModal.classList.remove("show"); overlay.classList.remove("show"); document.body.style.overflow = cartDrawer.classList.contains("show") ? "hidden" : ""; }
document.getElementById("pdClose").addEventListener("click", closeProductModal);

function bindInteractions(){
  document.addEventListener("click", (e)=>{
    const openEl = e.target.closest("[data-open]");
    const addEl = e.target.closest("[data-add]");
    const plantEl = e.target.closest("[data-plant]");
    if(openEl) openProductModal(openEl.dataset.open);
    if(addEl) addToCart(addEl.dataset.add, 1);
    if(plantEl && !e.target.closest("[data-open],[data-add]")) openPlantModal(plantEl.dataset.plant);
  });
  document.addEventListener("keydown", (e)=>{
    if(e.key !== "Enter") return;
    const media = e.target.closest(".product-media");
    const plantEl = e.target.closest("[data-plant]");
    if(media) openProductModal(media.dataset.open);
    if(plantEl) openPlantModal(plantEl.dataset.plant);
  });
  const heroBtn = document.getElementById("heroDiscoverBtn");
  if(heroBtn) heroBtn.addEventListener("click", ()=>{
    const fp = DATA.site.featuredProductId && findProduct(DATA.site.featuredProductId) ? DATA.site.featuredProductId : DATA.products[0].id;
    openJourneyModal(fp);
  });
  initLeafParticles();
}

/* ============ FOREST EXPLORER — PLANT MODAL ============ */
const plantModal = document.getElementById("plantModal");
function openPlantModal(id){
  const p = findProduct(id);
  if(!p) return;
  const related = DATA.products.filter(x=>x.id!==id).slice(0,3);
  document.getElementById("plantModalContent").innerHTML = `
    <div class="plant-hero">${assetImage(p.ingredientImage, leafCluster(), p.category)}</div>
    <div class="plant-modal-body">
      <span class="eyebrow green" style="color:${p.accent};">Forest Ingredient</span>
      <h3 id="plantModalName">${p.category}</h3>
      <p>${p.origin || p.about}</p>
      <h4>Why We Use It</h4>
      <p>${p.about}</p>
      <h4>Found In</h4>
      <p>${p.name}</p>
      <div class="plant-modal-actions">
        <button class="btn btn-primary btn-sm" id="plantSeeProcess">See How It Becomes a Product</button>
        <button class="btn btn-ghost btn-sm" data-open="${p.id}">View ${p.category} Soap</button>
      </div>
    </div>`;
  document.getElementById("plantSeeProcess").addEventListener("click", ()=>{ closePlantModal(); openJourneyModal(p.id); });
  plantModal.classList.add("show"); overlay.classList.add("show"); document.body.style.overflow="hidden";
}
function closePlantModal(){ plantModal.classList.remove("show"); overlay.classList.remove("show"); document.body.style.overflow=""; }
document.getElementById("plantClose").addEventListener("click", closePlantModal);

/* ============ "FROM FOREST TO PRODUCT" JOURNEY MODAL ============ */
const journeyModal = document.getElementById("journeyModal");
let journeyProduct = null, journeyStep = 0;

function openJourneyModal(productId){
  if(DATA.site.sections && DATA.site.sections.productJourney === false){ openProductModal(productId); return; }
  journeyProduct = findProduct(productId);
  journeyStep = 0;
  renderJourneyStep();
  journeyModal.classList.add("show"); overlay.classList.add("show"); document.body.style.overflow="hidden";
}
function closeJourneyModal(){ journeyModal.classList.remove("show"); overlay.classList.remove("show"); document.body.style.overflow=""; }
document.getElementById("journeySkip").addEventListener("click", ()=>{ const p = journeyProduct; closeJourneyModal(); if(p) openProductModal(p.id); });

function renderJourneyStep(){
  const p = journeyProduct;
  const steps = (p.journey && p.journey.length) ? p.journey : [
    { title:"Into the forest", text:"Our journey begins in nature." },
    { title:"Gathering", text:"Ingredients are gathered carefully by hand." },
    { title:"Preparing", text:"Washed, sorted, and prepared." },
    { title:"Making the soap", text:"Blended into the base and poured into molds." },
    { title:"A finished bar", text:"Cured, cut, and wrapped by hand." }
  ];
  const total = steps.length;
  const s = steps[journeyStep];
  const isLast = journeyStep === total - 1;
  document.getElementById("journeyStage").innerHTML = `
    <div class="journey-scene">${journeyStepArt(journeyStep, p)}</div>
    <div class="journey-copy">
      <span class="step-label">Step ${journeyStep+1} of ${total} · ${p.category}</span>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </div>
    <div class="journey-dots">${steps.map((_,i)=>`<span class="journey-dot ${i===journeyStep?'active':''}"></span>`).join("")}</div>
    <div class="journey-foot">
      <div class="journey-nav">
        <button id="journeyPrev" aria-label="Previous step" ${journeyStep===0?'disabled':''}>‹</button>
        <button id="journeyNext" aria-label="Next step" ${isLast?'disabled':''}>›</button>
      </div>
      ${isLast ? `<button class="btn btn-whatsapp btn-sm" id="journeyOrder">Order ${p.category} Soap</button>` : `<button class="btn btn-ghost btn-sm" id="journeyQuick">Quick Order Instead</button>`}
    </div>`;
  document.getElementById("journeyPrev").addEventListener("click", ()=>{ if(journeyStep>0){ journeyStep--; renderJourneyStep(); } });
  const nextBtn = document.getElementById("journeyNext");
  if(nextBtn) nextBtn.addEventListener("click", ()=>{ if(journeyStep<total-1){ journeyStep++; renderJourneyStep(); } });
  const quickBtn = document.getElementById("journeyQuick");
  if(quickBtn) quickBtn.addEventListener("click", ()=>{ closeJourneyModal(); openProductModal(p.id); });
  const orderBtn = document.getElementById("journeyOrder");
  if(orderBtn) orderBtn.addEventListener("click", ()=>{ addToCart(p.id, 1); closeJourneyModal(); openConfirm(); });
}

/* ============ AMBIENT LEAF PARTICLES ============ */
function initLeafParticles(){
  const container = document.getElementById("leafParticles");
  if(!container) return;
  if(DATA.site.sections && DATA.site.sections.leafParticles === false) return;
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#4F7A3B", "#8A6633", "#93A67E"];
  const count = window.innerWidth < 640 ? 5 : 9;
  for(let i=0;i<count;i++){
    const leaf = document.createElement("div");
    leaf.className = "leaf-particle";
    const size = 14 + Math.random()*14;
    const left = Math.random()*100;
    const duration = 16 + Math.random()*14;
    const delay = Math.random()*-20;
    leaf.style.cssText = `left:${left}vw; width:${size}px; height:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;`;
    const col = colors[i % colors.length];
    leaf.innerHTML = `<svg viewBox="0 0 32 32"><path d="M16 2C6 6 4 18 16 30C28 18 26 6 16 2Z" fill="${col}"/></svg>`;
    container.appendChild(leaf);
  }
}

/* ============ ORDER CONFIRMATION + WHATSAPP ============ */
const confirmModal = document.getElementById("confirmModal");
document.getElementById("proceedBtn").addEventListener("click", ()=>{ closeCart(); openConfirm(); });
document.getElementById("finalWhatsapp").addEventListener("click", openWhatsApp);

function openConfirm(){
  if(CART.length === 0){ showToast("Your ritual is empty — add a soap first."); document.getElementById("collection").scrollIntoView({behavior:"smooth"}); return; }
  document.getElementById("confirmList").innerHTML = CART.map(i=>{
    const p = findProduct(i.id);
    return `<div class="confirm-row"><span>${p.name} × ${i.qty}</span><b>${fmt(p.price*i.qty)}</b></div>`;
  }).join("");
  const total = cartTotal();
  document.getElementById("confirmSubtotal").textContent = fmt(total);
  document.getElementById("confirmTotal").textContent = fmt(total);
  confirmModal.classList.add("show"); overlay.classList.add("show"); document.body.style.overflow="hidden";
}
function closeConfirm(){ confirmModal.classList.remove("show"); overlay.classList.remove("show"); document.body.style.overflow=""; }
document.getElementById("confirmBack").addEventListener("click", ()=>{ closeConfirm(); openCart(); });
document.getElementById("confirmSend").addEventListener("click", sendToWhatsApp);

function buildWhatsAppMessage(){
  let lines = ["Hello Organicabelle,", "", "I would like to order:", ""];
  CART.forEach(i=>{ const p = findProduct(i.id); lines.push(`${p.name} × ${i.qty}`); });
  lines.push("", `Total: ${fmt(cartTotal())}`, "", "Please confirm my order and share the next steps.", "Thank you.");
  return lines.join("\n");
}
function sendToWhatsApp(){
  const msg = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${DATA.site.whatsappNumber}?text=${msg}`, "_blank", "noopener");
  closeConfirm();
}
function openWhatsApp(){
  if(CART.length > 0){ openConfirm(); return; }
  const msg = encodeURIComponent("Hello Organicabelle, I'd like to know more about your handmade botanical soaps.");
  window.open(`https://wa.me/${DATA.site.whatsappNumber}?text=${msg}`, "_blank", "noopener");
}

/* ============ FLOATING ORDER SOAP BUTTON — scrolls to collection, never opens WhatsApp directly ============ */
document.getElementById("fabOrder").addEventListener("click", ()=>{
  closeCart(); closeProductModal(); closeConfirm(); closeVideoModal();
  document.getElementById("collection").scrollIntoView({behavior:"smooth"});
});

/* ============ VIDEO MODAL ============ */
const videoModal = document.getElementById("videoModal");
const videoEmbedWrap = document.getElementById("videoEmbedWrap");
function openVideoModal(url){
  const id = ytId(url);
  if(!id){ showToast("Video not yet configured by the brand."); return; }
  videoEmbedWrap.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Organicabelle video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  videoModal.classList.add("show"); overlay.classList.add("show"); document.body.style.overflow="hidden";
}
function closeVideoModal(){ videoModal.classList.remove("show"); videoEmbedWrap.innerHTML=""; overlay.classList.remove("show"); document.body.style.overflow=""; }
document.getElementById("videoClose").addEventListener("click", closeVideoModal);

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg){
  const toast = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove("show"), 2800);
}

/* ============ ESC TO CLOSE ============ */
document.addEventListener("keydown", (e)=>{ if(e.key === "Escape"){ closeCart(); closeProductModal(); closeConfirm(); closeMobileNav(); closeVideoModal(); closePlantModal(); closeJourneyModal(); } });
