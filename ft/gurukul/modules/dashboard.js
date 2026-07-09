Router.register('/dashboard', (query, view) => {
  const user = Auth.requireAuth();
  if (!user) return;

  const sid     = user.schoolId;
  const now     = new Date();
  const session = (sid && DB.getSetting(sid, 'currentSession'))
    || (now.getMonth() >= 3
        ? `${now.getFullYear()}-${now.getFullYear()+1}`
        : `${now.getFullYear()-1}-${now.getFullYear()}`);

  const stats  = sid ? DB.getDashboardStats(sid, session) : {};
  const school = sid ? DB.getById('schools', sid) : null;

  // Top performers
  let topStudents = [];
  if (sid) {
    topStudents = DB.all(`
      SELECT s.name, s.classId, ROUND(AVG(r.marksObtained),1) as avg
      FROM results r JOIN students s ON r.studentId = s.id
      WHERE s.schoolId=?
      GROUP BY r.studentId ORDER BY avg DESC LIMIT 5`, [sid]);
  }

  // Recent notices
  const notices = sid
    ? DB.all(`SELECT * FROM notices WHERE schoolId=?
              ORDER BY pinned DESC, createdAt DESC LIMIT 4`, [sid])
    : [];

  // Fee this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const feeThisMonth = sid
    ? (DB.first('SELECT SUM(amount) as t FROM feePayments WHERE schoolId=? AND paidAt>=?',
        [sid, monthStart])?.t || 0)
    : 0;

  // Today's attendance summary
  const todayStr = now.toISOString().slice(0,10);
  const presentToday = sid
    ? (DB.first("SELECT COUNT(*) as n FROM attendance WHERE schoolId=? AND date=? AND status='present'",
        [sid, todayStr])?.n || 0)
    : 0;
  const totalMarked = sid
    ? (DB.first('SELECT COUNT(*) as n FROM attendance WHERE schoolId=? AND date=?',
        [sid, todayStr])?.n || 0)
    : 0;

  const attPct = totalMarked > 0 ? Math.round((presentToday/totalMarked)*100) : 0;

  // Greeting
  const hr = now.getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const dayName  = now.toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' });

  view.innerHTML = `
  <div class="dash-root">

    <!-- ── Hero Banner ─────────────────────────────────────────── -->
    <div class="dash-hero">
      <div class="dash-hero-glow"></div>
      <div class="dash-hero-content">
        <div class="dash-hero-left">
          <div class="dash-greeting-chip">${dayName}</div>
          <h1 class="dash-hero-title">${greeting}, <span class="grad-name">${user.name?.split(' ')[0] || 'there'}</span> 👋</h1>
          <p class="dash-hero-sub">${school?.name || 'Gurukul ERP'} &nbsp;·&nbsp; Session ${session}</p>
          <div class="dash-quick-actions">
            ${Auth.canAccess(user,'admissions') ? `<a href="#/admissions" class="qa-btn qa-cyan">＋ New Admission</a>` : ''}
            ${Auth.canAccess(user,'attendance')  ? `<a href="#/attendance"  class="qa-btn qa-green">✓ Mark Attendance</a>` : ''}
            ${Auth.canAccess(user,'noticeboard') ? `<a href="#/noticeboard" class="qa-btn qa-purple">◉ Post Notice</a>` : ''}
            ${Auth.canAccess(user,'fees')        ? `<a href="#/fees"        class="qa-btn qa-orange">◈ Collect Fee</a>` : ''}
          </div>
        </div>
        <div class="dash-hero-right">
          <div class="dash-today-card">
            <div class="dtc-label">Today's Attendance</div>
            <div class="dtc-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(70,213,249,0.15)" stroke-width="8"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="#46d5f9" stroke-width="8"
                  stroke-dasharray="${Math.round(2*Math.PI*34 * attPct/100)} 999"
                  stroke-linecap="round" stroke-dashoffset="-${Math.round(2*Math.PI*34*0.25)}"
                  class="ring-arc"/>
              </svg>
              <div class="dtc-pct">${attPct}%</div>
            </div>
            <div class="dtc-sub">${presentToday} / ${totalMarked} present</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Stats Grid ───────────────────────────────────────────── -->
    <div class="stats-grid" id="statsGrid">
      <div class="stat-card cyan"   data-target="${stats.totalStudents||0}">
        <div class="sc-icon-wrap cyan-bg">🎓</div>
        <div class="sc-val" id="sc0">0</div>
        <div class="sc-label" data-i18n="dashboard.total_students">Total Students</div>
        <div class="sc-bar"><div class="sc-bar-fill cyan-fill" style="width:${Math.min(100,(stats.totalStudents||0)/10)}%"></div></div>
      </div>
      <div class="stat-card green"  data-target="${stats.activeStudents||0}">
        <div class="sc-icon-wrap green-bg">✅</div>
        <div class="sc-val" id="sc1">0</div>
        <div class="sc-label" data-i18n="dashboard.active_students">Active</div>
        <div class="sc-bar"><div class="sc-bar-fill green-fill" style="width:${stats.totalStudents ? Math.round((stats.activeStudents||0)/stats.totalStudents*100) : 0}%"></div></div>
      </div>
      <div class="stat-card red"    data-target="${stats.suspended||0}">
        <div class="sc-icon-wrap red-bg">⛔</div>
        <div class="sc-val" id="sc2">0</div>
        <div class="sc-label" data-i18n="dashboard.suspended">Suspended</div>
        <div class="sc-bar"><div class="sc-bar-fill red-fill" style="width:${Math.min(100,(stats.suspended||0)*10)}%"></div></div>
      </div>
      <div class="stat-card blue"   data-target="${stats.passedOut||0}">
        <div class="sc-icon-wrap blue-bg">🎉</div>
        <div class="sc-val" id="sc3">0</div>
        <div class="sc-label" data-i18n="dashboard.passed_out">Passed Out</div>
        <div class="sc-bar"><div class="sc-bar-fill blue-fill" style="width:${Math.min(100,(stats.passedOut||0)*5)}%"></div></div>
      </div>
      <div class="stat-card purple" data-target="${stats.totalStaff||0}">
        <div class="sc-icon-wrap purple-bg">👨‍🏫</div>
        <div class="sc-val" id="sc4">0</div>
        <div class="sc-label" data-i18n="dashboard.total_staff">Staff</div>
        <div class="sc-bar"><div class="sc-bar-fill purple-fill" style="width:${Math.min(100,(stats.totalStaff||0)*5)}%"></div></div>
      </div>
      <div class="stat-card orange" data-target="${stats.totalAdm||0}">
        <div class="sc-icon-wrap orange-bg">📋</div>
        <div class="sc-val" id="sc5">0</div>
        <div class="sc-label" data-i18n="dashboard.admissions_session">Admissions (Session)</div>
        <div class="sc-bar"><div class="sc-bar-fill orange-fill" style="width:${Math.min(100,(stats.totalAdm||0)*2)}%"></div></div>
      </div>
      <div class="stat-card yellow" data-target="${stats.pendingAdm||0}">
        <div class="sc-icon-wrap yellow-bg">⏳</div>
        <div class="sc-val" id="sc6">0</div>
        <div class="sc-label" data-i18n="dashboard.pending_admissions">Pending Admissions</div>
        <div class="sc-bar"><div class="sc-bar-fill yellow-fill" style="width:${Math.min(100,(stats.pendingAdm||0)*10)}%"></div></div>
      </div>
      <div class="stat-card teal"   data-target="${Math.round(feeThisMonth)}">
        <div class="sc-icon-wrap teal-bg">💰</div>
        <div class="sc-val" id="sc7">₹0</div>
        <div class="sc-label" data-i18n="dashboard.fee_month">Fee This Month</div>
        <div class="sc-bar"><div class="sc-bar-fill teal-fill" style="width:${Math.min(100,feeThisMonth/1000)}%"></div></div>
      </div>
    </div>

    <!-- ── Two-column: Performers + Notices ─────────────────────── -->
    <div class="dash-cols">

      <!-- Top Performers -->
      <div class="dash-panel">
        <div class="panel-header">
          <div class="ph-title">
            <span class="ph-icon">🏆</span>
            <span data-i18n="dashboard.top_performers">Top Performers</span>
          </div>
          <a href="#/results" class="see-all" data-i18n="common.see_all">See All</a>
        </div>
        <div class="performers-list">
          ${topStudents.length
            ? topStudents.map((s,i) => `
            <div class="performer-row">
              <div class="perf-rank rank-${i+1}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
              <div class="perf-info">
                <div class="perf-name">${s.name}</div>
                <div class="perf-bar-wrap">
                  <div class="perf-bar" style="width:${s.avg}%"></div>
                </div>
              </div>
              <div class="perf-score">${s.avg}%</div>
            </div>`).join('')
            : `<div class="empty-state">
                <div class="es-icon">📊</div>
                <p data-i18n="dashboard.no_results">No results recorded yet</p>
                ${Auth.canAccess(user,'results') ? `<a href="#/results" class="qa-btn qa-cyan" style="font-size:12px">Enter Results</a>` : ''}
              </div>`}
        </div>
      </div>

      <!-- Recent Notices -->
      <div class="dash-panel">
        <div class="panel-header">
          <div class="ph-title">
            <span class="ph-icon">📌</span>
            <span data-i18n="dashboard.recent_notices">Recent Notices</span>
          </div>
          <a href="#/noticeboard" class="see-all" data-i18n="common.see_all">See All</a>
        </div>
        ${notices.length
          ? `<div class="notices-feed">
              ${notices.map(n => `
              <div class="nf-item ${n.pinned?'pinned':''}">
                <div class="nf-dot type-${n.type||'general'}"></div>
                <div class="nf-body">
                  <div class="nf-title">${n.title}${n.pinned?' 📌':''}</div>
                  <div class="nf-meta">${n.authorName||'System'} · ${_relTime(n.createdAt)}</div>
                </div>
                <span class="nf-badge type-${n.type||'general'}">${n.type||'general'}</span>
              </div>`).join('')}
            </div>`
          : `<div class="empty-state">
              <div class="es-icon">📭</div>
              <p data-i18n="dashboard.no_notices">No notices posted yet</p>
              ${Auth.canAccess(user,'noticeboard') ? `<a href="#/noticeboard" class="qa-btn qa-purple" style="font-size:12px">Post Notice</a>` : ''}
            </div>`}
      </div>
    </div>

    <!-- ── Performance Chart ─────────────────────────────────────── -->
    <div class="dash-panel chart-panel">
      <div class="panel-header">
        <div class="ph-title">
          <span class="ph-icon">📈</span>
          <span data-i18n="dashboard.performance">School Performance Overview</span>
        </div>
        <span class="ph-sub">Monthly Admissions · ${session}</span>
      </div>
      <div class="chart-wrap">
        <canvas id="perfChart"></canvas>
      </div>
    </div>

  </div>`;

  I18N.apply(view);
  _animateCounters();
  requestAnimationFrame(() => _renderPerfChart(sid, session));
});

// ── Relative time ────────────────────────────────────────────────
function _relTime(ts) {
  const d = Date.now() - ts;
  if (d < 60000)  return 'just now';
  if (d < 3600000) return Math.floor(d/60000) + 'm ago';
  if (d < 86400000)return Math.floor(d/3600000) + 'h ago';
  return new Date(ts).toLocaleDateString('en-IN', {day:'numeric',month:'short'});
}

// ── Counter animation ────────────────────────────────────────────
function _animateCounters() {
  const cards = document.querySelectorAll('#statsGrid .stat-card');
  cards.forEach((card, i) => {
    const target = parseInt(card.dataset.target) || 0;
    const el = document.getElementById('sc' + i);
    if (!el) return;
    const isFee = i === 7;
    let start = 0;
    const dur  = 900;
    const step = 16;
    const steps = dur / step;
    const inc = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + inc, target);
      el.textContent = isFee
        ? '₹' + Math.round(cur).toLocaleString('en-IN')
        : Math.round(cur).toLocaleString('en-IN');
      if (cur >= target) clearInterval(timer);
    }, step);
  });
}

// ── Performance chart ────────────────────────────────────────────
function _renderPerfChart(schoolId, session) {
  const canvas = document.getElementById('perfChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

  let data = months.map((_, i) => {
    if (!schoolId) return Math.floor(Math.random() * 8); // demo data
    const yr  = i < 9 ? parseInt(session) : parseInt(session)+1;
    const mo  = (i + 3) % 12 + 1;
    const s   = new Date(yr, mo-1, 1).getTime();
    const e   = new Date(yr, mo,   1).getTime();
    return DB.first(
      'SELECT COUNT(*) as n FROM admissions WHERE schoolId=? AND submittedAt>=? AND submittedAt<?',
      [schoolId, s, e])?.n || 0;
  });

  const W = canvas.parentElement.clientWidth || 700;
  const H = 180;
  canvas.width  = W;
  canvas.height = H;
  const pad = 44, cW = W - pad*2, cH = H - 44;
  const max = Math.max(...data, 1);

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const y = pad*0.5 + cH*(1-f);
    ctx.strokeStyle = 'rgba(70,213,249,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();
    ctx.fillStyle = 'rgba(70,213,249,0.4)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(max*f), pad-6, y+4);
  });

  const step = cW / (months.length - 1);

  // Fill gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(70,213,249,0.3)');
  grad.addColorStop(1, 'rgba(70,213,249,0)');

  // Draw line
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = pad + i * step;
    const y = pad*0.5 + cH*(1 - v/max);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#46d5f9';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Fill area
  ctx.lineTo(pad + (months.length-1)*step, pad*0.5 + cH);
  ctx.lineTo(pad, pad*0.5 + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Dots + labels
  ctx.textAlign = 'center';
  data.forEach((v, i) => {
    const x = pad + i * step;
    const y = pad*0.5 + cH*(1 - v/max);
    // dot
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2);
    ctx.fillStyle = '#46d5f9'; ctx.fill();
    ctx.strokeStyle = '#060c14'; ctx.lineWidth = 2; ctx.stroke();
    // value above dot
    if (v > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Inter';
      ctx.fillText(v, x, y - 9);
    }
    // month label
    ctx.fillStyle = 'rgba(150,180,200,0.7)';
    ctx.font = '10px Inter';
    ctx.fillText(months[i], x, H - 5);
  });
}
