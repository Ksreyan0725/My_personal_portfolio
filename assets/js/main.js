/**
 * Main Application Entry Point
 * Imports and initializes all modules
 */

// Import utilities
import {
    isTouchDevice,
    createRipple,
    debounce,
    showNotification
} from './modules/utils.js';

/**
 * Initialize smooth scrolling with Lenis
 */
function initSmoothScroll() {
    // DISABLED: Lenis smooth scroll causes mobile scrolling issues
    // Using native browser scrolling instead for better performance and compatibility
    console.log('ℹ️  Using native browser scrolling (Lenis disabled)');
    return;

    // Wait for Lenis to be available (it's loaded with defer)
    const checkLenis = setInterval(() => {
        if (typeof Lenis !== 'undefined') {
            clearInterval(checkLenis);

            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false, // Disable on touch to prevent conflicts
                touchMultiplier: 2,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
            window.lenis = lenis;

            console.log('✅ Smooth scroll initialized');
        }
    }, 100);

    // Stop checking after 3 seconds if Lenis doesn't load
    setTimeout(() => {
        clearInterval(checkLenis);
        if (typeof Lenis === 'undefined') {
            console.warn('⚠️  Lenis not loaded, using native scroll');
        }
    }, 3000);
}

/**
 * Add touch device class
 */
function initTouchDevice() {
    if (isTouchDevice) {
        document.documentElement.classList.add('touch-device');
        console.log('✅ Touch device detected');
    }
}

/**
 * Initialize ripple effects on buttons
 */
function initRippleEffects() {
    const rippleButtons = document.querySelectorAll('.ripple-btn, .cta-button, .theme-btn');
    rippleButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    console.log(`✅ Ripple effects initialized on ${rippleButtons.length} buttons`);
}

/**
 * Main initialization function
 */
async function initApp() {
    console.log('🚀 Initializing modular app...');

    // Initialize core features
    initTouchDevice();
    initSmoothScroll();
    initRippleEffects();

    // Initialize critical modules immediately
    try {
        // Load theme module
        const themeModule = await import('./modules/theme.js');
        if (themeModule && themeModule.initTheme) {
            themeModule.initTheme();
        }
    } catch (error) {
        console.warn('Theme module not loaded:', error);
    }

    try {
        // Load sidebar module
        const sidebarModule = await import('./modules/sidebar.js');
        if (sidebarModule && sidebarModule.initSidebar) {
            sidebarModule.initSidebar();
        }
    } catch (error) {
        console.warn('Sidebar module not loaded:', error);
    }

    try {
        // Load search module
        const searchModule = await import('./modules/search.js');
        if (searchModule && searchModule.initSearch) {
            searchModule.initSearch();
        }
    } catch (error) {
        console.warn('Search module not loaded:', error);
    }

    try {
        // Load settings module
        const settingsModule = await import('./modules/settings.js');
        if (settingsModule && settingsModule.initSettings) {
            settingsModule.initSettings();
        }
    } catch (error) {
        console.warn('Settings module not loaded:', error);
    }

    try {
        // Load PWA module
        const pwaModule = await import('./modules/pwa.js');
        if (pwaModule && pwaModule.initPWA) {
            pwaModule.initPWA();
        }
    } catch (error) {
        console.warn('PWA module not loaded:', error);
    }

    try {
        // Load navigation module
        const navigationModule = await import('./modules/navigation.js');
        if (navigationModule && navigationModule.initNavigation) {
            navigationModule.initNavigation();
        }
    } catch (error) {
        console.warn('Navigation module not loaded:', error);
    }

    try {
        // Load features module
        const featuresModule = await import('./modules/features.js');
        if (featuresModule && featuresModule.initFeatures) {
            featuresModule.initFeatures();
        }
    } catch (error) {
        console.warn('Features module not loaded:', error);
    }

    try {
        // Load security module
        const securityModule = await import('./modules/security.js');
        if (securityModule && securityModule.initSecurity) {
            securityModule.initSecurity();
        }
    } catch (error) {
        console.warn('Security module not loaded:', error);
    }

    console.log('✅ Modular app initialized - ALL MODULES LOADED');
}

/**
 * Setup lazy loading for non-critical features
 */
function setupLazyLoading() {
    // Load search on first search interaction
    const searchButtons = document.querySelectorAll('.mobile-search-icon, .desktop-search');
    searchButtons.forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const searchModule = await import('./modules/search.js');
                if (searchModule && searchModule.initSearch) {
                    searchModule.initSearch();
                }
            } catch (error) {
                console.warn('Search module not loaded:', error);
            }
        }, { once: true });
    });

    // Load settings on first settings interaction
    const settingsButtons = document.querySelectorAll('#openSettingsBtn, #desktopSettingsBtn');
    settingsButtons.forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const settingsModule = await import('./modules/settings.js');
                if (settingsModule && settingsModule.initSettings) {
                    settingsModule.initSettings();
                }
            } catch (error) {
                console.warn('Settings module not loaded:', error);
            }
        }, { once: true });
    });

    // Load PWA module
    setTimeout(async () => {
        try {
            const pwaModule = await import('./modules/pwa.js');
            if (pwaModule && pwaModule.initPWA) {
                pwaModule.initPWA();
            }
        } catch (error) {
            console.warn('PWA module not loaded:', error);
        }
    }, 2000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for potential external use
export { initApp, initSmoothScroll, initTouchDevice };

