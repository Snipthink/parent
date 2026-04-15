Router.register('/results', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const exams = sid ? DB.getAll('exams', sid) : [];
  const selectedExamId = query.examId || (exams[0]?.id || '');

  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.results">Results</h2></div>
  <div class="form-card" style="margin-bottom:20px">
    <div class="form-row">
      <div class="form-group"><label>Select Exam</label>
        <select class="form-control" id="resExam" onchange="Router.navigate('/results?examId='+this.value)">
          <option value="">-- Select Exam --</option>
          ${exams.map(e=>`<option value="${e.id}" ${e.id===selectedExamId?'selected':''}>${e.name}</option>`).join('')}
        </select></div>
    </div>
  </div>
  <div id="result-sheet"></div>`;

  if (selectedExamId) loadResultSheet(selectedExamId);
  I18N.apply(view);
});

function loadResultSheet(examId) {
  const user = Auth.currentUser();
  const exam = DB.getById('exams', examId);
  if (!exam) return;
  const students = exam.classId
    ? DB.getStudents(user.schoolId, { classId: exam.classId, sectionId: exam.sectionId||undefined })
    : DB.getStudents(user.schoolId);
  const existing = DB.all('SELECT * FROM results WHERE examId=?',[examId]);
  const resMap = {};
  existing.forEach(r => resMap[r.studentId] = r);

  document.getElementById('result-sheet').innerHTML = `
  <div class="form-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3>${exam.name} — Max: ${exam.maxMarks} | Pass: ${exam.passingMarks}</h3>
      <div>
        <button class="btn-sm-primary" onclick="saveAllResults('${examId}')">💾 Save All</button>
        <button class="btn-outline btn-sm" onclick="printResultSheet('${examId}')">🖨 Print</button>
      </div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table" id="resultTable">
        <thead><tr><th>#</th><th>Name</th><th>FTPEN/ID</th><th>Marks</th><th>Grade</th><th>Remarks</th><th>Status</th></tr></thead>
        <tbody>
          ${students.map((s,i)=>{
            const r = resMap[s.id];
            return `<tr id="res-row-${s.id}">
              <td>${i+1}</td>
              <td>${s.name}</td>
              <td>${s.ftpen||s.admissionNo||'-'}</td>
              <td><input class="form-control res-marks" type="number" min="0" max="${exam.maxMarks}"
                   id="marks_${s.id}" value="${r?.marksObtained??''}" placeholder="0-${exam.maxMarks}"
                   oninput="autoGrade('${s.id}',${exam.maxMarks},${exam.passingMarks})"></td>
              <td><span id="grade_${s.id}" class="grade-badge">${r?.grade||'-'}</span></td>
              <td><input class="form-control" id="remark_${s.id}" value="${r?.remarks||''}" placeholder="Optional"></td>
              <td><span class="status-badge" id="rstatus_${s.id}" class="${getResultStatus(r?.marksObtained,exam.passingMarks)}">
                ${r ? (r.marksObtained>=exam.passingMarks?'Pass':'Fail') : '-'}
              </span></td>
            </tr>`;
          }).join('') || '<tr><td colspan="7" class="empty-msg">No students</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>`;
}

function getResultStatus(marks, passing) {
  if (marks === null || marks === undefined || marks === '') return '';
  return parseFloat(marks) >= parseFloat(passing) ? 'status-approved' : 'status-rejected';
}

function autoGrade(studentId, maxMarks, passingMarks) {
  const marks = parseFloat(document.getElementById('marks_'+studentId).value);
  if (isNaN(marks)) return;
  const pct = (marks / maxMarks) * 100;
  let grade = 'F';
  if (pct >= 90) grade = 'A+';
  else if (pct >= 80) grade = 'A';
  else if (pct >= 70) grade = 'B+';
  else if (pct >= 60) grade = 'B';
  else if (pct >= 50) grade = 'C';
  else if (pct >= 33) grade = 'D';
  document.getElementById('grade_'+studentId).textContent = grade;
  const statusEl = document.getElementById('rstatus_'+studentId);
  statusEl.textContent = marks >= passingMarks ? 'Pass' : 'Fail';
  statusEl.className   = 'status-badge ' + (marks >= passingMarks ? 'status-approved' : 'status-rejected');
}

function saveAllResults(examId) {
  const user = Auth.currentUser();
  const exam = DB.getById('exams', examId);
  const rows = document.querySelectorAll('[id^="marks_"]');
  rows.forEach(inp => {
    const studentId = inp.id.replace('marks_','');
    const marks = parseFloat(inp.value);
    if (isNaN(marks)) return;
    const grade   = document.getElementById('grade_'+studentId)?.textContent || '-';
    const remarks = document.getElementById('remark_'+studentId)?.value || '';
    const existing = DB.first('SELECT id FROM results WHERE examId=? AND studentId=?',[examId,studentId]);
    if (existing) {
      DB.saveResult({ id: existing.id, examId, studentId, schoolId: user.schoolId, marksObtained: marks, grade, remarks });
    } else {
      DB.saveResult({ examId, studentId, schoolId: user.schoolId, marksObtained: marks, grade, remarks });
    }
  });
  showToast('Results saved');
}

function printResultSheet(examId) {
  const user = Auth.currentUser();
  const school = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const exam = DB.getById('exams', examId);
  const klass = exam?.classId ? DB.getById('classes', exam.classId) : null;
  const results = DB.all(`
    SELECT s.name, s.ftpen, s.admissionNo, r.marksObtained, r.grade, r.remarks
    FROM results r JOIN students s ON r.studentId=s.id
    WHERE r.examId=? ORDER BY r.marksObtained DESC`,[examId]);
  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Result Sheet</title>
  <style>body{font-family:Arial,sans-serif;padding:20px}h2,h3{text-align:center}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th,td{border:1px solid #ddd;padding:8px 10px;text-align:center}
  th{background:#f5f5f5} @media print{button{display:none}}</style>
  </head><body>
  <h2>${school?.name||'School'}</h2>
  <h3>${exam?.name} — ${klass?.name||'All Classes'}</h3>
  <p style="text-align:center">Max Marks: ${exam?.maxMarks} | Pass: ${exam?.passingMarks}</p>
  <table><thead><tr><th>#</th><th>Name</th><th>ID/FTPEN</th><th>Marks</th><th>%</th><th>Grade</th><th>Status</th><th>Remarks</th></tr></thead>
  <tbody>
    ${results.map((r,i)=>`
      <tr>
        <td>${i+1}</td><td>${r.name}</td>
        <td>${r.ftpen||r.admissionNo||'-'}</td>
        <td>${r.marksObtained}</td>
        <td>${((r.marksObtained/exam.maxMarks)*100).toFixed(1)}%</td>
        <td>${r.grade||'-'}</td>
        <td>${r.marksObtained>=exam.passingMarks?'Pass':'Fail'}</td>
        <td>${r.remarks||'-'}</td>
      </tr>`).join('')}
  </tbody></table>
  <button onclick="window.print()" style="margin-top:16px">Print</button>
  </body></html>`);
  win.document.close();
}
