//Nhóm 9: Form thanh toán 
class PaymentHandler {
//Khởi tạo các phần tử cho PaymentHandler
  constructor() {
    this.codRadio = document.getElementById('cod');
    this.bankRadio = document.getElementById('bank');
    this.vnpayRadio = document.getElementById('vnpay');
    this.qrSection = document.getElementById('qr-section');
    this.vnpaySection = document.getElementById('vnpay-section');
    this.paymentForm = document.getElementById('paymentForm');
    this.phoneInput = document.querySelector('input[name="phone"]');
    this.voucherCodeInput = document.getElementById('voucher-code');
    this.applyVoucherBtn = document.getElementById('applyVoucherBtn');
    this.voucherToggleBtn = document.getElementById('voucher-toggle-btn');
    this.voucherList = document.getElementById('voucher-list');
    this.voucherTicketList = document.getElementById('voucher-ticket-list');
    this.voucherSection = document.querySelector('.voucher-section');
    this.voucherError = document.getElementById('voucher-error');
    this.voucherSummary = document.getElementById('voucher-summary');
    this.orderPriceSummary = document.getElementById('order-price-summary');
    this.checkoutItems = [];
    this.appliedVoucher = null;
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
    this.savedVouchers = [];
    this.init();
  }
  //Lấy ngôn ngữ hiện tại từ lang-change.js
  getCurrentLanguage() {
    // Kiểm tra xem lang-change.js đã load chưa
    if (typeof currentLang !== 'undefined') {
        return currentLang;
    }
    // Fallback: check localStorage
    return localStorage.getItem('selectedLanguage') || 'en';
  }

  //Lấy translation từ lang-change.js (đã load JSON)
  getTranslation(key) {
    // Kiểm tra xem translations từ lang-change.js đã có chưa
    if (typeof translations !== 'undefined' && translations[key]) {
        return translations[key];
    }
    // Fallback: return key nếu không tìm thấy
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }

  //Lấy error message theo ngôn ngữ hiện tại
  getErrorMessage(fieldName) {
    const pleaseEnterText = this.getTranslation('error-please-enter');
    const fieldLabel = this.getTranslation(`error-field-${fieldName}`);
    
    return `${pleaseEnterText} ${fieldLabel}`;
  } 

  //Lấy error message cho phone validation
  getPhoneErrorMessage() {
    return this.getTranslation('error-invalid-phone');
  }


//Khởi tạo event listeners
  init() {
    // Gắn listener cho COD radio button - thay đổi phương thức thanh toán
    if (this.codRadio) {
      this.codRadio.addEventListener('change', () => this.toggleQRSection());
    }

    // Gắn listener cho Bank radio button - thay đổi phương thức thanh toán
    if (this.bankRadio) {
      this.bankRadio.addEventListener('change', () => this.toggleQRSection());
    }

    // Gắn listener cho VNPAY radio button
    if (this.vnpayRadio) {
      this.vnpayRadio.addEventListener('change', () => this.toggleQRSection());
    }

    // Gắn listener cho nút áp dụng voucher
    if (this.applyVoucherBtn) {
      this.applyVoucherBtn.addEventListener('click', () => this.applyVoucherCode());
    }

    if (this.voucherList) {
      this.voucherList.addEventListener('click', (e) => {
        const button = e.target.closest('.voucher-select-btn');
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

    if (this.voucherToggleBtn && this.voucherList) {
      this.voucherToggleBtn.addEventListener('click', () => {
        this.voucherList.classList.toggle('hidden');
        this.voucherToggleBtn.classList.toggle('open');
      });
    }

    // Gắn listeners để xóa lỗi khi người dùng nhập lại
    this.attachClearErrorListeners();

    // Gắn listener cho phone input để chỉ cho phép nhập số - loại ký tự không phải số, chỉ nhập số 
    if (this.phoneInput) {
      this.phoneInput.addEventListener('input', (e) => this.validatePhoneInput(e));
      this.phoneInput.addEventListener('keypress', (e) => this.onlyNumbersKeypress(e));
    }

    // Gắn listener cho form submit - xử lý submit form
    if (this.paymentForm) {
      this.paymentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    } else {
      return;
    }

    this.loadSavedVouchersFromStorage();
    this.loadCheckoutWishlist();
    this.loadCheckoutVoucherFromStorage();
    this.setupVoucherDisplay();
    this.renderAvailableVouchers();
    this.updateVoucherSummary();
    this.updateOrderPrice();

    // Khởi động hiển thị QR section - ẩn/ hiện dựa trên lựa chọn phương thức thanh toán
    this.toggleQRSection();
  }
// attachClearErrorListeners() - xóa lỗi khi người dùng nhập
  attachClearErrorListeners() {
    if (!this.paymentForm) return;
      // Danh sách tất cả các input và select cần theo dõi
      const fields = this.paymentForm.querySelectorAll('input[name], select[name]');

      fields.forEach(field => {
        // Xóa lỗi khi người dùng bắt đầu nhập/chọn
        field.addEventListener('input', () => {
          this.clearFieldError(field);
        });
        // Đặc biệt cho select (dùng 'change' thay vì 'input')
        if (field.tagName === 'SELECT') {
          field.addEventListener('change', () => {
            this.clearFieldError(field);
          });
        }
      });
  }
  //validatePhoneInput(e) - Chỉ cho phép nhập số
  validatePhoneInput(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  }

  //onlyNumbersKeypress(e) - Ngăn nhập ký tự không phải số
  onlyNumbersKeypress(e) {
    const char = String.fromCharCode(e.which);
    //Nếu ký tự không phải số thì ngăn không cho nhập
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  }

  //toggleQRSection() - Ẩn/hiện phần QR/VNPAY dựa trên lựa chọn phương thức thanh toán
  toggleQRSection() {
    if (this.qrSection && this.bankRadio) {
      this.qrSection.style.display = this.bankRadio.checked ? 'block' : 'none';
    }
    if (this.vnpaySection && this.vnpayRadio) {
      this.vnpaySection.style.display = this.vnpayRadio.checked ? 'block' : 'none';
    }
  }

  //getFieldLabel(fieldName) - Giúp đổi tên field cho dễ đọc khi báo lỗi.
  getFieldLabel(fieldName) {
    const labels = {
      'name': 'name',
      'surname': 'surname',
      'email': 'email',
      'phone': 'phone number',
      'country': 'country',
      'address': 'address',
      'city': 'city',
      'province': 'province'
    };
    return labels[fieldName] || fieldName;
  }

 //showFieldError(input, message) - Hiển thị error cho input field
  showFieldError(input, message) {
    if (!input) return;

    // Tô viền đỏ cho input
    input.style.setProperty('border', '1px solid #ff0000', 'important');
    input.style.setProperty('border-color', '#ff0000', 'important');

    // Kiểm tra xem đã có error message chưa
    const fieldWrapper = input.closest('div') || input.parentElement;
    let errorMsg = fieldWrapper.querySelector('.field-error-message');
    // Nếu đã có rồi thì chỉ cần cập nhật nội dung
    if (errorMsg) {
      errorMsg.textContent = message;
      return;
    }

    // Tạo error message
    errorMsg = document.createElement('div');
    errorMsg.className = 'field-error-message';
    errorMsg.textContent = message;
    errorMsg.style.cssText = `
      color: #ff0000;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 300;
      line-height: 1.4;
    `;
    //báo lỗi UI + thông báo console
    if (fieldWrapper) {
      fieldWrapper.appendChild(errorMsg);
    }
    console.log(`Error: ${message}`);
  }

  //clearFieldError(input) - Xóa error message của input field
  clearFieldError(input) {
    if (!input) return;

    input.style.removeProperty('border');
    input.style.removeProperty('border-color');

    const fieldWrapper = input.closest('div') || input.parentElement;
    const errorMsg = fieldWrapper.querySelector('.field-error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }

  //clearAllErrors() - Xóa tất cả error messages
  clearAllErrors() {
    const errorMessages = this.paymentForm.querySelectorAll('.field-error-message');
    errorMessages.forEach(msg => msg.remove());

    const inputs = this.paymentForm.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.style.removeProperty('border');
      input.style.removeProperty('border-color');
    });

    if (this.voucherError) {
      this.voucherError.textContent = '';
    }
  }

  loadSavedVouchersFromStorage() {
    const saved = localStorage.getItem('savedVouchers');
    this.savedVouchers = saved ? JSON.parse(saved) : [];
    this.renderVoucherTickets();
    this.updateVoucherSummary();
    this.prefillActiveVoucherCode();
  }

  loadCheckoutWishlist() {
    if (localStorage.getItem('useBackendCheckout') !== 'true') {
      this.checkoutItems = [];
      localStorage.removeItem('checkoutWishlist');
      return;
    }

    const stored = localStorage.getItem('checkoutWishlist');
    this.checkoutItems = stored ? JSON.parse(stored) : [];
  }

  loadCheckoutVoucherFromStorage() {
    const stored = localStorage.getItem('checkoutVoucher');
    if (!stored) return;

    const voucher = JSON.parse(stored);
    if (voucher && voucher.code) {
      this.appliedVoucher = voucher;
      if (this.voucherCodeInput) {
        this.voucherCodeInput.value = voucher.code;
      }
    }
  }

  setupVoucherDisplay() {
    if (!this.voucherSection) return;

    const hasCheckoutVoucher = this.checkoutItems.length > 0 && !!localStorage.getItem('checkoutVoucher');
    if (hasCheckoutVoucher) {
      this.voucherSection.classList.add('hidden');
    } else {
      this.voucherSection.classList.remove('hidden');
    }
  }

  saveVouchersToStorage() {
    localStorage.setItem('savedVouchers', JSON.stringify(this.savedVouchers));
  }

  prefillActiveVoucherCode() {
    const activeVoucher = this.savedVouchers.find((voucher) => voucher.active);
    if (activeVoucher && this.voucherCodeInput) {
      this.voucherCodeInput.value = activeVoucher.code;
    }
  }

  getCheckoutSubtotal() {
    return this.checkoutItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  updateOrderPrice() {
    if (!this.orderPriceSummary) return;
    const subtotal = this.getCheckoutSubtotal();
    const activeVoucher = this.savedVouchers.find((voucher) => voucher.active);
    const discount = activeVoucher ? Math.min(activeVoucher.discount, subtotal) : 0;
    const finalTotal = Math.max(subtotal - discount, 0);

    this.orderPriceSummary.innerHTML = `
      <div><strong>Tổng giá trước giảm:</strong> ${subtotal.toLocaleString('vi-VN')} đ</div>
      <div><strong>Giảm giá voucher:</strong> ${discount.toLocaleString('vi-VN')} đ</div>
      <div><strong>Tổng thanh toán:</strong> ${finalTotal.toLocaleString('vi-VN')} đ</div>
    `;
  }

  renderAvailableVouchers() {
    if (!this.voucherList) return;

    this.voucherList.innerHTML = this.availableVouchers
      .map((voucher) => `
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
      `)
      .join('');
  }

  renderVoucherTickets() {

    if (!this.voucherTicketList) return;
    if (this.savedVouchers.length === 0) {
      this.voucherTicketList.innerHTML = '<p class="voucher-empty">Không có voucher nào được lưu.</p>';
      return;
    }

    this.voucherTicketList.innerHTML = this.savedVouchers.map(voucher => {
      const activeClass = voucher.active ? 'voucher-ticket-active' : '';
      return `
        <div class="voucher-ticket ${activeClass}">
          <div class="voucher-meta">
            <span class="voucher-code">${voucher.code}</span>
            <span class="voucher-discount">Giảm ${voucher.discount.toLocaleString('vi-VN')}đ</span>
          </div>
          <p class="voucher-desc">${voucher.description}</p>
          <div class="voucher-footer">
            <span class="voucher-expiry">Hạn dùng ${voucher.expires}</span>
            <span class="voucher-status">${voucher.status}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  getVoucherByCode(code) {
    const normalizedCode = code.toUpperCase() === 'HAGUCHI10' ? 'JUNDOKU10' : code.toUpperCase();
    return this.availableVouchers.find(voucher => voucher.code === normalizedCode);
  }

  applyVoucherCode() {
    if (!this.voucherCodeInput) return;
    const code = this.voucherCodeInput.value.trim().toUpperCase();
    if (!code) {
      this.showVoucherError('Vui lòng nhập mã voucher.');
      return;
    }

    const voucher = this.getVoucherByCode(code);
    if (!voucher) {
      this.showVoucherError('Mã voucher không hợp lệ.');
      return;
    }

    if (voucher.status !== 'Active') {
      this.showVoucherError('Mã voucher đã hết hạn hoặc không còn hiệu lực.');
      return;
    }

    const exists = this.savedVouchers.some(v => v.code === voucher.code);
    if (exists) {
      this.savedVouchers.forEach(v => v.active = v.code === voucher.code);
      this.saveVouchersToStorage();
      this.renderVoucherTickets();
      this.updateVoucherSummary();
      this.updateOrderPrice();
      return;
    }

    this.savedVouchers.forEach(v => v.active = false);
    this.savedVouchers.push({ ...voucher, active: true });
    this.saveVouchersToStorage();
    this.renderVoucherTickets();
    this.updateVoucherSummary();
    this.updateOrderPrice();
  }

  updateVoucherSummary() {
    if (!this.voucherSummary) return;
    const activeVoucher = this.savedVouchers.find(v => v.active);
    if (activeVoucher) {
      this.voucherSummary.innerHTML = `
        <div class="voucher-summary-text">Áp dụng voucher <strong>${activeVoucher.code}</strong> - giảm ${activeVoucher.discount.toLocaleString('vi-VN')}đ.</div>
      `;
    } else {
      this.voucherSummary.innerHTML = '<div class="voucher-summary-text">Chưa có voucher được áp dụng.</div>';
    }
  }

  showVoucherError(message) {
    if (!this.voucherError) return;
    this.voucherError.textContent = message;
    this.voucherError.style.color = '#d44';
  }

  clearVoucherError() {
    if (!this.voucherError) return;
    this.voucherError.textContent = '';
  }

  //validateForm() - Kiểm tra tính hợp lệ của form
  validateForm() {
    this.clearAllErrors();

    const errors = [];
    let firstErrorInput = null;

    //1. Kiểm tra các field bắt buộc (không dùng [required] selector)
    const requiredFields = ['name', 'surname', 'email', 'phone', 'country', 'address', 'city', 'province'];
    
    requiredFields.forEach(fieldName => {
      const input = this.paymentForm.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"]`);
      if (input && !input.value.trim()) {
        // Sử dụng getErrorMessage() để lấy text từ JSON
        const errorMessage = this.getErrorMessage(fieldName);
        this.showFieldError(input, errorMessage);
        errors.push(fieldName);
        
        if (!firstErrorInput) {
            firstErrorInput = input;
        }
      }
    });

    //2. Kiểm tra phone number format
    const phoneInput = this.paymentForm.querySelector('input[name="phone"]');
    if (phoneInput && phoneInput.value) {
      const phoneDigits = phoneInput.value.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        const errorMessage = this.getPhoneErrorMessage();
        this.showFieldError(phoneInput, errorMessage);
        errors.push('phone (min 10 digits)');
        
        if (!firstErrorInput) {
          firstErrorInput = phoneInput;
        }
      }
    }

    //3. Kiểm tra payment method
    const paymentMethod = new FormData(this.paymentForm).get('payment');
    if (!paymentMethod) {
      errors.push('payment method');
      
      const paymentSection = this.paymentForm.querySelector('.payment-methods') 
                           || this.paymentForm.querySelector('[name="payment"]')?.closest('div');
      if (paymentSection && !firstErrorInput) {
        firstErrorInput = paymentSection;
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      firstErrorInput: firstErrorInput
    };
  }

  //collectFormData() - Thu thập dữ liệu từ form 
  collectFormData() {
    const formData = new FormData(this.paymentForm);
    const activeVoucher = this.savedVouchers.find(v => v.active);
    return {
      name: formData.get('name') || '',
      surname: formData.get('surname') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      country: formData.get('country') || '',
      address: formData.get('address') || '',
      city: formData.get('city') || '',
      province: formData.get('province') || '',
      payment: formData.get('payment'),
      voucherCode: activeVoucher ? activeVoucher.code : '',
      voucherDiscount: activeVoucher ? activeVoucher.discount : 0,
      timestamp: new Date().toISOString(),
    };
  }

  //handleFormSubmit(e) - Xử lý submit form
  async handleFormSubmit(e) {
    e.preventDefault();

    console.log('FORM SUBMITTED');
    console.log('='.repeat(50));
    //kiểm tra validation - tính hợp lệ của form
    const validation = this.validateForm();

    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      
      if (validation.firstErrorInput) {
        validation.firstErrorInput.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        if (validation.firstErrorInput.tagName === 'INPUT' || 
            validation.firstErrorInput.tagName === 'SELECT') {
          setTimeout(() => {
            validation.firstErrorInput.focus();
          }, 500);
        }
      }
      
      console.log(' Please fix the errors above');
      console.log('='.repeat(50) + '\n');
      return;
    }

    console.log('Validation passed\n');
    //Form hợp lệ --> Thu thập dữ liệu từ form
    const customerData = this.collectFormData();
    const activeVoucher = this.savedVouchers.find(v => v.active);

    console.log('👤 CUSTOMER DATA:');
    console.table(customerData);

    localStorage.setItem('customerInfo', JSON.stringify(customerData));
    console.log('Saved to localStorage\n');
    localStorage.setItem('lastOrderItems', JSON.stringify(this.checkoutItems));
    localStorage.setItem('lastOrderSummary', JSON.stringify({
      subtotal: this.getCheckoutSubtotal(),
      voucherCode: customerData.voucherCode || '',
      voucherDiscount: customerData.voucherDiscount || 0,
      paymentMethod: customerData.payment,
      timestamp: customerData.timestamp
    }));

    if (customerData.voucherCode) {
      localStorage.setItem('appliedVoucher', JSON.stringify({
        code: customerData.voucherCode,
        discount: customerData.voucherDiscount
      }));
      console.log(`Applied voucher: ${customerData.voucherCode}`);
    }

    const checkoutPayload = {
      recipientName: `${customerData.name} ${customerData.surname}`.trim(),
      recipientPhone: customerData.phone,
      recipientEmail: customerData.email,
      recipientAddress: [customerData.address, customerData.city, customerData.province].filter(Boolean).join(', '),
      paymentMethod: customerData.payment,
      customerNote: customerData.saveInfo ? 'Save this information for next time' : '',
      productVoucherCode: activeVoucher ? activeVoucher.code : undefined,
      shippingVoucherCode: undefined,
    };

    try {
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Checkout failed');
      }

      localStorage.setItem('lastOrderId', result.order?._id || result.order?.orderCode || '');
      localStorage.setItem('lastPaymentMethod', customerData.payment.toUpperCase());

      console.log(`Redirecting after backend checkout with ${customerData.payment}...`);
      console.log('='.repeat(50) + '\n');

      const destination = customerData.payment === 'cod'
        ? 'success_index.html'
        : customerData.payment === 'vnpay'
          ? 'vnpay.html'
          : 'bank.html';

      window.location.href = destination;
      return;
    } catch (error) {
      console.warn('Backend checkout unavailable, using local fallback:', error);
    }

    // Fallback cũ nếu backend chưa chạy
    const paymentMethod = customerData.payment;
    const destination = paymentMethod === 'cod' ? 'success_index.html' : paymentMethod === 'vnpay' ? 'vnpay.html' : 'bank.html';
    console.log(`Redirecting to ${destination}...`);
    console.log('='.repeat(50) + '\n');

    window.location.href = destination;
  }
}

//Khởi tạo PaymentHandler khi trang load xong
document.addEventListener('DOMContentLoaded', function() {
  window.paymentHandler = new PaymentHandler();
});

//Xuất thông tin module để sử dụng trong trang khác 
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentHandler;
}