Router.register('/fees', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const tab = query.tab || 'collect';
  const classes = sid ? DB.getAll('classes', sid) : [];
  const structures = sid ? DB.getAll('feeStructure', sid) : [];

  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.fees">Fees & Accounting</h2></div>
  <div class="tab-bar">
    ${['collect','structure','ledger','receipts'].map(t=>`
      <button class="tab-btn ${tab===t?'active':''}"
        onclick="Router.navigate('/fees?tab=${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')}
  </div>
  <div id="fee-tab"></div>`;

  if (tab==='collect')   renderFeeCollect(sid, structures);
  else if (tab==='structure') renderFeeStructure(sid, classes, structures);
  else if (tab==='ledger')   renderFeeLedger(sid);
  else renderFeeReceipts(sid);
  I18N.apply(view);
});

function renderFeeCollect(sid, structures) {
  const students = sid ? DB.getStudents(sid) : [];
  const c = document.getElementById('fee-tab');
  c.innerHTML = `
  <div class="form-card">
    <h3>Collect Fee</h3>
    <div class="form-row">
      <div class="form-group"><label>Student *</label>
        <select class="form-control" id="feeStudent" onchange="loadStudentFee()">
          <option value="">-- Select Student --</option>
          ${students.map(s=>`<option value="${s.id}">${s.name} (${s.ftpen||s.admissionNo||s.id})</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Fee Type</label>
        <select class="form-control" id="feeStructId">
          <option value="">-- Other --</option>
          ${structures.map(fs=>`<option value="${fs.id}">${fs.name} (₹${fs.amount})</option>`).join('')}
        </select></div>
    </div>
    <div id="student-fee-history"></div>
    <div class="form-row">
      <div class="form-group"><label>Amount (₹) *</label>
        <input class="form-control" type="number" id="feeAmount" placeholder="0.00"></div>
      <div class="form-group"><label>Discount (₹)</label>
        <input class="form-control" type="number" id="feeDiscount" value="0"></div>
      <div class="form-group"><label>Late Fee (₹)</label>
        <input class="form-control" type="number" id="feeLateFee" value="0"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Payment Method</label>
        <select class="form-control" id="feeMethod">
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="netbanking">Net Banking</option>
          <option value="cheque">Cheque</option>
          <option value="dd">DD</option>
          <option value="card">Card</option>
        </select></div>
      <div class="form-group"><label>Date</label>
        <input class="form-control" type="date" id="feeDate" value="${new Date().toISOString().slice(0,10)}"></div>
    </div>
    <div class="form-group"><label>Remarks</label>
      <input class="form-control" id="feeRemarks" placeholder="Optional"></div>
    <button class="btn-primary" onclick="collectFee()">💰 Collect & Generate Receipt</button>
  </div>`;
}

function loadStudentFee() {
  const studentId = document.getElementById('feeStudent').value;
  if (!studentId) return;
  const payments = DB.all('SELECT * FROM feePayments WHERE studentId=? ORDER BY paidAt DESC',[studentId]);
  const total = payments.reduce((s,p) => s + (p.amount||0) - (p.discount||0), 0);
  document.getElementById('student-fee-history').innerHTML = `
  <div class="fee-summary">
    <span>Previous payments: ${payments.length}</span>
    <span>Total paid: <strong>₹${total.toLocaleString('en-IN')}</strong></span>
  </div>`;
}

function collectFee() {
  const user = Auth.currentUser();
  const studentId = document.getElementById('feeStudent').value;
  const amount = parseFloat(document.getElementById('feeAmount').value);
  if (!studentId || isNaN(amount) || amount <= 0) { showToast('Select student and enter amount'); return; }
  const payment = DB.saveFeePayment({
    schoolId: user.schoolId, studentId,
    feeStructureId: document.getElementById('feeStructId').value||null,
    amount, discount: parseFloat(document.getElementById('feeDiscount').value)||0,
    lateFee: parseFloat(document.getElementById('feeLateFee').value)||0,
    paidAt: new Date(document.getElementById('feeDate').value).getTime()||Date.now(),
    method: document.getElementById('feeMethod').value,
    remarks: document.getElementById('feeRemarks').value
  });
  // Notify student about fee collection
  if (typeof notifyUser === 'function') {
    const student = DB.getById('students', studentId);
    const userRecord = DB.first('SELECT id FROM users WHERE email=?', [student?.email||'__none__']);
    if (userRecord) {
      notifyUser(user.schoolId, userRecord.id, {
        type: 'fee', title: `💰 Fee receipt: ₹${amount.toLocaleString('en-IN')}`,
        body: `Payment of ₹${amount} recorded via ${document.getElementById('feeMethod').value}.`,
        sourceModule: 'fees', sourceId: payment?.id
      });
    }
  }
  printFeeReceipt(payment.id);
  Router.navigate('/fees?tab=ledger');
}

function renderFeeStructure(sid, classes, structures) {
  const c = document.getElementById('fee-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Fee Structure</h3>
      <div class="form-group"><label>Fee Name *</label>
        <input class="form-control" id="fsName" placeholder="e.g. Tuition Fee Q1"></div>
      <div class="form-row">
        <div class="form-group"><label>Amount (₹) *</label>
          <input class="form-control" type="number" id="fsAmount" placeholder="0"></div>
        <div class="form-group"><label>Frequency</label>
          <select class="form-control" id="fsFreq">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="halfyearly">Half-Yearly</option>
            <option value="annually">Annually</option>
            <option value="onetime">One Time</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Applicable Class</label>
          <select class="form-control" id="fsClass">
            <option value="">-- All --</option>
            ${classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Due Day of Month</label>
          <input class="form-control" type="number" id="fsDueDay" value="10" min="1" max="31"></div>
      </div>
      <button class="btn-primary" onclick="saveFeeStruct_()">Add</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Amount</th><th>Frequency</th><th>Class</th><th>×</th></tr></thead>
        <tbody>
          ${structures.length ? structures.map(fs=>{
            const cl = fs.classId ? DB.getById('classes',fs.classId) : null;
            return `<tr>
              <td>${fs.name}</td><td>₹${fs.amount}</td>
              <td>${fs.frequency}</td><td>${cl?.name||'All'}</td>
              <td><button class="btn-sm-danger" onclick="deleteFeeStruct('${fs.id}')">×</button></td>
            </tr>`;
          }).join('') : `<tr><td colspan="5" class="empty-msg">No fee structures</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveFeeStruct_() {
  const user = Auth.currentUser();
  DB.saveFeeStruct({
    schoolId: user.schoolId,
    name: document.getElementById('fsName').value,
    amount: parseFloat(document.getElementById('fsAmount').value)||0,
    frequency: document.getElementById('fsFreq').value,
    classId: document.getElementById('fsClass').value||null,
    dueDay: parseInt(document.getElementById('fsDueDay').value)||10
  });
  Router.navigate('/fees?tab=structure');
}
function deleteFeeStruct(id) { DB.deleteRow('feeStructure', id); Router.navigate('/fees?tab=structure'); }

function renderFeeLedger(sid) {
  const payments = sid ? DB.all('SELECT fp.*, s.name as studentName FROM feePayments fp LEFT JOIN students s ON fp.studentId=s.id WHERE fp.schoolId=? ORDER BY fp.paidAt DESC',[sid]) : [];
  const total = payments.reduce((sum,p) => sum + (p.amount||0) - (p.discount||0), 0);
  const c = document.getElementById('fee-tab');
  c.innerHTML = `
  <div class="stats-row">
    <div class="mini-stat cyan"><strong>₹${total.toLocaleString('en-IN')}</strong><span>Total Collected</span></div>
    <div class="mini-stat blue"><strong>${payments.length}</strong><span>Transactions</span></div>
  </div>
  <div class="list-toolbar">
    <input class="form-control search-box" placeholder="Search..." oninput="filterTable(this,'ledgerTable')">
  </div>
  <div class="data-table-wrap">
    <table class="data-table" id="ledgerTable">
      <thead><tr><th>Receipt No</th><th>Student</th><th>Amount</th><th>Discount</th><th>Net</th><th>Method</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${payments.map(p=>`
          <tr>
            <td>${p.receiptNo}</td>
            <td>${p.studentName||'-'}</td>
            <td>₹${p.amount}</td>
            <td>₹${p.discount||0}</td>
            <td>₹${(p.amount-(p.discount||0)+(p.lateFee||0)).toFixed(2)}</td>
            <td>${p.method}</td>
            <td>${new Date(p.paidAt).toLocaleDateString()}</td>
            <td><button class="btn-sm-outline" onclick="printFeeReceipt('${p.id}')">🖨</button></td>
          </tr>`).join('') || '<tr><td colspan="8" class="empty-msg">No payments</td></tr>'}
      </tbody>
    </table>
  </div>`;
}

function renderFeeReceipts(sid) {
  const payments = sid ? DB.all('SELECT fp.*, s.name as studentName FROM feePayments fp LEFT JOIN students s ON fp.studentId=s.id WHERE fp.schoolId=? ORDER BY fp.paidAt DESC LIMIT 50',[sid]) : [];
  const c = document.getElementById('fee-tab');
  c.innerHTML = `
  <div class="receipts-grid">
    ${payments.map(p=>`
      <div class="receipt-card">
        <div class="rc-no">${p.receiptNo}</div>
        <div class="rc-name">${p.studentName||'-'}</div>
        <div class="rc-amount">₹${(p.amount-(p.discount||0)+(p.lateFee||0)).toFixed(2)}</div>
        <div class="rc-date">${new Date(p.paidAt).toLocaleDateString()}</div>
        <button class="btn-sm-outline" onclick="printFeeReceipt('${p.id}')">🖨 Receipt</button>
      </div>`).join('') || '<p class="empty-msg">No receipts</p>'}
  </div>`;
}

function printFeeReceipt(paymentId) {
  const user = Auth.currentUser();
  const school = user.schoolId ? DB.getById('schools', user.schoolId) : null;
  const p = DB.getById('feePayments', paymentId);
  if (!p) return;
  const student = p.studentId ? DB.getById('students', p.studentId) : null;
  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Fee Receipt</title>
  <style>body{font-family:Arial,sans-serif;max-width:500px;margin:40px auto;padding:20px;border:2px solid #ddd}
  h2{text-align:center;margin:0}h4{text-align:center;color:#666;margin-top:4px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
  .label{color:#888} .total{font-size:18px;font-weight:bold;text-align:right;margin-top:16px}
  @media print{button{display:none}}</style>
  </head><body>
  <h2>${school?.name||'School'}</h2>
  <h4>FEE RECEIPT</h4>
  <div class="row"><span class="label">Receipt No</span><strong>${p.receiptNo}</strong></div>
  <div class="row"><span class="label">Date</span><span>${new Date(p.paidAt).toLocaleDateString()}</span></div>
  <div class="row"><span class="label">Student Name</span><span>${student?.name||'-'}</span></div>
  <div class="row"><span class="label">Class</span><span>${student?.classId?DB.getById('classes',student.classId)?.name||'-':'-'}</span></div>
  <div class="row"><span class="label">FTPEN / Adm No</span><span>${student?.ftpen||student?.admissionNo||'-'}</span></div>
  <div class="row"><span class="label">Fee Amount</span><span>₹${p.amount}</span></div>
  ${p.discount>0?`<div class="row"><span class="label">Discount</span><span>- ₹${p.discount}</span></div>`:''}
  ${p.lateFee>0?`<div class="row"><span class="label">Late Fee</span><span>+ ₹${p.lateFee}</span></div>`:''}
  <div class="row"><span class="label">Payment Method</span><span>${p.method}</span></div>
  ${p.remarks?`<div class="row"><span class="label">Remarks</span><span>${p.remarks}</span></div>`:''}
  <div class="total">Net Paid: ₹${(p.amount-(p.discount||0)+(p.lateFee||0)).toFixed(2)}</div>
  <p style="text-align:center;margin-top:30px;font-size:11px;color:#aaa">This is a computer-generated receipt.</p>
  <button onclick="window.print()" style="margin-top:12px;width:100%">🖨 Print</button>
  </body></html>`);
  win.document.close();
}
