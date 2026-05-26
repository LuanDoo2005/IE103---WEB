//Nhóm 9: Chi tiết đơn hàng 
class OrderDetailPage {
    // Khởi tạo
    constructor() {
        this.orderProducts = [];
        this.init();
        // Hiển thị thông tin khách hàng
        this.displayCustomerInfo();
        // Hiển thị thông tin sản phẩm
        this.displayProductInfo();
    }

    // Khởi tạo event listeners
    init() {
        // Gắn listener cho các nút bấm
        const contactSellerBtn = document.getElementById('contactSellerBtn');
        const buyAgainBtn = document.getElementById('buyAgainBtn');
        // contact --> gửi email liên hệ
        if (contactSellerBtn) {
            contactSellerBtn.addEventListener('click', () => this.handleContactSeller());
        }
        // buy again --> chuyển đến trang wishlist
        if (buyAgainBtn) {
            buyAgainBtn.addEventListener('click', () => { window.location.href = 'wishlist_index.html';});
        }
    }

    // Hiển thị thông tin khách hàng từ localStorage
    displayCustomerInfo() {
        // Lấy dữ liệu từ localStorage
        const savedInfo = localStorage.getItem('customerInfo');

        // Log console
        console.log('\n' + '='.repeat(50));
        console.log('ORDER VIEW - CUSTOMER INFORMATION');
        console.log('='.repeat(50));

        if (savedInfo) {
            try {
                const customerData = JSON.parse(savedInfo);

                // Hiển thị thông tin trong console
                const customerTable = {
                    'name': customerData.name,
                    'surname': customerData.surname,
                    'email': customerData.email,
                    'phone': customerData.phone,
                    'country': customerData.country,
                    'address': customerData.address,
                    'city': customerData.city,
                    'province': customerData.province,
                    'payment': customerData.payment === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer',
                    'timestamp': new Date(customerData.timestamp).toLocaleString('vi-VN')
                };

                // Cập nhật giao diện - Delivery Address Section
                this.updateDeliveryAddress(customerData);

                // Cập nhật phương thức thanh toán
                this.updatePaymentMethod(customerData);

                // Cập nhật thời gian đặt hàng
                this.updateOrderTime(customerData);

                // Cập nhật Payment Status
                this.updatePaymentStatus(customerData);

                // Cập nhật mã đơn hàng và thời gian hiển thị
                this.updateOrderMeta(customerData);

                console.log('✅ Đã cập nhật thông tin lên giao diện');

            } catch (error) {
                console.error('❌ Lỗi khi đọc thông tin khách hàng:', error);
            }
        } else {
            console.warn('❗️ Không tìm thấy thông tin khách hàng trong localStorage');
            console.log('   Vui lòng điền thông tin tại trang thanh toán trước.');
            console.log('='.repeat(50) + '\n');
        }
    }

    // updateDeliveryAddress(customerData) - Cập nhật địa chỉ giao hàng
    updateDeliveryAddress(customerData) {
        const addressNameEl = document.querySelector('.address-name');
        const addressPhoneEl = document.querySelector('.address-phone');
        const addressDetailEl = document.querySelector('.address-detail');

        if (addressNameEl) {
            addressNameEl.textContent = `${customerData.name} ${customerData.surname}`;
        }

        if (addressPhoneEl) {
            addressPhoneEl.textContent = customerData.phone;
        }

        if (addressDetailEl) {
            // Tạo địa chỉ đầy đủ từ các trường
            const fullAddress = [
                customerData.address,
                customerData.city,
                customerData.province
            ].filter(item => item && item.trim()).join(', ');

            addressDetailEl.textContent = fullAddress || customerData.address;
        }
    }

     // updatePaymentMethod(customerData) - Cập nhật phương thức thanh toán
    updatePaymentMethod(customerData) {
        const paymentMethodEl = document.querySelector(
            '.payment-shipping-grid .info-card:first-child .info-value'
        );
    
        if (paymentMethodEl) {
            paymentMethodEl.innerHTML = ""; // clear old content
    
            const icon = document.createElement("span");
            const text = document.createElement("span");
    
            if (customerData.payment === "cod") {
                icon.className = "cod-icon";
                text.textContent = "Cash on Delivery (COD)";
            } else {
                icon.className = "atm-icon";
                text.textContent = "Bank Transfer (VietQR)";
            }
    
            paymentMethodEl.appendChild(icon);
            paymentMethodEl.appendChild(text);
        }
    }
    // updateOrderTime(customerData) - Cập nhật thời gian đặt hàng
    updateOrderTime(customerData) {
        const orderTimeElements = document.querySelectorAll('.info-card .info-value');

        // Tìm phần tử có chứa "ORDER TIME" ở nhãn
        const infoCards = document.querySelectorAll('.info-card');

        infoCards.forEach(card => {
            const label = card.querySelector('.info-label');
            const value = card.querySelector('.info-value');

            if (label && label.textContent.includes('ORDER TIME') && value) {
                const orderDate = new Date(customerData.timestamp);
                value.textContent = orderDate.toLocaleString('vi-VN');
            }
        });
    }

    // updatePaymentStatus(customerData) - Cập nhật trạng thái thanh toán
    updatePaymentStatus(customerData) {
        // Tìm element chứa PAYMENT STATUS
        const infoCards = document.querySelectorAll('.info-card');
        
        infoCards.forEach(card => {
            const label = card.querySelector('.info-label');
            const value = card.querySelector('.info-value');
            
            if (label && label.textContent.includes('PAYMENT STATUS') && value) {
                if (customerData.payment === 'bank') {
                    // Bank transfer -> Paid
                    value.textContent = 'Paid';
                    value.style.color = '#1D382C'; 
                    value.style.fontWeight = '600';
                    console.log('Payment Status: Paid (Bank Transfer)');
                } else if (customerData.payment === 'cod') {
                    // COD -> Not Paid
                    value.textContent = 'Not Paid';
                    value.style.color = '#FF0000'; 
                    value.style.fontWeight = '600';
                    console.log('Payment Status: Not Paid (COD)');
                }
            }
        });
    }

    updateOrderMeta(customerData) {
        const orderIdEl = document.querySelector('.order-id');
        const timelineTimestampEl = document.querySelector('.timeline-item.completed .timestamp');
        const savedOrderId = localStorage.getItem('lastOrderId');

        if (orderIdEl) {
            orderIdEl.innerHTML = `<span data-i18n="order-id-label">Order ID:</span> ${savedOrderId || 'JD2024110001'}`;
        }

        if (timelineTimestampEl && customerData.timestamp) {
            timelineTimestampEl.textContent = new Date(customerData.timestamp).toLocaleString('vi-VN');
        }
    }
    //handleContactSeller - Liên hệ người bán qua email
    handleContactSeller() {
        const email = 'support@noithatmaistudio.com';
        const subject = 'Product Inquiry';
        const body = 'I have a question about your products.';

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        console.log('📧 Mở email client để liên hệ');
    }

    //displayProductInfo() - Hiển thị thông tin sản phẩm từ localStorage
    displayProductInfo() {
        const products = this.loadOrderProducts();
        
        console.log('\n' + '='.repeat(50));
        console.log('ORDER VIEW - PRODUCT INFORMATION');
        console.log('='.repeat(50));
        
        if (products.length > 0) {
            console.log('✅ Đã tìm thấy thông tin sản phẩm:\n');
            console.table(products);

            console.log('\nCHI TIẾT SẢN PHẨM:');
            products.forEach((product, index) => {
                console.log(`\nSản phẩm ${index + 1}:`);
                console.log(`     Tên: ${product.name}`);
                console.log(`     Tác giả: ${product.author || 'Chưa chọn'}`);
                console.log(`     Định dạng: ${product.format || 'Chưa chọn'}`);
                console.log(`     Hình ảnh: ${product.image}`);
                console.log(`     Số lượng: ${product.quantity}`);
                console.log(`     Giá: ${Number(product.price).toLocaleString('vi-VN')} VND`);
                console.log(`     Thành tiền: ${(Number(product.price) * Number(product.quantity)).toLocaleString('vi-VN')} VND`);
                if (product.selectedColor && product.selectedColor.name) {
                    console.log(`     Phiên bản: ${product.selectedColor.name}`);
                }
            });

            const subtotal = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity || 1)), 0);
            const tax = Math.round(subtotal * 0.05);
            const total = subtotal + tax;

            console.log(`\n💰 TỔNG TIỀN:`);
            console.log(`   Subtotal: ${subtotal.toLocaleString('vi-VN')} VND`);
            console.log(`   Tax (5%): ${tax.toLocaleString('vi-VN')} VND`);
            console.log(`   Total: ${total.toLocaleString('vi-VN')} VND`);

            console.log('\n' + '='.repeat(50) + '\n');

            this.updateProductDisplay(products);

            console.log('✅ Đã cập nhật thông tin sản phẩm lên giao diện');
        } else {
            console.warn('❗ Không tìm thấy thông tin sản phẩm trong đơn hàng');
            console.log('='.repeat(50) + '\n');
        }
    }

    loadOrderProducts() {
        if (localStorage.getItem('useBackendCheckout') !== 'true') {
            this.orderProducts = [];
            localStorage.removeItem('lastOrderItems');
            localStorage.removeItem('checkoutWishlist');
            return this.orderProducts;
        }

        const sources = ['lastOrderItems', 'checkoutWishlist', 'cartProducts'];

        for (const key of sources) {
            const stored = localStorage.getItem(key);
            if (!stored) continue;

            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.orderProducts = parsed.map((product) => ({
                        ...product,
                        quantity: Number(product.quantity) > 0 ? Number(product.quantity) : 1,
                        price: Number(product.price) || 0
                    }));
                    return this.orderProducts;
                }
            } catch (error) {
                console.warn(`Không đọc được dữ liệu từ ${key}:`, error);
            }
        }

        this.orderProducts = [];
        return this.orderProducts;
    }

    // updateProductDisplay(products) - Cập nhật giao diện với thông tin sản phẩm
    updateProductDisplay(products) {
        if (products.length === 0) return;
        const productListEl = document.querySelector('.product-list');
        if (productListEl) {
            productListEl.innerHTML = products.map((product) => {
                const image = product.image || (product.selectedColor && product.selectedColor.image) || '../images/product/10.png';
                const specs = [
                    product.author ? `Author: ${product.author}` : null,
                    product.format ? `Format: ${product.format}` : null,
                    product.selectedColor?.name ? `Edition: ${product.selectedColor.name}` : null,
                    `Quantity: ${product.quantity}`
                ].filter(Boolean).join(' | ');
                const itemTotal = Number(product.price) * Number(product.quantity);

                return `
          <div class="product-item">
            <img src="${image}" alt="${product.name}" class="product-image" />
            <div class="product-info">
              <p class="product-name">${product.name}</p>
              <p class="product-specs">${specs}</p>
            </div>
            <div class="product-price">${itemTotal.toLocaleString('vi-VN')} VND</div>
          </div>
        `;
            }).join('');
        }

        this.updateOrderTotal(products);
    }

    //updateOrderTotal(products) - Cập nhật tổng tiền
    updateOrderTotal(products) {
        const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const tax = Math.round(subtotal * 0.05); // 5% thuế
        const total = subtotal + tax;
        
        console.log('🔄 Cập nhật tổng tiền...');
        console.log(`   Subtotal: ${subtotal.toLocaleString('vi-VN')} VND`);
        console.log(`   Tax: ${tax.toLocaleString('vi-VN')} VND`);
        console.log(`   Total: ${total.toLocaleString('vi-VN')} VND`);
        
        const subtotalEl = document.getElementById('order-subtotal');
        const taxesEl = document.getElementById('order-taxes');
        const totalEl = document.getElementById('order-total');

        if (subtotalEl) {
            subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + ' VND';
            console.log(`✅ Cập nhật Subtotal: ${subtotal.toLocaleString('vi-VN')} VND`);
        }

        if (taxesEl) {
            taxesEl.textContent = tax.toLocaleString('vi-VN') + ' VND';
            console.log(`✅ Cập nhật Taxes: ${tax.toLocaleString('vi-VN')} VND`);
        }

        if (totalEl) {
            totalEl.textContent = total.toLocaleString('vi-VN') + ' VND';
            console.log(`✅ Cập nhật Total: ${total.toLocaleString('vi-VN')} VND`);
        }
        
        console.log('✅ Đã cập nhật tất cả giá trị lên giao diện web');
    }
}

//Nhóm 9: Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', function() {
    window.orderDetailPage = new OrderDetailPage();
    console.log('✅ Order Detail Page đã khởi tạo');
});
