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
            updateNightLightIntensity(parseInt(localStorage.getItem('nightLightIntensity') || '50'));
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

    console.log('✅ Settings panel ready');
}

// Export for use in other modules
export { updateNightLightIntensity, updateMobileNightLightBtn };
