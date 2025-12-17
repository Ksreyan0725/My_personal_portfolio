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
 * Hide preloader with network speed detection and percentage animation
 */
function hidePreloader() {
    const webPreloader = document.getElementById('webPreloader');
    const pwaPreloader = document.getElementById('preloader');

    if (!webPreloader && !pwaPreloader) return;

    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    // Determine which preloader to use
    let preloader = webPreloader;

    // In PWA mode, check if it's initial launch
    if (isPWA && pwaPreloader) {
        const isInitialLaunch = !sessionStorage.getItem('appLaunched');
        if (isInitialLaunch) {
            // PWA preloader handles initial launch
            return;
        }
        // Use webPreloader for subsequent visits in PWA mode
        preloader = webPreloader;
    }

    if (!preloader) return;

    const percentageEl = preloader.querySelector('.loading-percentage');
    const barFillEl = preloader.querySelector('.loading-bar-fill');

    // Detect network speed and offline status
    let loadSpeed = 2500; // Default: 2.5 seconds
    const isOffline = !navigator.onLine;

    if (isOffline) {
        // Offline mode: Fast loading since content is cached
        loadSpeed = 800; // 0.8 seconds
    } else if (navigator.connection) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink; // Mbps

        // Use downlink speed if available (more accurate)
        if (downlink) {
            if (downlink >= 10) loadSpeed = 1200; // 10+ Mbps - Very fast
            else if (downlink >= 5) loadSpeed = 1500; // 5-10 Mbps - Fast
            else if (downlink >= 2) loadSpeed = 2000; // 2-5 Mbps - Medium-fast
            else if (downlink >= 1) loadSpeed = 2500; // 1-2 Mbps - Medium
            else if (downlink >= 0.5) loadSpeed = 3500; // 0.5-1 Mbps - Slow
            else loadSpeed = 5000; // < 0.5 Mbps - Very slow
        } else {
            // Fallback to effectiveType
            if (effectiveType === '4g') loadSpeed = 1500; // Fast
            else if (effectiveType === '3g') loadSpeed = 2500; // Medium
            else if (effectiveType === '2g') loadSpeed = 4000; // Slow
            else if (effectiveType === 'slow-2g') loadSpeed = 5000; // Very slow
        }
    }

    // Ensure preloader is visible initially
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';
    preloader.style.visibility = 'visible';

    // Animate percentage from 0 to 100
    let currentPercentage = 0;
    const targetPercentage = 100;
    const increment = 1;
    const intervalTime = loadSpeed / targetPercentage;

    const percentageInterval = setInterval(() => {
        currentPercentage += increment;
        if (percentageEl) {
            percentageEl.textContent = `${Math.min(currentPercentage, targetPercentage)}%`;
        }
        if (barFillEl) {
            barFillEl.style.width = `${Math.min(currentPercentage, targetPercentage)}%`;
        }

        if (currentPercentage >= targetPercentage) {
            clearInterval(percentageInterval);

            // Hide preloader after reaching 100%
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
            }, 300);
        }
    }, intervalTime);
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
    const webPreloader = document.getElementById('webPreloader');
    if (webPreloader && webPreloader.style.display !== 'none') {
        hidePreloader();
    }
});

// Fallback: Force hide preloader after 6 seconds (max for slow connections)
setTimeout(() => {
    const webPreloader = document.getElementById('webPreloader');
    if (webPreloader && webPreloader.style.display !== 'none') {
        console.warn('Preloader fallback triggered - forcing hide');
        hidePreloader();
    }
}, 6000);

