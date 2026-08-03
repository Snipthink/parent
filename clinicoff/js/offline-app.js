/* Server-free local build: all JSON is read from window.CLINIC_DATA when opened with file://. */
async function loadJSON(path){
  try{
    const bundle=window.CLINIC_DATA;
    const normalized=path.replace(/^\.\//,'');
    const langMatch=normalized.match(/^data\/languages\/([^/]+)\.json$/);
    if(window.location.protocol === 'file:' && bundle){
      if(langMatch && bundle.languages?.[langMatch[1]]) return bundle.languages[langMatch[1]];
      if(normalized === 'themes/theme.json' && bundle.theme) return bundle.theme;
      const key=normalized.match(/^data\/([^/]+)\.json$/)?.[1];
      if(key && bundle.base?.[key]) return bundle.base[key];
    }
    const r=await fetch(path,{cache:'no-store'});
    if(!r.ok) throw new Error('Failed to load '+path);
    return await r.json();
  }catch(error){
    const bundle=window.CLINIC_DATA;
    if(!bundle) throw error;
    const normalized=path.replace(/^\.\//,'');
    const langMatch=normalized.match(/^data\/languages\/([^/]+)\.json$/);
    if(langMatch && bundle.languages?.[langMatch[1]]) return bundle.languages[langMatch[1]];
    if(normalized==='themes/theme.json' && bundle.theme) return bundle.theme;
    const key=normalized.match(/^data\/([^/]+)\.json$/)?.[1];
    if(key && bundle.base?.[key]) return bundle.base[key];
    throw error;
  }
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

window.ClinicUtils={loadJSON,escapeHtml};


/* Theme */

let cfg = { themes: [] };
let current = localStorage.getItem('clinic_theme_palette') || 'sapphire';
let dark = localStorage.getItem('clinic_theme_mode') === 'dark';

async function initTheme(def = 'sapphire') {
  cfg = await loadJSON('themes/theme.json');
  if (!cfg.themes?.length) throw new Error('themes/theme.json contains no themes');
  if (!cfg.themes.some((x) => x.id === current)) current = cfg.themes.some((x) => x.id === def) ? def : cfg.themes[0].id;
  applyTheme(current, dark);
  bind();
}

function applyTheme(id = current, mode = dark) {
  const p = cfg.themes.find((x) => x.id === id) || cfg.themes[0];
  if (!p) return;
  current = p.id;
  dark = !!mode;
  localStorage.setItem('clinic_theme_palette', current);
  localStorage.setItem('clinic_theme_mode', dark ? 'dark' : 'light');

  const m = dark ? p.dark : p.light;
  const root = document.documentElement;
  const vars = {
    '--color-primary': m.primary,
    '--color-secondary': m.secondary,
    '--color-accent': m.accent,
    '--color-button-bg': m.button_background,
    '--color-button-text': m.button_text,
    '--color-badge-bg': m.section_background,
    '--color-badge-text': m.primary,
    '--color-background': m.background,
    '--color-section': m.section_background,
    '--color-card': m.card_background,
    '--color-heading': m.heading_text,
    '--color-body': m.body_text,
    '--color-muted': m.muted_text,
    '--color-border': m.border,
    '--color-input-bg': m.background
  };
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  root.dataset.theme = current;
  root.dataset.mode = dark ? 'dark' : 'light';

  const icon = dark ? 'fa-sun' : 'fa-moon';
  ['darkModeIcon', 'darkModeIconMobile', 'panelDarkModeIcon'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.className = `fa-regular ${icon}`;
  });
  const label = document.getElementById('panelDarkModeLabel');
  if (label) label.textContent = dark ? 'Light Mode' : 'Dark Mode';
  renderThemePanelSwatches();
}

function renderThemePanelSwatches() {
  const el = document.getElementById('themePaletteList');
  if (!el) return;
  el.innerHTML = cfg.themes.map((p) => {
    const m = dark ? p.dark : p.light;
    const selected = p.id === current;
    return `<button type="button" data-theme-id="${p.id}" aria-pressed="${selected}" class="theme-swatch w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs ${selected ? 'theme-swatch-selected' : ''}"><div class="flex items-center gap-3"><span class="theme-swatch-dot" style="background:linear-gradient(135deg,${m.primary},${m.accent})"></span><span class="text-theme-heading">${p.name}</span></div>${selected ? '<i class="fa-solid fa-check text-theme-primary"></i>' : ''}</button>`;
  }).join('');
  el.querySelectorAll('[data-theme-id]').forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.themeId, dark));
  });
}

function bind() {
  const toggle = () => applyTheme(current, !dark);
  ['darkModeToggleBtn', 'darkModeToggleMobileBtn', 'panelDarkModeToggle'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', toggle);
  });

  const panel = document.getElementById('themeSettingsPanel');
  const settingsButton = document.getElementById('themeSettingsToggleBtn');
  settingsButton?.addEventListener('click', () => {
    const isHidden = panel?.classList.toggle('hidden');
    settingsButton.setAttribute('aria-expanded', String(isHidden === false));
  });
  document.getElementById('closeThemePanelBtn')?.addEventListener('click', () => {
    panel?.classList.add('hidden');
    settingsButton?.setAttribute('aria-expanded', 'false');
  });
}

window.applyTheme = applyTheme;


/* Modals */
let activeModal = null;
let lastFocused = null;

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  activeModal = modal;
  requestAnimationFrame(() => {
    const focusTarget = modal.querySelector('input, select, textarea, button:not([aria-label="Close"])');
    focusTarget?.focus();
  });
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  activeModal = null;
  document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
}

function initModal() {
  const pairs = [
    ['openDoctorModalBtn', 'doctorModal', 'closeDoctorModalBtn', 'doctorModalBackdrop'],
    ['openPrivacyModalBtn', 'privacyModal', 'closePrivacyModalBtn', 'privacyModalBackdrop'],
    ['openTermsModalBtn', 'termsModal', 'closeTermsModalBtn', 'termsModalBackdrop'],
    ['closeAppointmentModalBtn', 'appointmentModal', 'closeAppointmentModalBtn', 'appointmentModalBackdrop']
  ];

  pairs.forEach(([openId, modalId, closeId, backdropId]) => {
    document.getElementById(openId)?.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(modalId);
    });
    if (closeId) document.getElementById(closeId)?.addEventListener('click', () => closeModal(modalId));
    document.getElementById(backdropId)?.addEventListener('click', () => closeModal(modalId));
  });

  document.querySelectorAll('[data-open-appointment]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal('appointmentModal');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (activeModal) closeModal(activeModal.id);
    const videoModal = document.getElementById('videoModal');
    if (videoModal && !videoModal.classList.contains('hidden')) {
      videoModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
      const frame = document.getElementById('videoModalFrame');
      if (frame) frame.src = '';
    }
    const panel = document.getElementById('themeSettingsPanel');
    if (panel && !panel.classList.contains('hidden')) panel.classList.add('hidden');
  });

  document.getElementById('appointmentCallBtn')?.addEventListener('click', () => {
    const href = document.getElementById('floatCallBtn')?.getAttribute('href');
    if (href && href !== 'tel:') window.location.href = href;
  });

  document.getElementById('appointmentModalForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const error = document.getElementById('appointmentModalError');
    if (!form.checkValidity()) {
      error.textContent = 'Please complete the required fields before sending your appointment request.';
      error.classList.remove('hidden');
      form.reportValidity();
      return;
    }
    error.classList.add('hidden');
    const data = new FormData(form);
    const clinicName = document.getElementById('navClinicName')?.textContent?.trim() || 'Clinic';
    const lines = [
      `Appointment Request - ${clinicName}`,
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Age: ${data.get('age')}`,
      `Gender: ${data.get('gender')}`,
      `Email: ${data.get('email') || 'Not provided'}`,
      `Reason: ${data.get('reason')}`,
      `Preferred Date: ${data.get('date')}`,
      `Preferred Time: ${data.get('time') || 'Flexible'}`,
      `Additional Information: ${data.get('message') || 'None'}`
    ];
    const whatsapp = document.getElementById('floatWhatsappBtn')?.getAttribute('href');
    if (!whatsapp || !whatsapp.startsWith('https://wa.me/')) {
      error.textContent = 'WhatsApp is not configured yet. Please use the Call Clinic button.';
      error.classList.remove('hidden');
      return;
    }
    window.open(`${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    closeModal('appointmentModal');
    form.reset();
  });
}




/* Navigation */
function initNavigation(){const b=document.getElementById('mobileMenuBtn'),m=document.getElementById('mobileMenu');b?.addEventListener('click',()=>m?.classList.toggle('hidden'));document.querySelectorAll('.mobile-nav-link').forEach(x=>x.addEventListener('click',()=>m?.classList.add('hidden')));}


/* Application */

let BASE = {};
let D = {};
let initialized = false;

const getPath = (obj, path) => path.split('.').reduce((v, k) => v?.[k], obj);
const deepMerge = (base, override) => {
    if (Array.isArray(base)) return Array.isArray(override) ? override : base;
    if (base && typeof base === 'object') {
        const out = {...base};
        if (override && typeof override === 'object') {
            for (const [k,v] of Object.entries(override)) out[k] = k in out ? deepMerge(out[k], v) : v;
        }
        return out;
    }
    return override === undefined ? base : override;
};
const set = (id, value) => { const e=document.getElementById(id); if(e) e.textContent=value ?? ''; };

async function loadBase(){
    const f={site:'data/site.json',clinic:'data/clinic.json',doctor:'data/doctor.json',services:'data/services.json',reviews:'data/reviews.json',appointment:'data/appointment.json',contact:'data/contact.json',social:'data/social.json',images:'data/images.json',consultation:'data/consultation.json',video:'data/video.json',seo:'data/seo.json',legal:'data/legal.json',onlineConsultancy:'data/online_consultancy.json'};
    BASE={};
    const optional=new Set(['video','seo','legal','onlineConsultancy']);
    for(const [k,p] of Object.entries(f)){
        try{ BASE[k]=await loadJSON(p); }
        catch(error){
            if(optional.has(k)) BASE[k]={};
            else throw error;
        }
    }
}

async function loadLanguage(lang){
    const safeLang = lang || BASE.site.site.default_language || 'en';
    let locale;
    try { locale=await loadJSON(`data/languages/${safeLang}.json`); }
    catch(e){ locale=await loadJSON(`data/languages/${BASE.site.site.default_language || 'en'}.json`); }
    D={...deepMerge(BASE, locale), lang: locale, language: safeLang};
    localStorage.setItem('clinic_language', safeLang);
}

function applyTranslations(){
    const ui=D.lang?.ui || D.lang || {};
    document.documentElement.lang=D.language || 'en';
    document.querySelectorAll('[data-i18n]').forEach(el=>{
        let value=getPath(ui, el.dataset.i18n);
        if(value !== undefined) {
            value=String(value).replaceAll('{clinic}', D.clinic?.clinic?.name || '').replaceAll('{doctor}', D.doctor?.doctor?.name || '');
            el.textContent=value;
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        let value=getPath(ui, el.dataset.i18nPlaceholder);
        if(value !== undefined) { value=String(value).replaceAll('{clinic}', D.clinic?.clinic?.name || '').replaceAll('{doctor}', D.doctor?.doctor?.name || ''); el.placeholder=value; }
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>{
        const value=getPath(ui, el.dataset.i18nAriaLabel);
        if(value !== undefined) el.setAttribute('aria-label', value);
    });
    const title=getPath(ui,'meta.title');
    if(title) document.title=title.replace('{doctor}',D.doctor.doctor.name).replace('{clinic}',D.clinic.clinic.name);

    const desktop=document.getElementById('languageSelector');
    const mobile=document.getElementById('languageSelectorMobile');
    if(desktop) desktop.value=D.language;
    if(mobile) mobile.value=D.language;
}


function setMeta(id, attr, value){
    const el=document.getElementById(id);
    if(el && value) el.setAttribute(attr,value);
}

function applySEO(){
    const seo=D.seo?.seo || {};
    const c=D.clinic?.clinic || {}, d=D.doctor?.doctor || {};
    const replace=(v)=>String(v||'').replaceAll('{clinic}',c.name||'').replaceAll('{doctor}',d.name||'');
    const title=replace(seo.title || `${d.name || ''} | ${c.name || ''}`);
    document.title=title;
    const description=replace(seo.description || c.description || '');
    setMeta('metaDescription','content',description);
    setMeta('metaKeywords','content',Array.isArray(seo.keywords)?seo.keywords.join(', '):seo.keywords||'');
    setMeta('metaRobots','content',seo.robots||'index,follow');
    if(seo.canonical) setMeta('canonicalLink','href',replace(seo.canonical));
    setMeta('ogTitle','content',replace(seo.og_title||title));
    setMeta('ogDescription','content',replace(seo.og_description||description));
    setMeta('ogImage','content',seo.og_image||D.images?.images?.logo||'');
    const schema=seo.structured_data;
    let script=document.getElementById('clinicStructuredData');
    if(schema){
        if(!script){script=document.createElement('script');script.id='clinicStructuredData';script.type='application/ld+json';document.head.appendChild(script);}
        script.textContent=JSON.stringify(schema).replaceAll('{clinic}',c.name||'').replaceAll('{doctor}',d.name||'');
    }
}

function youtubeEmbed(url){
    try{
        const u=new URL(url);
        let id=u.searchParams.get('v');
        if(!id && u.hostname.includes('youtu.be')) id=u.pathname.slice(1).split('/')[0];
        if(!id && u.pathname.includes('/shorts/')) id=u.pathname.split('/shorts/')[1].split('/')[0];
        return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : '';
    }catch{return '';}
}

function renderVideos(){
    const cfg=D.video?.video || D.video || {};
    const section=document.getElementById('doctorVideos');
    const track=document.getElementById('doctorVideosTrack');
    if(!section || !track) return;
    const enabled=cfg.video_website === true;
    const nav=document.getElementById('navVideosLink');
    const navMobile=document.getElementById('navVideosMobileLink');
    if(!enabled || !Array.isArray(cfg.videos) || !cfg.videos.length){section.classList.add('hidden'); nav?.classList.add('hidden'); navMobile?.classList.add('hidden'); return;}
    section.classList.remove('hidden'); nav?.classList.remove('hidden'); navMobile?.classList.remove('hidden');
    const d=D.doctor.doctor;
    set('doctorVideosDoctorName',d.name);
    const heading=String(cfg.heading||"Message from Dr. {doctor} to Patients").replaceAll('{doctor}',d.name||'');
    set('doctorVideosHeading',heading);
    set('doctorVideosDescription',cfg.description||'Short educational messages from your doctor for patients and families.');
    track.innerHTML=cfg.videos.map((v,idx)=>{
        const image=v.thumbnail || '';
        return `<article class="video-card card-hover bg-theme-card border border-theme rounded-2xl p-3">
            <button type="button" class="video-open-btn w-full text-left" data-video-index="${idx}" aria-label="Play ${escapeHtml(v.title||'doctor video')}">
                <div class="video-thumb"><img src="${escapeHtml(image)}" alt="${escapeHtml(v.thumbnail_alt||v.title||'Doctor video')}" loading="lazy" width="640" height="360"><span class="video-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span></div>
            </button>
            <div class="p-3 pb-2">
                <span class="inline-flex px-2.5 py-1 rounded-full bg-theme-badge text-theme-badge text-[11px] font-bold uppercase tracking-wide">${escapeHtml(v.category||'Health Education')}</span>
                <h3 class="mt-3 text-lg font-extrabold text-theme-heading">${escapeHtml(v.title||'Doctor Video')}</h3>
                <p class="mt-2 text-sm text-theme-muted leading-relaxed">${escapeHtml(v.description||'')}</p>
            </div>
        </article>`;
    }).join('');
    track.querySelectorAll('.video-open-btn').forEach(btn=>btn.addEventListener('click',()=>{
        const v=cfg.videos[Number(btn.dataset.videoIndex)];
        const embed=youtubeEmbed(v?.youtube_url||v?.url||'');
        if(!embed) return;
        set('videoModalTitle',v.title||'Doctor Video');
        set('videoModalDescription',v.description||'');
        const frame=document.getElementById('videoModalFrame'); if(frame) frame.src=embed;
        document.getElementById('videoModal')?.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }));
}

function renderOnlineConsultancy(){
    const cfg=D.onlineConsultancy?.online_consultancy || D.onlineConsultancy || {};
    const section=document.getElementById('onlineConsultancy');
    if(!section) return;
    if(cfg.enabled !== true || !cfg.google_form_url){section.classList.add('hidden');return;}
    section.classList.remove('hidden');
    set('onlineConsultancyTitle',cfg.title||'Book Online Consultancy');
    set('onlineConsultancyDescription',cfg.description||'Submit your request through our online consultation form.');
    set('onlineConsultancyButtonText',cfg.button_text||'Open Online Consultation Form');
    const btn=document.getElementById('onlineConsultancyButton'); if(btn) btn.href=cfg.google_form_url;
}

function renderLegal(){
    const legal=D.legal?.legal || D.legal || {};
    const render=(items)=>Array.isArray(items)?items.map(x=>`<section><h4>${escapeHtml(x.title||'')}</h4><p>${escapeHtml(x.content||'')}</p></section>`).join(''):'';
    set('privacyModalTitle',legal.privacy?.title||'Privacy Policy'); set('privacyEffectiveDate',legal.privacy?.effective_date?`Effective Date: ${legal.privacy.effective_date}`:'');
    set('termsModalTitle',legal.terms?.title||'Terms & Conditions'); set('termsEffectiveDate',legal.terms?.effective_date?`Effective Date: ${legal.terms.effective_date}`:'');
    const p=document.getElementById('privacyContent'); if(p)p.innerHTML=render(legal.privacy?.sections);
    const t=document.getElementById('termsContent'); if(t)t.innerHTML=render(legal.terms?.sections);
}

function render(){
    const c=D.clinic.clinic,d=D.doctor.doctor,i=D.images.images;
    document.getElementById('pageTitle').textContent=`${d.name} | ${c.name}`;
    set('navClinicName',c.name); set('navDoctorTitle',d.name);
    set('heroHeading',c.hero_heading); set('heroDescription',c.hero_description);
    set('heroDoctorQual',d.qualification); set('heroDoctorSpec',d.specialization); set('heroCtaText',c.cta_text);
    ['heroDoctorImg','aboutDoctorImg','consultationDoctorImg'].forEach((id,j)=>{const e=document.getElementById(id);if(e)e.src=[i.doctor.hero,i.doctor.about,i.doctor.consultation][j];});
    const m=document.getElementById('modalDoctorImg');if(m)m.src=i.doctor.about;
    set('aboutDoctorName',d.name); set('aboutDoctorQual',d.qualification); set('aboutDoctorDesig',d.designation); set('aboutDoctorBio',d.biography);
    set('doctorModalTitle',d.name);set('modalDoctorQual',d.qualification);set('modalDoctorDesig',d.designation);set('modalDoctorBio',d.biography);
    const hl=document.getElementById('aboutHighlightsList'); if(hl)hl.innerHTML=d.highlights.map(x=>`<div class="flex items-center gap-2 text-xs font-semibold text-theme-body"><i class="fa-solid fa-circle-check text-theme-primary"></i><span>${escapeHtml(x)}</span></div>`).join('');
    const sp=document.getElementById('modalDoctorSpecsList');if(sp)sp.innerHTML=d.specialties.map(x=>`<span class="px-3 py-1 rounded-full bg-theme-badge text-theme-badge text-xs font-semibold">${escapeHtml(x)}</span>`).join('');
    const mh=document.getElementById('modalDoctorHighlightsList');if(mh)mh.innerHTML=d.highlights.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
    const sg=document.getElementById('servicesGrid');if(sg)sg.innerHTML=D.services.services.map(s=>`<div class="card-hover p-8 rounded-2xl bg-theme-card border border-theme"><div class="w-12 h-12 rounded-xl bg-theme-badge text-theme-primary flex items-center justify-center text-xl"><i class="fa-solid ${escapeHtml(s.icon)}"></i></div><h3 class="mt-4 text-xl font-bold text-theme-heading">${escapeHtml(s.name)}</h3><p class="mt-2 text-sm text-theme-muted leading-relaxed">${escapeHtml(s.description)}</p></div>`).join('');
    const rg=document.getElementById('reviewsGrid');
    if(rg){
        const showPatientImages = D.site?.site?.patient_image === true;
        const reviewAlt = getPath(D.lang?.ui || D.lang,'reviews.patient_photo_alt') || 'Patient testimonial photo';
        rg.innerHTML = D.reviews.reviews.map(r=>{
            const imageHtml = showPatientImages && r.image
                ? `<div class="review-patient-photo-wrap"><img src="${escapeHtml(r.image)}" alt="${escapeHtml(reviewAlt)}" class="review-patient-photo" loading="lazy" width="64" height="64"></div>`
                : '';
            const rating = Math.max(0, Math.min(5, Number(r.rating) || 0));
            const stars = '<i class="fa-solid fa-star"></i>'.repeat(rating);
            return `<article class="card-hover p-6 rounded-2xl bg-theme-card border border-theme">
                <div class="flex items-center gap-3">
                    ${imageHtml}
                    <div class="min-w-0">
                        <div class="text-amber-400" aria-label="${rating} out of 5 stars">${stars}</div>
                        <div class="mt-1 text-xs text-theme-muted">${escapeHtml(r.category || '')}</div>
                    </div>
                </div>
                <p class="mt-4 text-sm text-theme-body italic leading-relaxed">"${escapeHtml(r.review)}"</p>
                <div class="mt-4 pt-4 border-t border-theme">
                    <b class="text-theme-heading">${escapeHtml(r.name)}</b>
                </div>
            </article>`;
        }).join('');
    }
    const placeholder=getPath(D.lang?.ui || D.lang,'appointment.select_category') || 'Select category';
    const options=`<option value="" disabled selected>${escapeHtml(placeholder)}</option>`+D.appointment.categories.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
    const rs=document.getElementById('appointmentReason');if(rs)rs.innerHTML=options;
    const mrs=document.getElementById('modalAppointmentReason');if(mrs)mrs.innerHTML=options;
    const co=D.contact.contact;set('contactPhoneLink',co.phone);set('contactWhatsappLink','+'+co.whatsapp);set('contactEmailLink',co.email);set('contactAddressText',co.address);
    if(co.phone){const phone=co.phone.replace(/\s+/g,'');document.getElementById('contactPhoneLink')?.setAttribute('href','tel:'+phone);document.getElementById('heroCallBtn')?.setAttribute('href','tel:'+phone);document.getElementById('floatCallBtn')?.setAttribute('href','tel:'+phone);document.getElementById('appointmentCallBtn')?.setAttribute('data-phone',phone);}
    if(co.whatsapp)document.getElementById('floatWhatsappBtn')?.setAttribute('href','https://wa.me/'+co.whatsapp);if(co.email)document.getElementById('contactEmailLink')?.setAttribute('href','mailto:'+co.email);if(co.maps_url)document.getElementById('contactDirectionsBtn')?.setAttribute('href',co.maps_url);
    set('heroTrustBadgeTitle', d.experience || '15+ Years Experience');
    set('heroTrustBadgeSub', getPath(D.lang?.ui || D.lang,'trust.patients') || 'Trusted by over 12,000+ patients and families');

    const hoursEl=document.getElementById('clinicHoursList');
    if(hoursEl){
        const hours=co.working_hours || [];
        hoursEl.innerHTML=hours.map(row=>{
            const closed=String(row.open || '').toLowerCase()==='closed';
            const time=closed ? 'Closed' : `${row.open || ''}${row.close ? ` – ${row.close}` : ''}`;
            return `<div class="contact-hours-row"><span class="contact-hours-day">${escapeHtml(row.day || '')}</span><span class="contact-hours-time ${closed?'contact-hours-closed':''}">${escapeHtml(time)}</span></div>`;
        }).join('');
    }

    const social=D.social?.social || {};
    const socialEl=document.getElementById('footerSocialContainer');
    if(socialEl){
        const socialItems=[['facebook','fa-brands fa-facebook-f','Facebook'],['instagram','fa-brands fa-instagram','Instagram'],['youtube','fa-brands fa-youtube','YouTube'],['linkedin','fa-brands fa-linkedin-in','LinkedIn'],['twitter','fa-brands fa-x-twitter','X']];
        socialEl.innerHTML=socialItems.filter(([key])=>social[key]).map(([key,icon,label])=>
            `<a class="footer-social-link" href="${escapeHtml(social[key])}" target="_blank" rel="noopener noreferrer" aria-label="${label}"><i class="${icon}"></i></a>`
        ).join('');
    }

    const footerHours=document.getElementById('footerWorkingHours');
    if(footerHours){
        footerHours.innerHTML=(co.hours || []).map(row =>
            `<div class="footer-hours-row"><span class="footer-hours-day">${escapeHtml(row.days || '')}</span><span class="footer-hours-time">${escapeHtml(row.time || '')}</span></div>`
        ).join('');
    }

    set('footerClinicName',c.name);set('footerDescription',c.footer_description);set('footerCopyrightName',c.name);
    applySEO();
    renderVideos();
    renderOnlineConsultancy();
    renderLegal();

    applyTranslations();
}

async function changeLanguage(lang){
    await loadLanguage(lang); render();
    window.dispatchEvent(new CustomEvent('clinic:language-changed',{detail:{language:D.language}}));
}

function initLanguage(){
    ['languageSelector','languageSelectorMobile'].forEach(id=>{
        const el=document.getElementById(id); if(!el) return;
        el.addEventListener('change',()=>changeLanguage(el.value));
    });
}

function initVideoModal(){
    const modal=document.getElementById('videoModal');
    const close=()=>{ if(!modal)return; modal.classList.add('hidden'); document.body.classList.remove('modal-open'); const frame=document.getElementById('videoModalFrame'); if(frame) frame.src=''; };
    document.getElementById('closeVideoModalBtn')?.addEventListener('click',close);
    document.getElementById('videoModalBackdrop')?.addEventListener('click',close);
}

(async()=>{
    try{
        await loadBase();
        await loadLanguage(localStorage.getItem('clinic_language') || BASE.site.site.default_language);
        await initTheme(BASE.site.site.default_theme);
        render();
        initModal();
        initNavigation();
        initLanguage();
        initVideoModal();
        initialized=true;
    }catch(e){console.error('Clinic initialization failed',e);}
})();
