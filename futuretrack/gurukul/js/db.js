/**
 * db.js — SQLite (sql.js WebAssembly) + IndexedDB persistence
 *
 * sql.js runs real SQLite entirely in the browser — offline, no server.
 * The database binary is persisted to IndexedDB so data survives page reloads.
 * IndexedDB is also used directly for large blobs (photos, signatures, logos).
 *
 * Firebase-swappable: replace the internals of each exported function here.
 * Call sites across modules never change.
 *
 * sql.js CDN: https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js
 * (loaded in index.html before this file)
 */

const DB = (() => {
  let _sql = null;   // sql.js SQL instance
  let _db  = null;   // opened Database object

  const IDB_DB_NAME   = 'gurukul_idb';
  const IDB_DB_VER    = 1;
  const IDB_STORE_DB  = 'sqliteDb';   // stores the SQLite binary
  const IDB_STORE_BLOB= 'blobs';      // stores photos / signatures / logos
  let _idb = null;

  // ── IndexedDB bootstrap ────────────────────────────────────────
  function openIDB() {
    return new Promise((res, rej) => {
      if (_idb) return res(_idb);
      const req = indexedDB.open(IDB_DB_NAME, IDB_DB_VER);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE_DB))
          db.createObjectStore(IDB_STORE_DB);
        if (!db.objectStoreNames.contains(IDB_STORE_BLOB))
          db.createObjectStore(IDB_STORE_BLOB);
      };
      req.onsuccess = e => { _idb = e.target.result; res(_idb); };
      req.onerror   = () => rej(req.error);
    });
  }

  async function idbGet(store, key) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const req = db.transaction(store, 'readonly').objectStore(store).get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror   = () => rej(req.error);
    });
  }

  async function idbPut(store, key, val) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(val, key);
      tx.oncomplete = res;
      tx.onerror    = () => rej(tx.error);
    });
  }

  async function idbDel(store, key) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(key);
      tx.oncomplete = res;
      tx.onerror    = () => rej(tx.error);
    });
  }

  // ── Blob API (photos, signatures, logos) ──────────────────────
  const saveBlob   = (key, blob) => idbPut(IDB_STORE_BLOB, key, blob);
  const getBlob    = (key)       => idbGet(IDB_STORE_BLOB, key);
  const deleteBlob = (key)       => idbDel(IDB_STORE_BLOB, key);

  // ── School code (used as filename on Android: <code>.db) ──────
  // Derived from the schools table after first setup. Falls back to
  // 'gurukul_default' until a school is created.
  let _schoolCode = 'gurukul_default';

  function _sanitizeCode(raw) {
    if (!raw) return 'gurukul_default';
    return raw.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 40) || 'gurukul_default';
  }

  /** Call after saveSchool() to update the school code used for persistence. */
  function setSchoolCode(nameOrCode) {
    _schoolCode = _sanitizeCode(nameOrCode);
  }

  function getSchoolCode() { return _schoolCode; }

  // ── Persist SQLite binary → Android phone via server ──────────
  // Debounced: at most one push every 1.5 s to avoid hammering the server
  // on bulk inserts while still saving frequently enough.
  let _persistTimer = null;

  function persistDB() {
    if (!_db) return;
    if (_persistTimer) clearTimeout(_persistTimer);
    _persistTimer = setTimeout(_doPush, 1500);
  }

  async function _doPush() {
    _persistTimer = null;
    if (!_db) return;
    try {
      const data = _db.export();   // Uint8Array
      await fetch(`/api/gurukul/db/push?school=${encodeURIComponent(_schoolCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: data
      });
    } catch (e) {
      console.warn('[GK-DB] push failed:', e);
    }
  }

  /** Force an immediate save (e.g. after school setup). Returns a Promise. */
  async function flushDB() {
    if (_persistTimer) { clearTimeout(_persistTimer); _persistTimer = null; }
    return _doPush();
  }

  // ── Export DB as downloadable file ────────────────────────────
  function exportDBFile() {
    if (!_db) return;
    const data = _db.export();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (_schoolCode || 'gurukul') + '.db';
    a.click();
  }

  // ── Import DB from file ───────────────────────────────────────
  async function importDBFile(file) {
    const buf  = await file.arrayBuffer();
    const data = new Uint8Array(buf);
    _db = new _sql.Database(data);
    // Try to read school name from the imported DB
    try {
      const row = first('SELECT name FROM schools LIMIT 1');
      if (row && row.name) setSchoolCode(row.name);
    } catch (_) {}
    persistDB();
  }

  // ── SQL helpers ───────────────────────────────────────────────
  function run(sql, params = []) {
    _db.run(sql, params);
    persistDB();
  }

  function all(sql, params = []) {
    const stmt = _db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function first(sql, params = []) {
    const rows = all(sql, params);
    return rows[0] || null;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ── Schema ────────────────────────────────────────────────────
  function createSchema() {
    const tables = [
      // Users & Auth
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE, passwordHash TEXT,
        name TEXT, role TEXT, schoolId TEXT, permissions TEXT,
        createdAt INTEGER, updatedAt INTEGER)`,

      // Schools / Organisations
      `CREATE TABLE IF NOT EXISTS schools (
        id TEXT PRIMARY KEY, name TEXT, address TEXT, phone TEXT,
        email TEXT, website TEXT, logo TEXT, type TEXT,
        board TEXT, medium TEXT, established INTEGER,
        adminId TEXT, createdAt INTEGER, updatedAt INTEGER)`,

      // Departments
      `CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY, schoolId TEXT, name TEXT, code TEXT,
        hodId TEXT, description TEXT, createdAt INTEGER)`,

      // Courses / Programs
      `CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY, schoolId TEXT, deptId TEXT,
        name TEXT, code TEXT, duration INTEGER, durationUnit TEXT,
        level TEXT, medium TEXT, createdAt INTEGER)`,

      // Classes
      `CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY, schoolId TEXT, courseId TEXT,
        name TEXT, grade TEXT, order_ INTEGER, createdAt INTEGER)`,

      // Sections
      `CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY, classId TEXT, schoolId TEXT,
        name TEXT, roomNo TEXT, capacity INTEGER,
        classTeacherId TEXT, createdAt INTEGER)`,

      // Students
      `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY, schoolId TEXT, sectionId TEXT, classId TEXT,
        admissionNo TEXT, pen TEXT, ftpen TEXT,
        name TEXT, dob TEXT, gender TEXT, bloodGroup TEXT,
        fatherName TEXT, motherName TEXT, guardianName TEXT,
        phone TEXT, email TEXT, address TEXT,
        session TEXT, status TEXT,
        photoKey TEXT, signatureKey TEXT,
        createdAt INTEGER, updatedAt INTEGER)`,

      // Staff
      `CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY, schoolId TEXT, deptId TEXT,
        name TEXT, role TEXT, designation TEXT,
        email TEXT, phone TEXT, address TEXT, dob TEXT,
        joiningDate TEXT, salary REAL, status TEXT,
        photoKey TEXT, signatureKey TEXT,
        createdAt INTEGER, updatedAt INTEGER)`,

      // Admissions
      `CREATE TABLE IF NOT EXISTS admissions (
        id TEXT PRIMARY KEY, schoolId TEXT, studentId TEXT,
        classId TEXT, sectionId TEXT, session TEXT,
        formData TEXT, status TEXT,
        parentSignatureKey TEXT, studentSignatureKey TEXT,
        submittedAt INTEGER, updatedAt INTEGER)`,

      // Timetable / Schedule
      `CREATE TABLE IF NOT EXISTS timetable (
        id TEXT PRIMARY KEY, sectionId TEXT, schoolId TEXT,
        dayOfWeek INTEGER, subjectId TEXT, teacherId TEXT,
        startTime TEXT, endTime TEXT, type TEXT, createdAt INTEGER)`,

      // Subjects
      `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY, schoolId TEXT, classId TEXT,
        name TEXT, code TEXT, medium TEXT, createdAt INTEGER)`,

      // Syllabus
      `CREATE TABLE IF NOT EXISTS syllabus (
        id TEXT PRIMARY KEY, subjectId TEXT, classId TEXT, schoolId TEXT,
        unit TEXT, topic TEXT, description TEXT,
        plannedDate TEXT, completedDate TEXT, createdAt INTEGER)`,

      // Holidays & Calendar
      `CREATE TABLE IF NOT EXISTS calendar (
        id TEXT PRIMARY KEY, schoolId TEXT,
        title TEXT, date TEXT, type TEXT,
        description TEXT, createdAt INTEGER)`,

      // Exams
      `CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY, schoolId TEXT, classId TEXT, sectionId TEXT,
        name TEXT, type TEXT, subjectId TEXT,
        startDate TEXT, endDate TEXT,
        maxMarks REAL, passingMarks REAL, createdAt INTEGER)`,

      // Results
      `CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY, examId TEXT, studentId TEXT, schoolId TEXT,
        marksObtained REAL, grade TEXT, remarks TEXT,
        createdAt INTEGER)`,

      // Attendance
      `CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY, schoolId TEXT, sectionId TEXT,
        studentId TEXT, date TEXT, status TEXT,
        markedBy TEXT, createdAt INTEGER)`,

      // Fee Structure
      `CREATE TABLE IF NOT EXISTS feeStructure (
        id TEXT PRIMARY KEY, schoolId TEXT, classId TEXT,
        name TEXT, amount REAL, frequency TEXT,
        dueDay INTEGER, createdAt INTEGER)`,

      // Fee Payments
      `CREATE TABLE IF NOT EXISTS feePayments (
        id TEXT PRIMARY KEY, schoolId TEXT, studentId TEXT,
        feeStructureId TEXT, amount REAL, discount REAL,
        lateFee REAL, paidAt INTEGER, method TEXT,
        receiptNo TEXT, remarks TEXT, createdAt INTEGER)`,

      // Notices
      `CREATE TABLE IF NOT EXISTS notices (
        id TEXT PRIMARY KEY, schoolId TEXT,
        title TEXT, content TEXT, type TEXT,
        targetType TEXT, targetId TEXT,
        authorId TEXT, authorName TEXT, authorRole TEXT,
        pinned INTEGER, createdAt INTEGER)`,

      // Clubs & Activities
      `CREATE TABLE IF NOT EXISTS clubs (
        id TEXT PRIMARY KEY, schoolId TEXT,
        name TEXT, type TEXT, description TEXT,
        inChargeId TEXT, meta TEXT, createdAt INTEGER)`,

      // Club Members
      `CREATE TABLE IF NOT EXISTS clubMembers (
        id TEXT PRIMARY KEY, clubId TEXT,
        memberId TEXT, memberType TEXT,
        role TEXT, joinedAt INTEGER)`,

      // Vehicles
      `CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY, schoolId TEXT,
        number TEXT, type TEXT, capacity INTEGER,
        driverName TEXT, driverPhone TEXT,
        routeId TEXT, parkingSlot TEXT, createdAt INTEGER)`,

      // Routes
      `CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY, schoolId TEXT,
        name TEXT, stops TEXT,
        createdAt INTEGER)`,

      // Transport Assignments
      `CREATE TABLE IF NOT EXISTS transportAssignments (
        id TEXT PRIMARY KEY, schoolId TEXT,
        memberId TEXT, memberType TEXT,
        vehicleId TEXT, routeId TEXT,
        stopName TEXT, pickupTime TEXT, dropTime TEXT,
        createdAt INTEGER)`,

      // HR Records
      `CREATE TABLE IF NOT EXISTS hr (
        id TEXT PRIMARY KEY, schoolId TEXT, staffId TEXT,
        type TEXT, date TEXT, description TEXT,
        amount REAL, status TEXT, createdAt INTEGER)`,

      // ID Card Templates
      `CREATE TABLE IF NOT EXISTS idTemplates (
        id TEXT PRIMARY KEY, schoolId TEXT,
        name TEXT, widthMm REAL, heightMm REAL,
        frontLayout TEXT, backLayout TEXT,
        locked INTEGER, createdAt INTEGER)`,

      // Permissions
      `CREATE TABLE IF NOT EXISTS permissions (
        id TEXT PRIMARY KEY, schoolId TEXT,
        userId TEXT, module TEXT, canRead INTEGER, canWrite INTEGER,
        grantedBy TEXT, createdAt INTEGER)`,

      // Settings
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, schoolId TEXT, value TEXT)`,

      // Notifications (Module #7 — class sync)
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY, schoolId TEXT,
        type TEXT, title TEXT, body TEXT,
        targetUserId TEXT, targetRole TEXT,
        sourceModule TEXT, sourceId TEXT,
        isRead INTEGER DEFAULT 0,
        createdAt INTEGER)`
    ];
    tables.forEach(t => _db.run(t));
    persistDB();
  }

  // ── Init ──────────────────────────────────────────────────────
  async function init() {
    _sql = await window.initSqlJs({ locateFile: file => `vendors/${file}` });

    // Try to pull the DB from the Android server.
    // On first run (no DB yet) the server returns 204 → create fresh DB.
    let loaded = false;
    try {
      // First check if there are any school DBs saved on the device
      const listRes = await fetch('/api/gurukul/db/list');
      if (listRes.ok) {
        const listJson = await listRes.json();
        const schools = listJson.schools || [];
        // Use the first saved school, or default
        if (schools.length > 0) {
          _schoolCode = schools[0];
        }
      }

      const res = await fetch(`/api/gurukul/db/pull?school=${encodeURIComponent(_schoolCode)}`);
      if (res.ok && res.status !== 204) {
        const buf  = await res.arrayBuffer();
        const data = new Uint8Array(buf);
        if (data.length > 0) {
          _db = new _sql.Database(data);
          loaded = true;
          // Sync school code from the DB itself
          try {
            const row = first('SELECT name FROM schools LIMIT 1');
            if (row && row.name) setSchoolCode(row.name);
          } catch (_) {}
        }
      }
    } catch (e) {
      console.warn('[GK-DB] pull failed, starting fresh:', e);
    }

    if (!loaded) {
      _db = new _sql.Database();
    }

    createSchema();
    return true;
  }

  // ── Auth ──────────────────────────────────────────────────────
  function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem('gk_user')) || null; }
    catch { return null; }
  }
  function setCurrentUser(u) { sessionStorage.setItem('gk_user', JSON.stringify(u)); }
  function clearCurrentUser() { sessionStorage.removeItem('gk_user'); }

  function createUser(data) {
    const existing = first('SELECT id FROM users WHERE email=?', [data.email]);
    if (existing) throw new Error('ERR_EMAIL_EXISTS');
    const id = uid();
    run(`INSERT INTO users (id,email,passwordHash,name,role,schoolId,permissions,createdAt)
         VALUES (?,?,?,?,?,?,?,?)`,
      [id, data.email, btoa(data.password), data.name, data.role,
       data.schoolId || null, JSON.stringify(data.permissions || {}), Date.now()]);
    return first('SELECT * FROM users WHERE id=?', [id]);
  }

  function loginUser(email, password) {
    const user = first('SELECT * FROM users WHERE email=? AND passwordHash=?',
      [email, btoa(password)]);
    if (!user) throw new Error('ERR_INVALID_CREDENTIALS');
    setCurrentUser(user);
    return user;
  }

  function getUsers(schoolId) {
    return schoolId
      ? all('SELECT * FROM users WHERE schoolId=? ORDER BY name', [schoolId])
      : all('SELECT * FROM users ORDER BY name');
  }

  function updateUser(id, data) {
    const sets = Object.keys(data).map(k => `${k}=?`).join(',');
    run(`UPDATE users SET ${sets},updatedAt=? WHERE id=?`,
      [...Object.values(data), Date.now(), id]);
    return first('SELECT * FROM users WHERE id=?', [id]);
  }

  // ── Generic table helpers ─────────────────────────────────────
  function getAll(table, schoolId) {
    return schoolId
      ? all(`SELECT * FROM ${table} WHERE schoolId=? ORDER BY createdAt DESC`, [schoolId])
      : all(`SELECT * FROM ${table} ORDER BY createdAt DESC`);
  }
  function getById(table, id) {
    return first(`SELECT * FROM ${table} WHERE id=?`, [id]);
  }
  function deleteRow(table, id) {
    run(`DELETE FROM ${table} WHERE id=?`, [id]);
  }

  // ── Schools ───────────────────────────────────────────────────
  function saveSchool(d) {
    if (d.id) {
      run(`UPDATE schools SET name=?,address=?,phone=?,email=?,website=?,logo=?,
           type=?,board=?,medium=?,established=?,adminId=?,updatedAt=? WHERE id=?`,
        [d.name,d.address,d.phone,d.email,d.website,d.logo,
         d.type,d.board,d.medium,d.established,d.adminId,Date.now(),d.id]);
      return getById('schools', d.id);
    }
    const id = d.id || uid();
    run(`INSERT INTO schools (id,name,address,phone,email,website,logo,type,board,medium,established,adminId,createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,d.name,d.address,d.phone,d.email,d.website,d.logo||null,
       d.type,d.board,d.medium||'English',d.established||null,d.adminId||null,Date.now()]);
    return getById('schools', id);
  }

  // ── Students ──────────────────────────────────────────────────
  function saveStudent(d) {
    const cols = ['schoolId','sectionId','classId','admissionNo','pen','ftpen','name','dob',
      'gender','bloodGroup','fatherName','motherName','guardianName','phone','email',
      'address','session','status','photoKey','signatureKey'];
    if (d.id) {
      const sets = cols.map(c => `${c}=?`).join(',');
      run(`UPDATE students SET ${sets},updatedAt=? WHERE id=?`,
        [...cols.map(c => d[c]??null), Date.now(), d.id]);
      return getById('students', d.id);
    }
    const id = uid();
    run(`INSERT INTO students (id,${cols.join(',')},createdAt) VALUES (?,${cols.map(()=>'?').join(',')},?)`,
      [id, ...cols.map(c => d[c]??null), Date.now()]);
    return getById('students', id);
  }

  function getStudents(schoolId, filters = {}) {
    let q = 'SELECT * FROM students WHERE schoolId=?';
    const p = [schoolId];
    if (filters.classId)   { q += ' AND classId=?';   p.push(filters.classId); }
    if (filters.sectionId) { q += ' AND sectionId=?'; p.push(filters.sectionId); }
    if (filters.session)   { q += ' AND session=?';   p.push(filters.session); }
    if (filters.status)    { q += ' AND status=?';    p.push(filters.status); }
    if (filters.pen)       { q += ' AND pen=?';       p.push(filters.pen); }
    if (filters.ftpen)     { q += ' AND ftpen=?';     p.push(filters.ftpen); }
    q += ' ORDER BY name';
    return all(q, p);
  }

  // ── Staff ─────────────────────────────────────────────────────
  function saveStaff(d) {
    const cols = ['schoolId','deptId','name','role','designation','email','phone',
      'address','dob','joiningDate','salary','status','photoKey','signatureKey'];
    if (d.id) {
      const sets = cols.map(c => `${c}=?`).join(',');
      run(`UPDATE staff SET ${sets},updatedAt=? WHERE id=?`,
        [...cols.map(c => d[c]??null), Date.now(), d.id]);
      return getById('staff', d.id);
    }
    const id = uid();
    run(`INSERT INTO staff (id,${cols.join(',')},createdAt) VALUES (?,${cols.map(()=>'?').join(',')},?)`,
      [id, ...cols.map(c => d[c]??null), Date.now()]);
    return getById('staff', id);
  }

  // ── Admissions ────────────────────────────────────────────────
  function saveAdmission(d) {
    if (d.id) {
      run(`UPDATE admissions SET classId=?,sectionId=?,session=?,formData=?,status=?,
           parentSignatureKey=?,studentSignatureKey=?,updatedAt=? WHERE id=?`,
        [d.classId,d.sectionId,d.session,JSON.stringify(d.formData),d.status,
         d.parentSignatureKey,d.studentSignatureKey,Date.now(),d.id]);
      return getById('admissions', d.id);
    }
    const id = uid();
    run(`INSERT INTO admissions (id,schoolId,studentId,classId,sectionId,session,
         formData,status,parentSignatureKey,studentSignatureKey,submittedAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id,d.schoolId,d.studentId||null,d.classId,d.sectionId,d.session,
       JSON.stringify(d.formData||{}),d.status||'pending',
       d.parentSignatureKey||null,d.studentSignatureKey||null,Date.now()]);
    return getById('admissions', id);
  }

  // ── Exams & Results ───────────────────────────────────────────
  function saveExam(d) {
    if (d.id) {
      run(`UPDATE exams SET name=?,type=?,subjectId=?,classId=?,sectionId=?,
           startDate=?,endDate=?,maxMarks=?,passingMarks=? WHERE id=?`,
        [d.name,d.type,d.subjectId,d.classId,d.sectionId,
         d.startDate,d.endDate,d.maxMarks,d.passingMarks,d.id]);
      return getById('exams', d.id);
    }
    const id = uid();
    run(`INSERT INTO exams (id,schoolId,classId,sectionId,name,type,subjectId,
         startDate,endDate,maxMarks,passingMarks,createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,d.schoolId,d.classId,d.sectionId,d.name,d.type,d.subjectId||null,
       d.startDate,d.endDate,d.maxMarks||100,d.passingMarks||33,Date.now()]);
    return getById('exams', id);
  }

  function saveResult(d) {
    if (d.id) {
      run('UPDATE results SET marksObtained=?,grade=?,remarks=? WHERE id=?',
        [d.marksObtained, d.grade, d.remarks, d.id]);
      return getById('results', d.id);
    }
    const id = uid();
    run(`INSERT INTO results (id,examId,studentId,schoolId,marksObtained,grade,remarks,createdAt)
         VALUES (?,?,?,?,?,?,?,?)`,
      [id,d.examId,d.studentId,d.schoolId,d.marksObtained,d.grade||null,d.remarks||null,Date.now()]);
    return getById('results', id);
  }

  // ── Fee Payments ──────────────────────────────────────────────
  function saveFeePayment(d) {
    if (d.id) {
      run(`UPDATE feePayments SET amount=?,discount=?,lateFee=?,paidAt=?,
           method=?,receiptNo=?,remarks=? WHERE id=?`,
        [d.amount,d.discount||0,d.lateFee||0,d.paidAt||Date.now(),
         d.method,d.receiptNo,d.remarks||null,d.id]);
      return getById('feePayments', d.id);
    }
    const id = uid();
    const receiptNo = d.receiptNo || ('RCP-' + Date.now().toString(36).toUpperCase());
    run(`INSERT INTO feePayments (id,schoolId,studentId,feeStructureId,amount,discount,
         lateFee,paidAt,method,receiptNo,remarks,createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,d.schoolId,d.studentId,d.feeStructureId||null,d.amount,d.discount||0,
       d.lateFee||0,d.paidAt||Date.now(),d.method||'cash',receiptNo,d.remarks||null,Date.now()]);
    return getById('feePayments', id);
  }

  // ── Notices ───────────────────────────────────────────────────
  function saveNotice(d) {
    if (d.id) {
      run(`UPDATE notices SET title=?,content=?,type=?,targetType=?,targetId=?,pinned=? WHERE id=?`,
        [d.title,d.content,d.type,d.targetType,d.targetId,d.pinned?1:0,d.id]);
      return getById('notices', d.id);
    }
    const id = uid();
    run(`INSERT INTO notices (id,schoolId,title,content,type,targetType,targetId,
         authorId,authorName,authorRole,pinned,createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,d.schoolId,d.title,d.content,d.type||'general',d.targetType||'school',
       d.targetId||null,d.authorId,d.authorName,d.authorRole,d.pinned?1:0,Date.now()]);
    return getById('notices', id);
  }

  // ── Transport ─────────────────────────────────────────────────
  function saveVehicle(d) {
    if (d.id) {
      run(`UPDATE vehicles SET number=?,type=?,capacity=?,driverName=?,driverPhone=?,
           routeId=?,parkingSlot=? WHERE id=?`,
        [d.number,d.type,d.capacity,d.driverName,d.driverPhone,d.routeId,d.parkingSlot,d.id]);
      return getById('vehicles', d.id);
    }
    const id = uid();
    run(`INSERT INTO vehicles (id,schoolId,number,type,capacity,driverName,driverPhone,routeId,parkingSlot,createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id,d.schoolId,d.number,d.type,d.capacity||0,d.driverName,d.driverPhone,
       d.routeId||null,d.parkingSlot||null,Date.now()]);
    return getById('vehicles', id);
  }

  function saveRoute(d) {
    if (d.id) {
      run('UPDATE routes SET name=?,stops=? WHERE id=?',
        [d.name, JSON.stringify(d.stops||[]), d.id]);
      return getById('routes', d.id);
    }
    const id = uid();
    run('INSERT INTO routes (id,schoolId,name,stops,createdAt) VALUES (?,?,?,?,?)',
      [id, d.schoolId, d.name, JSON.stringify(d.stops||[]), Date.now()]);
    return getById('routes', id);
  }

  // ── Permissions ───────────────────────────────────────────────
  function setPermission(d) {
    const existing = first('SELECT id FROM permissions WHERE schoolId=? AND userId=? AND module=?',
      [d.schoolId, d.userId, d.module]);
    if (existing) {
      run('UPDATE permissions SET canRead=?,canWrite=?,grantedBy=? WHERE id=?',
        [d.canRead?1:0, d.canWrite?1:0, d.grantedBy, existing.id]);
    } else {
      run(`INSERT INTO permissions (id,schoolId,userId,module,canRead,canWrite,grantedBy,createdAt)
           VALUES (?,?,?,?,?,?,?,?)`,
        [uid(), d.schoolId, d.userId, d.module, d.canRead?1:0, d.canWrite?1:0, d.grantedBy, Date.now()]);
    }
  }

  function getPermissions(schoolId, userId) {
    return all('SELECT * FROM permissions WHERE schoolId=? AND userId=?', [schoolId, userId]);
  }

  function hasPermission(userId, module, type = 'read') {
    const col = type === 'write' ? 'canWrite' : 'canRead';
    const p = first(`SELECT ${col} FROM permissions WHERE userId=? AND module=?`, [userId, module]);
    if (!p) return false;
    return p[col] === 1;
  }

  // ── Settings ──────────────────────────────────────────────────
  function getSetting(schoolId, key) {
    const r = first('SELECT value FROM settings WHERE key=? AND schoolId=?', [key, schoolId]);
    return r ? r.value : null;
  }
  function setSetting(schoolId, key, value) {
    const existing = first('SELECT key FROM settings WHERE key=? AND schoolId=?', [key, schoolId]);
    if (existing) run('UPDATE settings SET value=? WHERE key=? AND schoolId=?', [value, key, schoolId]);
    else run('INSERT INTO settings (key,schoolId,value) VALUES (?,?,?)', [key, schoolId, value]);
  }

  // ── Dashboard stats ───────────────────────────────────────────
  function getDashboardStats(schoolId, session) {
    const totalStudents  = first('SELECT COUNT(*) as n FROM students WHERE schoolId=? AND session=?', [schoolId, session])?.n || 0;
    const activeStudents = first("SELECT COUNT(*) as n FROM students WHERE schoolId=? AND session=? AND status='active'", [schoolId, session])?.n || 0;
    const suspended      = first("SELECT COUNT(*) as n FROM students WHERE schoolId=? AND status='suspended'", [schoolId])?.n || 0;
    const passedOut      = first("SELECT COUNT(*) as n FROM students WHERE schoolId=? AND status='passedout' AND session=?", [schoolId, session])?.n || 0;
    const totalStaff     = first("SELECT COUNT(*) as n FROM staff WHERE schoolId=? AND status='active'", [schoolId])?.n || 0;
    const pendingAdm     = first("SELECT COUNT(*) as n FROM admissions WHERE schoolId=? AND status='pending'", [schoolId])?.n || 0;
    const totalAdm       = first('SELECT COUNT(*) as n FROM admissions WHERE schoolId=? AND session=?', [schoolId, session])?.n || 0;
    return { totalStudents, activeStudents, suspended, passedOut, totalStaff, pendingAdm, totalAdm };
  }

  // ── Generic save (for simpler tables) ────────────────────────
  function genericSave(table, d, cols) {
    if (d.id) {
      const sets = cols.map(c => `${c}=?`).join(',');
      run(`UPDATE ${table} SET ${sets} WHERE id=?`, [...cols.map(c => d[c]??null), d.id]);
      return getById(table, d.id);
    }
    const id = uid();
    run(`INSERT INTO ${table} (id,${cols.join(',')},createdAt) VALUES (?,${cols.map(()=>'?').join(',')},?)`,
      [id, ...cols.map(c => d[c]??null), Date.now()]);
    return getById(table, id);
  }

  // ── FTPEN generator ───────────────────────────────────────────
  function generateFTPEN() {
    const yr  = new Date().getFullYear();
    const rnd = Math.random().toString(36).slice(2,6).toUpperCase() +
                Math.random().toString(36).slice(2,6).toUpperCase();
    return `FT-${yr}-${rnd}`;
  }

  // ── Notifications ─────────────────────────────────────────────
  function pushNotification(d) {
    const id = uid();
    run(`INSERT INTO notifications
         (id,schoolId,type,title,body,targetUserId,targetRole,sourceModule,sourceId,isRead,createdAt)
         VALUES (?,?,?,?,?,?,?,?,?,0,?)`,
      [id, d.schoolId, d.type||'info', d.title, d.body||'',
       d.targetUserId||null, d.targetRole||null,
       d.sourceModule||null, d.sourceId||null, Date.now()]);
  }

  function getNotifications(userId, schoolId, unreadOnly = false) {
    const user = first('SELECT role FROM users WHERE id=?', [userId]);
    const role = user?.role || '';
    const q = unreadOnly
      ? `SELECT * FROM notifications WHERE schoolId=? AND (targetUserId=? OR targetRole=? OR targetRole IS NULL) AND isRead=0 ORDER BY createdAt DESC LIMIT 50`
      : `SELECT * FROM notifications WHERE schoolId=? AND (targetUserId=? OR targetRole=? OR targetRole IS NULL) ORDER BY createdAt DESC LIMIT 50`;
    return all(q, [schoolId, userId, role]);
  }

  function countUnread(userId, schoolId) {
    const user = first('SELECT role FROM users WHERE id=?', [userId]);
    const role = user?.role || '';
    return first(
      `SELECT COUNT(*) as n FROM notifications WHERE schoolId=? AND (targetUserId=? OR targetRole=? OR targetRole IS NULL) AND isRead=0`,
      [schoolId, userId, role])?.n || 0;
  }

  function markNotifRead(id) {
    run('UPDATE notifications SET isRead=1 WHERE id=?', [id]);
  }

  function markAllNotifsRead(userId, schoolId) {
    const user = first('SELECT role FROM users WHERE id=?', [userId]);
    const role = user?.role || '';
    run(`UPDATE notifications SET isRead=1 WHERE schoolId=? AND (targetUserId=? OR targetRole=? OR targetRole IS NULL)`,
      [schoolId, userId, role]);
  }

  // convenient wrappers for simpler tables
  const saveDept      = d => genericSave('departments', d, ['schoolId','name','code','hodId','description']);
  const saveCourse    = d => genericSave('courses', d, ['schoolId','deptId','name','code','duration','durationUnit','level','medium']);
  const saveClass     = d => genericSave('classes', d, ['schoolId','courseId','name','grade','order_']);
  const saveSection   = d => genericSave('sections', d, ['classId','schoolId','name','roomNo','capacity','classTeacherId']);
  const saveSubject   = d => genericSave('subjects', d, ['schoolId','classId','name','code','medium']);
  const saveSyllabus  = d => genericSave('syllabus', d, ['subjectId','classId','schoolId','unit','topic','description','plannedDate','completedDate']);
  const saveCalendar  = d => genericSave('calendar', d, ['schoolId','title','date','type','description']);
  const saveTimetable = d => genericSave('timetable', d, ['sectionId','schoolId','dayOfWeek','subjectId','teacherId','startTime','endTime','type']);
  const saveClub      = d => genericSave('clubs', d, ['schoolId','name','type','description','inChargeId','meta']);
  const saveHR        = d => genericSave('hr', d, ['schoolId','staffId','type','date','description','amount','status']);
  const saveFeeStruct = d => genericSave('feeStructure', d, ['schoolId','classId','name','amount','frequency','dueDay']);
  const saveIDTemplate= d => genericSave('idTemplates', d, ['schoolId','name','widthMm','heightMm','frontLayout','backLayout','locked']);
  const saveTransportAssign = d => genericSave('transportAssignments', d,
    ['schoolId','memberId','memberType','vehicleId','routeId','stopName','pickupTime','dropTime']);
  const saveAttendance= d => genericSave('attendance', d, ['schoolId','sectionId','studentId','date','status','markedBy']);
  const saveClubMember= d => genericSave('clubMembers', d, ['clubId','memberId','memberType','role']);

  return {
    init, uid, persistDB, flushDB, exportDBFile, importDBFile,
    setSchoolCode, getSchoolCode,
    // blobs
    saveBlob, getBlob, deleteBlob,
    // auth
    getCurrentUser, setCurrentUser, clearCurrentUser,
    createUser, loginUser, updateUser, getUsers,
    // generic
    getAll, getById, deleteRow, all, first, run,
    // school
    saveSchool,
    // dept/course
    saveDept, saveCourse,
    // class/section
    saveClass, saveSection,
    // students
    saveStudent, getStudents,
    // staff
    saveStaff,
    // admissions
    saveAdmission,
    // exams
    saveExam, saveResult,
    // fees
    saveFeeStruct, saveFeePayment,
    // notices
    saveNotice,
    // clubs
    saveClub, saveClubMember,
    // transport
    saveVehicle, saveRoute, saveTransportAssign,
    // hr
    saveHR,
    // id card
    saveIDTemplate,
    // syllabus / subjects
    saveSubject, saveSyllabus,
    // calendar / timetable / attendance
    saveCalendar, saveTimetable, saveAttendance,
    // permissions
    setPermission, getPermissions, hasPermission,
    // settings
    getSetting, setSetting,
    // dashboard
    getDashboardStats,
    // notifications
    pushNotification, getNotifications, countUnread, markNotifRead, markAllNotifsRead,
    // ftpen
    generateFTPEN
  };
})();
