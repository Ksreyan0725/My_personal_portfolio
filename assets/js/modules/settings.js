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
        // Increased intensity range (20% to 75%) and warmer color
        const opacity = 0.2 + (intensity / 100) * 0.55;
        overlay.style.backgroundColor = `rgba(255, 140, 0, ${opacity})`;
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

            // Re-create overlay if missing (fixes reload persistence)
            let overlay = document.getElementById('night-light-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'night-light-overlay';
                document.body.appendChild(overlay);
            }
            overlay.classList.add('active');

            // Sync other UI elements
            if (typeof mobileNightLightBtn !== 'undefined' && mobileNightLightBtn) {
                mobileNightLightBtn.classList.add('active');
            }
            if (typeof nightLightIntensityContainer !== 'undefined' && nightLightIntensityContainer) {
                nightLightIntensityContainer.classList.add('active');
            }

            updateNightLightIntensity(parseInt(localStorage.getItem('nightLightIntensity') || '50'));
        }
    }

    if (nightLightIntensitySlider) {
        // Function to update slider fill background (Android style)
        // Function to update slider fill background (Android style) with dots
        const updateSliderVisuals = () => {
            const min = nightLightIntensitySlider.min ? parseInt(nightLightIntensitySlider.min) : 0;
            const max = nightLightIntensitySlider.max ? parseInt(nightLightIntensitySlider.max) : 100;
            const val = nightLightIntensitySlider.value;
            const percentage = ((val - min) / (max - min)) * 100;

            // 1. Orange Fill (Top) - stops at percentage
            // 2. Snap Dots (Middle) - 2px dots every 5%
            // 3. Track (Bottom) - Gray background
            nightLightIntensitySlider.style.background = `
                linear-gradient(to right, #ffa000 0%, #ffa000 ${percentage}%, transparent ${percentage}%, transparent 100%),
                repeating-linear-gradient(to right, #808080 0, #808080 2px, transparent 2px, transparent 5%),
                var(--border)
            `;
        };

        nightLightIntensitySlider.addEventListener('input', function () {
            const intensity = parseInt(this.value);
            updateNightLightIntensity(intensity);
            localStorage.setItem('nightLightIntensity', intensity.toString());
            updateSliderVisuals();
        });

        const savedIntensity = localStorage.getItem('nightLightIntensity');
        if (savedIntensity) {
            nightLightIntensitySlider.value = savedIntensity;
        } else {
            // Default to 50 if no save found (matches HTML)
            nightLightIntensitySlider.value = 50;
        }

        // Initialize visuals
        updateSliderVisuals();
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
 * Allows swiping down on the header OR the body (when scrolled to top)
 */
function initSwipeToClose() {
    if (!settingsPanel) return;

    let startY = 0;
    let currentY = 0;
    let startTime = 0;
    let isDragging = false;

    // Track content scroll for conditional swipe
    const settingsContent = settingsPanel.querySelector('.settings-content');

    // Helper to apply transform
    const setTranslateY = (y) => {
        settingsPanel.style.transform = `translateY(${Math.max(0, y)}px)`;
    };

    const handleTouchStart = (e) => {
        const isHeader = e.target.closest('.settings-header');

        // If touching content, only allow drag start if we are at the top
        if (!isHeader) {
            if (settingsContent && settingsContent.scrollTop > 0) {
                return; // Content is scrolled down, let user scroll up naturally
            }
        }

        startY = e.touches[0].clientY;
        startTime = Date.now();
        isDragging = true;

        // Disable transition for direct following
        settingsPanel.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // If swiping UP (negative delta), we cancel drag to allow native scroll
        if (deltaY < 0) {
            isDragging = false;
            settingsPanel.style.transform = '';
            return;
        }

        // If swiping DOWN, hijack the event
        if (deltaY > 0) {
            if (e.cancelable) e.preventDefault();
            setTranslateY(deltaY);
        }
    };

    const handleTouchEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const deltaY = currentY - startY;
        const deltaTime = Date.now() - startTime;
        const velocity = Math.abs(deltaY / deltaTime);

        // Restore transition for smooth close/bounce
        settingsPanel.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

        // Close thresholds: 
        // 1. Dragged more than 100px
        // 2. Fast flick (>0.5 px/ms)
        if (deltaY > 100 || (deltaY > 50 && velocity > 0.5)) {
            // Animate fully down
            setTranslateY(settingsPanel.offsetHeight);

            // Wait for animation to finish, then actually close
            setTimeout(() => {
                closeSettings();
                settingsPanel.style.transform = '';
                settingsPanel.style.transition = '';
            }, 300);
        } else {
            // Revert (bounce back up)
            setTranslateY(0);
            setTimeout(() => {
                settingsPanel.style.transform = '';
                settingsPanel.style.transition = '';
            }, 300);
        }
    };

    // Attach to settingsPanel to cover whole area
    settingsPanel.addEventListener('touchstart', handleTouchStart, { passive: true });
    // Passive: false for touchmove to allow preventing native scroll/refresh
    settingsPanel.addEventListener('touchmove', handleTouchMove, { passive: false });
    settingsPanel.addEventListener('touchend', handleTouchEnd);
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

    // Close settings panel when clicking outside on desktop (≥900px)
    document.addEventListener('click', function (e) {
        // Only on desktop screens
        if (window.innerWidth < 900) return;

        // Check if settings panel is open
        if (!settingsPanel || !settingsPanel.classList.contains('active')) return;

        // Check if click is outside the settings panel and not on the settings button
        const isClickInsidePanel = settingsPanel.contains(e.target);
        const isClickOnButton = desktopSettingsBtn && desktopSettingsBtn.contains(e.target);

        if (!isClickInsidePanel && !isClickOnButton) {
            closeSettings();
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

