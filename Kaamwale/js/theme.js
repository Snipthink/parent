/* ==========================================================================
   theme.js — Light / Dark mode toggle with Local Storage persistence
   ========================================================================== */
(function () {
  "use strict";

  const STORAGE_KEY = "kaamwale-theme";
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggleBtn) toggleBtn.setAttribute("aria-pressed", theme === "dark");
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // Apply immediately (also mirrored inline in <head> to avoid flash — see index.html)
  applyTheme(getPreferredTheme());

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }
})();
