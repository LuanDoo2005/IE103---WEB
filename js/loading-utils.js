/**
 * Loading Utilities - Reusable loading overlay for all pages
 * Usage: createAndShowLoadingOverlay(message)
 */

function createAndShowLoadingOverlay(message = 'Đang xử lý...') {
    // Check if overlay already exists
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        // Create overlay HTML structure
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        // Update message if overlay exists
        const messageP = overlay.querySelector('.loading-spinner p');
        if (messageP) {
            messageP.textContent = message;
        }
        overlay.classList.remove('hidden');
    }
    
    return overlay;
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function showLoadingOverlayThenRedirect(message = 'Đang xử lý...', redirectUrl = '', delayMs = 1200) {
    createAndShowLoadingOverlay(message);
    
    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, delayMs);
    }
}
