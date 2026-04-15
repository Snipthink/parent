Router.register('/noticeboard', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const filter = query.filter || 'school';
  const notices = sid
    ? DB.all(`SELECT * FROM notices WHERE schoolId=? AND targetType=? ORDER BY pinned DESC, createdAt DESC`,
        [sid, filter])
    : [];
  const canPost = ['admin','principal','vice-principal','teacher','accountant','secretary','hod','dean','director','trustee'].includes(user.role);

  view.innerHTML = `
  <div class="page-header">
    <h2 data-i18n="nav.noticeboard">Notice Board</h2>
    ${canPost ? `<button class="btn-primary" onclick="openNoticeForm()">+ Post Notice</button>` : ''}
  </div>
  <div class="notice-filter-bar">
    ${['school','class','club'].map(f=>`
      <button class="filter-btn ${filter===f?'active':''}"
        onclick="Router.navigate('/noticeboard?filter=${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
  </div>
  <div id="notice-form-container"></div>
  <div class="notices-list">
    ${notices.length ? notices.map(n=>`
      <div class="notice-card ${n.pinned?'pinned':''}">
        <div class="nc-header">
          <div>
            <span class="nc-type-badge nc-${n.type}">${n.type}</span>
            ${n.pinned?'<span class="nc-pinned">📌 Pinned</span>':''}
          </div>
          ${canPost && n.authorId===user.id ? `
            <button class="btn-sm-danger" onclick="deleteNotice_('${n.id}')">Delete</button>` : ''}
        </div>
        <h3 class="nc-title">${n.title}</h3>
        <p class="nc-content">${n.content}</p>
        <div class="nc-footer">
          <span>By ${n.authorName} (${n.authorRole})</span>
          <span>${new Date(n.createdAt).toLocaleString()}</span>
        </div>
      </div>`).join('') : `<p class="empty-msg">No notices yet</p>`}
  </div>`;
  I18N.apply(view);
});

function openNoticeForm() {
  const user = Auth.currentUser();
  const sid = user.schoolId;
  const classes = sid ? DB.getAll('classes', sid) : [];
  const clubs = sid ? DB.getAll('clubs', sid) : [];
  document.getElementById('notice-form-container').innerHTML = `
  <div class="form-card" style="margin-bottom:20px">
    <h3>Post Notice</h3>
    <div class="form-row">
      <div class="form-group"><label>Title *</label>
        <input class="form-control" id="ntitle" placeholder="Notice title"></div>
      <div class="form-group"><label>Type</label>
        <select class="form-control" id="ntype">
          <option value="general">General</option>
          <option value="urgent">Urgent</option>
          <option value="event">Event</option>
          <option value="exam">Exam</option>
          <option value="fee">Fee</option>
          <option value="holiday">Holiday</option>
        </select></div>
    </div>
    <div class="form-group"><label>Content *</label>
      <textarea class="form-control" id="ncontent" rows="3" placeholder="Notice content..."></textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Target</label>
        <select class="form-control" id="ntarget" onchange="updateTargetId()">
          <option value="school">Whole School</option>
          <option value="class">Specific Class</option>
          <option value="club">Specific Club</option>
        </select></div>
      <div class="form-group" id="ntargetIdGroup" style="display:none"><label>Select Class/Club</label>
        <select class="form-control" id="ntargetId"></select></div>
    </div>
    <label class="checkbox-row">
      <input type="checkbox" id="npinned"> Pin this notice
    </label>
    <div style="margin-top:12px">
      <button class="btn-primary" onclick="postNotice()">Post</button>
      <button class="btn-outline" onclick="document.getElementById('notice-form-container').innerHTML=''">Cancel</button>
    </div>
  </div>`;
  window._noticeClasses = classes;
  window._noticeClubs   = clubs;
}

function updateTargetId() {
  const tgt = document.getElementById('ntarget').value;
  const grp = document.getElementById('ntargetIdGroup');
  const sel = document.getElementById('ntargetId');
  if (tgt === 'school') { grp.style.display='none'; return; }
  grp.style.display = '';
  if (tgt === 'class') {
    sel.innerHTML = (window._noticeClasses||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  } else {
    sel.innerHTML = (window._noticeClubs||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  }
}

function postNotice() {
  const user = Auth.currentUser();
  const title   = document.getElementById('ntitle').value.trim();
  const content = document.getElementById('ncontent').value.trim();
  if (!title || !content) { showToast('Fill title and content'); return; }
  const targetType = document.getElementById('ntarget').value;
  const targetId   = targetType !== 'school' ? document.getElementById('ntargetId').value : null;
  const notice = DB.saveNotice({
    schoolId: user.schoolId, title, content,
    type: document.getElementById('ntype').value,
    targetType, targetId,
    authorId: user.id, authorName: user.name, authorRole: user.role,
    pinned: document.getElementById('npinned').checked
  });
  // Auto-notify
  if (typeof notifySchool === 'function') {
    notifySchool(user.schoolId, {
      type: 'notice', title: `📌 ${title}`,
      body: content.slice(0, 80) + (content.length > 80 ? '…' : ''),
      sourceModule: 'noticeboard', sourceId: notice?.id
    });
    if (typeof refreshNotifCount === 'function') refreshNotifCount();
  }
  Router.navigate('/noticeboard?filter=' + targetType);
}

function deleteNotice_(id) {
  if (!confirm('Delete this notice?')) return;
  DB.deleteRow('notices', id);
  Router.resolve();
}
