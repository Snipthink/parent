/* ==========================================================================
   AURA RESTAURANT ENGINE - UI COMPONENTS & SCROLL OBSERVER
   ========================================================================== */

import { DataStore } from './dataStore.js';

export function setupFaqAccordion() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  const faqs = DataStore.faq?.faqs || [];
  container.innerHTML = faqs.map((f, idx) => `
    <div class="faq-item ${idx === 0 ? 'active' : ''}">
      <button class="faq-header" aria-expanded="${idx === 0}">
        <span>${f.question}</span>
        <span class="faq-icon">▾</span>
      </button>
      <div class="faq-body">
        <p>${f.answer}</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // Close other accordions
      container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      } else {
        header.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

export function setupTestimonials() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;

  const items = DataStore.testimonials?.testimonials || [];
  container.innerHTML = `
    <div class="testimonials-grid">
      ${items.map(t => `
        <div class="food-card" style="padding: var(--space-md); justify-content: space-between;">
          <div style="margin-bottom: var(--space-sm);">
            <div style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">
              ${'★'.repeat(t.rating)}
            </div>
            <p style="font-style: italic; font-size: 1rem; line-height: 1.5; color: var(--text-primary);">
              "${t.review}"
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem; border-top: 1px dashed var(--border); padding-top: 0.75rem;">
            <img src="${t.avatar}" alt="${t.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">
            <div>
              <strong style="display: block; font-size: 0.95rem;">${t.name}</strong>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${t.role}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

export function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = 'var(--shadow-md)';
      header.style.height = '74px';
    } else {
      header.style.boxShadow = 'none';
      header.style.height = 'var(--header-height)';
    }
  });
}
