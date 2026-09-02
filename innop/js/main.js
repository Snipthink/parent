/* ---------- Configuration ---------- */
const INNOP_CONFIG = {
  organizationName: "INNOP Global India",
  parentWebsite: "https://innopglobal.com/",
  headquarters: "Purnia, Bihar, India",
  whatsappNumber: "919959059985",
  googleFormUrl: "YOUR_GOOGLE_FORM_URL_HERE",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/innop/",
    instagram: "",
    facebook: "https://www.facebook.com/Innovative-Preneurship-InnoP-869392506772440/",
    youtube: "",
    x: "https://twitter.com/innopglobal"
  },
  whatsappCommunityUrl: "https://chat.whatsapp.com/HrxY8R4igpOBREiodn9BIZ"
};
const SOCIAL_LINKS = {
  linkedin: INNOP_CONFIG.socialLinks.linkedin,
  instagram: INNOP_CONFIG.socialLinks.instagram,
  facebook: INNOP_CONFIG.socialLinks.facebook,
  youtube: INNOP_CONFIG.socialLinks.youtube,
  x: INNOP_CONFIG.socialLinks.x,
  whatsapp: "https://wa.me/" + INNOP_CONFIG.whatsappNumber,
  whatsappCommunity: INNOP_CONFIG.whatsappCommunityUrl
};
const SOCIAL_ICONS = {
  facebook: '<rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="7" cy="8" r="1.4" fill="currentColor" stroke="none"/><line x1="7" y1="11" x2="7" y2="17"/><path d="M11 17v-6M11 11.5c0-1 1-1.7 2.2-1.7 1.6 0 2.8 1 2.8 3v4.2" fill="none"/>',
  x: '<rect x="2" y="2" width="20" height="20" rx="4"/><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/>',
  linkedin: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none"/><line x1="7.5" y1="10.5" x2="7.5" y2="17"/><path d="M11 17v-4c0-1.6 1.2-2.7 2.6-2.7 1.6 0 2.9 1.1 2.9 2.9v3.8" fill="none"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none"/>',
  whatsapp: '<path d="M4 20l1.4-4.2A8 8 0 1 1 9 19l-5 1z"/>',
  whatsappCommunity: '<path d="M4 20l1.4-4.2A8 8 0 1 1 9 19l-5 1z"/>'
};

/* ---------- Footer social icons (only verified links rendered) ---------- */
(function renderFooterSocial(){
  const wrap = document.getElementById('footerSocial');
  ['facebook','x','linkedin','instagram','youtube','whatsapp'].forEach(key => {
    const url = SOCIAL_LINKS[key];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<svg class="icon" viewBox="0 0 24 24">${SOCIAL_ICONS[key]}</svg>`;
    wrap.appendChild(a);
  });
})();

/* ---------- Reveal-on-scroll (also covers elements injected after initial load) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
function revealObserverLater(el){ revealObserver.observe(el); }

/* ---------- Services (rendered from data so each gets a consistent "Know More" modal) ---------- */
const SERVICES = [
  {title:'Mentorship', icon:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/>', desc:'Guidance from experienced founders, professionals and domain experts across the ecosystem.', modal:'One-on-one and group mentorship connecting you with experienced professionals who can guide your idea, product or business decisions. Availability depends on mentor capacity and program stage.'},
  {title:'Upskilling', icon:'<path d="M4 19.5V6a2 2 0 0 1 2-2h9l5 5v10.5"/><path d="M13 4v5h5"/>', desc:'Practical entrepreneurial, business and technical learning built for execution, not just theory.', modal:'Structured learning sessions and workshops covering entrepreneurship fundamentals, business skills and relevant technical capabilities.'},
  {title:'Technology', icon:'<polyline points="9,7 4,12 9,17"/><polyline points="15,7 20,12 15,17"/>', desc:'Access to technical guidance for building and scaling your product.', modal:'Guidance on technology choices, architecture and best practices to help you build and scale your product responsibly.'},
  {title:'UI/UX', icon:'<circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/><rect x="2" y="2" width="20" height="20" rx="5"/>', desc:'Design support to help your product look and feel ready for real users.', modal:'Support in shaping usable, accessible interfaces so your product is ready for real users and stakeholders.'},
  {title:'Product Development', icon:'<rect x="3" y="9" width="7" height="12"/><rect x="14" y="3" width="7" height="18"/>', desc:'Support in moving from concept to a working, testable product.', modal:'Guidance across the product-development journey — from concept to a working, testable version of your idea.'},
  {title:'Marketing', icon:'<path d="M4 15V9l14-5v18z"/><path d="M8 15v4a2 2 0 0 0 4 0v-3"/>', desc:'Positioning, branding and digital marketing guidance to reach your first customers.', modal:'Support with positioning, messaging and digital marketing approaches suited to reaching your first customers.'},
  {title:'Branding', icon:'<path d="M12 2 2 12l10 10 10-10z"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>', desc:'Help shaping how your venture is perceived by customers, partners and investors.', modal:'Guidance on shaping a consistent brand identity — name, story and visual language — for customers, partners and investors.'},
  {title:'Legal & Registration Guidance', icon:'<path d="M12 3v18M5 8l-3 6a3.2 3.2 0 0 0 6 0zM19 8l-3 6a3.2 3.2 0 0 0 6 0zM4 8h16M8 5l4-2 4 2"/>', desc:'General guidance on business setup and documentation.', modal:'General, non-binding guidance on business registration and documentation. This is not a substitute for advice from a qualified legal professional.'},
  {title:'Business Development', icon:'<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', desc:'Support in identifying partnerships, opportunities and growth paths for your venture.', modal:'Support in identifying relevant partnerships, opportunities and growth paths appropriate to your venture\'s stage.'},
  {title:'Sales', icon:'<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><line x1="8.7" y1="10.5" x2="15.3" y2="7.5"/><line x1="8.7" y1="13.5" x2="15.3" y2="16.5"/>', desc:'Guidance on sales strategy and customer acquisition execution.', modal:'Guidance on building a sales approach and executing customer acquisition, tailored to your product and market.'},
  {title:'Networking', icon:'<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><line x1="7.3" y1="11" x2="16.7" y2="7"/><line x1="7.3" y1="13" x2="16.7" y2="17"/>', desc:'Access to a growing network of founders, mentors, professionals and investors.', modal:'Access to a growing community of founders, mentors, professionals and investors across the INNOP Global India ecosystem.'},
  {title:'Global Connections', icon:'<circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/><line x1="3" y1="12" x2="21" y2="12"/>', desc:'Pathways to the wider INNOP Global network, subject to program fit.', modal:'Where relevant and subject to program fit, access to the wider INNOP Global network and its international connections.'}
];
(function renderServices(){
  const grid = document.getElementById('servicesGrid');
  SERVICES.forEach(s => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 reveal';
    col.innerHTML = `<div class="program-card h-100">
      <svg class="icon" viewBox="0 0 24 24">${s.icon}</svg>
      <h5 class="mt-2">${s.title}</h5>
      <p class="text-soft small">${s.desc}</p>
      <button type="button" class="btn-know-more mt-2" data-service-title="${s.title}" data-service-modal="${s.modal.replace(/"/g,'&quot;')}">Know More</button>
    </div>`;
    grid.appendChild(col);
    revealObserverLater(col);
  });
})();

/* ==========================================================================
   MOCK DATA — REPLACE BEFORE PRODUCTION
   None of the people below are real. Names are intentionally generic
   placeholders (not a real person's identity) so they can be swapped for
   verified India-team profiles without confusion. Every entry is flagged
   with mock:true and rendered with a visible "MOCK PROFILE" badge.
   ========================================================================== */
const MOCK_DATA = {
  team: [
    {role:'Director', name:'Director Name — Mock Profile', mock:true, bio:'Placeholder biography for development. Leadership profile for INNOP Global India will be published once confirmed.'},
    {role:'CTO', name:'CTO Name — Mock Profile', mock:true, bio:'Placeholder technology biography for development. Technology leadership profile for INNOP Global India will be published once confirmed.'},
    {role:'Mentor', name:'Mentor Name 1 — Mock Profile', mock:true, bio:'Placeholder mentor profile for development. Real mentor profiles will be added as they are onboarded.'},
    {role:'Mentor', name:'Mentor Name 2 — Mock Profile', mock:true, bio:'Placeholder mentor profile for development. Real mentor profiles will be added as they are onboarded.'},
    {role:'Mentor', name:'Mentor Name 3 — Mock Profile', mock:true, bio:'Placeholder mentor profile for development. Real mentor profiles will be added as they are onboarded.'},
    {role:'Mentor', name:'Mentor Name 4 — Mock Profile', mock:true, bio:'Placeholder mentor profile for development. Real mentor profiles will be added as they are onboarded.'},
    {role:'Advisor', name:'Advisor Name 1 — Mock Profile', mock:true, bio:'Placeholder advisor profile for development. Real advisor profiles will be added as they are confirmed.'},
    {role:'Advisor', name:'Advisor Name 2 — Mock Profile', mock:true, bio:'Placeholder advisor profile for development. Real advisor profiles will be added as they are confirmed.'}
  ]
};

/* ---------- Team (MOCK_DATA — see banner above; UI renders a visible MOCK PROFILE badge) ---------- */
const TEAM = MOCK_DATA.team;
(function renderTeam(){
  const grid = document.getElementById('teamGrid');
  TEAM.forEach(m => {
    const initials = m.role.slice(0,2).toUpperCase();
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-3 reveal';
    col.innerHTML = `<div class="leader-card">
      <div class="avatar-ring"><div class="avatar">${initials}</div></div>
      ${m.mock ? '<span class="mock-badge">MOCK PROFILE</span>' : ''}
      <h4>${m.name}</h4>
      <div class="leader-role">${m.role}</div>
      <p class="leader-bio">${m.bio}</p>
      <button type="button" class="btn-know-more mt-1" data-service-title="${m.name}" data-service-modal="${(m.bio + (m.mock ? ' [MOCK PROFILE — REPLACE BEFORE PRODUCTION]' : '')).replace(/"/g,'&quot;')}">Know More</button>
    </div>`;
    grid.appendChild(col);
    revealObserverLater(col);
  });
})();

/* ---------- Dynamic modal (services + team) ----------
   bootstrap.Modal is constructed lazily, on first click, rather than at script
   load time. If the Bootstrap CDN script is slow/blocked/offline, "bootstrap"
   may not be defined yet when this file runs — constructing eagerly here would
   throw and abort every script block below it (reveal-on-scroll included),
   making the rest of the page appear to have "missing" sections. */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-service-title]');
  if (!btn) return;
  if (typeof bootstrap === 'undefined') { console.warn('Bootstrap failed to load; "Know More" modal unavailable.'); return; }
  document.getElementById('dynamicModalTitle').textContent = btn.dataset.serviceTitle;
  document.getElementById('dynamicModalMeta').textContent = 'INNOP Global India';
  document.getElementById('dynamicModalBody').textContent = btn.dataset.serviceModal;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('dynamicModal')).show();
});

/* ---------- Counters ---------- */
document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400, start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor((1 - Math.pow(1-progress,3)) * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick); else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counterObserver.observe(el);
});

/* ---------- Flow step active-on-scroll cycling ---------- */
const flowSteps = document.querySelectorAll('#flowTrack .flow-step');
let flowIndex = 0;
if (flowSteps.length) {
  setInterval(() => {
    flowSteps.forEach(s => s.classList.remove('is-active'));
    flowSteps[flowIndex].classList.add('is-active');
    flowIndex = (flowIndex + 1) % flowSteps.length;
  }, 1400);
}

/* ---------- Theme toggle ---------- */
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.innerHTML = isDark
    ? '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="9.3" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="14.5" r="1.4" fill="currentColor" stroke="none"/></svg>'
    : '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><line x1="12" y1="1.5" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.5" y2="12"/><line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.6" y2="17.4"/><line x1="17.4" y1="6.6" x2="19.1" y2="4.9"/></svg>';
});

/* ---------- Applicant-type presets (Who Can Apply cards) jump straight to the form ---------- */
document.querySelectorAll('[data-apply-type]').forEach(el => {
  el.addEventListener('click', () => {
    presetApplicantType(el.dataset.applyType);
    document.getElementById('apply').scrollIntoView({ behavior:'smooth', block:'start' });
  });
});
document.querySelectorAll('.chooser-option').forEach(el => {
  el.addEventListener('click', () => {
    presetApplicantType(el.dataset.type);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('applyChooserModal')).hide();
    setTimeout(() => document.getElementById('apply').scrollIntoView({ behavior:'smooth', block:'start' }), 300);
  });
});
function presetApplicantType(type){
  document.getElementById('applicantType').value = type;
  document.querySelectorAll('.applicant-choice').forEach(c => c.classList.toggle('selected', c.dataset.type === type));
  document.querySelectorAll('.type-fields').forEach(f => f.classList.toggle('active', f.dataset.for === type));
  goToStep(1);
}

/* ---------- Multi-step application form ---------- */
const formSteps = document.querySelectorAll('#applyForm .form-step');
const stepDots = document.querySelectorAll('.step-progress .dot');
let currentStep = 1;
function goToStep(n){
  currentStep = n;
  formSteps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step,10) === n));
  stepDots.forEach(d => d.classList.toggle('done', parseInt(d.dataset.step,10) <= n));
}
document.querySelectorAll('.applicant-choice').forEach(choice => {
  choice.addEventListener('click', () => presetApplicantType(choice.dataset.type));
});
document.querySelectorAll('#applyForm .next-step').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentStep === 1 && !document.getElementById('applicantType').value) {
      alert('Please choose how you would like to participate.');
      return;
    }
    if (currentStep === 2) {
      const required = ['fName','fEmail','fPhone','fAddress','fCity','fState','fRole','fQualification'];
      for (const id of required) { if (!document.getElementById(id).value.trim()) { document.getElementById(id).reportValidity ? document.getElementById(id).reportValidity() : alert('Please complete all required fields.'); return; } }
    }
    if (currentStep === 4 && !document.getElementById('fVision').value.trim()) {
      document.getElementById('fVision').reportValidity();
      return;
    }
    goToStep(Math.min(currentStep + 1, formSteps.length));
  });
});
document.querySelectorAll('#applyForm .prev-step').forEach(btn => {
  btn.addEventListener('click', () => goToStep(Math.max(currentStep - 1, 1)));
});

/* ---------- Submission method segmented control ---------- */
const submitSegmented = document.getElementById('submitSegmented');
const whatsappBlock = document.getElementById('whatsappSubmitBlock');
const googleFormBlock = document.getElementById('googleFormSubmitBlock');
let submitMode = 'whatsapp';
submitSegmented.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    submitSegmented.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    submitMode = btn.dataset.mode;
    whatsappBlock.classList.toggle('d-none', submitMode !== 'whatsapp');
    googleFormBlock.classList.toggle('d-none', submitMode !== 'googleform');
  });
});
document.getElementById('googleFormBtn').addEventListener('click', () => {
  if (!INNOP_CONFIG.googleFormUrl || INNOP_CONFIG.googleFormUrl === 'YOUR_GOOGLE_FORM_URL_HERE') {
    alert('The Google Form link has not been configured yet. Please use WhatsApp submission instead.');
    return;
  }
  window.open(INNOP_CONFIG.googleFormUrl, '_blank', 'noopener');
});

/* ---------- Build WhatsApp application message ---------- */
function val(id){ const el = document.getElementById(id); return el ? el.value.trim() : ''; }
document.getElementById('applyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (submitMode !== 'whatsapp') return;
  const type = val('applicantType');
  if (!type) { alert('Please choose how you would like to participate.'); goToStep(1); return; }

  let lines = [
    'Hello INNOP Global India,',
    '',
    `I would like to apply as: ${type}`,
    '',
    `Name: ${val('fName')}`,
    `Phone: ${val('fPhone')}`,
    `Email: ${val('fEmail')}`,
    `Address: ${val('fAddress')}, ${val('fCity')}, ${val('fState')}`,
    `Designation / Role: ${val('fRole')}`,
    `Qualification: ${val('fQualification')}`
  ];
  if (val('fAge')) lines.push(`Age: ${val('fAge')}`);
  if (val('fGender')) lines.push(`Gender: ${val('fGender')}`);

  if (type === 'Startup / Founder') {
    lines.push('', '--- Startup Details ---',
      `Startup Name: ${val('sName')}`, `Stage: ${val('sStage')}`, `Industry: ${val('sIndustry')}`,
      `Team Size: ${val('sTeam')}`, `Problem: ${val('sProblem')}`, `Solution: ${val('sSolution')}`,
      `Product Status: ${val('sStatus')}`, `Website: ${val('sWebsite')}`, `Funding Status: ${val('sFunding')}`,
      `Revenue: ${val('sRevenue')}`, `Support Required: ${val('sSupport')}`);
  } else if (type === 'Mentor') {
    lines.push('', '--- Mentor Details ---',
      `Expertise: ${val('mExpertise')}`, `Years of Experience: ${val('mYears')}`, `Organization: ${val('mOrg')}`,
      `LinkedIn: ${val('mLinkedin')}`, `Background: ${val('mBackground')}`, `Mentoring Experience: ${val('mExperience')}`,
      `Areas of Support: ${val('mSupport')}`, `Availability: ${val('mAvailability')}`);
  } else if (type === 'Investor') {
    lines.push('', '--- Investor Details ---',
      `Organization: ${val('iOrg')}`, `LinkedIn/Website: ${val('iLink')}`, `Investment Experience: ${val('iExperience')}`,
      `Preferred Stage: ${val('iStage')}`, `Interests: ${val('iInterests')}`, `Approach: ${val('iApproach')}`);
  } else if (type === 'Individual') {
    lines.push('', '--- Individual Details ---',
      `Skills: ${val('pSkills')}`, `Education: ${val('pEducation')}`, `Interests: ${val('pInterests')}`,
      `Career Background: ${val('pCareer')}`, `Startup Experience: ${val('pStartupExp')}`, `LinkedIn/Portfolio: ${val('pLink')}`);
  }

  lines.push('', `Vision: ${val('fVision')}`);
  if (val('fWhy')) lines.push(`Why INNOP Global India: ${val('fWhy')}`);
  lines.push('', 'Thank you.');

  const message = lines.filter(l => l !== undefined).join('\n');
  const url = `https://wa.me/${INNOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
});

/* ---------- Robust in-page navigation ---------- */
document.querySelectorAll('a[href^="#"]:not([data-bs-toggle])').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + targetId); } catch (err) {}
  });
});

/* ---------- Background network canvases ---------- */
function initNetworkCanvas(canvasId, opts){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes;
  const nodeColor = opts.nodeColor || 'rgba(27,99,214,0.9)';
  const lineColor = opts.lineColor || 'rgba(27,99,214,0.15)';
  const count = opts.count || 60;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  function initNodes(){
    nodes = Array.from({length: count}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35,
      r: Math.random()*1.6+1
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < opts.linkDist){
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.globalAlpha = 1 - dist/opts.linkDist;
          ctx.lineWidth = 1;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.fillStyle = nodeColor;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', () => { resize(); initNodes(); });
  resize(); initNodes(); step();
}
try {
  initNetworkCanvas('hero-canvas', { count:70, linkDist:130, nodeColor:'rgba(27,99,214,0.85)', lineColor:'rgba(27,99,214,0.14)' });
  initNetworkCanvas('network-canvas', { count:90, linkDist:110, nodeColor:'rgba(255,255,255,0.9)', lineColor:'rgba(255,255,255,0.12)' });
} catch (err) { /* background animation is decorative only; ignore failures */ }
