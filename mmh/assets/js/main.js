(function () {
  "use strict";

  // Placeholder Play Store URL — replace once the app is published.
  var PLAY_STORE_URL = "#download";

  var THEME_KEY = "mmh-theme";

  function applyThemeIcons(theme) {
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      var icon = btn.querySelector("i");
      var isDark = theme === "dark";
      if (icon) {
        icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
      }
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    applyThemeIcons(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage unavailable */ }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyThemeIcons(current);
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setTheme(next);
      });
    });

    document.querySelectorAll(".js-play-store-link").forEach(function (el) {
      if (PLAY_STORE_URL !== "#download") {
        el.setAttribute("href", PLAY_STORE_URL);
        el.removeAttribute("aria-describedby");
      }
    });

    var yearEls = document.querySelectorAll(".js-current-year");
    var year = new Date().getFullYear();
    yearEls.forEach(function (el) { el.textContent = year; });

    var navbar = document.querySelector(".site-navbar");
    if (navbar) {
      var onScroll = function () {
        navbar.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      var toggle = navbar.querySelector(".nav-toggle");
      if (toggle) {
        toggle.addEventListener("click", function () {
          var isOpen = navbar.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
        navbar.querySelectorAll(".mobile-panel a").forEach(function (link) {
          link.addEventListener("click", function () {
            navbar.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
          });
        });
      }
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      } else {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        revealEls.forEach(function (el) { observer.observe(el); });
      }
    }
  });
})();
