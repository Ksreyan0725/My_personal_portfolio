/**
 * Settings Module
 * Handles settings panel, night light, notifications, and preferences
 * Extracted from script.js lines 396-782
 */

// Import utilities
import { playNotificationSound, triggerVibration, showNotification } from './utils.js';

// DOM Elements
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const desktopSettingsBtn = document.getElementById('desktopSettingsBtn');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const themeBtns = document.querySelectorAll('.theme-btn');

// Night Light Elements
const nightLightToggle = document.getElementById('nightLightToggle');
const mobileNightLightBtn = document.getElementById('mobileNightLightBtn');
const nightLightIntensitySlider = document.getElementById('nightLightIntensitySlider');
const nightLightIntensityContainer = document.getElementById('nightLightIntensityContainer');

// Notification Elements
const pushToggle = document.getElementById('pushToggle');
const soundToggle = document.getElementById('soundToggle');

/**
 * Toggle settings panel
 */
export function toggleSettings(e) {
    if (settingsPanel && settingsPanel.classList.contains('active')) {
        console.log('Closing settings...');
        closeSettings();
    } else {
        console.log('Opening settings...');
        openSettings(e);
        if (typeof updateInstallButton === 'function') updateInstallButton();
    }
}

/**
 * Open settings panel
 */
export function openSettings(e) {
    console.log('openSettings() called');

    if (!settingsPanel) {
        console.error('Settings panel not found!');
        return;
    }

    // Close sidebar if open
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const isSidebarOpen = sidebarMenu && sidebarMenu.classList.contains('active');

    if (isSidebarOpen) {
        if (sidebarOverlay) sidebarOverlay.click();

        setTimeout(() => {
            settingsPanel.classList.add('active');
            settingsOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
            document.documentElement.classList.add('no-scroll');
        }, 300);
    } else {
        settingsPanel.classList.add('active');
        settingsOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        document.documentElement.classList.add('no-scroll');
    }

    // Update active theme button
    const currentTheme = localStorage.getItem('theme') || 'system';
    if (typeof window.updateActiveThemeBtn === 'function') {
        window.updateActiveThemeBtn(currentTheme);
    }
}

/**
 * Close settings panel
 */
export function closeSettings() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove('active');
    settingsOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
}

/**
 * Update night light intensity
 */
function updateNightLightIntensity(intensity) {
    const overlay = document.getElementById('night-light-overlay');
    if (overlay) {
        const opacity = 0.1 + (intensity / 100) * 0.4;
        overlay.style.backgroundColor = `rgba(255, 160, 0, ${opacity})`;
    }
}

/**
 * Update mobile night light button state
 */
function updateMobileNightLightBtn() {
    if (!mobileNightLightBtn) return;
    const isEnabled = localStorage.getItem('nightLight') === 'true';
    if (isEnabled) {
        mobileNightLightBtn.classList.add('active');
    } else {
        mobileNightLightBtn.classList.remove('active');
    }
    mobileNightLightBtn.classList.remove('disabled');
}

/**
 * Toggle night light
 */
export function toggleNightLight() {
    const wasEnabled = localStorage.getItem('nightLight') === 'true';
    const isEnabled = !wasEnabled;

    localStorage.setItem('nightLight', isEnabled.toString());

    // Update toggle switch UI
    if (nightLightToggle) {
        if (isEnabled) nightLightToggle.classList.add('active');
        else nightLightToggle.classList.remove('active');
    }

    // Update overlay
    let overlay = document.getElementById('night-light-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'night-light-overlay';
        document.body.appendChild(overlay);
    }

    if (isEnabled) {
        overlay.classList.add('active');
        if (nightLightIntensityContainer) nightLightIntensityContainer.classList.add('active');
        if (nightLightIntensitySlider) {
            updateNightLightIntensity(nightLightIntensitySlider.value);
        }
    } else {
        overlay.classList.remove('active');
        if (nightLightIntensityContainer) nightLightIntensityContainer.classList.remove('active');
    }

    updateMobileNightLightBtn();
    showNotification(isEnabled ? 'Night light turned ON' : 'Night light turned OFF');
}

/**
 * Initialize night light feature
 */
function initNightLight() {
    if (nightLightToggle) {
        nightLightToggle.addEventListener('click', toggleNightLight);
        const savedState = localStorage.getItem('nightLight');
        if (savedState === 'true') {
            nightLightToggle.classList.add('active');
            updateNightLightIntensity(parseInt(localStorage.getItem('nightLightIntensity') || '55'));
        }
    }

    if (nightLightIntensitySlider) {
        nightLightIntensitySlider.addEventListener('input', function () {
            const intensity = parseInt(this.value);
            updateNightLightIntensity(intensity);
            localStorage.setItem('nightLightIntensity', intensity.toString());
        });
        const savedIntensity = localStorage.getItem('nightLightIntensity');
        if (savedIntensity) nightLightIntensitySlider.value = savedIntensity;
    }

    if (mobileNightLightBtn) {
        mobileNightLightBtn.addEventListener('click', toggleNightLight);
    }

    updateMobileNightLightBtn();
}

/**
 * Initialize notification toggles
 */
function initNotifications() {
    console.log('Initializing notifications...');
    console.log('pushToggle:', pushToggle);
    console.log('soundToggle:', soundToggle);

    if (pushToggle) {
        console.log('✅ Push toggle found, adding event listener');
        pushToggle.addEventListener('click', function () {
            console.log('Push toggle clicked!');
            const isEnabled = !pushToggle.classList.contains('active');
            if (isEnabled) pushToggle.classList.add('active');
            else pushToggle.classList.remove('active');
            localStorage.setItem('pushEnabled', isEnabled.toString());
            showNotification(isEnabled ? 'Push notifications enabled' : 'Push notifications disabled');
        });
        const savedPush = localStorage.getItem('pushEnabled');
        if (savedPush === 'true' || savedPush === null) {
            pushToggle.classList.add('active');
            localStorage.setItem('pushEnabled', 'true');
        }
    } else {
        console.error('❌ Push toggle NOT found!');
    }

    if (soundToggle) {
        console.log('✅ Sound toggle found, adding event listener');
        soundToggle.addEventListener('click', function () {
            console.log('Sound toggle clicked!');
            const isEnabled = !soundToggle.classList.contains('active');
            if (isEnabled) soundToggle.classList.add('active');
            else soundToggle.classList.remove('active');
            localStorage.setItem('soundEnabled', isEnabled.toString());
            showNotification(isEnabled ? 'Sound enabled' : 'Sound disabled');
        });
        if (localStorage.getItem('soundEnabled') === 'true') soundToggle.classList.add('active');
    } else {
        console.error('❌ Sound toggle NOT found!');
    }
}

/**
 * Initialize swipe to close for settings panel
 * Allows swiping down on the header with smooth tracking and velocity check
 */
function initSwipeToClose() {
    if (!settingsPanel) return;

    const settingsHeader = settingsPanel.querySelector('.settings-header');
    if (!settingsHeader) return;

    let startY = 0;
    let currentY = 0;
    let startTime = 0;
    let isDragging = false;

    // Helper to apply transform
    const setTranslateY = (y) => {
        settingsPanel.style.transform = `translateY(${Math.max(0, y)}px)`;
    };

    settingsHeader.addEventListener('touchstart', (e) => {
        startY = e.changedTouches[0].screenY;
        startTime = Date.now();
        isDragging = true;
        // Disable transition for direct tracking
        settingsPanel.style.transition = 'none';
    }, { passive: true });

    settingsHeader.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.changedTouches[0].screenY;
        const deltaY = currentY - startY;

        // Only allow dragging down
        if (deltaY > 0) {
            setTranslateY(deltaY);
        }
    }, { passive: true });

    settingsHeader.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const endY = e.changedTouches[0].screenY;
        const deltaY = endY - startY;
        const deltaTime = Date.now() - startTime;
        const velocity = Math.abs(deltaY / deltaTime);

        // Thresholds
        const distanceThreshold = settingsPanel.offsetHeight * 0.3; // 30% height
        const velocityThreshold = 0.5; // px/ms

        // Use transform transition for smooth snap
        settingsPanel.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

        // Close if dragged far enough OR flicked fast enough
        if (deltaY > 0 && (deltaY > distanceThreshold || velocity > velocityThreshold)) {
            console.log(`Swipe to close triggered (Velocity: ${velocity.toFixed(2)})`);

            // Animate fully down (slide out)
            setTranslateY(settingsPanel.offsetHeight);

            // Wait for animation to finish, then actually close
            setTimeout(() => {
                closeSettings();
                settingsPanel.style.transform = '';
                settingsPanel.style.transition = ''; // Revert to CSS default
            }, 300);
        } else {
            // Revert (bounce back up)
            setTranslateY(0);
            setTimeout(() => {
                settingsPanel.style.transform = '';
                settingsPanel.style.transition = ''; // Revert to CSS default
            }, 300);
        }
    }, { passive: true });
}

/**
 * Initialize settings panel
 */
export function initSettings() {
    console.log('✅ Settings module initialized');

    // Expose globally for compatibility
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.toggleSettings = toggleSettings;
    window.handleMobileNightLight = toggleNightLight;
    window.handleNightLightToggle = toggleNightLight;

    // Settings panel event listeners
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', function (e) {
            openSettings(e);
        });
    }

    if (desktopSettingsBtn) {
        desktopSettingsBtn.addEventListener('click', function (e) {
            toggleSettings(e);
        });
    }

    if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', closeSettings);
    }

    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', closeSettings);
    }

    // Initialize night light
    initNightLight();

    // Initialize notifications
    initNotifications();

    // Initialize swipe to close
    initSwipeToClose();

    // Close settings panel on Escape key press
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (settingsPanel && settingsPanel.classList.contains('active')) {
                closeSettings();
            }
        }
    });

    console.log('✅ Settings panel ready');
}

/**
 * Check for updates and apply them
 * Called by the 7-click Easter egg in version info
 */
export function checkForUpdates() {
    performUpdateCheck();
}

function performUpdateCheck() {
    console.log('🔄 Checking for updates...');

    showNotification('Checking for updates...');

    // Check if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Send message to service worker to check for updates
        navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_FOR_UPDATES'
        });

        // Listen for response
        navigator.serviceWorker.addEventListener('message', function handleUpdateMessage(event) {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                showNotification('Update found! Applying...');

                // Wait a moment then reload to apply update
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

                // Remove listener after handling
                navigator.serviceWorker.removeEventListener('message', handleUpdateMessage);
            } else if (event.data && event.data.type === 'NO_UPDATE') {
                showNotification('You are on the latest version!');
                navigator.serviceWorker.removeEventListener('message', handleUpdateMessage);
            }
        });

        // Fallback: If no response in 3 seconds, try manual update check
        setTimeout(() => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration) {
                        registration.update().then(() => {
                            console.log('✅ Manual update check completed');
                            showNotification('Update check complete');
                        });
                    }
                });
            }
        }, 3000);
    } else {
        // No service worker, just reload
        showNotification('Refreshing page...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Make globally available
window.checkForUpdates = checkForUpdates;

// Export for use in other modules
export { updateNightLightIntensity, updateMobileNightLightBtn };

