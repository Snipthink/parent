Router.register('/transport', (query, view) => {
  const user = Auth.requireAuth(); if (!user) return;
  const sid = user.schoolId;
  const tab = query.tab || 'vehicles';
  view.innerHTML = `
  <div class="page-header"><h2 data-i18n="nav.transport">Transportation</h2></div>
  <div class="tab-bar">
    ${['vehicles','routes','assignments','board'].map(t=>`
      <button class="tab-btn ${tab===t?'active':''}"
        onclick="Router.navigate('/transport?tab=${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')}
  </div>
  <div id="tr-tab"></div>`;

  if (tab==='vehicles')    renderVehicles(sid);
  else if (tab==='routes') renderRoutes(sid);
  else if (tab==='assignments') renderAssignments(sid);
  else renderTransportBoard(sid, user);
  I18N.apply(view);
});

function renderVehicles(sid) {
  const vehicles = sid ? DB.getAll('vehicles', sid) : [];
  const routes   = sid ? DB.getAll('routes', sid) : [];
  const c = document.getElementById('tr-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Vehicle</h3>
      <div class="form-row">
        <div class="form-group"><label>Vehicle Number *</label>
          <input class="form-control" id="vNum" placeholder="e.g. DL-01-AB-1234"></div>
        <div class="form-group"><label>Type</label>
          <select class="form-control" id="vType">
            <option value="bus">Bus</option>
            <option value="van">Van</option>
            <option value="minivan">Mini Van</option>
            <option value="auto">Auto</option>
            <option value="cab">Cab</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Capacity (seats)</label>
          <input class="form-control" type="number" id="vCap" value="40"></div>
        <div class="form-group"><label>Parking Slot</label>
          <input class="form-control" id="vPark" placeholder="e.g. Bay-3"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Driver Name</label>
          <input class="form-control" id="vDriver" placeholder="Driver full name"></div>
        <div class="form-group"><label>Driver Phone</label>
          <input class="form-control" id="vDriverPhone" placeholder="+91..."></div>
      </div>
      <div class="form-group"><label>Assigned Route</label>
        <select class="form-control" id="vRoute">
          <option value="">-- None --</option>
          ${routes.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}
        </select></div>
      <button class="btn-primary" onclick="saveVehicle_()">Add Vehicle</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Number</th><th>Type</th><th>Capacity</th><th>Driver</th><th>Route</th><th>Parking</th><th>×</th></tr></thead>
        <tbody>
          ${vehicles.length ? vehicles.map(v=>{
            const rt = v.routeId ? DB.getById('routes',v.routeId) : null;
            return `<tr>
              <td>${v.number}</td>
              <td><span class="vehicle-badge vtype-${v.type}">${v.type}</span></td>
              <td>${v.capacity}</td>
              <td>${v.driverName||'-'}</td>
              <td>${rt?.name||'-'}</td>
              <td>${v.parkingSlot||'-'}</td>
              <td><button class="btn-sm-danger" onclick="deleteVehicle('${v.id}')">×</button></td>
            </tr>`;
          }).join('') : `<tr><td colspan="7" class="empty-msg">No vehicles</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveVehicle_() {
  const user = Auth.currentUser();
  const num = document.getElementById('vNum').value.trim();
  if (!num) { showToast('Vehicle number required'); return; }
  DB.saveVehicle({
    schoolId: user.schoolId, number: num,
    type: document.getElementById('vType').value,
    capacity: parseInt(document.getElementById('vCap').value)||40,
    parkingSlot: document.getElementById('vPark').value,
    driverName: document.getElementById('vDriver').value,
    driverPhone: document.getElementById('vDriverPhone').value,
    routeId: document.getElementById('vRoute').value||null
  });
  Router.navigate('/transport?tab=vehicles');
}
function deleteVehicle(id) {
  if (!confirm('Delete vehicle?')) return;
  DB.deleteRow('vehicles', id);
  Router.navigate('/transport?tab=vehicles');
}

function renderRoutes(sid) {
  const routes = sid ? DB.getAll('routes', sid) : [];
  const c = document.getElementById('tr-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Add Route</h3>
      <div class="form-group"><label>Route Name *</label>
        <input class="form-control" id="rtName" placeholder="e.g. North Route - Zone A"></div>
      <div class="form-group"><label>Stops (one per line: Stop Name | Pickup Time | Drop Time)</label>
        <textarea class="form-control" id="rtStops" rows="6"
          placeholder="Main Gate | 07:30 | 15:00&#10;Sector 5 Market | 07:40 | 14:50&#10;Park Colony | 07:50 | 14:40"></textarea></div>
      <button class="btn-primary" onclick="saveRoute_()">Add Route</button>
    </div>
    <div>
      ${routes.map(r=>{
        const stops = JSON.parse(r.stops||'[]');
        return `<div class="route-card">
          <div class="rc-header">
            <strong>${r.name}</strong>
            <button class="btn-sm-danger" onclick="deleteRoute('${r.id}')">Delete</button>
          </div>
          <div class="stops-list">
            ${stops.map(s=>`
              <div class="stop-item">
                <span class="stop-name">${s.name}</span>
                <span class="stop-time">🕑 ${s.pickup||'-'} → ${s.drop||'-'}</span>
              </div>`).join('') || '<p class="empty-msg">No stops</p>'}
          </div>
        </div>`;
      }).join('') || '<p class="empty-msg">No routes yet</p>'}
    </div>
  </div>`;
}

function saveRoute_() {
  const user = Auth.currentUser();
  const name = document.getElementById('rtName').value.trim();
  if (!name) { showToast('Route name required'); return; }
  const stopsRaw = document.getElementById('rtStops').value.trim().split('\n');
  const stops = stopsRaw.map(line => {
    const parts = line.split('|').map(s=>s.trim());
    return { name: parts[0]||line, pickup: parts[1]||'', drop: parts[2]||'' };
  }).filter(s=>s.name);
  DB.saveRoute({ schoolId: user.schoolId, name, stops });
  Router.navigate('/transport?tab=routes');
}
function deleteRoute(id) {
  if (!confirm('Delete route?')) return;
  DB.deleteRow('routes', id);
  Router.navigate('/transport?tab=routes');
}

function renderAssignments(sid) {
  const vehicles = sid ? DB.getAll('vehicles', sid) : [];
  const routes   = sid ? DB.getAll('routes', sid) : [];
  const students = sid ? DB.getStudents(sid) : [];
  const staff    = sid ? DB.getAll('staff', sid) : [];
  const assignments = sid
    ? DB.all('SELECT ta.*, v.number as vNum FROM transportAssignments ta LEFT JOIN vehicles v ON ta.vehicleId=v.id WHERE ta.schoolId=? ORDER BY ta.createdAt DESC',[sid])
    : [];
  const c = document.getElementById('tr-tab');
  c.innerHTML = `
  <div class="split-layout">
    <div class="form-card">
      <h3>Assign Transport</h3>
      <div class="form-row">
        <div class="form-group"><label>Member Type</label>
          <select class="form-control" id="taMType" onchange="loadTAMembers()">
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select></div>
        <div class="form-group"><label>Member</label>
          <select class="form-control" id="taMember">
            ${students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Vehicle</label>
          <select class="form-control" id="taVehicle">
            ${vehicles.map(v=>`<option value="${v.id}">${v.number} (${v.type})</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Route</label>
          <select class="form-control" id="taRoute" onchange="loadRouteStops()">
            ${routes.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-group"><label>Stop Name</label>
        <select class="form-control" id="taStop"></select></div>
      <div class="form-row">
        <div class="form-group"><label>Pickup Time</label>
          <input class="form-control" type="time" id="taPickup"></div>
        <div class="form-group"><label>Drop Time</label>
          <input class="form-control" type="time" id="taDrop"></div>
      </div>
      <button class="btn-primary" onclick="saveAssignment()">Assign</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Member</th><th>Type</th><th>Vehicle</th><th>Stop</th><th>Pickup</th><th>Drop</th><th>×</th></tr></thead>
        <tbody>
          ${assignments.length ? assignments.map(a=>{
            const member = a.memberType==='student'
              ? DB.getById('students',a.memberId)
              : DB.getById('staff',a.memberId);
            return `<tr>
              <td>${member?.name||'-'}</td><td>${a.memberType}</td>
              <td>${a.vNum||'-'}</td>
              <td>${a.stopName||'-'}</td>
              <td>${a.pickupTime||'-'}</td><td>${a.dropTime||'-'}</td>
              <td><button class="btn-sm-danger" onclick="deleteAssignment('${a.id}')">×</button></td>
            </tr>`;
          }).join('') : `<tr><td colspan="7" class="empty-msg">No assignments</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
  window._taStudents = students; window._taStaff = staff;
  if (routes.length) loadRouteStops();
}

function loadTAMembers() {
  const type = document.getElementById('taMType').value;
  const sel  = document.getElementById('taMember');
  const list = type==='student' ? window._taStudents : window._taStaff;
  sel.innerHTML = (list||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

function loadRouteStops() {
  const routeId = document.getElementById('taRoute')?.value;
  if (!routeId) return;
  const route = DB.getById('routes', routeId);
  const stops = JSON.parse(route?.stops||'[]');
  const sel = document.getElementById('taStop');
  if (sel) sel.innerHTML = stops.map(s=>`<option value="${s.name}">${s.name}</option>`).join('');
}

function saveAssignment() {
  const user = Auth.currentUser();
  DB.saveTransportAssign({
    schoolId: user.schoolId,
    memberId: document.getElementById('taMember').value,
    memberType: document.getElementById('taMType').value,
    vehicleId: document.getElementById('taVehicle').value||null,
    routeId: document.getElementById('taRoute').value||null,
    stopName: document.getElementById('taStop').value,
    pickupTime: document.getElementById('taPickup').value,
    dropTime: document.getElementById('taDrop').value
  });
  showToast('Transport assigned');
  Router.navigate('/transport?tab=assignments');
}

function deleteAssignment(id) {
  DB.deleteRow('transportAssignments', id);
  Router.navigate('/transport?tab=assignments');
}

// ── Personal Transport Board (after login) ─────────────────────────
function renderTransportBoard(sid, user) {
  const assignments = user.id
    ? DB.all('SELECT ta.*, v.number as vNum, v.type as vType, v.driverName, v.driverPhone, v.parkingSlot FROM transportAssignments ta LEFT JOIN vehicles v ON ta.vehicleId=v.id WHERE ta.memberId=?',[user.id])
    : [];
  const c = document.getElementById('tr-tab');
  c.innerHTML = `
  <div class="transport-board">
    <h3>🚌 My Transport Details</h3>
    ${assignments.length ? assignments.map(a=>`
      <div class="my-transport-card">
        <div class="mtc-vehicle">
          <span class="vehicle-badge vtype-${a.vType||'bus'}">${a.vType||'Bus'}</span>
          <strong>${a.vNum||'-'}</strong>
        </div>
        <div class="mtc-details">
          <div>📍 Stop: <strong>${a.stopName||'-'}</strong></div>
          <div>🕑 Pickup: <strong>${a.pickupTime||'-'}</strong></div>
          <div>🕓 Drop: <strong>${a.dropTime||'-'}</strong></div>
          <div>👤 Driver: <strong>${a.driverName||'-'}</strong></div>
          <div>📞 Driver Phone: <strong>${a.driverPhone||'-'}</strong></div>
          <div>🅿️ Parking: <strong>${a.parkingSlot||'-'}</strong></div>
        </div>
      </div>`).join('') : '<p class="empty-msg">No transport assigned yet</p>'}
  </div>`;
}
