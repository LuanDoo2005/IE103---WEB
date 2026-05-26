const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const dobInput = document.getElementById('dob');

function formatDob(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const parts = [];

    if (digits.length > 0) parts.push(digits.slice(0, 2));
    if (digits.length > 2) parts.push(digits.slice(2, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 8));

    return parts.join('/');
}

if (dobInput) {
    dobInput.addEventListener('input', () => {
        const formatted = formatDob(dobInput.value);
        if (dobInput.value !== formatted) {
            dobInput.value = formatted;
        }
    });
}

function showRegisterError(message) {
    if (!registerMessage) return;
    registerMessage.textContent = message;
    registerMessage.classList.remove('hidden');
    registerMessage.style.color = '#dc3545';
}

function showRegisterSuccess(message) {
    if (!registerMessage) return;
    registerMessage.textContent = message;
    registerMessage.classList.remove('hidden');
    registerMessage.style.color = '#123B7A';
}

if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const phone = document.getElementById('phone').value.trim();
        const dob = document.getElementById('dob').value.trim();
        const gender = document.getElementById('gender').value;
        const cityProvince = document.getElementById('city-province').value.trim();
        const addressDetail = document.getElementById('address-detail').value.trim();
        const preferences = Array.from(document.querySelectorAll('input[name="reading-preference"]:checked')).map(input => input.value);

        if (!fullName || !email || !password || !confirmPassword || !phone || !dob || !gender || !cityProvince) {
            showRegisterError('Vui lòng điền đầy đủ thông tin đăng ký.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            showRegisterError('Vui lòng nhập email hợp lệ.');
            return;
        }

        if (password.length < 6) {
            showRegisterError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            showRegisterError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (preferences.length === 0) {
            showRegisterError('Vui lòng chọn ít nhất một sở thích đọc sách.');
            return;
        }

        const registerData = {
            fullName,
            email,
            password,
            phone,
            dob,
            gender,
            cityProvince,
            addressDetail,
            readingPreferences: preferences,
            avatarUrl: '../images/homepage/avatar.jpg',
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem('userRegisterData', JSON.stringify(registerData));
        localStorage.setItem('userEmailForRegister', email);
        localStorage.setItem('userPasswordForRegister', password);

        showRegisterSuccess('Đăng ký thành công. Vui lòng xác nhận email...');

        // Disable all form inputs to prevent further interaction
        const allInputs = registerForm.querySelectorAll('input, select, button');
        allInputs.forEach(input => {
            input.disabled = true;
        });

        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

        setTimeout(() => {
            window.location.href = 'verify-email.html';
        }, 1200);
    });
}