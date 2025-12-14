/**
 * Security Module
 * Handles link validation, mailto protection, and broken link detection
 * Extracted from script.js lines 2341-2416
 */

// Import utilities
import { ALLOWED_MAILTO, isValidEmail } from './utils.js';

/**
 * Check if running in HTTP context
 */
function isHttpContext() {
    return location.protocol === 'http:' || location.protocol === 'https:';
}

/**
 * Initialize security features
 */
export function initSecurity() {
    console.log('✅ Security module initialized');

    // Broken link guard and mailto validation
    document.addEventListener('click', async (e) => {
        const a = e.target.closest && e.target.closest('a');
        if (!a) return;

        // Skip checks if developer opts out
        if (a.dataset && a.dataset.skipCheck === 'true') return;

        const rawHref = a.getAttribute('href');
        if (!rawHref) return;

        // Redirect broken placeholder links to 404
        if (rawHref === '#') {
            e.preventDefault();
            window.location.href = 'pages/404.html';
            return;
        }

        // Ignore valid in-page anchors
        if (rawHref.startsWith('#')) return;

        // Validate mailto links and enforce allowlist
        if (rawHref.toLowerCase().startsWith('mailto:')) {
            try {
                const addrPart = rawHref.slice(7).split('?')[0];
                const decoded = decodeURIComponent(addrPart).trim().toLowerCase();

                if (!isValidEmail(decoded) || !ALLOWED_MAILTO.has(decoded)) {
                    e.preventDefault();
                    window.location.href = 'pages/404.html';
                }
            } catch (_) {
                e.preventDefault();
                window.location.href = 'pages/404.html';
            }
            return;
        }

        // Ignore protocols we don't validate
        if (/^(tel:|javascript:|data:)/i.test(rawHref)) return;

        // Only attempt fetch checks when running over HTTP(S) and same-origin
        if (!isHttpContext()) return;

        let url;
        try { url = new URL(rawHref, location.href); } catch { return; }

        if (url.origin !== location.origin) return;

        // Perform lightweight HEAD request
        try {
            const res = await fetch(url.href, { method: 'HEAD' });
            if (!res.ok) {
                if (res.status === 405 || res.status === 501) return;
                e.preventDefault();
                window.location.href = 'pages/404.html';
            }
        } catch (err) {
            e.preventDefault();
            window.location.href = 'pages/404.html';
        }
    }, true);
}

/**
 * Detect page type
 */
export function detectPageType() {
    const hasSidebar = document.getElementById('sidebarMenu') !== null;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (hasSidebar && (currentPage === 'index.html' || currentPage === '')) {
        return 'sidebar';
    } else {
        return 'back';
    }
}

