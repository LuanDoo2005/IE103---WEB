// API bridge: route relative /api calls to backend when frontend runs on another origin.
(function () {
    const configured = String(window.JUNDOKU_API_ORIGIN || localStorage.getItem('JUNDOKU_API_ORIGIN') || 'http://localhost:5000').trim();
    const apiOrigin = configured.replace(/\/$/, '');

    window.JUNDOKU_API_ORIGIN = apiOrigin;
    window.buildApiUrl = function (path) {
        const value = String(path || '');
        return value.startsWith('/api/') ? `${apiOrigin}${value}` : value;
    };

    if (typeof window.fetch === 'function') {
        const nativeFetch = window.fetch.bind(window);
        window.fetch = function (input, init) {
            if (typeof input === 'string') {
                return nativeFetch(window.buildApiUrl(input), init);
            }

            if (input instanceof Request) {
                try {
                    const reqUrl = new URL(input.url, window.location.href);
                    if (reqUrl.pathname.startsWith('/api/')) {
                        const nextUrl = `${apiOrigin}${reqUrl.pathname}${reqUrl.search}`;
                        return nativeFetch(new Request(nextUrl, input), init);
                    }
                } catch (_error) {
                    // Keep original behavior when request URL cannot be parsed.
                }
            }

            return nativeFetch(input, init);
        };
    }
})();

//Nhóm 9: Phần quay lại đầu trang
(function(){
    const btn = document.getElementById('btn-top');
    if (!btn) return;

    const SHOW_AFTER = 300; // px

    function update() {
        if (window.scrollY > SHOW_AFTER) btn.classList.add('show');
        else btn.classList.remove('show');
    }

    // ẩn/hiện nút khi scroll
    window.addEventListener('scroll', update, { passive: true });
    update();

    // chuyển động mượt khi cuộn trang
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        btn.blur();
    });

    // dành cho bàn phím sử dụng enter/space để kích hoạt
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
})();

//Nhóm 9: Cập nhật đường dẫn logo về trang chủ và tất cả navigation links
(function() {
    function getBasePath() {
        return document.body?.dataset?.page === 'home' ? './' : '../';
    }

    function buildCategoryUrlFromForm(form) {
        const basePath = getBasePath();
        const category = form.getAttribute('data-category') || form.querySelector('input[name="cat"]')?.value || 'fiction';
        const params = new URLSearchParams();

        params.set('cat', category);

        ['format', 'language', 'price', 'age'].forEach((name) => {
            form.querySelectorAll(`input[name="${name}"]:checked`).forEach((input) => {
                params.append(name, input.value);
            });
        });

        const url = new URL(`${basePath}typologies/category.html`, window.location.href);
        url.search = params.toString();
        return url.toString();
    }

    window.buildCategoryUrlFromForm = buildCategoryUrlFromForm;

    function isLoggedIn() {
        return Boolean(localStorage.getItem('userEmail'));
    }

    function resetToDefaultIcon() {
        const headerAvatar = document.getElementById('header-user-avatar');
        const defaultIcon = document.getElementById('header-default-icon');

        if (!headerAvatar || !defaultIcon) return;

        headerAvatar.style.display = 'none';
        headerAvatar.src = '';
        defaultIcon.style.display = 'inline-block';
    }

    function updateAllLinks() {
        const basePath = getBasePath();
        const logoLink = document.getElementById('logo-home-link');
        const userAvatarLink = document.getElementById('user-avatar-link');
        const loggedIn = isLoggedIn();

        // Cập nhật logo link
        if (logoLink) {
            logoLink.href = basePath + 'index.html';
        }

        // Cập nhật tất cả navigation links
        document.querySelectorAll('.nav-link[data-target]').forEach(link => {
            if (link.id === 'user-avatar-link') return;

            const target = link.getAttribute('data-target');
            if (target) {
                link.href = basePath + target;
            }
        });

        // Cập nhật user avatar link dựa trên trạng thái đăng nhập
        if (userAvatarLink) {
            userAvatarLink.href = loggedIn ? basePath + 'user/personal-info.html' : basePath + 'user/login.html';
            userAvatarLink.title = loggedIn ? 'My Profile' : 'Login';
        }

        resetToDefaultIcon();
    }

    // Chạy khi partials load xong
    document.addEventListener('allPartialsLoaded', updateAllLinks);
    
    // Chạy ngay nếu đã load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAllLinks);
    } else {
        updateAllLinks();
    }

    // Lắng nghe sự kiện khi localStorage thay đổi (từ tab khác)
    window.addEventListener('storage', function(e) {
        if (e.key === 'userPersonalData' || e.key === 'userEmail') {
            updateAllLinks();
        }
    });

    // Lắng nghe custom event khi update avatar hoặc logout
    window.addEventListener('avatarUpdated', updateAllLinks);
    
    // Export hàm để các trang khác gọi được khi cần cập nhật
    window.updateHeaderAvatar = updateAllLinks;
})();

//Nhóm 9: Submit bộ lọc trong dropdown Products
(function() {
    function initProductsFilterMenus() {
        document.querySelectorAll('.dropdown-filter-form').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                window.location.href = window.buildCategoryUrlFromForm(form);
            });
        });
    }

    document.addEventListener('allPartialsLoaded', initProductsFilterMenus);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductsFilterMenus);
    } else {
        initProductsFilterMenus();
    }
})();

//Nhóm 9: Phần thanh menu hamburger cho mobile
(function(){
    function initHamburgerMenu() {
        const menuToggle = document.querySelector('.icomoon-free--leaf');
        const mainMenu = document.querySelector('nav.Main-Menu');
        
        if (!menuToggle || !mainMenu) return;

        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle class cho menu và icon
            mainMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // Ngăn scroll khi menu mở
            document.body.classList.toggle('menu-open');
        });

        // Đóng menu khi click vào link
        const menuLinks = mainMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Đóng menu khi click bên ngoài
        document.addEventListener('click', (e) => {
            if (!mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mainMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Chạy khi partials load xong
    document.addEventListener('allPartialsLoaded', initHamburgerMenu);
    
    // Chạy ngay nếu đã load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHamburgerMenu);
    } else {
        initHamburgerMenu();
    }
})();

//Nhóm 9: Cập nhật wishlist counter badge
function updateWishlistCounter() {
    const stored = localStorage.getItem("wishlist");
    const wishlist = (stored && stored.trim()) ? JSON.parse(stored) : [];
    const counterEl = document.querySelector(".wishlist-count");
    if (counterEl) {
        counterEl.textContent = wishlist.length;
    }
}

//Nhóm 9: Khởi tạo wishlist counter khi partials load hoặc DOM ready
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCounter();
});

document.addEventListener('allPartialsLoaded', () => {
    updateWishlistCounter();
});