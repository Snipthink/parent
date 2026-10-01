"use strict";

/* =====================================================================
   EDIT HERE — all links, asset paths and collection data live here.
   Use paths relative to index.html. No bundler or server is required.
   Missing assets intentionally stay null: no invented game screenshots.
   ===================================================================== */
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.snipthink.ludopunch";
const WEBSITE_URL = "CANONICAL_URL_HERE";
const GAME_TRAILER_URL = ""; // YouTube watch/share/embed URL, or a direct .mp4 URL.
const INSTAGRAM_URL = "";
const FACEBOOK_URL = "";
const YOUTUBE_URL = "";
const DISCORD_URL = "";

const GAME_CONFIG = {
  developer: "SnipThinK Software Private Limited",
  privacyPolicyUrl: "",
  termsUrl: "",
  contactUrl: "", // https://... or mailto:your-confirmed-address
  qrCode: null, // e.g. assets/images/google-play-qr.png — supply a REAL QR.
};

const GAME_ASSETS = {
  hero: "assets/images/ludo-punch-action-banner.png",
  logo: "assets/images/ludo-punch-pro-cover.png",
  cover: "assets/images/ludo-punch-pro-cover.png",
  menu: null,
  board: null,
  lobby: null,
  preview: null,
  splash: null,
  characterSelection: null,
  playStore: null,
  gardenBoard: null,
  characterBoard: null,
  futureBoard: null,
};

// A symbol is a UI selection marker, not a representation of in-game art.
// Add image: "assets/characters/name.webp" to replace a marker with real art.
const CHARACTERS = [
  { id: "boxer-boy", name: "Boxer Boy", symbol: "🥊", short: "Ready to punch your way ahead.", description: "Ready to punch your way ahead. Bring big energy to your next match.", personality: "BIG MAIN-CHARACTER ENERGY", color: "#ff454f", image: null, promo: true },
  { id: "boxer-girl", name: "Boxer Girl", symbol: "🥊", short: "Bring your fighting spirit.", description: "A little confidence. A lot of character. Bring your fighting spirit to the board.", personality: "BOLD MOVES. BRIGHT PERSONALITY.", color: "#ed55ad", image: null },
  { id: "frog", name: "Frog", symbol: "🐸", short: "Jump into the game.", description: "Jump into the game. A cheerful pick for anyone who likes a little extra character with their classic Ludo.", personality: "GOOD VIBES. FRESH ROLLS.", color: "#46ce86", image: null },
  { id: "chicken", name: "Chicken", symbol: "🐔", short: "Small character. Big attitude.", description: "Small character. Big attitude. Bring a playful personality to your next match.", personality: "A LITTLE CHEEKY. A LOT OF FUN.", color: "#ffce43", image: null },
  { id: "dog", name: "Dog", symbol: "🐶", short: "Play loyal. Move smart.", description: "Play loyal. Move smart. A friendly face for your time around the board.", personality: "YOUR LOYAL LUDO COMPANION", color: "#e5a55a", image: null },
  { id: "classic-goti", name: "Classic Goti", symbol: "♟", short: "The original never gets old.", description: "Keep it classic. The familiar Ludo piece, for players who love the original look.", personality: "TIMELESS. SIMPLE. CLASSIC.", color: "#558dff", image: null },
  { id: "ant", name: "Ant", symbol: "🐜", short: "Tiny presence. Big personality.", description: "A tiny character with plenty of personality. Make your next match a little different.", personality: "SMALL BUT FULL OF CHARACTER", color: "#e7856e", image: null },
  { id: "crocodile", name: "Crocodile", symbol: "🐊", short: "Watch your moves.", description: "Watch your moves. Bring a wonderfully wild look to the familiar Ludo board.", personality: "A WALK ON THE WILD SIDE", color: "#52b986", image: null },
  { id: "dinosaur", name: "Dinosaur", symbol: "🦖", short: "A roaring good time.", description: "A larger-than-life personality for a classic game. Let the good times roar.", personality: "PREHISTORIC PERSONALITY", color: "#87bb54", image: null },
  { id: "male", name: "Male", symbol: "♂", short: "Make your next move yours.", description: "A familiar character for your personal play style. Your game, your choice.", personality: "READY FOR THE NEXT ROLL", color: "#5897e6", image: null },
  { id: "female", name: "Female", symbol: "♀", short: "Your style at every turn.", description: "Bring your personality to the table and enjoy the game your way.", personality: "YOUR STYLE. EVERY TURN.", color: "#d582d8", image: null },
  { id: "cat", name: "Cat", symbol: "🐱", short: "A little curious. A lot of cool.", description: "For the cat people. Bring a little curiosity and a laid-back look to the board.", personality: "EFFORTLESSLY COOL", color: "#dca260", image: null },
  { id: "monkey", name: "Monkey", symbol: "🐵", short: "A playful kind of player.", description: "Put a playful spin on your next Ludo match. All personality, all fun.", personality: "PLAYFUL BY NATURE", color: "#c38b68", image: null },
  { id: "snake", name: "Snake", symbol: "🐍", short: "A different kind of cool.", description: "Choose a character with a little wild style. Classic Ludo with your personal twist.", personality: "SMOOTH STYLE", color: "#72b56a", image: null },
  { id: "owl", name: "Owl", symbol: "🦉", short: "Night owl? Game on.", description: "An owl-inspired pick for those who love a character with a thoughtful look.", personality: "A HOOT TO PLAY AS", color: "#b090d7", image: null },
  { id: "parrot", name: "Parrot", symbol: "🦜", short: "Color outside the ordinary.", description: "Bring a bright burst of personality to every match. Colorful is always a good choice.", personality: "BRIGHT. BOLD. FULL OF LIFE.", color: "#e69d52", image: null },
  { id: "car", name: "Car", symbol: "🚗", short: "Take your style for a spin.", description: "Take your style for a spin with an unexpected character choice. Same Ludo rules, your kind of fun.", personality: "A DIFFERENT DIRECTION", color: "#e36e70", image: null },
  { id: "old-man", name: "Old Man", symbol: "♙", short: "Classic charm at every turn.", description: "A character with classic charm. Some personalities never go out of style.", personality: "OLD-SCHOOL COOL", color: "#93a9cb", image: null },
  { id: "old-woman", name: "Old Woman", symbol: "♕", short: "A timeless kind of fun.", description: "Bring a timeless personality to the board. There’s always room for another good game.", personality: "TIMELESS PERSONALITY", color: "#be8eb7", image: null },
];

const BOARDS = [
  { id: "classic", name: "Classic board", title: "CLASSIC ENERGY", description: "The familiar four-color world of Ludo, full of life. Board shown in official promotional artwork.", asset: "board", fallback: GAME_ASSETS.hero, status: "PROMOTIONAL VIEW", color: "#ffda32", comingSoon: false },
  { id: "garden", name: "Colorful garden", title: "A FRESH LITTLE ESCAPE", description: "A garden-inspired visual direction. The actual board preview and release availability are yet to be confirmed.", asset: "gardenBoard", status: "COMING SOON", color: "#58d491", comingSoon: true },
  { id: "character", name: "Character-themed", title: "A BOARD WITH PERSONALITY", description: "More ways to bring character to classic Ludo. Theme artwork and availability will be shared when confirmed.", asset: "characterBoard", status: "COMING SOON", color: "#b391ff", comingSoon: true },
  { id: "future", name: "The next adventure", title: "MORE BOARDS. MORE FUN.", description: "Future board concepts can introduce new looks to a familiar favorite. No release date has been announced.", asset: "futureBoard", status: "COMING SOON", color: "#5caaff", comingSoon: true },
];

// Every real screenshot goes inside the reusable CSS phone frame.
const SCREENSHOTS = [
  { asset: "menu", title: "HOME / MENU", variant: "phone-black", icon: "i-dice" },
  { asset: "cover", title: "OFFICIAL COVER ART", variant: "phone-gold", icon: "i-bolt", promotional: true },
  { asset: "characterSelection", title: "CHARACTER SELECTION", variant: "phone-purple", icon: "i-users" },
  { asset: "board", title: "GAMEPLAY / BOARD", variant: "phone-black", icon: "i-grid" },
  { asset: "lobby", title: "GAME LOBBY", variant: "phone-purple", icon: "i-globe" },
  { asset: "preview", title: "GAME PREVIEW", variant: "phone-black", icon: "i-dice" },
  { asset: "playStore", title: "PLAY STORE PREVIEW", variant: "phone-gold", icon: "i-play" },
  { asset: "splash", title: "SPLASH SCREEN", variant: "phone-black", icon: "i-bolt" },
];

const FAQS = [
  ["What is Ludo Punch Pro?", "Ludo Punch Pro is classic Ludo with a fresh twist: playable characters, visual board themes and different ways to enjoy a match."],
  ["Is Ludo Punch Pro free?", "Yes. Ludo Punch Pro is free to play. You do not need to pay to start playing. This does not make a claim about ads or optional purchases."],
  ["Can I play offline?", "Yes. You can play offline against the computer or enjoy local multiplayer on the same device. Online multiplayer needs an internet connection."],
  ["Can I play with friends?", "Yes. Play with friends and family locally on the same device, or use online multiplayer."],
  ["Can I play against the computer?", "Yes. Computer mode lets you play against computer opponents, including when you are offline."],
  ["Can I choose different characters?", "Yes. Choose a character that matches your personality. The available character selection may change with game updates."],
  ["Are there different boards?", "Yes. Ludo Punch Pro includes different visual board themes. Items marked Coming Soon are future previews and are not being presented as currently playable."],
  ["Will more characters be added?", "New characters can be introduced through future updates. No specific release date has been announced."],
  ["Will more boards be added?", "New boards and visual experiences can arrive through future updates. Check the official game channels for announcements."],
  ["Where can I download Ludo Punch Pro?", "Use the Google Play download buttons on this website. The official store link will be activated here once it is configured."],
];

/* Site behavior — keep configuration changes above this line. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SVG_NS = "http://www.w3.org/2000/svg";

function icon(id) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#${id}`);
  svg.append(use);
  return svg;
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function validUrl(value, allowMail = false) {
  if (!value || /_HERE/.test(value)) return false;
  try { const url = new URL(value); return ["https:", "http:", ...(allowMail ? ["mailto:"] : [])].includes(url.protocol); } catch { return false; }
}
let toastTimeout;
function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 5000);
}
function transitionSelection(node) {
  node.classList.remove("selection-enter");
  requestAnimationFrame(() => node.classList.add("selection-enter"));
}

// Central download link. Unconfigured buttons explain the missing link instead
// of navigating to a broken local file or an invented Play Store listing.
$$('[data-download]').forEach(link => {
  link.href = GOOGLE_PLAY_URL;
  link.addEventListener("click", event => {
    link.classList.add("pressed");
    setTimeout(() => link.classList.remove("pressed"), 180);
    if (!validUrl(GOOGLE_PLAY_URL)) {
      event.preventDefault();
      notify("The official Google Play link will be added soon. Check back to download Ludo Punch Pro.");
    }
    setMenu(false);
  });
});
$$('[data-developer]').forEach(node => { node.textContent = GAME_CONFIG.developer; });
$$('[data-asset]').forEach(img => { if (GAME_ASSETS[img.dataset.asset]) img.src = GAME_ASSETS[img.dataset.asset]; });
// Update every repeated promotional image from the same configuration.
$$('img:not([data-asset])').forEach(img => {
  const path = img.getAttribute("src");
  if (path === "assets/images/ludo-punch-action-banner.png") img.src = GAME_ASSETS.hero;
  if (path === "assets/images/ludo-punch-pro-cover.png") img.src = img.closest(".brand") ? GAME_ASSETS.logo : GAME_ASSETS.cover;
});

const menuButton = $(".menu-toggle");
const navigation = $("#main-nav");
function setMenu(open) {
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  document.body.classList.toggle("menu-open", open);
}
menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
navigation.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") { setMenu(false); menuButton.focus(); }
  if (event.key === "Tab" && menuButton.getAttribute("aria-expanded") === "true") {
    const items = [menuButton, ...$$("a", navigation)];
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  }
});
window.matchMedia("(min-width: 901px)").addEventListener("change", event => { if (event.matches) setMenu(false); });
document.addEventListener("click", event => { if (!event.target.closest(".site-header")) setMenu(false); });
window.addEventListener("scroll", () => $("#site-header").classList.toggle("scrolled", window.scrollY > 15), { passive: true });

function selectCharacter(character, focus = false) {
  const img = $("#selected-character-image");
  const symbol = $("#selected-character-symbol");
  const art = character.image || (character.promo ? GAME_ASSETS.cover : null);
  img.hidden = !art;
  symbol.hidden = !!art;
  if (art) {
    img.src = art;
    img.alt = character.image ? `${character.name} — Ludo Punch Pro character artwork` : "Official Ludo Punch Pro promotional cover featuring Boxer Boy and other fighters";
  }
  symbol.textContent = character.symbol;
  $("#selected-character-name").textContent = character.name.toUpperCase();
  $("#selected-character-description").textContent = character.description;
  $("#selected-character-tag").textContent = character.personality;
  $("#character-art-label").textContent = character.image ? "CHARACTER ARTWORK" : character.promo ? "OFFICIAL PROMOTIONAL ART" : "SELECTION SYMBOL · CHARACTER ART COMING SOON";
  $("#character-stage").style.setProperty("--character-accent", character.color);
  $("#character-stage").style.background = `radial-gradient(ellipse at 28% 50%, ${character.color}30, transparent 65%), linear-gradient(120deg,#151726,#121b34)`;
  $$(".character-card").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.character === character.id)));
  transitionSelection($(".character-stage-copy"));
  if (focus) $("#selected-character-name").setAttribute("aria-live", "polite");
}
const characterTrack = $("#characters-track");
CHARACTERS.forEach(character => {
  const button = element("button", "character-card");
  button.type = "button";
  button.dataset.character = character.id;
  button.setAttribute("aria-pressed", String(character.id === CHARACTERS[0].id));
  button.setAttribute("aria-label", `Select ${character.name}`);
  const avatar = element("span", "character-avatar");
  const image = character.image || (character.promo ? GAME_ASSETS.cover : null);
  if (image) {
    const img = element("img"); Object.assign(img, { src: image, alt: character.promo ? "Official game cover" : `${character.name} character`, width: 68, height: 68, loading: "lazy" }); avatar.append(img);
  } else { avatar.textContent = character.symbol; avatar.setAttribute("aria-hidden", "true"); }
  button.append(avatar, element("strong", "", character.name.toUpperCase()), element("small", "", character.short));
  button.addEventListener("click", () => selectCharacter(character, true));
  characterTrack.append(button);
});
selectCharacter(CHARACTERS[0]);

function selectBoard(board) {
  const img = $("#board-image");
  const image = GAME_ASSETS[board.asset] || board.fallback;
  const realBoard = !!GAME_ASSETS[board.asset];
  img.hidden = !image;
  if (image) { img.src = image; img.alt = realBoard ? `${board.name} — supplied Ludo Punch Pro board preview` : "Ludo board shown in official promotional artwork, not a gameplay screenshot"; }
  $("#board-placeholder").hidden = !!image;
  $("#board-title").textContent = board.title;
  $("#board-description").textContent = realBoard && board.id === "classic" ? "The familiar four-color Ludo board. A classic look for your next match." : board.description;
  $("#board-status").textContent = !board.comingSoon && realBoard ? "BOARD PREVIEW" : board.status;
  $("#board-preview").style.borderColor = board.color;
  $("#board-preview").style.background = `radial-gradient(circle,${board.color}30,#0d1728)`;
  $$(".board-option").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.board === board.id)));
  transitionSelection($(".board-overlay"));
}
BOARDS.forEach(board => {
  const button = element("button", "board-option");
  button.type = "button";
  button.dataset.board = board.id;
  button.style.setProperty("--board-color", board.color);
  button.setAttribute("aria-pressed", String(board.id === "classic"));
  const visual = element("span", "board-icon"); visual.append(icon("i-grid"));
  const copy = element("span"); copy.append(element("h3", "", board.name.toUpperCase()), element("small", "", board.comingSoon ? "COMING SOON" : "THE FAMILIAR FOUR-COLOR CLASSIC"));
  button.append(visual, copy, element("span", "option-arrow", "↗"));
  button.addEventListener("click", () => selectBoard(board));
  $("#board-options").append(button);
});
selectBoard(BOARDS[0]);

SCREENSHOTS.forEach(screen => {
  const item = element("article", "phone-item");
  const phone = element("div", `phone-mockup ${screen.variant}`);
  const speaker = element("div", "phone-speaker"); speaker.setAttribute("aria-hidden", "true");
  const display = element("div", "phone-screen");
  if (GAME_ASSETS[screen.asset]) {
    const img = element("img");
    Object.assign(img, { src: GAME_ASSETS[screen.asset], alt: screen.promotional ? "Official Ludo Punch Pro promotional cover, not a gameplay screenshot" : `Ludo Punch Pro ${screen.title.toLowerCase()} screenshot`, loading: "lazy", decoding: "async", width: screen.promotional ? 1254 : 1080, height: screen.promotional ? 1254 : 1920 });
    display.append(img);
  } else {
    const placeholder = element("div", "phone-placeholder");
    placeholder.append(icon(screen.icon), element("strong", "", screen.title), element("span", "", "SCREENSHOT COMING SOON"), element("p", "", "A real look at the game will be added here."));
    display.append(placeholder);
  }
  phone.append(speaker, display);
  item.append(phone, element("p", "", screen.title));
  $("#screenshots-track").append(item);
});

$$('[data-scroll]').forEach(button => button.addEventListener("click", () => {
  const track = document.getElementById(button.dataset.scroll);
  const first = track.firstElementChild;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const cardWidth = first.getBoundingClientRect().width + gap;
  const distance = cardWidth * Math.max(1, Math.floor(track.clientWidth / cardWidth));
  track.scrollBy({ left: distance * Number(button.dataset.direction), behavior: reducedMotion.matches ? "instant" : "smooth" });
}));
// Native touch swipe + arrow-key browsing without auto-playing carousels.
$$('.carousel, .board-options').forEach(track => {
  track.tabIndex = 0;
  track.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const buttons = $$("button", track);
    if (buttons.length) {
      const index = buttons.indexOf(document.activeElement);
      const next = Math.max(0, Math.min(buttons.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
      buttons[next].focus();
    } else track.scrollBy({ left: event.key === "ArrowRight" ? 250 : -250, behavior: reducedMotion.matches ? "instant" : "smooth" });
    event.preventDefault();
  });
});

FAQS.forEach(([question, answer], index) => {
  const details = element("details");
  const summary = element("summary", "", question);
  if (index === FAQS.length - 1 && validUrl(GOOGLE_PLAY_URL)) answer = "Download Ludo Punch Pro on Google Play using any of the download buttons on this website.";
  details.append(summary, element("p", "", answer));
  details.addEventListener("toggle", () => { if (details.open) $$("#faq-list details").forEach(other => { if (other !== details) other.open = false; }); });
  $("#faq-list").append(details);
});

const socials = { instagram: INSTAGRAM_URL, facebook: FACEBOOK_URL, youtube: YOUTUBE_URL, discord: DISCORD_URL };
$$('[data-social]').forEach(link => {
  const url = socials[link.dataset.social];
  if (validUrl(url)) { link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer"; }
  else link.addEventListener("click", event => { event.preventDefault(); notify("This official community link hasn’t been announced yet. Check back soon."); });
});

const infoDialog = $("#site-information");
const information = {
  privacy: { title: "PRIVACY POLICY", url: GAME_CONFIG.privacyPolicyUrl, message: "The game’s official privacy policy has not been supplied for this website yet. It will be linked here before public release. This static website has no analytics, advertising scripts or forms." },
  terms: { title: "TERMS & CONDITIONS", url: GAME_CONFIG.termsUrl, message: "The game’s official terms have not been supplied yet. The developer’s approved terms will be linked here before public release." },
  contact: { title: "CONTACT THE STUDIO", url: GAME_CONFIG.contactUrl, message: `Ludo Punch Pro is developed by ${GAME_CONFIG.developer}. Official support contact details will be added here when confirmed.` },
};
$$('[data-info]').forEach(link => {
  const info = information[link.dataset.info];
  if (validUrl(info.url, true)) { link.href = info.url; return; }
  link.addEventListener("click", event => {
    event.preventDefault();
    $("#info-title").textContent = info.title;
    $("#info-message").textContent = info.message;
    infoDialog.showModal();
  });
});
$$('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener("click", () => infoDialog.close()));
infoDialog.addEventListener("click", event => { if (event.target === infoDialog) { const r = infoDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) infoDialog.close(); } });

if (GAME_CONFIG.qrCode) {
  const qr = element("img");
  Object.assign(qr, { src: GAME_CONFIG.qrCode, width: 200, height: 200, alt: "Scan this QR code to open Ludo Punch Pro on Google Play", loading: "lazy" });
  $("#qr-container").replaceChildren(qr);
}

function trailerEmbed(url) {
  if (!validUrl(url)) return null;
  const parsed = new URL(url);
  let id;
  if (parsed.hostname === "youtu.be") id = parsed.pathname.slice(1);
  else if (["youtube.com", "www.youtube.com", "www.youtube-nocookie.com"].includes(parsed.hostname)) id = parsed.searchParams.get("v") || parsed.pathname.split("/").pop();
  return /^[\w-]{11}$/.test(id || "") ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
}
if (validUrl(GAME_TRAILER_URL)) {
  const embed = trailerEmbed(GAME_TRAILER_URL);
  const isVideo = /\.mp4(?:\?|$)/i.test(GAME_TRAILER_URL);
  if (embed || isVideo) {
    const button = element("button", "trailer-content");
    button.style.background = "transparent";
    button.setAttribute("aria-label", "Play the Ludo Punch Pro gameplay trailer");
    const play = element("span", "trailer-play"); play.append(icon("i-play"));
    button.append(play, element("h3", "", "WATCH THE GAMEPLAY TRAILER"));
    $(".trailer-content").replaceWith(button);
    button.addEventListener("click", () => {
      if (embed) {
        const frame = element("iframe"); Object.assign(frame, { src: embed, title: "Ludo Punch Pro gameplay trailer", allow: "autoplay; encrypted-media; picture-in-picture", allowFullscreen: true });
        frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        $("#trailer").replaceChildren(frame);
      } else {
        const video = element("video"); Object.assign(video, { src: GAME_TRAILER_URL, controls: true, autoplay: true, playsInline: true }); video.style.cssText = "width:100%;height:100%;object-fit:contain";
        $("#trailer").replaceChildren(video);
      }
    });
  }
}

if (validUrl(WEBSITE_URL)) {
  const canonical = element("link"); canonical.rel = "canonical"; canonical.href = WEBSITE_URL; document.head.append(canonical);
  const ogUrl = element("meta"); ogUrl.setAttribute("property", "og:url"); ogUrl.content = WEBSITE_URL; document.head.append(ogUrl);
  ['meta[property="og:image"]', 'meta[name="twitter:image"]'].forEach(selector => { $(selector).content = new URL(GAME_ASSETS.hero, WEBSITE_URL.endsWith("/") ? WEBSITE_URL : WEBSITE_URL + "/").href; });
}

// Fail-safe image treatment: a missing replacement asset never shows a broken
// image icon. Its description and a clearly identified placeholder remain.
document.addEventListener("error", event => {
  if (!(event.target instanceof HTMLImageElement)) return;
  const img = event.target;
  const note = element("span", "asset-unavailable", `${img.alt || "Game artwork"} — image coming soon`);
  note.style.cssText = "display:grid;place-items:center;min-height:100px;padding:22px;text-align:center;color:#c2cbe0;font-size:11px;background:#152039;border-radius:12px";
  img.replaceWith(note);
}, true);

if ("IntersectionObserver" in window) {
  if (!reducedMotion.matches) document.documentElement.classList.add("motion-ready");
  const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); reveals.unobserve(entry.target); } }), { threshold: 0.08 });
  $$(".reveal").forEach(node => reveals.observe(node));
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) $$("#main-nav a[href^='#']").forEach(link => { const active = link.hash === `#${entry.target.id}`; link.classList.toggle("active", active); if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); }); });
  }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
  $$("main section[id]").forEach(node => sectionObserver.observe(node));
}
