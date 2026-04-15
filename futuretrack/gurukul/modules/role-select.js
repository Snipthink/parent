Router.register('/role-select', (query, view) => {
  view.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card role-card">
      <div class="auth-logo">
        <img src="../images/favicon.svg" alt="Gurukul">
        <div>
          <h1>Gurukul ERP</h1>
          <p data-i18n="role_select.subtitle">Select your role to continue</p>
        </div>
      </div>
      <div class="role-grid">
        <button class="role-btn" onclick="selectRole('student')">
          <span class="role-icon">🎓</span>
          <span data-i18n="role.student">Student</span>
        </button>
        <button class="role-btn" onclick="selectRole('teacher')">
          <span class="role-icon">👨‍🏫</span>
          <span data-i18n="role.educator">Individual Educator</span>
        </button>
        <button class="role-btn" onclick="selectRole('admin')">
          <span class="role-icon">🏛️</span>
          <span data-i18n="role.institute">Institute / College</span>
        </button>
        <button class="role-btn" onclick="selectRole('principal')">
          <span class="role-icon">🏫</span>
          <span data-i18n="role.school">School</span>
        </button>
      </div>
      <p class="auth-switch">
        <span data-i18n="role_select.have_account">Already have an account?</span>
        <a href="#/login" data-i18n="auth.login">Login</a>
      </p>
    </div>
  </div>`;
  I18N.apply(view);
});

function selectRole(role) {
  sessionStorage.setItem('gk_signup_role', role);
  Router.navigate('/signup');
}
