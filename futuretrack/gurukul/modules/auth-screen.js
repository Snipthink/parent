// ── Login ─────────────────────────────────────────────────────────
Router.register('/login', (query, view) => {
  const preRole = sessionStorage.getItem('gk_signup_role') || '';
  const isStudent = preRole === 'student';

  view.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="../images/favicon.svg" alt="Gurukul">
        <div>
          <h1>Gurukul ERP</h1>
          <p data-i18n="auth.welcome_back">Welcome back</p>
        </div>
      </div>
      <div id="auth-err" class="auth-err hidden"></div>
      <div class="form-group">
        <label data-i18n="auth.email">Email</label>
        <input class="form-control" type="email" id="loginEmail" placeholder="you@school.edu"
               onkeydown="if(event.key==='Enter') doLogin()" oninput="updateLoginFtpenVisibility()">
      </div>
      <div class="form-group">
        <label data-i18n="auth.password">Password</label>
        <div class="pw-wrap">
          <input class="form-control" type="password" id="loginPw" placeholder="••••••••"
                 onkeydown="if(event.key==='Enter') doLogin()">
          <button class="pw-toggle" onclick="togglePw('loginPw',this)" type="button">👁</button>
        </div>
      </div>
      <!-- FTPEN field — shown for student role or auto-detected -->
      <div class="form-group" id="ftpen-login-group" style="${isStudent ? '' : 'display:none'}">
        <label>FTPEN <span style="color:var(--red)">*</span></label>
        <input class="form-control" id="loginFtpen" placeholder="FT-2024-XXXXXXXX"
               style="font-family:'Space Grotesk',monospace;letter-spacing:0.05em"
               onkeydown="if(event.key==='Enter') doLogin()">
        <div class="hint" style="margin-top:5px;font-size:11px;color:var(--muted)">
          Your FutureTrack Permanent Education Number — issued by your school on admission.
        </div>
      </div>
      <button class="btn-primary full-btn" onclick="doLogin()" data-i18n="auth.login">Login</button>
      <p class="auth-switch">
        <span data-i18n="auth.no_account">Don't have an account?</span>
        <a href="#/role-select" data-i18n="auth.signup">Sign Up</a>
      </p>
    </div>
  </div>`;
  I18N.apply(view);
});

// Auto-detect if email belongs to a student and show FTPEN field
function updateLoginFtpenVisibility() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const group = document.getElementById('ftpen-login-group');
  if (!group || !email || !email.includes('@')) return;
  const user = DB.first('SELECT role FROM users WHERE email=?', [email]);
  if (user && user.role === 'student') {
    group.style.display = '';
  } else if (user) {
    group.style.display = 'none';
  }
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPw').value;
  const ftpen = document.getElementById('loginFtpen')?.value.trim() || '';
  const err   = document.getElementById('auth-err');
  err.classList.add('hidden');
  if (!email || !pw) { showAuthErr(err, I18N.get('auth.err_fill_all')); return; }
  try {
    const user = Auth.login(email, pw);

    // Student FTPEN check
    if (user.role === 'student') {
      if (!ftpen) {
        const g = document.getElementById('ftpen-login-group');
        if (g) g.style.display = '';
        showAuthErr(err, 'Please enter your FTPEN to continue.');
        return;
      }

      // Look up student record by FTPEN alone — school is auto-resolved from it
      const studentRec = DB.first(
        'SELECT id, schoolId, status FROM students WHERE ftpen=?',
        [ftpen.toUpperCase()]
      );

      if (!studentRec) {
        Auth.logout();
        showAuthErr(err,
          'FTPEN not found. Please complete your admission at a registered school first, ' +
          'or contact your school admin if you believe this is an error.');
        return;
      }

      if (studentRec.status === 'passout' || studentRec.status === 'suspended') {
        Auth.logout();
        showAuthErr(err,
          studentRec.status === 'passout'
            ? 'Your session with this school has completed (passed out). Contact the school for alumni access.'
            : 'Your account is currently suspended. Contact your school admin.');
        return;
      }

      // Auto-link schoolId from FTPEN record if user doesn't have one yet
      if (!user.schoolId && studentRec.schoolId) {
        DB.updateUser(user.id, { schoolId: studentRec.schoolId });
        user.schoolId = studentRec.schoolId;
        DB.setCurrentUser(user);
      }
    }

    APP.showShell(user);
    Router.navigate('/dashboard');
  } catch(e) {
    showAuthErr(err, e.message === 'ERR_INVALID_CREDENTIALS'
      ? I18N.get('auth.err_invalid') : I18N.get('auth.err_generic'));
  }
}

// ── Signup ────────────────────────────────────────────────────────
// School code required ONLY for: school (admin) role and teacher role
// All other roles (student, accountant, hr, parent, etc.) → no school code needed on signup
// Admin with no school code → goes to /setup
// If email already exists → block with login link
Router.register('/signup', (query, view) => {
  const preRole = sessionStorage.getItem('gk_signup_role') || 'student';
  const isAdmin = ['admin','principal','superadmin'].includes(preRole);

  view.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card signup-card">
      <div class="auth-logo">
        <img src="../images/favicon.svg" alt="Gurukul">
        <div>
          <h1>Gurukul ERP</h1>
          <p data-i18n="auth.create_account">Create your account</p>
        </div>
      </div>
      <div id="signup-err" class="auth-err hidden"></div>

      <!-- Step indicator -->
      <div class="signup-steps">
        <div class="ss-step active" id="step-dot-1">1</div>
        <div class="ss-line" id="ss-line-1"></div>
        <div class="ss-step" id="step-dot-2">2</div>
      </div>

      <!-- Step 1: Basic info + role -->
      <div id="signup-step-1">
        <p class="signup-step-label">Step 1 — Your details</p>
        <div class="form-group">
          <label data-i18n="auth.full_name">Full Name</label>
          <input class="form-control" id="sName" placeholder="Your full name">
        </div>
        <div class="form-group">
          <label data-i18n="auth.email">Email</label>
          <input class="form-control" type="email" id="sEmail" placeholder="you@school.edu"
                 oninput="checkEmailExists()">
          <div id="email-check-msg" class="email-check-msg"></div>
        </div>
        <div class="form-group">
          <label data-i18n="auth.role">Role</label>
          <select class="form-control" id="sRole" onchange="onRoleChange()">
            ${isAdmin
              ? `<option value="admin">School Admin / Director</option>
                 <option value="principal">Principal</option>
                 <option value="superadmin">Super Admin</option>`
              : `<option value="student">Student</option>
                 <option value="teacher">Teacher / Educator</option>
                 <option value="accountant">Accountant</option>
                 <option value="hr">HR Manager</option>
                 <option value="supervisor">Supervisor</option>
                 <option value="secretary">Secretary</option>
                 <option value="parent">Parent</option>`}
          </select>
        </div>
        <button class="btn-primary full-btn" onclick="signupStep1Next()">Continue →</button>
        <p class="auth-switch">
          <span data-i18n="auth.have_account">Already have an account?</span>
          <a href="#/login" data-i18n="auth.login">Login</a>
        </p>
      </div>

      <!-- Step 2: Password + conditional school code -->
      <div id="signup-step-2" style="display:none">
        <p class="signup-step-label" id="step2-label">Step 2 — Set password</p>
        <div class="form-group">
          <label data-i18n="auth.password">Password</label>
          <div class="pw-wrap">
            <input class="form-control" type="password" id="sPw" placeholder="Min 6 characters"
                   oninput="updatePwStrength()">
            <button class="pw-toggle" onclick="togglePw('sPw',this)" type="button">👁</button>
          </div>
          <div class="pw-strength-bar" style="margin-top:6px;background:var(--border);border-radius:2px;height:4px;overflow:hidden">
            <div id="pw-strength-fill" style="height:100%;width:0;border-radius:2px;transition:all 0.4s"></div>
          </div>
        </div>
        <div class="form-group">
          <label data-i18n="auth.confirm_password">Confirm Password</label>
          <input class="form-control" type="password" id="sPw2" placeholder="Repeat password">
        </div>

        <!-- School code: shown only for school-admin and teacher roles -->
        <div class="form-group" id="school-code-group" style="display:none">
          <label id="school-code-label">School Code <span style="color:var(--red)">*</span></label>
          <input class="form-control" id="sSchoolCode" placeholder="Get this from your school admin">
          <div class="hint" id="school-code-hint" style="margin-top:6px;font-size:11px;color:var(--muted)">
            Ask your school's Gurukul ERP admin for the School ID.
          </div>
        </div>

        <!-- Admin: optional join existing school -->
        <div class="form-group" id="admin-join-group" style="display:none">
          <label>Join Existing School? <span style="color:var(--muted);font-weight:400">(Optional)</span></label>
          <input class="form-control" id="sSchoolCodeAdmin"
                 placeholder="Leave blank to create a new school">
          <div class="hint" style="margin-top:6px;font-size:11px;color:var(--muted)">
            Have a School ID? Enter it to join that school instead of creating a new one.
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-outline" onclick="signupGoStep(1)">← Back</button>
          <button class="btn-primary" style="flex:1" id="signup-submit-btn" onclick="doSignup()">
            Create Account →
          </button>
        </div>
      </div>

    </div>
  </div>`;

  document.getElementById('sRole').value = preRole;
  I18N.apply(view);
  // Trigger initial role-based UI update
  onRoleChange();
});

// ── Email existence check (live, debounced) ───────────────────────
let _emailCheckTimer = null;
function checkEmailExists() {
  clearTimeout(_emailCheckTimer);
  _emailCheckTimer = setTimeout(() => {
    const email = document.getElementById('sEmail')?.value.trim();
    const msg   = document.getElementById('email-check-msg');
    if (!msg || !email || !email.includes('@')) { if(msg) { msg.className='email-check-msg'; msg.innerHTML=''; } return; }
    const exists = DB.first('SELECT id FROM users WHERE email=?', [email]);
    msg.className = 'email-check-msg visible';
    if (exists) {
      msg.innerHTML = `<span class="ecm-taken">✗ Already registered — <a href="#/login">Login instead</a></span>`;
    } else {
      msg.innerHTML = `<span class="ecm-free">✓ Email available</span>`;
    }
  }, 400);
}

function onRoleChange() {
  const role = document.getElementById('sRole')?.value || '';
  const schoolCodeGroup = document.getElementById('school-code-group');
  const adminJoinGroup  = document.getElementById('admin-join-group');
  const submitBtn       = document.getElementById('signup-submit-btn');
  if (!schoolCodeGroup) return;  // Step 2 not yet rendered

  const isAdmin   = ['admin','principal','superadmin'].includes(role);
  const isTeacher = role === 'teacher';
  const needsCode = isTeacher; // school (admin) has separate optional join group

  schoolCodeGroup.style.display = needsCode ? '' : 'none';
  if (adminJoinGroup) adminJoinGroup.style.display = isAdmin ? '' : 'none';
  if (submitBtn) submitBtn.textContent = isAdmin ? 'Create Account →' : needsCode ? 'Join School →' : 'Create Account →';
}

// ── Step navigation ───────────────────────────────────────────────
function signupStep1Next() {
  const name  = document.getElementById('sName').value.trim();
  const email = document.getElementById('sEmail').value.trim();
  const err   = document.getElementById('signup-err');
  err.classList.add('hidden');

  if (!name)                      { showAuthErr(err, 'Please enter your full name.'); return; }
  if (!email || !email.includes('@')) { showAuthErr(err, I18N.get('auth.err_fill_all')); return; }

  const exists = DB.first('SELECT id FROM users WHERE email=?', [email]);
  if (exists) { showAuthErr(err, 'This email is already registered. Please login instead.'); return; }

  signupGoStep(2);
}

function signupGoStep(n) {
  document.getElementById('signup-step-1').style.display = n === 1 ? '' : 'none';
  document.getElementById('signup-step-2').style.display = n === 2 ? '' : 'none';
  const dot1 = document.getElementById('step-dot-1');
  const dot2 = document.getElementById('step-dot-2');
  const line1 = document.getElementById('ss-line-1');
  if (n === 1) {
    dot1.className = 'ss-step active'; dot2.className = 'ss-step';
    if (line1) line1.className = 'ss-line';
  } else {
    dot1.className = 'ss-step done'; dot2.className = 'ss-step active';
    if (line1) line1.className = 'ss-line done';
    // Re-run role UI update now that Step 2 DOM exists
    onRoleChange();
  }
}

function updatePwStrength() {
  const pw   = document.getElementById('sPw')?.value || '';
  const fill = document.getElementById('pw-strength-fill');
  if (!fill) return;
  let score = 0;
  if (pw.length >= 6)            score++;
  if (pw.length >= 10)           score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  fill.style.width      = (score / 5 * 100) + '%';
  fill.style.background = ['#ef4444','#f97316','#f59e0b','#22c55e','#16a34a'][score - 1] || '#ef4444';
}

// ── Final signup submit ───────────────────────────────────────────
function doSignup() {
  const name  = document.getElementById('sName').value.trim();
  const email = document.getElementById('sEmail').value.trim();
  const role  = document.getElementById('sRole').value;
  const pw    = document.getElementById('sPw').value;
  const pw2   = document.getElementById('sPw2').value;
  const err   = document.getElementById('signup-err');
  err.classList.add('hidden');

  if (!pw || pw.length < 6) { showAuthErr(err, I18N.get('auth.err_pw_short')); return; }
  if (pw !== pw2)            { showAuthErr(err, I18N.get('auth.err_pw_mismatch')); return; }

  const isAdmin   = ['admin','principal','superadmin'].includes(role);
  const isTeacher = role === 'teacher';

  let schoolId = null;

  if (isAdmin) {
    // Admin: optional join existing school
    const code = document.getElementById('sSchoolCodeAdmin')?.value.trim() || '';
    if (code) {
      const school = DB.first('SELECT id FROM schools WHERE id=?', [code]);
      if (!school) { showAuthErr(err, I18N.get('auth.err_school_code')); return; }
      schoolId = school.id;
    }
    // No code → will go to /setup to create school
  } else if (isTeacher) {
    // Teacher: school code required
    const code = document.getElementById('sSchoolCode')?.value.trim() || '';
    if (!code) { showAuthErr(err, 'Please enter your School Code to join a school.'); return; }
    const school = DB.first('SELECT id FROM schools WHERE id=?', [code]);
    if (!school) { showAuthErr(err, I18N.get('auth.err_school_code')); return; }
    schoolId = school.id;
  }
  // All other roles (student, accountant, hr, parent, etc.) → no school code required on signup

  try {
    DB.createUser({ name, email, password: pw, role, schoolId });
    const user = Auth.login(email, pw);

    if (isAdmin && !schoolId) {
      APP.showShell(user);
      Router.navigate('/setup');
    } else {
      APP.showShell(user);
      Router.navigate('/dashboard');
    }
  } catch(e) {
    showAuthErr(err, e.message === 'ERR_EMAIL_EXISTS'
      ? I18N.get('auth.err_email_exists') : e.message);
  }
}

// ── School Setup Wizard ───────────────────────────────────────────
Router.register('/setup', (query, view) => {
  const user = Auth.requireAuth();
  if (!user) return;
  view.innerHTML = `
  <div class="setup-wrap">
    <div class="setup-card">
      <div class="setup-header">
        <img src="../images/favicon.svg" alt="Gurukul" style="width:40px;height:40px">
        <div>
          <h2 data-i18n="setup.title">Setup Your School / Institute</h2>
          <p data-i18n="setup.subtitle">Fill in basic details to get started.</p>
        </div>
      </div>
      <div id="setup-err" class="auth-err hidden"></div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="setup.school_name">School / Institute Name *</label>
          <input class="form-control" id="setupName" placeholder="e.g. Delhi Public School">
        </div>
        <div class="form-group">
          <label data-i18n="setup.type">Type</label>
          <select class="form-control" id="setupType">
            <option value="school">School (Nursery–XII)</option>
            <option value="college">College / University</option>
            <option value="coaching">Coaching / Institute</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="setup.board">Board / Affiliation</label>
          <select class="form-control" id="setupBoard">
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State">State Board</option>
            <option value="IB">IB</option>
            <option value="IGCSE">IGCSE</option>
            <option value="University">University (Autonomous)</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label data-i18n="setup.medium">Medium of Instruction</label>
          <select class="form-control" id="setupMedium">
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Both">English + Hindi</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="setup.phone">Phone</label>
          <input class="form-control" id="setupPhone" placeholder="+91 ...">
        </div>
        <div class="form-group">
          <label data-i18n="setup.email">Email</label>
          <input class="form-control" type="email" id="setupEmail"
                 value="${user.email||''}" placeholder="info@school.edu">
        </div>
      </div>
      <div class="form-group">
        <label data-i18n="setup.address">Address</label>
        <textarea class="form-control" id="setupAddress" rows="2"
                  placeholder="Full address with city, state, PIN"></textarea>
      </div>

      <button class="btn-primary full-btn" style="margin-top:8px" onclick="doSetup()">
        <span data-i18n="setup.create">Create School & Enter Dashboard</span>
      </button>
    </div>
  </div>`;
  I18N.apply(view);
});

function doSetup() {
  const user = Auth.currentUser();
  if (!user) { Router.navigate('/role-select'); return; }

  const name = document.getElementById('setupName')?.value.trim();
  const err  = document.getElementById('setup-err');

  if (!name) { showAuthErr(err, I18N.get('setup.err_name')); return; }

  try {
    const school = DB.saveSchool({
      name,
      type:    document.getElementById('setupType').value,
      board:   document.getElementById('setupBoard').value,
      medium:  document.getElementById('setupMedium').value,
      phone:   document.getElementById('setupPhone').value.trim(),
      email:   document.getElementById('setupEmail').value.trim(),
      address: document.getElementById('setupAddress').value.trim(),
      adminId: user.id
    });

    // Link school to admin user and persist to session
    DB.updateUser(user.id, { schoolId: school.id });
    const updatedUser = { ...user, schoolId: school.id };
    DB.setCurrentUser(updatedUser);

    // Update DB persistence key to use the school name as the filename
    DB.setSchoolCode(school.name);
    DB.flushDB(); // immediate push so Android saves <schoolname>.db right away

    // Show school ID — admin must share this with teachers
    showToast(`School created! School ID: ${school.id} — share this with your staff.`, 'success', 7000);

    // Switch to shell and go to dashboard
    APP.showShell(updatedUser);
    Router.navigate('/dashboard');
  } catch(e) {
    console.error('Setup error:', e);
    showAuthErr(err, 'Failed to create school: ' + (e.message || 'Unknown error'));
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function showAuthErr(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}
