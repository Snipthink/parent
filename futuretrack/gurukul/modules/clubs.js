Router.register('/clubs', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const clubs = sid ? DB.getAll('clubs', sid) : [];
  const TYPES = ['Sports','Quiz','Debate','Singing','Dance','Drama','Science','Art',
                 'Coding','Nature','Reading','Photography','Music','Cultural','Other'];

  view.innerHTML = `
  <div class="page-header">
    <h2 data-i18n="nav.clubs">Clubs & Activities</h2>
    <button class="btn-primary" onclick="openClubForm()">+ Create Club</button>
  </div>
  <div id="club-form-container"></div>
  <div class="clubs-grid" id="clubs-grid">
    ${clubs.length ? clubs.map(cl => renderClubCard(cl, user, sid)).join('')
      : '<p class="empty-msg">No clubs yet. Create one!</p>'}
  </div>`;
  I18N.apply(view);
});

function renderClubCard(cl, user, sid) {
  const members = DB.all('SELECT COUNT(*) as n FROM clubMembers WHERE clubId=?',[cl.id])[0]?.n||0;
  const meta = cl.meta ? JSON.parse(cl.meta) : {};
  return `
  <div class="club-card">
    <div class="cc-type-badge cc-${cl.type?.toLowerCase()}">${cl.type||'Club'}</div>
    <h3>${cl.name}</h3>
    <p>${cl.description||''}</p>
    ${meta.description ? `<p class="cc-meta">${meta.description}</p>` : ''}
    <div class="cc-footer">
      <span>👥 ${members} members</span>
      <button class="btn-sm-primary" onclick="openClubMembers('${cl.id}')">Members</button>
      ${['admin','principal'].includes(user?.role)
        ? `<button class="btn-sm-danger" onclick="deleteClub_('${cl.id}')">Delete</button>` : ''}
    </div>
  </div>`;
}

function openClubForm() {
  const user = Auth.currentUser();
  const staff = user.schoolId ? DB.getAll('staff', user.schoolId) : [];
  const TYPES = ['Sports','Quiz','Debate','Singing','Dance','Drama','Science','Art',
                 'Coding','Nature','Reading','Photography','Music','Cultural','Other'];
  document.getElementById('club-form-container').innerHTML = `
  <div class="form-card" style="margin-bottom:20px">
    <h3>Create Club / Activity</h3>
    <div class="form-row">
      <div class="form-group"><label>Club Name *</label>
        <input class="form-control" id="cName" placeholder="e.g. Science Club"></div>
      <div class="form-group"><label>Type</label>
        <select class="form-control" id="cType">
          ${TYPES.map(t=>`<option>${t}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea class="form-control" id="cDesc" rows="2" placeholder="What is this club about?"></textarea></div>
    <div class="form-group"><label>In-Charge Teacher</label>
      <select class="form-control" id="cInCharge">
        <option value="">-- None --</option>
        ${staff.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
      </select></div>
    <div class="form-group"><label>Additional Info (shown to new members)</label>
      <textarea class="form-control" id="cMeta" rows="2" placeholder="Meeting schedule, requirements..."></textarea></div>
    <div style="margin-top:12px">
      <button class="btn-primary" onclick="saveClub_()">Create Club</button>
      <button class="btn-outline" onclick="document.getElementById('club-form-container').innerHTML=''">Cancel</button>
    </div>
  </div>`;
}

function saveClub_() {
  const user = Auth.currentUser();
  const name = document.getElementById('cName').value.trim();
  if (!name) return showToast('Club name required');
  const metaText = document.getElementById('cMeta').value;
  DB.saveClub({
    schoolId: user.schoolId,
    name, type: document.getElementById('cType').value,
    description: document.getElementById('cDesc').value,
    inChargeId: document.getElementById('cInCharge').value||null,
    meta: metaText ? JSON.stringify({ description: metaText }) : null
  });
  Router.navigate('/clubs');
}

function deleteClub_(id) {
  if (!confirm('Delete club?')) return;
  DB.deleteRow('clubs', id);
  Router.navigate('/clubs');
}

function openClubMembers(clubId) {
  const user = Auth.currentUser();
  const club = DB.getById('clubs', clubId);
  const members = DB.all(`
    SELECT cm.*, cm.memberType FROM clubMembers cm WHERE cm.clubId=?`,[clubId]);
  const students = user.schoolId ? DB.getStudents(user.schoolId) : [];
  const staff    = user.schoolId ? DB.getAll('staff', user.schoolId) : [];

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
  <div class="modal-box">
    <div class="modal-header">
      <h3>${club?.name} — Members</h3>
      <button onclick="this.closest('.modal-overlay').remove()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label>Add Member</label>
          <select class="form-control" id="cmType" onchange="loadMemberSelect()">
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select></div>
        <div class="form-group"><label>Select</label>
          <select class="form-control" id="cmSelect">
            ${students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Role in Club</label>
          <input class="form-control" id="cmRole" placeholder="e.g. Captain, Member"></div>
      </div>
      <button class="btn-primary" onclick="addClubMember('${clubId}')">Add</button>
      <div class="data-table-wrap" style="margin-top:16px">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Role</th><th>×</th></tr></thead>
          <tbody id="cm-list">
            ${members.map(m=>{
              const person = m.memberType==='student'
                ? DB.getById('students',m.memberId)
                : DB.getById('staff',m.memberId);
              return `<tr>
                <td>${person?.name||'?'}</td>
                <td>${m.memberType}</td>
                <td>${m.role||'Member'}</td>
                <td><button class="btn-sm-danger" onclick="removeClubMember('${m.id}','${clubId}')">×</button></td>
              </tr>`;
            }).join('') || '<tr><td colspan="4" class="empty-msg">No members</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  window._cmStudents = students; window._cmStaff = staff;
}

function loadMemberSelect() {
  const type = document.getElementById('cmType').value;
  const sel  = document.getElementById('cmSelect');
  const list = type === 'student' ? window._cmStudents : window._cmStaff;
  sel.innerHTML = (list||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function addClubMember(clubId) {
  const memberId = document.getElementById('cmSelect').value;
  const memberType = document.getElementById('cmType').value;
  const role = document.getElementById('cmRole').value;
  if (!memberId) return;
  DB.saveClubMember({ clubId, memberId, memberType, role: role||'Member' });
  document.querySelector('.modal-overlay')?.remove();
  openClubMembers(clubId);
}

function removeClubMember(id, clubId) {
  DB.deleteRow('clubMembers', id);
  document.querySelector('.modal-overlay')?.remove();
  openClubMembers(clubId);
}
