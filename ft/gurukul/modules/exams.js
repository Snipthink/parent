Router.register('/exams', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const exams = sid ? DB.getAll('exams', sid) : [];
  const classes = sid ? DB.getAll('classes', sid) : [];
  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.exams">Exams</h2>
    <button class="btn-primary" onclick="openExamForm()">+ Schedule Exam</button>
  </div>
  <div id="exam-form-container"></div>
  <div class="data-table-wrap">
    <table class="data-table" id="examTable">
      <thead><tr><th>Name</th><th>Type</th><th>Class</th><th>Start</th><th>End</th><th>Max Marks</th><th>Actions</th></tr></thead>
      <tbody>
        ${exams.length ? exams.map(e=>{
          const cl = e.classId ? DB.getById('classes',e.classId) : null;
          return `<tr>
            <td>${e.name}</td>
            <td><span class="exam-type-badge etype-${e.type}">${e.type}</span></td>
            <td>${cl?.name||'-'}</td>
            <td>${e.startDate||'-'}</td><td>${e.endDate||'-'}</td>
            <td>${e.maxMarks}</td>
            <td>
              <button class="btn-sm-primary" onclick="Router.navigate('/results?examId=${e.id}')">Results</button>
              <button class="btn-sm-danger"  onclick="deleteExam('${e.id}')">Delete</button>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="7" class="empty-msg">No exams scheduled</td></tr>`}
      </tbody>
    </table>
  </div>`;
  I18N.apply(view);
});

function openExamForm() {
  const user = Auth.currentUser();
  const sid = user.schoolId;
  const classes = sid ? DB.getAll('classes', sid) : [];
  const subjects = sid ? DB.getAll('subjects', sid) : [];
  document.getElementById('exam-form-container').innerHTML = `
  <div class="form-card" style="margin-bottom:20px">
    <h3>Schedule Exam</h3>
    <div class="form-row">
      <div class="form-group"><label>Exam Name *</label>
        <input class="form-control" id="eName" placeholder="e.g. Mid-Term 2025"></div>
      <div class="form-group"><label>Type</label>
        <select class="form-control" id="eType">
          <option value="classtest">Class Test</option>
          <option value="midterm">Mid-Term</option>
          <option value="final">Final Exam</option>
          <option value="unitTest">Unit Test</option>
          <option value="practical">Practical</option>
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Class</label>
        <select class="form-control" id="eClass" onchange="loadExamSections()">
          <option value="">-- All Classes --</option>
          ${classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Section</label>
        <select class="form-control" id="eSection">
          <option value="">-- All Sections --</option>
        </select></div>
    </div>
    <div class="form-group"><label>Subject (optional)</label>
      <select class="form-control" id="eSubject">
        <option value="">-- All Subjects --</option>
        ${subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
      </select></div>
    <div class="form-row">
      <div class="form-group"><label>Start Date</label>
        <input class="form-control" type="date" id="eStart"></div>
      <div class="form-group"><label>End Date</label>
        <input class="form-control" type="date" id="eEnd"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Max Marks</label>
        <input class="form-control" type="number" id="eMax" value="100"></div>
      <div class="form-group"><label>Passing Marks</label>
        <input class="form-control" type="number" id="ePass" value="33"></div>
    </div>
    <div style="margin-top:12px;display:flex;gap:10px">
      <button class="btn-primary" onclick="saveExam_()">Schedule</button>
      <button class="btn-outline" onclick="document.getElementById('exam-form-container').innerHTML=''">Cancel</button>
    </div>
  </div>`;
}

function loadExamSections() {
  const classId = document.getElementById('eClass').value;
  const sel = document.getElementById('eSection');
  const sections = classId ? DB.all('SELECT * FROM sections WHERE classId=?',[classId]) : [];
  sel.innerHTML = '<option value="">-- All Sections --</option>' +
    sections.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function saveExam_() {
  const user = Auth.currentUser();
  const name = document.getElementById('eName').value.trim();
  if (!name) { showToast('Exam name required'); return; }
  const exam = DB.saveExam({
    schoolId: user.schoolId,
    name, type: document.getElementById('eType').value,
    classId: document.getElementById('eClass').value||null,
    sectionId: document.getElementById('eSection').value||null,
    subjectId: document.getElementById('eSubject').value||null,
    startDate: document.getElementById('eStart').value,
    endDate:   document.getElementById('eEnd').value,
    maxMarks:  parseFloat(document.getElementById('eMax').value)||100,
    passingMarks: parseFloat(document.getElementById('ePass').value)||33
  });
  // Auto-notify students about new exam
  if (typeof notifyStudents === 'function') {
    const sDate = document.getElementById('eStart').value;
    notifyStudents(user.schoolId, document.getElementById('eSection').value||null, {
      type: 'exam',
      title: `📝 Exam Scheduled: ${name}`,
      body: `${document.getElementById('eType').value} starting ${sDate}. Max marks: ${document.getElementById('eMax').value}`,
      sourceModule: 'exams', sourceId: exam?.id
    });
    if (typeof refreshNotifCount === 'function') refreshNotifCount();
  }
  showToast('Exam scheduled', 'success');
  Router.navigate('/exams');
}

function deleteExam(id) {
  if (!confirm('Delete exam and all its results?')) return;
  DB.run('DELETE FROM results WHERE examId=?',[id]);
  DB.deleteRow('exams', id);
  Router.navigate('/exams');
}
