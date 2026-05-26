let homeInitialized = false;
let currentFeaturedCategoryIds = [];
let usingHomeBackend = true;
const FALLBACK_HOME_CATEGORY_LOOKUP = typeof categoryData === 'object' && categoryData ? categoryData : {};

const DEFAULT_BOOK_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="860" viewBox="0 0 640 860">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f5efe8" />
        <stop offset="100%" stop-color="#d8c7b7" />
      </linearGradient>
    </defs>
    <rect width="640" height="860" rx="36" fill="url(#bg)" />
    <rect x="78" y="96" width="484" height="668" rx="28" fill="#ffffff" fill-opacity="0.72" />
    <rect x="128" y="168" width="204" height="28" rx="14" fill="#8a6d58" fill-opacity="0.55" />
    <rect x="128" y="220" width="308" height="24" rx="12" fill="#8a6d58" fill-opacity="0.35" />
    <rect x="128" y="266" width="260" height="24" rx="12" fill="#8a6d58" fill-opacity="0.25" />
    <circle cx="320" cy="560" r="124" fill="#d7bfa9" fill-opacity="0.5" />
    <path d="M252 560c0-37 30-67 68-67s68 30 68 67-30 67-68 67-68-30-68-67Zm39 0c0 16 13 29 29 29s29-13 29-29-13-29-29-29-29 13-29 29Z" fill="#8a6d58" fill-opacity="0.58" />
    <text x="320" y="742" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#6f5a4a">Jundoku</text>
  </svg>
`)}`;

document.addEventListener('DOMContentLoaded', bootstrapHome);
document.addEventListener('allPartialsLoaded', bootstrapHome);

async function bootstrapHome() {
  if (homeInitialized || document.body?.dataset?.page !== 'home') return;

  const slider = document.getElementById('featured-books-slider');
  const filters = document.getElementById('home-category-filters');
  if (!slider || !filters) return;

  homeInitialized = true;
  initCountdownTimer();
  bindHeroActions();
  bindViewAllButton();

  await Promise.all([
    loadCategoryFilters(),
    loadFeaturedBooks(),
  ]);
}

function initCountdownTimer() {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  const endTime = Date.now() + 10000000;
  const updateTimer = () => {
    const gap = Math.max(0, endTime - Date.now());
    const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((gap % (1000 * 60)) / 1000);

    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(minutes).padStart(2, '0');
    secondsEl.innerText = String(seconds).padStart(2, '0');
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

function bindHeroActions() {
  const ctaButtons = document.querySelectorAll('.hero-cta .btn');
  const featuredSection = document.getElementById('featured-books-section');
  const flashSaleSection = document.getElementById('flash-sale-section');

  if (ctaButtons[0] && featuredSection) {
    ctaButtons[0].addEventListener('click', () => {
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (ctaButtons[1] && flashSaleSection) {
    ctaButtons[1].addEventListener('click', () => {
      flashSaleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function bindViewAllButton() {
  const viewAllButton = document.getElementById('view-all-books-btn');
  if (!viewAllButton) return;

  viewAllButton.addEventListener('click', () => {
    window.location.href = 'typologies/category.html';
  });
}

async function loadCategoryFilters() {
  const filtersContainer = document.getElementById('home-category-filters');
  if (!filtersContainer) return;

  try {
    const categoriesResponse = await fetch('/api/categories');
    if (!categoriesResponse.ok) throw new Error(`HTTP ${categoriesResponse.status}`);

    const categories = await categoriesResponse.json();
    const topLevelCategories = categories.map((category) => ({
      id: category._id || category.id,
      label: category.name,
      slug: category.slug,
      categoryIds: collectCategoryIds(category),
    }));

    renderCategoryFilters(filtersContainer, topLevelCategories);
    usingHomeBackend = true;
  } catch (error) {
    console.warn('Backend is unavailable, using static category filters:', error);
    usingHomeBackend = false;
    const fallbackCategories = Object.entries(FALLBACK_HOME_CATEGORY_LOOKUP).map(([slug, category]) => ({
      id: slug,
      label: category?.name || slug,
      slug,
      categoryIds: [slug],
    }));
    renderCategoryFilters(filtersContainer, fallbackCategories);
  }
}

function getFallbackHomeBooks(categoryIds = []) {
  const entries = Object.entries(FALLBACK_HOME_CATEGORY_LOOKUP);
  const selected = new Set((categoryIds || []).map((id) => String(id)));

  const books = [];
  entries.forEach(([slug, category]) => {
    if (selected.size > 0 && !selected.has(slug)) return;
    (Array.isArray(category?.products) ? category.products : []).forEach((product, index) => {
      books.push({
        _id: `${slug}-${product.id || index + 1}`,
        title: product.title || 'Untitled',
        author: product.author || 'Unknown author',
        listPrice: Number(product.price || 0),
        finalPrice: Number(product.price || 0),
        discountPercent: 0,
        reviewCount: Number(product.reviewCount || 0),
        avgRating: Number(product.rating || 4),
        categoryId: { slug },
        coverImageUrl: product.cover || '',
      });
    });
  });

  return books.slice(0, 10);
}

function collectCategoryIds(category) {
  const ids = [category._id || category.id].filter(Boolean);
  if (Array.isArray(category.children)) {
    for (const child of category.children) {
      ids.push(...collectCategoryIds(child));
    }
  }
  return ids;
}

function renderCategoryFilters(container, categories) {
  container.innerHTML = [
    `<button class="filter-btn active" type="button" data-category-ids="">Tất cả</button>`,
    ...categories
      .filter((category) => category.label !== 'Tất cả')
      .map((category) => {
        const categoryIds = Array.isArray(category.categoryIds) ? category.categoryIds : [category.id];
        return `<button class="filter-btn" type="button" data-category-ids="${categoryIds.join(',')}">${escapeHtml(category.label)}</button>`;
      }),
  ].join('');

  container.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      container.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const categoryIds = button.dataset.categoryIds ? button.dataset.categoryIds.split(',').filter(Boolean) : [];
      currentFeaturedCategoryIds = categoryIds;
      await loadFeaturedBooks(categoryIds);
    });
  });
}

async function loadFeaturedBooks(categoryIds = []) {
  const slider = document.getElementById('featured-books-slider');
  const status = document.getElementById('home-books-status');
  if (!slider) return;

  if (status) {
    status.textContent = categoryIds.length > 0 ? 'Đang tải sách theo danh mục...' : 'Đang tải sách nổi bật...';
  }

  try {
    if (!usingHomeBackend) {
      const fallbackBooks = getFallbackHomeBooks(categoryIds);
      renderFeaturedBooks(slider, fallbackBooks);
      if (status) status.textContent = '';
      bindWishlistButtons();
      return;
    }

    const params = new URLSearchParams({ limit: '10', sort: 'bestseller', order: 'desc' });
    if (categoryIds.length > 0) {
      params.set('category', categoryIds.join(','));
    }

    const response = await fetch(`/api/books?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const books = Array.isArray(payload) ? payload : payload.books || [];
    renderFeaturedBooks(slider, books);

    if (status) {
      status.textContent = '';
    }
  } catch (error) {
    console.warn('Backend is unavailable, using static featured books:', error);
    usingHomeBackend = false;
    const fallbackBooks = getFallbackHomeBooks(categoryIds);
    renderFeaturedBooks(slider, fallbackBooks);
    if (status) status.textContent = '';
  }

  bindWishlistButtons();
}

function renderFeaturedBooks(container, books) {
  container.innerHTML = books.map(renderBookCard).join('');
}

function renderBookCard(book) {
  const bookId = String(book._id || book.id || book.slug || book.title || 'book');
  const title = book.title || 'Untitled';
  const author = book.author || 'Unknown author';
  const listPrice = Number(book.listPrice || 0);
  const finalPrice = Number(book.finalPrice || listPrice);
  const discountPercent = Number(book.discountPercent || computeDiscountPercent(listPrice, finalPrice));
  const reviewCount = Number(book.reviewCount || 0);
  const rating = Number(book.avgRating || 0);
  const imageUrl = resolveBookImage(book);
  const categorySlug = book.categoryId?.slug || '';

  return `
    <article class="book-card" data-book-id="${escapeHtml(bookId)}" data-book-title="${escapeHtml(title)}" data-book-author="${escapeHtml(author)}" data-book-price="${finalPrice}" data-book-image="${escapeHtml(imageUrl)}">
      <div class="book-img-wrapper">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" class="book-img" loading="lazy">
        <div class="book-overlay">
          <button class="icon-btn wishlist-heart" type="button" title="Thích" aria-label="Thêm vào wishlist"><i class="fas fa-heart"></i></button>
          <a class="icon-btn" href="typologies/category.html${categorySlug ? `?cat=${encodeURIComponent(categorySlug)}` : ''}" title="Xem danh mục" aria-label="Xem danh mục"><i class="fas fa-eye"></i></a>
        </div>
        ${discountPercent > 0 ? `<span class="book-badge discount">-${discountPercent}%</span>` : ''}
      </div>
      <div class="book-details">
        <h3 class="book-title">${escapeHtml(title)}</h3>
        <p class="book-author">${escapeHtml(author)}</p>
        <div class="book-rating">
          <span class="stars">${renderStars(rating)}</span>
          <span class="review-count">(${reviewCount})</span>
        </div>
        <div class="book-price">
          ${listPrice > finalPrice ? `<span class="original-price">${formatCurrency(listPrice)}</span>` : '<span class="original-price" style="display:none;">-</span>'}
          <span class="current-price">${formatCurrency(finalPrice)}</span>
        </div>
      </div>
    </article>
  `;
}

function resolveBookImage(book) {
  const rawImage = book.coverImageUrl || book.images?.[0] || DEFAULT_BOOK_IMAGE;
  if (!rawImage) return DEFAULT_BOOK_IMAGE;

  if (/^(https?:)?\/\//.test(rawImage) || rawImage.startsWith('data:') || rawImage.startsWith('/')) {
    return rawImage;
  }

  if (rawImage.startsWith('uploads/')) {
    return `/${rawImage}`;
  }

  return rawImage;
}

function computeDiscountPercent(listPrice, finalPrice) {
  if (!listPrice || finalPrice >= listPrice) return 0;
  return Math.round(((listPrice - finalPrice) / listPrice) * 100);
}

function renderStars(rating) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
  return '★★★★★'.slice(0, filledStars) + '☆☆☆☆☆'.slice(0, 5 - filledStars);
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(Number(value) || 0))}đ`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function bindWishlistButtons() {
  const wishlistButtons = document.querySelectorAll('.wishlist-heart');
  wishlistButtons.forEach((button) => {
    const card = button.closest('.book-card');
    if (!card) return;

    const bookId = card.dataset.bookId || '';
    const title = card.dataset.bookTitle || '';
    const author = card.dataset.bookAuthor || '';
    const price = Number(card.dataset.bookPrice || 0);
    const image = card.dataset.bookImage || '';

    if (isBookInWishlistHome(bookId, title, author)) {
      button.classList.add('in-wishlist');
    }

    button.onclick = (event) => {
      event.preventDefault();
      toggleWishlist(button, { id: bookId, title, author, price, image });
    };
  });
}

function isBookInWishlistHome(bookId, title, author) {
  const wishlist = getStoredWishlist();
  return wishlist.some((item) => item.id === bookId || (item.name === title && item.author === author));
}

function toggleWishlist(button, book) {
  const wishlist = getStoredWishlist();
  const existingIndex = wishlist.findIndex((item) => item.id === book.id || (item.name === book.title && item.author === book.author));

  if (existingIndex >= 0) {
    wishlist.splice(existingIndex, 1);
    button.classList.remove('in-wishlist');
    showNotification(`"${book.title}" removed from wishlist!`, 'remove');
  } else {
    wishlist.push({
      id: book.id,
      name: book.title,
      author: book.author,
      image: book.image,
      price: book.price,
      format: 'paperback',
      language: 'vi',
      quantity: 1,
    });
    button.classList.add('in-wishlist');
    showNotification(`"${book.title}" added to wishlist!`, 'add');
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCounter();
}

function getStoredWishlist() {
  const stored = localStorage.getItem('wishlist');
  if (!stored || !stored.trim()) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'add' ? 'linear-gradient(135deg, #2f80ed 0%, #123b7a 100%)' : 'linear-gradient(135deg, #999 0%, #666 100%)'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
