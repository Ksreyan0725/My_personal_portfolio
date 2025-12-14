/**
 * Preloader Module
 * Handles page loading animation and early theme initialization
 * Must load BEFORE all other modules
 */

// Early theme initialization - Sets theme immediately to prevent FOUC
(function initEarlyTheme() {
    try {
        const storedTheme = localStorage.getItem('theme') || 'system';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const effectiveTheme = storedTheme === 'system' ? (prefersDark ? 'dark' : 'light') : storedTheme;

        document.documentElement.setAttribute('data-theme', effectiveTheme);

        if (document.body) {
            document.body.classList.toggle('darkmode', effectiveTheme === 'dark');
        } else {
            document.addEventListener('DOMContentLoaded', function onLoad() {
                document.body.classList.toggle('darkmode', effectiveTheme === 'dark');
                document.removeEventListener('DOMContentLoaded', onLoad);
            });
        }
    } catch (e) {
        console.warn('Early theme init failed:', e && e.message);
    }
})();

/**
 * Hide preloader with appropriate timing based on device and PWA mode
 */
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    // PWA mode: Skip custom preloader (use native splash screen)
    if (isPWA) {
        document.body.classList.add('loaded');
        preloader.style.display = 'none';

        // Force content visibility
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
        return;
    }

    // Browser mode: Show custom circular preloader
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 1024;

    // Minimum display time for browser
    let minDisplayTime;
    if (isMobile) {
        minDisplayTime = 400; // Mobile browser
    } else if (isTablet) {
        minDisplayTime = 300; // Tablet browser
    } else {
        minDisplayTime = 200; // Desktop browser
    }

    // Ensure preloader is visible initially
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';
    preloader.style.visibility = 'visible';

    // Wait for minimum display time
    setTimeout(() => {
        document.body.classList.add('loaded');

        // Force content visibility
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });

        // Remove from DOM after transition
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, minDisplayTime);
}

// Make hidePreloader globally accessible
window.hidePreloader = hidePreloader;

// Hide preloader when DOM is ready (faster than window.load)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hidePreloader);
} else {
    // DOM already loaded
    hidePreloader();
}

// Also listen to window load as backup
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.display !== 'none') {
        hidePreloader();
    }
});

// Fallback: Force hide preloader after 1.5 seconds
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.display !== 'none') {
        console.warn('Preloader fallback triggered - forcing hide');
        hidePreloader();
    }
}, 1500);

// Make hidePreloader globally accessible
window.hidePreloader = hidePreloader;

