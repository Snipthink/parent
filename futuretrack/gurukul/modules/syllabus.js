Router.register('/syllabus', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const classes  = sid ? DB.getAll('classes', sid) : [];
  const subjects = sid ? DB.getAll('subjects', sid) : [];
  const tab = query.tab || 'subjects';

  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.syllabus">Syllabus & Subjects</h2></div>
  <div class="tab-bar">
    <button class="tab-btn ${tab==='subjects'?'active':''}" onclick="Router.navigate('/syllabus?tab=subjects')">Subjects</button>
    <button class="tab-btn ${tab==='syllabus'?'active':''}" onclick="Router.navigate('/syllabus?tab=syllabus')">Syllabus Planner</button>
  </div>
  <div id="syl-tab"></div>`;

  if (tab === 'subjects') renderSubjectsTab(sid, classes, subjects);
  else renderSyllabusTab(sid, classes, subjects);
  I18N.apply(view);
});

function renderSubjectsTab(sid, classes, subjects) {
  const c = document.getElementById('syl-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Subject</h3>
      <div class="form-group"><label>Name *</label>
        <input class="form-control" id="subName" placeholder="e.g. Mathematics"></div>
      <div class="form-group"><label>Code</label>
        <input class="form-control" id="subCode" placeholder="MATH"></div>
      <div class="form-group"><label>Class</label>
        <select class="form-control" id="subClass">
          <option value="">-- All Classes --</option>
          ${classes.map(cl=>`<option value="${cl.id}">${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Medium</label>
        <select class="form-control" id="subMedium">
          <option>English</option><option>Hindi</option><option>Both</option>
        </select></div>
      <button class="btn-primary" onclick="saveSubject_()">Add Subject</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Code</th><th>Class</th><th>Medium</th><th>Actions</th></tr></thead>
        <tbody>
          ${subjects.length ? subjects.map(s=>{
            const cl = s.classId ? DB.getById('classes',s.classId) : null;
            return `<tr>
              <td>${s.name}</td><td>${s.code||'-'}</td>
              <td>${cl?.name||'All'}</td><td>${s.medium||'-'}</td>
              <td><button class="btn-sm-danger" onclick="deleteSubject('${s.id}')">Delete</button></td>
            </tr>`;
          }).join('') : `<tr><td colspan="5" class="empty-msg">No subjects yet</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveSubject_() {
  const user = Auth.currentUser();
  DB.saveSubject({ schoolId: user.schoolId,
    name: document.getElementById('subName').value,
    code: document.getElementById('subCode').value,
    classId: document.getElementById('subClass').value||null,
    medium: document.getElementById('subMedium').value });
  Router.navigate('/syllabus?tab=subjects');
}
function deleteSubject(id) {
  DB.deleteRow('subjects', id);
  Router.navigate('/syllabus?tab=subjects');
}

function renderSyllabusTab(sid, classes, subjects) {
  const classId = classes[0]?.id;
  const syllabus = classId ? DB.all('SELECT * FROM syllabus WHERE classId=? ORDER BY createdAt',[classId]) : [];
  const c = document.getElementById('syl-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Plan Syllabus Unit</h3>
      <div class="form-group"><label>Class</label>
        <select class="form-control" id="sylClass">
          ${classes.map(cl=>`<option value="${cl.id}">${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Subject</label>
        <select class="form-control" id="sylSubject">
          <option value="">-- Select --</option>
          ${subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Unit / Chapter</label>
        <input class="form-control" id="sylUnit" placeholder="e.g. Unit 1"></div>
      <div class="form-group"><label>Topic</label>
        <input class="form-control" id="sylTopic" placeholder="e.g. Fractions"></div>
      <div class="form-group"><label>Description</label>
        <textarea class="form-control" id="sylDesc" rows="2"></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Planned Date</label>
          <input class="form-control" type="date" id="sylPlanned"></div>
        <div class="form-group"><label>Completed Date</label>
          <input class="form-control" type="date" id="sylCompleted"></div>
      </div>
      <button class="btn-primary" onclick="saveSyllabus_()">Add Topic</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Unit</th><th>Topic</th><th>Planned</th><th>Completed</th><th>Status</th><th>×</th></tr></thead>
        <tbody>
          ${syllabus.length ? syllabus.map(s=>`
            <tr>
              <td>${s.unit||'-'}</td><td>${s.topic}</td>
              <td>${s.plannedDate||'-'}</td>
              <td>${s.completedDate||'—'}</td>
              <td><span class="badge ${s.completedDate?'badge-green':'badge-gray'}">${s.completedDate?'Done':'Pending'}</span></td>
              <td><button class="btn-sm-danger" onclick="deleteSyllabus('${s.id}')">×</button></td>
            </tr>`).join('') : `<tr><td colspan="6" class="empty-msg">No syllabus yet</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveSyllabus_() {
  const user = Auth.currentUser();
  DB.saveSyllabus({
    schoolId: user.schoolId,
    classId: document.getElementById('sylClass').value,
    subjectId: document.getElementById('sylSubject').value||null,
    unit: document.getElementById('sylUnit').value,
    topic: document.getElementById('sylTopic').value,
    description: document.getElementById('sylDesc').value,
    plannedDate: document.getElementById('sylPlanned').value||null,
    completedDate: document.getElementById('sylCompleted').value||null
  });
  Router.navigate('/syllabus?tab=syllabus');
}
function deleteSyllabus(id) {
  DB.deleteRow('syllabus', id);
  Router.navigate('/syllabus?tab=syllabus');
}
