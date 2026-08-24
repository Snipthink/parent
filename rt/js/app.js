/* ==========================================================================
   AURA RESTAURANT ENGINE - MAIN APPLICATION ENTRY
   ========================================================================== */

import { DataStore } from './dataStore.js';
import { ThemeEngine } from './themeEngine.js';
import { MenuDrawer } from './menuDrawer.js';
import { GalleryEngine } from './galleryEngine.js';
import { setupFaqAccordion, setupTestimonials, setupScrollReveal, setupHeaderScroll } from './uiComponents.js';
import { setupImageFallbacks, getIconSvg, formatCurrency } from './utils.js';

class App {
  async init() {
    setupImageFallbacks();

    // 1. Fetch JSON data files
    const success = await DataStore.loadAllData();
    if (!success) {
      console.warn('App running with fallback defaults.');
    }

    // 2. Initialize Theme Engine (Applies colors, mode, logo)
    this.themeEngine = new ThemeEngine();
    this.themeEngine.init();

    // 3. Initialize Interactive Menu Drawer & Order Engine
    this.menuDrawer = new MenuDrawer();
    this.menuDrawer.init();

    // 4. Render Dynamic DOM Sections
    this.renderDynamicSections();

    // 5. Setup Scroll Reveal & Header Scroll
    setupScrollReveal();
    setupHeaderScroll();

    // 6. Dismiss Loading Screen Overlay
    this.hideLoadingScreen();
  }

  renderDynamicSections() {
    const settings = DataStore.settings || {};
    const restaurant = DataStore.restaurant || {};
    const about = DataStore.about || {};
    const chef = DataStore.chef || {};

    // Update Page Title & SEO Meta
    if (restaurant.seo) {
      document.title = restaurant.seo.metaTitle || restaurant.name;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = restaurant.seo.metaDescription || restaurant.tagline;
    }

    // Header Navigation Brands & Links
    this.renderHeaderBrand(restaurant);

    // Hero Section
    this.renderHeroSection(restaurant, settings);

    // About Section
    if (settings.website?.showAbout !== false) {
      this.renderAboutSection(about);
    } else {
      this.hideSection('about');
    }

    // Services Section
    if (settings.website?.showServices !== false) {
      this.renderServicesSection();
    } else {
      this.hideSection('services');
    }

    // Featured / Signature Dishes
    if (settings.website?.showFeaturedDishes !== false) {
      this.renderFeaturedDishes();
    } else {
      this.hideSection('featured');
    }

    // Chef Section
    if (settings.website?.showChef !== false) {
      this.renderChefSection(chef);
    } else {
      this.hideSection('chef');
    }

    // Experience / Atmosphere Section
    if (settings.website?.showExperience !== false) {
      this.renderExperienceSection();
    } else {
      this.hideSection('experience');
    }

    // Gallery Section
    if (settings.website?.showGallery !== false) {
      const galleryEngine = new GalleryEngine();
      galleryEngine.init(document.getElementById('gallery-container'));
    } else {
      this.hideSection('gallery');
    }

    // Testimonials Section
    if (settings.website?.showTestimonials !== false) {
      setupTestimonials();
    } else {
      this.hideSection('testimonials');
    }

    // FAQ Section
    if (settings.website?.showFAQ !== false) {
      setupFaqAccordion();
    } else {
      this.hideSection('faq');
    }

    // Contact & Map Section
    if (settings.website?.showContact !== false) {
      this.renderContactSection(restaurant);
    } else {
      this.hideSection('contact');
    }

    // Social Media Section & Footer
    this.renderSocialMedia(DataStore.social);
    this.renderFooter(restaurant);
  }

  renderHeaderBrand(restaurant) {
    const brandContainer = document.getElementById('header-brand');
    if (!brandContainer) return;

    const logoUrl = restaurant.logo?.default || './assets/logo/logo-dark.svg';
    brandContainer.innerHTML = `
      <a href="index.html" class="brand-logo">
        <img src="${logoUrl}" alt="${restaurant.name}" class="brand-logo-img">
      </a>
    `;

    // Mode Toggle Button in Header
    const headerActions = document.getElementById('header-actions');
    if (headerActions && !document.getElementById('header-mode-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'header-mode-toggle';
      toggleBtn.className = 'btn-icon click-scale';
      toggleBtn.setAttribute('aria-label', 'Toggle Light/Dark Mode');
      toggleBtn.innerHTML = getIconSvg(this.themeEngine.currentMode === 'dark' ? 'sun' : 'moon', 18);
      toggleBtn.addEventListener('click', () => {
        this.themeEngine.toggleMode();
        toggleBtn.innerHTML = getIconSvg(this.themeEngine.currentMode === 'dark' ? 'sun' : 'moon', 18);
      });
      headerActions.prepend(toggleBtn);
    }
  }

  renderHeroSection(restaurant, settings) {
    const heroSec = document.getElementById('hero-section');
    if (!heroSec) return;

    const heroData = restaurant.hero || {};
    const showImage = settings.website?.showRestaurantHeroImage !== false && !!heroData.heroImage;

    heroSec.innerHTML = `
      <div class="container">
        <div class="hero-grid ${!showImage ? 'no-image' : ''}">
          <div class="hero-content" data-reveal>
            ${heroData.badge ? `<div class="hero-badge"><span>✨</span> ${heroData.badge}</div>` : ''}
            <h1 class="hero-title">${heroData.heading || restaurant.name}</h1>
            <p class="hero-description">${heroData.subheading || restaurant.shortDescription}</p>
            <div class="hero-actions">
              <button id="hero-primary-cta" class="btn btn-primary click-scale">${heroData.primaryCta || 'Explore Menu'}</button>
              <button id="hero-secondary-cta" class="btn btn-secondary click-scale">${heroData.secondaryCta || 'Book a Table'}</button>
            </div>
          </div>

          ${showImage ? `
            <div class="hero-visual" data-reveal>
              <div class="hero-image-wrapper">
                <img src="${heroData.heroImage}" alt="${heroData.heroImageAlt || restaurant.name}">
              </div>
              ${heroData.floatingDish ? `
                <div class="floating-dish-card">
                  <div class="floating-dish-icon">🍷</div>
                  <div class="floating-dish-info">
                    <h5>${heroData.floatingDish.title}</h5>
                    <p>${heroData.floatingDish.rating} • ${heroData.floatingDish.badge}</p>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('hero-primary-cta')?.addEventListener('click', () => this.menuDrawer.openDrawer());
    document.getElementById('hero-secondary-cta')?.addEventListener('click', () => {
      this.menuDrawer.openDrawer();
      this.menuDrawer.activeTab = 'cart';
      this.menuDrawer.updateTabs();
      this.menuDrawer.renderBody();
    });
  }

  renderAboutSection(about) {
    const container = document.getElementById('about-container');
    if (!container) return;

    container.innerHTML = `
      <div class="about-grid" data-reveal>
        <div class="about-images-wrapper">
          ${about.images?.main ? `<img src="${about.images.main}" alt="${about.images.mainAlt}" class="about-img-main">` : ''}
          ${about.images?.secondary ? `<img src="${about.images.secondary}" alt="${about.images.secondaryAlt}" class="about-img-secondary">` : ''}
          ${about.images?.badgeText ? `<div class="about-badge">${about.images.badgeText}</div>` : ''}
        </div>

        <div>
          <span class="section-subtitle">OUR HERITAGE</span>
          <h2 class="section-title">${about.heading || 'Our Culinary Story'}</h2>
          <p style="margin-bottom: 1rem;">${about.storyParagraph1 || ''}</p>
          <p style="margin-bottom: 1.5rem;">${about.storyParagraph2 || ''}</p>

          ${about.philosophy ? `
            <div style="background:var(--surface); border:1px solid var(--border); padding:1rem; border-radius:var(--radius-sm); border-left:3px solid var(--primary);">
              <h5 style="color:var(--primary); font-size:1rem; margin-bottom:4px;">${about.philosophyTitle || 'Philosophy'}</h5>
              <p style="font-size:0.92rem; font-style:italic;">"${about.philosophy}"</p>
            </div>
          ` : ''}
        </div>
      </div>

      ${about.stats ? `
        <div class="stats-grid" data-reveal>
          ${about.stats.map(s => `
            <div class="stat-item">
              <div class="stat-value">${s.value} <span style="font-size:1.2rem; color:var(--primary);">${s.highlight || ''}</span></div>
              <div class="stat-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  renderServicesSection() {
    const container = document.getElementById('services-container');
    if (!container) return;

    const data = DataStore.services || { services: [] };
    container.innerHTML = `
      <div class="section-header text-center" data-reveal>
        <span class="section-subtitle">SERVICES & EXPERIENCES</span>
        <h2 class="section-title">${data.heading || 'Tailored Experiences'}</h2>
        <p class="section-description">${data.subheading || ''}</p>
      </div>

      <div class="services-grid" data-reveal>
        ${(data.services || []).map(s => `
          <div class="food-card">
            ${s.image ? `
              <div class="food-card-image-wrap" style="height:180px;">
                <img src="${s.image}" alt="${s.title}" loading="lazy">
                ${s.badge ? `<div class="food-card-badges"><span class="badge badge-chef">${s.badge}</span></div>` : ''}
              </div>
            ` : ''}
            <div class="food-card-body">
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; color:var(--primary);">
                ${getIconSvg(s.icon || 'sparkles', 22)}
                <h4 style="font-size:1.3rem;">${s.title}</h4>
              </div>
              <span style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:0.5rem;">${s.subtitle}</span>
              <p class="food-card-description">${s.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderFeaturedDishes() {
    const container = document.getElementById('featured-container');
    if (!container) return;

    const menuItems = DataStore.menu?.items || [];
    const featured = menuItems.filter(i => i.isFeatured);

    container.innerHTML = `
      <div class="section-header text-center" data-reveal>
        <span class="section-subtitle">CHEF'S SELECTION</span>
        <h2 class="section-title">Signature Culinary Creations</h2>
        <p class="section-description">Handpicked showstoppers crafted with wood-fire technique and rare seasonal imports.</p>
      </div>

      <div class="featured-grid" data-reveal>
        ${featured.map(item => this.menuDrawer.renderFoodCardHTML(item)).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-add-food').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        const item = menuItems.find(i => i.id === itemId);
        if (item) this.menuDrawer.orderEngine.cartEngine ? this.menuDrawer.orderEngine.cartEngine.addItem(item) : null;
      });
    });
  }

  renderChefSection(chef) {
    const container = document.getElementById('chef-container');
    if (!container) return;

    container.innerHTML = `
      <div class="chef-grid" data-reveal>
        <div class="chef-imagery">
          ${chef.portrait ? `<img src="${chef.portrait}" alt="${chef.portraitAlt}" class="chef-portrait">` : ''}
          ${chef.cookingImage ? `<img src="${chef.cookingImage}" alt="${chef.cookingImageAlt}" class="chef-cooking">` : ''}
        </div>

        <div>
          <span class="section-subtitle">MEET THE MASTER</span>
          <h2 class="section-title">${chef.name || 'Executive Chef'}</h2>
          <span style="display:block; color:var(--primary); font-weight:600; font-size:1.1rem; margin-bottom:1rem;">${chef.position} • ${chef.experience}</span>
          
          <p style="margin-bottom:1rem;">${chef.biography || ''}</p>

          ${chef.quote ? `
            <div class="chef-quote-box">
              <p style="color:var(--text-primary); font-size:1.05rem;">"${chef.quote}"</p>
            </div>
          ` : ''}

          ${chef.specialties ? `
            <h5 style="font-size:1rem; margin-bottom:0.5rem; color:var(--text-primary);">Culinary Specialties</h5>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem;">
              ${chef.specialties.map(spec => `<span class="badge badge-dietary">${spec}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderExperienceSection() {
    const container = document.getElementById('experience-container');
    if (!container) return;

    container.innerHTML = `
      <div class="section-header text-center" data-reveal>
        <span class="section-subtitle">ATMOSPHERE & LUXURY</span>
        <h2 class="section-title">An Unrivaled Dining Ambience</h2>
        <p class="section-description">Immerse your senses in custom architectural lighting, acoustic intimacy, and white-oak aromas.</p>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-md);" data-reveal>
        <div class="gallery-item" style="height:320px;">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" alt="Main Dining Salon">
        </div>
        <div class="gallery-item" style="height:320px;">
          <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" alt="Wood-Fire Kitchen">
        </div>
        <div class="gallery-item" style="height:320px;">
          <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80" alt="Wine Cellar Reserve">
        </div>
      </div>
    `;
  }

  renderContactSection(restaurant) {
    const container = document.getElementById('contact-container');
    if (!container) return;

    const contact = restaurant.contact || {};
    const hours = restaurant.hours || [];

    container.innerHTML = `
      <div class="contact-grid" data-reveal>
        <div>
          <span class="section-subtitle">VISIT & RESERVATIONS</span>
          <h2 class="section-title">Location & Opening Hours</h2>
          <p style="margin-bottom:1.5rem;">We recommend reserving your table at least 48 hours in advance for weekend service.</p>

          <div style="margin-bottom:1.5rem;">
            <h5 style="font-size:1.1rem; color:var(--primary); margin-bottom:0.25rem;">Address & Directions</h5>
            <p>${contact.address?.formatted || ''}</p>
          </div>

          <div style="margin-bottom:1.5rem;">
            <h5 style="font-size:1.1rem; color:var(--primary); margin-bottom:0.25rem;">Reservations Hotline</h5>
            <p>${contact.phone} • <a href="https://wa.me/${contact.whatsappNumber}" target="_blank">WhatsApp Direct</a></p>
          </div>

          <div>
            <h5 style="font-size:1.1rem; color:var(--primary); margin-bottom:0.5rem;">Service Schedule</h5>
            ${hours.map(h => `
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; border-bottom:1px dashed var(--border); padding-bottom:0.25rem;">
                <strong>${h.days}</strong>
                <span style="color:var(--text-secondary);">${h.time} (${h.type})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="map-wrapper">
          <iframe src="${contact.mapEmbedUrl}" allowfullscreen="" loading="lazy" title="Restaurant Map Location"></iframe>
        </div>
      </div>
    `;
  }

  renderSocialMedia(social) {
    const container = document.getElementById('social-container');
    if (!container) return;

    const links = (social?.links || []).filter(l => l.enabled);
    container.innerHTML = `
      <div class="social-bar">
        ${links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener" class="btn btn-secondary click-scale" style="gap:0.5rem;">
            ${getIconSvg(l.icon, 18)} ${l.platform}
          </a>
        `).join('')}
      </div>
    `;
  }

  renderFooter(restaurant) {
    const container = document.getElementById('footer-container');
    if (!container) return;

    const logoUrl = restaurant.logo?.default || './assets/logo/logo-dark.svg';

    container.innerHTML = `
      <div class="footer-grid">
        <div>
          <a href="index.html" class="brand-logo" style="margin-bottom:1rem;">
            <img src="${logoUrl}" alt="${restaurant.name}" class="brand-logo-img">
          </a>
          <p style="font-size:0.9rem; max-width:320px;">${restaurant.shortDescription || ''}</p>
        </div>

        <div>
          <h5 style="font-size:1.1rem; margin-bottom:1rem; color:var(--primary);">Quick Links</h5>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9rem;">
            <li><a href="#about">About Restaurant</a></li>
            <li><a href="#menu">Chef Menu</a></li>
            <li><a href="#chef">Executive Chef</a></li>
            <li><a href="#gallery">Atmosphere Gallery</a></li>
            <li><a href="about.html">Brand Heritage Page</a></li>
          </ul>
        </div>

        <div>
          <h5 style="font-size:1.1rem; margin-bottom:1rem; color:var(--primary);">Legal & Privacy</h5>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9rem;">
            <li><a href="terms.html">Terms & Conditions</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h5 style="font-size:1.1rem; margin-bottom:1rem; color:var(--primary);">Reservations</h5>
          <p style="font-size:0.9rem; margin-bottom:1rem;">${restaurant.contact?.address?.formatted || ''}</p>
          <button id="footer-menu-btn" class="btn btn-primary click-scale">Open Menu & Table Book</button>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${restaurant.name}. All rights reserved.</span>
        <span>White-Label Engine powered by Antigravity</span>
      </div>
    `;

    document.getElementById('footer-menu-btn')?.addEventListener('click', () => this.menuDrawer.openDrawer());
  }

  hideSection(sectionId) {
    const el = document.getElementById(`${sectionId}-section`);
    if (el) el.style.display = 'none';
  }

  hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.style.opacity = '0';
      screen.style.visibility = 'hidden';
      setTimeout(() => screen.remove(), 400);
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
