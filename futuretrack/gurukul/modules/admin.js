Router.register('/admin', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const school = sid ? DB.getById('schools', sid) : null;
  const allStaff = sid ? DB.getAll('staff', sid) : [];
  const allUsers = sid ? DB.getUsers(sid) : [];

  const tabs = ['school','hierarchy','permissions','users'];
  const activeTab = query.tab || 'school';

  view.innerHTML = `
  <div class="page-header">
    <h2 data-i18n="nav.admin">Admin</h2>
  </div>
  <div class="tab-bar">
    ${tabs.map(t=>`
      <button class="tab-btn ${activeTab===t?'active':''}"
        onclick="Router.navigate('/admin?tab=${t}')"
        data-i18n="admin.tab_${t}">${t.charAt(0).toUpperCase()+t.slice(1)}</button>
    `).join('')}
  </div>
  <div id="admin-tab-content"></div>`;

  I18N.apply(view);

  if (activeTab === 'school')       renderSchoolTab(school, user);
  else if (activeTab === 'hierarchy') renderHierarchyTab(sid, allUsers, allStaff, user);
  else if (activeTab === 'permissions') renderPermissionsTab(sid, allUsers);
  else if (activeTab === 'users')   renderUsersTab(sid, allUsers, user);
});

function renderSchoolTab(school, user) {
  const c = document.getElementById('admin-tab-content');
  c.innerHTML = `
  <div class="form-card">
    <h3 data-i18n="admin.school_info">School Information</h3>
    <div class="form-row">
      <div class="form-group">
        <label data-i18n="setup.school_name">School Name *</label>
        <input class="form-control" id="aSchName" value="${school?.name||''}">
      </div>
      <div class="form-group">
        <label data-i18n="setup.type">Type</label>
        <select class="form-control" id="aSchType">
          ${['school','college','coaching','other'].map(t=>
            `<option value="${t}" ${school?.type===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label data-i18n="setup.board">Board</label>
        <select class="form-control" id="aSchBoard">
          ${['CBSE','ICSE','State','IB','IGCSE','University','Other'].map(b=>
            `<option value="${b}" ${school?.board===b?'selected':''}>${b}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label data-i18n="setup.medium">Medium</label>
        <select class="form-control" id="aSchMedium">
          ${['English','Hindi','Both','Other'].map(m=>
            `<option value="${m}" ${school?.medium===m?'selected':''}>${m}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Phone</label>
        <input class="form-control" id="aSchPhone" value="${school?.phone||''}">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="form-control" type="email" id="aSchEmail" value="${school?.email||''}">
      </div>
    </div>
    <div class="form-group">
      <label>Website</label>
      <input class="form-control" id="aSchWeb" value="${school?.website||''}">
    </div>
    <div class="form-group">
      <label>Address</label>
      <textarea class="form-control" id="aSchAddr" rows="2">${school?.address||''}</textarea>
    </div>
    <div class="form-group">
      <label data-i18n="admin.school_logo">School Logo</label>
      <div class="logo-upload-row">
        <div id="logoPreview" class="logo-preview">${school?.logo?`<img src="${school.logo}" id="logoImg">`:'No logo'}</div>
        <input type="file" id="logoFile" accept="image/*" onchange="handleLogoUpload(this)" style="display:none">
        <button class="btn-sm-primary" onclick="document.getElementById('logoFile').click()">Upload Logo</button>
        ${school?.logo?`<button class="btn-sm-danger" onclick="removeLogo()">Remove</button>`:''}
      </div>
    </div>
    <div class="form-group">
      <label>Academic Session</label>
      <input class="form-control" id="aSession" value="${school?.id?DB.getSetting(school.id,'currentSession')||'':''}" placeholder="e.g. 2025-2026">
    </div>
    <button class="btn-primary" onclick="saveSchoolInfo()">💾 Save Changes</button>
  </div>`;
  I18N.apply(c);
}

function handleLogoUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const user = Auth.currentUser();
    const school = DB.getById('schools', user.schoolId);
    DB.saveSchool({ ...school, logo: e.target.result });
    document.getElementById('logoPreview').innerHTML = `<img src="${e.target.result}" id="logoImg">`;
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  const user = Auth.currentUser();
  const school = DB.getById('schools', user.schoolId);
  DB.saveSchool({ ...school, logo: null });
  document.getElementById('logoPreview').innerHTML = 'No logo';
}

function saveSchoolInfo() {
  const user = Auth.currentUser();
  const school = DB.getById('schools', user.schoolId) || {};
  DB.saveSchool({
    ...school,
    name:    document.getElementById('aSchName').value,
    type:    document.getElementById('aSchType').value,
    board:   document.getElementById('aSchBoard').value,
    medium:  document.getElementById('aSchMedium').value,
    phone:   document.getElementById('aSchPhone').value,
    email:   document.getElementById('aSchEmail').value,
    website: document.getElementById('aSchWeb').value,
    address: document.getElementById('aSchAddr').value,
    adminId: user.id
  });
  const sessionVal = document.getElementById('aSession').value;
  if (sessionVal) DB.setSetting(user.schoolId, 'currentSession', sessionVal);
  showToast(I18N.get('common.saved'));
  renderSidebar(Auth.currentUser());
}

function renderHierarchyTab(sid, users, staff, currentUser) {
  const c = document.getElementById('admin-tab-content');
  const roles = ['director','trustee','principal','vice-principal','dean','hod',
                 'teacher','accountant','secretary','supervisor','librarian','transport','hr'];

  c.innerHTML = `
  <div class="form-card">
    <h3 data-i18n="admin.hierarchy">Staff Hierarchy</h3>
    <div class="form-row">
      <div class="form-group">
        <label>User</label>
        <select class="form-control" id="hierUser">
          ${users.map(u=>`<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Assign Role</label>
        <select class="form-control" id="hierRole">
          ${roles.filter(r => Auth.canManageRole(currentUser.role, r))
            .map(r=>`<option value="${r}">${r}</option>`).join('')}
        </select>
      </div>
    </div>
    <button class="btn-primary" onclick="assignRole()">Assign Role</button>
  </div>
  <div class="hierarchy-tree">
    ${buildHierarchyTree(users)}
  </div>`;
  I18N.apply(c);
}

function buildHierarchyTree(users) {
  const order = ['superadmin','admin','director','trustee','principal','vice-principal',
                 'dean','hod','teacher','accountant','secretary','supervisor','student'];
  const grouped = {};
  users.forEach(u => { (grouped[u.role] = grouped[u.role]||[]).push(u); });
  return order.filter(r => grouped[r]).map(r=>`
    <div class="hier-group">
      <div class="hier-role-label">${r}</div>
      <div class="hier-members">
        ${grouped[r].map(u=>`
          <div class="hier-member">
            <div class="hm-avatar">${u.name[0]}</div>
            <span>${u.name}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function assignRole() {
  const userId = document.getElementById('hierUser').value;
  const role   = document.getElementById('hierRole').value;
  DB.updateUser(userId, { role });
  showToast('Role updated');
  Router.navigate('/admin?tab=hierarchy');
}

function renderPermissionsTab(sid, users) {
  const c = document.getElementById('admin-tab-content');
  const modules = ['dashboard','departments','classroom','syllabus','admissions',
                   'idcard','exams','results','fees','hr','transport','noticeboard','clubs','attendance'];
  c.innerHTML = `
  <div class="form-card">
    <h3>Module Permissions</h3>
    <div class="form-group">
      <label>Select User</label>
      <select class="form-control" id="permUser" onchange="loadUserPerms()">
        <option value="">-- Select User --</option>
        ${users.map(u=>`<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
      </select>
    </div>
    <div id="perm-table"></div>
  </div>`;
  I18N.apply(c);
}

function loadUserPerms() {
  const userId = document.getElementById('permUser').value;
  if (!userId) return;
  const user = Auth.currentUser();
  const modules = ['dashboard','departments','classroom','syllabus','admissions',
                   'idcard','exams','results','fees','hr','transport','noticeboard','clubs','attendance'];
  const perms = DB.getPermissions(user.schoolId, userId);
  const permMap = {};
  perms.forEach(p => permMap[p.module] = p);

  document.getElementById('perm-table').innerHTML = `
  <table class="perm-table">
    <thead><tr><th>Module</th><th>Read</th><th>Write</th></tr></thead>
    <tbody>
      ${modules.map(m=>`
        <tr>
          <td>${m}</td>
          <td><input type="checkbox" id="pr_${m}" ${permMap[m]?.canRead?'checked':''}></td>
          <td><input type="checkbox" id="pw_${m}" ${permMap[m]?.canWrite?'checked':''}></td>
        </tr>`).join('')}
    </tbody>
  </table>
  <button class="btn-primary" onclick="savePerms('${userId}')">Save Permissions</button>`;
}

function savePerms(userId) {
  const user = Auth.currentUser();
  const modules = ['dashboard','departments','classroom','syllabus','admissions',
                   'idcard','exams','results','fees','hr','transport','noticeboard','clubs','attendance'];
  modules.forEach(m => {
    DB.setPermission({
      schoolId: user.schoolId, userId, module: m,
      canRead:  document.getElementById('pr_'+m)?.checked,
      canWrite: document.getElementById('pw_'+m)?.checked,
      grantedBy: user.id
    });
  });
  showToast('Permissions saved');
}

function renderUsersTab(sid, users, currentUser) {
  const c = document.getElementById('admin-tab-content');
  c.innerHTML = `
  <div class="list-toolbar">
    <input class="form-control search-box" placeholder="Search users..." oninput="filterUsers(this.value)">
  </div>
  <div class="data-table-wrap">
    <table class="data-table" id="usersTable">
      <thead><tr>
        <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
      </tr></thead>
      <tbody id="usersTbody">
        ${users.map(u=>`
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="role-tag role-${u.role}">${u.role}</span></td>
            <td>
              ${Auth.canManageRole(currentUser.role, u.role) && u.id !== currentUser.id
                ? `<button class="btn-sm-danger" onclick="deleteUser('${u.id}')">Remove</button>`
                : ''}
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
  I18N.apply(c);
}

function filterUsers(q) {
  const rows = document.querySelectorAll('#usersTbody tr');
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function deleteUser(id) {
  if (!confirm('Remove this user?')) return;
  DB.deleteRow('users', id);
  Router.navigate('/admin?tab=users');
}

// showToast is defined globally in app.js
