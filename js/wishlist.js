//Nhóm 9: Wishlist page - backend cart driven
class Wishlist {
  constructor() {
    this.items = [];
    this.appliedVoucher = null;
    this.notificationTimer = null;
    this.availableVouchers = [
      { code: 'JUNDOKU10', discount: 100000, description: 'Giảm 100.000đ cho đơn hàng từ 5.000.000đ', expires: '31/12/2026', status: 'Active' },
      { code: 'WELCOME50', discount: 50000, description: 'Giảm 50.000đ cho đơn hàng đầu tiên', expires: '31/12/2026', status: 'Active' },
      { code: 'DIEMVIP', discount: 150000, description: 'Ưu đãi VIP cho thành viên Vàng/Kim Cương', expires: '31/12/2026', status: 'Active' },
      { code: 'SPRING25', discount: 25000, description: 'Giảm 25.000đ cho đơn hàng từ 1.500.000đ', expires: '31/12/2026', status: 'Active' },
      { code: 'FALL30', discount: 30000, description: 'Giảm 30.000đ cho đơn hàng trên 2.000.000đ', expires: '31/12/2026', status: 'Active' },
      { code: 'VIPFREE', discount: 200000, description: 'Giảm 200.000đ cho khách hàng VIP', expires: '31/12/2026', status: 'Active' },
      { code: 'BOOKWEEK', discount: 75000, description: 'Giảm 75.000đ cho đơn hàng trong tuần sách', expires: '31/12/2026', status: 'Active' },
      { code: 'STUDENT15', discount: 15000, description: 'Giảm 15.000đ cho sinh viên', expires: '31/12/2026', status: 'Active' },
      { code: 'FREESHIP', discount: 50000, description: 'Giảm 50.000đ khi sử dụng voucher vận chuyển', expires: '31/12/2026', status: 'Active' },
      { code: 'LOVER15', discount: 15000, description: 'Giảm 15.000đ cho đơn hàng trong tháng yêu thương', expires: '31/12/2026', status: 'Active' }
    ];

    this.voucherCodeInput = null;
    this.applyVoucherBtn = null;
    this.voucherList = null;
    this.voucherToggleBtn = null;
    this.voucherError = null;
    this.voucherSummary = null;

    this.init();
  }

  async init() {
    this.cacheElements();
    await this.loadWishlistFromBackend();
    this.loadVoucherFromStorage();
    this.renderAvailableVouchers();
    this.renderWishlistTable();
    this.updateVoucherSummary();
    this.attachEventListeners();
  }

  cacheElements() {
    this.voucherCodeInput = document.getElementById('voucher-code');
    this.applyVoucherBtn = document.getElementById('applyVoucherBtn');
    this.voucherList = document.getElementById('voucher-list');
    this.voucherToggleBtn = document.getElementById('voucher-toggle-btn');
    this.voucherError = document.getElementById('voucher-error');
    this.voucherSummary = document.getElementById('voucher-summary');
    this.ensureNotificationArea();
  }

  ensureNotificationArea() {
    if (document.getElementById('wishlist-notification')) return;

    const notification = document.createElement('div');
    notification.id = 'wishlist-notification';
    notification.className = 'wishlist-notification hidden';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
      <div class="wishlist-notification__content">
        <span class="wishlist-notification__message"></span>
        <button type="button" class="wishlist-notification__close" aria-label="Close notification">×</button>
      </div>
    `;

    const wishlistSection = document.getElementById('wishlist-content') || document.body;
    wishlistSection.parentNode.insertBefore(notification, wishlistSection);

    notification.querySelector('.wishlist-notification__close')?.addEventListener('click', () => {
      this.hideNotification();
    });
  }

  showNotification(message) {
    const notification = document.getElementById('wishlist-notification');
    if (!notification) return;

    const messageEl = notification.querySelector('.wishlist-notification__message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    notification.classList.remove('hidden');
    notification.classList.add('visible');

    if (this.notificationTimer) {
      window.clearTimeout(this.notificationTimer);
    }

    this.notificationTimer = window.setTimeout(() => {
      this.hideNotification();
    }, 6000);
  }

  hideNotification() {
    const notification = document.getElementById('wishlist-notification');
    if (!notification) return;

    notification.classList.remove('visible');
    notification.classList.add('hidden');

    if (this.notificationTimer) {
      window.clearTimeout(this.notificationTimer);
      this.notificationTimer = null;
    }
  }

  async loadWishlistFromBackend() {
    const tbody = document.querySelector('#wishlist tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-message">Loading books...</td>
        </tr>
      `;
    }

    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const selectedMap = new Map(this.items.filter((item) => item.selected).map((item) => [String(item.id), true]));

      this.items = items
        .filter((item) => item && item.bookId)
        .map((item) => this.normalizeCartItem(item, selectedMap));

      localStorage.setItem('useBackendCheckout', 'true');
      localStorage.setItem('wishlist', JSON.stringify(this.items.map((item) => this.toWishlistStorageItem(item))));
    } catch (error) {
      console.warn('Backend cart unavailable, keeping wishlist empty:', error);
      this.items = [];
      this.appliedVoucher = null;
      localStorage.setItem('useBackendCheckout', 'false');
      localStorage.removeItem('wishlist');
      localStorage.removeItem('checkoutWishlist');
      localStorage.removeItem('checkoutVoucher');
      localStorage.removeItem('lastOrderItems');
      localStorage.removeItem('lastOrderSummary');
    }
  }

  normalizeCartItem(item, selectedMap = new Map()) {
    const book = item.bookId || {};
    const id = String(book._id || book.id || item.bookId || item.id || book.slug || book.title || '');
    const price = Number(book.finalPrice || book.listPrice || item.price || 0);

    return {
      id,
      name: book.title || item.name || 'Untitled',
      author: book.author || item.author || 'N/A',
      image: this.resolveImage(book),
      price,
      format: book.coverType || item.format || 'N/A',
      language: book.language || item.language || 'N/A',
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      selected: selectedMap.size > 0 ? selectedMap.has(id) : true,
      coverType: book.coverType || '',
      rating: Number(book.avgRating || 0),
      reviewCount: Number(book.reviewCount || 0),
    };
  }

  toWishlistStorageItem(item) {
    return {
      id: item.id,
      name: item.name,
      author: item.author,
      image: item.image,
      price: item.price,
      format: item.format,
      language: item.language,
      quantity: item.quantity,
      selected: item.selected,
    };
  }

  resolveImage(book) {
    const cover = book.coverImageUrl || book.cover || (Array.isArray(book.images) && book.images[0]) || '';
    if (!cover) return '';
    if (/^(https?:)?\/\//.test(cover) || cover.startsWith('data:') || cover.startsWith('/')) return cover;
    return cover.startsWith('uploads/') ? `/${cover}` : cover;
  }

  renderWishlistTable() {
    const tbody = document.querySelector('#wishlist tbody');
    if (!tbody) return;

    if (this.items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-message" data-i18n="wishlist-empty">
            Your wishlist is empty. Keep shopping to add books!
          </td>
        </tr>
      `;
      this.updateTotal();
      this.updateVoucherSummary();
      return;
    }

    tbody.innerHTML = this.items
      .map((item, index) => {
        const itemTotal = item.selected ? item.price * item.quantity : 0;
        const coverMarkup = item.image
          ? `<img src="${this.escapeHtml(item.image)}" alt="${this.escapeHtml(item.name)}" class="product-image" loading="lazy" />`
          : `<div class="product-image product-image-placeholder">${this.escapeHtml(this.getInitials(item.name))}</div>`;

        return `
          <tr data-product-id="${this.escapeHtml(item.id)}" class="${item.selected ? '' : 'unselected'}">
            <td class="select-cell">
              <label class="checkbox-container">
                <input type="checkbox" class="wishlist-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''} />
                <span></span>
              </label>
            </td>
            <td>
              <div class="product-details">
                ${coverMarkup}
                <div class="product-text">
                  <strong>${this.escapeHtml(item.name)}</strong>
                  <div class="product-specs">
                    <p><strong data-i18n="book-author-label">Author</strong></p>
                    <p>${this.escapeHtml(item.author || 'N/A')}</p>
                    <p><strong data-i18n="book-format-label">Format</strong></p>
                    <p>${this.escapeHtml(item.format || 'N/A')}</p>
                  </div>
                </div>
              </div>
            </td>
            <td class="price-cell">${this.formatPrice(item.price)}</td>
            <td class="quantity-cell">
              <div class="quantity-selector">
                <span class="quantity-value">${item.quantity}</span>
                <span class="quantity-arrow">▼</span>
                <select class="quantity-dropdown" data-index="${index}" style="display: none;">
                  ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${item.quantity === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}
                </select>
              </div>
            </td>
            <td class="total-cell">
              <div class="total-with-remove">
                <div class="item-total">${this.formatPrice(itemTotal)}</div>
                <button class="remove-btn" data-index="${index}" type="button">
                  <span>×</span> <span data-i18n="remove-btn">Remove</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    this.updateTotal();
    this.updateVoucherSummary();
  }

  updateTotal() {
    const totalEl = document.getElementById('wishlist-total');
    if (!totalEl) return;

    const total = this.items.reduce((sum, item) => sum + (item.selected ? item.price * item.quantity : 0), 0);
    totalEl.textContent = this.formatPrice(total);
  }

  toggleSelection(index, checked) {
    if (!this.items[index]) return;
    this.items[index].selected = checked;
    this.syncStorageWishlist();
    this.renderWishlistTable();
  }

  async setQuantity(index, newQuantity) {
    const item = this.items[index];
    if (!item || newQuantity < 1) return;

    try {
      const response = await fetch(`/api/cart/items/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await this.loadWishlistFromBackend();
      this.renderWishlistTable();
      updateWishlistCounter();
    } catch (error) {
      console.warn('Unable to update cart quantity:', error);
    }
  }

  getVoucherByCode(code) {
    const normalizedCode = code.toUpperCase() === 'HAGUCHI10' ? 'JUNDOKU10' : code.toUpperCase();
    return this.availableVouchers.find((voucher) => voucher.code === normalizedCode);
  }

  loadVoucherFromStorage() {
    const stored = localStorage.getItem('checkoutVoucher');
    if (stored) {
      try {
        this.appliedVoucher = JSON.parse(stored);
      } catch {
        this.appliedVoucher = null;
      }
    }
  }

  renderAvailableVouchers() {
    const voucherList = document.getElementById('voucher-list');
    if (!voucherList) return;

    voucherList.innerHTML = this.availableVouchers.map((voucher) => `
      <div class="voucher-item">
        <div class="voucher-item-header">
          <span class="voucher-item-title">${voucher.code}</span>
          <span class="voucher-discount">Giảm ${voucher.discount.toLocaleString('vi-VN')}đ</span>
        </div>
        <p class="voucher-item-detail">${voucher.description}</p>
        <div class="voucher-footer">
          <span class="voucher-expiry">Hạn dùng ${voucher.expires}</span>
          <button type="button" class="voucher-select-btn" data-voucher-code="${voucher.code}">Chọn</button>
        </div>
      </div>
    `).join('');
  }

  applyVoucherCode() {
    if (!this.voucherCodeInput || !this.voucherError) return;

    const code = this.voucherCodeInput.value.trim().toUpperCase();
    if (!code) {
      this.voucherError.textContent = 'Vui lòng nhập mã voucher.';
      return;
    }

    const voucher = this.getVoucherByCode(code);
    if (!voucher) {
      this.voucherError.textContent = 'Mã voucher không hợp lệ.';
      return;
    }

    if (voucher.status !== 'Active') {
      this.voucherError.textContent = 'Mã voucher đã hết hạn hoặc không còn hiệu lực.';
      return;
    }

    this.appliedVoucher = voucher;
    localStorage.setItem('checkoutVoucher', JSON.stringify(voucher));
    this.voucherError.textContent = '';
    this.updateVoucherSummary();
    this.updateTotal();
    this.voucherCodeInput.value = voucher.code;
  }

  updateVoucherSummary() {
    if (!this.voucherSummary) return;

    const total = this.items.reduce((sum, item) => sum + (item.selected ? item.price * item.quantity : 0), 0);
    const discount = this.appliedVoucher ? Math.min(this.appliedVoucher.discount, total) : 0;
    const finalTotal = Math.max(total - discount, 0);

    if (this.appliedVoucher) {
      this.voucherSummary.innerHTML = `
        <div class="voucher-summary-text">Áp dụng voucher <strong>${this.appliedVoucher.code}</strong> - giảm ${discount.toLocaleString('vi-VN')}đ.</div>
        <div class="voucher-summary-text">Tổng sau giảm: <strong>${this.formatPrice(finalTotal)}</strong></div>
      `;
    } else {
      this.voucherSummary.innerHTML = '<div class="voucher-summary-text">Chưa có voucher được áp dụng.</div>';
    }
  }

  clearVoucherError() {
    if (this.voucherError) this.voucherError.textContent = '';
  }

  attachEventListeners() {
    const tbody = document.querySelector('#wishlist tbody');
    if (tbody) {
      tbody.addEventListener('change', (event) => {
        const checkbox = event.target.closest('.wishlist-checkbox');
        if (checkbox) {
          const index = Number(checkbox.dataset.index);
          this.toggleSelection(index, checkbox.checked);
          return;
        }

        const quantityDropdown = event.target.closest('.quantity-dropdown');
        if (quantityDropdown) {
          const index = Number(quantityDropdown.dataset.index);
          this.setQuantity(index, Number(quantityDropdown.value));
        }
      });

      tbody.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('.remove-btn');
        if (removeBtn) {
          const index = Number(removeBtn.dataset.index);
          this.removeItem(index);
          return;
        }

        const quantitySelector = event.target.closest('.quantity-selector');
        if (quantitySelector) {
          const dropdown = quantitySelector.querySelector('.quantity-dropdown');
          if (dropdown) {
            tbody.querySelectorAll('.quantity-dropdown').forEach((other) => {
              if (other !== dropdown) other.style.display = 'none';
            });
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
          }
        }
      });
    }

    const continueBtn = document.querySelector('.continue-bu');
    if (continueBtn) {
      continueBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const selectedItems = this.items.filter((item) => item.selected);

        if (selectedItems.length === 0) {
          this.showNotification('Vui lòng chọn ít nhất một cuốn sách để tiếp tục.');
          return;
        }

        localStorage.setItem('useBackendCheckout', 'true');
        localStorage.setItem('checkoutWishlist', JSON.stringify(selectedItems.map((item) => this.toCheckoutItem(item))));
        localStorage.setItem('wishlist', JSON.stringify(this.items.map((item) => this.toWishlistStorageItem(item))));

        if (this.appliedVoucher) {
          localStorage.setItem('checkoutVoucher', JSON.stringify(this.appliedVoucher));
        }

        window.location.href = 'wishlist-send_index.html';
      });
    }

    if (this.applyVoucherBtn) {
      this.applyVoucherBtn.addEventListener('click', () => this.applyVoucherCode());
    }

    if (this.voucherToggleBtn && this.voucherList) {
      this.voucherToggleBtn.addEventListener('click', () => {
        this.voucherList.classList.toggle('hidden');
        this.voucherToggleBtn.classList.toggle('open');
      });
    }

    if (this.voucherList) {
      this.voucherList.addEventListener('click', (event) => {
        const button = event.target.closest('.voucher-select-btn');
        if (!button) return;

        const voucherCode = button.dataset.voucherCode;
        if (voucherCode && this.voucherCodeInput) {
          this.voucherCodeInput.value = voucherCode;
          this.clearVoucherError();
          this.applyVoucherCode();
          this.voucherList.classList.add('hidden');
          this.voucherToggleBtn?.classList.remove('open');
        }
      });
    }

    if (this.voucherCodeInput) {
      this.voucherCodeInput.addEventListener('input', () => this.clearVoucherError());
    }
  }

  async removeItem(index) {
    const item = this.items[index];
    if (!item) return;

    try {
      const response = await fetch(`/api/cart/items/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await this.loadWishlistFromBackend();
      this.renderWishlistTable();
      updateWishlistCounter();
    } catch (error) {
      console.warn('Unable to remove cart item:', error);
    }
  }

  syncStorageWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.items.map((item) => this.toWishlistStorageItem(item))));
    updateWishlistCounter();
  }

  toCheckoutItem(item) {
    return {
      id: item.id,
      name: item.name,
      author: item.author,
      image: item.image,
      price: item.price,
      format: item.format,
      language: item.language,
      quantity: item.quantity,
      selected: item.selected,
    };
  }

  formatPrice(price) {
    return `${Number(price).toLocaleString('vi-VN')} đ`;
  }

  getInitials(title) {
    const words = String(title || '').trim().split(/\s+/).slice(0, 2);
    return words.map((word) => word.charAt(0).toUpperCase()).join('');
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  saveToStorage() {
    this.syncStorageWishlist();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Wishlist();
});
