//product.js
(function () {
  "use strict";

  // =========================================================
  // Nhóm 9: CONFIGURATION - Cấu hình chung cho toàn bộ trang
  // =========================================================

  const CONFIG = {
    PRODUCT_ID: "sofa-001",
    AUTO_PLAY_INTERVAL: 5000,
    IMAGE_FADE_DURATION: 200,
    NOTIFICATION_DURATION: 3000,
    GALLERY_DURATION: 5000,
  };

  // =========================================================
  // Nhóm 9: UTILITY FUNCTIONS - Các hàm tiện ích dùng chung
  // =========================================================

  const Utils = {
    showNotification(message, type = "info") {
      const existingNotif = document.querySelector(".custom-notification");
      if (existingNotif) existingNotif.remove();

      const notification = document.createElement("div");
      notification.className = `custom-notification ${type}`;
      notification.textContent = message;

      const colors = {
        success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        info: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      };

      notification.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        padding: 16px 24px; border-radius: 12px;
        font-size: 14px; font-weight: 600; z-index: 10000;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        background: ${colors[type] || colors.info};
        color: white;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notification.remove(), 300);
      }, CONFIG.NOTIFICATION_DURATION);
    },
  };

  // =========================================================
  // Nhóm 9: IMAGE GALLERY WITH COLOR SYNC - Quản lý gallery ảnh sản phẩm với đồng bộ màu sắc
  // =========================================================

  const ImageGallery = {
    currentIndex: 0,
    images: [],
    mainImage: null,
    thumbnails: null,

    init() {
      this.mainImage = document.getElementById("mainProductImage");
      this.thumbnails = document.querySelectorAll(".thumbnail-item");

      if (!this.mainImage || !this.thumbnails.length) return;

      this.images = Array.from(this.thumbnails).map((thumb) =>
        thumb.getAttribute("data-image")
      );

      this.bindEvents();
      console.log("✅ Image Gallery initialized");
    },

    bindEvents() {
      // Nhóm 9: Thumbnails click events
      this.thumbnails.forEach((thumb, index) => {
        thumb.addEventListener("click", () => this.goToImage(index));
      });

      // Nhóm 9: Navigation buttons (prev/next)
      const prevBtn = document.querySelector(".prev-img-btn");
      const nextBtn = document.querySelector(".next-img-btn");

      if (prevBtn) prevBtn.addEventListener("click", () => this.navigate(-1));
      if (nextBtn) nextBtn.addEventListener("click", () => this.navigate(1));

      // Nhóm 9: Zoom functionality
      const zoomBtn = document.querySelector(".zoom-btn");
      if (zoomBtn) zoomBtn.addEventListener("click", () => this.zoom());

      // Nhóm 9: Keyboard navigation (Arrow keys)
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") this.navigate(-1);
        if (e.key === "ArrowRight") this.navigate(1);
      });
    },

    navigate(direction) {
      this.currentIndex =
        (this.currentIndex + direction + this.images.length) %
        this.images.length;
      this.updateImage();
    },

    goToImage(index) {
      this.currentIndex = index;
      this.updateImage();
    },

    updateImage() {
      // Nhóm 9: Fade effect khi chuyển ảnh
      this.mainImage.style.opacity = "0";
      setTimeout(() => {
        this.mainImage.src = this.images[this.currentIndex];
        this.mainImage.style.opacity = "1";
      }, CONFIG.IMAGE_FADE_DURATION);

      // Nhóm 9: Update active state cho thumbnails
      this.thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle("active", index === this.currentIndex);
      });
      ColorManager.setActiveColorByThumbnailIndex(this.currentIndex);
    },

    zoom() {
      // Nhóm 9: Tạo overlay để zoom ảnh fullscreen
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.95); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; cursor: zoom-out; animation: fadeIn 0.3s ease;
      `;

      const img = document.createElement("img");
      img.src = this.mainImage.src;
      img.style.cssText = `
        max-width: 95%; max-height: 95%;
        border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      `;

      overlay.appendChild(img);
      document.body.appendChild(overlay);
      overlay.addEventListener("click", () =>
        document.body.removeChild(overlay)
      );
    },
  };

  // =========================================================
  // Nhóm 9: COLOR SELECTION WITH IMAGE SYNC - Quản lý chọn màu sắc và đồng bộ với ảnh
  // =========================================================

  const ColorManager = {
    init() {
      const colorSwatches = document.querySelectorAll(".color-swatch");
      const selectedColor = document.getElementById("selectedColor");

      colorSwatches.forEach((swatch) => {
        swatch.addEventListener("click", function () {
          const thumbnailIndex = parseInt(
            this.getAttribute("data-thumbnail-index")
          );
          const color = this.getAttribute("data-color");

          // Nhóm 9: Update active state cho color swatches
          colorSwatches.forEach((s) => {
            s.classList.remove("active");
            s.setAttribute("aria-checked", "false");
          });
          this.classList.add("active");
          this.setAttribute("aria-checked", "true");

          // Nhóm 9: Update text hiển thị màu đã chọn
          if (selectedColor) {
            selectedColor.textContent = color;
          }

          // Nhóm 9: Đồng bộ với Image Gallery
          if (!isNaN(thumbnailIndex) && thumbnailIndex >= 0) {
            ImageGallery.goToImage(thumbnailIndex);
          }

          // Nhóm 9: Animation effect khi click
          this.style.transform = "scale(1.15)";
          setTimeout(() => {
            this.style.transform = "";
          }, 200);
        });
      });

      console.log("✅ Color Manager initialized");
    },

    // Nhóm 9: HÀM MỚI - Cập nhật active color khi click vào hình (thumbnail)
    setActiveColorByThumbnailIndex(thumbnailIndex) {
      const colorSwatches = document.querySelectorAll(".color-swatch");
      const selectedColor = document.getElementById("selectedColor");

      colorSwatches.forEach((swatch) => {
        const dataIndex = parseInt(swatch.getAttribute("data-thumbnail-index"));

        if (dataIndex === thumbnailIndex) {
          // Xóa active state từ tất cả color swatches
          colorSwatches.forEach((s) => {
            s.classList.remove("active");
            s.setAttribute("aria-checked", "false");
          });

          // Kích hoạt swatch tương ứng
          swatch.classList.add("active");
          swatch.setAttribute("aria-checked", "true");

          // Cập nhật text màu
          const color = swatch.getAttribute("data-color");
          if (selectedColor) {
            selectedColor.textContent = color;
          }

          // Animation effect
          swatch.style.transform = "scale(1.15)";
          setTimeout(() => {
            swatch.style.transform = "";
          }, 200);
        }
      });
    },
  };

  // =========================================================
  // Nhóm 9: SIZE SELECTION - Quản lý chọn kích thước sản phẩm
  // =========================================================

  const SizeManager = {
    init() {
      const sizeButtons = document.querySelectorAll(".size-btn");
      const selectedSize = document.getElementById("selectedSize");

      sizeButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          // Nhóm 9: Remove active state từ tất cả size buttons
          sizeButtons.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-checked", "false");
          });
          this.classList.add("active");
          this.setAttribute("aria-checked", "true");

          // Nhóm 9: Update text hiển thị size đã chọn
          if (selectedSize) {
            selectedSize.textContent = this.getAttribute("data-size");
          }

          // Nhóm 9: Animation effect
          this.style.transform = "scale(1.05)";
          setTimeout(() => {
            this.style.transform = "";
          }, 200);
        });
      });

      console.log("✅ Size Manager initialized");
    },
  };

  // =========================================================
  // Nhóm 9: MATERIAL SELECTION - Quản lý chọn chất liệu sản phẩm
  // =========================================================

  const MaterialManager = {
    init() {
      const materialCards = document.querySelectorAll(".material-card");
      const selectedMaterial = document.getElementById("selectedMaterial");

      materialCards.forEach((card) => {
        card.addEventListener("click", function () {
          const input = this.querySelector("input");
          if (input) {
            input.checked = true;

            // Nhóm 9: Remove active state từ tất cả material cards
            materialCards.forEach((c) => c.classList.remove("active"));
            this.classList.add("active");

            // Nhóm 9: Update text hiển thị material đã chọn
            if (selectedMaterial) {
              selectedMaterial.textContent = input.value;
            }

            // Nhóm 9: Animation effect
            this.style.transform = "scale(1.03)";
            setTimeout(() => {
              this.style.transform = "";
            }, 200);
          }
        });
      });

      console.log("✅ Material Manager initialized");
    },
  };

  // =========================================================
  // Nhóm 9: QUANTITY CONTROL - Quản lý tăng/giảm số lượng sản phẩm
  // =========================================================

  const QuantityManager = {
    init() {
      const quantityInput = document.getElementById("quantityInput");
      const minusBtn = document.querySelector(".qty-btn.minus");
      const plusBtn = document.querySelector(".qty-btn.plus");

      if (!quantityInput) return;

      // Nhóm 9: Nút giảm số lượng
      if (minusBtn) {
        minusBtn.addEventListener("click", () => {
          const current = parseInt(quantityInput.value);
          const min = parseInt(quantityInput.getAttribute("min"));
          if (current > min) {
            quantityInput.value = current - 1;
            this.animate(quantityInput);
          }
        });
      }

      // Nhóm 9: Nút tăng số lượng
      if (plusBtn) {
        plusBtn.addEventListener("click", () => {
          const current = parseInt(quantityInput.value);
          const max = parseInt(quantityInput.getAttribute("max"));
          if (current < max) {
            quantityInput.value = current + 1;
            this.animate(quantityInput);
          } else {
            Utils.showNotification(`Maximum quantity is ${max}`, "warning");
          }
        });
      }

      console.log("✅ Quantity Manager initialized");
    },

    animate(input) {
      // Nhóm 9: Animation khi thay đổi số lượng
      input.style.transform = "scale(1.2)";
      input.style.color = "#3b6d54";
      setTimeout(() => {
        input.style.transform = "";
        input.style.color = "";
      }, 200);
    },
  };

  // =========================================================
  // Nhóm 9: ADD TO CART - Quản lý thêm sản phẩm vào giỏ hàng
  // =========================================================

  const CartManager = {
    init() {
      const addToCartBtn = document.querySelector(".btn-add-cart");
      const buyNowBtn = document.querySelector(".btn-buy-now");

      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => this.addToCart());
      }

      if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
          this.addToCart();
          setTimeout(() => {
            alert(
              "Redirecting to checkout...\nIn production, this would go to checkout page."
            );
          }, 1000);
        });
      }

      console.log("✅ Cart Manager initialized");
    },

    addToCart() {
      // Nhóm 9: Lấy thông tin sản phẩm từ form
      const productData = {
        id: CONFIG.PRODUCT_ID,
        name: "L-shaped Sofa",
        color: document.getElementById("selectedColor")?.textContent || "Grey",
        size: document.getElementById("selectedSize")?.textContent || "Medium",
        material:
          document.getElementById("selectedMaterial")?.textContent ||
          "Polyester",
        quantity:
          parseInt(document.getElementById("quantityInput")?.value) || 1,
        price: 4200000,
        image: document.getElementById("mainProductImage")?.src || "",
      };

      // Nhóm 9: Lưu vào localStorage
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(productData);
      localStorage.setItem("cart", JSON.stringify(cart));

      // Nhóm 9: Success animation cho button
      const btn = document.querySelector(".btn-add-cart");
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="btn-icon">✓</span><span>Added!</span>';
        btn.style.background =
          "linear-gradient(135deg, #10b981 0%, #059669 100%)";

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = "";
        }, 2500);
      }

      Utils.showNotification("Product added to cart successfully!", "success");
      console.log("Added to cart:", productData);
    },
  };

  // =========================================================
  // Nhóm 9: WISHLIST MANAGER - Quản lý thêm/xóa sản phẩm khỏi wishlist
  // =========================================================

  const WishlistManager = {
    init() {
      const wishlistBtn = document.getElementById("addToWishlistBtn");
      const wishlistPopup = document.getElementById("wishlistPopup");
      const closePopup = document.getElementById("closePopup");
      const keepBtn = document.querySelector(".keep-btn");
      const viewBtn = document.querySelector(".view-btn");

      if (!wishlistBtn || !wishlistPopup) return;

      this.loadState();

      // Nhóm 9: Click vào nút Add to Wishlist
      wishlistBtn.addEventListener("click", () => {
        const heartIcon = wishlistBtn.querySelector(".btn-icon");
        const isAdded = wishlistBtn.classList.contains("added");

        if (isAdded) {
          // Nhóm 9: Xóa khỏi wishlist
          heartIcon.textContent = "♡";
          wishlistBtn.classList.remove("added");
          this.removeFromWishlist();
        } else {
          // Nhóm 9: Thêm vào wishlist
          const productData = this.getProductData();
          let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

          if (!wishlist.some((item) => item.id === CONFIG.PRODUCT_ID)) {
            wishlist.push(productData);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            heartIcon.textContent = "❤️";
            wishlistBtn.classList.add("added");
            this.updateCount(wishlist.length);

            // Nhóm 9: Hiển thị popup xác nhận
            wishlistPopup.classList.add("show");
          }
        }
      });

      // Nhóm 9: Đóng popup
      if (closePopup) {
        closePopup.addEventListener("click", () => {
          wishlistPopup.classList.remove("show");
        });
      }

      if (keepBtn) {
        keepBtn.addEventListener("click", () => {
          wishlistPopup.classList.remove("show");
        });
      }

      // Nhóm 9: Xem trang wishlist
      if (viewBtn) {
        viewBtn.addEventListener("click", () => {
          window.location.href = "wishlist.html";
        });
      }

      // Nhóm 9: Click outside để đóng popup
      window.addEventListener("click", (e) => {
        if (e.target === wishlistPopup) {
          wishlistPopup.classList.remove("show");
        }
      });

      // Nhóm 9: ESC key để đóng popup
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && wishlistPopup.classList.contains("show")) {
          wishlistPopup.classList.remove("show");
        }
      });

      console.log("✅ Wishlist Manager initialized");
    },

    getProductData() {
      // Nhóm 9: Lấy thông tin sách hiện tại từ trang chi tiết sách
      // TODO: Cập nhật khi có trang chi tiết sách
      return {
        id: CONFIG.PRODUCT_ID,
        name: "Sample Book Title",
        author: "Author Name",
        image: document.getElementById("mainProductImage")?.src || "",
        price: 150000,
        format: "Paperback",
        language: "Vietnamese",
        quantity: parseInt(document.getElementById("quantityInput")?.value) || 1,
      };
    },

    removeFromWishlist() {
      // Nhóm 9: Xóa sản phẩm khỏi wishlist
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      wishlist = wishlist.filter((item) => item.id !== CONFIG.PRODUCT_ID);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      this.updateCount(wishlist.length);
      Utils.showNotification("Removed from wishlist", "info");
    },

    updateCount(count) {
      // Nhóm 9: Cập nhật số lượng wishlist ở header
      const wishlistCount = document.querySelector(".wishlist-count");
      if (wishlistCount) {
        wishlistCount.textContent = count;
      }
    },

    loadState() {
      // Nhóm 9: Load trạng thái wishlist từ localStorage
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      this.updateCount(wishlist.length);

      const wishlistBtn = document.getElementById("addToWishlistBtn");

      if (wishlist.some((item) => item.id === CONFIG.PRODUCT_ID)) {
        const heartIcon = wishlistBtn?.querySelector(".btn-icon");
        if (heartIcon) {
          heartIcon.textContent = "❤️";
          wishlistBtn.classList.add("added");
        }
      }
    },
  };

  // =========================================================
  // Nhóm 9: SHARE BUTTONS - Quản lý chia sẻ sản phẩm lên mạng xã hội
  // =========================================================

  const ShareManager = {
    init() {
      const shareButtons = document.querySelectorAll(".share-btn");

      shareButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          const productUrl = window.location.href;
          const productTitle = "L-shaped Sofa - Jundoku Furniture";
          const btnText = this.title.toLowerCase();

          // Nhóm 9: Share lên Facebook
          if (btnText.includes("facebook")) {
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                productUrl
              )}`,
              "_blank"
            );
          }
          // Nhóm 9: Share lên Twitter
          else if (btnText.includes("twitter")) {
            window.open(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                productUrl
              )}&text=${encodeURIComponent(productTitle)}`,
              "_blank"
            );
          }
          // Nhóm 9: Share lên Pinterest
          else if (btnText.includes("pinterest")) {
            window.open(
              `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                productUrl
              )}&description=${encodeURIComponent(productTitle)}`,
              "_blank"
            );
          }
          // Nhóm 9: Copy link
          else if (btnText.includes("link")) {
            navigator.clipboard.writeText(productUrl).then(() => {
              Utils.showNotification("Link copied to clipboard!", "success");
            });
          }

          // Nhóm 9: Animation khi click
          this.style.transform = "scale(1.2)";
          setTimeout(() => {
            this.style.transform = "";
          }, 200);
        });
      });

      console.log("✅ Share Manager initialized");
    },
  };

  // =========================================================
  // Nhóm 9: COMPARE BUTTON - Thêm sản phẩm vào danh sách so sánh
  // =========================================================

  const CompareManager = {
    init() {
      const compareBtn = document.querySelector(".compare-btn");

      if (compareBtn) {
        compareBtn.addEventListener("click", function () {
          const compareList =
            JSON.parse(localStorage.getItem("compareList")) || [];

          // Nhóm 9: Giới hạn tối đa 4 sản phẩm
          if (compareList.length >= 4) {
            Utils.showNotification(
              "Maximum 4 items can be compared. Please remove one first.",
              "warning"
            );
            return;
          }

          compareList.push({
            name: "L-shaped Sofa",
            image: document.getElementById("mainProductImage")?.src || "",
            price: 4200000,
          });

          localStorage.setItem("compareList", JSON.stringify(compareList));
          Utils.showNotification("Added to compare list!", "success");

          // Nhóm 9: Animation
          this.style.transform = "scale(1.05)";
          setTimeout(() => {
            this.style.transform = "";
          }, 200);
        });
      }

      console.log("✅ Compare Manager initialized");
    },
  };

  // =========================================================
  // Nhóm 9: STICKY CART BAR - Thanh sticky hiển thị khi scroll qua sản phẩm
  // =========================================================

  const StickyCartBar = {
    bar: null,

    init() {
      this.bar = this.createBar();
      window.addEventListener("scroll", () => this.handleScroll());
      console.log("✅ Sticky Cart Bar initialized");
    },

    createBar() {
      // Nhóm 9: Tạo sticky bar element
      const bar = document.createElement("div");
      bar.className = "sticky-cart-bar";
      bar.innerHTML = `
        <div class="sticky-cart-content">
          <img src="${
            document.getElementById("mainProductImage")?.src ||
            "Product/Ảnh/11.jpg"
          }" alt="Product" class="sticky-product-img">
          <div class="sticky-product-info">
            <strong>L-shaped Sofa</strong>
            <span class="sticky-price">4.200.000 đ</span>
          </div>
          <button class="sticky-add-cart-btn">
            <span>🛒</span> Add to Wishlist
          </button>
        </div>
      `;

      bar.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%;
        background: white; box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
        z-index: 1000; transform: translateY(100%);
        transition: transform 0.3s ease; padding: 15px 20px;
      `;

      this.addStyles();
      document.body.appendChild(bar);

      // Nhóm 9: Click vào nút sticky bar
      bar
        .querySelector(".sticky-add-cart-btn")
        .addEventListener("click", () => {
          document.querySelector(".btn-add-cart")?.click();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

      return bar;
    },

    handleScroll() {
      // Nhóm 9: Hiển thị/ẩn sticky bar dựa vào scroll position
      const productSection = document.querySelector(".product-display-modern");
      if (productSection) {
        const rect = productSection.getBoundingClientRect();
        if (rect.bottom < 0) {
          this.bar.classList.add("visible");
        } else {
          this.bar.classList.remove("visible");
        }
      }
    },

    addStyles() {
      // Nhóm 9: Inject CSS cho sticky bar
      const style = document.createElement("style");
      style.textContent = `
        .sticky-cart-bar.visible { transform: translateY(0) !important; }
        .sticky-cart-content {
          max-width: 1400px; margin: 0 auto; display: flex;
          align-items: center; gap: 20px;
        }
        .sticky-product-img {
          width: 60px; height: 60px; object-fit: cover; border-radius: 8px;
        }
        .sticky-product-info {
          flex: 1; display: flex; flex-direction: column; gap: 5px;
        }
        .sticky-product-info strong { font-size: 16px; color: #1d3227; }
        .sticky-price { font-size: 18px; font-weight: 700; color: #3b6d54; }
        .sticky-add-cart-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #3b6d54 0%, #2a5240 100%);
          color: white; border: none; border-radius: 30px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: all 0.3s ease; display: flex;
          align-items: center; gap: 8px;
        }
        .sticky-add-cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 109, 84, 0.3);
        }
        @media (max-width: 768px) {
          .sticky-product-info strong { font-size: 14px; }
          .sticky-price { font-size: 16px; }
          .sticky-add-cart-btn { padding: 12px 24px; font-size: 14px; }
        }
      `;
      document.head.appendChild(style);
    },
  };

  // =========================================================
  // Nhóm 9: TABS MANAGER - Quản lý các tab (Description, Specifications, etc.)
  // =========================================================

  const TabsManager = {
    init() {
      const tabBtns = document.querySelectorAll(".tab-btn");
      const tabContents = document.querySelectorAll(".tab-content");

      if (!tabBtns.length) return;

      tabBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const targetTab = this.getAttribute("data-tab");

          // Nhóm 9: Remove active từ tất cả tabs
          tabBtns.forEach((b) => b.classList.remove("active"));
          this.classList.add("active");

          // Nhóm 9: Show tab content tương ứng
          tabContents.forEach((content) => {
            content.classList.remove("active");
            if (content.id === targetTab) {
              content.classList.add("active");
            }
          });
        });
      });

      console.log("✅ Tabs Manager initialized");
    },
  };

  // =========================================================
  // Nhóm 9: GALLERY SLIDER - Slider cho lifestyle gallery images
  // =========================================================

  const GallerySlider = {
    index: 0,
    autoplayInterval: null,

    init() {
      const slides = document.querySelectorAll(".gallery-slide");
      const thumbnails = document.querySelectorAll(
        ".gallery-thumbnails .thumbnail-item"
      );
      const progressBar = document.querySelector(".progress-bar");

      if (slides.length === 0) return;

      this.slides = slides;
      this.thumbnails = thumbnails;
      this.progressBar = progressBar;

      this.updateSlide();
      this.startAutoplay();

      // Nhóm 9: Pause autoplay khi hover
      const sliderContainer = document.querySelector(".gallery-slider-modern");
      if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", () =>
          this.stopAutoplay()
        );
        sliderContainer.addEventListener("mouseleave", () =>
          this.resumeAutoplay()
        );
      }

      // Nhóm 9: Keyboard navigation
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") this.changeSlide(-1);
        if (e.key === "ArrowRight") this.changeSlide(1);
      });

      // Nhóm 9: Expose global functions cho HTML onclick
      window.galleryChangeSlide = (direction) => this.changeSlide(direction);
      window.galleryGoToSlide = (index) => this.goToSlide(index);

      console.log("✅ Gallery Slider initialized");
    },

    startAutoplay() {
      // Nhóm 9: Bắt đầu autoplay với progress bar
      let progress = 0;
      const duration = CONFIG.GALLERY_DURATION;
      const interval = 50;
      const increment = (interval / duration) * 100;

      this.autoplayInterval = setInterval(() => {
        progress += increment;
        if (this.progressBar) {
          this.progressBar.style.width = progress + "%";
        }

        if (progress >= 100) {
          progress = 0;
          this.changeSlide(1);
        }
      }, interval);
    },

    stopAutoplay() {
      // Nhóm 9: Dừng autoplay
      clearInterval(this.autoplayInterval);
      if (this.progressBar) {
        this.progressBar.style.width = "0%";
      }
    },

    resumeAutoplay() {
      // Nhóm 9: Resume autoplay
      this.stopAutoplay();
      this.startAutoplay();
    },

    changeSlide(direction) {
      // Nhóm 9: Chuyển slide theo direction
      this.stopAutoplay();
      this.index =
        (this.index + direction + this.slides.length) % this.slides.length;
      this.updateSlide();
      this.resumeAutoplay();
    },

    goToSlide(index) {
      // Nhóm 9: Đi đến slide cụ thể
      this.stopAutoplay();
      this.index = index;
      this.updateSlide();
      this.resumeAutoplay();
    },

    updateSlide() {
      // Nhóm 9: Update active slide và thumbnail
      this.slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === this.index);
      });

      this.thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle("active", i === this.index);
      });
    },
  };

  // =========================================================
  // Nhóm 9: REVIEWS MANAGER - Quản lý phần reviews (filter, sort, helpful)
  // =========================================================

  const ReviewsManager = {
    init() {
      this.initFilters();
      this.initSort();
      this.initHelpful();
      this.initReport();
      this.initLoadMore();
      this.initWriteReview();
      this.initImageLightbox();
      console.log("✅ Reviews Manager initialized");
    },

    initFilters() {
      // Nhóm 9: Filter reviews theo rating hoặc verified
      const filterBtns = document.querySelectorAll(".filter-btn");
      const reviewCards = document.querySelectorAll(".review-card");

      filterBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          filterBtns.forEach((b) => b.classList.remove("active"));
          this.classList.add("active");

          const filter = this.getAttribute("data-filter");

          reviewCards.forEach((card) => {
            const rating = card.getAttribute("data-rating");
            const hasVerified = card.querySelector(".verified-badge");

            if (filter === "all") {
              card.style.display = "block";
              card.style.animation = "fadeIn 0.5s ease";
            } else if (filter === "verified") {
              card.style.display = hasVerified ? "block" : "none";
            } else {
              card.style.display = rating === filter ? "block" : "none";
            }
          });
        });
      });
    },

    initSort() {
      // Nhóm 9: Sort reviews theo recent, helpful, rating
      const sortSelect = document.querySelector(".sort-select");
      const reviewsGrid = document.querySelector(".reviews-grid");

      if (!sortSelect || !reviewsGrid) return;

      sortSelect.addEventListener("change", function () {
        const reviewCards = document.querySelectorAll(".review-card");
        const sortValue = this.value;
        const reviewsArray = Array.from(reviewCards);
        let sorted = reviewsArray;

        if (sortValue === "highest") {
          sorted = reviewsArray.sort(
            (a, b) =>
              parseInt(b.getAttribute("data-rating")) -
              parseInt(a.getAttribute("data-rating"))
          );
        } else if (sortValue === "lowest") {
          sorted = reviewsArray.sort(
            (a, b) =>
              parseInt(a.getAttribute("data-rating")) -
              parseInt(b.getAttribute("data-rating"))
          );
        } else if (sortValue === "helpful") {
          sorted = reviewsArray.sort((a, b) => {
            const helpfulA = parseInt(
              a.querySelector(".helpful-btn").textContent.match(/\d+/)?.[0] || 0
            );
            const helpfulB = parseInt(
              b.querySelector(".helpful-btn").textContent.match(/\d+/)?.[0] || 0
            );
            return helpfulB - helpfulA;
          });
        }

        sorted.forEach((review) => reviewsGrid.appendChild(review));
      });
    },

    initHelpful() {
      // Nhóm 9: Nút Helpful - vote review hữu ích
      const helpfulBtns = document.querySelectorAll(".helpful-btn");

      helpfulBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          if (this.classList.contains("voted")) {
            // Nhóm 9: Unvote
            this.classList.remove("voted");
            this.style.background = "";
            this.style.color = "";
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            this.innerHTML = `<span class="icon">👍</span> Helpful (${
              currentCount - 1
            })`;
          } else {
            // Nhóm 9: Vote
            this.classList.add("voted");
            this.style.background = "#3b6d54";
            this.style.color = "white";
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            this.innerHTML = `<span class="icon">👍</span> Helpful (${
              currentCount + 1
            })`;

            this.style.transform = "scale(1.1)";
            setTimeout(() => {
              this.style.transform = "scale(1)";
            }, 200);
          }
        });
      });
    },

    initReport() {
      // Nhóm 9: Nút Report - báo cáo review không phù hợp
      const reportBtns = document.querySelectorAll(".report-btn");

      reportBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          if (confirm("Are you sure you want to report this review?")) {
            alert("Thank you for your report. We will review this feedback.");
            this.disabled = true;
            this.textContent = "Reported";
            this.style.opacity = "0.5";
          }
        });
      });
    },

    initLoadMore() {
      // Nhóm 9: Nút Load More - tải thêm reviews
      const loadMoreBtn = document.querySelector(".load-more-btn");

      if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
          this.innerHTML = "<span>Loading...</span>";
          this.disabled = true;

          setTimeout(() => {
            alert(
              "No more reviews to load. This would fetch from your database in production."
            );
            this.innerHTML = "No More Reviews";
            this.style.opacity = "0.5";
          }, 1000);
        });
      }
    },

    initWriteReview() {
      // Nhóm 9: Nút Write Review - mở form viết review
      const writeReviewBtn = document.querySelector(".write-review-btn-modern");
      const openFormBtn = document.getElementById("openReviewFormBtn");

      if (writeReviewBtn) {
        writeReviewBtn.addEventListener("click", () => this.openReviewModal());
      }
      if (openFormBtn) {
        openFormBtn.addEventListener("click", () => this.openReviewModal());
      }
    },

    initImageLightbox() {
      // Nhóm 9: Click vào review image để xem fullscreen
      const reviewImages = document.querySelectorAll(".review-img");

      reviewImages.forEach((img) => {
        img.addEventListener("click", function () {
          const overlay = document.createElement("div");
          overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: flex;
            align-items: center; justify-content: center;
            z-index: 10000; cursor: pointer;
          `;

          const fullImg = document.createElement("img");
          fullImg.src = this.src;
          fullImg.style.cssText = `
            max-width: 90%; max-height: 90%; border-radius: 8px;
          `;

          overlay.appendChild(fullImg);
          document.body.appendChild(overlay);

          overlay.addEventListener("click", () => {
            document.body.removeChild(overlay);
          });
        });
      });
    },
  };

  // =========================================================
  // Nhóm 9: REVIEW FORM SUBMIT - Xử lý submit form review
  // =========================================================

  const ReviewFormSubmit = {
    selectedPhotos: [],

    init() {
      const form = document.getElementById("reviewForm");
      const modal = document.getElementById("reviewModal");
      const closeBtn = document.getElementById("closeReviewModal");
      const cancelBtn = document.getElementById("cancelReviewBtn");
      const openBtn = document.getElementById("openReviewFormBtn");
      const writeReviewBtn = document.querySelector(".write-review-btn-modern");

      if (!form || !modal) {
        console.error("❌ Review form or modal not found!");
        return;
      }

      // Nhóm 9: Open modal handlers
      if (openBtn) {
        openBtn.addEventListener("click", () => this.openModal());
      }
      if (writeReviewBtn) {
        writeReviewBtn.addEventListener("click", () => this.openModal());
      }

      // Nhóm 9: Close modal function
      const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      };

      closeBtn?.addEventListener("click", closeModal);
      cancelBtn?.addEventListener("click", closeModal);

      // Nhóm 9: Click outside modal để đóng
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      // Nhóm 9: ESC key để đóng modal
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
          closeModal();
        }
      });

      this.initStarRating();
      this.initCharCounters();
      this.initPhotoUpload();
      this.initFormSubmit(form, closeModal);

      console.log("✅ Review Form Submit initialized");
    },

    openModal() {
      // Nhóm 9: Mở review modal
      const modal = document.getElementById("reviewModal");
      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    },

    initStarRating() {
      // Nhóm 9: Star rating input với message
      const starInputs = document.querySelectorAll(
        '.star-rating-input input[name="rating"]'
      );
      const ratingMessage = document.getElementById("ratingMessage");

      const messages = {
        5: "Excellent! 😍",
        4: "Good! 👍",
        3: "Average 😐",
        2: "Poor 👎",
        1: "Terrible 😞",
      };

      starInputs.forEach((input) => {
        input.addEventListener("change", function () {
          const rating = this.value;
          if (ratingMessage) {
            ratingMessage.textContent = messages[rating] || "Select a rating";
          }
        });
      });
    },

    initCharCounters() {
      // Nhóm 9: Character counter cho title và review text
      const titleInput = document.getElementById("reviewTitle");
      const reviewText = document.getElementById("reviewText");
      const titleCount = document.getElementById("titleCharCount");
      const reviewCount = document.getElementById("reviewCharCount");

      titleInput?.addEventListener("input", function () {
        const count = this.value.length;
        if (titleCount) {
          titleCount.textContent = `${count}/100`;
          titleCount.style.color = count > 100 ? "#ef4444" : "#9ca3af";
        }
      });

      reviewText?.addEventListener("input", function () {
        const count = this.value.length;
        if (reviewCount) {
          reviewCount.textContent = `${count}/1000`;
          reviewCount.style.color = count > 1000 ? "#ef4444" : "#9ca3af";
        }
      });
    },

    initPhotoUpload() {
      // Nhóm 9: Upload photos (tối đa 3 ảnh, mỗi ảnh max 5MB)
      const photoInput = document.getElementById("reviewPhotos");
      const previewGrid = document.getElementById("photoPreviewGrid");

      photoInput?.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);

        if (this.selectedPhotos.length + files.length > 3) {
          Utils.showNotification("Maximum 3 photos allowed", "warning");
          return;
        }

        files.forEach((file) => {
          if (file.size > 5 * 1024 * 1024) {
            Utils.showNotification(
              `${file.name} is too large (max 5MB)`,
              "warning"
            );
            return;
          }

          this.selectedPhotos.push(file);
          this.addPhotoPreview(file);
        });
      });
    },

    addPhotoPreview(file) {
      // Nhóm 9: Thêm photo preview với nút remove
      const previewGrid = document.getElementById("photoPreviewGrid");
      if (!previewGrid) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const div = document.createElement("div");
        div.className = "photo-preview-item";
        div.style.cssText = `
          position: relative; display: inline-block;
          margin: 5px; width: 80px; height: 80px;
        `;

        div.innerHTML = `
          <img src="${e.target.result}" alt="Preview" style="
            width: 100%; height: 100%; object-fit: cover;
            border-radius: 8px; border: 2px solid #3b6d54;
          ">
          <button type="button" class="photo-remove-btn" data-file="${file.name}" style="
            position: absolute; top: -8px; right: -8px;
            width: 24px; height: 24px; border-radius: 50%;
            background: #ef4444; color: white; border: none;
            cursor: pointer; font-size: 16px; line-height: 1;
          ">×</button>
        `;

        div.querySelector(".photo-remove-btn").addEventListener("click", () => {
          this.removePhoto(file.name);
          div.remove();
        });

        previewGrid.appendChild(div);
      };

      reader.readAsDataURL(file);
    },

    removePhoto(fileName) {
      // Nhóm 9: Xóa photo khỏi selected list
      this.selectedPhotos = this.selectedPhotos.filter(
        (f) => f.name !== fileName
      );
    },

    initFormSubmit(form, closeModal) {
      // Nhóm 9: Xử lý submit form review
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const agreeTerms = document.getElementById("agreeTerms");
        if (agreeTerms && !agreeTerms.checked) {
          Utils.showNotification(
            "Please agree to the review guidelines",
            "warning"
          );
          return;
        }

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        // Nhóm 9: Lấy dữ liệu từ form
        const formData = {
          name: document.getElementById("reviewerName")?.value || "Anonymous",
          email: document.getElementById("reviewerEmail")?.value || "",
          title: document.getElementById("reviewTitle")?.value || "",
          review: document.getElementById("reviewText")?.value || "",
          rating:
            document.querySelector('input[name="rating"]:checked')?.value ||
            "5",
          verified:
            document.getElementById("verifiedPurchase")?.checked || false,
          recommend:
            document.querySelector('input[name="recommend"]:checked')?.value ||
            "yes",
          date: "Just now",
          images: this.selectedPhotos.map((file) => URL.createObjectURL(file)),
        };

        // Nhóm 9: Loading state cho submit button
        const submitBtn = form.querySelector(".btn-submit");
        if (submitBtn) {
          const originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = "<span>⏳ Submitting...</span>";

          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }, 1500);
        }

        // Nhóm 9: Lưu vào localStorage
        try {
          let reviews = JSON.parse(localStorage.getItem("userReviews")) || [];
          reviews.push(formData);
          localStorage.setItem("userReviews", JSON.stringify(reviews));
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }

        // Nhóm 9: Thêm review vào trang
        this.addReviewToPage(formData);
        Utils.showNotification("✅ Review submitted successfully!", "success");

        // Nhóm 9: Reset form
        form.reset();
        this.selectedPhotos = [];
        const previewGrid = document.getElementById("photoPreviewGrid");
        if (previewGrid) previewGrid.innerHTML = "";

        const ratingMessage = document.getElementById("ratingMessage");
        if (ratingMessage) ratingMessage.textContent = "Select a rating";

        const titleCount = document.getElementById("titleCharCount");
        const reviewCount = document.getElementById("reviewCharCount");
        if (titleCount) titleCount.textContent = "0/100";
        if (reviewCount) reviewCount.textContent = "0/1000";

        closeModal();

        // Nhóm 9: Scroll đến reviews section
        setTimeout(() => {
          const reviewsSection = document.querySelector(".reviews-grid");
          if (reviewsSection) {
            reviewsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 500);

        console.log("✅ Review submitted:", formData);
      });
    },

    addReviewToPage(reviewData) {
      // Nhóm 9: Thêm review card mới vào đầu reviews grid
      const reviewsGrid = document.querySelector(".reviews-grid");

      if (!reviewsGrid) {
        console.error("❌ Reviews grid not found!");
        return;
      }

      // Nhóm 9: Tạo stars HTML
      const starsHTML = Array(5)
        .fill(0)
        .map((_, i) => {
          const isFilled = i < parseInt(reviewData.rating);
          return `<span class="star${isFilled ? " filled" : ""}">★</span>`;
        })
        .join("");

      // Nhóm 9: Tạo avatar initials
      const initials = reviewData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      // Nhóm 9: Tạo review card element
      const reviewCard = document.createElement("div");
      reviewCard.className = "review-card";
      reviewCard.setAttribute("data-scroll", "scale-up");
      reviewCard.setAttribute("data-rating", reviewData.rating);

      reviewCard.innerHTML = `
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">${initials}</div>
            <div class="reviewer-details">
              <h4 class="reviewer-name">${reviewData.name}</h4>
              <div class="review-meta">
                ${
                  reviewData.verified
                    ? '<span class="verified-badge">✓ Verified Purchase</span>'
                    : ""
                }
                <span class="review-date">${reviewData.date}</span>
              </div>
            </div>
          </div>
          <div class="review-rating">
            ${starsHTML}
          </div>
        </div>

        <div class="review-content">
          <h5 class="review-title">${reviewData.title}</h5>
          <p class="review-text">
            ${reviewData.review}
          </p>
        </div>

        ${
          reviewData.images && reviewData.images.length > 0
            ? `
          <div class="review-images">
            ${reviewData.images
              .map(
                (img) => `
              <img src="${img}" alt="Customer photo" class="review-img" />
            `
              )
              .join("")}
          </div>
        `
            : ""
        }

        <div class="review-footer">
          <button class="helpful-btn">
            <span class="icon">👍</span>
            Helpful (0)
          </button>
          <button class="report-btn">Report</button>
        </div>
      `;

      // Nhóm 9: Insert vào đầu grid
      reviewsGrid.insertBefore(reviewCard, reviewsGrid.firstChild);

      // Nhóm 9: Animation khi thêm mới
      reviewCard.style.opacity = "0";
      reviewCard.style.transform = "translateY(-20px)";

      setTimeout(() => {
        reviewCard.style.transition = "all 0.5s ease";
        reviewCard.style.opacity = "1";
        reviewCard.style.transform = "translateY(0)";
      }, 10);

      // Nhóm 9: Attach event listeners cho review card mới
      this.attachReviewCardEvents(reviewCard);

      console.log("✅ Review added to page:", reviewData);
    },

    attachReviewCardEvents(reviewCard) {
      // Nhóm 9: Attach helpful button event
      const helpfulBtn = reviewCard.querySelector(".helpful-btn");
      if (helpfulBtn) {
        helpfulBtn.addEventListener("click", function () {
          if (this.classList.contains("voted")) {
            this.classList.remove("voted");
            this.style.background = "";
            this.style.color = "";
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            this.innerHTML = `<span class="icon">👍</span> Helpful (${
              currentCount - 1
            })`;
          } else {
            this.classList.add("voted");
            this.style.background = "#3b6d54";
            this.style.color = "white";
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            this.innerHTML = `<span class="icon">👍</span> Helpful (${
              currentCount + 1
            })`;
          }
        });
      }

      // Nhóm 9: Attach report button event
      const reportBtn = reviewCard.querySelector(".report-btn");
      if (reportBtn) {
        reportBtn.addEventListener("click", function () {
          if (confirm("Report this review as inappropriate?")) {
            Utils.showNotification(
              "Review has been reported. Thank you!",
              "info"
            );
            this.disabled = true;
            this.textContent = "Reported";
            this.style.opacity = "0.5";
          }
        });
      }

      // Nhóm 9: Attach lightbox cho review images
      const reviewImages = reviewCard.querySelectorAll(".review-img");
      reviewImages.forEach((img) => {
        img.addEventListener("click", function () {
          const overlay = document.createElement("div");
          overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: flex;
            align-items: center; justify-content: center;
            z-index: 10000; cursor: pointer;
          `;

          const fullImg = document.createElement("img");
          fullImg.src = this.src;
          fullImg.style.cssText = `
            max-width: 90%; max-height: 90%; border-radius: 8px;
          `;

          overlay.appendChild(fullImg);
          document.body.appendChild(overlay);

          overlay.addEventListener("click", () => {
            document.body.removeChild(overlay);
          });
        });
      });
    },
  };

  // =========================================================
  // Nhóm 9: PRODUCT SLIDER - Slider cho old product section (nếu có)
  // =========================================================

  const ProductSlider = {
    products: [
      {
        title: "L-shaped sofa",
        img: "Product/Ảnh/11.png",
        price: "9.500.000 đ",
      },
      {
        title: "L-shaped sofa - Grey",
        img: "Product/Ảnh/9.png",
        price: "9.500.000 đ",
      },
      {
        title: "Corner Sofa Deluxe",
        img: "Product/Ảnh/10.png",
        price: "11.000.000 đ",
      },
      {
        title: "Modern Armchair",
        img: "Product/Ảnh/12.png",
        price: "4.200.000 đ",
      },
    ],
    index: 0,

    init() {
      const img = document.getElementById("productImage");
      const price = document.getElementById("productPrice");
      const prev = document.getElementById("prevBtn");
      const next = document.getElementById("nextBtn");

      if (!img || !price) return;

      this.img = img;
      this.price = price;

      // Nhóm 9: Previous button
      if (prev) {
        prev.addEventListener("click", () => {
          this.index =
            (this.index - 1 + this.products.length) % this.products.length;
          this.updateProduct();
        });
      }

      // Nhóm 9: Next button
      if (next) {
        next.addEventListener("click", () => {
          this.index = (this.index + 1) % this.products.length;
          this.updateProduct();
        });
      }

      this.updateProduct();
      console.log("✅ Product Slider initialized");
    },

    updateProduct() {
      // Nhóm 9: Update image và price
      if (this.img && this.price) {
        this.img.src = this.products[this.index].img;
        this.price.textContent = this.products[this.index].price;
      }
    },
  };

  // =========================================================
  // Nhóm 9: SIMPLE SLIDER - Slider với dots navigation
  // =========================================================

  const SimpleSlider = {
    index: 0,

    init() {
      const slides = document.querySelectorAll(".slide");
      const dotsContainer = document.getElementById("dots");

      if (slides.length === 0 || !dotsContainer) return;

      this.slides = slides;
      this.dotsContainer = dotsContainer;

      // Nhóm 9: Tạo dots
      slides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.style.cssText = `
          display: inline-block; width: 12px; height: 12px;
          margin: 0 5px; background: #bbb; border-radius: 50%;
          cursor: pointer; transition: background 0.3s;
        `;
        dot.addEventListener("click", () => this.showSlide(i));
        dotsContainer.appendChild(dot);
      });

      this.dots = dotsContainer.querySelectorAll("span");

      // Nhóm 9: Auto play
      setInterval(() => this.changeSlide(1), 4000);

      // Nhóm 9: Show first slide
      this.showSlide(0);

      // Nhóm 9: Expose global function
      window.changeSlide = (n) => this.changeSlide(n);

      console.log("✅ Simple Slider initialized");
    },

    showSlide(i) {
      // Nhóm 9: Show slide và update dots
      this.slides.forEach((s) => s.classList.remove("active"));
      this.dots.forEach((d) => {
        d.classList.remove("active");
        d.style.background = "#bbb";
      });

      this.slides[i].classList.add("active");
      this.dots[i].classList.add("active");
      this.dots[i].style.background = "#3b6d54";
      this.index = i;
    },

    changeSlide(n) {
      // Nhóm 9: Thay đổi slide
      this.index = (this.index + n + this.slides.length) % this.slides.length;
      this.showSlide(this.index);
    },
  };

  // =========================================================
  // Nhóm 9: INJECT GLOBAL STYLES - Inject CSS animations và styles
  // =========================================================

  const InjectStyles = {
    init() {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
        .review-modal-close:hover {
          color: #333 !important;
        }
        .submit-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 109, 84, 0.4);
        }
      `;
      document.head.appendChild(style);
      console.log("✅ Styles injected");
    },
  };

  // =========================================================
  // Nhóm 9: MASTER INITIALIZATION - Khởi tạo tất cả modules
  // =========================================================

  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Initializing Modern Product Page...");

    InjectStyles.init();
    ImageGallery.init();
    ColorManager.init();
    SizeManager.init();
    MaterialManager.init();
    QuantityManager.init();
    CartManager.init();
    WishlistManager.init();
    ShareManager.init();
    CompareManager.init();
    StickyCartBar.init();
    TabsManager.init();
    GallerySlider.init();
    ReviewsManager.init();
    ProductSlider.init();
    SimpleSlider.init();
    ReviewFormSubmit.init();

    console.log("✅ Modern Product Page Fully Initialized!");
  });
})();
