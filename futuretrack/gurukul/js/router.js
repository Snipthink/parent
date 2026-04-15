/**
 * router.js — Hash-based SPA router
 *
 * Auth routes (#/role-select, #/login, #/signup, #/setup) render into
 * whichever element has id="view" that is currently visible.
 * The shell and auth-screen both contain a #view — the router finds the
 * first one that is not hidden.
 */
const Router = (() => {
  const routes = {};
  let _current   = null;
  let _beforeEach = null;

  function register(path, handler) { routes[path] = handler; }
  function beforeEach(fn)          { _beforeEach = fn; }

  function navigate(path) {
    window.location.hash = '#' + path;
  }

  function getView() {
    // Prefer the view inside whichever container is visible
    const authView  = document.getElementById('auth-view');
    const shellView = document.getElementById('view');
    const authScreen= document.getElementById('auth-screen');
    if (authScreen && authScreen.style.display !== 'none' && authView) return authView;
    return shellView;
  }

  function resolve() {
    const raw  = window.location.hash.replace(/^#/, '') || '/role-select';
    const [path, ...qparts] = raw.split('?');
    const query = {};
    qparts.join('?').split('&').forEach(p => {
      const [k, v] = p.split('=');
      if (k) query[k] = decodeURIComponent(v || '');
    });

    if (_beforeEach) {
      const allow = _beforeEach(path, query);
      if (allow === false) return;
    }

    const handler = routes[path] || routes['/404'];
    if (handler) {
      _current = path;
      const view = getView();
      if (view) { view.innerHTML = ''; handler(query, view); }
      if (typeof I18N !== 'undefined') I18N.apply();
    }
  }

  window.addEventListener('hashchange', resolve);
  // Do NOT auto-resolve on 'load' — boot() calls resolve() after DB is ready

  return { register, beforeEach, navigate, resolve, getCurrent: () => _current };
})();
