/**
 * Theme Module
 * Handles theme switching, persistence, and UI updates
 * Extracted from script.js lines 148-395
 */

// Import utilities
import { createRipple } from './utils.js';

// Module state
let currentTheme = localStorage.getItem('theme') || 'system';
const htmlElement = document.documentElement;
const body = document.body;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Settings Panel Elements (needed for theme management)
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');

/**
 * Update active state of theme buttons in settings panel
 * @param {string} theme - Theme name
 */
function updateActiveThemeBtn(theme) {
    const btns = document.querySelectorAll('.theme-btn');
    if (!btns) return;

    btns.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Create theme transition wave animation
 * @param {string} theme - Target theme
 */
function createThemeTransitionWave(theme) {
    const settingsGear = document.getElementById('settingsGear');
    if (!settingsGear) return;

    const ripple = document.createElement('div');
    const rect = settingsGear.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    ripple.className = 'page-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.setAttribute('data-target-theme', theme);

    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
}

/**
 * Apply theme to the page
 * @param {string} theme - Theme name (system, light, dark, auto)
 * @param {boolean} animate - Whether to animate the transition
 */
export function applyTheme(theme, animate = false) {
    const systemPrefersDark = prefersDark.matches;
    let effectiveTheme = theme;

    if (theme === 'system') {
        effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    } else if (theme === 'auto') {
        const hour = new Date().getHours();
        // Dark mode from 7 PM (19) to 7 AM (7)
        effectiveTheme = (hour >= 19 || hour < 7) ? 'dark' : 'light';
    }

    if (animate) {
        htmlElement.classList.add('theme-transitioning');
        createThemeTransitionWave(effectiveTheme);
    }

    htmlElement.setAttribute('data-theme', effectiveTheme);
    body.classList.toggle('darkmode', effectiveTheme === 'dark');

    // Update theme toggle button
    if (themeToggle) {
        let themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');

        // Remove old icon
        if (themeIcon) {
            themeIcon.remove();
        }

        // Create new icon
        const imgElement = document.createElement('img');
        imgElement.className = 'theme-icon';
        imgElement.alt = 'Theme';

        const scheduleType = localStorage.getItem('scheduleType') || 'fixed';

        if (theme === 'system') {
            imgElement.src = 'assets/icons/system-theme.webp';
            imgElement.alt = 'System Theme';
        } else if (theme === 'auto') {
            imgElement.src = 'assets/icons/custom-theme.webp';
            imgElement.alt = `Schedule Theme (${scheduleType})`;
            imgElement.onerror = function () { this.src = 'assets/icons/system-theme.webp'; };
        } else if (theme === 'light') {
            imgElement.src = 'assets/icons/light-mode.webp';
            imgElement.alt = 'Light Mode';
        } else {
            imgElement.src = 'assets/icons/dark-mode.webp';
            imgElement.alt = 'Dark Mode';
        }

        themeToggle.prepend(imgElement);

        // Update text
        if (themeText) {
            if (theme === 'auto') {
                const scheduleLabels = {
                    'fixed': 'Schedule',
                    'sunrise': 'Sunrise',
                    'custom': 'Custom'
                };
                themeText.textContent = scheduleLabels[scheduleType] || 'Schedule';
            } else {
                themeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
            }
        }
    }

    // Automatic Zoho Logo Switching
    const zohoLogo = document.getElementById('zohoLogo');
    if (zohoLogo) {
        if (effectiveTheme === 'light') {
            zohoLogo.src = 'assets/icons/zoho-dark.webp';
        } else {
            zohoLogo.src = 'assets/icons/zohomail.webp';
        }
    }

    // Sync settings panel buttons
    updateActiveThemeBtn(theme);

    // Save to localStorage
    try {
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    } catch (e) {
        console.warn('Could not save theme preference');
    }

    if (animate) {
        setTimeout(() => {
            htmlElement.classList.remove('theme-transitioning');
        }, 600);
    }
}

/**
 * Get current theme
 * @returns {string} Current theme
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Apply random gradient colors to logo and name
 */
function applyRandomGradient() {
    // Custom vibrant color palette - 12 colors
    const colors = [
        '#ff8c00', // Orange
        '#9b30ff', // Purple
        '#8b4513', // Brown
        '#00bfff', // Cyan (greenish-blue)
        '#ff00ff', // Magenta (purplish-red)
        '#008080', // Teal (dark greenish-blue)
        '#800000', // Maroon (dark brownish-red)
        '#000080', // Navy Blue (very dark blue)
        '#808000', // Olive (dark yellowish-green)
        '#e6e6fa', // Lavender (pale purple)
        '#dc143c', // Crimson (deep red)
        '#40e0d0'  // Turquoise (greenish-blue)
    ];

    // Shuffle colors
    const shuffledColors = shuffleArray(colors);
    const gradient = `linear-gradient(135deg, ${shuffledColors.join(', ')})`;

    // NOTE: Nav logo now uses theme-specific metallic shine (gold/silver)
    // So we DON'T apply random gradient to it anymore

    // Apply to homepage name only
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        nameElement.style.background = gradient;
        nameElement.style.webkitBackgroundClip = 'text';
        nameElement.style.backgroundClip = 'text';
        nameElement.style.webkitTextFillColor = 'transparent';
    }

    console.log('✅ Random gradient applied to name');
}

/**
 * Initialize theme system
 */
export function initTheme() {
    console.log('✅ Theme module initialized');

    // Apply random gradient colors on load
    applyRandomGradient();

    // Expose globally for theme-schedule.js compatibility
    window.applyTheme = applyTheme;

    // Auto Theme Check Interval (every minute)
    setInterval(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'auto') {
            applyTheme('auto', true);
        }
    }, 60000);

    // Initialize theme
    applyTheme(currentTheme);

    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const themes = ['system', 'light', 'dark'];
            const currentIndex = themes.indexOf(currentTheme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            applyTheme(nextTheme, true);
        });
    }

    // Logo click animation (Desktop only)
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', () => {
            if (window.matchMedia('(min-width: 1024px)').matches) {
                navLogo.classList.remove('clicked');
                void navLogo.offsetWidth; // Trigger reflow
                navLogo.classList.add('clicked');
                setTimeout(() => {
                    navLogo.classList.remove('clicked');
                }, 300);
            }
        });
    }

    // Watch for system theme changes
    prefersDark.addEventListener('change', () => {
        if (currentTheme === 'system') {
            applyTheme('system', true);
        }
    });

    // Reapply theme when page becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            const storedTheme = localStorage.getItem('theme') || 'system';
            applyTheme(storedTheme, false);
        }
    });

    // Reapply theme when window regains focus
    window.addEventListener('focus', () => {
        const storedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(storedTheme, false);
    });

    // Theme buttons in settings panel
    const themeBtns = document.querySelectorAll('.theme-btn'); // Query here when DOM is ready
    console.log('🔍 Theme buttons found:', themeBtns.length);
    if (themeBtns && themeBtns.length > 0) {
        themeBtns.forEach((btn, index) => {
            console.log(`🔘 Attaching listener to button ${index + 1}:`, btn.dataset.theme);
            btn.addEventListener('click', function () {
                const theme = this.getAttribute('data-theme');
                console.log('🎯 Theme button clicked:', theme);
                if (theme) {
                    applyTheme(theme, true);
                }
            });
        });
        console.log(`✅ Theme buttons initialized (${themeBtns.length} buttons)`);
    }
}

// Export for use in other modules
export { updateActiveThemeBtn };

