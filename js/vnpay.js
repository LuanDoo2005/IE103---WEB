document.addEventListener('DOMContentLoaded', () => {
  const amountEl = document.getElementById('vnpay-amount');
  const voucherEl = document.getElementById('vnpay-voucher');
  const discountEl = document.getElementById('vnpay-discount');
  const orderIdEl = document.getElementById('vnpay-order-id');
  const confirmBtn = document.getElementById('confirmVnpayBtn');
  const cancelBtn = document.getElementById('cancelVnpayBtn');

  const canUseBackendCheckout = localStorage.getItem('useBackendCheckout') === 'true';
  const storedSummary = localStorage.getItem('lastOrderSummary');
  const storedOrderId = localStorage.getItem('lastOrderId');
  const cartData = canUseBackendCheckout ? (localStorage.getItem('checkoutWishlist') || localStorage.getItem('cartProducts')) : null;
  const voucherData = localStorage.getItem('appliedVoucher');
  let orderItems = [];
  if (cartData) {
    try {
      orderItems = JSON.parse(cartData);
    } catch (error) {
      console.warn('Không đọc được dữ liệu giỏ hàng:', error);
    }
  }
  const orderSummary = storedSummary ? JSON.parse(storedSummary) : null;
  const orderId = storedOrderId || (orderSummary?.orderId ?? `JD${Date.now().toString().slice(-8)}`);

  let subtotal = Number(orderSummary?.subtotal || 0);
  if (!subtotal && cartData) {
    try {
      const products = JSON.parse(cartData);
      subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    } catch (error) {
      console.warn('Không đọc được dữ liệu giỏ hàng:', error);
    }
  }

  const tax = Math.round(subtotal * 0.05);
  let discount = Number(orderSummary?.voucherDiscount || 0);
  let voucherCode = orderSummary?.voucherCode || 'Không có';

  if (voucherData) {
    const voucher = JSON.parse(voucherData);
    if (voucher && voucher.code) {
      voucherCode = voucher.code;
      discount = parseInt(voucher.discount, 10) || 0;
    }
  }

  const total = subtotal + tax - discount;
  amountEl.textContent = `${total.toLocaleString('vi-VN')} VND`;
  voucherEl.textContent = voucherCode;
  discountEl.textContent = `${discount.toLocaleString('vi-VN')} VND`;
  orderIdEl.textContent = orderId;

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      localStorage.setItem('lastPaymentMethod', 'VNPAY');
      localStorage.setItem('lastOrderId', orderId);
      localStorage.setItem('lastOrderItems', JSON.stringify(orderItems));
      localStorage.setItem('lastOrderSummary', JSON.stringify({
        subtotal,
        voucherCode,
        voucherDiscount: discount,
        paymentMethod: 'vnpay',
        timestamp: new Date().toISOString()
      }));
      window.location.href = 'success_index.html';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'wishlist-send_index.html';
    });
  }
});
