const PAGE_SIZE = 12;
const API_BASE = '/api';

let categoryTree = [];
let currentCategory = null;
let currentCategoryIds = [];
let currentBreadcrumb = [];
let currentPage = 1;
let currentTotalPages = 1;
let currentTotalBooks = 0;
let currentBooks = [];
let usingBackend = true;
let filterDebounceId = null;

const FALLBACK_TONES = ['amber', 'teal', 'rose', 'forest', 'slate', 'ocean', 'olive', 'charcoal', 'navy', 'sunset', 'mint', 'plum', 'coral', 'sky', 'orange', 'lime', 'indigo', 'violet', 'steel', 'bronze', 'stone', 'sepia', 'ruby', 'azure', 'peach'];

const FALLBACK_CATEGORY_LOOKUP = typeof categoryData === 'object' && categoryData ? categoryData : {};

document.addEventListener('DOMContentLoaded', () => {
  initCategoryPage();
});

document.addEventListener('allPartialsLoaded', () => {
  if (document.body?.dataset?.page === 'category') {
    syncDynamicTranslations();
  }
});

async function initCategoryPage() {
  const slug = getCategoryFromUrl();
  bindFilterEvents();
  bindPaginationEvents();

  await loadCategoryTree();
  await loadCategoryContext(slug);
  renderCategoryNavigation();
  renderCategoryHeading();
  await loadBooks(1);
  updateWishlistCounter();
  syncDynamicTranslations();
}

function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('cat') || 'fiction';
}

async function loadCategoryTree() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    categoryTree = await response.json();
    usingBackend = true;
  } catch (error) {
    console.warn('Backend is unavailable, hiding category tree fallback:', error);
    usingBackend = false;
    categoryTree = [];
  }
}

async function loadCategoryContext(slug) {
  if (usingBackend) {
    try {
      const response = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      currentCategory = payload.category;
      currentBreadcrumb = Array.isArray(payload.breadcrumb) ? payload.breadcrumb : [];
      currentCategoryIds = Array.isArray(payload.categoryIds)
        ? payload.categoryIds.map((id) => String(id))
        : [];
      return;
    } catch (error) {
      console.warn('Falling back to static category context:', error);
      usingBackend = false;
    }
  }

  const fallback = FALLBACK_CATEGORY_LOOKUP[slug] || FALLBACK_CATEGORY_LOOKUP.fiction || { name: 'Fiction', i18nKey: 'book-cat-fiction', products: [] };
  currentCategory = {
    name: fallback.name,
    slug,
    i18nKey: fallback.i18nKey,
    breadcrumb: [{ name: fallback.name, slug }],
  };
  currentBreadcrumb = currentCategory.breadcrumb;
  currentCategoryIds = [];
}

function renderCategoryNavigation() {
  const navList = document.getElementById('category-nav-list');
  if (!navList) return;

  const currentSlug = getCategoryFromUrl();
  const categories = flattenCategoryTree(categoryTree);

  navList.innerHTML = categories
    .map((category) => {
      const activeClass = category.slug === currentSlug ? 'active' : '';
      const indentStyle = `style="padding-left: ${14 + category.depth * 14}px"`;
      return `
        <li>
          <a href="category.html?cat=${encodeURIComponent(category.slug)}" class="${activeClass} category-link" data-i18n="${category.i18nKey || ''}" ${indentStyle}>
            ${escapeHtml(category.name)}
          </a>
        </li>
      `;
    })
    .join('');
}

function flattenCategoryTree(nodes, depth = 0) {
  const output = [];
  (nodes || []).forEach((node) => {
    const slug = node.slug || node._id || node.id || '';
    output.push({
      slug,
      name: node.name || slug,
      i18nKey: node.i18nKey,
      depth,
    });

    if (Array.isArray(node.children) && node.children.length > 0) {
      output.push(...flattenCategoryTree(node.children, depth + 1));
    }
  });
  return output;
}

function renderCategoryHeading() {
  const titleEl = document.getElementById('category-title');
  const countEl = document.getElementById('category-count');
  const breadcrumbEl = document.getElementById('category-breadcrumb');

  if (titleEl && currentCategory) {
    titleEl.textContent = currentCategory.name || 'Category';
    if (currentCategory.i18nKey) {
      titleEl.setAttribute('data-i18n', currentCategory.i18nKey);
    }
  }

  if (countEl) {
    const totalText = currentTotalBooks || currentBooks.length;
    countEl.textContent = `${totalText} book${totalText === 1 ? '' : 's'}`;
  }

  if (breadcrumbEl) {
    const parts = [];
    if (Array.isArray(currentBreadcrumb) && currentBreadcrumb.length > 0) {
      currentBreadcrumb.forEach((item) => {
        parts.push(`<a href="category.html?cat=${encodeURIComponent(item.slug)}">${escapeHtml(item.name)}</a>`);
      });
    } else if (currentCategory?.name) {
      parts.push(`<span>${escapeHtml(currentCategory.name)}</span>`);
    }
    breadcrumbEl.innerHTML = parts.length > 0 ? parts.join('<span class="breadcrumb-separator">/</span>') : '';
  }
}

function bindFilterEvents() {
  const authorInput = document.getElementById('filter-author');
  const coverTypeSelect = document.getElementById('filter-cover-type');
  const priceRangeSelect = document.getElementById('filter-price-range');
  const minRatingSelect = document.getElementById('filter-min-rating');
  const applyButton = document.getElementById('apply-category-filters');
  const resetButton = document.getElementById('reset-category-filters');

  if (authorInput) {
    authorInput.addEventListener('input', queueReloadBooks);
    authorInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        loadBooks(1);
      }
    });
  }

  [coverTypeSelect, priceRangeSelect, minRatingSelect].forEach((control) => {
    if (control) {
      control.addEventListener('change', () => loadBooks(1));
    }
  });

  if (applyButton) {
    applyButton.addEventListener('click', () => loadBooks(1));
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (authorInput) authorInput.value = '';
      if (coverTypeSelect) coverTypeSelect.value = '';
      if (priceRangeSelect) priceRangeSelect.value = '';
      if (minRatingSelect) minRatingSelect.value = '';
      loadBooks(1);
    });
  }
}

function queueReloadBooks() {
  clearTimeout(filterDebounceId);
  filterDebounceId = setTimeout(() => loadBooks(1), 300);
}

function bindPaginationEvents() {
  const paginationBar = document.getElementById('pagination-bar');
  if (!paginationBar) return;

  paginationBar.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-page-number], button[data-page-action]');
    if (!target) return;

    const pageNumber = Number(target.getAttribute('data-page-number'));
    const pageAction = target.getAttribute('data-page-action');

    if (pageAction === 'prev' && currentPage > 1) {
      loadBooks(currentPage - 1);
      return;
    }

    if (pageAction === 'next' && currentPage < currentTotalPages) {
      loadBooks(currentPage + 1);
      return;
    }

    if (!Number.isNaN(pageNumber)) {
      loadBooks(pageNumber);
    }
  });
}

function buildBookQuery(page = 1) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(PAGE_SIZE));
  params.set('sort', 'createdAt');
  params.set('order', 'desc');

  if (currentCategoryIds.length > 0) {
    params.set('category', currentCategoryIds.join(','));
  }

  const author = document.getElementById('filter-author')?.value.trim();
  const coverType = document.getElementById('filter-cover-type')?.value || '';
  const priceRange = document.getElementById('filter-price-range')?.value || '';
  const minRating = document.getElementById('filter-min-rating')?.value || '';

  if (author) params.set('author', author);
  if (coverType) params.set('coverType', coverType);
  if (minRating) params.set('minRating', minRating);

  if (priceRange === 'under-120') {
    params.set('maxPrice', '120000');
  } else if (priceRange === '120-220') {
    params.set('minPrice', '120000');
    params.set('maxPrice', '220000');
  } else if (priceRange === 'over-220') {
    params.set('minPrice', '220000');
  }

  return params;
}

function getFallbackBooksForCurrentCategory() {
  const slug = currentCategory?.slug || getCategoryFromUrl();
  const fallbackCategory = FALLBACK_CATEGORY_LOOKUP[slug] || FALLBACK_CATEGORY_LOOKUP.fiction;
  const fallbackProducts = Array.isArray(fallbackCategory?.products) ? fallbackCategory.products : [];

  return fallbackProducts.map((product, index) => {
    const price = Number(product.price || 0);
    const rating = Number(product.rating || 4);
    return {
      id: `${slug}-${product.id || index + 1}`,
      title: product.title || 'Untitled',
      author: product.author || 'Unknown author',
      price,
      listPrice: price,
      coverType: product.format || '',
      rating,
      reviewCount: Number(product.reviewCount || 0),
      cover: product.cover || '',
      language: product.language || '',
      tone: product.tone || toneForString(product.title || slug),
      badge: '',
    };
  });
}

function applyFallbackFilters(books) {
  const author = (document.getElementById('filter-author')?.value || '').trim().toLowerCase();
  const coverType = (document.getElementById('filter-cover-type')?.value || '').trim().toLowerCase();
  const priceRange = (document.getElementById('filter-price-range')?.value || '').trim();
  const minRating = Number(document.getElementById('filter-min-rating')?.value || 0);

  return (books || []).filter((book) => {
    if (author && !String(book.author || '').toLowerCase().includes(author)) return false;
    if (coverType && String(book.coverType || '').toLowerCase() !== coverType) return false;

    const price = Number(book.price || 0);
    if (priceRange === 'under-120' && price > 120000) return false;
    if (priceRange === '120-220' && (price < 120000 || price > 220000)) return false;
    if (priceRange === 'over-220' && price < 220000) return false;

    if (minRating > 0 && Number(book.rating || 0) < minRating) return false;
    return true;
  });
}

async function loadBooks(page = 1) {
  currentPage = page;
  const grid = document.getElementById('products-grid');
  const titleEl = document.getElementById('category-title');
  const countEl = document.getElementById('category-count');
  if (!grid) return;

  grid.innerHTML = `<div class="loading-message">Loading books...</div>`;
  if (countEl) countEl.textContent = '...';

  if (usingBackend) {
    try {
      const response = await fetch(`${API_BASE}/books?${buildBookQuery(page).toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const books = Array.isArray(payload?.books) ? payload.books : [];
      currentBooks = books.map((book) => normalizeBackendBook(book));
      currentTotalBooks = Number(payload?.pagination?.total || currentBooks.length);
      currentTotalPages = payload?.pagination?.totalPages || 1;
      renderProducts(currentBooks);
      renderPagination(payload?.pagination || { page, totalPages: currentTotalPages });
      renderCategoryHeading();
      syncDynamicTranslations();
      return;
    } catch (error) {
      console.warn('Backend is unavailable, hiding category products:', error);
      usingBackend = false;
    }
  }

  currentBooks = [];
  const fallbackBooks = applyFallbackFilters(getFallbackBooksForCurrentCategory());
  currentTotalBooks = fallbackBooks.length;
  currentTotalPages = Math.max(1, Math.ceil(currentTotalBooks / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), currentTotalPages);
  currentPage = safePage;
  const start = (safePage - 1) * PAGE_SIZE;
  currentBooks = fallbackBooks.slice(start, start + PAGE_SIZE);
  renderProducts(currentBooks);
  renderPagination({ page: safePage, totalPages: currentTotalPages });
  renderCategoryHeading();
  syncDynamicTranslations();
}

function normalizeBackendBook(book) {
  const title = book.title || 'Untitled';
  const listPrice = Number(book.listPrice || 0);
  const finalPrice = Number(book.finalPrice || listPrice);
  const coverType = book.coverType || '';
  const rating = Number(book.avgRating || 0);

  return {
    id: String(book._id || book.id || title),
    title,
    author: book.author || 'Unknown author',
    price: finalPrice,
    listPrice,
    coverType,
    rating,
    reviewCount: Number(book.reviewCount || 0),
    cover: resolveBookCover(book),
    language: book.language || '',
    tone: toneForString(title),
    badge: book.discountPercent > 0 ? `-${book.discountPercent}%` : '',
  };
}

function renderProducts(books) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!books || books.length === 0) {
    grid.innerHTML = `
      <div class="no-products" data-i18n="category-empty">
        No books match your current filters.
      </div>
    `;
    return;
  }

  grid.innerHTML = books.map((book) => {
    const initials = getBookInitials(book.title);
    const coverMarkup = book.cover
      ? `<img class="book-cover-image" src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy" />`
      : `<span class="book-cover-placeholder" data-i18n="category-cover-placeholder">Book cover placeholder</span>`;

    const wishlistClass = isBookInWishlist(book.id) ? 'wishlist-btn added' : 'wishlist-btn';
    const priceText = formatPrice(book.price);
    const listPriceText = book.listPrice && book.listPrice > book.price ? `<span class="book-list-price">${formatPrice(book.listPrice)}</span>` : '';

    return `
      <article class="book-card" data-tone="${escapeHtml(book.tone)}" data-book-id="${escapeHtml(book.id)}">
        <div class="book-cover tone-${escapeHtml(book.tone)}">
          ${coverMarkup}
          <span class="book-cover-initials">${escapeHtml(initials)}</span>
          <button class="${wishlistClass}" data-book-id="${escapeHtml(book.id)}" title="Add to wishlist" type="button"><span class="solar--heart-bold"></span></button>
        </div>
        <div class="book-meta">
          <p class="book-price">${listPriceText}${priceText}</p>
          <h3 class="book-title">${escapeHtml(book.title)}</h3>
          <p class="book-author">${escapeHtml(book.author)}</p>
          <p class="book-badge-row">
            <span class="book-badge">${escapeHtml(book.coverType || 'Book')}</span>
            ${book.language ? `<span class="book-badge">${escapeHtml(String(book.language).toUpperCase())}</span>` : ''}
            ${book.badge ? `<span class="book-badge book-badge-sale">${escapeHtml(book.badge)}</span>` : ''}
          </p>
          <p class="book-rating-row">
            <span class="stars">${renderStars(book.rating)}</span>
            <span class="review-count">(${Number(book.reviewCount || 0)})</span>
          </p>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.wishlist-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const bookId = button.getAttribute('data-book-id') || '';
      const book = books.find((item) => String(item.id) === String(bookId));
      if (book) {
        toggleWishlist(book, button);
      }
    });
  });
}

function renderPagination(pagination) {
  const paginationBar = document.getElementById('pagination-bar');
  if (!paginationBar) return;

  const totalPages = pagination?.totalPages || currentTotalPages || 1;
  const page = pagination?.page || currentPage || 1;

  if (totalPages <= 1) {
    paginationBar.innerHTML = '';
    return;
  }

  const buttons = [];
  buttons.push(`<button type="button" class="pagination-button pagination-arrow" data-page-action="prev" ${page === 1 ? 'disabled' : ''}>‹</button>`);

  for (let index = 1; index <= totalPages; index += 1) {
    const activeClass = index === page ? 'active' : '';
    buttons.push(`<button type="button" class="pagination-button pagination-line ${activeClass}" data-page-number="${index}"><span class="pagination-line-mark" aria-hidden="true"></span></button>`);
  }

  buttons.push(`<button type="button" class="pagination-button pagination-arrow" data-page-action="next" ${page === totalPages ? 'disabled' : ''}>›</button>`);
  paginationBar.innerHTML = buttons.join('');
}

function resolveBookCover(book) {
  const cover = book.coverImageUrl || book.cover || (Array.isArray(book.images) && book.images[0]) || '';
  if (!cover) return '';
  if (/^(https?:)?\/\//.test(cover) || cover.startsWith('data:') || cover.startsWith('/')) return cover;
  return cover.startsWith('uploads/') ? `/${cover}` : cover;
}

function getBookInitials(title) {
  const words = String(title || '').trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0).toUpperCase()).join('');
}

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('vi-VN')} đ`;
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating || 0))));
  return '★★★★★'.slice(0, value) + '☆☆☆☆☆'.slice(0, 5 - value);
}

function toneForString(value) {
  const hash = String(value || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_TONES[hash % FALLBACK_TONES.length];
}

function isBookInWishlist(bookId) {
  const stored = localStorage.getItem('wishlist');
  if (!stored || !stored.trim()) return false;

  try {
    const wishlist = JSON.parse(stored);
    return Array.isArray(wishlist) && wishlist.some((item) => String(item.id) === String(bookId));
  } catch {
    return false;
  }
}

function toggleWishlist(book, button) {
  const stored = localStorage.getItem('wishlist');
  let wishlist = [];

  try {
    wishlist = stored && stored.trim() ? JSON.parse(stored) : [];
  } catch {
    wishlist = [];
  }

  const existingIndex = wishlist.findIndex((item) => String(item.id) === String(book.id));
  if (existingIndex >= 0) {
    wishlist.splice(existingIndex, 1);
    button.classList.remove('added');
  } else {
    wishlist.push({
      id: String(book.id),
      name: book.title,
      author: book.author,
      image: book.cover || '',
      price: book.price,
      format: book.coverType || '',
      language: book.language || '',
      quantity: 1,
    });
    button.classList.add('added');
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCounter();
}

function syncDynamicTranslations() {
  if (typeof applyTranslations === 'function') {
    applyTranslations();
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
