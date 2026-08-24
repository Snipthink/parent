/* ==========================================================================
   AURA RESTAURANT ENGINE - GALLERY & LIGHTBOX POPUP
   ========================================================================== */

import { getIconSvg } from './utils.js';

export class GalleryEngine {
  constructor() {
    this.galleryData = [
      { id: 'g1', category: 'interior', title: 'Main Dining Salon', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
      { id: 'g2', category: 'food', title: 'Truffle Wagyu Ribeye Plating', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
      { id: 'g3', category: 'chef', title: 'Executive Chef Open Grill', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80' },
      { id: 'g4', category: 'interior', title: 'Private Sommelier Wine Cellar', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80' },
      { id: 'g5', category: 'drinks', title: 'Smoked Artisanal Old Fashioned', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' },
      { id: 'g6', category: 'food', title: 'Valrhona Dark Chocolate Sphere', url: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80' }
    ];
  }

  init(containerEl) {
    if (!containerEl) return;
    this.renderGallery(containerEl);
  }

  renderGallery(containerEl) {
    containerEl.innerHTML = `
      <div class="gallery-grid">
        ${this.galleryData.map(item => `
          <div class="gallery-item" data-url="${item.url}" data-title="${item.title}">
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="gallery-overlay">
              <div>
                <strong style="color:#FFF; display:block; font-size:1.1rem;">${item.title}</strong>
                <span style="font-size:0.8rem; color:var(--primary); text-transform:uppercase;">Click to view</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    containerEl.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        const title = item.getAttribute('data-title');
        this.openLightbox(url, title);
      });
    });
  }

  openLightbox(url, title) {
    let modal = document.getElementById('gallery-lightbox');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'gallery-lightbox';
      modal.className = 'theme-modal active';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="position:relative; max-width:90vw; max-height:90vh;">
        <button id="close-lightbox" class="btn-icon" style="position:absolute; top:-20px; right:-20px; z-index:10; background:#000; border-color:#FFF; color:#FFF;">
          ${getIconSvg('x', 24)}
        </button>
        <img src="${url}" alt="${title}" style="max-width:100%; max-height:80vh; border-radius:var(--radius-md); box-shadow:var(--shadow-lg); object-fit:contain;">
        <p style="text-align:center; color:#FFF; margin-top:0.75rem; font-size:1.1rem; font-family:serif;">${title}</p>
      </div>
    `;

    modal.classList.add('active');

    document.getElementById('close-lightbox')?.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}
