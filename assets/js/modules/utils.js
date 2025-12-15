/**
 * Utility Functions Module
 * Common helper functions used across the application
 */

/**
 * Detect if device supports touch
 */
export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/**
 * Allowed mailto recipients (security)
 */
export const ALLOWED_MAILTO = new Set([
    'sreyanpattanayak@zohomail.com',
    'sreyanpattanayak246@gmail.com'
]);

/**
 * Create ripple animation effect on button click
 * @param {Event} event - Click event
 */
export function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
    const simple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return simple.test(email);
}

/**
 * Highlight text matches in search results
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} HTML with highlighted matches
 */
export function highlightMatches(text, query) {
    const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!q) return text;
    const re = new RegExp(`(${q})`, 'ig');
    return text.replace(re, '<mark>$1</mark>');
}

/**
 * Play notification sound
 */
export function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBhpu+3nnk0QDFC');
        audio.volume = 0.3;
        audio.play().catch(() => { }); // Silently fail if autoplay blocked
    } catch (e) {
        // Silently fail
    }
}

/**
 * Trigger device vibration
 * @param {number|number[]} pattern - Vibration pattern
 */
export function triggerVibration(pattern = [200, 100, 200]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

/**
 * Show notification banner
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
let currentNotification = null; // Track current notification
let notificationTimeout = null; // Track timeout

export function showNotification(message, type = 'info') {
    // Check if push notifications are enabled
    const pushEnabled = localStorage.getItem('pushEnabled');
    if (pushEnabled === 'false') {
        console.log('📵 Notification blocked - Push notifications disabled');
        return; // Don't show notification if disabled
    }

    // Remove existing notification immediately
    if (currentNotification) {
        clearTimeout(notificationTimeout);
        currentNotification.remove();
        currentNotification = null;
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    // Determine styles based on type
    let bg = 'var(--card-bg)';
    let color = 'var(--text-primary)';
    let border = 'none';

    if (type === 'success') {
        bg = 'linear-gradient(135deg, #10b981, #059669)';
        color = '#ffffff';
    } else if (type === 'warning') {
        bg = 'linear-gradient(135deg, #f59e0b, #d97706)';
        color = '#ffffff';
    } else if (type === 'error') {
        bg = 'linear-gradient(135deg, #ef4444, #dc2626)';
        color = '#ffffff';
    }

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bg};
        color: ${color};
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInDown 0.3s ease;
        max-width: 90%;
        text-align: center;
        border: ${border};
    `;

    document.body.appendChild(notification);
    currentNotification = notification; // Store reference

    notificationTimeout = setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
            if (currentNotification === notification) {
                currentNotification = null;
            }
        }, 300);
    }, 3000);
}

/**
 * Get current scroll position
 * @returns {number} Current scroll Y position
 */
export function getScrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
}

/**
 * Smooth scroll to element
 * @param {string|Element} target - Target element or selector
 * @param {number} offset - Offset from top
 */
export function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

