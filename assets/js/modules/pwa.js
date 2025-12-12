/**
 * PWA Module
 * Handles Progressive Web App installation and management
 * Extracted from script.js lines 3070-3590
 */

// State
let deferredPrompt = null;

// DOM Elements
const installAppGroup = document.getElementById('installAppGroup');
const installAppBtn = document.getElementById('installAppBtn');
const iosInstallInstructions = document.getElementById('iosInstallInstructions');

// Check if iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

/**
 * Check if app is installed (standalone mode)
 */
function checkIsStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

/**
 * Track install event for analytics
 */
function trackInstallEvent(outcome, errorMessage = null) {
    try {
        // Google Analytics 4 (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: outcome,
                value: outcome === 'accepted' ? 1 : 0
            });
        }

        console.log(`[Analytics] PWA Install: ${outcome}`, errorMessage ? `Error: ${errorMessage}` : '');

        // Store in localStorage
        const installAttempts = JSON.parse(localStorage.getItem('installAttempts') || '[]');
        installAttempts.push({
            timestamp: new Date().toISOString(),
            outcome: outcome,
            error: errorMessage
        });
        localStorage.setItem('installAttempts', JSON.stringify(installAttempts.slice(-10)));
    } catch (e) {
        console.warn('Analytics tracking failed:', e);
    }
}

/**
 * Show install animation
 */
function showInstallAnimation() {
    if (!installAppBtn) return;

    const btnTitle = installAppBtn.querySelector('.theme-btn-title');
    if (!btnTitle) return;

    // Create progress elements
    const progressBar = document.createElement('div');
    progressBar.className = 'install-progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'install-progress-fill';

    const progressText = document.createElement('div');
    progressText.className = 'install-progress-text';
    progressText.textContent = '0%';

    progressBar.appendChild(progressFill);

    const originalContent = btnTitle.textContent;

    btnTitle.textContent = '';
    btnTitle.appendChild(progressText);
    installAppBtn.appendChild(progressBar);
    installAppBtn.style.position = 'relative';
    installAppBtn.style.overflow = 'hidden';

    // Animate progress
    let progress = 0;
    const duration = 3000;
    const steps = 60;
    const increment = 100 / steps;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            progressText.textContent = '100%';
            progressFill.style.width = '100%';

            setTimeout(() => {
                progressText.textContent = 'Installed ✓';
                progressFill.style.background = 'linear-gradient(135deg, #10b981, #059669)';

                setTimeout(() => {
                    btnTitle.textContent = originalContent;
                    progressBar.remove();
                    updateInstallButton();
                }, 2000);
            }, 500);
        } else {
            progressText.textContent = Math.round(progress) + '%';
            progressFill.style.width = progress + '%';
        }
    }, stepDuration);
}

/**
 * Show retry option
 */
function showRetryOption() {
    if (!installAppBtn) return;

    const btnTitle = installAppBtn.querySelector('.theme-btn-title');
    if (!btnTitle) return;

    btnTitle.textContent = 'Install Dismissed';
    installAppBtn.style.opacity = '0.7';

    setTimeout(() => {
        btnTitle.textContent = 'Retry Install';
        installAppBtn.style.opacity = '1';

        installAppBtn.addEventListener('click', () => {
            if (!deferredPrompt) {
                showRefreshPrompt();
            }
        }, { once: true });
    }, 3000);
}

/**
 * Show refresh prompt
 */
function showRefreshPrompt() {
    if (!installAppBtn) return;

    const btnTitle = installAppBtn.querySelector('.theme-btn-title');
    if (!btnTitle) return;

    btnTitle.textContent = 'Refresh to Retry';

    installAppBtn.addEventListener('click', () => {
        location.reload();
    }, { once: true });
}

/**
 * Show install error
 */
function showInstallError() {
    if (!installAppBtn) return;

    const btnTitle = installAppBtn.querySelector('.theme-btn-title');
    if (!btnTitle) return;

    btnTitle.textContent = 'Install Failed ✕';
    installAppBtn.style.opacity = '0.6';
    installAppBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

    setTimeout(() => {
        btnTitle.textContent = 'Retry Install';
        installAppBtn.style.opacity = '1';
        installAppBtn.style.background = '';

        installAppBtn.addEventListener('click', () => {
            location.reload();
        }, { once: true });
    }, 3000);
}

/**
 * Update install button state
 */
export function updateInstallButton() {
    if (!installAppBtn) return;

    const btnTitle = installAppBtn.querySelector('.theme-btn-title');
    if (!btnTitle) return;

    const isCurrentlyInstalled = checkIsStandalone();

    if (isCurrentlyInstalled) {
        btnTitle.textContent = 'App Already Installed ✓';
        installAppBtn.style.opacity = '0.6';
        installAppBtn.style.cursor = 'not-allowed';
        installAppBtn.disabled = true;
    } else if (isIOS) {
        installAppBtn.style.display = 'flex';
        installAppBtn.style.opacity = '0.6';
        installAppBtn.style.cursor = 'default';
        installAppBtn.disabled = true;
        btnTitle.textContent = 'Follow Instructions Below';
        if (iosInstallInstructions) iosInstallInstructions.style.display = 'block';
    } else if (deferredPrompt) {
        btnTitle.textContent = 'Install App';
        installAppBtn.style.opacity = '1';
        installAppBtn.style.cursor = 'pointer';
        installAppBtn.disabled = false;
    } else {
        btnTitle.textContent = 'Install Not Available';
        installAppBtn.style.opacity = '0.6';
        installAppBtn.style.cursor = 'not-allowed';
        installAppBtn.disabled = true;
    }
}

/**
 * Install PWA function (can be called from anywhere)
 */
export async function installPWA() {
    if (deferredPrompt && !checkIsStandalone()) {
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);

            trackInstallEvent(outcome);

            if (outcome === 'accepted') {
                showInstallAnimation();
            } else {
                showRetryOption();
            }

            deferredPrompt = null;
            updateInstallButton();
        } catch (error) {
            console.error('Install prompt failed:', error);
            showInstallError();
            trackInstallEvent('error', error.message);
        }
    } else if (checkIsStandalone()) {
        console.log('App is already installed');
    } else {
        console.log('Install prompt not available');
    }
}

/**
 * Initialize PWA functionality
 */
export function initPWA() {
    console.log('✅ PWA module initialized');

    // Expose globally for compatibility
    window.updateInstallButton = updateInstallButton;
    window.installPWA = installPWA;

    // Always show install app section
    if (installAppGroup) {
        installAppGroup.style.display = 'block';
        installAppGroup.style.visibility = 'visible';
        installAppGroup.style.opacity = '1';
    }

    // Handle beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        updateInstallButton();
    });

    // Install button click handler
    if (installAppBtn) {
        installAppBtn.addEventListener('click', async () => {
            if (deferredPrompt && !checkIsStandalone()) {
                try {
                    await deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);

                    trackInstallEvent(outcome);

                    if (outcome === 'accepted') {
                        showInstallAnimation();
                    } else {
                        showRetryOption();
                    }

                    deferredPrompt = null;
                    updateInstallButton();
                } catch (error) {
                    console.error('Install prompt failed:', error);
                    showInstallError();
                    trackInstallEvent('error', error.message);
                }
            }
        });
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        updateInstallButton();
    });

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateInstallButton();
        }
    });

    // Initial button state update
    updateInstallButton();

    // Manage install notification banner
    manageInstallNotification();
}

/*
 * Manage install notification banner visibility
 */
function manageInstallNotification() {
    const installPrompt = document.getElementById('installPrompt');
    if (!installPrompt) return;

    const isInstalled = checkIsStandalone();
    const isDesktop = window.innerWidth >= 1024;
    const hasSeenPrompt = localStorage.getItem('pwaPromptDismissed') === 'true';

    // Hide if already installed
    if (isInstalled) {
        installPrompt.style.display = 'none';
        console.log('Install banner hidden: App already installed');
        return;
    }

    // Hide on mobile (only show on desktop)
    if (!isDesktop) {
        installPrompt.style.display = 'none';
        return;
    }

    // Hide if user dismissed it before
    if (hasSeenPrompt) {
        installPrompt.style.display = 'none';
        return;
    }

    // Show notification after a delay if installable
    if (deferredPrompt) {
        setTimeout(() => {
            installPrompt.style.display = 'flex';
            console.log('Install banner shown');
        }, 3000); // Show after 3 seconds
    }
}

/**
 * Close install prompt banner
 */
window.closeInstallPrompt = function () {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.style.display = 'none';
        localStorage.setItem('pwaPromptDismissed', 'true');
        console.log('Install banner dismissed by user');
    }
}

/**
 * Check if PWA is installed
 */
export function isPWAInstalled() {
    return checkIsStandalone();
}

// Export for use in other modules
export { checkIsStandalone, trackInstallEvent };
