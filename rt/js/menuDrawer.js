/* ==========================================================================
   AURA RESTAURANT ENGINE - MENU DRAWER & CONTENT-AWARE FOOD CARDS
   ========================================================================== */

import { DataStore } from './dataStore.js';
import { CartEngine } from './cartEngine.js';
import { OrderEngine } from './orderEngine.js';
import { formatCurrency, getIconSvg } from './utils.js';

export class MenuDrawer {
  constructor() {
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.activeTab = 'catalog'; // 'catalog' | 'cart'
    this.orderEngine = new OrderEngine();
  }

  init() {
    this.createFloatingButton();
    this.createDrawerDOM();
    this.listenEvents();
  }

  createFloatingButton() {
    let btn = document.getElementById('floating-menu-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'floating-menu-btn';
      btn.className = 'floating-menu-btn click-scale';
      btn.setAttribute('aria-label', 'Open Interactive Menu & Order');
      btn.innerHTML = `
        <span class="floating-cart-badge">0</span>
        <span class="floating-btn-text">EXPLORE MENU</span>
      `;
      document.body.appendChild(btn);

      btn.addEventListener('click', () => this.openDrawer());
    }
  }

  createDrawerDOM() {
    let backdrop = document.getElementById('menu-drawer-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'menu-drawer-backdrop';
      backdrop.className = 'menu-drawer-backdrop';
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', () => this.closeDrawer());
    }

    let drawer = document.getElementById('menu-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'menu-drawer';
      drawer.className = 'menu-drawer';
      document.body.appendChild(drawer);
    }

    this.renderDrawerStructure();
  }

  renderDrawerStructure() {
    const drawer = document.getElementById('menu-drawer');
    if (!drawer) return;

    drawer.innerHTML = `
      <div class="menu-drawer-header">
        <div class="drawer-tabs">
          <button id="tab-catalog" class="drawer-tab ${this.activeTab === 'catalog' ? 'active' : ''}">
            🍽 Menu Catalog
          </button>
          <button id="tab-cart" class="drawer-tab ${this.activeTab === 'cart' ? 'active' : ''}">
            🛒 Order Cart (<span id="drawer-cart-count">0</span>)
          </button>
        </div>
        <button id="close-drawer-btn" class="btn-icon" aria-label="Close Menu Drawer">
          ${getIconSvg('x', 20)}
        </button>
      </div>

      <div id="drawer-body" class="menu-drawer-body">
        <!-- Dynamic catalog or cart rendered here -->
      </div>

      <div id="drawer-footer" class="menu-drawer-footer">
        <!-- Summary total & checkout action button -->
      </div>
    `;

    document.getElementById('close-drawer-btn')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('tab-catalog')?.addEventListener('click', () => {
      this.activeTab = 'catalog';
      this.updateTabs();
      this.renderBody();
    });
    document.getElementById('tab-cart')?.addEventListener('click', () => {
      this.activeTab = 'cart';
      this.updateTabs();
      this.renderBody();
    });
  }

  updateTabs() {
    const tabCat = document.getElementById('tab-catalog');
    const tabCart = document.getElementById('tab-cart');
    if (tabCat) tabCat.className = `drawer-tab ${this.activeTab === 'catalog' ? 'active' : ''}`;
    if (tabCart) tabCart.className = `drawer-tab ${this.activeTab === 'cart' ? 'active' : ''}`;
  }

  openDrawer() {
    const backdrop = document.getElementById('menu-drawer-backdrop');
    const drawer = document.getElementById('menu-drawer');
    if (backdrop && drawer) {
      backdrop.classList.add('active');
      drawer.classList.add('active');
      this.renderBody();
    }
  }

  closeDrawer() {
    const backdrop = document.getElementById('menu-drawer-backdrop');
    const drawer = document.getElementById('menu-drawer');
    if (backdrop && drawer) {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
    }
  }

  listenEvents() {
    document.addEventListener('aura:cart-updated', (e) => {
      const countEl = document.getElementById('drawer-cart-count');
      if (countEl) countEl.textContent = e.detail.totalCount;

      if (this.activeTab === 'cart') {
        this.renderBody();
      }
    });
  }

  renderBody() {
    const bodyEl = document.getElementById('drawer-body');
    const footerEl = document.getElementById('drawer-footer');
    if (!bodyEl || !footerEl) return;

    if (this.activeTab === 'catalog') {
      this.renderCatalogView(bodyEl, footerEl);
    } else {
      this.renderCartView(bodyEl, footerEl);
    }
  }

  renderCatalogView(bodyEl, footerEl) {
    const menuData = DataStore.menu || { categories: [], items: [] };
    const categories = menuData.categories || [];
    const allItems = menuData.items || [];

    // Filter Items
    let filtered = allItems;
    if (this.activeCategory && this.activeCategory !== 'all') {
      filtered = filtered.filter(i => i.categoryId === this.activeCategory);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }

    bodyEl.innerHTML = `
      <!-- Search & Categories Bar -->
      <div style="margin-bottom: 1.25rem;">
        <div class="menu-search-box" style="margin-bottom: 0.75rem;">
          <span class="menu-search-icon">${getIconSvg('search', 16)}</span>
          <input type="text" id="drawer-search-input" class="menu-search-input" placeholder="Search wagyu, truffle, cocktail..." value="${this.searchQuery}">
        </div>

        <div class="category-pills">
          ${categories.map(c => `
            <button class="category-pill ${c.id === this.activeCategory ? 'active' : ''}" data-cat-id="${c.id}">
              ${c.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Food Items Grid -->
      <div class="menu-items-grid">
        ${filtered.length > 0 ? filtered.map(item => this.renderFoodCardHTML(item)).join('') : `
          <div class="text-center" style="grid-column: 1/-1; padding: 3rem 1rem;">
            <p style="color:var(--text-muted);">No culinary creations found matching "${this.searchQuery}".</p>
          </div>
        `}
      </div>
    `;

    // Attach Search listener
    document.getElementById('drawer-search-input')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderCatalogView(bodyEl, footerEl);
    });

    // Attach Category Pill listeners
    bodyEl.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.activeCategory = pill.getAttribute('data-cat-id');
        this.renderCatalogView(bodyEl, footerEl);
      });
    });

    // Attach Add To Cart listeners
    bodyEl.querySelectorAll('.btn-add-food').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        const item = allItems.find(i => i.id === itemId);
        if (item) CartEngine.addItem(item);
      });
    });

    // Footer in Catalog mode
    const count = CartEngine.getItemCount();
    const showPrice = DataStore.settings?.menu?.pricing?.showPrice !== false;
    const symbol = DataStore.settings?.menu?.pricing?.currencySymbol || '$';

    footerEl.innerHTML = `
      <button id="view-order-cart-btn" class="btn btn-primary" style="width: 100%;">
        Review Order (${count} Items) ${showPrice && count > 0 ? `• ${formatCurrency(CartEngine.getTotal(), symbol)}` : ''}
      </button>
    `;

    document.getElementById('view-order-cart-btn')?.addEventListener('click', () => {
      this.activeTab = 'cart';
      this.updateTabs();
      this.renderBody();
    });
  }

  renderCartView(bodyEl, footerEl) {
    const items = CartEngine.items;
    const pricingSettings = DataStore.settings?.menu?.pricing;
    const showPrice = pricingSettings?.showPrice !== false;
    const symbol = pricingSettings?.currencySymbol || '$';
    const orderingSettings = DataStore.settings?.ordering;

    if (items.length === 0) {
      bodyEl.innerHTML = `
        <div class="text-center" style="padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🍽</div>
          <h4 style="font-size: 1.4rem; margin-bottom: 0.5rem;">Your Order Cart is Empty</h4>
          <p style="color:var(--text-muted); margin-bottom: 1.5rem;">Select your favorite artisanal dishes from our menu to place a table request.</p>
          <button id="back-to-catalog-btn" class="btn btn-secondary">Browse Menu Catalog</button>
        </div>
      `;
      document.getElementById('back-to-catalog-btn')?.addEventListener('click', () => {
        this.activeTab = 'catalog';
        this.updateTabs();
        this.renderBody();
      });

      footerEl.innerHTML = '';
      return;
    }

    bodyEl.innerHTML = `
      <h4 style="font-size: 1.2rem; margin-bottom: 1rem;">Selected Creations</h4>
      <div style="margin-bottom: 1.5rem;">
        ${items.map(i => `
          <div class="cart-item">
            ${i.item.image ? `<img src="${i.item.image}" alt="${i.item.title}" class="cart-item-img">` : ''}
            <div class="cart-item-info">
              <div class="cart-item-title">${i.item.title}</div>
              ${showPrice ? `<div class="cart-item-price">${formatCurrency(i.item.discountPrice || i.item.regularPrice, symbol)} each</div>` : ''}
            </div>
            <div class="quantity-controls">
              <button class="qty-btn btn-qty-minus" data-id="${i.item.id}">-</button>
              <span class="qty-val">${i.quantity}</span>
              <button class="qty-btn btn-qty-plus" data-id="${i.item.id}">+</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="table-selection-container">
        <!-- Rendered by orderEngine -->
      </div>

      <!-- Order Details Form -->
      <form id="order-checkout-form" style="margin-top: 1rem;">
        ${orderingSettings?.showGuestCount !== false ? `
          <div class="form-group" style="width: 140px; margin-bottom: 0.75rem;">
            <label class="form-label" for="cust-guests">Guest Count</label>
            <input type="number" id="cust-guests" class="form-control" value="2" min="1" max="20">
          </div>
        ` : ''}
        ${orderingSettings?.showSpecialRequest !== false ? `
          <div class="form-group">
            <label class="form-label" for="cust-notes">Special Requests / Dietary Notes</label>
            <input type="text" id="cust-notes" class="form-control" placeholder="e.g. Less spicy, extra sauce, birthday note">
          </div>
        ` : ''}
      </form>
    `;

    // Render Tables inside cart view
    if (orderingSettings?.showTableSelection !== false) {
      this.orderEngine.renderTableSelection(document.getElementById('table-selection-container'));
    }

    // Attach quantity increment/decrement listeners
    bodyEl.querySelectorAll('.btn-qty-minus').forEach(b => {
      b.addEventListener('click', () => CartEngine.updateQuantity(b.getAttribute('data-id'), -1));
    });
    bodyEl.querySelectorAll('.btn-qty-plus').forEach(b => {
      b.addEventListener('click', () => CartEngine.updateQuantity(b.getAttribute('data-id'), 1));
    });

    // Render Footer Order Totals & WhatsApp Submission Button
    const total = CartEngine.getTotal();
    footerEl.innerHTML = `
      ${showPrice ? `
        <div class="order-summary-row">
          <span>Items Subtotal</span>
          <span>${formatCurrency(total, symbol)}</span>
        </div>
        <div class="order-total-row">
          <span>Total Order Value</span>
          <span>${formatCurrency(total, symbol)}</span>
        </div>
      ` : ''}
      <button id="submit-whatsapp-order-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
        ${getIconSvg('message-circle', 18)} Send Order via WhatsApp
      </button>
    `;

    document.getElementById('submit-whatsapp-order-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const formEl = document.getElementById('order-checkout-form');
      this.orderEngine.processOrderSubmit(formEl);
    });
  }

  /**
   * Generates Content-Aware Food Card HTML respecting master settings.json
   */
  renderFoodCardHTML(item) {
    const cardSettings = DataStore.settings?.menu?.foodCard || {};
    const pricingSettings = DataStore.settings?.menu?.pricing || {};
    const showPrice = pricingSettings.showPrice !== false;
    const symbol = pricingSettings.currencySymbol || '$';

    const showImage = cardSettings.showImage !== false && !!item.image;
    const showTitle = cardSettings.showTitle !== false;
    const showDesc = cardSettings.showDescription !== false && !!item.description;
    const showRegPrice = cardSettings.showRegularPrice !== false && showPrice;
    const showDiscPrice = cardSettings.showDiscountPrice !== false && showPrice && !!item.discountPrice;
    const showDiscBadge = cardSettings.showDiscountBadge !== false && !!item.discountPrice;
    const showPrep = cardSettings.showPreparationTime !== false && !!item.preparationTime;
    const showDietary = cardSettings.showDietaryIndicator !== false && item.dietary?.length > 0;
    const showAddBtn = cardSettings.showAddButton !== false;

    const displayPrice = item.discountPrice || item.regularPrice;

    return `
      <div class="food-card">
        ${showImage ? `
          <div class="food-card-image-wrap">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="food-card-badges">
              ${item.isChefSpecial ? `<span class="badge badge-chef">★ Chef Special</span>` : ''}
              ${showDiscBadge ? `<span class="badge badge-discount">Save Offer</span>` : ''}
              ${showDietary ? item.dietary.map(d => `<span class="badge badge-dietary ${d.toLowerCase()}">${d}</span>`).join('') : ''}
            </div>
          </div>
        ` : ''}

        <div class="food-card-body">
          <div class="food-card-header">
            ${showTitle ? `<h4 class="food-card-title">${item.title}</h4>` : ''}
            ${showPrep ? `<span class="food-card-prep-time">⏱ ${item.preparationTime}</span>` : ''}
          </div>

          ${showDesc ? `<p class="food-card-description">${item.description}</p>` : ''}

          <div class="food-card-footer">
            ${showPrice ? `
              <div class="food-card-price-wrap">
                <span class="food-card-price">${formatCurrency(displayPrice, symbol)}</span>
                ${showDiscPrice ? `<span class="food-card-price-regular">${formatCurrency(item.regularPrice, symbol)}</span>` : ''}
              </div>
            ` : '<div></div>'}

            ${showAddBtn ? `
              <button class="btn-add-food click-scale" data-item-id="${item.id}">
                + ADD TO ORDER
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}
