/* ============================================================
   CLINIC WEBSITE — CORE SCRIPT
   Reads the data/*.js files and renders the whole page.
   Reusable across clinics: this file should not need editing
   when the data files change.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Small helpers ---------- */

    function safe(value) {
        if (value === undefined || value === null) return "";
        if (typeof value === "number" && isNaN(value)) return "";
        return String(value).trim();
    }

    function hasValue(value) {
        return safe(value) !== "";
    }

    function el(tag, className, html) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (html !== undefined) node.innerHTML = html;
        return node;
    }

    function escapeHtml(str) {
        return safe(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* A tiny inline SVG data URI used whenever an image is
       missing or fails to load, so the layout never breaks. */
    function fallbackImage(label) {
        const text = encodeURIComponent(label || "Image");
        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500">' +
            '<rect width="100%" height="100%" fill="%23E7F0EF"/>' +
            '<text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="%23698' +
            '' + '685" text-anchor="middle" dominant-baseline="middle">' + text + '</text>' +
            '</svg>';
        return "data:image/svg+xml;charset=UTF-8," + svg;
    }

    function withImageFallback(imgEl, label) {
        imgEl.addEventListener("error", function () {
            if (imgEl.dataset.fallbackApplied) return;
            imgEl.dataset.fallbackApplied = "true";
            imgEl.src = fallbackImage(label);
        });
    }

    /* ============================================================
       THEME
       ============================================================ */

    const THEME_STORAGE_KEY = "clinic-theme-preference";

    function applyTheme(themeName) {
        if (typeof themeColors === "undefined") return;
        const palette = themeColors[themeName] || themeColors.light;
        if (!palette) return;

        const root = document.documentElement;
        Object.keys(palette).forEach(function (key) {
            const cssVarName = "--" + key.replace(/_/g, "-");
            root.style.setProperty(cssVarName, palette[key]);
        });

        root.setAttribute("data-theme", themeName);

        const toggleBtn = document.getElementById("themeToggle");
        if (toggleBtn) {
            toggleBtn.setAttribute("aria-pressed", themeName === "dark" ? "true" : "false");
            toggleBtn.innerHTML = themeName === "dark" ? "☀️" : "🌙";
            toggleBtn.setAttribute(
                "aria-label",
                themeName === "dark" ? "Switch to light theme" : "Switch to dark theme"
            );
        }

        try {
            localStorage.setItem(THEME_STORAGE_KEY, themeName);
        } catch (e) {
            /* localStorage unavailable — theme just won't persist */
        }
    }

    function initTheme() {
        let initial = "light";
        if (typeof themeColors !== "undefined" && themeColors.settings) {
            initial = themeColors.settings.default_theme || "light";
        }

        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === "light" || stored === "dark") initial = stored;
        } catch (e) { /* ignore */ }

        applyTheme(initial);

        const toggleBtn = document.getElementById("themeToggle");
        const darkEnabled =
            typeof themeColors === "undefined" ||
            !themeColors.settings ||
            themeColors.settings.dark_mode_enabled !== false;

        if (toggleBtn) {
            if (!darkEnabled) {
                toggleBtn.classList.add("hidden");
            } else {
                toggleBtn.addEventListener("click", function () {
                    const current = document.documentElement.getAttribute("data-theme");
                    applyTheme(current === "dark" ? "light" : "dark");
                });
            }
        }
    }

    /* ============================================================
       CLINIC PROFILE + SEO
       ============================================================ */

    function renderClinicProfile() {
        if (typeof clinicProfile === "undefined") return;

        const name = safe(clinicProfile.clinic_name);
        const tagline = safe(clinicProfile.tagline);
        const description = safe(clinicProfile.description);

        document.querySelectorAll("[data-field='clinic_name']").forEach(function (n) {
            n.textContent = name || "Clinic";
        });
        document.querySelectorAll("[data-field='tagline']").forEach(function (n) {
            n.textContent = tagline;
            n.classList.toggle("hidden", !hasValue(tagline));
        });
        document.querySelectorAll("[data-field='description']").forEach(function (n) {
            n.textContent = description;
            n.classList.toggle("hidden", !hasValue(description));
        });

        if (name) {
            document.title = name + (tagline ? " — " + tagline : "");
        }

        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc && description) metaDesc.setAttribute("content", description);

        const ogTitle = document.querySelector("meta[property='og:title']");
        if (ogTitle && name) ogTitle.setAttribute("content", name);

        const ogDesc = document.querySelector("meta[property='og:description']");
        if (ogDesc && description) ogDesc.setAttribute("content", description);

        /* Logo */
        const logoFile = clinicProfile.logo && safe(clinicProfile.logo.filename);
        const logoAlt = (clinicProfile.logo && safe(clinicProfile.logo.alt)) || name || "Clinic logo";
        document.querySelectorAll("[data-field='logo']").forEach(function (imgEl) {
            if (logoFile) {
                imgEl.src = "images/" + logoFile;
                imgEl.alt = logoAlt;
                withImageFallback(imgEl, "Logo");
                imgEl.classList.remove("hidden");
            } else {
                imgEl.classList.add("hidden");
            }
        });

        /* Favicon */
        const faviconFile = clinicProfile.favicon && safe(clinicProfile.favicon.filename);
        if (faviconFile) {
            const link = document.querySelector("link[rel='icon']");
            if (link) link.href = "images/" + faviconFile;
        }
    }

    /* ============================================================
       DOCTOR DETAILS
       ============================================================ */

    function renderDoctorDetails() {
        if (typeof doctorDetails === "undefined") return;

        const fields = {
            name: safe(doctorDetails.name),
            qualification: safe(doctorDetails.qualification),
            designation: safe(doctorDetails.designation),
            specialty: safe(doctorDetails.specialty),
            bio: safe(doctorDetails.bio)
        };

        Object.keys(fields).forEach(function (key) {
            document.querySelectorAll("[data-field='doctor_" + key + "']").forEach(function (n) {
                n.textContent = fields[key];
                n.classList.toggle("hidden", !hasValue(fields[key]));
            });
        });

        const years = doctorDetails.experience_years;
        const validYears = typeof years === "number" && !isNaN(years) && years > 0;
        document.querySelectorAll("[data-field='doctor_experience']").forEach(function (n) {
            n.textContent = validYears ? years + "+ Years Experience" : "";
            n.classList.toggle("hidden", !validYears);
        });
        document.querySelectorAll("[data-field='doctor_experience_number']").forEach(function (n) {
            n.textContent = validYears ? years : "";
        });
        document.querySelectorAll("[data-field='doctor_experience_wrap']").forEach(function (n) {
            n.classList.toggle("hidden", !validYears);
        });

        const imgFile = doctorDetails.image && safe(doctorDetails.image.filename);
        const imgAlt = (doctorDetails.image && safe(doctorDetails.image.alt)) || fields.name || "Doctor photo";
        document.querySelectorAll("[data-field='doctor_image']").forEach(function (imgEl) {
            imgEl.alt = imgAlt;
            withImageFallback(imgEl, "Doctor Photo");
            imgEl.src = imgFile ? "images/" + imgFile : fallbackImage("Doctor Photo");
        });
    }

    /* ============================================================
       SERVICES
       ============================================================ */

    function renderServices() {
        const section = document.getElementById("services");
        const grid = document.getElementById("servicesGrid");
        if (!section || !grid) return;

        const list = (typeof services !== "undefined" && Array.isArray(services)) ? services : [];
        const valid = list.filter(function (s) { return s && hasValue(s.name); });

        if (valid.length === 0) {
            section.classList.add("hidden");
            return;
        }

        grid.innerHTML = "";
        valid.forEach(function (service) {
            const card = el("article", "card service-card");
            const icon = el("div", "service-icon", "✚");
            const title = el("h3", null, escapeHtml(service.name));
            card.appendChild(icon);
            card.appendChild(title);
            if (hasValue(service.description)) {
                card.appendChild(el("p", null, escapeHtml(service.description)));
            }
            grid.appendChild(card);
        });
    }

    /* ============================================================
       PATIENT REVIEWS
       ============================================================ */

    function starString(rating) {
        let r = parseInt(rating, 10);
        if (isNaN(r) || r < 1) r = 0;
        if (r > 5) r = 5;
        const filled = "★".repeat(r);
        const empty = "☆".repeat(5 - r);
        return filled + empty;
    }

    function renderReviews() {
        const section = document.getElementById("reviews");
        const grid = document.getElementById("reviewsGrid");
        if (!section || !grid) return;

        const list = (typeof patientReviews !== "undefined" && Array.isArray(patientReviews)) ? patientReviews : [];
        const valid = list.filter(function (r) { return r && hasValue(r.name) && hasValue(r.message); });

        if (valid.length === 0) {
            section.classList.add("hidden");
            return;
        }

        grid.innerHTML = "";
        valid.forEach(function (review) {
            const card = el("article", "card review-card");
            card.appendChild(el("div", "review-stars", starString(review.rating)));
            if (hasValue(review.feedback)) {
                card.appendChild(el("div", "review-feedback", escapeHtml(review.feedback)));
            }
            card.appendChild(el("p", "review-message", escapeHtml(review.message)));
            card.appendChild(el("div", "review-name", "— " + escapeHtml(review.name)));
            grid.appendChild(card);
        });
    }

    /* ============================================================
       CONTACT DETAILS
       ============================================================ */

    function formatAddress() {
        if (typeof contactDetails === "undefined" || !contactDetails.address) return "";
        const a = contactDetails.address;
        const parts = [a.line1, a.line2, a.city, a.state, a.postal_code, a.country]
            .map(safe)
            .filter(hasValue);
        return parts.join(", ");
    }

    function renderContactDetails() {
        const cd = (typeof contactDetails !== "undefined") ? contactDetails : {};

        const phone = safe(cd.phone);
        const email = safe(cd.email);
        const address = formatAddress();
        const mapsUrl = safe(cd.google_maps_url);

        toggleGroup("[data-field='phone']", phone, function (n) {
            n.textContent = phone;
        });
        document.querySelectorAll("a[data-field='phone_link']").forEach(function (n) {
            const wrap = n.closest("[data-contact-item]") || n;
            if (phone) {
                n.href = "tel:" + phone.replace(/[^\d+]/g, "");
                wrap.classList.remove("hidden");
            } else {
                wrap.classList.add("hidden");
            }
        });

        toggleGroup("[data-field='email']", email, function (n) {
            n.textContent = email;
        });
        document.querySelectorAll("a[data-field='email_link']").forEach(function (n) {
            const wrap = n.closest("[data-contact-item]") || n;
            if (email) {
                n.href = "mailto:" + email;
                wrap.classList.remove("hidden");
            } else {
                wrap.classList.add("hidden");
            }
        });

        toggleGroup("[data-field='address']", address, function (n) {
            n.textContent = address;
        });

        document.querySelectorAll("a[data-field='maps_link']").forEach(function (n) {
            const wrap = n.closest("[data-contact-item]") || n;
            if (mapsUrl) {
                n.href = mapsUrl;
                wrap.classList.remove("hidden");
            } else {
                wrap.classList.add("hidden");
            }
        });

        /* Hide the whole contact section only if every field is empty */
        const anyContact = phone || email || address || mapsUrl;
        const contactSection = document.getElementById("contact");
        if (contactSection) contactSection.classList.toggle("hidden", !anyContact);
    }

    function toggleGroup(selector, value, setter) {
        document.querySelectorAll(selector).forEach(function (n) {
            const wrap = n.closest("[data-contact-item]") || n;
            if (hasValue(value)) {
                setter(n);
                wrap.classList.remove("hidden");
            } else {
                wrap.classList.add("hidden");
            }
        });
    }

    /* ============================================================
       WHATSAPP HELPERS (shared by section CTA, floating button,
       modal form, and contact card)
       ============================================================ */

    function getWhatsappNumber() {
        if (typeof contactDetails === "undefined") return "";
        return safe(contactDetails.whatsapp).replace(/[^\d]/g, "");
    }

    function buildWhatsappUrl(message) {
        const number = getWhatsappNumber();
        const encoded = encodeURIComponent(message);
        return number
            ? "https://wa.me/" + number + "?text=" + encoded
            : "https://wa.me/?text=" + encoded;
    }

    function openWhatsapp(message) {
        window.open(buildWhatsappUrl(message), "_blank", "noopener");
    }

    function renderWhatsappVisibility() {
        const number = getWhatsappNumber();
        const floatBtn = document.getElementById("whatsappFloat");
        if (floatBtn) floatBtn.classList.toggle("hidden", !number);

        document.querySelectorAll("[data-field='whatsapp_cta']").forEach(function (n) {
            n.classList.toggle("hidden", !number);
        });

        /* Fallback: if WhatsApp is empty but phone exists, show call CTA instead */
        const phone = (typeof contactDetails !== "undefined") ? safe(contactDetails.phone) : "";
        document.querySelectorAll("[data-field='call_fallback']").forEach(function (n) {
            n.classList.toggle("hidden", !(!number && phone));
            if (!number && phone) {
                n.href = "tel:" + phone.replace(/[^\d+]/g, "");
            }
        });
    }

    /* ============================================================
       SOCIAL MEDIA
       ============================================================ */

    function renderSocialMedia() {
        const sm = (typeof socialMedia !== "undefined") ? socialMedia : {};
        const platforms = ["facebook", "instagram", "x", "youtube"];
        const values = {};
        let anySocial = false;

        platforms.forEach(function (key) {
            values[key] = safe(sm[key]);
            if (values[key]) anySocial = true;
        });

        document.querySelectorAll("[data-social-section]").forEach(function (n) {
            n.classList.toggle("hidden", !anySocial);
        });

        platforms.forEach(function (key) {
            document.querySelectorAll("a[data-social='" + key + "']").forEach(function (n) {
                if (values[key]) {
                    n.href = values[key];
                    n.classList.remove("hidden");
                } else {
                    n.classList.add("hidden");
                }
            });
        });
    }

    /* ============================================================
       APPOINTMENT CATEGORIES → dropdown
       ============================================================ */

    function populateCategorySelects() {
        const list = (typeof appointmentCategories !== "undefined" && Array.isArray(appointmentCategories))
            ? appointmentCategories.filter(function (c) { return c && hasValue(c.id) && hasValue(c.name); })
            : [];

        document.querySelectorAll("select[data-field='reason_select']").forEach(function (select) {
            /* keep the placeholder option, remove any previous options */
            const placeholder = select.querySelector("option[value='']");
            select.innerHTML = "";
            if (placeholder) {
                select.appendChild(placeholder);
            } else {
                const ph = el("option", null, "Select a reason");
                ph.value = "";
                ph.disabled = true;
                ph.selected = true;
                select.appendChild(ph);
            }
            list.forEach(function (cat) {
                const opt = el("option", null, escapeHtml(cat.name));
                opt.value = cat.id;
                select.appendChild(opt);
            });
        });
    }

    function categoryNameById(id) {
        if (typeof appointmentCategories === "undefined") return id;
        const found = appointmentCategories.find(function (c) { return c.id === id; });
        return found ? found.name : id;
    }

    /* ============================================================
       APPOINTMENT FORM VALIDATION + SUBMISSION
       ============================================================ */

    function setFieldError(form, fieldName, message) {
        const errorEl = form.querySelector("[data-error-for='" + fieldName + "']");
        const inputEl = form.querySelector("[name='" + fieldName + "']");
        if (errorEl) errorEl.textContent = message || "";
        if (inputEl) inputEl.classList.toggle("is-invalid", !!message);
    }

    function validateForm(form) {
        let isValid = true;
        const data = {};

        const name = form.querySelector("[name='patient_name']");
        const nameVal = name ? name.value.trim() : "";
        data.name = nameVal;
        if (!nameVal) {
            setFieldError(form, "patient_name", "Please enter the patient's name.");
            isValid = false;
        } else {
            setFieldError(form, "patient_name", "");
        }

        const ageInput = form.querySelector("[name='patient_age']");
        const ageRaw = ageInput ? ageInput.value.trim() : "";
        const ageNum = Number(ageRaw);
        data.age = ageRaw;
        const minAge = (typeof appointmentSettings !== "undefined" && appointmentSettings.min_age !== undefined)
            ? appointmentSettings.min_age : 0;
        const maxAge = (typeof appointmentSettings !== "undefined" && appointmentSettings.max_age !== undefined)
            ? appointmentSettings.max_age : 120;

        if (ageRaw === "" || isNaN(ageNum) || !Number.isFinite(ageNum)) {
            setFieldError(form, "patient_age", "Please enter a valid age.");
            isValid = false;
        } else if (ageNum < minAge) {
            setFieldError(form, "patient_age", "Age cannot be negative.");
            isValid = false;
        } else if (ageNum > maxAge) {
            setFieldError(form, "patient_age", "Please enter an age of " + maxAge + " or below.");
            isValid = false;
        } else if (!Number.isInteger(ageNum)) {
            setFieldError(form, "patient_age", "Please enter a whole number.");
            isValid = false;
        } else {
            setFieldError(form, "patient_age", "");
        }

        const genderInput = form.querySelector("[name='patient_gender']");
        const genderVal = genderInput ? genderInput.value : "";
        data.gender = genderVal;
        if (!genderVal) {
            setFieldError(form, "patient_gender", "Please select a gender.");
            isValid = false;
        } else {
            setFieldError(form, "patient_gender", "");
        }

        const reasonInput = form.querySelector("[name='reason']");
        const reasonVal = reasonInput ? reasonInput.value : "";
        data.reasonId = reasonVal;
        if (!reasonVal) {
            setFieldError(form, "reason", "Please select a reason for visit.");
            isValid = false;
        } else {
            setFieldError(form, "reason", "");
        }

        const detailsInput = form.querySelector("[name='problem_details']");
        data.details = detailsInput ? detailsInput.value.trim() : "";

        return { isValid: isValid, data: data };
    }

    function buildAppointmentMessage(data) {
        const clinicName = (typeof clinicProfile !== "undefined") ? safe(clinicProfile.clinic_name) : "the clinic";
        const intro = (typeof appointmentSettings !== "undefined" && hasValue(appointmentSettings.whatsapp_intro))
            ? appointmentSettings.whatsapp_intro
            : "I would like to request an appointment.";
        const closing = (typeof appointmentSettings !== "undefined" && hasValue(appointmentSettings.whatsapp_closing))
            ? appointmentSettings.whatsapp_closing
            : "Please confirm the appointment.\n\nThank you.";

        const reasonName = categoryNameById(data.reasonId);
        const genderLabel = data.gender.charAt(0).toUpperCase() + data.gender.slice(1);

        let msg = "Hello " + clinicName + ",\n\n" + intro + "\n\n";
        msg += "Patient Name: " + data.name + "\n";
        msg += "Age: " + data.age + "\n";
        msg += "Gender: " + genderLabel + "\n";
        msg += "Reason for Visit: " + reasonName + "\n";
        msg += "Problem Details: " + (data.details || "Not specified") + "\n\n";
        msg += closing;

        return msg;
    }

    function showStatus(form, type, text) {
        const statusEl = form.querySelector("[data-form-status]");
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className = "form-status " + type;
    }

    function wireAppointmentForm(form) {
        if (!form) return;

        form.addEventListener("submit", function (evt) {
            evt.preventDefault();
            const result = validateForm(form);

            if (!result.isValid) {
                showStatus(form, "error", "Please fix the highlighted fields and try again.");
                const firstInvalid = form.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const number = getWhatsappNumber();
            if (!number) {
                showStatus(
                    form,
                    "error",
                    "Online appointment requests are currently unavailable. Please call the clinic directly."
                );
                return;
            }

            const message = buildAppointmentMessage(result.data);
            showStatus(form, "success", "Opening WhatsApp with your appointment request…");
            openWhatsapp(message);
        });

        /* Live-clear errors while typing/selecting */
        form.querySelectorAll(".form-control").forEach(function (input) {
            input.addEventListener("input", function () {
                input.classList.remove("is-invalid");
            });
            input.addEventListener("change", function () {
                input.classList.remove("is-invalid");
            });
        });
    }

    /* ============================================================
       MODAL (floating WhatsApp button opens the same form)
       ============================================================ */

    function initModal() {
        const floatBtn = document.getElementById("whatsappFloat");
        const overlay = document.getElementById("appointmentModal");
        if (!overlay) return;
        const closeBtn = overlay.querySelector("[data-modal-close]");
        let lastFocused = null;

        function openModal() {
            lastFocused = document.activeElement;
            overlay.classList.add("open");
            overlay.setAttribute("aria-hidden", "false");
            const firstField = overlay.querySelector(".form-control");
            if (firstField) firstField.focus();
            document.addEventListener("keydown", onKeydown);
        }

        function closeModal() {
            overlay.classList.remove("open");
            overlay.setAttribute("aria-hidden", "true");
            document.removeEventListener("keydown", onKeydown);
            if (lastFocused) lastFocused.focus();
        }

        function onKeydown(evt) {
            if (evt.key === "Escape") closeModal();
        }

        if (floatBtn) floatBtn.addEventListener("click", openModal);
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        overlay.addEventListener("click", function (evt) {
            if (evt.target === overlay) closeModal();
        });
    }

    /* ============================================================
       NAVBAR (mobile menu)
       ============================================================ */

    function initNavbar() {
        const toggle = document.getElementById("navToggle");
        const links = document.getElementById("navLinks");
        if (!toggle || !links) return;

        toggle.addEventListener("click", function () {
            const isOpen = links.classList.toggle("open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        links.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                links.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ============================================================
       FOOTER YEAR
       ============================================================ */

    function renderFooterYear() {
        document.querySelectorAll("[data-field='current_year']").forEach(function (n) {
            n.textContent = new Date().getFullYear();
        });
    }

    /* ============================================================
       INIT
       ============================================================ */

    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        renderClinicProfile();
        renderDoctorDetails();
        renderServices();
        renderReviews();
        renderContactDetails();
        renderSocialMedia();
        renderWhatsappVisibility();
        populateCategorySelects();
        renderFooterYear();
        initNavbar();
        initModal();

        document.querySelectorAll("form[data-appointment-form]").forEach(wireAppointmentForm);
    });
})();
