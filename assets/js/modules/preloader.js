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
 * Hide preloader with accurate resource loading tracking
 */
(function() {
    const preloader = document.getElementById('webPreloader');
    if (!preloader) return;

    const percentageEl = preloader.querySelector('.loading-percentage');
    
    // Gather all critical external resources to track actual load status
    const resources = [];
    
    // Stylesheets
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    resources.push(...stylesheets);
    
    // Scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    resources.push(...scripts);
    
    // Images
    const images = Array.from(document.querySelectorAll('img'));
    resources.push(...images);

    const totalResources = resources.length;
    let loadedCount = 0;
    let targetProgress = 0;
    let currentProgress = 0;

    // Smooth animator interval that updates display progress to match actual resource progress
    const animInterval = setInterval(() => {
        if (currentProgress < targetProgress) {
            currentProgress++;
            if (percentageEl) {
                percentageEl.textContent = `${currentProgress}%`;
            }
        }
        
        if (currentProgress >= 100) {
            clearInterval(animInterval);
            
            // Transition screen out
            document.body.classList.add('loaded');
            
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            });

            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 400);
            }, 100);
        }
    }, 8);

    function updateProgress() {
        loadedCount++;
        targetProgress = totalResources > 0 ? Math.round((loadedCount / totalResources) * 100) : 100;
        if (targetProgress > 100) targetProgress = 100;
    }

    if (totalResources === 0) {
        targetProgress = 100;
    } else {
        resources.forEach(res => {
            // Check if already completed (cached)
            if (res.tagName === 'IMG' && res.complete) {
                updateProgress();
            } else {
                res.addEventListener('load', updateProgress);
                res.addEventListener('error', updateProgress); // prevent hangs on missing files
            }
        });
    }

    // Force completion when window finishes loading all assets
    window.addEventListener('load', () => {
        targetProgress = 100;
    });

    // Safety fallback timeout
    setTimeout(() => {
        targetProgress = 100;
    }, 2500);
})();
