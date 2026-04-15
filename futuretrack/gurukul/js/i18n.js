/**
 * i18n.js — Translation engine
 * Uses data-i18n="key" attributes on elements.
 * Supports nested keys: "dashboard.title"
 * Falls back to English if key missing.
 */
const I18N = (() => {
  const STORAGE_KEY = 'gk_lang';
  let _lang = localStorage.getItem(STORAGE_KEY) || 'en';
  let _strings = {};

  const LANGS = [
    { code: 'en', label: 'English',  flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी',    flag: '🇮🇳' },
    { code: 'es', label: 'Español',  flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch',  flag: '🇩🇪' }
  ];

  async function load(lang) {
    try {
      const res = await fetch(`i18n/${lang}.json`);
      if (!res.ok) throw new Error();
      _strings = await res.json();
    } catch {
      if (lang !== 'en') {
        const res = await fetch('i18n/en.json');
        _strings = await res.json();
      }
    }
    _lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    apply();
  }

  function get(key, vars = {}) {
    const parts = key.split('.');
    let val = _strings;
    for (const p of parts) { val = val?.[p]; if (val === undefined) break; }
    if (typeof val !== 'string') return key;
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? k);
  }

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      const text = get(key);
      if (attr) el.setAttribute(attr, text);
      else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
        el.placeholder = text;
      else el.textContent = text;
    });
    document.documentElement.lang = _lang;
    document.documentElement.dir  = _lang === 'ar' ? 'rtl' : 'ltr';
  }

  function getLang()  { return _lang; }
  function getLangs() { return LANGS; }

  return { load, get, apply, getLang, getLangs };
})();
