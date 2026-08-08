/* ============ Small utilities ============ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

async function loadJSON(path) {
  const cacheKey = `cache:${path}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  const data = await res.json();
  sessionStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function t(str) {
  // {placeholder} substitution helper
  return (params = {}) => str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '');
}

/* ============ App state ============ */
const state = {
  settings: null,
  categories: [],
  rules: [],
  faq: [],
  testimonials: [],
  themes: null,
  lang: null,       // current language JSON
  langCode: 'en',
  selectedCategory: null,
  selectedTime: null,
  customTime: null,
  selectedRuleCategory: null,
};

/* ============ Boot ============ */
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const [settings, categories, rules, faq, testimonials, themes] = await Promise.all([
      loadJSON('data/settings.json'),
      loadJSON('data/categories.json'),
      loadJSON('data/rule.json'),
      loadJSON('data/faq.json'),
      loadJSON('data/testimonials.json'),
      loadJSON('data/themes.json'),
    ]);
    state.settings = settings;
    state.categories = categories;
    state.rules = rules;
    state.faq = faq;
    state.testimonials = testimonials;
    state.themes = themes;

    applySettingsToDOM();
    applyStoredTheme();
    applyStoredMode();
    renderThemePanel();

    buildLanguageRegistry();
    renderLanguagePickers();

    const savedLang = localStorage.getItem('lang');
    const startLang = LANG_FILES[savedLang] ? savedLang : (s_defaultLang());
    await setLanguage(startLang, false);

    bindGlobalEvents();
    renderFAQ();
    renderTestimonials();
  } catch (err) {
    console.error(err);
    $('#appRoot')?.insertAdjacentHTML('afterbegin',
      `<div class="alert alert-danger m-3">Something went wrong loading the page. Please refresh.</div>`);
  }
}

function applySettingsToDOM() {
  const s = state.settings;
  $$('.js-company-name').forEach(el => el.textContent = s.companyName);
  if ($('#budgetRange')) {
    $('#budgetRange').min = s.budget.min;
    $('#budgetRange').max = s.budget.max;
    $('#budgetRange').step = s.budget.step;
    $('#budgetRange').value = s.budget.default;
  }
  if ($('#budgetValue')) $('#budgetValue').textContent = `${s.currency}${s.budget.default}`;
  if ($('#footerAddress')) $('#footerAddress').textContent = s.address;
}

/* ============ Language ============ */
// Fallback registry, replaced by data/settings.json → languages at boot.
let LANG_FILES = { en: 'languages/english.json', hi: 'languages/hindi.json', bn: 'languages/bengali.json' };
let LANG_META = {};

function s_defaultLang() {
  return state.settings?.defaultLanguage || 'en';
}

function buildLanguageRegistry() {
  const list = state.settings?.languages;
  if (!Array.isArray(list) || !list.length) return;
  LANG_FILES = {};
  LANG_META = {};
  list.forEach(l => {
    LANG_FILES[l.code] = l.file;
    LANG_META[l.code] = l;
  });
}

function renderLanguagePickers() {
  const list = state.settings?.languages || [];
  if (!list.length) return;

  const grid = $('#languageGrid');
  if (grid) {
    grid.innerHTML = list.map(l => `
      <div class="col-6 col-sm-4 col-md-3" data-lang-name="${(l.english + ' ' + l.native).toLowerCase()}">
        <div class="lang-card h-100" data-lang="${l.code}">
          <div class="fw-semibold lang-native">${l.native}</div>
          <div class="small text-muted">${l.english}</div>
        </div>
      </div>`).join('');
  }

  const panel = $('#langFabPanel');
  if (panel) {
    panel.innerHTML = `<div class="lang-card py-1 fw-semibold" id="langFabMore">
      <i class="bi bi-translate me-1"></i>${list.length} languages</div>`;
  }
}

function filterLanguageGrid(query) {
  const q = (query || '').toLowerCase().trim();
  $$('#languageGrid [data-lang-name]').forEach(col => {
    col.classList.toggle('d-none', q !== '' && !col.dataset.langName.includes(q));
  });
}

function showLanguageModal() {
  bootstrap.Modal.getOrCreateInstance('#languageModal').show();
}

async function setLanguage(code, closeModal = true) {
  if (!LANG_FILES[code]) code = s_defaultLang();
  const data = await loadJSON(LANG_FILES[code]);
  state.lang = data;
  state.langCode = code;
  localStorage.setItem('lang', code);
  document.documentElement.lang = code;
  document.documentElement.dir = LANG_META[code]?.dir || data.dir || 'ltr';
  $$('.lang-card').forEach(c => c.classList.toggle('active', c.dataset.lang === code));
  renderStaticText();
  renderCategories();
  renderRulebook();
  renderFAQ();
  renderTestimonials();
  renderTimeSlots();
  renderWhatsAppCategoryModal();
  if (closeModal) {
    const modalEl = $('#languageModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();
  }
}

function cleanPhone(num) {
  return (num || '').replace(/[^0-9]/g, '');
}

function renderStaticText() {
  const L = state.lang;
  if (!L) return;
  if ($('#navHome')) $('#navHome').textContent = L.nav?.home || 'Home';
  if ($('#navServices')) $('#navServices').textContent = L.nav?.services || 'Services';
  if ($('#navRulebook')) $('#navRulebook').textContent = L.nav?.rulebook || 'Rulebook';
  if ($('#navHow')) $('#navHow').textContent = L.nav?.how || 'How it works';
  if ($('#navFaq')) $('#navFaq').textContent = L.nav?.faq || 'FAQ';
  if ($('#navPartner')) $('#navPartner').textContent = L.nav?.partner || 'Become a Partner';
  if ($('#heroEyebrow')) $('#heroEyebrow').textContent = L.hero?.eyebrow || '24×7 On-Demand Help';
  if ($('#heroBadgeSecondary')) $('#heroBadgeSecondary').textContent = L.hero?.badgeSecondary || 'Verified & Instant';
  if ($('#heroTitle')) $('#heroTitle').textContent = L.hero?.title;
  if ($('#heroSubtitle')) $('#heroSubtitle').textContent = L.hero?.subtitle;
  if ($('#heroCtaText')) $('#heroCtaText').textContent = L.hero?.cta;
  if ($('#categoriesTitle')) $('#categoriesTitle').textContent = L.categories?.title;
  if ($('#howTitle')) $('#howTitle').textContent = L.how?.title;
  if ($('#whyTitle')) $('#whyTitle').textContent = L.why?.title;
  if ($('#testimonialsTitle')) $('#testimonialsTitle').textContent = L.testimonials?.title;
  if ($('#faqTitle')) $('#faqTitle').textContent = L.faq?.title;
  
  // Rulebook static text
  if ($('#rulebookTitle')) $('#rulebookTitle').textContent = L.rulebook?.title || 'Service Rulebook & Guidelines';
  if ($('#rulebookSubtitle')) $('#rulebookSubtitle').textContent = L.rulebook?.subtitle || 'Know exactly what is covered, what is not covered, and essential do\'s & don\'ts.';
  if ($('#ruleTabCovered')) $('#ruleTabCovered').textContent = L.rulebook?.includedTab || 'What\'s Covered';
  if ($('#ruleTabExcluded')) $('#ruleTabExcluded').textContent = L.rulebook?.excludedTab || 'What\'s NOT Covered';
  if ($('#ruleTabDos')) $('#ruleTabDos').textContent = L.rulebook?.dosTab || 'Do\'s';
  if ($('#ruleTabDonts')) $('#ruleTabDonts').textContent = L.rulebook?.dontsTab || 'Don\'ts';
  if ($('#rulebookSearch')) $('#rulebookSearch').placeholder = L.rulebook?.searchPlaceholder || 'Filter rulebook by service...';

  // Booking static text
  if ($('#bookingModalTitle')) $('#bookingModalTitle').textContent = L.booking?.title || 'Book Service';
  if ($('#labelRequiredWithin')) $('#labelRequiredWithin').textContent = L.booking?.requiredWithin;
  if ($('#labelBudget')) $('#labelBudget').textContent = L.booking?.budget;
  if ($('#labelLocation')) $('#labelLocation').textContent = L.booking?.location;
  if ($('#getLocationBtnText')) $('#getLocationBtnText').textContent = L.booking?.getLocation;
  if ($('#labelManualAddress')) $('#labelManualAddress').textContent = L.booking?.manualAddressLabel || 'Address / House No. / Landmark';
  if ($('#manualAddressInput')) $('#manualAddressInput').placeholder = L.booking?.manualAddressPlaceholder || 'Enter flat/house no, building, street, landmark...';
  if ($('#labelMessage')) $('#labelMessage').textContent = L.booking?.message;
  if ($('#bookingMessage')) $('#bookingMessage').placeholder = L.booking?.messagePlaceholder;
  if ($('#bookingSubmit')) $('#bookingSubmit').innerHTML = `<i class="bi bi-whatsapp me-2"></i>${L.booking?.submit}`;
  
  // Partner static text
  if ($('#partnerFabLabel')) $('#partnerFabLabel').textContent = L.partner?.navLabel;
  if ($('#partnerModalTitle')) $('#partnerModalTitle').textContent = L.partner?.title;
  if ($('#partnerSubtitle')) $('#partnerSubtitle').textContent = L.partner?.subtitle;
  if ($('#partnerNameLabel')) $('#partnerNameLabel').textContent = L.partner?.nameLabel || 'Full Name';
  if ($('#partnerName')) $('#partnerName').placeholder = L.partner?.namePlaceholder || 'e.g. Rahul Sharma';
  if ($('#partnerPhoneLabel')) $('#partnerPhoneLabel').textContent = L.partner?.phoneLabel || 'Phone / WhatsApp Number';
  if ($('#partnerPhone')) $('#partnerPhone').placeholder = L.partner?.phonePlaceholder || 'e.g. +91 89528 72163';
  if ($('#partnerCategoryLabel')) $('#partnerCategoryLabel').textContent = L.partner?.categoryLabel || 'Service Category / Skill';
  if ($('#partnerSelectCategory')) $('#partnerSelectCategory').textContent = L.partner?.selectCategory || 'Select your service...';
  if ($('#partnerExpLabel')) $('#partnerExpLabel').textContent = L.partner?.expLabel || 'Experience (Years)';
  if ($('#partnerExp')) $('#partnerExp').placeholder = L.partner?.expPlaceholder || 'e.g. 3';
  if ($('#partnerLocationLabel')) $('#partnerLocationLabel').textContent = L.partner?.locationLabel || 'City / Operating Area';
  if ($('#partnerLocation')) $('#partnerLocation').placeholder = L.partner?.locationPlaceholder || 'e.g. Purnia, Bihar';
  if ($('#partnerDetailsLabel')) $('#partnerDetailsLabel').textContent = L.partner?.detailsLabel || 'Additional Details / Skill Description';
  if ($('#partnerMessage')) $('#partnerMessage').placeholder = L.partner?.detailsPlaceholder || 'Tell us about your work experience...';
  if ($('#partnerSubmitText')) $('#partnerSubmitText').textContent = L.partner?.submitBtn || 'Submit Application on WhatsApp';
  if ($('#partnerDirectChatText')) $('#partnerDirectChatText').textContent = L.partner?.directChatBtn || 'Or Chat Directly on WhatsApp';
  
  // Terms & Privacy modal static text
  if ($('#termsModalTitle')) $('#termsModalTitle').innerHTML = `<i class="bi bi-file-earmark-text text-primary me-2"></i>${L.terms?.title || 'Terms & Conditions'}`;
  if ($('#termsLastUpdated')) $('#termsLastUpdated').textContent = L.terms?.lastUpdated || 'Last updated: August 2026';
  if ($('#termsIntro')) $('#termsIntro').textContent = L.terms?.intro;
  if ($('#termsSec1Title')) $('#termsSec1Title').textContent = L.terms?.sec1Title;
  if ($('#termsSec1Body')) $('#termsSec1Body').textContent = L.terms?.sec1Body;
  if ($('#termsSec2Title')) $('#termsSec2Title').textContent = L.terms?.sec2Title;
  if ($('#termsSec2Body')) $('#termsSec2Body').textContent = L.terms?.sec2Body;
  if ($('#termsSec3Title')) $('#termsSec3Title').textContent = L.terms?.sec3Title;
  if ($('#termsSec3Body')) $('#termsSec3Body').textContent = L.terms?.sec3Body;
  if ($('#termsSec4Title')) $('#termsSec4Title').textContent = L.terms?.sec4Title;
  if ($('#termsSec4Body')) $('#termsSec4Body').textContent = L.terms?.sec4Body;

  if ($('#privacyModalTitle')) $('#privacyModalTitle').innerHTML = `<i class="bi bi-shield-lock text-success me-2"></i>${L.privacy?.title || 'Privacy Policy'}`;
  if ($('#privacyLastUpdated')) $('#privacyLastUpdated').textContent = L.privacy?.lastUpdated || 'Last updated: August 2026';
  if ($('#privacyIntro')) $('#privacyIntro').textContent = L.privacy?.intro;
  if ($('#privacySec1Title')) $('#privacySec1Title').textContent = L.privacy?.sec1Title;
  if ($('#privacySec1Body')) $('#privacySec1Body').textContent = L.privacy?.sec1Body;
  if ($('#privacySec2Title')) $('#privacySec2Title').textContent = L.privacy?.sec2Title;
  if ($('#privacySec2Body')) $('#privacySec2Body').textContent = L.privacy?.sec2Body;
  if ($('#privacySec3Title')) $('#privacySec3Title').textContent = L.privacy?.sec3Title;
  if ($('#privacySec3Body')) $('#privacySec3Body').textContent = L.privacy?.sec3Body;
  if ($('#privacySec4Title')) $('#privacySec4Title').textContent = L.privacy?.sec4Title;
  if ($('#privacySec4Body')) $('#privacySec4Body').textContent = L.privacy?.sec4Body;

  if ($('#waModalTitle')) $('#waModalTitle').innerHTML = `<i class="bi bi-whatsapp text-success me-2"></i>${L.whatsappModal?.title || 'Select Service Category'}`;
  if ($('#waModalSubtitle')) $('#waModalSubtitle').textContent = L.whatsappModal?.subtitle || 'Choose the service you need to connect with a verified professional on WhatsApp.';
  if ($('#footerRights')) $('#footerRights').textContent = `${state.settings?.companyName || 'Kaamwale'} — ${L.footer?.rights}`;
  if ($('#footerPrivacy')) $('#footerPrivacy').textContent = L.footer?.privacy;
  if ($('#footerTerms')) $('#footerTerms').textContent = L.footer?.terms;
  if ($('#footerFollow')) $('#footerFollow').textContent = L.footer?.follow;

  populatePartnerCategories();
}

/* ============ Categories ============ */
function renderCategories() {
  const grid = $('#categoryGrid');
  if (!grid) return;
  grid.innerHTML = state.categories.map(cat => `
    <div class="col-6 col-md-4 col-lg-3 category-col">
      <div class="category-card" tabindex="0" role="button"
           data-id="${cat.id}"
           aria-label="${cat.name[state.langCode] || cat.name.en}">
        <div class="category-icon" style="background:${cat.themeColor}">
          <i class="bi ${cat.icon}"></i>
        </div>
        <h3>${cat.name[state.langCode] || cat.name.en}</h3>
        <p class="category-desc">${cat.description[state.langCode] || cat.description.en}</p>
      </div>
    </div>
  `).join('');

  $$('.category-card', grid).forEach(card => {
    card.addEventListener('click', () => openBookingModal(card.dataset.id));
    card.addEventListener('keypress', e => { if (e.key === 'Enter') openBookingModal(card.dataset.id); });
  });
}

/* ============ Rulebook ============ */
function renderRulebook(searchQuery = '') {
  const pillsWrap = $('#rulebookCategoryPills');
  if (!pillsWrap || !state.rules || state.rules.length === 0) return;

  if (!state.selectedRuleCategory) {
    state.selectedRuleCategory = state.rules[0].id;
  }

  // Render Category Selector Pills
  pillsWrap.innerHTML = state.rules.map(rule => {
    const name = rule.name[state.langCode] || rule.name.en;
    const isActive = rule.id === state.selectedRuleCategory;
    return `
      <button type="button" class="rulebook-pill ${isActive ? 'active' : ''}" data-id="${rule.id}">
        <i class="bi ${rule.icon}"></i> ${name}
      </button>
    `;
  }).join('');

  $$('.rulebook-pill', pillsWrap).forEach(pill => {
    pill.addEventListener('click', () => {
      state.selectedRuleCategory = pill.dataset.id;
      renderRulebook($('#rulebookSearch')?.value || '');
    });
  });

  // Find active category rule data
  const currentRule = state.rules.find(r => r.id === state.selectedRuleCategory) || state.rules[0];
  const catName = currentRule.name[state.langCode] || currentRule.name.en;

  if ($('#rulebookCatName')) $('#rulebookCatName').textContent = catName;
  if ($('#rulebookCatIcon')) {
    $('#rulebookCatIcon').innerHTML = `<i class="bi ${currentRule.icon}"></i>`;
    $('#rulebookCatIcon').style.background = currentRule.themeColor;
  }

  const query = (searchQuery || '').toLowerCase().trim();

  const filterList = (arr) => {
    const list = arr[state.langCode] || arr.en || [];
    if (!query) return list;
    return list.filter(item => item.toLowerCase().includes(query));
  };

  const covered = filterList(currentRule.included);
  const excluded = filterList(currentRule.excluded);
  const dos = filterList(currentRule.dos);
  const donts = filterList(currentRule.donts);

  if ($('#ruleListCovered')) {
    $('#ruleListCovered').innerHTML = covered.length ? covered.map(i => `<li>${i}</li>`).join('') : `<li class="text-muted">No items matched search.</li>`;
  }
  if ($('#ruleListExcluded')) {
    $('#ruleListExcluded').innerHTML = excluded.length ? excluded.map(i => `<li>${i}</li>`).join('') : `<li class="text-muted">No items matched search.</li>`;
  }
  if ($('#ruleListDos')) {
    $('#ruleListDos').innerHTML = dos.length ? dos.map(i => `<li>${i}</li>`).join('') : `<li class="text-muted">No items matched search.</li>`;
  }
  if ($('#ruleListDonts')) {
    $('#ruleListDonts').innerHTML = donts.length ? donts.map(i => `<li>${i}</li>`).join('') : `<li class="text-muted">No items matched search.</li>`;
  }
}

/* ============ Booking modal ============ */
function getTimeSlotIcon(id) {
  switch (id) {
    case '10min': return 'bi-lightning-charge-fill';
    case '20min': return 'bi-alarm-fill';
    case '30min': return 'bi-clock-fill';
    case '1hour': return 'bi-hourglass-split';
    default: return 'bi-calendar-event-fill';
  }
}

function getTimeSlotTag(slot) {
  if (slot.urgent) return slot.id === '10min' ? 'Urgent' : 'Express';
  if (slot.id === '30min') return 'Standard';
  if (slot.id === '1hour') return 'Flexible';
  return 'Custom';
}

function renderTimeSlots() {
  const wrap = $('#timeSlotWrap');
  if (!wrap) return;
  const L = state.lang;
  wrap.className = 'time-slot-grid';
  wrap.innerHTML = state.settings.timeSlots.map(slot => {
    const iconClass = getTimeSlotIcon(slot.id);
    const tagText = getTimeSlotTag(slot);
    const labelText = slot.label[state.langCode] || slot.label.en;
    return `
      <label class="time-card-slot ${slot.urgent ? 'urgent-slot' : ''}" data-id="${slot.id}">
        <input type="radio" name="timeSlot" value="${slot.id}">
        <i class="bi ${iconClass} time-icon"></i>
        <div class="time-title">${labelText}</div>
        <span class="time-badge">${tagText}</span>
      </label>
    `;
  }).join('');

  $$('.time-card-slot', wrap).forEach(el => {
    el.addEventListener('click', () => {
      $$('.time-card-slot', wrap).forEach(x => x.classList.remove('checked'));
      el.classList.add('checked');
      $('input', el).checked = true;
      state.selectedTime = el.dataset.id;
      if (el.dataset.id === 'custom') {
        $('#customTimeWrap')?.classList.remove('d-none');
      } else {
        $('#customTimeWrap')?.classList.add('d-none');
      }
    });
  });
}

function openBookingModal(categoryId) {
  const cat = state.categories.find(c => c.id === categoryId);
  if (!cat) return;
  state.selectedCategory = cat;

  $('#bookingCategoryName').textContent = cat.name[state.langCode] || cat.name.en;
  $('#bookingCategoryIcon').innerHTML = `<i class="bi ${cat.icon}"></i>`;
  $('#bookingCategoryIcon').style.background = cat.themeColor;
  $('#bookingCategoryDesc').textContent = cat.description[state.langCode] || cat.description.en;

  // reset state
  state.selectedTime = null;
  $$('.time-card-slot').forEach(x => x.classList.remove('checked'));
  $('#customTimeWrap')?.classList.add('d-none');
  if ($('#customTimeInput')) $('#customTimeInput').value = '';
  if ($('#manualAddressInput')) $('#manualAddressInput').value = '';
  if ($('#bookingMessage')) $('#bookingMessage').value = '';
  if ($('#gpsStatus')) {
    $('#gpsStatus').innerHTML = '';
    $('#gpsStatus').dataset.link = '';
  }
  if ($('#bookingForm')) $('#bookingForm').dataset.categoryId = cat.id;

  new bootstrap.Modal('#bookingModal').show();
}

function getWhatsAppTimeLabel() {
  if (state.selectedTime === 'custom') {
    return $('#customTimeInput')?.value || state.lang?.booking?.customTimeLabel || 'Pick a time';
  }
  const slot = state.settings.timeSlots.find(s => s.id === state.selectedTime);
  return slot ? (slot.label[state.langCode] || slot.label.en) : '';
}

function submitBooking(e) {
  e.preventDefault();
  const L = state.lang;
  const s = state.settings;
  const cat = state.selectedCategory;

  if (!state.selectedTime) {
    $('#timeSlotWrap').classList.add('is-invalid-shake');
    setTimeout(() => $('#timeSlotWrap').classList.remove('is-invalid-shake'), 400);
    return;
  }

  const budget = `${s.currency}${$('#budgetRange').value}`;
  const gpsLocation = $('#gpsStatus')?.dataset?.link || '';
  const manualAddr = $('#manualAddressInput')?.value?.trim() || '';

  let combinedAddress = '—';
  if (gpsLocation && manualAddr) {
    combinedAddress = `${manualAddr} (GPS: ${gpsLocation})`;
  } else if (gpsLocation) {
    combinedAddress = gpsLocation;
  } else if (manualAddr) {
    combinedAddress = manualAddr;
  }

  const message = $('#bookingMessage').value || '—';
  const timeLabel = getWhatsAppTimeLabel();
  const catName = cat.name[state.langCode] || cat.name.en;

  const textTemplate = L.whatsapp?.bookingMessage || "🛠️ *KAAMWALE SERVICE BOOKING*\n──────────────────────────\n📌 *Service Category:* {category}\n⏰ *Required Within:* {time}\n💰 *Estimated Budget:* {budget}\n📍 *GPS Pin:* {location}\n🏠 *Address:* {address}\n📝 *Problem Details:* {message}\n──────────────────────────\n⚡ *Please assign a verified professional immediately!*";

  const text = t(textTemplate)({
    category: catName,
    time: timeLabel,
    budget: budget,
    location: gpsLocation || 'Not shared',
    address: combinedAddress,
    message: message
  });

  const url = `https://wa.me/${cleanPhone(s.whatsappNumber)}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/* ============ GPS ============ */
function requestLocation() {
  const L = state.lang;
  const box = $('#gpsStatus');
  box.className = 'gps-status-box mt-2';
  box.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div> Capturing location…`;

  if (!navigator.geolocation) {
    box.innerHTML = L.booking?.locationUnavailable || 'GPS unavailable';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const link = `https://maps.google.com/?q=${latitude},${longitude}`;
      box.dataset.link = link;
      box.innerHTML = `<i class="bi bi-geo-alt-fill text-success me-1"></i> ${L.booking?.locationGranted || 'Location captured'} — <a href="${link}" target="_blank" class="fw-bold">View Pin</a>`;
      sessionStorage.setItem('lastLocationLink', link);
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        box.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> ${L.booking?.locationDenied || 'GPS denied. Please type address below.'}`;
      } else {
        box.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> ${L.booking?.locationUnavailable || 'Location unavailable.'}`;
      }
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

/* ============ Become a Partner ============ */
function populatePartnerCategories() {
  const select = $('#partnerCategory');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = `
    <option value="" disabled ${!currentVal ? 'selected' : ''} id="partnerSelectCategory">
      ${state.lang?.partner?.selectCategory || 'Select your service...'}
    </option>
    ${state.categories.map(cat => {
      const name = cat.name[state.langCode] || cat.name.en;
      return `<option value="${name}" data-icon="${cat.icon}">${name}</option>`;
    }).join('')}
    <option value="Other / General Helper" data-icon="bi-tools">Other / General Helper</option>
  `;
  if (currentVal) select.value = currentVal;
  updatePartnerCategoryIcon();
}

function updatePartnerCategoryIcon() {
  const select = $('#partnerCategory');
  const iconEl = $('#partnerCategoryIcon');
  if (!select || !iconEl) return;
  const selectedOpt = select.options[select.selectedIndex];
  const iconClass = selectedOpt?.dataset?.icon || 'bi-tools';
  iconEl.className = `bi ${iconClass} text-primary`;
}

function openPartnerWhatsapp() {
  const p = state.settings.partner || {};
  const num = cleanPhone(p.whatsappNumber || state.settings.whatsappNumber);
  const url = `https://wa.me/${num}?text=${encodeURIComponent(p.whatsappMessage || "Hi! I'm interested in becoming a service partner with Kaamwale.")}`;
  window.open(url, '_blank');
}

function submitPartnerForm(e) {
  e.preventDefault();
  const L = state.lang;
  const s = state.settings;

  const name = $('#partnerName')?.value?.trim() || '—';
  const phone = $('#partnerPhone')?.value?.trim() || '—';
  const category = $('#partnerCategory')?.value || '—';
  const experience = $('#partnerExp')?.value?.trim() || '0';
  const location = $('#partnerLocation')?.value?.trim() || '—';
  const details = $('#partnerMessage')?.value?.trim() || '—';

  const textTemplate = L.whatsapp?.partnerMessage || "💼 *KAAMWALE PARTNER APPLICATION*\n──────────────────────────\n👤 *Full Name:* {name}\n📞 *Phone Number:* {phone}\n🛠️ *Service Category:* {category}\n⭐ *Experience:* {experience} Years\n📍 *Operating City:* {location}\n📝 *Skills & Details:* {details}\n──────────────────────────\n🚀 *I am ready to join as a Service Partner!*";

  const text = t(textTemplate)({
    name, phone, category, experience, location, details
  });

  const num = cleanPhone(s.partner?.whatsappNumber || s.whatsappNumber);
  const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');

  const alertWrap = $('#partnerAlertWrap');
  if (alertWrap) {
    alertWrap.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show small mb-3" role="alert">
        <i class="bi bi-check-circle-fill me-1"></i> ${L.partner?.successMsg || 'Your partner application has been opened in WhatsApp!'}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}

/* ============ Scrollable WhatsApp Category Guide Selector Modal ============ */
function openWhatsAppCategoryModal() {
  renderWhatsAppCategoryModal();
  new bootstrap.Modal('#whatsappCategoryModal').show();
}

// One-tap booking: name the category (and its price) in the message so the
// user doesn't have to fill the booking form first.
function sendQuickWhatsApp(categoryId) {
  const cat = state.categories.find(c => c.id === categoryId);
  const s = state.settings;
  if (!cat || !s) return;

  const name = cat.name[state.langCode] || cat.name.en;
  const price = cat.priceRange || `${s.currency || '₹'}${cat.startingPrice}`;
  const tpl = state.lang?.whatsapp?.quickMessage
    || '🛠️ *{company}*\n📌 *Service Needed:* {category}\n💰 *Indicative Price:* {price}\n\nPlease send a verified professional.';
  const text = tpl
    .replace('{company}', s.companyName)
    .replace('{category}', name)
    .replace('{price}', price);

  window.open(`https://wa.me/${cleanPhone(s.whatsappNumber)}?text=${encodeURIComponent(text)}`, '_blank');
}

function renderWhatsAppCategoryModal(filter = '') {
  const container = $('#waCategoryGridContainer');
  if (!container) return;
  
  const query = filter.toLowerCase().trim();
  const filteredCategories = state.categories.filter(cat => {
    const name = (cat.name[state.langCode] || cat.name.en).toLowerCase();
    const desc = (cat.description[state.langCode] || cat.description.en).toLowerCase();
    return name.includes(query) || desc.includes(query);
  });

  if (filteredCategories.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-4 col-12">No matching services found.</div>`;
    return;
  }

  container.innerHTML = filteredCategories.map(cat => {
    const name = cat.name[state.langCode] || cat.name.en;
    const desc = cat.description[state.langCode] || cat.description.en;
    const priceText = cat.priceRange ? `Price: ${cat.priceRange}` : `Starts at ${state.settings?.currency || '₹'}${cat.startingPrice}`;
    
    return `
      <div class="wa-guide-card" data-id="${cat.id}">
        <div>
          <div class="guide-icon-wrap" style="background:${cat.themeColor}">
            <i class="bi ${cat.icon}"></i>
          </div>
          <h5>${name}</h5>
          <p>${desc}</p>
        </div>
        <div>
          <span class="price-tag mb-2"><i class="bi bi-tag-fill me-1"></i>${priceText}</span>
          <button type="button" class="btn-wa-quick" data-quick="${cat.id}">
            <i class="bi bi-whatsapp"></i> ${state.lang?.whatsappModal?.quickBook || 'WhatsApp'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  $$('.wa-guide-card', container).forEach(card => {
    card.addEventListener('click', e => {
      bootstrap.Modal.getInstance($('#whatsappCategoryModal'))?.hide();
      // The green button is the one-tap path: straight to WhatsApp with the
      // category already named. Tapping anywhere else opens the full form.
      if (e.target.closest('[data-quick]')) sendQuickWhatsApp(card.dataset.id);
      else openBookingModal(card.dataset.id);
    });
  });
}

/* ============ Theme (color) ============ */
function applyTheme(key) {
  const preset = state.themes.presets[key];
  if (!preset) return;
  const root = document.documentElement;
  root.style.setProperty('--primary', preset.primary);
  root.style.setProperty('--secondary', preset.secondary);
  root.style.setProperty('--accent', preset.accent);
  root.style.setProperty('--radius', preset.radius);
  localStorage.setItem('theme', key);
  $$('.theme-swatch').forEach(sw => sw.classList.toggle('active', sw.dataset.key === key));
}

function applyStoredTheme() {
  const saved = localStorage.getItem('theme') || state.themes.default;
  applyTheme(saved);
}

/* ============ Mode (light/dark) — independent of color theme ============ */
function applyMode(mode) {
  document.documentElement.setAttribute('data-mode', mode);
  localStorage.setItem('mode', mode);
  const icon = $('#modeIcon');
  if (icon) icon.className = mode === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
}

function applyStoredMode() {
  const saved = localStorage.getItem('mode') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyMode(saved);
}

function toggleMode() {
  const current = document.documentElement.getAttribute('data-mode') || 'light';
  applyMode(current === 'dark' ? 'light' : 'dark');
}

function renderThemePanel() {
  const wrap = $('#themeSwatches');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(state.themes.presets).map(([key, preset]) => `
    <button class="theme-swatch" data-key="${key}" title="${preset.name}"
      style="background:${preset.primary}" aria-label="${preset.name}"></button>
  `).join('');
  $$('.theme-swatch', wrap).forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.key));
  });
}

/* ============ FAQ / Testimonials ============ */
function renderFAQ() {
  if (!state.lang || !state.faq) return;
  const wrap = $('#faqAccordion');
  if (!wrap) return;
  wrap.innerHTML = state.faq.map((item, i) => `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}">
          ${item.q[state.langCode] || item.q.en}
        </button>
      </h2>
      <div id="faq${i}" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
        <div class="accordion-body text-muted">${item.a[state.langCode] || item.a.en}</div>
      </div>
    </div>
  `).join('');
}

function renderTestimonials() {
  if (!state.lang || !state.testimonials) return;
  const wrap = $('#testimonialsWrap');
  if (!wrap) return;
  wrap.innerHTML = state.testimonials.map(item => `
    <div class="col-md-4">
      <div class="testimonial-card">
        <div class="mb-2">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>
        <p class="mb-3">${item.text[state.langCode] || item.text.en}</p>
        <strong>${item.name}</strong>
        <div class="text-muted small">${item.category[state.langCode] || item.category.en}</div>
      </div>
    </div>
  `).join('');
}

/* ============ Global events ============ */
function bindGlobalEvents() {
  // Language selection cards (delegated — the grid is rendered from settings.json)
  $('#languageGrid')?.addEventListener('click', e => {
    const card = e.target.closest('[data-lang]');
    if (!card) return;
    setLanguage(card.dataset.lang);
  });
  $('#languageSearchInput')?.addEventListener('input', e => filterLanguageGrid(e.target.value));
  $('#langFabPanel')?.addEventListener('click', e => {
    const card = e.target.closest('[data-lang]');
    if (card) { setLanguage(card.dataset.lang); return; }
    if (e.target.closest('#langFabMore')) {
      $('#langFabPanel').classList.add('d-none');
      showLanguageModal();
    }
  });

  // Budget slider
  $('#budgetRange')?.addEventListener('input', e => {
    if ($('#budgetValue')) $('#budgetValue').textContent = `${state.settings?.currency || '₹'}${e.target.value}`;
  });

  // GPS button
  $('#getLocationBtn')?.addEventListener('click', requestLocation);

  // Booking form submit
  $('#bookingForm')?.addEventListener('submit', submitBooking);

  // Rulebook Search
  $('#rulebookSearch')?.addEventListener('input', debounce(e => {
    renderRulebook(e.target.value);
  }, 200));

  // Hero Rulebook button
  $('#heroRulebookBtn')?.addEventListener('click', () => {
    $('#rulebook')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Open WA Guide from section header
  $('#openWaGuideBtn')?.addEventListener('click', openWhatsAppCategoryModal);

  // WA guide modal search
  $('#waGuideSearchInput')?.addEventListener('input', debounce(e => {
    renderWhatsAppCategoryModal(e.target.value);
  }, 150));

  // Terms & Conditions modal trigger
  $('#footerTerms')?.addEventListener('click', e => {
    e.preventDefault();
    new bootstrap.Modal('#termsModal').show();
  });

  // Privacy Policy modal trigger
  $('#footerPrivacy')?.addEventListener('click', e => {
    e.preventDefault();
    new bootstrap.Modal('#privacyModal').show();
  });

  // Become a Partner — navbar + FAB open the same dialog
  const openPartnerModal = () => {
    populatePartnerCategories();
    new bootstrap.Modal('#partnerModal').show();
  };
  $('#navPartnerBtn')?.addEventListener('click', openPartnerModal);
  $('#fabPartner')?.addEventListener('click', openPartnerModal);
  $('#partnerForm')?.addEventListener('submit', submitPartnerForm);
  $('#partnerWhatsappBtn')?.addEventListener('click', openPartnerWhatsapp);
  $('#partnerCategory')?.addEventListener('change', updatePartnerCategoryIcon);

  // Dark / light mode toggle
  $('#modeToggle')?.addEventListener('click', toggleMode);

  // FAB stack toggle
  $('#fabMain')?.addEventListener('click', () => {
    $('#fabStack').classList.toggle('open');
    $('#fabMenu').classList.toggle('d-none');
  });

  // Floating WhatsApp button opens horizontal category selector modal
  $('#fabWhatsapp')?.addEventListener('click', openWhatsAppCategoryModal);

  // Theme FAB
  $('#fabTheme')?.addEventListener('click', () => new bootstrap.Modal('#themeModal').show());

  // Language FAB toggle panel
  $('#fabLang')?.addEventListener('click', () => $('#langFabPanel').classList.toggle('d-none'));

  // Scroll to top
  window.addEventListener('scroll', debounce(() => {
    $('#fabTop').classList.toggle('show', window.scrollY > 400);
  }, 100));
  $('#fabTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Hero CTA scrolls to categories
  $('#heroCta')?.addEventListener('click', () => {
    $('#categories')?.scrollIntoView({ behavior: 'smooth' });
  });
}
