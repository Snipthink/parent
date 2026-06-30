/**
 * app.js — works entirely from embedded JS data (window.JOBS_DATA / window.PORTAL_CONFIG),
 * so the whole site can be opened as plain static files (no server, no CORS issues).
 * The /data/*.csv files remain the canonical source — js/data/jobs-<country>.js, js/data/companies.js, js/data/testimonials.js, js/data/projects.js, js/data/categories.js
 * are generated from them.
 */

const PAGE_SIZE = 10;
const wizardState = { category: '', country: '', salaryBand: '', experience: '', page: 1 };

/** Maps a country name (as it appears in job/company data) to its flag SVG + a
 *  guaranteed-to-render emoji flag used whenever the SVG file isn't present. */
const COUNTRY_FLAGS = {
  India: 'assets/flags/india.svg',
  USA: 'assets/flags/usa.svg',
  Germany: 'assets/flags/germany.svg',
  Canada: 'assets/flags/canada.svg',
  Australia: 'assets/flags/australia.svg'
};
const COUNTRY_FLAG_EMOJI = {
  India: '🇮🇳', USA: '🇺🇸', Germany: '🇩🇪', Canada: '🇨🇦', Australia: '🇦🇺'
};
function flagFor(countryName) { return COUNTRY_FLAGS[countryName] || null; }

/** Top-level category → emoji, used as the graphic icon whenever the synced
 *  category SVG (from js/data/categories.js) isn't available. */
const CATEGORY_EMOJI = {
  'Skilled Trade': '🛠️', 'Healthcare': '🏥', 'IT': '💻',
  'Manufacturing': '🏭', 'Construction': '🏗️', 'Logistics': '📦'
};
/** Sub-category → emoji, for the Post a Job dialog's per-subcategory icons. */
const SUBCAT_EMOJI = {
  'electrical': '⚡', 'plumbing': '🔧', 'welding': '🔥', 'hvac': '❄️',
  'nursing': '🩺', 'elderly-care': '🧓', 'software-dev': '💻', 'data': '📊',
  'welding-mfg': '🔥', 'site-mgmt': '🏗️', 'warehouse': '📦'
};
/** Top-level category id → icon SVG, used for the Post a Job dialog's Step 1
 *  (category) cards. Falls back to CATEGORY_EMOJI (by name) if a given id
 *  isn't listed here, so a newly-added category never shows a blank icon. */
const CATEGORY_ICON_BY_ID = {
  'skilled-trade': 'assets/icons/category-skilled-trade.svg',
  'healthcare': 'assets/icons/category-healthcare.svg',
  'it': 'assets/icons/category-it.svg',
  'manufacturing': 'assets/icons/category-manufacturing.svg',
  'construction': 'assets/icons/category-construction.svg',
  'logistics': 'assets/icons/category-logistics.svg'
};

/** Builds an <img> that quietly swaps itself for a real, always-visible emoji
 *  graphic if the source file 404s — so a missing assets/ folder never shows
 *  a broken-image glyph. Pass emoji='' to just hide a failed image instead. */
function iconHTML(path, emoji, cls, alt) {
  if (!path) return emoji ? `<span class="${cls} emoji-icon" role="img" aria-label="${alt || ''}">${emoji}</span>` : '';
  return `<img src="${path}" class="${cls}" alt="${alt || ''}" onerror="window.handleIconError(this,'${emoji || ''}','${cls}','${(alt || '').replace(/'/g, '')}')">`;
}
window.handleIconError = function handleIconError(imgEl, emoji, cls, alt) {
  if (!emoji) { imgEl.style.display = 'none'; return; }
  const span = document.createElement('span');
  span.className = cls + ' emoji-icon';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', alt || '');
  span.textContent = emoji;
  imgEl.replaceWith(span);
};

function todayISO() { return new Date().toISOString().slice(0, 10); }
function isActiveJob(job) {
  return job.status === 'active' && (!job.expiry_date || todayISO() <= job.expiry_date);
}

/** Picks the right language array for a country based on browser language. */
function jobsForCountry(countryKey) {
  const cfg = window.PORTAL_CONFIG.countries[countryKey];
  const langData = window.JOBS_DATA[countryKey] || {};
  const lang = window.PortalLang.resolveLanguage(countryKey);
  const rows = langData[lang] || langData[cfg.default] || Object.values(langData)[0] || [];
  return rows.map(r => ({ ...r, _countryKey: countryKey, _lang: lang }));
}

function allActiveJobs() {
  return Object.keys(window.PORTAL_CONFIG.countries)
    .flatMap(jobsForCountry)
    .filter(isActiveJob);
}

function formatSalary(job) {
  if (!job.salary_min) return 'Not disclosed';
  return `${job.salary_currency} ${Number(job.salary_min).toLocaleString()} – ${Number(job.salary_max).toLocaleString()} / ${job.salary_period}`;
}

function salaryBandMatch(job, band) {
  if (!band) return true;
  const min = Number(job.salary_min) || 0;
  if (band === 'low') return min < 30000;
  if (band === 'mid') return min >= 30000 && min < 55000;
  if (band === 'high') return min >= 55000;
  return true;
}

/** Buckets a job's required experience into fresher / medium / experienced,
 *  driven by window.PORTAL_CONFIG.experienceBands so it's edited in one place. */
function experienceBandOf(years) {
  const y = Number(years) || 0;
  const bands = window.PORTAL_CONFIG.experienceBands;
  for (const key of Object.keys(bands)) {
    const b = bands[key];
    const minOk = b.min === undefined || y >= b.min;
    const maxOk = b.max === undefined || y <= b.max;
    if (minOk && maxOk) return key;
  }
  return '';
}
function experienceBandMatch(job, band) {
  if (!band) return true;
  return experienceBandOf(job.experience_required_years) === band;
}

/* ---------------- Theme toggle + mobile nav (shared across pages) ---------------- */
function initChrome() {
  const saved = localStorage.getItem('kg-theme');
  if (saved) document.body.setAttribute('data-theme', saved);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', cur);
      localStorage.setItem('kg-theme', cur);
    });
  });
  document.querySelectorAll('.kg-toggler').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('kgNavLinks')?.classList.toggle('open');
    });
  });
  renderFooter();
}

/* ---------------- Shared footer (brand, nav columns, Stay in Touch) ---------------- */
function renderFooter() {
  const mount = document.getElementById('kgFooter');
  if (!mount) return;
  const info = window.PORTAL_CONFIG.siteInfo;
  const year = new Date().getFullYear();
  mount.innerHTML = `
    <div class="container kg-footer-grid">
      <div class="kg-footer-col kg-footer-brand">
        <a href="index.html" class="kg-brand"><span class="mark">K</span>${info.legalName.split(' ')[0]}</a>
        <p class="muted" style="margin:10px 0 14px; font-size:13px;">${info.tagline}</p>
        <div class="kg-footer-social">
          <a href="${info.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
          <a href="${info.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">f</a>
          <a href="${info.social.twitter}" target="_blank" rel="noopener" aria-label="Twitter">x</a>
          <a href="${info.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">ig</a>
        </div>
      </div>
      <div class="kg-footer-col">
        <h6>For Job Seekers</h6>
        <a href="job-search.html">Find Jobs</a>
        <a href="how-to-apply.html">Applicant Guide</a>
        <a href="index.html#find-jobs">Browse by Category</a>
      </div>
      <div class="kg-footer-col">
        <h6>For Employers</h6>
        <a href="index.html#post-job">Post a Job</a>
        <a href="index.html#how-it-works">How it Works</a>
      </div>
      <div class="kg-footer-col">
        <h6>Legal</h6>
        <a href="terms.html">Terms &amp; Conditions</a>
        <a href="privacy.html">Privacy Policy</a>
      </div>
      <div class="kg-footer-col">
        <h6>Get in Touch</h6>
        <p class="muted" style="font-size:13px; margin-bottom:12px;">Questions, feedback, or partnership ideas — message us directly.</p>
        <button class="btn btn-outline" id="stayInTouchBtn" type="button" style="font-size:13px; padding:9px 16px;">Stay in Touch</button>
      </div>
    </div>
    <div class="container kg-footer-bottom">
      <span>© ${year} ${info.legalName}. All rights reserved.</span>
      <span class="muted">A ${info.parentCompany} company</span>
    </div>`;
  initStayInTouchModal();
}

/* ---------------- Stay in Touch dialog (footer) ----------------
 * Replaces publishing a phone/email/address: visitors send a message
 * straight into our Instagram DMs instead. Rendered on every page since
 * the footer button is shared via renderFooter(). */
function initStayInTouchModal() {
  const openBtn = document.getElementById('stayInTouchBtn');
  const modal = document.getElementById('stayInTouchModal');
  const closeBtn = document.getElementById('sitClose');
  if (!openBtn || !modal || openBtn.dataset.bound) return;
  openBtn.dataset.bound = 'true';
  const igHandle = window.PORTAL_CONFIG.siteInfo.instagramHandle;

  openBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });

  document.getElementById('sitSubmit')?.addEventListener('click', () => {
    const name = (document.getElementById('sitName')?.value || '').trim();
    const message = (document.getElementById('sitMessage')?.value || '').trim();
    const text = [name ? `Hi, I'm ${name}.` : '', message].filter(Boolean).join(' ');
    // Instagram's DM deep link doesn't support pre-filled text via URL, so we
    // copy the message to the clipboard and open the DM thread directly.
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(`https://ig.me/m/${igHandle}`, '_blank', 'noopener');
    modal.classList.remove('open');
  });
}

/* ---------------- Job card + grid rendering ---------------- */
function jobCardHTML(job) {
  const badges = [
    job.featured_job === 'yes' ? '<span class="badge badge-featured">Featured</span>' : '',
    job.urgent_hiring === 'yes' ? '<span class="badge badge-urgent">Urgent</span>' : '',
    job.visa_sponsored === 'yes' ? '<span class="badge badge-visa">Visa Sponsored</span>' : '',
    job.assessment_required === 'yes' ? '<span class="badge badge-assess">Assessment Needed</span>' : ''
  ].join('');
  const flag = flagFor(job.country);
  const flagHTML = iconHTML(flag, COUNTRY_FLAG_EMOJI[job.country], 'flag-icon', `${job.country} flag`);
  const catIcon = iconForCategoryName(job.category);
  const catIconHTML = iconHTML(catIcon, CATEGORY_EMOJI[job.category], 'cat-icon-sm', job.category);
  return `
    <div class="col-md-6 col-lg-4">
      <div class="job-card">
        <div class="job-card-top">
          <div class="job-card-badges">${badges}</div>
          ${flagHTML}
        </div>
        <h5>${job.job_title}</h5>
        <div class="muted">${job.company_name} — ${job.city}, ${job.country}</div>
        <ul>
          <li><span class="li-icon">💰</span><strong>Salary:</strong> ${formatSalary(job)}</li>
          <li><span class="li-icon">${catIconHTML}</span><strong>Category:</strong> ${job.category}</li>
          <li><span class="li-icon">⏳</span><strong>Experience:</strong> ${job.experience_required_years || 0}+ yrs</li>
          <li><span class="li-icon">👥</span><strong>Vacancies:</strong> ${job.vacancies || '—'}</li>
        </ul>
        <div class="job-card-actions" style="margin-top:auto">
          <a class="btn btn-ghost" href="job-detail.html?id=${encodeURIComponent(job.job_id)}&country=${job._countryKey}">Know More</a>
          <a class="btn btn-primary" href="${job.apply_url}" target="_blank" rel="noopener">Apply Now</a>
        </div>
      </div>
    </div>`;
}

function renderPagination(totalItems, onPageChange) {
  const bar = document.getElementById('pagination');
  if (!bar) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (wizardState.page > totalPages) wizardState.page = totalPages;
  let html = `<button class="page-btn" ${wizardState.page === 1 ? 'disabled' : ''} data-page="${wizardState.page - 1}">‹</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn ${p === wizardState.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="page-btn" ${wizardState.page === totalPages ? 'disabled' : ''} data-page="${wizardState.page + 1}">›</button>`;
  bar.innerHTML = html;
  bar.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => {
    const p = Number(b.dataset.page);
    if (p >= 1 && p <= totalPages) {
      wizardState.page = p;
      onPageChange();
      document.getElementById('resultsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }));
}

function filteredJobs() {
  return allActiveJobs().filter(job =>
    (!wizardState.category || job.category === wizardState.category) &&
    (!wizardState.country || job._countryKey === wizardState.country) &&
    (!wizardState.experience || experienceBandMatch(job, wizardState.experience)) &&
    salaryBandMatch(job, wizardState.salaryBand)
  );
}

function renderResults() {
  const grid = document.getElementById('resultsGrid');
  const countEl = document.getElementById('resultCount');
  if (!grid) return;

  const filtered = filteredJobs();

  if (countEl) countEl.textContent = `${filtered.length} active job${filtered.length === 1 ? '' : 's'} found · showing ${PAGE_SIZE} per page`;

  const start = (wizardState.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageItems.length
    ? pageItems.map(jobCardHTML).join('')
    : `<div class="col-12"><p class="text-muted" style="text-align:center; padding:40px 0;">No active jobs match your filters yet — try widening your search.</p></div>`;

  renderPagination(filtered.length, renderResults);
}

/* ---------------- Category icon sync (data/categories/categories.csv → js/data/categories.js) ---------------- */
function iconForCategoryName(categoryName) {
  const row = (window.CATEGORIES_DATA || []).find(c => c.category_name === categoryName);
  return row ? row.icon : null;
}

function uniqueJobCategories() {
  return [...new Set(allActiveJobs().map(j => j.category))].sort();
}

/* =====================================================================
   HOME PAGE — Dashboard (Available Jobs / Countries Hiring / Total Hired)
   + Apply Now filter dialog → redirects into job-search.html
   ===================================================================== */
function renderDashboard() {
  const grid = document.getElementById('dashboardStats');
  if (!grid) return;
  const jobs = allActiveJobs();
  const countries = Object.keys(window.PORTAL_CONFIG.countries).length;
  const totalHired = (window.PROJECTS_DATA || []).reduce((sum, p) => sum + (Number(p.total_hires) || 0), 0);

  const stat = (value, label, icon) => `
    <div class="col-md-4">
      <div class="stat-card">
        <div class="stat-icon">${icon}</div>
        <div class="stat-value">${value.toLocaleString()}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>`;

  grid.innerHTML =
    stat(jobs.length, 'Available Jobs', '💼') +
    stat(countries, 'Countries Hiring', '🌍') +
    stat(totalHired, 'Candidates Hired', '🤝');
}

function initApplyModal() {
  const openBtn = document.getElementById('applyNowBtn');
  const modal = document.getElementById('applyModal');
  const closeBtn = document.getElementById('amClose');
  if (!openBtn || !modal) return;

  const catSel = document.getElementById('amCategory');
  const countrySel = document.getElementById('amCountry');
  const expSel = document.getElementById('amExperience');

  // Populate category options from live job data, country options from config.
  catSel.innerHTML = `<option value="">Any Category</option>` +
    uniqueJobCategories().map(c => `<option value="${c}">${c}</option>`).join('');
  countrySel.innerHTML = `<option value="">Any Country</option>` +
    Object.entries(window.PORTAL_CONFIG.countries).map(([key, cfg]) => `<option value="${key}">${cfg.label}</option>`).join('');
  expSel.innerHTML = `<option value="">Any Experience</option>` +
    Object.entries(window.PORTAL_CONFIG.experienceBands).map(([key, b]) => `<option value="${key}">${b.label}</option>`).join('');

  openBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });

  document.getElementById('amSubmit')?.addEventListener('click', () => {
    const params = new URLSearchParams();
    if (catSel.value) params.set('category', catSel.value);
    if (countrySel.value) params.set('country', countrySel.value);
    if (expSel.value) params.set('experience', expSel.value);
    window.location.href = `job-search.html${params.toString() ? '?' + params.toString() : ''}`;
  });
}

/* ---------------- Post a Job dialog ----------------
 * Entirely driven by window.CATEGORIES_DATA (js/data/categories.js, generated
 * from data/categories/categories.csv). Each row = one sub-category with its
 * own synced icon, dedicated Google Form link, language, serial number and
 * last-updated date. Step colors: 1=blue (category) → 2=gray (sub-category)
 * → 3=white (confirm + apply link). Editing the CSV + re-running
 * gen_categories.py is the only thing needed to add/change a category.
 */
function initPostJobModal() {
  const openBtns = [document.getElementById('postJobBtn'), document.getElementById('postNowBtn')].filter(Boolean);
  const modal = document.getElementById('postJobModal');
  const closeBtn = document.getElementById('pjClose');
  if (!openBtns.length || !modal) return;

  const state = { step: 1, categoryId: '', sub: null };

  function topCategories() {
    const seen = new Map();
    (window.CATEGORIES_DATA || []).forEach(c => {
      if (!seen.has(c.category_id)) seen.set(c.category_id, c.category_name);
    });
    return [...seen.entries()]; // [ [category_id, category_name], ... ]
  }
  function subsFor(categoryId) {
    return (window.CATEGORIES_DATA || []).filter(c => c.category_id === categoryId);
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const clockIcon = `<svg class="pj-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`;

  function renderSteps() {
    const bar = modal.querySelector('.pj-steps');
    const labels = { 1: 'Category', 2: 'Sub-category', 3: 'Apply' };
    bar.innerHTML = [1, 2, 3].map(n => {
      const cls = n < state.step ? 'done' : (n === state.step ? 'active' : 'pending');
      return `<div class="pj-step ${cls}">${n} · ${labels[n]}</div>`;
    }).join('');
  }

  function renderBody() {
    const body = modal.querySelector('.pj-body');

    if (state.step === 1) {
      body.innerHTML = `<div class="pj-grid">${
        topCategories().map(([id, name]) =>
          `<div class="pj-card pj-blue" data-cat="${id}">
             ${iconHTML(CATEGORY_ICON_BY_ID[id], CATEGORY_EMOJI[name], 'pj-icon', name)}
             <span>${name}</span>
           </div>`).join('')
      }</div>`;
      body.querySelectorAll('[data-cat]').forEach(el => el.addEventListener('click', () => {
        state.categoryId = el.dataset.cat;
        state.step = 2;
        render();
      }));

    } else if (state.step === 2) {
      const subs = subsFor(state.categoryId);
      body.innerHTML = `
        <button class="pj-back">← Back to categories</button>
        <div class="pj-grid">${
          subs.map(s => `
            <div class="pj-card pj-gray" data-sub="${s.sub_category_id}">
              ${iconHTML(s.icon, SUBCAT_EMOJI[s.sub_category_id], 'pj-icon', s.sub_category_name)}
              <span>${s.sub_category_name}</span>
            </div>`).join('')
        }</div>`;
      body.querySelector('.pj-back').addEventListener('click', () => { state.step = 1; render(); });
      body.querySelectorAll('[data-sub]').forEach(el => el.addEventListener('click', () => {
        state.sub = subs.find(s => s.sub_category_id === el.dataset.sub);
        state.step = 3;
        render();
      }));

    } else if (state.step === 3) {
      const s = state.sub;
      body.innerHTML = `
        <button class="pj-back">← Back to sub-categories</button>
        <div class="pj-card pj-white pj-final">
          ${iconHTML(s.icon, SUBCAT_EMOJI[s.sub_category_id], 'pj-icon-lg', s.sub_category_name)}
          <h4>${s.sub_category_name}</h4>
          <p class="pj-meta">${s.category_name} · Serial #${s.serial_no} · Language: ${s.language.toUpperCase()}</p>
          <div class="pj-updated">${clockIcon} Last updated: ${formatDate(s.last_updated)}</div>
          <a class="btn btn-primary" href="${s.google_form_link}" target="_blank" rel="noopener">Open Google Form &amp; Post Job →</a>
        </div>`;
      body.querySelector('.pj-back').addEventListener('click', () => { state.step = 2; render(); });
    }
  }

  function render() { renderSteps(); renderBody(); }

  openBtns.forEach(openBtn => openBtn.addEventListener('click', () => {
    state.step = 1; state.categoryId = ''; state.sub = null;
    modal.classList.add('open');
    render();
  }));
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });
}


/** Builds a company logo <img> that falls back to an initials avatar if the
 *  logo file isn't present (same pattern as iconHTML, but for photo logos). */
function initialsOf(name) {
  return (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
function companyLogoHTML(company) {
  const initials = initialsOf(company.company_name);
  return `<img src="${company.logo}" class="partner-logo" alt="${company.company_name} logo" onerror="window.handleLogoError(this,'${initials}')">`;
}
window.handleLogoError = function handleLogoError(imgEl, initials) {
  const span = document.createElement('span');
  span.className = 'partner-logo partner-logo-fallback';
  span.textContent = initials;
  imgEl.replaceWith(span);
};

/** Hiring partners = companies from js/data/companies.js (companies.csv), each joined
 *  with the sum of open vacancies across their active listings in
 *  js/data/jobs-<country>.js (job-posts csvs). Only companies with at least one open
 *  vacancy are shown, ranked by vacancy count, capped at 11. */
function hiringPartners(max = 11) {
  const vacanciesByCompany = {};
  allActiveJobs().forEach(job => {
    vacanciesByCompany[job.company_id] = (vacanciesByCompany[job.company_id] || 0) + (Number(job.vacancies) || 0);
  });
  return (window.COMPANIES_DATA || [])
    .map(c => ({ ...c, totalVacancies: vacanciesByCompany[c.company_id] || 0 }))
    .filter(c => c.totalVacancies > 0)
    .sort((a, b) => b.totalVacancies - a.totalVacancies)
    .slice(0, max);
}

function renderHiringPartners() {
  const track = document.getElementById('partnersTrack');
  const section = track ? track.closest('.partners-section') : null;
  if (!track) return;

  const partners = hiringPartners(11);
  if (!partners.length) { if (section) section.style.display = 'none'; return; }

  const cardHTML = p => `
    <div class="partner-card">
      ${companyLogoHTML(p)}
      <div class="partner-name">${p.company_name}</div>
      <div class="partner-vacancies">${p.totalVacancies} open vacanc${p.totalVacancies === 1 ? 'y' : 'ies'}</div>
    </div>`;

  // Render the strip twice back-to-back so the CSS marquee can loop
  // seamlessly from -50% back to 0 without a visible jump.
  const single = partners.map(cardHTML).join('');
  track.innerHTML = single + single;
  track.classList.toggle('no-scroll', partners.length < 4);
}

function initHomePage() {
  initChrome();
  renderDashboard();
  renderHiringPartners();
  const testimonialsGrid = document.getElementById('testimonials');
  if (testimonialsGrid) {
    testimonialsGrid.innerHTML = (window.TESTIMONIALS_DATA || []).map(t => `
      <div class="col-md-4">
        <div class="job-card">
          <div style="color:var(--warn); margin-bottom:8px;">${'★'.repeat(Number(t.rating) || 0)}${'☆'.repeat(5 - (Number(t.rating) || 0))}</div>
          <p style="font-style:italic; font-size:13.5px; color:var(--text-dim);">"${t.experience}"</p>
          <h5 style="font-size:15px; margin:6px 0 2px;">${t.applicant_name}</h5>
          <p class="muted">${t.job_title} at ${t.company_name}, ${t.country}</p>
        </div>
      </div>`).join('');
  }
  initApplyModal();
  initPostJobModal();
}

/* =====================================================================
   JOB SEARCH PAGE — dedicated page, pre-filled from the Apply Now dialog's
   query params (?category=&country=&experience=), 10 jobs/page, with
   editable filters so users can keep refining the search right here.
   ===================================================================== */
function initJobSearchPage() {
  initChrome();

  const params = new URLSearchParams(window.location.search);
  wizardState.category = params.get('category') || '';
  wizardState.country = params.get('country') || '';
  wizardState.experience = params.get('experience') || '';
  wizardState.salaryBand = params.get('salary') || '';
  wizardState.page = 1;

  const catSel = document.getElementById('jsCategory');
  const countrySel = document.getElementById('jsCountry');
  const expSel = document.getElementById('jsExperience');
  const salarySel = document.getElementById('jsSalary');

  catSel.innerHTML = `<option value="">Any Category</option>` +
    uniqueJobCategories().map(c => `<option value="${c}" ${c === wizardState.category ? 'selected' : ''}>${c}</option>`).join('');
  countrySel.innerHTML = `<option value="">Any Country</option>` +
    Object.entries(window.PORTAL_CONFIG.countries).map(([key, cfg]) =>
      `<option value="${key}" ${key === wizardState.country ? 'selected' : ''}>${cfg.label}</option>`).join('');
  expSel.innerHTML = `<option value="">Any Experience</option>` +
    Object.entries(window.PORTAL_CONFIG.experienceBands).map(([key, b]) =>
      `<option value="${key}" ${key === wizardState.experience ? 'selected' : ''}>${b.label}</option>`).join('');
  salarySel.value = wizardState.salaryBand;

  function syncFromControls() {
    wizardState.category = catSel.value;
    wizardState.country = countrySel.value;
    wizardState.experience = expSel.value;
    wizardState.salaryBand = salarySel.value;
    wizardState.page = 1;
    updateURL();
    renderResults();
  }
  function updateURL() {
    const p = new URLSearchParams();
    if (wizardState.category) p.set('category', wizardState.category);
    if (wizardState.country) p.set('country', wizardState.country);
    if (wizardState.experience) p.set('experience', wizardState.experience);
    if (wizardState.salaryBand) p.set('salary', wizardState.salaryBand);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }

  [catSel, countrySel, expSel, salarySel].forEach(el => el.addEventListener('change', syncFromControls));
  document.getElementById('jsSearchBtn')?.addEventListener('click', syncFromControls);
  document.getElementById('jsResetBtn')?.addEventListener('click', () => {
    catSel.value = ''; countrySel.value = ''; expSel.value = ''; salarySel.value = '';
    syncFromControls();
  });

  renderResults();
}

/* ---------------- Job detail page ---------------- */
function initJobDetailPage() {
  initChrome();
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get('id');
  const countryKey = params.get('country');
  const container = document.getElementById('jobDetailContainer');
  if (!container) return;

  const rows = jobsForCountry(countryKey);
  const job = rows.find(j => j.job_id === jobId);

  if (!job || !isActiveJob(job)) {
    container.innerHTML = `<div class="kg-panel" style="padding:24px;"><p>This job posting is no longer available (it may have expired or been filled).</p><a class="btn btn-primary" href="job-search.html">← Back to Find Jobs</a></div>`;
    return;
  }

  const flag = flagFor(job.country);
  const flagHTML = iconHTML(flag, COUNTRY_FLAG_EMOJI[job.country], 'flag-icon-lg', `${job.country} flag`);
  const catIcon = iconForCategoryName(job.category);
  const catIconHTML = iconHTML(catIcon, CATEGORY_EMOJI[job.category], 'cat-icon-lg', job.category);
  const assessHTML = job.assessment_required === 'yes'
    ? `<span class="badge badge-assess" style="margin-left:8px;">Assessment Needed</span>` : '';

  container.innerHTML = `
    <div class="eyebrow">${catIconHTML}${job.category} · ${flagHTML}${job.country}${assessHTML}</div>
    <h1>${job.job_title}</h1>
    <p class="muted" style="margin-bottom:20px;">${job.company_name} — ${job.job_location}</p>
    <div class="kg-panel" style="padding:24px; margin-bottom:20px;">
      <p>${job.job_description}</p>
      <h4 style="margin-top:18px; font-size:16px;">Responsibilities</h4>
      <p class="muted">${job.responsibilities}</p>
      <h4 style="margin-top:18px; font-size:16px;">Requirements</h4>
      <ul class="muted">
        <li>Education: ${job.education_required}</li>
        <li>Experience: ${job.experience_required_years}+ years</li>
        <li>Skills: ${job.skills_required}</li>
        <li>Certification: ${job.industry_certification || 'None required'}</li>
      </ul>
      ${job.assessment_required === 'yes' ? `<h4 style="margin-top:18px; font-size:16px;">Assessment</h4><p class="muted">This role requires a short skills assessment (minimum score: ${job.minimum_assessment_score || '—'}%) before shortlisting.</p>` : ''}
      <h4 style="margin-top:18px; font-size:16px;">Compensation &amp; Benefits</h4>
      <p class="muted">${formatSalary(job)} · ${job.benefits}</p>
    </div>
    <div class="kg-panel" style="padding:24px; background:var(--grad-soft);">
      <h4 style="font-size:16px; margin-bottom:8px;">Ready to apply?</h4>
      <p class="muted" style="margin-bottom:16px;">Applying here opens this job's dedicated Google Form. Fill in your details (or upload your Future Track resume CSV where requested) and submit — the employer reviews submissions directly from there.</p>
      <a class="btn btn-primary" href="${job.apply_url}" target="_blank" rel="noopener">Open Google Form &amp; Apply →</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'home') initHomePage();
  if (document.body.dataset.page === 'job-search') initJobSearchPage();
  if (document.body.dataset.page === 'job-detail') initJobDetailPage();
  if (document.body.dataset.page === 'static') initChrome();
});
