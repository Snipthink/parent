/* ==========================================================================
   AURA RESTAURANT ENGINE - DATA STORE & JSON LOADER
   ========================================================================== */

class Store {
  constructor() {
    this.restaurant = null;
    this.settings = null;
    this.theme = null;
    this.about = null;
    this.services = null;
    this.menu = null;
    this.chef = null;
    this.tables = null;
    this.testimonials = null;
    this.faq = null;
    this.social = null;
    this.terms = null;
    this.privacy = null;
    this.isLoaded = false;
  }

  async loadAllData() {
    const endpoints = [
      { key: 'restaurant', path: './data/restaurant.json' },
      { key: 'settings', path: './data/settings.json' },
      { key: 'theme', path: './data/theme.json' },
      { key: 'about', path: './data/about.json' },
      { key: 'services', path: './data/services.json' },
      { key: 'menu', path: './data/menu.json' },
      { key: 'chef', path: './data/chef.json' },
      { key: 'tables', path: './data/tables.json' },
      { key: 'testimonials', path: './data/testimonials.json' },
      { key: 'faq', path: './data/faq.json' },
      { key: 'social', path: './data/social.json' },
      { key: 'terms', path: './data/terms.json' },
      { key: 'privacy', path: './data/privacy.json' }
    ];

    try {
      const results = await Promise.allSettled(
        endpoints.map(item => fetch(item.path).then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }))
      );

      results.forEach((res, idx) => {
        const key = endpoints[idx].key;
        if (res.status === 'fulfilled') {
          this[key] = res.value;
        } else {
          console.warn(`Failed to load ${endpoints[idx].path}, initializing fallback state.`);
          this[key] = this.getFallback(key);
        }
      });

      this.isLoaded = true;
      return true;
    } catch (err) {
      console.error('DataStore loading error:', err);
      return false;
    }
  }

  getFallback(key) {
    const fallbacks = {
      restaurant: { name: 'AURA', tagline: 'Fine Dining' },
      settings: {
        website: { showAbout: true, showMenu: true, showChef: true, showGallery: true },
        menu: { foodCard: { showImage: true, showTitle: true, showDescription: true, showRegularPrice: true, showAddButton: true }, pricing: { showPrice: true, currencySymbol: '$' } },
        ordering: { enabled: true, whatsappEnabled: true, whatsappNumber: '15552345678' },
        theme: { allowThemeSelector: true, allowDarkMode: true }
      },
      menu: { categories: [{ id: 'all', name: 'All' }], items: [] },
      tables: { tables: [] },
      theme: { themes: [] }
    };
    return fallbacks[key] || {};
  }
}

export const DataStore = new Store();
