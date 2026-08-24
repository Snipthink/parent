/* ==========================================================================
   AURA RESTAURANT ENGINE - CART & ORDER CALCULATION ENGINE
   ========================================================================== */

import { DataStore } from './dataStore.js';
import { formatCurrency, showToast } from './utils.js';

class CartStore {
  constructor() {
    this.items = []; // Array of { item, quantity }
  }

  addItem(foodItem) {
    if (!foodItem) return;

    const existing = this.items.find(i => i.item.id === foodItem.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ item: foodItem, quantity: 1 });
    }

    this.notifyUpdate();
    showToast(`Added "${foodItem.title}" to order`, '🛒');
  }

  updateQuantity(foodId, delta) {
    const idx = this.items.findIndex(i => i.item.id === foodId);
    if (idx !== -1) {
      this.items[idx].quantity += delta;
      if (this.items[idx].quantity <= 0) {
        this.items.splice(idx, 1);
      }
      this.notifyUpdate();
    }
  }

  removeItem(foodId) {
    this.items = this.items.filter(i => i.item.id !== foodId);
    this.notifyUpdate();
  }

  clearCart() {
    this.items = [];
    this.notifyUpdate();
  }

  getItemCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, i) => {
      const price = i.item.discountPrice || i.item.regularPrice || 0;
      return sum + (price * i.quantity);
    }, 0);
  }

  getTotal() {
    return this.getSubtotal(); // Expandable for tax/delivery if needed
  }

  notifyUpdate() {
    const totalCount = this.getItemCount();
    const subtotal = this.getSubtotal();
    const pricingSettings = DataStore.settings?.menu?.pricing;
    const currencySymbol = pricingSettings?.currencySymbol || '$';
    const showPrice = pricingSettings?.showPrice !== false;

    // Update Floating Badge Counts & Subtotal
    const cartBadge = document.querySelector('.floating-cart-badge');
    const floatingBtnText = document.querySelector('.floating-btn-text');

    if (cartBadge) cartBadge.textContent = totalCount;
    if (floatingBtnText) {
      if (showPrice && totalCount > 0) {
        floatingBtnText.textContent = `MENU (${totalCount}) • ${formatCurrency(subtotal, currencySymbol)}`;
      } else if (totalCount > 0) {
        floatingBtnText.textContent = `MENU (${totalCount})`;
      } else {
        floatingBtnText.textContent = `EXPLORE MENU`;
      }
    }

    // Dispatch Custom Event for Drawer & Checkout Views
    document.dispatchEvent(new CustomEvent('aura:cart-updated', {
      detail: { items: this.items, totalCount, subtotal }
    }));
  }
}

export const CartEngine = new CartStore();
