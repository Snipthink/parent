/* ============================================================
   SHIV CLINIC — script.js
   All interactivity in vanilla JS. No patient data is ever
   stored (no localStorage/cookies) — it only becomes part of
   the WhatsApp message when the visitor presses Submit.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeaderScroll();
  initMobileNav();
  initActiveNavHighlight();
  initScrollReveal();
  initPulseDividers();
  initBackToTop();
  initRippleButtons();
  initStatCounters();
  initWhatsAppModal();
  initVoiceInput();
  initFormValidation();
});

/* ---------- 1. PAGE LOADER ---------- */
function initLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hidden"), 300);
  });
}

/* ---------- 2. HEADER SHRINK ON SCROLL ---------- */
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- 3. MOBILE NAV (Bootstrap collapse handles toggling;
   this just closes the menu after a link is clicked) ---------- */
function initMobileNav() {
  const collapseEl = document.getElementById("mainNav");
  if (!collapseEl) return;
  const links = collapseEl.querySelectorAll(".nav-link-clinic");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (collapseEl.classList.contains("show") && window.bootstrap) {
        const bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
        bsCollapse.hide();
      }
    });
  });
}

/* ---------- 4. ACTIVE SECTION HIGHLIGHT ---------- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link-clinic");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- 5. SCROLL REVEAL ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
}

/* ---------- 6. PULSE-LINE DIVIDERS (draw-on-scroll) ---------- */
function initPulseDividers() {
  const dividers = document.querySelectorAll(".pulse-divider");
  if (!dividers.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  dividers.forEach((d) => observer.observe(d));
}

/* ---------- 7. BACK TO TOP ---------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("visible", window.scrollY > 600),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- 9. BUTTON RIPPLE MICRO-INTERACTION ---------- */
function initRippleButtons() {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}

/* ---------- 10. ANIMATED STAT COUNTERS ---------- */
function initStatCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute("data-counter"));
    const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => observer.observe(c));
}

/* ---------- 11 & 12. WHATSAPP ENQUIRY MODAL + MESSAGE GENERATION ---------- */
const CLINIC_WHATSAPP_NUMBER = "919904799795"; // international format for wa.me

function initWhatsAppModal() {
  const modalEl = document.getElementById("whatsappModal");
  if (!modalEl || !window.bootstrap) return;

  // Any element with data-open-whatsapp opens the modal instead of
  // navigating straight to WhatsApp.
  document.querySelectorAll("[data-open-whatsapp]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });
  });
}

function initFormValidation() {
  const form = document.getElementById("enquiryForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("patientName");
    const age = document.getElementById("patientAge");
    const gender = document.getElementById("patientGender");
    const problem = document.getElementById("patientProblem");

    let valid = true;
    [name, age, gender, problem].forEach((field) => field.classList.remove("is-invalid"));

    if (!name.value.trim()) {
      name.classList.add("is-invalid");
      valid = false;
    }
    if (!age.value || Number(age.value) <= 0 || Number(age.value) > 120) {
      age.classList.add("is-invalid");
      valid = false;
    }
    if (!gender.value) {
      gender.classList.add("is-invalid");
      valid = false;
    }
    if (!problem.value.trim()) {
      problem.classList.add("is-invalid");
      valid = false;
    }

    if (!valid) return;

    const message =
      `Hello Shiv Clinic,\n\n` +
      `I would like to enquire about a healthcare concern.\n\n` +
      `Patient Name: ${name.value.trim()}\n` +
      `Age: ${age.value.trim()}\n` +
      `Gender: ${gender.value}\n\n` +
      `Health Concern:\n${problem.value.trim()}\n\n` +
      `Please guide me regarding the next steps.\n\n` +
      `Thank you.`;

    const url = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Data is never stored — it is only ever placed into this URL,
    // opened directly in a new tab, and then discarded from memory
    // once the page state resets below.
    window.open(url, "_blank", "noopener");

    const modalEl = document.getElementById("whatsappModal");
    if (modalEl && window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }
    form.reset();
    [name, age, gender, problem].forEach((field) => field.classList.remove("is-invalid"));
    const micStatus = document.getElementById("micStatus");
    if (micStatus) micStatus.textContent = "Tap the microphone and describe your concern.";
  });
}

/* ---------- 13. VOICE INPUT (Web Speech API) ---------- */
function initVoiceInput() {
  const micBtn = document.getElementById("micButton");
  const problemField = document.getElementById("patientProblem");
  const micStatus = document.getElementById("micStatus");
  if (!micBtn || !problemField) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.disabled = true;
    if (micStatus) micStatus.textContent = "Voice input is not supported by this browser. Please type your concern.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let listening = false;

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    problemField.value = problemField.value ? `${problemField.value} ${transcript}` : transcript;
  });

  recognition.addEventListener("end", () => {
    listening = false;
    micBtn.classList.remove("listening");
    if (micStatus) micStatus.textContent = "Tap the microphone and describe your concern.";
  });

  recognition.addEventListener("error", () => {
    listening = false;
    micBtn.classList.remove("listening");
    if (micStatus) micStatus.textContent = "We couldn't hear that clearly. Please try again or type your concern.";
  });

  micBtn.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      return;
    }
    listening = true;
    micBtn.classList.add("listening");
    if (micStatus) micStatus.textContent = "Listening… speak your health concern now.";
    try {
      recognition.start();
    } catch (e) {
      listening = false;
      micBtn.classList.remove("listening");
    }
  });
}
