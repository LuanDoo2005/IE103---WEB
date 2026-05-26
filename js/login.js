const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.style.color = '#dc3545';
    errorMessage.classList.remove('hidden');
}

function showSuccess(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.style.color = '#28a745';
    errorMessage.classList.remove('hidden');
}

function login() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showError('Vui lòng nhập email và mật khẩu.');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showError('Vui lòng nhập email hợp lệ.');
        return;
    }

    const registeredData = localStorage.getItem('userRegisterData');
    if (!registeredData) {
        showError('Không tìm thấy tài khoản. Vui lòng đăng ký.');
        return;
    }

    const userData = JSON.parse(registeredData);

    if (userData.email !== email) {
        showError('Email không đúng.');
        return;
    }

    if (userData.password !== password) {
        showError('Mật khẩu không đúng.');
        return;
    }

    const personalData = {
        email: userData.email,
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        dob: userData.dob || '',
        gender: userData.gender || '',
        cityProvince: userData.cityProvince || '',
        addressDetail: userData.addressDetail || '',
        avatarUrl: userData.avatarUrl || '../images/homepage/avatar.jpg',
        readingPreferences: userData.readingPreferences || []
    };

    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPersonalData', JSON.stringify(personalData));

    showSuccess('Đăng nhập thành công!');

    setTimeout(() => {
        window.location.href = 'personal-info.html';
    }, 1200);
}

document.addEventListener('DOMContentLoaded', function() {
    const prefilledEmail = localStorage.getItem('userEmailForLogin') || localStorage.getItem('userEmailForRegister');
    if (prefilledEmail && emailInput) {
        emailInput.value = prefilledEmail;
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});
