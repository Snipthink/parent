/**
 * auth.js — Role-based auth layer
 * Wraps DB.loginUser / DB.createUser.
 * Firebase-swappable: replace internals here only.
 */
const Auth = (() => {
  const ROLE_HIERARCHY = {
    superadmin: 100, admin: 90, director: 85, trustee: 84,
    principal: 80, 'vice-principal': 75, dean: 70, hod: 65,
    teacher: 50, accountant: 45, secretary: 44, supervisor: 40,
    librarian: 35, transport: 30, hr: 30, staff: 20,
    student: 10, parent: 5, guest: 0
  };

  // Public modules visible per role
  const MODULE_ACCESS = {
    superadmin: '*',
    admin:      '*',
    director:   ['dashboard','admin','departments','classroom','syllabus','noticeboard',
                 'admissions','idcard','exams','results','fees','hr','transport','clubs','attendance'],
    trustee:    ['dashboard','departments','noticeboard','fees','hr'],
    principal:  ['dashboard','admin','departments','classroom','syllabus','noticeboard',
                 'admissions','idcard','exams','results','fees','hr','transport','clubs','attendance'],
    'vice-principal': ['dashboard','classroom','syllabus','noticeboard','admissions',
                       'exams','results','attendance','clubs'],
    dean:       ['dashboard','classroom','syllabus','noticeboard','exams','results','attendance'],
    hod:        ['dashboard','departments','classroom','syllabus','noticeboard','exams','results','attendance'],
    teacher:    ['dashboard','classroom','syllabus','noticeboard','exams','results','attendance','clubs'],
    accountant: ['dashboard','fees','admissions'],
    secretary:  ['dashboard','noticeboard','admissions','idcard'],
    supervisor: ['dashboard','attendance','transport'],
    student:    ['dashboard','noticeboard','results','attendance'],
    parent:     ['dashboard','noticeboard','results','fees']
  };

  function canAccess(user, module) {
    if (!user) return false;
    const access = MODULE_ACCESS[user.role];
    if (!access) return false;
    if (access === '*') return true;
    return access.includes(module);
  }

  function getRoleLevel(role) { return ROLE_HIERARCHY[role] || 0; }

  function canManageRole(actorRole, targetRole) {
    return getRoleLevel(actorRole) > getRoleLevel(targetRole);
  }

  function login(email, password) {
    return DB.loginUser(email, password);
  }

  function signup(data) {
    return DB.createUser(data);
  }

  function logout() {
    DB.clearCurrentUser();
    Router.navigate('/role-select');
  }

  function currentUser() { return DB.getCurrentUser(); }

  function requireAuth(redirectTo = '/login') {
    const user = currentUser();
    if (!user) { Router.navigate(redirectTo); return null; }
    return user;
  }

  function requireRole(allowedRoles) {
    const user = requireAuth();
    if (!user) return null;
    if (!allowedRoles.includes(user.role)) {
      Router.navigate('/dashboard');
      return null;
    }
    return user;
  }

  return {
    login, signup, logout, currentUser, requireAuth, requireRole,
    canAccess, canManageRole, getRoleLevel,
    ROLE_HIERARCHY, MODULE_ACCESS
  };
})();
