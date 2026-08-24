/* ==========================================================================
   AURA RESTAURANT ENGINE - THEME & COLOR ENGINE
   ========================================================================== */

import { DataStore } from './dataStore.js';
import { getIconSvg, showToast } from './utils.js';

export class ThemeEngine {
  constructor() {
    this.currentThemeId = 'midnight-gold';
    this.currentMode = 'dark'; // 'dark' | 'light'
    this.themes = [];
  }

  init() {
    const savedTheme = localStorage.getItem('aura_theme_id');
    const savedMode = localStorage.getItem('aura_theme_mode');

    this.themes = DataStore.theme.themes || [];
    
    if (savedTheme && this.themes.some(t => t.id === savedTheme)) {
      this.currentThemeId = savedTheme;
    } else if (DataStore.settings?.theme?.defaultTheme) {
      this.currentThemeId = DataStore.settings.theme.defaultTheme;
    }

    if (savedMode) {
      this.currentMode = savedMode;
    } else if (DataStore.settings?.theme?.defaultMode) {
      this.currentMode = DataStore.settings.theme.defaultMode;
    }

    this.applyTheme(this.currentThemeId, this.currentMode);
    this.setupThemeModal();
  }

  applyTheme(themeId, mode) {
    const themeObj = this.themes.find(t => t.id === themeId) || this.themes[0];
    if (!themeObj) return;

    this.currentThemeId = themeObj.id;
    this.currentMode = mode;

    const palette = mode === 'light' ? themeObj.light : themeObj.dark;
    const root = document.documentElement;

    root.setAttribute('data-theme', themeObj.id);
    root.setAttribute('data-mode', mode);

    // Apply color variables to CSS root dynamically
    Object.keys(palette).forEach(key => {
      const cssVarName = `--${this.camelToKebab(key)}`;
      root.style.setProperty(cssVarName, palette[key]);
    });

    // Helper for RGB values used in semi-transparent overlays
    if (palette.primary) {
      const rgb = this.hexToRgb(palette.primary);
      if (rgb) root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    // Persist user selection
    localStorage.setItem('aura_theme_id', this.currentThemeId);
    localStorage.setItem('aura_theme_mode', this.currentMode);

    // Update Theme Trigger & Logo Assets according to mode
    this.updateBrandLogo();
  }

  toggleMode() {
    const newMode = this.currentMode === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentThemeId, newMode);
    showToast(`Switched to ${newMode.toUpperCase()} mode`, newMode === 'dark' ? '🌙' : '☀️');
  }

  updateBrandLogo() {
    const logos = DataStore.restaurant?.logo;
    if (!logos) return;

    const logoElements = document.querySelectorAll('.brand-logo-img');
    const selectedLogoUrl = this.currentMode === 'light' ? (logos.light || logos.default) : (logos.dark || logos.default);

    logoElements.forEach(img => {
      if (img && selectedLogoUrl) {
        img.src = selectedLogoUrl;
      }
    });
  }

  setupThemeModal() {
    // Inject Theme Trigger Button if allowed
    if (!DataStore.settings?.theme?.allowThemeSelector) return;

    let trigger = document.getElementById('theme-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.id = 'theme-trigger';
      trigger.className = 'theme-trigger-btn click-scale';
      trigger.setAttribute('aria-label', 'Open Color Theme Selector');
      trigger.innerHTML = getIconSvg('palette', 22);
      document.body.appendChild(trigger);

      trigger.addEventListener('click', () => this.openThemeModal());
    }
  }

  openThemeModal() {
    let modal = document.getElementById('theme-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'theme-modal';
      modal.className = 'theme-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="theme-modal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.6rem; margin-bottom: 2px;">Visual Theme Engine</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Customize color palettes & light/dark modes instantly</p>
          </div>
          <button id="close-theme-modal" class="btn-icon">${getIconSvg('x', 20)}</button>
        </div>

        <!-- Mode Toggle Row -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: var(--surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <button id="btn-mode-dark" class="btn ${this.currentMode === 'dark' ? 'btn-primary' : 'btn-secondary'}" style="flex: 1;">
            ${getIconSvg('moon', 16)} Dark Mode
          </button>
          <button id="btn-mode-light" class="btn ${this.currentMode === 'light' ? 'btn-primary' : 'btn-secondary'}" style="flex: 1;">
            ${getIconSvg('sun', 16)} Light Mode
          </button>
        </div>

        <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Select Curated Restaurant Theme</h4>
        <div class="theme-options-grid">
          ${this.themes.map(t => `
            <div class="theme-option-card ${t.id === this.currentThemeId ? 'active' : ''}" data-theme-id="${t.id}">
              <div class="theme-swatch" style="background: ${t.colorPreview};"></div>
              <div>
                <strong style="display: block; font-size: 0.95rem;">${t.name}</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted);">${t.subtitle}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Attach Event Listeners
    document.getElementById('close-theme-modal')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    document.getElementById('btn-mode-dark')?.addEventListener('click', () => {
      this.applyTheme(this.currentThemeId, 'dark');
      this.openThemeModal(); // Re-render active states
    });

    document.getElementById('btn-mode-light')?.addEventListener('click', () => {
      this.applyTheme(this.currentThemeId, 'light');
      this.openThemeModal();
    });

    modal.querySelectorAll('.theme-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const selectedId = card.getAttribute('data-theme-id');
        this.applyTheme(selectedId, this.currentMode);
        this.openThemeModal();
        showToast(`Applied Theme: ${card.querySelector('strong').textContent}`);
      });
    });
  }

  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
