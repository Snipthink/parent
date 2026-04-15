// ── Login ─────────────────────────────────────────────────────────
Router.register('/login', (query, view) => {
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
               onkeydown="if(event.key==='Enter') doLogin()">
      </div>
      <div class="form-group">
        <label data-i18n="auth.password">Password</label>
        <div class="pw-wrap">
          <input class="form-control" type="password" id="loginPw" placeholder="••••••••"
                 onkeydown="if(event.key==='Enter') doLogin()">
          <button class="pw-toggle" onclick="togglePw('loginPw',this)" type="button">👁</button>
        </div>
      </div>
      <button class="btn-primary full-btn" onclick="doLogin()" data-i18n="auth.login">Login</button>
      <p class="auth-switch">
        <span data-i18n="auth.no_account">Don't have an account?</span>
        <a href="#/signup" data-i18n="auth.signup">Sign Up</a>
      </p>
      <p class="auth-switch">
        <a href="#/role-select">← <span data-i18n="auth.back_roles">Back to roles</span></a>
      </p>
    </div>
  </div>`;
  I18N.apply(view);
});

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPw').value;
  const err   = document.getElementById('auth-err');
  err.classList.add('hidden');
  if (!email || !pw) { showAuthErr(err, I18N.get('auth.err_fill_all')); return; }
  try {
    const user = Auth.login(email, pw);
    APP.showShell(user);
    Router.navigate('/dashboard');
  } catch(e) {
    showAuthErr(err, e.message === 'ERR_INVALID_CREDENTIALS'
      ? I18N.get('auth.err_invalid') : I18N.get('auth.err_generic'));
  }
}

// ── Signup ────────────────────────────────────────────────────────
Router.register('/signup', (query, view) => {
  const role = sessionStorage.getItem('gk_signup_role') || 'student';
  view.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="../images/favicon.svg" alt="Gurukul">
        <div>
          <h1>Gurukul ERP</h1>
          <p data-i18n="auth.create_account">Create your account</p>
        </div>
      </div>
      <div id="signup-err" class="auth-err hidden"></div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="auth.full_name">Full Name</label>
          <input class="form-control" id="sName" placeholder="Your full name">
        </div>
        <div class="form-group">
          <label data-i18n="auth.role">Role</label>
          <select class="form-control" id="sRole">
            <option value="student">Student</option>
            <option value="teacher">Teacher / Educator</option>
            <option value="principal">Principal</option>
            <option value="admin">School Admin</option>
            <option value="accountant">Accountant</option>
            <option value="hr">HR Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="parent">Parent</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label data-i18n="auth.email">Email</label>
        <input class="form-control" type="email" id="sEmail" placeholder="you@school.edu">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="auth.password">Password</label>
          <div class="pw-wrap">
            <input class="form-control" type="password" id="sPw" placeholder="Min 6 chars">
            <button class="pw-toggle" onclick="togglePw('sPw',this)" type="button">👁</button>
          </div>
        </div>
        <div class="form-group">
          <label data-i18n="auth.confirm_password">Confirm Password</label>
          <input class="form-control" type="password" id="sPw2" placeholder="Repeat password">
        </div>
      </div>
      <div class="form-group">
        <label data-i18n="auth.school_code">School Code (leave blank if creating new)</label>
        <input class="form-control" id="sSchoolCode" placeholder="e.g. abc123xyz">
      </div>
      <button class="btn-primary full-btn" onclick="doSignup()">
        <span data-i18n="auth.signup">Sign Up</span>
      </button>
      <p class="auth-switch">
        <span data-i18n="auth.have_account">Already have an account?</span>
        <a href="#/login" data-i18n="auth.login">Login</a>
      </p>
    </div>
  </div>`;
  document.getElementById('sRole').value = role;
  I18N.apply(view);
});

function doSignup() {
  const name  = document.getElementById('sName').value.trim();
  const email = document.getElementById('sEmail').value.trim();
  const role  = document.getElementById('sRole').value;
  const pw    = document.getElementById('sPw').value;
  const pw2   = document.getElementById('sPw2').value;
  const code  = document.getElementById('sSchoolCode').value.trim();
  const err   = document.getElementById('signup-err');
  err.classList.add('hidden');

  if (!name || !email || !pw) { showAuthErr(err, I18N.get('auth.err_fill_all')); return; }
  if (pw !== pw2)              { showAuthErr(err, I18N.get('auth.err_pw_mismatch')); return; }
  if (pw.length < 6)           { showAuthErr(err, I18N.get('auth.err_pw_short')); return; }

  let schoolId = null;
  if (code) {
    const school = DB.first('SELECT id FROM schools WHERE id=?', [code]);
    if (!school) { showAuthErr(err, I18N.get('auth.err_school_code')); return; }
    schoolId = school.id;
  }

  try {
    DB.createUser({ name, email, password: pw, role, schoolId });
    const user = Auth.login(email, pw);
    // Admin/principal with no school → setup wizard
    if (['admin','principal','superadmin'].includes(role) && !schoolId) {
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
          <input class="form-control" type="email" id="setupEmail" placeholder="info@school.edu">
        </div>
      </div>
      <div class="form-group">
        <label data-i18n="setup.address">Address</label>
        <textarea class="form-control" id="setupAddress" rows="2"
                  placeholder="Full address with city, state, PIN"></textarea>
      </div>
      <button class="btn-primary full-btn" onclick="doSetup()">
        <span data-i18n="setup.create">Create & Enter Dashboard</span>
      </button>
    </div>
  </div>`;
  I18N.apply(view);
});

function doSetup() {
  const user = Auth.currentUser();
  if (!user) return;
  const name = document.getElementById('setupName').value.trim();
  const err  = document.getElementById('setup-err');
  if (!name) { showAuthErr(err, I18N.get('setup.err_name')); return; }

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

  DB.updateUser(user.id, { schoolId: school.id });
  const updatedUser = { ...user, schoolId: school.id };
  DB.setCurrentUser(updatedUser);
  APP.showShell(updatedUser);
  Router.navigate('/dashboard');
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
