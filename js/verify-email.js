// Biến toàn cục
let sentOTP = ''; // OTP đã gửi
let registeredEmail = ''; // Email từ register
let registeredPassword = ''; // Password từ register

// DOM elements
const otpInput = document.getElementById('otp');
const displayEmail = document.getElementById('display-email');
const otpDebugCode = document.getElementById('otp-debug-code');
const errorMessage = document.getElementById('error-message');

// === INIT ===
document.addEventListener('DOMContentLoaded', function() {
    // Lấy email từ localStorage (từ register)
    registeredEmail = localStorage.getItem('userEmailForRegister');
    registeredPassword = localStorage.getItem('userPasswordForRegister');

    if (!registeredEmail || !registeredPassword) {
        showError('Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.');
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 2000);
        return;
    }

    // Hiển thị email cần xác nhận
    if (displayEmail) {
        displayEmail.textContent = registeredEmail;
    }

    // Tạo OTP mới
    sentOTP = generateOTP();
    console.log(`[SIMULATION] OTP for ${registeredEmail}: ${sentOTP}`);

    // Hiển thị OTP debug
    if (otpDebugCode) {
        otpDebugCode.textContent = `Your OTP: ${sentOTP}`;
        otpDebugCode.classList.remove('hidden');
    }
});

// === FUNCTIONS ===
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.color = '#dc3545';
        errorMessage.classList.remove('hidden');
    }
}

function showSuccess(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.color = '#28a745';
        errorMessage.classList.remove('hidden');
    }
}

function verifyCode() {
    const enteredOTP = otpInput.value.trim();

    if (!enteredOTP) {
        showError('Vui lòng nhập mã xác nhận.');
        return;
    }

    if (enteredOTP.length !== 6) {
        showError('Mã xác nhận phải có 6 chữ số.');
        return;
    }

    if (enteredOTP !== sentOTP) {
        showError('Mã xác nhận không đúng. Vui lòng thử lại.');
        return;
    }

    // OTP đúng → chuẩn bị email để trang login tự điền sẵn
    localStorage.setItem('userEmailForLogin', registeredEmail);

    // Xóa các key tạm thời
    localStorage.removeItem('userEmailForRegister');
    localStorage.removeItem('userPasswordForRegister');

    showSuccess('Email xác nhận thành công! Chuyển đến trang đăng nhập...');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

function goBackToRegister() {
    window.location.href = 'register.html';
}
