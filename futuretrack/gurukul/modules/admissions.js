Router.register('/admissions', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const tab = query.tab || 'list';
  const admissions = sid ? DB.getAll('admissions', sid) : [];
  const counts = { pending:0, approved:0, rejected:0 };
  admissions.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  view.innerHTML = `
  <div class="page-header">
    <h2 data-i18n="nav.admissions">Admissions</h2>
    <button class="btn-primary" onclick="Router.navigate('/admissions?tab=new')">+ New Admission</button>
  </div>
  <div class="stats-row">
    <div class="mini-stat orange"><strong>${admissions.length}</strong><span>Total</span></div>
    <div class="mini-stat yellow"><strong>${counts.pending}</strong><span>Pending</span></div>
    <div class="mini-stat green"><strong>${counts.approved}</strong><span>Approved</span></div>
    <div class="mini-stat red"><strong>${counts.rejected}</strong><span>Rejected</span></div>
  </div>
  <div class="tab-bar">
    <button class="tab-btn ${tab==='list'?'active':''}" onclick="Router.navigate('/admissions?tab=list')">Applications</button>
    <button class="tab-btn ${tab==='new'?'active':''}"  onclick="Router.navigate('/admissions?tab=new')">New Application</button>
    <button class="tab-btn ${tab==='qr'?'active':''}"   onclick="Router.navigate('/admissions?tab=qr')">QR Form</button>
  </div>
  <div id="adm-tab"></div>`;

  if (tab === 'list')    renderAdmList(sid, admissions, user);
  else if (tab === 'new') renderAdmForm(sid, user);
  else if (tab === 'qr')  renderAdmQR(sid, user);
  I18N.apply(view);
});

function renderAdmList(sid, admissions, user) {
  const c = document.getElementById('adm-tab');
  const classes = sid ? DB.getAll('classes', sid) : [];
  c.innerHTML = `
  <div class="list-toolbar">
    <input class="form-control search-box" placeholder="Search by name, phone..." oninput="filterTable(this,'admTable')">
    <select class="form-control" style="width:160px" onchange="filterAdmStatus(this.value)">
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>
  <div class="data-table-wrap">
    <table class="data-table" id="admTable">
      <thead><tr>
        <th>Name</th><th>Class</th><th>Session</th><th>Status</th><th>Submitted</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${admissions.length ? admissions.map(a => {
          const fd = JSON.parse(a.formData||'{}');
          const cl = a.classId ? DB.getById('classes', a.classId) : null;
          return `<tr>
            <td>${fd.name||'-'}</td>
            <td>${cl?.name||'-'}</td>
            <td>${a.session||'-'}</td>
            <td><span class="status-badge status-${a.status}">${a.status}</span></td>
            <td>${new Date(a.submittedAt).toLocaleDateString()}</td>
            <td>
              <button class="btn-sm-primary" onclick="viewAdmission('${a.id}')">View</button>
              ${a.status==='pending' ? `
                <button class="btn-sm-green"  onclick="updateAdmStatus('${a.id}','approved')">✓</button>
                <button class="btn-sm-danger" onclick="updateAdmStatus('${a.id}','rejected')">✗</button>` : ''}
              <button class="btn-sm-outline" onclick="printAdmReceipt('${a.id}')">🖨 Receipt</button>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="6" class="empty-msg">No applications yet</td></tr>`}
      </tbody>
    </table>
  </div>`;
}

function filterAdmStatus(status) {
  const rows = document.querySelectorAll('#admTable tbody tr');
  rows.forEach(r => {
    r.style.display = !status || r.textContent.includes(status) ? '' : 'none';
  });
}

function updateAdmStatus(id, status) {
  const adm = DB.getById('admissions', id);
  if (!adm) return;
  DB.saveAdmission({ ...adm, status });
  // If approved → create student record
  if (status === 'approved') {
    const fd = JSON.parse(adm.formData||'{}');
    const user = Auth.currentUser();
    const existing = adm.studentId ? DB.getById('students', adm.studentId) : null;
    if (!existing) {
      const student = DB.saveStudent({
        schoolId: user.schoolId, classId: adm.classId, sectionId: adm.sectionId,
        session: adm.session, status: 'active',
        ftpen: DB.generateFTPEN(),
        name: fd.name, dob: fd.dob, gender: fd.gender,
        fatherName: fd.fatherName, motherName: fd.motherName,
        phone: fd.phone, email: fd.email, address: fd.address,
        bloodGroup: fd.bloodGroup
      });
      DB.saveAdmission({ ...adm, status, studentId: student.id });
    }
  }
  showToast('Status updated to ' + status);
  Router.navigate('/admissions?tab=list');
}

function renderAdmForm(sid, user) {
  const classes  = sid ? DB.getAll('classes', sid) : [];
  const session  = sid ? DB.getSetting(sid,'currentSession') || '' : '';
  const c = document.getElementById('adm-tab');
  c.innerHTML = `
  <div class="form-card">
    <h3>Admission Application Form</h3>
    <div class="form-section-label">Student Information</div>
    <div class="form-row">
      <div class="form-group"><label>Full Name *</label>
        <input class="form-control" id="aName" placeholder="Student full name"></div>
      <div class="form-group"><label>Date of Birth</label>
        <input class="form-control" type="date" id="aDob"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Gender</label>
        <select class="form-control" id="aGender">
          <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
        </select></div>
      <div class="form-group"><label>Blood Group</label>
        <select class="form-control" id="aBlood">
          <option value="">--</option>
          ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b=>`<option>${b}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-section-label">Parent / Guardian</div>
    <div class="form-row">
      <div class="form-group"><label>Father Name</label>
        <input class="form-control" id="aFather" placeholder="Father's full name"></div>
      <div class="form-group"><label>Mother Name</label>
        <input class="form-control" id="aMother" placeholder="Mother's full name"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Phone *</label>
        <input class="form-control" id="aPhone" placeholder="+91..."></div>
      <div class="form-group"><label>Email</label>
        <input class="form-control" type="email" id="aEmail" placeholder="parent@email.com"></div>
    </div>
    <div class="form-group"><label>Address</label>
      <textarea class="form-control" id="aAddress" rows="2"></textarea></div>
    <div class="form-section-label">Admission Details</div>
    <div class="form-row">
      <div class="form-group"><label>Applying for Class *</label>
        <select class="form-control" id="aClass" onchange="loadAdmSections()">
          <option value="">-- Select Class --</option>
          ${classes.map(cl=>`<option value="${cl.id}">${cl.name}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Section</label>
        <select class="form-control" id="aSection"></select></div>
    </div>
    <div class="form-group"><label>Session</label>
      <input class="form-control" id="aSession" value="${session}" placeholder="e.g. 2025-2026"></div>
    <div class="form-section-label">Documents</div>
    <div class="form-row">
      <div class="form-group"><label>Student Photo</label>
        <input type="file" class="form-control" id="aPhoto" accept="image/*"></div>
      <div class="form-group"><label>Parent Signature (upload signed form photo)</label>
        <input type="file" class="form-control" id="aParentSig" accept="image/*"></div>
    </div>
    <div class="form-group">
      <label class="checkbox-row">
        <input type="checkbox" id="aParentConfirm" required>
        I (parent/guardian) confirm all information provided is accurate and complete.
      </label>
    </div>
    <button class="btn-primary" onclick="submitAdmission()">Submit Application</button>
  </div>`;
}

function loadAdmSections() {
  const classId = document.getElementById('aClass').value;
  const sel = document.getElementById('aSection');
  const sections = classId ? DB.all('SELECT * FROM sections WHERE classId=?',[classId]) : [];
  sel.innerHTML = '<option value="">--</option>' + sections.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

async function submitAdmission() {
  const user = Auth.currentUser();
  const name = document.getElementById('aName').value.trim();
  if (!name) { showToast('Student name required'); return; }
  if (!document.getElementById('aParentConfirm').checked) {
    showToast('Parent must confirm the form'); return;
  }
  const formData = {
    name, dob: document.getElementById('aDob').value,
    gender: document.getElementById('aGender').value,
    bloodGroup: document.getElementById('aBlood').value,
    fatherName: document.getElementById('aFather').value,
    motherName: document.getElementById('aMother').value,
    phone: document.getElementById('aPhone').value,
    email: document.getElementById('aEmail').value,
    address: document.getElementById('aAddress').value
  };
  const classId   = document.getElementById('aClass').value;
  const sectionId = document.getElementById('aSection').value || null;
  const session   = document.getElementById('aSession').value;

  // Save blobs
  let photoKey = null, parentSigKey = null;
  const photoFile = document.getElementById('aPhoto').files[0];
  const sigFile   = document.getElementById('aParentSig').files[0];
  if (photoFile) {
    const buf = await photoFile.arrayBuffer();
    photoKey = 'adm_photo_' + DB.uid();
    await DB.saveBlob(photoKey, new Uint8Array(buf));
  }
  if (sigFile) {
    const buf = await sigFile.arrayBuffer();
    parentSigKey = 'adm_sig_' + DB.uid();
    await DB.saveBlob(parentSigKey, new Uint8Array(buf));
  }

  DB.saveAdmission({
    schoolId: user.schoolId, classId, sectionId, session,
    formData, status: 'pending', parentSignatureKey: parentSigKey
  });
  showToast('Application submitted!');
  Router.navigate('/admissions?tab=list');
}

function renderAdmQR(sid, user) {
  const school = sid ? DB.getById('schools', sid) : null;
  const admUrl = window.location.origin + window.location.pathname + '#/admissions?tab=new';
  const c = document.getElementById('adm-tab');
  c.innerHTML = `
  <div class="form-card" style="text-align:center">
    <h3>QR Code for Admission Form</h3>
    <p>Students/parents can scan this QR code to open and fill the admission form on their phone.</p>
    <div id="qr-container" style="margin:24px auto;width:fit-content"></div>
    <p class="muted">${admUrl}</p>
    <button class="btn-primary" onclick="generateQR()">Generate QR</button>
    <button class="btn-outline" onclick="printQR()">🖨 Print QR</button>
  </div>`;
  generateQR();
}

function generateQR() {
  const admUrl = window.location.origin + window.location.pathname + '#/admissions?tab=new';
  const container = document.getElementById('qr-container');
  if (!container) return;
  // Simple QR using qrcode-generator (loaded in index.html)
  if (window.qrcode) {
    const qr = qrcode(0, 'M');
    qr.addData(admUrl);
    qr.make();
    container.innerHTML = qr.createImgTag(5, 10);
  } else {
    container.innerHTML = `<p>QR library loading... URL: ${admUrl}</p>`;
  }
}

function viewAdmission(id) {
  const adm = DB.getById('admissions', id);
  if (!adm) return;
  const fd = JSON.parse(adm.formData||'{}');
  const cl = adm.classId ? DB.getById('classes', adm.classId) : null;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
  <div class="modal-box">
    <div class="modal-header">
      <h3>Admission Application</h3>
      <button onclick="this.closest('.modal-overlay').remove()">✕</button>
    </div>
    <div class="modal-body">
      <div class="adm-view-grid">
        ${Object.entries({...fd, Class: cl?.name||'-', Session: adm.session, Status: adm.status})
          .map(([k,v])=>`<div class="adm-field"><span>${k}</span><strong>${v||'-'}</strong></div>`)
          .join('')}
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function printAdmReceipt(id) {
  const adm = DB.getById('admissions', id);
  if (!adm) return;
  const fd = JSON.parse(adm.formData||'{}');
  const user = Auth.currentUser();
  const school = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const cl = adm.classId ? DB.getById('classes', adm.classId) : null;
  const receiptNo = 'ADM-' + adm.id.toUpperCase().slice(0,8);
  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Admission Receipt</title>
  <style>body{font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto}
  h2{text-align:center} table{width:100%;border-collapse:collapse;margin-top:20px}
  td{padding:8px 12px;border:1px solid #ddd} .label{font-weight:bold;background:#f5f5f5}
  .header{text-align:center;margin-bottom:20px} @media print{button{display:none}}</style>
  </head><body>
  <div class="header">
    <h2>${school?.name||'School'}</h2>
    <p>Admission Receipt — ${receiptNo}</p>
    <p>Date: ${new Date(adm.submittedAt).toLocaleDateString()}</p>
  </div>
  <table>
    <tr><td class="label">Student Name</td><td>${fd.name||'-'}</td></tr>
    <tr><td class="label">Date of Birth</td><td>${fd.dob||'-'}</td></tr>
    <tr><td class="label">Gender</td><td>${fd.gender||'-'}</td></tr>
    <tr><td class="label">Father Name</td><td>${fd.fatherName||'-'}</td></tr>
    <tr><td class="label">Mother Name</td><td>${fd.motherName||'-'}</td></tr>
    <tr><td class="label">Phone</td><td>${fd.phone||'-'}</td></tr>
    <tr><td class="label">Class Applied</td><td>${cl?.name||'-'}</td></tr>
    <tr><td class="label">Session</td><td>${adm.session||'-'}</td></tr>
    <tr><td class="label">Application Status</td><td>${adm.status}</td></tr>
  </table>
  <p style="margin-top:40px;font-size:12px;color:#888">This is a computer-generated receipt.</p>
  <button onclick="window.print()">🖨 Print</button>
  </body></html>`);
  win.document.close();
}

function filterTable(input, tableId) {
  const q = input.value.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
