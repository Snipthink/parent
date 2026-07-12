/* ==========================================================================
   app.js — Core interactivity: nav, smooth scroll active-state, ripple,
   flow tabs, FAQ accordion, testimonial slider, contact form
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  const navToggler = document.getElementById("navToggler");
  const navLinks = document.getElementById("navLinks");
  if (navToggler && navLinks) {
    navToggler.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("mobile-open"))
    );
  }

  /* ---------- Active link on scroll ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a[href^='#']");
  function setActiveLink() {
    let currentId = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) currentId = sec.id;
    });
    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }
  document.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Ripple effect on .btn-swift ---------- */
  document.querySelectorAll(".btn-swift").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const circle = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      circle.classList.add("ripple");
      circle.style.width = circle.style.height = size + "px";
      circle.style.left = e.clientX - rect.left - size / 2 + "px";
      circle.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });

  /* ---------- How It Works — flow tabs ---------- */
  const flowTabs = document.querySelectorAll(".flow-tab-btn");
  const flowPanels = document.querySelectorAll("[data-flow-panel]");
  flowTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      flowTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-flow-target");
      flowPanels.forEach((p) => {
        p.style.display = p.getAttribute("data-flow-panel") === target ? "block" : "none";
      });
    });
  });

  /* ---------- Services: show more / less ---------- */
  const showMoreBtn = document.getElementById("servicesShowMore");
  const extraServices = document.querySelectorAll(".service-card.is-extra");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      const expanded = showMoreBtn.getAttribute("data-expanded") === "true";
      extraServices.forEach((card) => {
        card.style.display = expanded ? "none" : "block";
      });
      showMoreBtn.setAttribute("data-expanded", (!expanded).toString());
      showMoreBtn.querySelector("span").textContent = expanded ? "View All 24 Services" : "Show Less";
      showMoreBtn.querySelector("i").className = expanded ? "bi bi-chevron-down" : "bi bi-chevron-up";
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById("testiTrack");
  const dotsWrap = document.getElementById("testiDots");
  const prevBtn = document.getElementById("testiPrev");
  const nextBtn = document.getElementById("testiNext");
  if (track) {
    const slides = track.querySelectorAll(".testi-slide");
    let index = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", "Go to review " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsWrap.querySelectorAll("button").forEach((d, di) => d.classList.toggle("active", di === index));
      resetAuto();
    }
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(index + 1), 5500);
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
    resetAuto();
  }

  /* ---------- Contact form (front-end only demo) ---------- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.classList.add("was-validated");
        return;
      }
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = "<i class='bi bi-check2'></i><span>Message Sent</span>";
      submitBtn.disabled = true;
      setTimeout(() => {
        contactForm.reset();
        contactForm.classList.remove("was-validated");
        submitBtn.innerHTML = originalHtml;
        submitBtn.disabled = false;
      }, 2600);
    });
  }

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector("button");
      const original = btn.innerHTML;
      btn.innerHTML = "<i class='bi bi-check2'></i>";
      setTimeout(() => (btn.innerHTML = original), 2200);
      newsletterForm.reset();
    });
  }
})();
