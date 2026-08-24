/* ==========================================================================
   AURA RESTAURANT ENGINE - WHATSAPP ORDERING & TABLE SELECTION
   ========================================================================== */

import { DataStore } from './dataStore.js';
import { CartEngine } from './cartEngine.js';
import { formatCurrency, showToast } from './utils.js';

export class OrderEngine {
  constructor() {
    this.selectedTableId = null;
  }

  renderTableSelection(containerEl) {
    if (!containerEl) return;

    const tables = DataStore.tables?.tables || [];
    if (tables.length === 0) {
      containerEl.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Standard Table Seating Assigned at Entrance</p>`;
      return;
    }

    containerEl.innerHTML = `
      <label class="form-label">Select Dining Table / Pickup Choice *</label>
      <div class="table-grid">
        ${tables.map(t => `
          <div class="table-card ${!t.available ? 'unavailable' : ''} ${this.selectedTableId === t.id ? 'selected' : ''}" data-table-id="${t.id}">
            <strong style="display:block; font-size:0.85rem;">${t.name}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">${t.capacity > 0 ? `Cap: ${t.capacity} Guests` : t.location}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Attach click events to select table
    containerEl.querySelectorAll('.table-card:not(.unavailable)').forEach(card => {
      card.addEventListener('click', () => {
        containerEl.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedTableId = card.getAttribute('data-table-id');
      });
    });
  }

  processOrderSubmit(formEl) {
    if (CartEngine.items.length === 0) {
      showToast('Your order is empty. Select dishes first!', '⚠️');
      return;
    }

    const settings = DataStore.settings;
    const whatsappNum = settings?.ordering?.whatsappNumber || DataStore.restaurant?.contact?.whatsappNumber || '15552345678';
    const showPrice = settings?.menu?.pricing?.showPrice !== false;
    const symbol = settings?.menu?.pricing?.currencySymbol || '$';

    const selectedTableObj = DataStore.tables?.tables?.find(t => t.id === this.selectedTableId);
    const tableText = selectedTableObj ? selectedTableObj.name : 'Table Assigned Upon Arrival';
    
    const guests = formEl?.querySelector('#cust-guests')?.value.trim() || '2';
    const notes = formEl?.querySelector('#cust-notes')?.value.trim() || 'None';

    // Build Formatted WhatsApp Message (Table Selection Only)
    let msg = `*NEW RESTAURANT ORDER — ${DataStore.restaurant?.name || 'AURA'}*\n\n`;
    msg += `📍 *Seating / Table:* ${tableText}\n`;
    if (settings?.ordering?.showGuestCount !== false) {
      msg += `👥 *Guests:* ${guests}\n`;
    }
    msg += `\n📋 *ORDER ITEMS:*\n`;

    CartEngine.items.forEach(i => {
      const price = i.item.discountPrice || i.item.regularPrice || 0;
      const lineTotal = price * i.quantity;
      if (showPrice) {
        msg += `• ${i.quantity} × ${i.item.title} (${formatCurrency(lineTotal, symbol)})\n`;
      } else {
        msg += `• ${i.quantity} × ${i.item.title}\n`;
      }
    });

    if (showPrice) {
      msg += `\n💰 *SUBTOTAL TOTAL:* ${formatCurrency(CartEngine.getTotal(), symbol)}\n`;
    }

    if (notes && notes !== 'None') {
      msg += `\n📝 *SPECIAL REQUEST:* ${notes}\n`;
    }

    msg += `\nPlease confirm order for ${tableText}. Thank you!`;

    // Encode for WhatsApp Web/App Link
    const waUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    // Show Confirmation Dialog Modal
    this.showConfirmationModal(tableText);

    // Clear cart after successful order launch
    CartEngine.clearCart();
  }

  showConfirmationModal(tableText) {
    let modal = document.getElementById('order-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'order-confirm-modal';
      modal.className = 'theme-modal active';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="theme-modal-card text-center" style="max-width: 460px;">
        <div style="width: 60px; height: 60px; background: var(--badge-bg); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem auto;">
          ✓
        </div>
        <h3 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Order Transmitted</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Your order has been sent to the kitchen for <strong>${tableText}</strong> via WhatsApp.
        </p>
        <button id="close-confirm-btn" class="btn btn-primary" style="width: 100%;">Return to Restaurant</button>
      </div>
    `;

    modal.classList.add('active');

    document.getElementById('close-confirm-btn')?.addEventListener('click', () => {
      modal.classList.remove('active');
      const drawer = document.getElementById('menu-drawer');
      if (drawer) drawer.classList.remove('active');
      const backdrop = document.getElementById('menu-drawer-backdrop');
      if (backdrop) backdrop.classList.remove('active');
    });
  }
}
