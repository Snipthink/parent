/**
 * app.js — Bootstrap: init DB, i18n, router guards, sidebar, shell
 */

// ── Nav items (all 17 modules + notifications) ───────────────────
const NAV_ITEMS = [
  { path:'/dashboard',      icon:'📊', key:'nav.dashboard',      module:'dashboard' },
  { path:'/admin',          icon:'⚙️',  key:'nav.admin',          module:'admin' },
  { path:'/departments',    icon:'🏛️', key:'nav.departments',    module:'departments' },
  { path:'/classroom',      icon:'🏫', key:'nav.classroom',      module:'classroom' },
  { path:'/syllabus',       icon:'📚', key:'nav.syllabus',       module:'syllabus' },
  { path:'/attendance',     icon:'✅', key:'nav.attendance',     module:'attendance' },
  { path:'/noticeboard',    icon:'📌', key:'nav.noticeboard',    module:'noticeboard' },
  { path:'/notifications',  icon:'🔔', key:'nav.notifications',  module:'dashboard' },
  { path:'/clubs',          icon:'🎭', key:'nav.clubs',          module:'clubs' },
  { path:'/admissions',     icon:'📋', key:'nav.admissions',     module:'admissions' },
  { path:'/idcard',         icon:'🪪', key:'nav.idcard',         module:'idcard' },
  { path:'/exams',          icon:'📝', key:'nav.exams',          module:'exams' },
  { path:'/results',        icon:'🏆', key:'nav.results',        module:'results' },
  { path:'/fees',           icon:'💰', key:'nav.fees',           module:'fees' },
  { path:'/hr',             icon:'👥', key:'nav.hr',             module:'hr' },
  { path:'/transport',      icon:'🚌', key:'nav.transport',      module:'transport' },
];

// ── Sidebar render ───────────────────────────────────────────────
function renderSidebar(user) {
  if (!user) return;
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let school = null;
  try { school = user.schoolId ? DB.getById('schools', user.schoolId) : null; } catch(e) {}

  const filteredNav = NAV_ITEMS.filter(n => Auth.canAccess(user, n.module));
  const cur = Router.getCurrent();

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <img src="../images/favicon.svg" alt="Gurukul">
      <div>
        <div class="sidebar-app-name">Gurukul ERP</div>
        <div class="sidebar-school-name">${school?.name || 'School ERP'}</div>
      </div>
    </div>
    <div class="sidebar-user">
      <div class="su-avatar">${(user?.name||'U')[0].toUpperCase()}</div>
      <div>
        <div class="su-name">${user?.name || ''}</div>
        <div class="su-role">${I18N.get('role.' + (user?.role||'guest'))}</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${filteredNav.map(n => `
        <a class="sn-item ${cur === n.path ? 'active' : ''}"
           href="#${n.path}">
          <span class="sn-icon">${n.icon}</span>
          <span data-i18n="${n.key}">${I18N.get(n.key)}</span>
        </a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="lang-selector">
        <select id="langSelect" onchange="APP.changeLang(this.value)">
          ${I18N.getLangs().map(l =>
            `<option value="${l.code}" ${I18N.getLang()===l.code?'selected':''}>${l.flag} ${l.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="sb-footer-btns">
        <button class="sn-logout" onclick="Auth.logout()">
          <span>⏻</span> <span data-i18n="nav.logout">Logout</span>
        </button>
        <button class="sn-db-export" onclick="DB.exportDBFile()">
          <span>⬇</span> <span data-i18n="nav.backup">Backup DB</span>
        </button>
      </div>
    </div>`;
  I18N.apply(sidebar);
}

// ── Shell / Auth visibility ──────────────────────────────────────
function showShell(user) {
  document.getElementById('shell').style.display       = 'flex';
  document.getElementById('auth-screen').style.display = 'none';
  renderSidebar(user);
  // Init notification bell (safe to call multiple times — checks for existing)
  if (typeof initNotifBell === 'function') initNotifBell();
  // Update topbar title on each route change
  if (!window._shellListenerAdded) {
    window._shellListenerAdded = true;
    window.addEventListener('hashchange', () => {
      const u = Auth.currentUser();
      if (u) renderSidebar(u);
      updateTopbarTitle();
      if (typeof refreshNotifCount === 'function') refreshNotifCount();
    });
  }
}

function showAuth() {
  document.getElementById('shell').style.display       = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

function updateTopbarTitle() {
  const cur = Router.getCurrent();
  const item = NAV_ITEMS.find(n => n.path === cur);
  const el = document.getElementById('topbar-title');
  if (el && item) el.textContent = I18N.get(item.key);
}

// ── Mobile sidebar toggle ────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sb-overlay').classList.toggle('active');
}

// ── Topbar language picker ───────────────────────────────────────
function toggleLangPicker() {
  const dd = document.getElementById('topbar-lang-dropdown');
  if (!dd) return;
  if (dd.style.display === 'none' || !dd.style.display) {
    dd.innerHTML = I18N.getLangs().map(l =>
      `<div class="lang-opt ${I18N.getLang()===l.code?'active':''}"
            onclick="APP.changeLang('${l.code}')">${l.flag} ${l.label}</div>`
    ).join('');
    dd.style.display = 'block';
  } else {
    dd.style.display = 'none';
  }
}

// ── Language change ──────────────────────────────────────────────
function changeLang(code) {
  I18N.load(code).then(() => {
    const user = Auth.currentUser();
    if (user) renderSidebar(user);
    Router.resolve();
  });
}

// ── Boot ─────────────────────────────────────────────────────────
async function boot() {
  const loader = document.getElementById('boot-loader');
  if (loader) loader.style.display = 'flex';

  try {
    await DB.init();
    await I18N.load(localStorage.getItem('gk_lang') || 'en');
  } catch(e) {
    console.error('Boot error:', e);
  }

  if (loader) loader.style.display = 'none';

  // Auth guard — runs before every route
  Router.beforeEach((path) => {
    const AUTH_PATHS = ['/role-select', '/login', '/signup', '/setup'];
    const user = Auth.currentUser();

    if (!user && !AUTH_PATHS.includes(path)) {
      // Not logged in — send to role-select (will render in auth-screen)
      showAuth();
      Router.navigate('/role-select');
      return false;
    }
    if (user && AUTH_PATHS.includes(path) && path !== '/setup') {
      // Already logged in — send to dashboard
      showShell(user);
      Router.navigate('/dashboard');
      return false;
    }
    // Show correct container
    if (user) showShell(user);
    else      showAuth();
    return true;
  });

  // Close lang dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('topbar-lang-dropdown');
    const btn = document.getElementById('topbar-lang-btn');
    if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
      dd.style.display = 'none';
    }
  });

  Router.resolve();
}

// ── Toast notifications ───────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3000) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, duration);
}

// ── Public namespace ─────────────────────────────────────────────
const APP = { boot, toggleSidebar, toggleLangPicker, changeLang, showShell, showAuth };
// Also expose globally for module use
window.showToast = showToast;
