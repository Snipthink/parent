/**
 * notifications.js — Module #7: Class Sync + Notifications
 *
 * - In-app notification bell in topbar (badge + dropdown panel)
 * - auto-push hooks called by other modules on key events
 * - Full notification center at #/notifications
 */

// ── Notification bell bootstrap (called by app.js after shell renders) ──
function initNotifBell() {
  const topbar = document.getElementById('topbar');
  if (!topbar || document.getElementById('notif-bell')) return;

  const user = Auth.currentUser();
  if (!user || !user.schoolId) return;

  // Inject bell before the lang button
  const langBtn = document.getElementById('topbar-lang-btn');
  const bellWrap = document.createElement('div');
  bellWrap.className = 'notif-bell-wrap';
  bellWrap.id = 'notif-bell';
  bellWrap.innerHTML = `
    <button class="topbar-icon-btn" onclick="toggleNotifPanel()" title="Notifications" aria-label="Notifications">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="notif-badge" id="notif-count" style="display:none">0</span>
    </button>
    <div class="notif-panel" id="notif-panel" style="display:none"></div>`;

  topbar.querySelector('.topbar-right').prepend(bellWrap);
  refreshNotifCount();

  // Close panel on outside click
  document.addEventListener('click', e => {
    const panel = document.getElementById('notif-panel');
    const bell  = document.getElementById('notif-bell');
    if (panel && bell && !bell.contains(e.target)) panel.style.display = 'none';
  });
}

function refreshNotifCount() {
  const user = Auth.currentUser();
  if (!user?.schoolId) return;
  const n = DB.countUnread(user.id, user.schoolId);
  const badge = document.getElementById('notif-count');
  if (!badge) return;
  if (n > 0) { badge.textContent = n > 99 ? '99+' : n; badge.style.display = 'flex'; }
  else { badge.style.display = 'none'; }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  if (panel.style.display === 'none' || !panel.style.display) {
    renderNotifPanel();
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

function renderNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const user = Auth.currentUser();
  if (!user?.schoolId) return;

  const notifs = DB.getNotifications(user.id, user.schoolId);
  const icons = { exam:'📝', notice:'📌', fee:'💰', attendance:'✅', admission:'📋', info:'ℹ️', alert:'⚠️' };

  panel.innerHTML = `
    <div class="np-header">
      <span>Notifications</span>
      <button class="np-mark-all" onclick="markAllRead()">Mark all read</button>
    </div>
    <div class="np-list">
      ${notifs.length ? notifs.map(n => `
        <div class="np-item ${n.isRead ? '' : 'unread'}" onclick="readNotif('${n.id}', this)">
          <div class="np-icon type-${n.type}">${icons[n.type] || '🔔'}</div>
          <div class="np-body">
            <div class="np-title">${n.title}</div>
            <div class="np-text">${n.body || ''}</div>
            <div class="np-time">${_relNotifTime(n.createdAt)}</div>
          </div>
        </div>`).join('')
        : `<div class="np-empty">No notifications yet</div>`}
    </div>
    <div class="np-footer">
      <a href="#/notifications" onclick="document.getElementById('notif-panel').style.display='none'">View all</a>
    </div>`;
}

function readNotif(id, el) {
  DB.markNotifRead(id);
  el.classList.remove('unread');
  refreshNotifCount();
}

function markAllRead() {
  const user = Auth.currentUser();
  if (!user?.schoolId) return;
  DB.markAllNotifsRead(user.id, user.schoolId);
  document.querySelectorAll('.np-item.unread').forEach(el => el.classList.remove('unread'));
  refreshNotifCount();
  document.getElementById('notif-panel').style.display = 'none';
}

function _relNotifTime(ts) {
  const d = Date.now() - ts;
  if (d < 60000)   return 'just now';
  if (d < 3600000) return Math.floor(d/60000) + 'm ago';
  if (d < 86400000)return Math.floor(d/3600000) + 'h ago';
  return new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

// ── Full Notification Center ─────────────────────────────────────
Router.register('/notifications', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const filter = query.filter || 'all';
  const notifs = sid ? DB.getNotifications(user.id, sid, filter === 'unread') : [];
  const icons  = { exam:'📝', notice:'📌', fee:'💰', attendance:'✅', admission:'📋', info:'ℹ️', alert:'⚠️' };

  view.innerHTML = `
  <div class="page-header">
    <div>
      <h2>🔔 Notifications</h2>
      <p class="page-sub">Class sync & school alerts</p>
    </div>
    <div class="header-actions">
      <button class="btn-sm-primary" onclick="markAllRead(); Router.resolve()">Mark all read</button>
    </div>
  </div>
  <div class="tab-bar">
    <button class="tab-btn ${filter==='all'?'active':''}" onclick="Router.navigate('/notifications?filter=all')">All</button>
    <button class="tab-btn ${filter==='unread'?'active':''}" onclick="Router.navigate('/notifications?filter=unread')">Unread</button>
  </div>
  <div class="notif-center">
    ${notifs.length ? notifs.map(n => `
      <div class="nc-notif ${n.isRead ? '' : 'unread'}" onclick="DB.markNotifRead('${n.id}'); this.classList.remove('unread'); refreshNotifCount()">
        <div class="ncn-icon type-${n.type}">${icons[n.type] || '🔔'}</div>
        <div class="ncn-body">
          <div class="ncn-title">${n.title}</div>
          <div class="ncn-text">${n.body || ''}</div>
          <div class="ncn-meta">
            <span class="badge badge-${n.type === 'alert' ? 'red' : 'gray'}">${n.type || 'info'}</span>
            <span>${n.sourceModule || ''}</span>
            <span>${_relNotifTime(n.createdAt)}</span>
          </div>
        </div>
      </div>`).join('')
      : `<div class="empty-state" style="margin-top:40px">
          <div class="es-icon">🔕</div>
          <p>${filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
        </div>`}
  </div>`;
  I18N.apply(view);
});

// ── Auto-push helpers (called by other modules) ──────────────────

/**
 * Notify all students in a section about an event.
 * @param {string} schoolId
 * @param {string} sectionId  - if null, notifies all students in school
 * @param {object} payload    - { type, title, body, sourceModule, sourceId }
 */
function notifyStudents(schoolId, sectionId, payload) {
  const students = sectionId
    ? DB.getStudents(schoolId, { sectionId })
    : DB.getStudents(schoolId);
  // Also send a role-level notification so new students auto-receive it
  DB.pushNotification({ schoolId, targetRole: 'student', ...payload });
}

function notifyRole(schoolId, role, payload) {
  DB.pushNotification({ schoolId, targetRole: role, ...payload });
}

function notifyUser(schoolId, userId, payload) {
  DB.pushNotification({ schoolId, targetUserId: userId, ...payload });
}

function notifySchool(schoolId, payload) {
  // null targetRole = everyone in school
  DB.pushNotification({ schoolId, targetRole: null, ...payload });
}
