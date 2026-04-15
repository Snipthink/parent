Router.register('/departments', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const activeTab = query.tab || 'depts';

  view.innerHTML = `
  <div class="page-header">
    <h2 data-i18n="nav.departments">Departments & Courses</h2>
  </div>
  <div class="tab-bar">
    <button class="tab-btn ${activeTab==='depts'?'active':''}" onclick="Router.navigate('/departments?tab=depts')">Departments</button>
    <button class="tab-btn ${activeTab==='courses'?'active':''}" onclick="Router.navigate('/departments?tab=courses')">Courses / Programs</button>
  </div>
  <div id="dept-tab"></div>`;

  if (activeTab === 'depts')   renderDeptsTab(sid, user);
  else                          renderCoursesTab(sid, user);
  I18N.apply(view);
});

function renderDeptsTab(sid, user) {
  const depts = sid ? DB.getAll('departments', sid) : [];
  const staff = sid ? DB.getAll('staff', sid) : [];
  const c = document.getElementById('dept-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Department</h3>
      <div class="form-group"><label>Name *</label>
        <input class="form-control" id="dName" placeholder="e.g. Science Department"></div>
      <div class="form-group"><label>Code</label>
        <input class="form-control" id="dCode" placeholder="SCI"></div>
      <div class="form-group"><label>Head of Department (HoD)</label>
        <select class="form-control" id="dHod">
          <option value="">-- None --</option>
          ${staff.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Description</label>
        <textarea class="form-control" id="dDesc" rows="2" placeholder="Optional"></textarea></div>
      <button class="btn-primary" onclick="saveDept()">Add Department</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Code</th><th>HoD</th><th>Actions</th></tr></thead>
        <tbody>
          ${depts.length ? depts.map(d=>{
            const hod = d.hodId ? staff.find(s=>s.id===d.hodId) : null;
            return `<tr>
              <td>${d.name}</td><td>${d.code||'-'}</td>
              <td>${hod?.name||'-'}</td>
              <td>
                <button class="btn-sm-danger" onclick="deleteDept('${d.id}')">Delete</button>
              </td></tr>`;
          }).join('') : `<tr><td colspan="4" class="empty-msg">No departments yet</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveDept() {
  const user = Auth.currentUser();
  if (!user.schoolId) return;
  DB.saveDept({
    schoolId: user.schoolId,
    name: document.getElementById('dName').value,
    code: document.getElementById('dCode').value,
    hodId: document.getElementById('dHod').value || null,
    description: document.getElementById('dDesc').value
  });
  Router.navigate('/departments?tab=depts');
}
function deleteDept(id) {
  if (!confirm('Delete department?')) return;
  DB.deleteRow('departments', id);
  Router.navigate('/departments?tab=depts');
}

function renderCoursesTab(sid, user) {
  const courses = sid ? DB.getAll('courses', sid) : [];
  const depts = sid ? DB.getAll('departments', sid) : [];
  const c = document.getElementById('dept-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Course / Program</h3>
      <div class="form-group"><label>Name *</label>
        <input class="form-control" id="cName" placeholder="e.g. Primary School"></div>
      <div class="form-group"><label>Code</label>
        <input class="form-control" id="cCode" placeholder="PS"></div>
      <div class="form-group"><label>Department</label>
        <select class="form-control" id="cDept">
          <option value="">-- None --</option>
          ${depts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}
        </select></div>
      <div class="form-row">
        <div class="form-group"><label>Duration</label>
          <input class="form-control" type="number" id="cDur" value="1" min="1"></div>
        <div class="form-group"><label>Unit</label>
          <select class="form-control" id="cDurUnit">
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="semester">Semester</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Level</label>
          <select class="form-control" id="cLevel">
            <option>Nursery</option><option>Primary</option><option>Middle</option>
            <option>Secondary</option><option>Senior Secondary</option>
            <option>Undergraduate</option><option>Postgraduate</option><option>PhD</option>
          </select></div>
        <div class="form-group"><label>Medium</label>
          <select class="form-control" id="cMedium">
            <option>English</option><option>Hindi</option><option>Both</option><option>Other</option>
          </select></div>
      </div>
      <button class="btn-primary" onclick="saveCourse()">Add Course</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Level</th><th>Duration</th><th>Medium</th><th>Actions</th></tr></thead>
        <tbody>
          ${courses.length ? courses.map(c=>`
            <tr>
              <td>${c.name}</td><td>${c.level||'-'}</td>
              <td>${c.duration} ${c.durationUnit}</td>
              <td>${c.medium||'-'}</td>
              <td><button class="btn-sm-danger" onclick="deleteCourse('${c.id}')">Delete</button></td>
            </tr>`).join('') : `<tr><td colspan="5" class="empty-msg">No courses yet</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveCourse() {
  const user = Auth.currentUser();
  DB.saveCourse({
    schoolId: user.schoolId,
    name: document.getElementById('cName').value,
    code: document.getElementById('cCode').value,
    deptId: document.getElementById('cDept').value || null,
    duration: parseInt(document.getElementById('cDur').value) || 1,
    durationUnit: document.getElementById('cDurUnit').value,
    level: document.getElementById('cLevel').value,
    medium: document.getElementById('cMedium').value
  });
  Router.navigate('/departments?tab=courses');
}
function deleteCourse(id) {
  if (!confirm('Delete course?')) return;
  DB.deleteRow('courses', id);
  Router.navigate('/departments?tab=courses');
}
