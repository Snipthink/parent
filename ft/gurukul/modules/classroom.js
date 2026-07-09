Router.register('/classroom', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const tab = query.tab || 'classes';

  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.classroom">Classroom Management</h2></div>
  <div class="tab-bar">
    ${['classes','sections','timetable','calendar'].map(t=>`
      <button class="tab-btn ${tab===t?'active':''}"
        onclick="Router.navigate('/classroom?tab=${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')}
  </div>
  <div id="cls-tab"></div>`;

  const fns = { classes: renderClassesTab, sections: renderSectionsTab, timetable: renderTimetableTab, calendar: renderCalendarTab };
  (fns[tab] || renderClassesTab)(sid, user);
  I18N.apply(view);
});

// ── Classes ───────────────────────────────────────────────────────
function renderClassesTab(sid) {
  const classes  = sid ? DB.getAll('classes', sid) : [];
  const courses  = sid ? DB.getAll('courses', sid) : [];
  const c = document.getElementById('cls-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Class / Grade</h3>
      <div class="form-group"><label>Class Name *</label>
        <input class="form-control" id="clName" placeholder="e.g. Class 6 / Grade 10"></div>
      <div class="form-group"><label>Grade / Standard</label>
        <input class="form-control" id="clGrade" placeholder="e.g. VI, 10, Nursery"></div>
      <div class="form-group"><label>Course / Program</label>
        <select class="form-control" id="clCourse">
          <option value="">-- None --</option>
          ${courses.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Order (for sorting)</label>
        <input class="form-control" type="number" id="clOrder" value="${classes.length+1}"></div>
      <button class="btn-primary" onclick="saveClass_()">Add Class</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Name</th><th>Grade</th><th>Sections</th><th>Actions</th></tr></thead>
        <tbody>
          ${classes.length ? classes.sort((a,b)=>(a.order_||0)-(b.order_||0)).map(cl=>{
            const secCount = DB.all('SELECT COUNT(*) as n FROM sections WHERE classId=?',[cl.id])[0]?.n||0;
            return `<tr>
              <td>${cl.order_||'-'}</td><td>${cl.name}</td><td>${cl.grade||'-'}</td>
              <td><span class="badge">${secCount}</span></td>
              <td>
                <button class="btn-sm-primary" onclick="Router.navigate('/classroom?tab=sections&classId=${cl.id}')">Sections</button>
                <button class="btn-sm-danger" onclick="deleteClass_('${cl.id}')">Delete</button>
              </td></tr>`;
          }).join('') : `<tr><td colspan="5" class="empty-msg">No classes yet</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}
function saveClass_() {
  const user = Auth.currentUser();
  DB.saveClass({ schoolId: user.schoolId, name: document.getElementById('clName').value,
    grade: document.getElementById('clGrade').value,
    courseId: document.getElementById('clCourse').value || null,
    order_: parseInt(document.getElementById('clOrder').value)||1 });
  Router.navigate('/classroom?tab=classes');
}
function deleteClass_(id) {
  if (!confirm('Delete class? Sections inside will also be removed.')) return;
  DB.deleteRow('classes', id);
  Router.navigate('/classroom?tab=classes');
}

// ── Sections ──────────────────────────────────────────────────────
function renderSectionsTab(sid, user, classIdFilter) {
  const classes = sid ? DB.getAll('classes', sid) : [];
  const staff = sid ? DB.getAll('staff', sid) : [];
  const selectedClass = classIdFilter || (classes[0]?.id || '');
  const sections = selectedClass
    ? DB.all('SELECT * FROM sections WHERE classId=?',[selectedClass])
    : [];
  const c = document.getElementById('cls-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Section</h3>
      <div class="form-group"><label>Class</label>
        <select class="form-control" id="secClass" onchange="Router.navigate('/classroom?tab=sections&classId='+this.value)">
          ${classes.map(cl=>`<option value="${cl.id}" ${cl.id===selectedClass?'selected':''}>${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Section Name *</label>
        <input class="form-control" id="secName" placeholder="e.g. A, B, Red"></div>
      <div class="form-group"><label>Room No</label>
        <input class="form-control" id="secRoom" placeholder="101"></div>
      <div class="form-group"><label>Capacity</label>
        <input class="form-control" type="number" id="secCap" value="40"></div>
      <div class="form-group"><label>Class Teacher</label>
        <select class="form-control" id="secTeacher">
          <option value="">-- None --</option>
          ${staff.filter(s=>s.role==='teacher'||s.designation?.toLowerCase().includes('teacher'))
            .map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
        </select></div>
      <button class="btn-primary" onclick="saveSection_(${JSON.stringify(selectedClass)})">Add Section</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Section</th><th>Room</th><th>Capacity</th><th>Class Teacher</th><th>Students</th><th>Actions</th></tr></thead>
        <tbody>
          ${sections.length ? sections.map(s=>{
            const ct = s.classTeacherId ? DB.getById('staff',s.classTeacherId) : null;
            const studs = DB.all('SELECT COUNT(*) as n FROM students WHERE sectionId=?',[s.id])[0]?.n||0;
            return `<tr>
              <td>${s.name}</td><td>${s.roomNo||'-'}</td><td>${s.capacity||'-'}</td>
              <td>${ct?.name||'-'}</td><td><span class="badge">${studs}</span></td>
              <td><button class="btn-sm-danger" onclick="deleteSection_('${s.id}')">Delete</button></td>
            </tr>`;
          }).join('') : `<tr><td colspan="6" class="empty-msg">No sections</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveSection_(classId) {
  const user = Auth.currentUser();
  DB.saveSection({ classId, schoolId: user.schoolId,
    name: document.getElementById('secName').value,
    roomNo: document.getElementById('secRoom').value,
    capacity: parseInt(document.getElementById('secCap').value)||40,
    classTeacherId: document.getElementById('secTeacher').value||null });
  Router.navigate('/classroom?tab=sections&classId='+classId);
}
function deleteSection_(id) {
  if (!confirm('Delete section?')) return;
  DB.deleteRow('sections', id);
  Router.navigate('/classroom?tab=sections');
}

// ── Timetable ─────────────────────────────────────────────────────
function renderTimetableTab(sid) {
  const classes  = sid ? DB.getAll('classes', sid) : [];
  const subjects = sid ? DB.getAll('subjects', sid) : [];
  const staff    = sid ? DB.getAll('staff', sid) : [];
  const days     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const c = document.getElementById('cls-tab');
  c.innerHTML = `
  <div class="form-card">
    <h3>Add Timetable Entry</h3>
    <div class="form-row">
      <div class="form-group"><label>Class</label>
        <select class="form-control" id="ttClass" onchange="loadSectionsForTT()">
          ${classes.map(cl=>`<option value="${cl.id}">${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Section</label>
        <select class="form-control" id="ttSection"></select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Day</label>
        <select class="form-control" id="ttDay">
          ${days.map((d,i)=>`<option value="${i+1}">${d}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Type</label>
        <select class="form-control" id="ttType">
          <option value="class">Class</option>
          <option value="break">Break</option>
          <option value="lunch">Lunch</option>
          <option value="activity">Activity</option>
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Time</label>
        <input class="form-control" type="time" id="ttStart" value="09:00"></div>
      <div class="form-group"><label>End Time</label>
        <input class="form-control" type="time" id="ttEnd" value="09:45"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Subject</label>
        <select class="form-control" id="ttSubject">
          <option value="">-- None --</option>
          ${subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Teacher</label>
        <select class="form-control" id="ttTeacher">
          <option value="">-- None --</option>
          ${staff.filter(s=>s.role==='teacher'||s.designation?.toLowerCase().includes('teacher'))
            .map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
        </select></div>
    </div>
    <button class="btn-primary" onclick="saveTT()">Add Entry</button>
  </div>
  <div id="tt-view" style="margin-top:20px"></div>`;

  if (classes.length) loadSectionsForTT();
}

function loadSectionsForTT() {
  const classId = document.getElementById('ttClass')?.value;
  if (!classId) return;
  const sections = DB.all('SELECT * FROM sections WHERE classId=?',[classId]);
  const sel = document.getElementById('ttSection');
  if (sel) { sel.innerHTML = sections.map(s=>`<option value="${s.id}">${s.name}</option>`).join(''); }
}

function saveTT() {
  const user = Auth.currentUser();
  DB.saveTimetable({
    sectionId: document.getElementById('ttSection').value,
    schoolId: user.schoolId,
    dayOfWeek: parseInt(document.getElementById('ttDay').value),
    subjectId: document.getElementById('ttSubject').value||null,
    teacherId: document.getElementById('ttTeacher').value||null,
    startTime: document.getElementById('ttStart').value,
    endTime:   document.getElementById('ttEnd').value,
    type:      document.getElementById('ttType').value
  });
  showToast('Timetable entry added');
}

// ── Calendar ──────────────────────────────────────────────────────
function renderCalendarTab(sid) {
  const events = sid ? DB.getAll('calendar', sid) : [];
  const c = document.getElementById('cls-tab');
  const types = ['holiday','exam','midterm','final','classtest','event','other'];
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Calendar Event</h3>
      <div class="form-group"><label>Title *</label>
        <input class="form-control" id="calTitle" placeholder="e.g. Diwali Holiday"></div>
      <div class="form-row">
        <div class="form-group"><label>Date *</label>
          <input class="form-control" type="date" id="calDate"></div>
        <div class="form-group"><label>Type</label>
          <select class="form-control" id="calType">
            ${types.map(t=>`<option value="${t}">${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-group"><label>Description</label>
        <textarea class="form-control" id="calDesc" rows="2"></textarea></div>
      <button class="btn-primary" onclick="saveCalEvent()">Add Event</button>
    </div>
    <div class="calendar-list">
      ${events.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e=>`
        <div class="cal-event cal-${e.type}">
          <span class="cal-date">${e.date}</span>
          <span class="cal-title">${e.title}</span>
          <span class="cal-type-badge">${e.type}</span>
          <button class="btn-sm-danger" onclick="deleteCalEvent('${e.id}')">×</button>
        </div>`).join('') || '<p class="empty-msg">No events yet</p>'}
    </div>
  </div>`;
}

function saveCalEvent() {
  const user = Auth.currentUser();
  DB.saveCalendar({
    schoolId: user.schoolId,
    title: document.getElementById('calTitle').value,
    date:  document.getElementById('calDate').value,
    type:  document.getElementById('calType').value,
    description: document.getElementById('calDesc').value
  });
  Router.navigate('/classroom?tab=calendar');
}
function deleteCalEvent(id) {
  DB.deleteRow('calendar', id);
  Router.navigate('/classroom?tab=calendar');
}
