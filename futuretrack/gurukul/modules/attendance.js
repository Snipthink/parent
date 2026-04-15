Router.register('/attendance', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const classes = sid ? DB.getAll('classes', sid) : [];
  const today = new Date().toISOString().slice(0,10);

  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.attendance">Attendance</h2></div>
  <div class="form-card" style="margin-bottom:20px">
    <div class="form-row">
      <div class="form-group"><label>Class</label>
        <select class="form-control" id="attClass" onchange="loadAttSections()">
          <option value="">-- Select Class --</option>
          ${classes.map(cl=>`<option value="${cl.id}">${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Section</label>
        <select class="form-control" id="attSection"></select></div>
      <div class="form-group"><label>Date</label>
        <input class="form-control" type="date" id="attDate" value="${today}"></div>
    </div>
    <button class="btn-primary" onclick="loadAttendanceSheet()">Load Sheet</button>
  </div>
  <div id="att-sheet"></div>`;
  I18N.apply(view);
});

function loadAttSections() {
  const classId = document.getElementById('attClass').value;
  const sel = document.getElementById('attSection');
  const sections = classId ? DB.all('SELECT * FROM sections WHERE classId=?',[classId]) : [];
  sel.innerHTML = sections.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function loadAttendanceSheet() {
  const user = Auth.currentUser();
  const sectionId = document.getElementById('attSection').value;
  const date = document.getElementById('attDate').value;
  if (!sectionId || !date) return;
  const students = DB.all('SELECT * FROM students WHERE sectionId=? ORDER BY name',[sectionId]);
  const existing = DB.all('SELECT * FROM attendance WHERE sectionId=? AND date=?',[sectionId,date]);
  const existMap = {};
  existing.forEach(a => existMap[a.studentId] = a.status);

  document.getElementById('att-sheet').innerHTML = `
  <div class="form-card">
    <div class="att-header">
      <h3>Attendance Sheet — ${date}</h3>
      <div class="att-bulk">
        <button class="btn-sm-primary" onclick="markAllAtt('present')">✅ All Present</button>
        <button class="btn-sm-danger"  onclick="markAllAtt('absent')">❌ All Absent</button>
      </div>
    </div>
    ${students.length ? `
    <table class="data-table" id="attTable">
      <thead><tr><th>#</th><th>Name</th><th>Roll/ID</th><th>Present</th><th>Absent</th><th>Late</th><th>Leave</th></tr></thead>
      <tbody>
        ${students.map((s,i)=>{
          const status = existMap[s.id] || 'present';
          return `<tr id="att-row-${s.id}">
            <td>${i+1}</td>
            <td>${s.name}</td>
            <td>${s.ftpen||s.admissionNo||'-'}</td>
            ${['present','absent','late','leave'].map(st=>`
              <td><input type="radio" name="att_${s.id}" value="${st}" ${status===st?'checked':''}></td>`).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <button class="btn-primary" style="margin-top:16px" onclick="submitAttendance('${sectionId}','${date}')">
      💾 Save Attendance
    </button>` : '<p class="empty-msg">No students in this section</p>'}
  </div>`;
}

function markAllAtt(status) {
  document.querySelectorAll('[name^="att_"]').forEach(r => { if (r.value === status) r.checked = true; });
}

function submitAttendance(sectionId, date) {
  const user = Auth.currentUser();
  const students = DB.all('SELECT id FROM students WHERE sectionId=?',[sectionId]);
  let absentCount = 0;
  students.forEach(s => {
    const radios = document.querySelectorAll(`[name="att_${s.id}"]`);
    let status = 'present';
    radios.forEach(r => { if (r.checked) status = r.value; });
    DB.run('DELETE FROM attendance WHERE studentId=? AND date=?',[s.id, date]);
    DB.saveAttendance({ schoolId: user.schoolId, sectionId, studentId: s.id, date, status, markedBy: user.id });
    if (status === 'absent') absentCount++;
  });
  // Notify students about attendance
  if (typeof notifyStudents === 'function' && students.length > 0) {
    notifyStudents(user.schoolId, sectionId, {
      type: 'attendance',
      title: `✅ Attendance marked for ${date}`,
      body: `${absentCount} absent out of ${students.length} students.`,
      sourceModule: 'attendance'
    });
    if (typeof refreshNotifCount === 'function') refreshNotifCount();
  }
  showToast('Attendance saved', 'success');
}
