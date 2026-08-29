/* ═══════════════════════════════════════════════════════════════
   FT Book Store — app logic.
   Website = discovery + selection + filtering + catalogue.
   Google Drive = storage + final file/folder access.
   ═══════════════════════════════════════════════════════════════ */

/* ---------- Navbar (shared with rest of the site) ---------- */
window.addEventListener('scroll', function () {
  var nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});
function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
function closeMenu() { document.getElementById('navLinks').classList.remove('open'); }

/* ---------- CSV loading ---------- */
var catalogue = [];

function parseCSV(text) {
  var rows = [];
  var row = [];
  var field = '';
  var inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  var headers = rows[0].map(function (h) { return h.trim(); });
  return rows.slice(1).filter(function (r) { return r.some(function (v) { return v && v.trim(); }); }).map(function (r) {
    var obj = {};
    headers.forEach(function (h, idx) { obj[h] = (r[idx] || '').trim(); });
    obj.questionCount = parseInt(obj.questionCount, 10) || 0;
    obj.popular = String(obj.popular).toLowerCase() === 'true';
    return obj;
  });
}

function loadCatalogue() {
  return fetch('ft_store_data.csv', { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('CSV fetch failed: ' + res.status);
      return res.text();
    })
    .then(function (text) { catalogue = parseCSV(text); })
    .catch(function (err) {
      console.error('[FT Book Store] Could not load ft_store_data.csv', err);
      catalogue = [];
    });
}

/* ---------- Helpers ---------- */
function uniqueSorted(arr, key) {
  var seen = {};
  var out = [];
  arr.forEach(function (item) {
    var v = item[key];
    if (v && !seen[v]) { seen[v] = 1; out.push(v); }
  });
  return out.sort();
}
function matches(item, filters) {
  return Object.keys(filters).every(function (k) {
    if (!filters[k]) return true;
    return item[k] === filters[k];
  });
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------- State ---------- */
var state = { screen: 'home', query: '' };

var FT_STORE_SELECTION_FIELDS = ['class', 'board', 'stateBoard', 'medium', 'subject', 'country', 'exam', 'level', 'program'];

function go(screen, patch) {
  patch = patch || {};
  var reset = {
    class: ['board', 'stateBoard', 'medium', 'subject'],
    board: ['stateBoard', 'medium', 'subject'],
    stateBoard: ['medium', 'subject'],
    medium: ['subject'],
    country: ['exam'],
    level: ['program']
  };
  if ('category' in patch) {
    // Entering (or re-entering) a category root — drop every stale selection
    // from whatever flow was active before, so the breadcrumb never shows
    // leftover choices from a previous path.
    FT_STORE_SELECTION_FIELDS.forEach(function (f) { delete state[f]; });
  }
  Object.keys(patch).forEach(function (k) {
    (reset[k] || []).forEach(function (f) { delete state[f]; });
  });
  Object.assign(state, patch);
  state.screen = screen;
  window.scrollTo({ top: document.getElementById('storeTop').offsetTop - 90, behavior: 'smooth' });
  render();
}

function resetAll(screen) {
  state = { screen: screen, query: '' };
  render();
}

// Builds a safe `go(...)` call for embedding inside a single-quoted HTML
// onclick attribute — escapes stray apostrophes in CSV-sourced labels
// (e.g. a subject like "Children's Literature") so they can't break out
// of the attribute.
function goCall(screen, patch) {
  return 'go(' + JSON.stringify(screen) + ',' + JSON.stringify(patch || {}).replace(/'/g, '&#39;') + ')';
}

/* ---------- Breadcrumb ---------- */
function crumb(label, screen, patch) {
  return '<a href="javascript:void(0)" onclick=\'' + goCall(screen, patch) + '\'>' + esc(label) + '</a>';
}
function renderBreadcrumb() {
  var parts = [crumb('Home', 'home', {})];
  var s = state;
  if (s.screen === 'search') {
    parts.push('<span>Search: "' + esc(s.query) + '"</span>');
  } else if (s.category === 'school' || ['class-grid','board-grid','stateboard-grid','medium-grid','subject-grid'].indexOf(s.screen) > -1 || (s.screen === 'results' && s.category === 'school')) {
    parts.push(crumb('School', 'class-grid', { category: 'school' }));
    if (s.class) parts.push(crumb(s.class, 'board-grid', { category: 'school', class: s.class }));
    if (s.board) parts.push(crumb(s.board, s.board === 'State Board' ? 'stateboard-grid' : 'medium-grid', { category: 'school', class: s.class, board: s.board }));
    if (s.stateBoard) parts.push(crumb(s.stateBoard, 'medium-grid', { category: 'school', class: s.class, board: s.board, stateBoard: s.stateBoard }));
    if (s.medium) parts.push(crumb(s.medium, 'subject-grid', { category: 'school', class: s.class, board: s.board, stateBoard: s.stateBoard, medium: s.medium }));
    if (s.subject) parts.push('<span>' + esc(s.subject) + '</span>');
  } else if (s.category === 'competitive' || s.screen.indexOf('competitive') > -1 || (s.screen === 'results' && s.category === 'competitive')) {
    parts.push(crumb('Competitive Exams', 'competitive-country', { category: 'competitive' }));
    if (s.country) parts.push(crumb(countryName(s.country), 'competitive-exam', { category: 'competitive', country: s.country }));
    if (s.exam) parts.push('<span>' + esc(s.exam) + '</span>');
  } else if (s.category === 'higher-ed' || s.screen.indexOf('higher-ed') > -1 || (s.screen === 'results' && s.category === 'higher-ed')) {
    parts.push(crumb('Higher Education', 'higher-ed-level', { category: 'higher-ed' }));
    if (s.level) parts.push(crumb(s.level, 'higher-ed-program', { category: 'higher-ed', level: s.level }));
    if (s.program) parts.push('<span>' + esc(s.program) + '</span>');
  }
  var el = document.getElementById('storeBreadcrumb');
  if (s.screen === 'home') { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = parts.join('<i class="bi bi-chevron-right"></i>');
}
function countryName(code) {
  var c = FT_STORE_COUNTRIES.find(function (x) { return x.code === code; });
  return c ? c.flag + ' ' + c.name : code;
}

/* ---------- Card renderers ---------- */
function iconTile(icon, label, sub, onclick, available) {
  return '<button class="store-tile' + (available === false ? ' store-tile-empty' : '') + '" onclick=\'' + onclick + '\'>' +
    '<span class="store-tile-icon">' + icon + '</span>' +
    '<span class="store-tile-label">' + esc(label) + '</span>' +
    (sub ? '<span class="store-tile-sub">' + esc(sub) + '</span>' : '') +
    '</button>';
}

function resultCard(item) {
  var pop = item.popular ? '<span class="store-badge store-badge-hot">🔥 Popular</span>' : '';
  var meta = [];
  if (item.class) meta.push(item.class);
  if (item.board) meta.push(item.stateBoard || item.board);
  if (item.exam) meta.push(item.exam);
  if (item.country) meta.push(countryName(item.country));
  if (item.level) meta.push(item.level);
  if (item.program) meta.push(item.program);
  return '<div class="store-card">' +
    pop +
    '<div class="store-card-icon">📚</div>' +
    '<h3>' + esc(item.title) + '</h3>' +
    '<p class="store-card-meta">' + esc(meta.join(' • ')) + '</p>' +
    (item.medium ? '<p class="store-card-medium"><i class="bi bi-translate"></i> ' + esc(item.medium) + ' Medium</p>' : '') +
    '<p class="store-card-desc">' + esc(item.description) + '</p>' +
    '<div class="store-card-foot">' +
    (item.questionCount ? '<span class="store-qcount">' + esc(item.questionCount) + '+ Questions</span>' : '<span></span>') +
    '<a class="btn btn-primary store-open-btn" href="' + esc(item.driveUrl) + '" target="_blank" rel="noopener noreferrer">Open <i class="bi bi-box-arrow-up-right"></i></a>' +
    '</div></div>';
}

function emptyState(msg) {
  return '<div class="store-empty"><div class="store-empty-icon">🗂️</div><p>' + esc(msg) + '</p></div>';
}

/* ---------- Screens ---------- */
function render() {
  renderBreadcrumb();
  var main = document.getElementById('storeMain');
  var s = state;
  var html = '';

  if (s.screen === 'home') {
    html = renderHome();
  } else if (s.screen === 'search') {
    html = renderSearch();
  } else if (s.screen === 'class-grid') {
    html = renderClassGrid();
  } else if (s.screen === 'board-grid') {
    html = renderBoardGrid();
  } else if (s.screen === 'stateboard-grid') {
    html = renderStateBoardGrid();
  } else if (s.screen === 'medium-grid') {
    html = renderMediumGrid();
  } else if (s.screen === 'subject-grid') {
    html = renderSubjectGrid();
  } else if (s.screen === 'competitive-country') {
    html = renderCompetitiveCountries();
  } else if (s.screen === 'competitive-exam') {
    html = renderCompetitiveExams();
  } else if (s.screen === 'higher-ed-level') {
    html = renderHigherEdLevels();
  } else if (s.screen === 'higher-ed-program') {
    html = renderHigherEdPrograms();
  } else if (s.screen === 'results') {
    html = renderResults();
  }
  main.innerHTML = html;
}

function renderHome() {
  var popular = catalogue.filter(function (i) { return i.popular; }).slice(0, 6);
  var recent = catalogue.slice(-6).reverse();
  return '' +
    '<div class="store-entry-grid">' +
    '<button class="store-entry-card" onclick=\'go("class-grid",{category:"school"})\'>' +
      '<span class="store-entry-icon">🎓</span><h3>School</h3><p>Class 1 to 12 — question sets by board, medium & subject</p></button>' +
    '<button class="store-entry-card" onclick=\'go("competitive-country",{category:"competitive"})\'>' +
      '<span class="store-entry-icon">🏆</span><h3>Competitive Exams</h3><p>UPSC, JEE, NEET, SAT, GCSE & more</p></button>' +
    '<button class="store-entry-card" onclick=\'go("higher-ed-level",{category:"higher-ed"})\'>' +
      '<span class="store-entry-icon">🎓</span><h3>Higher Education</h3><p>UG, PG & PhD resources</p></button>' +
    '</div>' +
    (popular.length ? '<h2 class="store-section-title">🔥 Popular Question Sets</h2><div class="store-results-grid">' + popular.map(resultCard).join('') + '</div>' : '') +
    (recent.length ? '<h2 class="store-section-title">🆕 Recently Added</h2><div class="store-results-grid">' + recent.map(resultCard).join('') + '</div>' : '');
}

function renderSearch() {
  var q = (state.query || '').toLowerCase().trim();
  if (!q) return emptyState('Type in the search bar above to find question sets, books, subjects or exams.');
  var fields = ['title','description','class','board','stateBoard','medium','subject','country','exam','level','program'];
  var out = catalogue.filter(function (item) {
    return fields.some(function (f) { return item[f] && String(item[f]).toLowerCase().indexOf(q) > -1; }) ||
      (item.country && countryName(item.country).toLowerCase().indexOf(q) > -1);
  });
  if (!out.length) return emptyState('No question sets found for "' + state.query + '". Try a different keyword.');
  return '<h2 class="store-section-title">Search results for "' + esc(state.query) + '" — ' + out.length + ' found</h2>' +
    '<div class="store-results-grid">' + out.map(resultCard).join('') + '</div>';
}

function renderClassGrid() {
  var available = uniqueSorted(catalogue.filter(function (i) { return i.category === 'school'; }), 'class');
  return '<h2 class="store-section-title">🎓 Select Class</h2>' +
    '<div class="store-tile-grid">' + FT_STORE_CLASSES.map(function (c) {
      var has = available.indexOf(c) > -1;
      return iconTile('🎓', c, has ? '' : 'Coming soon', goCall('board-grid', { category: 'school', class: c }), has);
    }).join('') + '</div>';
}

function renderBoardGrid() {
  var pool = catalogue.filter(function (i) { return i.category === 'school' && i.class === state.class; });
  var available = uniqueSorted(pool, 'board');
  return '<h2 class="store-section-title">🏫 Select Exam Board <span class="store-section-sub">' + esc(state.class) + '</span></h2>' +
    (available.length ?
      '<div class="store-tile-grid">' + FT_STORE_BOARDS.map(function (b) {
        var has = available.indexOf(b) > -1;
        var target = b === 'State Board' ? 'stateboard-grid' : 'medium-grid';
        return iconTile('🏫', b, has ? '' : 'Coming soon', goCall(target, { category: 'school', class: state.class, board: b }), has);
      }).join('') + '</div>'
      : emptyState('No question sets available yet for ' + state.class + '. Check back soon.'));
}

function renderStateBoardGrid() {
  var pool = catalogue.filter(function (i) { return i.category === 'school' && i.class === state.class && i.board === 'State Board'; });
  var available = uniqueSorted(pool, 'stateBoard');
  return '<h2 class="store-section-title">🏫 Select State Board <span class="store-section-sub">' + esc(state.class) + '</span></h2>' +
    '<div class="store-tile-grid">' + FT_STORE_STATE_BOARDS.map(function (b) {
      var has = available.indexOf(b) > -1;
      return iconTile('🏫', b, has ? '' : 'Coming soon', goCall('medium-grid', { category: 'school', class: state.class, board: 'State Board', stateBoard: b }), has);
    }).join('') + '</div>';
}

function renderMediumGrid() {
  var filters = { category: 'school', class: state.class, board: state.board, stateBoard: state.stateBoard };
  var pool = catalogue.filter(function (i) { return matches(i, filters); });
  var available = uniqueSorted(pool, 'medium');
  return '<h2 class="store-section-title">🌐 Select Language / Medium</h2>' +
    (available.length ?
      '<div class="store-tile-grid">' + available.map(function (m) {
        return iconTile('🌐', m + ' Medium', '', goCall('subject-grid', Object.assign({}, filters, { medium: m })), true);
      }).join('') + '</div>'
      : emptyState('No question sets available yet for this board. Check back soon.'));
}

function renderSubjectGrid() {
  var filters = { category: 'school', class: state.class, board: state.board, stateBoard: state.stateBoard, medium: state.medium };
  var pool = catalogue.filter(function (i) { return matches(i, filters); });
  var available = uniqueSorted(pool, 'subject');
  return '<h2 class="store-section-title">📐 Select Subject</h2>' +
    '<div class="store-tile-grid">' + available.map(function (sub) {
      return iconTile('📚', sub, '', goCall('results', Object.assign({}, filters, { subject: sub })), true);
    }).join('') + '</div>';
}

function renderCompetitiveCountries() {
  return '<h2 class="store-section-title">🏆 Competitive Exams — Select Country</h2>' +
    '<div class="store-tile-grid">' + FT_STORE_COUNTRIES.map(function (c) {
      var has = catalogue.some(function (i) { return i.category === 'competitive' && i.country === c.code; });
      return iconTile(c.flag, c.name, has ? '' : 'Coming soon', goCall('competitive-exam', { category: 'competitive', country: c.code }), has);
    }).join('') + '</div>';
}

function renderCompetitiveExams() {
  var available = uniqueSorted(catalogue.filter(function (i) { return i.category === 'competitive' && i.country === state.country; }), 'exam');
  var list = FT_STORE_EXAMS_BY_COUNTRY[state.country] || [];
  return '<h2 class="store-section-title">Select Exam <span class="store-section-sub">' + countryName(state.country) + '</span></h2>' +
    '<div class="store-tile-grid">' + list.map(function (e) {
      var has = available.indexOf(e) > -1;
      return iconTile('🏆', e, has ? '' : 'Coming soon', goCall('results', { category: 'competitive', country: state.country, exam: e }), has);
    }).join('') + '</div>';
}

function renderHigherEdLevels() {
  return '<h2 class="store-section-title">🎓 Higher Education — Select Level</h2>' +
    '<div class="store-tile-grid">' + FT_STORE_HIGHER_ED_LEVELS.map(function (l) {
      var has = catalogue.some(function (i) { return i.category === 'higher-ed' && i.level === l; });
      return iconTile('🎓', l, has ? '' : 'Coming soon', goCall('higher-ed-program', { category: 'higher-ed', level: l }), has);
    }).join('') + '</div>';
}

function renderHigherEdPrograms() {
  var available = uniqueSorted(catalogue.filter(function (i) { return i.category === 'higher-ed' && i.level === state.level; }), 'program');
  var list = FT_STORE_HIGHER_ED_PROGRAMS[state.level] || [];
  return '<h2 class="store-section-title">Select Program <span class="store-section-sub">' + esc(state.level) + '</span></h2>' +
    '<div class="store-tile-grid">' + list.map(function (p) {
      var has = available.indexOf(p) > -1;
      return iconTile('📖', p, has ? '' : 'Coming soon', goCall('results', { category: 'higher-ed', level: state.level, program: p }), has);
    }).join('') + '</div>';
}

function renderResults() {
  var filters = {};
  ['category','class','board','stateBoard','medium','subject','country','exam','level','program'].forEach(function (k) {
    if (state[k]) filters[k] = state[k];
  });
  var out = catalogue.filter(function (i) { return matches(i, filters); });
  if (!out.length) return emptyState('No question sets found for this selection yet. Check back soon.');
  return '<h2 class="store-section-title">📚 Question Sets <span class="store-section-sub">' + out.length + ' found</span></h2>' +
    '<div class="store-results-grid">' + out.map(resultCard).join('') + '</div>';
}

/* ---------- Search bar wiring ---------- */
function initSearch() {
  var input = document.getElementById('storeSearch');
  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var val = input.value;
    timer = setTimeout(function () {
      if (val.trim()) go('search', { query: val });
      else if (state.screen === 'search') resetAll('home');
    }, 220);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && input.value.trim()) go('search', { query: input.value });
  });
}

/* ---------- Boot ---------- */
window.addEventListener('load', function () {
  initSearch();
  loadCatalogue().then(function () { render(); });
});
