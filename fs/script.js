const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const themeToggle = document.querySelector(".theme-toggle");
const revealEls = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const carouselItems = [
  ["Scan Result", "Moderate", "Sugar: Watch", "Salt: Medium", "Oil: Processed"],
  ["Ingredient Check", "Additives", "Emulsifier found", "Palm oil note", "Compare options"],
  ["Nutrition View", "Quality 82", "Fiber: Good", "Sugar: Medium", "Daily fit: Maybe"],
  ["Better Choice", "3 Found", "Lower sugar", "Cleaner label", "Higher fiber"]
];
let carouselIndex = 0;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

if (siteNav) {
  siteNav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      siteNav.classList.remove("open");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");
    themeToggle.textContent = body.classList.contains("light") ? "Light" : "Dark";
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => observer.observe(el));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = "true";
      animateCounter(entry.target);
    });
  },
  { threshold: 0.4 }
);

counters.forEach((counter) => counterObserver.observe(counter));

function animateCounter(el) {
  const target = Number(el.dataset.count);
  const isDecimal = !Number.isInteger(target);
  const start = performance.now();
  const duration = 1200;

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = isDecimal ? value.toFixed(2) : Math.round(value).toString();
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

document.querySelectorAll(".carousel-btn").forEach((button) => {
  button.addEventListener("click", () => {
    carouselIndex += Number(button.dataset.dir);
    if (carouselIndex < 0) carouselIndex = carouselItems.length - 1;
    if (carouselIndex >= carouselItems.length) carouselIndex = 0;
    const carouselImage = document.getElementById("carouselImage");
    if (carouselImage) {
      const item = carouselItems[carouselIndex % carouselItems.length];
      carouselImage.innerHTML = `<strong>${item[0]}</strong><span>${item[1]}</span><p>${item[2]}</p><p>${item[3]}</p><p>${item[4]}</p>`;
    }
  });
});

const wizard = document.getElementById("wizard");
const wizardBody = document.getElementById("wizardBody");
const progressBar = document.getElementById("progressBar");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const wizardTitle = document.getElementById("wizardTitle");
const answers = {};
let stepIndex = 0;

const steps = [
  { key: "packaged", title: "How often do you consume packaged food?", options: ["Never", "Sometimes", "Frequently", "Daily"] },
  { key: "drinks", title: "How many sugary drinks do you consume each week?", options: ["0", "1-2", "3-5", "More than 5"] },
  { key: "labels", title: "Do you usually read food labels?", options: ["Always", "Sometimes", "Rarely", "Never"] },
  { key: "exercise", title: "Do you exercise?", options: ["Never", "Sometimes", "Regularly"] },
  { key: "sleep", title: "How many hours do you sleep?", options: ["Less than 5", "5-6", "7-8", "More than 8"] },
  { key: "outside", title: "How often do you eat outside?", options: ["Rarely", "Weekly", "Several times a week", "Daily"] },
  { key: "smoke", title: "Do you smoke?", options: ["No", "Sometimes", "Yes"] },
  { key: "alcohol", title: "Do you consume alcohol?", options: ["No", "Sometimes", "Frequently"] },
  { key: "diabetes", title: "Do you already have Diabetes?", options: ["No", "Yes", "Prefer not to say"] },
  { key: "bp", title: "Do you already have High Blood Pressure?", options: ["No", "Yes", "Prefer not to say"] },
  { key: "app", title: "Do you use any application to instantly check food quality while shopping?", options: ["Yes", "No"] },
  { key: "appInfo", title: "You may love FutureTrack." },
  { key: "profile", title: "Tell us about you", fields: ["Name", "Age", "Weight", "Height (Optional)", "Gender"] },
  { key: "report", title: "Your Educational Report" }
];

document.querySelectorAll(".open-wizard").forEach((button) => {
  button.addEventListener("click", () => {
    if (!wizard) return;
    wizard.classList.add("open");
    wizard.setAttribute("aria-hidden", "false");
    stepIndex = 0;
    renderWizard();
  });
});

const wizardClose = document.querySelector(".wizard-close");
if (wizardClose) wizardClose.addEventListener("click", closeWizard);
if (wizard) {
  wizard.addEventListener("click", (event) => {
    if (event.target === wizard) closeWizard();
  });
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    if (stepIndex > 0) {
      goToPreviousStep();
      renderWizard();
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (stepIndex < steps.length - 1) {
      goToNextStep();
      renderWizard();
    } else {
      closeWizard();
    }
  });
}

function closeWizard() {
  wizard.classList.remove("open");
  wizard.setAttribute("aria-hidden", "true");
}

function renderWizard() {
  if (!wizardBody || !progressBar || !backBtn || !nextBtn || !wizardTitle) return;
  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  progressBar.style.width = `${progress}%`;
  wizardTitle.textContent = step.title;
  backBtn.style.visibility = stepIndex === 0 ? "hidden" : "visible";
  nextBtn.style.display = step.options ? "none" : "inline-flex";
  nextBtn.textContent = step.key === "report" ? "Finish" : "Next";

  if (step.options) {
    wizardBody.innerHTML = optionTemplate(step);
    wizardBody.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        answers[step.key] = button.dataset.value;
        button.classList.add("selected");
        setTimeout(() => {
          goToNextStep();
          renderWizard();
        }, 160);
      });
    });
    return;
  }

  if (step.key === "appInfo") {
    wizardBody.innerHTML = `
      <div class="report-metric">
        <strong>FutureTrack can help while shopping.</strong>
        <p>FutureTrack can instantly scan food packets and help you understand whether a product is healthier, moderately consumable, or should be consumed less frequently.</p>
      </div>
    `;
    return;
  }

  if (step.fields) {
    wizardBody.innerHTML = `
      <div class="wizard-fields">
        ${step.fields
          .map((field) => {
            const key = field.toLowerCase().replace(/[^a-z]/g, "");
            if (field === "Gender") {
              return `<select aria-label="Gender" data-field="${key}"><option value="">Gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select>`;
            }
            return `<input aria-label="${field}" data-field="${key}" placeholder="${field}" value="${answers[key] || ""}" />`;
          })
          .join("")}
      </div>
    `;
    wizardBody.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", () => {
        answers[input.dataset.field] = input.value;
      });
    });
    return;
  }

  wizardBody.innerHTML = reportTemplate();
}

function goToNextStep() {
  stepIndex += 1;
  if (steps[stepIndex] && steps[stepIndex].key === "appInfo" && answers.app !== "No") {
    stepIndex += 1;
  }
}

function goToPreviousStep() {
  stepIndex -= 1;
  if (steps[stepIndex] && steps[stepIndex].key === "appInfo" && answers.app !== "No") {
    stepIndex -= 1;
  }
}

function optionTemplate(step) {
  return `
    <div class="option-grid">
      ${step.options
        .map(
          (option) =>
            `<button type="button" class="${answers[step.key] === option ? "selected" : ""}" data-value="${option}">${option}</button>`
        )
        .join("")}
    </div>
  `;
}

function reportTemplate() {
  const risk = calculateRisk();
  const lifestyle = Math.max(34, 100 - risk);
  const food = Math.max(30, 96 - foodPenalty());
  const name = escapeHtml(answers.name || "FutureTrack User");
  const label = risk > 58 ? "Higher Awareness Needed" : risk > 34 ? "Moderate Awareness" : "Positive Direction";

  return `
    <div class="report-card">
      <p class="eyebrow">FutureTrack by SnipThink</p>
      <h3>${name}, this report is for health awareness only.</h3>
      <div class="report-metric"><strong>Lifestyle Score: ${lifestyle}</strong><div class="bar"><span style="width:${lifestyle}%"></span></div></div>
      <div class="report-metric"><strong>Food Habit Score: ${food}</strong><div class="bar"><span style="width:${food}%"></span></div></div>
      <div class="report-metric"><strong>Risk Indicator: ${label}</strong><div class="risk-scale"><span style="width:${risk}%"></span></div></div>
      <div class="report-metric"><strong>FutureTrack Recommendation</strong><p>Scan packaged foods, compare alternatives, reduce frequent sugary drinks, and verify labels before making purchase decisions.</p></div>
      <p>This report is for health awareness only and is not medical advice.</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calculateRisk() {
  let risk = foodPenalty();
  if (answers.exercise === "Never") risk += 16;
  if (answers.sleep === "Less than 5") risk += 12;
  if (answers.smoke === "Yes") risk += 16;
  if (answers.alcohol === "Frequently") risk += 10;
  if (answers.diabetes === "Yes") risk += 12;
  if (answers.bp === "Yes") risk += 12;
  return Math.min(96, risk);
}

function foodPenalty() {
  let penalty = 10;
  if (answers.packaged === "Daily") penalty += 22;
  if (answers.packaged === "Frequently") penalty += 14;
  if (answers.drinks === "More than 5") penalty += 18;
  if (answers.drinks === "3-5") penalty += 12;
  if (answers.labels === "Never") penalty += 14;
  if (answers.outside === "Daily") penalty += 16;
  if (answers.outside === "Several times a week") penalty += 10;
  return penalty;
}

if (wizard) renderWizard();
