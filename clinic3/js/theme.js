import { loadJSON } from './utils.js';

let cfg = { themes: [] };
let current = localStorage.getItem('clinic_theme_palette') || 'sapphire';
let dark = localStorage.getItem('clinic_theme_mode') === 'dark';

export async function initTheme(def = 'sapphire') {
  cfg = await loadJSON('themes/theme.json');
  if (!cfg.themes?.length) throw new Error('themes/theme.json contains no themes');
  if (!cfg.themes.some((x) => x.id === current)) current = cfg.themes.some((x) => x.id === def) ? def : cfg.themes[0].id;
  applyTheme(current, dark);
  bind();
}

export function applyTheme(id = current, mode = dark) {
  const p = cfg.themes.find((x) => x.id === id) || cfg.themes[0];
  if (!p) return;
  current = p.id;
  dark = !!mode;
  localStorage.setItem('clinic_theme_palette', current);
  localStorage.setItem('clinic_theme_mode', dark ? 'dark' : 'light');

  const m = dark ? p.dark : p.light;
  const root = document.documentElement;
  const vars = {
    '--color-primary': m.primary,
    '--color-secondary': m.secondary,
    '--color-accent': m.accent,
    '--color-button-bg': m.button_background,
    '--color-button-text': m.button_text,
    '--color-badge-bg': m.section_background,
    '--color-badge-text': m.primary,
    '--color-background': m.background,
    '--color-section': m.section_background,
    '--color-card': m.card_background,
    '--color-heading': m.heading_text,
    '--color-body': m.body_text,
    '--color-muted': m.muted_text,
    '--color-border': m.border,
    '--color-input-bg': m.background
  };
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  root.dataset.theme = current;
  root.dataset.mode = dark ? 'dark' : 'light';

  const icon = dark ? 'fa-sun' : 'fa-moon';
  ['darkModeIcon', 'darkModeIconMobile', 'panelDarkModeIcon'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.className = `fa-regular ${icon}`;
  });
  const label = document.getElementById('panelDarkModeLabel');
  if (label) label.textContent = dark ? 'Light Mode' : 'Dark Mode';
  renderThemePanelSwatches();
}

export function renderThemePanelSwatches() {
  const el = document.getElementById('themePaletteList');
  if (!el) return;
  el.innerHTML = cfg.themes.map((p) => {
    const m = dark ? p.dark : p.light;
    const selected = p.id === current;
    return `<button type="button" data-theme-id="${p.id}" aria-pressed="${selected}" class="theme-swatch w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs ${selected ? 'theme-swatch-selected' : ''}"><div class="flex items-center gap-3"><span class="theme-swatch-dot" style="background:linear-gradient(135deg,${m.primary},${m.accent})"></span><span class="text-theme-heading">${p.name}</span></div>${selected ? '<i class="fa-solid fa-check text-theme-primary"></i>' : ''}</button>`;
  }).join('');
  el.querySelectorAll('[data-theme-id]').forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.themeId, dark));
  });
}

function bind() {
  const toggle = () => applyTheme(current, !dark);
  ['darkModeToggleBtn', 'darkModeToggleMobileBtn', 'panelDarkModeToggle'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', toggle);
  });

  const panel = document.getElementById('themeSettingsPanel');
  const settingsButton = document.getElementById('themeSettingsToggleBtn');
  settingsButton?.addEventListener('click', () => {
    const isHidden = panel?.classList.toggle('hidden');
    settingsButton.setAttribute('aria-expanded', String(isHidden === false));
  });
  document.getElementById('closeThemePanelBtn')?.addEventListener('click', () => {
    panel?.classList.add('hidden');
    settingsButton?.setAttribute('aria-expanded', 'false');
  });
}

window.applyTheme = applyTheme;
