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
    function startPreloader() {
        const preloader = document.getElementById('webPreloader') || document.getElementById('preloader');
        if (!preloader) {
            if (!document.body) {
                window.addEventListener('DOMContentLoaded', startPreloader, { once: true });
                return;
            }
            document.body.classList.add('loaded');
            return;
        }

        const percentageEl = preloader.querySelector('.loading-percentage');
        const resources = Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src], img'));
        const totalResources = resources.length;
        let loadedCount = 0;
        let targetProgress = 0;
        let currentProgress = 0;

        const animInterval = setInterval(() => {
            if (currentProgress < targetProgress) {
                currentProgress = Math.min(targetProgress, currentProgress + 25);
                if (percentageEl) {
                    percentageEl.textContent = `${currentProgress}%`;
                }
            }
            
            if (currentProgress >= 100) {
                clearInterval(animInterval);
                if (document.body) document.body.classList.add('loaded');
                
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
                    }, 150);
                }, 30);
            }
        }, 12);

        function updateProgress() {
            loadedCount++;
            targetProgress = totalResources > 0 ? Math.round((loadedCount / totalResources) * 100) : 100;
            if (targetProgress > 100) targetProgress = 100;
        }

        if (totalResources === 0) {
            targetProgress = 100;
        } else {
            resources.forEach(res => {
                const isCached = (res.tagName === 'IMG' && res.complete) ||
                                 (res.tagName === 'LINK' && res.sheet) ||
                                 (res.tagName === 'SCRIPT' && (res.readyState === 'complete' || res.readyState === 'loaded'));
                if (isCached) {
                    updateProgress();
                } else {
                    res.addEventListener('load', updateProgress, { once: true });
                    res.addEventListener('error', updateProgress, { once: true });
                }
            });
        }

        window.addEventListener('load', () => { targetProgress = 100; }, { once: true });
        setTimeout(() => { targetProgress = 100; }, 150);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        if (document.body) {
            startPreloader();
        } else {
            window.addEventListener('DOMContentLoaded', startPreloader, { once: true });
        }
    } else {
        window.addEventListener('DOMContentLoaded', startPreloader, { once: true });
    }
})();
