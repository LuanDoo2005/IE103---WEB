# Loading UX Audit - IE103 WEB Project
## Complete Navigation & Redirect Analysis

---

## Table of Contents
1. [Authentication Flow (User Registration & Login)](#authentication-flow)
2. [Payment & Order Processing](#payment--order-processing)
3. [User Profile & Data Management](#user-profile--data-management)
4. [Product Pages & Navigation](#product-pages--navigation)
5. [Partial Loading (Header/Footer)](#partial-loading-headerfooter)
6. [Admin Dashboard](#admin-dashboard)
7. [Current Loading Infrastructure](#current-loading-infrastructure)
8. [Recommendations](#recommendations)

---

## Authentication Flow (User Registration & Login)

### 1. **Register Page** → **Verify Email Page**
- **Files**: [user/register.html](user/register.html) | [js/register.js](js/register.js)
- **Type**: Form Submission with Redirect
- **Current Behavior**:
  - Form validation (fullName, email, password, phone, dob, gender, city, preferences)
  - Data stored to localStorage
  - **Loading delay**: ✅ Already has `loading-overlay` element
  - **Redirect timing**: 1200ms delay before `window.location.href = 'verify-email.html'`
  - **Line**: [js/register.js#L112](js/register.js#L112)

**Current Implementation**:
```javascript
// Shows success message, disables form inputs
const loadingOverlay = document.getElementById('loading-overlay');
if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
}
setTimeout(() => {
    window.location.href = 'verify-email.html';
}, 1200);
```

**Status**: ✅ Has loading UI, but minimal visible feedback

---

### 2. **Verify Email Page** → **Login Page**
- **Files**: [user/verify-email.html](user/verify-email.html) | [js/verify-email.js](js/verify-email.js)
- **Type**: OTP Verification with Redirect
- **Current Behavior**:
  - Generates 6-digit OTP (simulated)
  - Validates user input
  - **Redirect timing**: 1500ms delay after successful verification
  - **Line**: [js/verify-email.js#L91](js/verify-email.js#L91)

**Navigation Points**:
- ✅ Line [js/verify-email.js#L21](js/verify-email.js#L21): If email not found → redirects to register.html (2000ms delay)
- ✅ Line [js/verify-email.js#L91](js/verify-email.js#L91): After OTP verification → redirects to login.html (1500ms delay)
- ✅ Line [js/verify-email.js#L96](js/verify-email.js#L96): "Go back to register" link

**Status**: ⚠️ Has delays but NO loading screen overlay

---

### 3. **Login Page** → **Personal Info Page**
- **Files**: [user/login.html](user/login.html) | [js/login.js](js/login.js)
- **Type**: Form Submission with Redirect
- **Current Behavior**:
  - Email & password validation
  - localStorage authentication
  - **Redirect timing**: 1200ms delay
  - **Line**: [js/login.js#L74](js/login.js#L74) (approximate)

```javascript
showSuccess('Đăng nhập thành công!');
setTimeout(() => {
    window.location.href = 'personal-info.html';
}, 1200);
```

**Status**: ⚠️ Has delays but NO loading screen overlay

---

## Payment & Order Processing

### 4. **Wishlist Send Form** → **Payment Processing**
- **Files**: [wishlist-and-payment/wishlist-send_index.html](wishlist-and-payment/wishlist-send_index.html) | [js/wishlist-send.js](js/wishlist-send.js)
- **Type**: Form Submission
- **Current Behavior**:
  - Comprehensive form validation (name, email, phone, address, country, province)
  - Collects customer data and stores in localStorage
  - **Line**: [js/wishlist-send.js#L70](js/wishlist-send.js#L70)
  - **Line**: [js/wishlist-send.js#L271](js/wishlist-send.js#L271) - handleFormSubmit()

**Form Sections**:
- Contact Information (name, surname, phone, email)
- Delivery Information (country, address, city, province)
- Payment Method Selection (COD / Bank Transfer)

**Status**: ⚠️ Long form with validation - **NEEDS LOADING SCREEN**

**Validation Points** (Lines [js/wishlist-send.js#L200-250](js/wishlist-send.js#L200-250)):
- Required fields validation
- Phone format validation (min 10 digits)
- Payment method selection

---

### 5. **Bank Transfer Payment Page**
- **Files**: [wishlist-and-payment/bank.html](wishlist-and-payment/bank.html) | [js/bank.js](js/bank.js)
- **Type**: Image Upload + Form Submission
- **Current Behavior**:
  - File upload with preview
  - Form validation before continuing
  - **Line**: [js/bank.js](js/bank.js) - Checks if file exists

```javascript
continueBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!fileUpload.files || fileUpload.files.length === 0) {
        errorMessage.style.display = 'block';
        return;
    }
    // If image exists → redirect to success page
    window.location.href = 'success_index.html';
});
```

**Status**: ⚠️ Redirect without loading screen

---

### 6. **Order Detail Page**
- **Files**: [wishlist-and-payment/order-detail.html](wishlist-and-payment/order-detail.html) | [js/order-detail.js](js/order-detail.js)
- **Type**: Data Display Page (Loads from localStorage)
- **Current Behavior**:
  - Loads customer info from localStorage (key: `customerInfo`)
  - Displays order/product information
  - Has "Buy Again" button that redirects to wishlist
  - **Line**: [js/order-detail.js](js/order-detail.js) - Button redirects to 'wishlist_index.html'

**Status**: ✅ No loading needed (data already in localStorage)

---

## User Profile & Data Management

### 7. **Personal Info Page**
- **Files**: [user/personal-info.html](user/personal-info.html) | [js/personal-info.js](js/personal-info.js)
- **Type**: Multi-tab Dashboard with Forms
- **Current Behavior**:
  - Loads user data from localStorage
  - **Redirect if not logged in**: 
    - **Line**: [js/personal-info.js#L51](js/personal-info.js#L51) - Redirects to login.html if no email found

```javascript
if (!loggedInEmail) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
}
```

- **Tab Navigation**: Profile View / Edit Profile / Orders
- **Edit Profile Form Submission**:
  - **Line**: [js/personal-info.js#L353](js/personal-info.js#L353)
  - Saves to localStorage, shows notification, closes modal (1.5s delay)

- **Logout Handler**:
  - **Line**: [js/personal-info.js#L337](js/personal-info.js#L337)
  - Clears localStorage and redirects to login.html

**Form Fields**: Full Name, Phone, DOB, Gender, City/Province, Address

**Status**: ✅ Has notification feedback, but could use loading state during form save

---

## Product Pages & Navigation

### 8. **Product Detail Pages**
- **Files**: [typologies/couch.html](typologies/couch.html), [typologies/bed.html](typologies/bed.html), etc. | [js/product.js](js/product.js)
- **Type**: Dynamic Product Display
- **Current Behavior**:
  - Image gallery navigation (prev/next buttons)
  - Product customization (color swatches, quantity)
  - Add to cart / Buy now / Wishlist buttons
  - No page redirects (single-page product view)

**Status**: ✅ No loading needed (client-side only)

---

### 9. **Typologies/Category Pages**
- **Files**: [typologies/typologies.html](typologies/typologies.html), [typologies/product_index.html](typologies/product_index.html)
- **Type**: Product Listing Pages
- **Current Behavior**:
  - Links with `data-target` attributes for navigation
  - Examples: `data-target="typologies/bed.html"`, `data-target="typologies/couch.html"`
  - Handled by header navigation via links with `href="#"`

**Status**: ✅ No loading needed (static links)

---

## Partial Loading (Header/Footer)

### 10. **Async Partial Loading**
- **Files**: [js/partials.js](js/partials.js)
- **Type**: Fetch-based Async Loading
- **Current Behavior**:
  - Uses `fetch()` API to load header and footer partials
  - Parallel loading of all partials with `Promise.all()`
  - **Dispatch event**: `allPartialsLoaded` when complete

```javascript
async function loadPartials() {
    const includes = document.querySelectorAll('[data-include]');
    
    const loadPromises = Array.from(includes).map(async (element) => {
        const file = element.getAttribute('data-include');
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            element.innerHTML = html;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    });
    
    await Promise.all(loadPromises);
    document.dispatchEvent(new CustomEvent('allPartialsLoaded'));
}
```

**HTML Elements**: `<div data-include="../partials/header.html"></div>`

**Status**: ✅ Async with event dispatch, but **could benefit from loading indicator on slow networks**

---

## Admin Dashboard

### 11. **Admin Panel**
- **Files**: [user/admin.html](user/admin.html) | [js/admin.js](js/admin.js)
- **Type**: Dashboard with Multiple Views
- **Current Behavior**:
  - Views: Orders, Inventory, Reports
  - Mock data stored in mockOrders and mockInventory arrays
  - Add/Edit product modals with form submission
  - **Line**: [js/admin.js#L234](js/admin.js#L234) - Form submit listener

**Actions**:
- View orders table
- Edit/Add products
- Filter products
- Logout button

**Status**: ⚠️ Form submissions during add/edit operations **NEED LOADING FEEDBACK**

---

## Current Loading Infrastructure

### Loading Components Already Exist

#### 1. **Loading HTML Page**
- **File**: [loading.html](loading.html)
- **Status**: ✅ Standalone loading page with animations
- **Features**:
  - Falling leaf animation
  - Progress bar
  - Network speed detection
  - Used for initial page load simulation

#### 2. **Loading JavaScript Module** 
- **File**: [js/loadingComponent.js](js/loadingComponent.js)
- **Exports**:
  - `createLoadingComponent()` - Create loading element
  - `showLoading(targetSelector)` - Display loading overlay
  - `hideLoading(delay)` - Hide with delay
  - `updateProgress(percentage)` - Update progress bar
  - `setLoadingText(text)` - Change loading text

```javascript
export function showLoading(targetSelector = "body") { ... }
export function hideLoading(delay = 0) { ... }
```

#### 3. **Loading CSS**
- **File**: [css/loading.css](css/loading.css)
- **Features**: Animations for leaves, progress bar, text effects

#### 4. **Basic Loading Overlay**
- **Used in**: [js/register.js#L106](js/register.js#L106)
- **Element**: `<div id="loading-overlay">` with `hidden` class

**Status**: ✅ Infrastructure exists but underutilized

---

## Recommendations

### Priority 1: Critical Loading Screens Needed ⚠️

#### A. **Wishlist Send Form** → **Order Confirmation**
- **File**: [js/wishlist-send.js](js/wishlist-send.js)
- **Location**: In `handleFormSubmit()` method around line 271
- **Issue**: Long form with validation, then navigation
- **Action**: Add loading overlay before redirect to payment page

#### B. **Login Form** → **Personal Info Page**
- **File**: [js/login.js](js/login.js)
- **Issue**: Has 1200ms delay but no visual feedback
- **Action**: Show loading screen during delay

#### C. **Register Form** → **Verify Email**
- **File**: [js/register.js](js/register.js)
- **Issue**: Already has `loading-overlay` but might be hidden
- **Action**: Ensure overlay is visible and styled consistently

#### D. **Bank Payment Upload** → **Success Page**
- **File**: [js/bank.js](js/bank.js)
- **Issue**: File upload + redirect with no loading indicator
- **Action**: Show loading during upload simulation

### Priority 2: Nice-to-Have Loading Screens

#### E. **Verify Email OTP Check**
- **File**: [js/verify-email.js](js/verify-email.js)
- **Location**: After `verifyCode()` function
- **Benefit**: Simulates API call verification

#### F. **Personal Info Form Save**
- **File**: [js/personal-info.js](js/personal-info.js)
- **Location**: After form submission around line 365
- **Benefit**: Simulates server save operation

#### G. **Admin Product Add/Edit**
- **File**: [js/admin.js](js/admin.js)
- **Location**: After form validation around line 234
- **Benefit**: Simulates database operation

#### H. **Partial Loading (Slow Networks)**
- **File**: [js/partials.js](js/partials.js)
- **Benefit**: Show loader on slow 2G/3G connections

### Priority 3: Nice-to-Have (Low Impact)

#### I. **Admin Logout**
- **File**: [js/admin.js](js/admin.js)
- **Benefit**: Redirect animation

#### J. **Wishlist → Payment Redirect**
- **File**: [wishlist-and-payment/order-detail.js](wishlist-and-payment/order-detail.js)
- **Benefit**: "Buy Again" button redirect

---

## Implementation Pattern

### Suggested Loading Pattern (Using Existing Infrastructure):

```javascript
// 1. Show loading
showLoading('body');

// 2. Simulate delay
setTimeout(() => {
    // 3. Hide loading
    hideLoading(300);
    
    // 4. Redirect
    window.location.href = 'next-page.html';
}, 1500);
```

Or with progress:

```javascript
showLoading();
let progress = 0;
const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
        clearInterval(interval);
        hideLoading(500);
        window.location.href = 'next-page.html';
    } else {
        updateProgress(Math.min(progress, 99));
    }
}, 300);
```

---

## File Reference Summary

| Page | HTML | JavaScript | Redirects To | Type |
|------|------|-----------|--------------|------|
| Register | user/register.html | js/register.js | verify-email.html | Form + Redirect |
| Verify Email | user/verify-email.html | js/verify-email.js | login.html | Form + Redirect |
| Login | user/login.html | js/login.js | personal-info.html | Form + Redirect |
| Personal Info | user/personal-info.html | js/personal-info.js | login.html (if logout) | Dashboard |
| Wishlist Send | wishlist-and-payment/wishlist-send_index.html | js/wishlist-send.js | bank.html | Form + Redirect |
| Bank Payment | wishlist-and-payment/bank.html | js/bank.js | success_index.html | Upload + Redirect |
| Order Detail | wishlist-and-payment/order-detail.html | js/order-detail.js | wishlist_index.html | Data Display |
| Admin Dashboard | user/admin.html | js/admin.js | (modal operations) | Admin Panel |
| Product Pages | typologies/*.html | js/product.js | (none) | Static Display |

---

## Key Metrics

- **Total Files with Redirects**: 8
- **Form Submissions with Delays**: 6
- **Async Operations (fetch)**: 1 (partials.js)
- **Existing Loading Infrastructure**: ✅ Yes (loadingComponent.js)
- **Redirects Without Loading Screens**: 6 ⚠️

---

## Files to Modify (in priority order)

1. [js/wishlist-send.js](js/wishlist-send.js) - Lines around 271-310
2. [js/login.js](js/login.js) - Lines around 65-75
3. [js/bank.js](js/bank.js) - Lines around 50-60
4. [js/verify-email.js](js/verify-email.js) - Lines around 85-95
5. [js/personal-info.js](js/personal-info.js) - Lines around 353-370
6. [js/admin.js](js/admin.js) - Lines around 234-270
7. [js/register.js](js/register.js) - Verify overlay usage
8. [js/partials.js](js/partials.js) - For slow networks

---

**Last Updated**: 2026-05-16
**Audit Scope**: Complete navigation flow analysis
**Status**: Ready for implementation
