/* ==========================================================================
   animation.js — Scroll reveals, animated counters, page loader,
   navbar scroll state, hero parallax
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Page loader ---------- */
  window.addEventListener("load", function () {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 350);
    }
  });

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById("mainNav");
  const backToTop = document.getElementById("backToTop");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");

    if (backToTop) {
      if (window.scrollY > 600) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute("data-counter"));
    const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals")) : 0;
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && counters.length) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  /* ---------- Hero parallax (subtle, mouse-based) ---------- */
  const radar = document.querySelector(".radar-wrap");
  const heroVisual = document.querySelector(".hero-visual");
  if (radar && heroVisual && window.matchMedia("(min-width: 992px)").matches) {
    heroVisual.addEventListener("mousemove", (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      radar.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
    });
    heroVisual.addEventListener("mouseleave", () => {
      radar.style.transform = "translate(0,0)";
    });
  }
})();
