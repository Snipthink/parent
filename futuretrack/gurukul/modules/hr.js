Router.register('/hr', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const tab = query.tab || 'staff';
  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.hr">HR Department</h2>
    ${tab==='staff'?`<button class="btn-primary" onclick="openStaffForm()">+ Add Staff</button>`:''}
  </div>
  <div class="tab-bar">
    ${['staff','records','payroll'].map(t=>`
      <button class="tab-btn ${tab===t?'active':''}"
        onclick="Router.navigate('/hr?tab=${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')}
  </div>
  <div id="hr-form-container"></div>
  <div id="hr-tab"></div>`;

  if (tab==='staff')    renderHRStaff(sid, user);
  else if (tab==='records') renderHRRecords(sid);
  else renderHRPayroll(sid);
  I18N.apply(view);
});

function renderHRStaff(sid, currentUser) {
  const staff = sid ? DB.getAll('staff', sid) : [];
  const depts = sid ? DB.getAll('departments', sid) : [];
  const c = document.getElementById('hr-tab');
  c.innerHTML = `
  <div class="list-toolbar">
    <input class="form-control search-box" placeholder="Search staff..." oninput="filterTable(this,'staffTable')">
    <select class="form-control" style="width:160px" onchange="filterStaffRole(this.value)">
      <option value="">All Roles</option>
      ${['teacher','accountant','secretary','supervisor','librarian','transport','hr','staff'].map(r=>
        `<option value="${r}">${r}</option>`).join('')}
    </select>
  </div>
  <div class="data-table-wrap">
    <table class="data-table" id="staffTable">
      <thead><tr><th>Name</th><th>Role</th><th>Dept</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${staff.length ? staff.map(s=>{
          const dept = s.deptId ? DB.getById('departments',s.deptId) : null;
          return `<tr>
            <td>${s.name}</td>
            <td><span class="role-tag role-${s.role}">${s.role}</span></td>
            <td>${dept?.name||'-'}</td>
            <td>${s.email||'-'}</td>
            <td>${s.phone||'-'}</td>
            <td><span class="status-badge status-${s.status==='active'?'approved':'rejected'}">${s.status||'active'}</span></td>
            <td>
              <button class="btn-sm-primary" onclick="viewStaff('${s.id}')">View</button>
              <button class="btn-sm-danger" onclick="fireStaff('${s.id}')">Remove</button>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="7" class="empty-msg">No staff yet</td></tr>`}
      </tbody>
    </table>
  </div>`;
}

function openStaffForm(editId) {
  const user = Auth.currentUser();
  const sid = user.schoolId;
  const depts = sid ? DB.getAll('departments', sid) : [];
  const existing = editId ? DB.getById('staff', editId) : {};
  document.getElementById('hr-form-container').innerHTML = `
  <div class="form-card" style="margin-bottom:20px">
    <h3>${editId?'Edit':'Add'} Staff Member</h3>
    <div class="form-row">
      <div class="form-group"><label>Full Name *</label>
        <input class="form-control" id="sfName" value="${existing?.name||''}"></div>
      <div class="form-group"><label>Role</label>
        <select class="form-control" id="sfRole">
          ${['teacher','accountant','secretary','supervisor','librarian','transport','hr','staff'].map(r=>
            `<option value="${r}" ${existing?.role===r?'selected':''}>${r}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Designation</label>
        <input class="form-control" id="sfDesig" value="${existing?.designation||''}" placeholder="e.g. Senior Teacher"></div>
      <div class="form-group"><label>Department</label>
        <select class="form-control" id="sfDept">
          <option value="">-- None --</option>
          ${depts.map(d=>`<option value="${d.id}" ${existing?.deptId===d.id?'selected':''}>${d.name}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Email</label>
        <input class="form-control" type="email" id="sfEmail" value="${existing?.email||''}"></div>
      <div class="form-group"><label>Phone</label>
        <input class="form-control" id="sfPhone" value="${existing?.phone||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date of Birth</label>
        <input class="form-control" type="date" id="sfDob" value="${existing?.dob||''}"></div>
      <div class="form-group"><label>Joining Date</label>
        <input class="form-control" type="date" id="sfJoin" value="${existing?.joiningDate||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Monthly Salary (₹)</label>
        <input class="form-control" type="number" id="sfSalary" value="${existing?.salary||''}"></div>
      <div class="form-group"><label>Status</label>
        <select class="form-control" id="sfStatus">
          <option value="active" ${existing?.status!=='inactive'?'selected':''}>Active</option>
          <option value="inactive" ${existing?.status==='inactive'?'selected':''}>Inactive</option>
        </select></div>
    </div>
    <div class="form-group"><label>Address</label>
      <textarea class="form-control" id="sfAddr" rows="2">${existing?.address||''}</textarea></div>
    <div style="margin-top:12px;display:flex;gap:10px">
      <button class="btn-primary" onclick="saveStaff_('${editId||''}')">Save</button>
      <button class="btn-outline" onclick="document.getElementById('hr-form-container').innerHTML=''">Cancel</button>
    </div>
  </div>`;
}

function saveStaff_(editId) {
  const user = Auth.currentUser();
  const name = document.getElementById('sfName').value.trim();
  if (!name) { showToast('Name required'); return; }
  DB.saveStaff({
    id: editId||undefined, schoolId: user.schoolId,
    name, role: document.getElementById('sfRole').value,
    designation: document.getElementById('sfDesig').value,
    deptId: document.getElementById('sfDept').value||null,
    email: document.getElementById('sfEmail').value,
    phone: document.getElementById('sfPhone').value,
    dob: document.getElementById('sfDob').value,
    joiningDate: document.getElementById('sfJoin').value,
    salary: parseFloat(document.getElementById('sfSalary').value)||0,
    status: document.getElementById('sfStatus').value,
    address: document.getElementById('sfAddr').value
  });
  showToast('Staff saved');
  Router.navigate('/hr?tab=staff');
}

function fireStaff(id) {
  if (!confirm('Remove this staff member?')) return;
  DB.saveStaff({ ...DB.getById('staff',id), status: 'inactive' });
  // Add HR record
  const user = Auth.currentUser();
  DB.saveHR({ schoolId: user.schoolId, staffId: id, type: 'termination',
    date: new Date().toISOString().slice(0,10), description: 'Staff removed', status: 'done' });
  Router.navigate('/hr?tab=staff');
}

function viewStaff(id) {
  const s = DB.getById('staff', id);
  if (!s) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
  <div class="modal-box">
    <div class="modal-header">
      <h3>${s.name}</h3>
      <button onclick="this.closest('.modal-overlay').remove()">✕</button>
    </div>
    <div class="modal-body">
      <div class="adm-view-grid">
        ${Object.entries({Role:s.role,Designation:s.designation||'-',Email:s.email||'-',
          Phone:s.phone||'-',DOB:s.dob||'-',Joining:s.joiningDate||'-',
          Salary:`₹${s.salary||0}`,Status:s.status||'active'})
          .map(([k,v])=>`<div class="adm-field"><span>${k}</span><strong>${v}</strong></div>`).join('')}
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn-sm-primary" onclick="this.closest('.modal-overlay').remove();openStaffForm('${id}')">Edit</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function filterStaffRole(role) {
  document.querySelectorAll('#staffTable tbody tr').forEach(r => {
    r.style.display = !role || r.textContent.includes(role) ? '' : 'none';
  });
}

function renderHRRecords(sid) {
  const records = sid ? DB.all('SELECT hr.*, s.name as staffName FROM hr LEFT JOIN staff s ON hr.staffId=s.id WHERE hr.schoolId=? ORDER BY hr.date DESC',[sid]) : [];
  const c = document.getElementById('hr-tab');
  c.innerHTML = `
  <div class="form-card" style="margin-bottom:16px">
    <h3>Add HR Record</h3>
    <div class="form-row">
      <div class="form-group"><label>Staff</label>
        <select class="form-control" id="hrStaff">
          ${sid?DB.getAll('staff',sid).map(s=>`<option value="${s.id}">${s.name}</option>`).join(''):''}
        </select></div>
      <div class="form-group"><label>Type</label>
        <select class="form-control" id="hrType">
          ${['hiring','promotion','warning','leave','bonus','increment','termination','other'].map(t=>
            `<option value="${t}">${t}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date</label>
        <input class="form-control" type="date" id="hrDate" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="form-group"><label>Amount (if applicable)</label>
        <input class="form-control" type="number" id="hrAmount" placeholder="0"></div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea class="form-control" id="hrDesc" rows="2"></textarea></div>
    <button class="btn-primary" onclick="saveHRRecord_()">Add Record</button>
  </div>
  <div class="data-table-wrap">
    <table class="data-table">
      <thead><tr><th>Staff</th><th>Type</th><th>Date</th><th>Amount</th><th>Description</th></tr></thead>
      <tbody>
        ${records.length ? records.map(r=>`
          <tr>
            <td>${r.staffName||'-'}</td>
            <td><span class="hr-type-badge hrtype-${r.type}">${r.type}</span></td>
            <td>${r.date}</td>
            <td>${r.amount?'₹'+r.amount:'-'}</td>
            <td>${r.description||'-'}</td>
          </tr>`).join('') : `<tr><td colspan="5" class="empty-msg">No records</td></tr>`}
      </tbody>
    </table>
  </div>`;
}

function saveHRRecord_() {
  const user = Auth.currentUser();
  DB.saveHR({
    schoolId: user.schoolId,
    staffId: document.getElementById('hrStaff').value,
    type: document.getElementById('hrType').value,
    date: document.getElementById('hrDate').value,
    amount: parseFloat(document.getElementById('hrAmount').value)||0,
    description: document.getElementById('hrDesc').value,
    status: 'done'
  });
  showToast('Record saved');
  Router.navigate('/hr?tab=records');
}

function renderHRPayroll(sid) {
  const staff = sid ? DB.all("SELECT * FROM staff WHERE schoolId=? AND status='active'",[sid]) : [];
  const total = staff.reduce((s,st)=>s+(st.salary||0),0);
  const c = document.getElementById('hr-tab');
  c.innerHTML = `
  <div class="stats-row">
    <div class="mini-stat cyan"><strong>₹${total.toLocaleString('en-IN')}</strong><span>Monthly Payroll</span></div>
    <div class="mini-stat blue"><strong>${staff.length}</strong><span>Active Staff</span></div>
  </div>
  <div class="data-table-wrap" style="margin-top:16px">
    <table class="data-table">
      <thead><tr><th>Name</th><th>Role</th><th>Monthly Salary</th><th>Annual CTC</th></tr></thead>
      <tbody>
        ${staff.map(s=>`
          <tr>
            <td>${s.name}</td>
            <td>${s.role}</td>
            <td>₹${(s.salary||0).toLocaleString('en-IN')}</td>
            <td>₹${((s.salary||0)*12).toLocaleString('en-IN')}</td>
          </tr>`).join('') || '<tr><td colspan="4" class="empty-msg">No active staff</td></tr>'}
      </tbody>
    </table>
  </div>`;
}
