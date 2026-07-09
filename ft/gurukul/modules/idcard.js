Router.register('/idcard', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const tab = query.tab || 'template';
  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.idcard">ID Card Generator</h2></div>
  <div class="tab-bar">
    ${['template','individual','bulk'].map(t=>`
      <button class="tab-btn ${tab===t?'active':''}"
        onclick="Router.navigate('/idcard?tab=${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')}
  </div>
  <div id="idc-tab"></div>`;

  if (tab==='template')   renderIDCTemplate(sid, user);
  else if (tab==='individual') renderIDCIndividual(sid, user);
  else renderIDCBulk(sid, user);
  I18N.apply(view);
});

// ── Template Designer ──────────────────────────────────────────────
function renderIDCTemplate(sid, user) {
  const templates = sid ? DB.getAll('idTemplates', sid) : [];
  const school = sid ? DB.getById('schools', sid) : null;
  const c = document.getElementById('idc-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>ID Card Template</h3>
      <div class="form-group"><label>Template Name</label>
        <input class="form-control" id="tplName" placeholder="e.g. Student ID 2025-26"></div>
      <div class="form-section-label">Card Dimensions</div>
      <div class="form-row">
        <div class="form-group"><label>Width</label>
          <input class="form-control" type="number" id="tplW" value="85.6" step="0.1"></div>
        <div class="form-group"><label>Height</label>
          <input class="form-control" type="number" id="tplH" value="54" step="0.1"></div>
        <div class="form-group"><label>Unit</label>
          <select class="form-control" id="tplUnit">
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="inch">inch</option>
          </select></div>
      </div>
      <p class="hint">📐 Standard CR80 card = 85.6 × 54 mm. Print front & back on A4 (fold or cut & stick)</p>
      <div class="form-section-label">Front Side Fields</div>
      <div class="form-group"><label>Header Text (School name auto-added)</label>
        <input class="form-control" id="tplFrontHeader" placeholder="e.g. IDENTITY CARD"></div>
      <div class="form-group"><label>Fields to show on front (check all that apply)</label>
        <div class="field-checklist" id="frontFields">
          ${['Student Name','Class','Section','Roll No','FTPEN','DOB','Blood Group','Valid Until'].map(f=>`
            <label class="check-item">
              <input type="checkbox" value="${f}" checked> ${f}
            </label>`).join('')}
        </div>
      </div>
      <div class="form-section-label">Back Side Fields</div>
      <div class="form-group"><label>Fields to show on back</label>
        <div class="field-checklist" id="backFields">
          ${['Father Name','Mother Name','Phone','Address','School Address','Emergency Contact','Terms & Rules'].map(f=>`
            <label class="check-item">
              <input type="checkbox" value="${f}" checked> ${f}
            </label>`).join('')}
        </div>
      </div>
      <div class="form-section-label">Design Options</div>
      <div class="form-row">
        <div class="form-group"><label>Background Color</label>
          <input type="color" class="form-control color-inp" id="tplBgColor" value="#0c1628"></div>
        <div class="form-group"><label>Accent Color</label>
          <input type="color" class="form-control color-inp" id="tplAccent" value="#46d5f9"></div>
        <div class="form-group"><label>Text Color</label>
          <input type="color" class="form-control color-inp" id="tplTextColor" value="#ffffff"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Photo Shape</label>
          <select class="form-control" id="tplPhotoShape">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded Rectangle</option>
          </select></div>
        <div class="form-group"><label>Logo Shape</label>
          <select class="form-control" id="tplLogoShape">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
          </select></div>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="tplLocked"> 🔒 Lock template (no further edits after saving)</label>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px">
        <button class="btn-primary" onclick="saveIDTemplate_()">💾 Save Template</button>
        <button class="btn-outline"  onclick="previewIDCard()">👁 Preview</button>
      </div>
    </div>
    <div>
      <div class="form-card">
        <h3>Saved Templates</h3>
        ${templates.length ? templates.map(t=>`
          <div class="template-item ${t.locked?'locked':''}">
            <div>
              <strong>${t.name}</strong>
              <span>${t.widthMm}×${t.heightMm}mm</span>
              ${t.locked?'<span class="badge badge-red">Locked</span>':''}
            </div>
            <div>
              <button class="btn-sm-primary" onclick="loadTemplate('${t.id}')">Load</button>
              ${!t.locked?`<button class="btn-sm-danger" onclick="deleteIDTemplate('${t.id}')">Delete</button>`:''}
            </div>
          </div>`).join('')
          : '<p class="empty-msg">No templates yet</p>'}
      </div>
      <div id="idc-preview" class="idc-preview-area"></div>
    </div>
  </div>`;
}

function saveIDTemplate_() {
  const user = Auth.currentUser();
  const frontChecked = [...document.querySelectorAll('#frontFields input:checked')].map(i=>i.value);
  const backChecked  = [...document.querySelectorAll('#backFields input:checked')].map(i=>i.value);
  const frontLayout = JSON.stringify({
    header: document.getElementById('tplFrontHeader').value,
    fields: frontChecked,
    bgColor: document.getElementById('tplBgColor').value,
    accentColor: document.getElementById('tplAccent').value,
    textColor: document.getElementById('tplTextColor').value,
    photoShape: document.getElementById('tplPhotoShape').value,
    logoShape: document.getElementById('tplLogoShape').value
  });
  const backLayout = JSON.stringify({ fields: backChecked });
  const unit = document.getElementById('tplUnit').value;
  const toMm = { mm:1, cm:10, inch:25.4 };
  const factor = toMm[unit]||1;
  const w = parseFloat(document.getElementById('tplW').value) * factor;
  const h = parseFloat(document.getElementById('tplH').value) * factor;
  DB.saveIDTemplate({
    schoolId: user.schoolId,
    name: document.getElementById('tplName').value || 'Student ID',
    widthMm: w, heightMm: h,
    frontLayout, backLayout,
    locked: document.getElementById('tplLocked').checked ? 1 : 0
  });
  showToast('Template saved');
  Router.navigate('/idcard?tab=template');
}

function loadTemplate(id) {
  const t = DB.getById('idTemplates', id);
  if (!t) return;
  if (t.locked) { showToast('Template is locked'); return; }
  const fl = JSON.parse(t.frontLayout||'{}');
  document.getElementById('tplName').value = t.name;
  document.getElementById('tplW').value = t.widthMm;
  document.getElementById('tplH').value = t.heightMm;
  document.getElementById('tplUnit').value = 'mm';
  document.getElementById('tplFrontHeader').value = fl.header||'';
  if (fl.bgColor)    document.getElementById('tplBgColor').value = fl.bgColor;
  if (fl.accentColor) document.getElementById('tplAccent').value = fl.accentColor;
  if (fl.textColor)  document.getElementById('tplTextColor').value = fl.textColor;
  if (fl.photoShape) document.getElementById('tplPhotoShape').value = fl.photoShape;
  if (fl.logoShape)  document.getElementById('tplLogoShape').value = fl.logoShape;
  (fl.fields||[]).forEach(f => {
    const cb = [...document.querySelectorAll('#frontFields input')].find(i=>i.value===f);
    if (cb) cb.checked = true;
  });
  previewIDCard();
}

function deleteIDTemplate(id) {
  if (!confirm('Delete template?')) return;
  DB.deleteRow('idTemplates', id);
  Router.navigate('/idcard?tab=template');
}

function previewIDCard() {
  const user = Auth.currentUser();
  const school = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const fl = {
    header: document.getElementById('tplFrontHeader')?.value || 'IDENTITY CARD',
    bgColor: document.getElementById('tplBgColor')?.value || '#0c1628',
    accentColor: document.getElementById('tplAccent')?.value || '#46d5f9',
    textColor: document.getElementById('tplTextColor')?.value || '#fff',
    photoShape: document.getElementById('tplPhotoShape')?.value || 'circle'
  };
  const container = document.getElementById('idc-preview');
  if (!container) return;
  const shapeCSS = { circle:'border-radius:50%', square:'border-radius:0', rounded:'border-radius:8px' };
  container.innerHTML = `
  <h4>Preview</h4>
  <div class="id-card-preview" style="background:${fl.bgColor};color:${fl.textColor};border:2px solid ${fl.accentColor}">
    <div class="icp-header" style="background:${fl.accentColor};color:#000">
      ${school?.logo?`<img src="${school.logo}" style="height:28px;${shapeCSS[fl.photoShape]||''}">`:
        `<div style="font-size:20px">🎓</div>`}
      <div>
        <div style="font-weight:700;font-size:11px">${school?.name||'School Name'}</div>
        <div style="font-size:9px">${fl.header}</div>
      </div>
    </div>
    <div class="icp-body">
      <div class="icp-photo" style="${shapeCSS[fl.photoShape]||'border-radius:50%'}">Photo</div>
      <div class="icp-details">
        <div class="icp-name">Student Name</div>
        <div class="icp-field">Class: VII-A</div>
        <div class="icp-field">FTPEN: FT00001</div>
        <div class="icp-field">DOB: 01/01/2012</div>
        <div class="icp-field" style="color:${fl.accentColor}">Blood: O+</div>
      </div>
    </div>
    <div class="icp-footer" style="border-top:1px solid ${fl.accentColor}">
      <div style="font-size:7px">Valid: 2025-2026</div>
      <div class="icp-sig">Principal</div>
    </div>
  </div>
  <p class="hint" style="margin-top:8px">📄 Front & Back will print on A4. Fold or cut & stick the back on reverse.</p>`;
}

// ── Individual ID Card ─────────────────────────────────────────────
function renderIDCIndividual(sid, user) {
  const students  = sid ? DB.getStudents(sid) : [];
  const templates = sid ? DB.getAll('idTemplates', sid) : [];
  const c = document.getElementById('idc-tab');
  c.innerHTML = `
  <div class="form-card">
    <h3>Generate Individual ID Card</h3>
    <div class="form-row">
      <div class="form-group"><label>Template</label>
        <select class="form-control" id="idcTpl">
          ${templates.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Student</label>
        <select class="form-control" id="idcStudent">
          <option value="">-- Select Student --</option>
          ${students.map(s=>`<option value="${s.id}">${s.name} (${s.ftpen||s.admissionNo||s.id})</option>`).join('')}
        </select></div>
    </div>
    <div class="id-tools">
      <div class="form-group"><label>Image Brightness</label>
        <input type="range" id="idcBrightness" min="0.5" max="2" step="0.05" value="1" oninput="updateIDCardPreview()"></div>
      <div class="form-group"><label>Image Contrast</label>
        <input type="range" id="idcContrast" min="0.5" max="2" step="0.05" value="1" oninput="updateIDCardPreview()"></div>
    </div>
    <div style="margin-top:12px;display:flex;gap:10px">
      <button class="btn-primary" onclick="generateIndividualID()">👁 Preview & Generate</button>
    </div>
  </div>
  <div id="individual-id-preview" style="margin-top:20px"></div>`;
}

async function generateIndividualID() {
  const user = Auth.currentUser();
  const studentId = document.getElementById('idcStudent').value;
  const tplId     = document.getElementById('idcTpl').value;
  if (!studentId || !tplId) { showToast('Select template and student'); return; }
  const student  = DB.getById('students', studentId);
  const template = DB.getById('idTemplates', tplId);
  const school   = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const section  = student.sectionId ? DB.getById('sections', student.sectionId) : null;
  const klass    = student.classId   ? DB.getById('classes', student.classId) : null;
  const fl       = JSON.parse(template.frontLayout||'{}');
  const bl       = JSON.parse(template.backLayout||'{}');

  let photoSrc = null;
  if (student.photoKey) {
    const blob = await DB.getBlob(student.photoKey);
    if (blob) photoSrc = URL.createObjectURL(new Blob([blob]));
  }

  const brightness = document.getElementById('idcBrightness').value;
  const contrast   = document.getElementById('idcContrast').value;
  const shapeCSS   = { circle:'border-radius:50%', square:'', rounded:'border-radius:8px' };
  const pShape     = shapeCSS[fl.photoShape]||'border-radius:50%';

  const container = document.getElementById('individual-id-preview');
  container.innerHTML = `
  <div class="idc-print-sheet" id="idcPrintSheet">
    <!-- FRONT -->
    <div class="id-card-full" style="background:${fl.bgColor||'#0c1628'};color:${fl.textColor||'#fff'};border:2px solid ${fl.accentColor||'#46d5f9'}">
      <div class="icp-header" style="background:${fl.accentColor||'#46d5f9'};color:#000;padding:8px 12px;display:flex;align-items:center;gap:8px">
        ${school?.logo?`<img src="${school.logo}" style="height:32px;${pShape}">`:
          `<span style="font-size:24px">🎓</span>`}
        <div>
          <div style="font-weight:700;font-size:12px">${school?.name||'School'}</div>
          <div style="font-size:9px">${fl.header||'IDENTITY CARD'}</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;padding:10px">
        <div>
          <div class="icp-photo-full" style="${pShape};filter:brightness(${brightness}) contrast(${contrast})">
            ${photoSrc
              ? `<img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;${pShape}">`
              : '<div style="font-size:24px;text-align:center;line-height:70px">👤</div>'}
          </div>
        </div>
        <div style="flex:1;font-size:11px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${student.name}</div>
          <div>Class: ${klass?.name||'-'} ${section?'- Sec '+section.name:''}</div>
          ${student.ftpen?`<div>FTPEN: ${student.ftpen}</div>`:''}
          ${student.admissionNo?`<div>Adm No: ${student.admissionNo}</div>`:''}
          ${student.dob?`<div>DOB: ${student.dob}</div>`:''}
          ${student.bloodGroup?`<div style="color:${fl.accentColor||'#46d5f9'}">Blood: ${student.bloodGroup}</div>`:''}
        </div>
      </div>
      <div style="border-top:1px solid ${fl.accentColor||'#46d5f9'};padding:6px 12px;display:flex;justify-content:space-between;font-size:9px">
        <span>Valid: ${school?.id?DB.getSetting(school.id,'currentSession')||'2025-26':'2025-26'}</span>
        <span>Principal</span>
      </div>
    </div>
    <!-- BACK -->
    <div class="id-card-full id-card-back" style="background:${fl.bgColor||'#0c1628'};color:${fl.textColor||'#fff'};border:2px solid ${fl.accentColor||'#46d5f9'}">
      <div style="padding:10px 12px;font-size:11px">
        <div style="font-weight:700;font-size:12px;margin-bottom:8px;color:${fl.accentColor||'#46d5f9'}">${school?.name||'School'}</div>
        ${student.fatherName?`<div>Father: ${student.fatherName}</div>`:''}
        ${student.motherName?`<div>Mother: ${student.motherName}</div>`:''}
        ${student.phone?`<div>Phone: ${student.phone}</div>`:''}
        ${student.address?`<div>Address: ${student.address}</div>`:''}
        ${school?.phone?`<div>School: ${school.phone}</div>`:''}
        ${school?.address?`<div>${school.address}</div>`:''}
      </div>
      <div style="border-top:1px solid ${fl.accentColor||'#46d5f9'};padding:6px 12px;font-size:8px;color:#aaa">
        If found, please return to school office.
      </div>
    </div>
  </div>
  <div class="idc-actions">
    <button class="btn-primary" onclick="printIDCard()">🖨 Print</button>
    <button class="btn-outline"  onclick="downloadIDCardPDF()">⬇ Download PDF</button>
  </div>
  <div class="hint">📄 Front & Back will print on A4. Fold in half or cut and stick.</div>`;
}

function printIDCard() {
  const sheet = document.getElementById('idcPrintSheet');
  if (!sheet) return;
  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>ID Card</title>
  <style>
    body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#fff}
    .idc-print-sheet{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
    .id-card-full{width:85.6mm;min-height:54mm;border-radius:4px;overflow:hidden;page-break-inside:avoid}
    .icp-photo-full{width:70px;height:70px;overflow:hidden;background:#555;flex-shrink:0}
    @media print{body{padding:0}button{display:none}}
  </style></head><body>
  ${sheet.outerHTML}
  <button onclick="window.print()">Print</button>
  </body></html>`);
  win.document.close();
}

async function downloadIDCardPDF() {
  if (!window.jspdf) { showToast('PDF library loading...'); return; }
  // Use html2canvas + jsPDF
  showToast('Generating PDF...');
}

// ── Bulk ID Cards ──────────────────────────────────────────────────
function renderIDCBulk(sid, user) {
  const classes   = sid ? DB.getAll('classes', sid) : [];
  const templates = sid ? DB.getAll('idTemplates', sid) : [];
  const c = document.getElementById('idc-tab');
  c.innerHTML = `
  <div class="form-card">
    <h3>Bulk ID Card Generation</h3>
    <div class="form-row">
      <div class="form-group"><label>Template *</label>
        <select class="form-control" id="bulkTpl">
          ${templates.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Session</label>
        <input class="form-control" id="bulkSession" value="${sid?DB.getSetting(sid,'currentSession')||'':''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Class (leave blank = all)</label>
        <select class="form-control" id="bulkClass" onchange="loadBulkSections()">
          <option value="">-- All Classes --</option>
          ${classes.map(cl=>`<option value="${cl.id}">${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Section</label>
        <select class="form-control" id="bulkSection">
          <option value="">-- All Sections --</option>
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Filter by FTPEN</label>
        <input class="form-control" id="bulkFTPEN" placeholder="Optional"></div>
      <div class="form-group"><label>Filter by PEN (UDISE)</label>
        <input class="form-control" id="bulkPEN" placeholder="Optional"></div>
    </div>
    <button class="btn-primary" onclick="loadBulkStudents()">🔍 Filter Students</button>
  </div>
  <div id="bulk-students-list" style="margin-top:20px"></div>
  <div id="bulk-preview-area"  style="margin-top:20px"></div>`;
}

function loadBulkSections() {
  const classId = document.getElementById('bulkClass').value;
  const sel = document.getElementById('bulkSection');
  const sections = classId ? DB.all('SELECT * FROM sections WHERE classId=?',[classId]) : [];
  sel.innerHTML = '<option value="">-- All Sections --</option>' +
    sections.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function loadBulkStudents() {
  const user = Auth.currentUser();
  const sid = user.schoolId;
  const filters = {
    classId:   document.getElementById('bulkClass').value   || undefined,
    sectionId: document.getElementById('bulkSection').value || undefined,
    session:   document.getElementById('bulkSession').value || undefined,
    ftpen:     document.getElementById('bulkFTPEN').value   || undefined,
    pen:       document.getElementById('bulkPEN').value     || undefined
  };
  Object.keys(filters).forEach(k => filters[k]===undefined && delete filters[k]);
  const students = DB.getStudents(sid, filters);
  const container = document.getElementById('bulk-students-list');
  container.innerHTML = `
  <div class="form-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>${students.length} Students Found</h3>
      <div>
        <button class="btn-sm-primary" onclick="selectAllBulk(true)">Select All</button>
        <button class="btn-outline btn-sm" onclick="selectAllBulk(false)">Deselect All</button>
      </div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th><input type="checkbox" onchange="selectAllBulk(this.checked)"></th>
          <th>Name</th><th>Class</th><th>Section</th><th>FTPEN</th></tr></thead>
        <tbody>
          ${students.map(s=>{
            const cl = s.classId ? DB.getById('classes',s.classId) : null;
            const sec = s.sectionId ? DB.getById('sections',s.sectionId) : null;
            return `<tr>
              <td><input type="checkbox" class="bulk-check" value="${s.id}" checked></td>
              <td>${s.name}</td><td>${cl?.name||'-'}</td>
              <td>${sec?.name||'-'}</td><td>${s.ftpen||'-'}</td>
            </tr>`;
          }).join('') || '<tr><td colspan="5" class="empty-msg">No students found</td></tr>'}
        </tbody>
      </table>
    </div>
    ${students.length ? `
    <div style="margin-top:12px;display:flex;gap:10px">
      <button class="btn-primary" onclick="previewBulkIDs()">👁 Preview Sample</button>
      <button class="btn-outline"  onclick="generateBulkIDs()">🖨 Generate All</button>
    </div>` : ''}
  </div>`;
}

function selectAllBulk(checked) {
  document.querySelectorAll('.bulk-check').forEach(cb => cb.checked = checked);
}

function getSelectedBulkStudents() {
  return [...document.querySelectorAll('.bulk-check:checked')].map(cb => cb.value);
}

async function previewBulkIDs() {
  const ids = getSelectedBulkStudents().slice(0,3);
  if (!ids.length) { showToast('Select at least one student'); return; }
  const tplId = document.getElementById('bulkTpl').value;
  if (!tplId) { showToast('Select a template'); return; }
  showToast('Loading preview...');
  const container = document.getElementById('bulk-preview-area');
  container.innerHTML = '<div class="form-card"><h3>Sample Preview (first 3)</h3><div id="bulk-preview-inner" style="display:flex;flex-wrap:wrap;gap:16px"></div><div style="margin-top:12px"><button class="btn-primary" onclick="generateBulkIDs()">✅ Confirm & Generate All</button></div></div>';
  for (const sid of ids) {
    await renderMiniIDCard(sid, tplId, document.getElementById('bulk-preview-inner'));
  }
}

async function renderMiniIDCard(studentId, tplId, container) {
  const user = Auth.currentUser();
  const student  = DB.getById('students', studentId);
  const template = DB.getById('idTemplates', tplId);
  if (!student || !template) return;
  const school   = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const klass    = student.classId ? DB.getById('classes', student.classId) : null;
  const fl       = JSON.parse(template.frontLayout||'{}');
  const div = document.createElement('div');
  div.className = 'id-card-mini';
  div.style.cssText = `background:${fl.bgColor||'#0c1628'};color:${fl.textColor||'#fff'};border:2px solid ${fl.accentColor||'#46d5f9'}`;
  div.innerHTML = `
    <div style="background:${fl.accentColor||'#46d5f9'};color:#000;padding:4px 8px;font-size:10px;font-weight:700">${school?.name||'School'}</div>
    <div style="padding:8px;font-size:10px">
      <div style="font-weight:700">${student.name}</div>
      <div>${klass?.name||'-'}</div>
      <div>${student.ftpen||'-'}</div>
    </div>`;
  container.appendChild(div);
}

async function generateBulkIDs() {
  const ids   = getSelectedBulkStudents();
  const tplId = document.getElementById('bulkTpl').value;
  if (!ids.length || !tplId) { showToast('Select students and template'); return; }
  const user = Auth.currentUser();
  const template = DB.getById('idTemplates', tplId);
  const school   = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const fl       = JSON.parse(template.frontLayout||'{}');

  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Bulk ID Cards</title>
  <style>
    body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#fff}
    .page{display:grid;grid-template-columns:repeat(4,85.6mm);gap:4mm;page-break-after:always}
    .id-card{width:85.6mm;height:54mm;border-radius:3px;overflow:hidden;border:1px solid #ddd;font-size:10px}
    .id-header{background:${fl.accentColor||'#46d5f9'};color:#000;padding:4px 8px;font-weight:700;font-size:11px}
    .id-body{padding:8px;background:${fl.bgColor||'#0c1628'};color:${fl.textColor||'#fff'};height:calc(100% - 30px)}
    @media print{button{display:none}}
  </style></head><body>
  <button onclick="window.print()" style="margin-bottom:16px">🖨 Print</button>
  <div class="page">`);

  for (const sid of ids) {
    const s = DB.getById('students', sid);
    if (!s) continue;
    const klass = s.classId ? DB.getById('classes', s.classId) : null;
    win.document.write(`
    <div class="id-card">
      <div class="id-header">${school?.name||'School'} &nbsp; IDENTITY CARD</div>
      <div class="id-body">
        <div style="font-weight:700;margin-bottom:3px">${s.name}</div>
        <div>Class: ${klass?.name||'-'}</div>
        ${s.ftpen?`<div>FTPEN: ${s.ftpen}</div>`:''}
        ${s.dob?`<div>DOB: ${s.dob}</div>`:''}
        ${s.bloodGroup?`<div style="color:${fl.accentColor||'#46d5f9'}">Blood: ${s.bloodGroup}</div>`:''}
      </div>
    </div>`);
  }
  win.document.write(`</div></body></html>`);
  win.document.close();
}
