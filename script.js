// Modern Portfolio JavaScript
console.log("******************************JAVASCRIPT_ACTIVATED**************************************");
// Detect touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Early theme initialization (moved from inline <head> script) 
// Sets `data-theme` immediately and toggles `body.darkmode` as soon as possible
(function () {
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
        // silent fail - localStorage may be unavailable in some contexts
        console.warn('Early theme init failed:', e && e.message);
    }
})();
const initApp = () => {
    console.log('App Initializing...');
    const htmlElement = document.documentElement;
    const body = document.body;
    // Default to 'system' if no preference is saved
    let currentTheme = localStorage.getItem('theme') || 'system';
    // Allowed mailto recipients (enforced site-wide)
    const ALLOWED_MAILTO = new Set(['sreyanpattanayak@zohomail.com', 'sreyanpattanayak246@gmail.com']);

    // Add touch device class if needed
    if (isTouchDevice) {
        document.documentElement.classList.add('touch-device');
    }

    /* ==================== Theme Management ==================== */
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Settings Panel Elements (Moved up for availability)
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const nightLightToggle = document.getElementById('nightLightToggle');
    const themeBtns = document.querySelectorAll('.theme-btn');

    // Update active state of theme buttons in settings panel
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

    function openSettings() {
        if (!settingsPanel) return;
        settingsPanel.classList.add('active');
        settingsOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        document.documentElement.classList.add('no-scroll');

        // Close sidebar if open
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay && getComputedStyle(sidebarOverlay).opacity !== '0') {
            sidebarOverlay.click();
        }

        // Update active theme button
        const currentTheme = localStorage.getItem('theme') || 'system';
        updateActiveThemeBtn(currentTheme);
    }
    window.openSettings = openSettings; // Expose immediately

    function closeSettings() {
        if (!settingsPanel) return;
        settingsPanel.classList.remove('active');
        settingsOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
    }
    window.closeSettings = closeSettings; // Expose immediately

    // Theme application function
    function applyTheme(theme, animate = false) {
        const systemPrefersDark = prefersDark.matches;
        const effectiveTheme = theme === 'system' ?
            (systemPrefersDark ? 'dark' : 'light') : theme;

        if (animate) {
            htmlElement.classList.add('theme-transitioning');
            createThemeTransitionWave(effectiveTheme);
        }

        htmlElement.setAttribute('data-theme', effectiveTheme);
        body.classList.toggle('darkmode', effectiveTheme === 'dark');

        // Update button text if it exists
        if (themeToggle) {
            let themeIcon = themeToggle.querySelector('.theme-icon');
            const themeText = themeToggle.querySelector('.theme-text');

            // Always update icon
            if (themeIcon) {
                themeIcon.remove();
            }

            // Create img element for all modes with appropriate PNG icon
            const imgElement = document.createElement('img');
            imgElement.className = 'theme-icon';
            imgElement.alt = 'Theme';

            // Set the appropriate icon based on theme
            const timestamp = new Date().getTime();
            if (theme === 'system') {
                imgElement.src = `Assets/Images.icons/system-theme.png?v=${timestamp}`;
                imgElement.alt = 'System Theme';
            } else if (theme === 'light') {
                imgElement.src = `Assets/Images.icons/light-mode.png?v=${timestamp}`;
                imgElement.alt = 'Light Mode';
            } else { // dark
                imgElement.src = `Assets/Images.icons/dark-mode.png?v=${timestamp}`;
                imgElement.alt = 'Dark Mode';
            }

            themeToggle.prepend(imgElement); // Add as first child

            // Update text if it exists
            if (themeText) {
                themeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
            }
        }

        // Automatic Zoho Logo Switching
        const zohoLogo = document.getElementById('zohoLogo');
        if (zohoLogo) {
            // Light mode -> Dark version (zoho-dark.png)
            // Dark mode -> White version (zohomail.png)
            if (effectiveTheme === 'light') {
                zohoLogo.src = 'Assets/Images.icons/zoho-dark.png';
            } else {
                zohoLogo.src = 'Assets/Images.icons/zohomail.png';
            }
        }

        // Sync settings panel buttons
        updateActiveThemeBtn(theme);

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

    // Initialize theme - use stored preference or default to 'dark'
    // If no preference, follow system; otherwise, use saved preference
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
                navLogo.classList.remove('clicked'); // Reset to allow re-trigger
                void navLogo.offsetWidth; // Trigger reflow
                navLogo.classList.add('clicked');
                setTimeout(() => {
                    navLogo.classList.remove('clicked');
                }, 300); // Match animation duration
            }
        });
    }

    // Watch for system theme changes
    prefersDark.addEventListener('change', () => {
        if (currentTheme === 'system') {
            applyTheme('system', true);
        }
    });

    // Reapply theme when page becomes visible (handles browser minimize/restore, tab switching)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            const storedTheme = localStorage.getItem('theme') || 'system';
            applyTheme(storedTheme, false);
        }
    });

    // Reapply theme when window regains focus (handles browser reopen)
    window.addEventListener('focus', () => {
        const storedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(storedTheme, false);
    });

    /* ==================== Settings Panel Logic (Integrated) ==================== */
    // Theme Buttons
    if (themeBtns) {
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                applyTheme(theme, true);
                updateActiveThemeBtn(theme);
            });
        });
    }

    // Night Light Logic
    const mobileNightLightBtn = document.getElementById('mobileNightLightBtn');
    const notificationBanner = document.getElementById('nightLightNotification');
    const notificationMessage = document.getElementById('notificationMessage');
    let notificationTimeout;

    function showNotification(message) {
        if (!notificationBanner || !notificationMessage) return;
        notificationMessage.textContent = message;
        notificationBanner.classList.add('active');

        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            notificationBanner.classList.remove('active');
        }, 3500);
    }

    // Swipe to dismiss notification
    if (notificationBanner) {
        let touchStartX = 0;
        notificationBanner.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        notificationBanner.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].clientX;
            if (Math.abs(touchEndX - touchStartX) > 50) {
                notificationBanner.classList.remove('active');
            }
        }, { passive: true });
    }

    function updateMobileNightLightBtn() {
        if (!mobileNightLightBtn) return;
        const isEnabled = localStorage.getItem('nightLight') === 'true';
        if (isEnabled) {
            mobileNightLightBtn.classList.add('active');
        } else {
            mobileNightLightBtn.classList.remove('active');
        }
        mobileNightLightBtn.classList.remove('disabled'); // Ensure enabled
    }

    function toggleNightLight() {
        if (!nightLightToggle) return;
        nightLightToggle.classList.toggle('active');
        const isEnabled = nightLightToggle.classList.contains('active');

        let overlay = document.getElementById('night-light-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'night-light-overlay';
            document.body.appendChild(overlay);
        }

        if (isEnabled) {
            overlay.classList.add('active');
            localStorage.setItem('nightLight', 'true');
        } else {
            overlay.classList.remove('active');
            localStorage.setItem('nightLight', 'false');
        }

        updateMobileNightLightBtn();
        showNotification(isEnabled ? 'Night light turned ON' : 'Night light turned OFF');
    }

    if (nightLightToggle) {
        nightLightToggle.addEventListener('click', toggleNightLight);

        // Initialize from storage
        if (localStorage.getItem('nightLight') === 'true') {
            nightLightToggle.classList.add('active');
            let overlay = document.getElementById('night-light-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'night-light-overlay';
                document.body.appendChild(overlay);
            }
            overlay.classList.add('active');
        }
    }

    // Expose for HTML onclick
    window.handleMobileNightLight = function () {
        if (nightLightToggle) toggleNightLight();
    };

    // Initial update
    updateMobileNightLightBtn();

    // Other Toggles (Push & Sound)
    const pushToggle = document.getElementById('pushToggle');
    const soundToggle = document.getElementById('soundToggle');

    if (pushToggle) {
        pushToggle.addEventListener('click', () => {
            pushToggle.classList.toggle('active');
            localStorage.setItem('pushEnabled', pushToggle.classList.contains('active'));
        });
        if (localStorage.getItem('pushEnabled') === 'true') pushToggle.classList.add('active');
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundToggle.classList.toggle('active');
            localStorage.setItem('soundEnabled', soundToggle.classList.contains('active'));
        });
        if (localStorage.getItem('soundEnabled') === 'true') soundToggle.classList.add('active');
    }


    /* ==================== Ripple Animation Functions ==================== */
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Theme transition wave
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

    /* ==================== Mobile Navigation ==================== */
    /* ==================== Sophisticated Sidebar Swipe Animation ==================== */

    /**
     * MobileSidebarSwipe - Gesture-based sidebar swipe handler
     * 
     * Features:
     * - Swipe gesture detection for sidebar menu
     * - Physics-based easing for natural motion
     * - Mobile-only (max-width: 768px)
     * - Configurable options for sensitivity
     */
    class MobileSidebarSwipe {
        constructor(options = {}) {
            // Configuration with defaults
            this.config = {
                // Swipe sensitivity (lower = more sensitive)
                swipeThreshold: 30, // pixels to trigger open (reduced for easier swiping)
                velocityThreshold: 0.3, // velocity to trigger quick open

                // Visual options
                glowColor: options.glowColor || '#0ea5e9', // sky-blue
                maxGlowIntensity: options.maxGlowIntensity || 0.6,

                // Animation durations (ms)
                transitionDuration: 280,
                indicatorFadeDuration: 200,

                // Easing functions
                easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
                easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

                // Mobile breakpoint
                mobileMaxWidth: 768,

                ...options
            };

            // DOM elements
            this.sidebar = document.getElementById('sidebarMenu');
            this.overlay = document.getElementById('sidebarOverlay');
            this.menuIcon = document.getElementById('menuIcon');
            this.closeBtn = document.getElementById('sidebarClose');
            this.pageWrapper = document.getElementById('pageWrapper');
            this.navbar = document.getElementById('navbar');
            this.noticeBanner = document.querySelector('.notice-banner');

            // State
            this.isOpen = false;
            this.isSwiping = false;
            this.startX = 0;
            this.startY = 0;
            this.currentX = 0;
            this.currentY = 0;
            this.lastX = 0;
            this.lastTime = 0;
            this.velocity = 0;
            this.sidebarWidth = 260;

            // Check if we're on mobile
            this.isMobile = () => window.innerWidth <= this.config.mobileMaxWidth;

            this.init();
        }

        init() {
            if (!this.sidebar || !this.overlay) {
                console.warn('[MobileSidebarSwipe] Sidebar elements not found');
                return;
            }

            // Swipe indicator removed

            // Get sidebar width
            this.updateSidebarWidth();

            // Bind events
            this.bindEvents();

            // Handle window resize
            window.addEventListener('resize', () => this.handleResize());
        }



        bindEvents() {
            // Touch events for swipe gesture
            document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

            // Click handlers
            if (this.menuIcon) {
                this.menuIcon.addEventListener('click', () => {
                    if (this.isOpen) {
                        this.close();
                    } else {
                        this.open();
                    }
                });
            }
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.close());
            }

            // Close on navigation link click
            const navLinks = this.sidebar?.querySelectorAll('a');
            navLinks?.forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(() => this.close(), 150);
                });
            });
        }

        handleTouchStart(e) {
            // Only handle on mobile
            if (!this.isMobile()) return;

            // Disable swipe if settings panel is open (no-scroll class)
            if (document.body.classList.contains('no-scroll')) return;

            const touch = e.touches[0];
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.lastX = touch.clientX;
            this.lastTime = Date.now();

            // Allow swipe from anywhere on screen (like social media apps)
            // Start tracking immediately
            this.isSwiping = true;

            // Disable transition for 1:1 tracking
            if (this.sidebar) {
                this.sidebar.style.transition = 'none';
            }
            if (this.pageWrapper) this.pageWrapper.style.transition = 'none';
            if (this.navbar) this.navbar.style.transition = 'none';
            if (this.noticeBanner) this.noticeBanner.style.transition = 'none';
        }

        handleTouchMove(e) {
            if (!this.isSwiping || !this.isMobile()) return;

            const touch = e.touches[0];
            this.currentX = touch.clientX;
            this.currentY = touch.clientY;

            const deltaX = this.currentX - this.startX;
            const deltaY = this.currentY - this.startY;

            // Calculate velocity
            const now = Date.now();
            const timeDelta = now - this.lastTime;
            if (timeDelta > 0) {
                this.velocity = (this.currentX - this.lastX) / timeDelta;
            }
            this.lastX = this.currentX;
            this.lastTime = now;

            // Only handle horizontal swipes (prevent conflict with vertical scroll)
            // Stricter check: require swipe to be clearly horizontal (more X than Y)
            const isHorizontalEnough = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

            if (isHorizontalEnough) {
                e.preventDefault();

                if (!this.isOpen && deltaX > 0) {
                    // Opening swipe (right direction)
                    const progress = Math.min(deltaX / this.sidebarWidth, 1);
                    this.updateSwipeProgress(progress, deltaX);
                } else if (this.isOpen && deltaX < 0) {
                    // Closing swipe (left direction)
                    const progress = Math.max(1 + (deltaX / this.sidebarWidth), 0);
                    this.updateSwipeProgress(progress, deltaX);
                }
            }
        }

        handleTouchEnd(e) {
            if (!this.isSwiping || !this.isMobile()) return;

            // Re-enable transition for the snap animation
            if (this.sidebar) {
                this.sidebar.style.transition = '';
            }
            if (this.pageWrapper) this.pageWrapper.style.transition = '';
            if (this.navbar) this.navbar.style.transition = '';
            if (this.noticeBanner) this.noticeBanner.style.transition = '';

            const deltaX = this.currentX - this.startX;
            const deltaY = this.currentY - this.startY;

            // Only process if it's horizontal enough (same check as touchmove)
            const isHorizontalEnough = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

            if (isHorizontalEnough) {
                const progress = !this.isOpen
                    ? Math.min(deltaX / this.sidebarWidth, 1)
                    : Math.max(1 + (deltaX / this.sidebarWidth), 0);

                // Determine if we should open/close based on distance and velocity
                const shouldToggle =
                    progress > 0.25 || // More than 25% swiped (easier to trigger)
                    Math.abs(this.velocity) > this.config.velocityThreshold; // Fast swipe

                if (!this.isOpen && deltaX > this.config.swipeThreshold && shouldToggle) {
                    this.open();
                } else if (this.isOpen && deltaX < -this.config.swipeThreshold && shouldToggle) {
                    this.close();
                } else {
                    // Reset to current state
                    this.resetSwipe();
                }
            }

            this.isSwiping = false;

            // Reset transform
            if (this.sidebar) {
                this.sidebar.style.transform = '';
                this.sidebar.style.boxShadow = '';
            }
            if (this.pageWrapper) this.pageWrapper.style.transform = '';
            if (this.navbar) this.navbar.style.transform = '';
            if (this.noticeBanner) this.noticeBanner.style.transform = '';
        }

        updateSwipeProgress(progress, deltaX) {
            // Clamp progress
            progress = Math.max(0, Math.min(1, progress));

            // Calculate dynamic values based on progress and velocity
            const absVelocity = Math.abs(this.velocity);
            const velocityFactor = Math.min(absVelocity * 2, 1);

            // Update sidebar position
            if (this.sidebar) {
                if (!this.isOpen) {
                    // Opening: translate from -100% to 0%
                    const translateX = -100 + (progress * 100);
                    this.sidebar.style.transform = `translateX(${translateX}%)`;
                } else {
                    // Closing: translate from 0% based on drag
                    const translateX = (deltaX / this.sidebarWidth) * 100;
                    this.sidebar.style.transform = `translateX(${translateX}%)`;
                }

                // Dynamic glow effect based on progress and velocity
                const glowIntensity = progress * this.config.maxGlowIntensity + (velocityFactor * 0.2);
                const glowBlur = 10 + (progress * 15) + (velocityFactor * 10);
                const glowColor = this.hexToRgba(this.config.glowColor, glowIntensity);

                this.sidebar.style.borderRight = `2px solid ${glowColor}`;
                this.sidebar.style.boxShadow = `0 0 ${glowBlur}px ${glowColor}`;
            }

            // Update pageWrapper, navbar, and banner position - slide right in sync with sidebar
            const updateTransform = (element) => {
                if (!element) return;
                if (!this.isOpen) {
                    // Opening: slide right from 0 to sidebarWidth
                    const translateX = progress * this.sidebarWidth;
                    element.style.transform = `translateX(${translateX}px)`;
                } else {
                    // Closing: slide left back to 0
                    const translateX = this.sidebarWidth + deltaX;
                    element.style.transform = `translateX(${translateX}px)`;
                }
            };

            updateTransform(this.pageWrapper);
            updateTransform(this.navbar);
            updateTransform(this.noticeBanner);

            // Update overlay opacity
            if (this.overlay) {
                this.overlay.style.opacity = progress * 0.5;
                this.overlay.style.pointerEvents = progress > 0 ? 'auto' : 'none';
            }


        }



        open() {
            if (this.isOpen) return;

            this.isOpen = true;
            this.sidebar?.classList.add('active');
            this.overlay?.classList.add('active');
            document.body.classList.add('sidebar-open');

            // Animate with physics-based easing
            this.animateOpen();
        }

        close() {
            if (!this.isOpen) return;

            this.isOpen = false;
            this.sidebar?.classList.remove('active');
            this.overlay?.classList.remove('active');
            document.body.classList.remove('sidebar-open');

            // Animate with physics-based easing
            this.animateClose();
        }

        animateOpen() {
            // CSS handles the animation with custom cubic-bezier
            // Additional glow effect on open
            if (this.sidebar) {
                setTimeout(() => {
                    const glowColor = this.hexToRgba(this.config.glowColor, this.config.maxGlowIntensity);
                    this.sidebar.style.borderRight = `2px solid ${glowColor}`;
                    this.sidebar.style.boxShadow = `0 0 25px ${glowColor}`;
                }, 50);
            }
        }

        animateClose() {
            // Reset glow on close
            if (this.sidebar) {
                this.sidebar.style.borderRight = '1px solid transparent';
                this.sidebar.style.boxShadow = '';
            }
        }

        resetSwipe() {
            // Animate back to current state
            if (this.sidebar) {
                this.sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.sidebar.style.transform = this.isOpen ? 'translateX(0)' : 'translateX(-100%)';

                setTimeout(() => {
                    this.sidebar.style.transition = '';
                }, 300);
            }

            const resetTransform = (element) => {
                if (!element) return;
                element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.transform = this.isOpen ? `translateX(${this.sidebarWidth}px)` : 'translateX(0)';
                setTimeout(() => {
                    element.style.transition = '';
                }, 300);
            };

            resetTransform(this.pageWrapper);
            resetTransform(this.navbar);
            resetTransform(this.noticeBanner);

            if (this.overlay) {
                this.overlay.style.opacity = this.isOpen ? '1' : '0';
            }
        }

        updateSidebarWidth() {
            if (this.sidebar) {
                this.sidebarWidth = this.sidebar.offsetWidth || 260;
                // Set CSS variable for use in CSS transitions
                document.documentElement.style.setProperty('--sidebar-width', `${this.sidebarWidth}px`);
            }
        }

        handleResize() {
            this.updateSidebarWidth();

            // Close sidebar if switching to desktop
            if (!this.isMobile() && this.isOpen) {
                this.close();
            }
        }

        // Utility: Convert hex color to rgba
        hexToRgba(hex, alpha = 1) {
            // Remove # if present
            hex = hex.replace('#', '');

            // Parse hex to RGB
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }

    // Initialize the mobile sidebar swipe system
    // Always initialize, let the class handle mobile detection internally
    const sidebarSwipe = new MobileSidebarSwipe({
        glowColor: '#0ea5e9', // Sky blue - matches accent
        maxGlowIntensity: 0.6,
        swipeThreshold: 30, // Lower threshold for easier swiping
        velocityThreshold: 0.3
    });

    // Note: All click and touch handlers are managed by the MobileSidebarSwipe class
    // No duplicate handlers needed here

    /* ==================== Search Modal Functionality ==================== */
    const mobileSearchIcon = document.getElementById('mobileSearchIcon');
    const searchModal = document.getElementById('searchModal');
    const searchModalClose = document.getElementById('searchModalClose');
    const searchModalOverlay = document.getElementById('searchModalOverlay');
    const searchModalInput = document.getElementById('searchModalInput');
    const searchModalButton = document.getElementById('searchModalButton');
    const searchResults = document.getElementById('searchResults');
    let currentResultIndex = -1; // for keyboard navigation
    const RECENT_SEARCHES_KEY = 'recentSearchesV1';



    // Event listeners for search modal
    if (mobileSearchIcon) {
        mobileSearchIcon.addEventListener('click', () => {
            openSearchModal();
        });
    }

    // Tablet Search Button Handler
    const tabletSearchBtn = document.getElementById('tabletSearchBtn');
    if (tabletSearchBtn) {
        tabletSearchBtn.addEventListener('click', () => {
            openSearchModal();
        });
    }

    // Searchable content from the page
    let searchableContent = [
        { title: 'Home', description: 'Main page with profile and introduction', link: '#home' },
        { title: 'Education', description: 'BCA, Class 12, Class 10 details', link: '#education' },
        { title: 'Projects', description: 'CodePilot AI IDE, Research projects', link: '#projects' },
        { title: 'Certifications', description: 'Professional certifications and courses', link: '#certifications' },
        { title: 'Skills', description: 'Programming languages and technical skills', link: '#skills' },
        { title: 'Contact', description: 'Get in touch via email or social media', link: 'contact.html' },

        { title: 'Resume', description: 'Download resume PDF file', link: 'Assets/Docs/Kumar_Sreyan_Pattanayak_Resume.pdf' },
        { title: 'Download Resume', description: 'Download Kumar Sreyan Pattanayak resume PDF', link: 'Assets/Docs/Kumar_Sreyan_Pattanayak_Resume.pdf' },
        { title: 'CV', description: 'Curriculum Vitae - Resume PDF download', link: 'Assets/Docs/Kumar_Sreyan_Pattanayak_Resume.pdf' },
        { title: 'PDF', description: 'Resume in PDF format for download', link: 'Assets/Docs/Kumar_Sreyan_Pattanayak_Resume.pdf' },
        { title: 'Python', description: 'Programming language - Python development', link: '#skills' },
        { title: 'JavaScript', description: 'Programming language - Web development', link: '#skills' },
        { title: 'Web Development', description: 'HTML, CSS, JavaScript, React', link: '#skills' },
        { title: 'CodePilot AI IDE', description: 'AI-powered development environment project', link: '#projects' },
        { title: 'BCA', description: 'Bachelor of Computer Applications', link: '#education' },
        { title: 'Roland Institute of Technology', description: 'Current college', link: '#education' }
    ];

    // Build additional index from the DOM (projects, skills, headings, buttons, links)
    function buildSearchIndex() {
        try {
            const items = [];

            // Sections by id and heading text
            document.querySelectorAll('section[id]').forEach(sec => {
                const id = sec.getAttribute('id');
                const title = sec.querySelector('h1, h2, h3, .section-title')?.textContent?.trim();
                if (title) items.push({ title, description: `Go to ${title} section`, link: `#${id}` });
            });

            // Project cards
            document.querySelectorAll('.project-card').forEach(card => {
                const title = card.querySelector('.project-title, h3, h4')?.textContent?.trim();
                const desc = card.querySelector('.project-description, p')?.textContent?.trim()?.slice(0, 120) || 'Project';
                if (title) items.push({ title, description: desc, link: '#projects' });
            });

            // Skills
            document.querySelectorAll('.skill-item, .skill-card').forEach(skill => {
                const title = skill.querySelector('.skill-name, h4, h5')?.textContent?.trim();
                if (title) items.push({ title, description: 'Skill', link: '#skills' });
            });

            // Resume/Download buttons and links
            document.querySelectorAll('a.resume-btn, .resume-btn, a[download], a[href*="resume"], a[href*="cv"]').forEach(link => {
                const text = link.textContent?.trim();
                const href = link.getAttribute('href');
                if (text && (text.toLowerCase().includes('resume') || text.toLowerCase().includes('download') || text.toLowerCase().includes('cv'))) {
                    items.push({
                        title: text,
                        description: 'Download resume PDF file',
                        link: href || '#resume'
                    });
                }
            });

            // CTA buttons and action buttons
            document.querySelectorAll('.cta-button, .btn, button[aria-label*="download"], button[aria-label*="resume"]').forEach(btn => {
                const text = btn.textContent?.trim() || btn.getAttribute('aria-label');
                if (text && (text.toLowerCase().includes('resume') || text.toLowerCase().includes('download') || text.toLowerCase().includes('get in touch'))) {
                    const section = btn.closest('section');
                    const sectionId = section?.getAttribute('id') || 'main';
                    items.push({
                        title: text,
                        description: `Action button: ${text}`,
                        link: `#${sectionId}`
                    });
                }
            });

            // Contact and navigation links
            document.querySelectorAll('a[href*="contact"]').forEach(link => {
                const text = link.textContent?.trim();
                const href = link.getAttribute('href');
                if (text) {
                    items.push({
                        title: text,
                        description: `Navigate to ${text} page`,
                        link: href
                    });
                }
            });

            // Merge and de-duplicate by title+link
            const key = o => `${o.title}|${o.link}`.toLowerCase();
            const map = new Map(searchableContent.map(i => [key(i), i]));
            items.forEach(i => { if (!map.has(key(i))) map.set(key(i), i); });
            searchableContent = Array.from(map.values());
        } catch (e) {
            console.warn('Search index build warning:', e);
        }
    }

    // Open search modal
    function openSearchModal() {
        searchModal.classList.add('active');
        searchModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            searchModalInput.focus();
        }, 100);
        currentResultIndex = -1;
        // Show suggestions if input is empty
        if (!searchModalInput.value.trim()) {
            renderSuggestions();
        }
    }

    // Close search modal with slide-down animation
    function closeSearchModal() {
        // Add closing class for slide-down animation
        searchModal.classList.add('closing');
        searchModalOverlay.classList.remove('active');

        // Wait for animation to complete before removing active class
        setTimeout(() => {
            searchModal.classList.remove('active');
            searchModal.classList.remove('closing');
            document.body.style.overflow = '';
            searchModalInput.value = '';
            searchResults.innerHTML = '';
            currentResultIndex = -1;
        }, 400); // Match the CSS transition duration
    }

    // Debounce helper
    function debounce(fn, delay = 200) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), delay);
        };
    }

    // Highlight helper
    function highlightMatches(text, query) {
        const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!q) return text;
        const re = new RegExp(`(${q})`, 'ig');
        return text.replace(re, '<mark>$1</mark>');
    }

    // Recent searches
    function getRecentSearches() {
        try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); } catch { return []; }
    }
    function addRecentSearch(q) {
        const list = getRecentSearches().filter(x => x.toLowerCase() !== q.toLowerCase());
        list.unshift(q);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list.slice(0, 5)));
    }

    function renderSuggestions() {
        const recent = getRecentSearches();
        const popular = ['Projects', 'Skills', 'Education', 'Certifications', 'Contact'];
        let html = '';
        if (recent.length) {
            html += '<div class="search-no-results" style="text-align:left">Recent searches:</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px">' +
                recent.map(r => `<button class="search-suggestion" data-q="${r}">${r}</button>`).join('') +
                '</div>';
        }
        html += '<div class="search-no-results" style="text-align:left">Try searching:</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px">' +
            popular.map(r => `<button class="search-suggestion" data-q="${r}">${r}</button>`).join('') +
            '</div>';
        searchResults.innerHTML = html;
        searchResults.querySelectorAll('.search-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const q = btn.getAttribute('data-q');
                searchModalInput.value = q;
                doSearch(q);
            });
        });
    }

    // Perform search with rendering
    function doSearch(query) {
        const lowerQuery = query.toLowerCase().trim();

        if (lowerQuery.length < 2) {
            renderSuggestions();
            return;
        }

        const tokens = lowerQuery.split(/\s+/).filter(Boolean);
        const results = searchableContent
            .map(item => {
                const hay = (item.title + ' ' + item.description).toLowerCase();
                const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) +
                    (item.title.toLowerCase().startsWith(lowerQuery) ? 2 : 0) +
                    (item.title.toLowerCase().includes(lowerQuery) ? 1 : 0);
                return { item, score };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(x => x.item);

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No results found for "' + query + '"</div>';
            return;
        }

        currentResultIndex = -1;
        searchResults.innerHTML = results.map((result, idx) => `
            <div class="search-result-item" role="option" data-index="${idx}" data-link="${result.link}">
                <div class="search-result-title">${highlightMatches(result.title, query)}</div>
                <div class="search-result-description">${highlightMatches(result.description, query)}</div>
            </div>
        `).join('');

        // Click handlers
        searchResults.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const link = el.getAttribute('data-link');
                addRecentSearch(query);

                // Handle different link types
                if (link.includes('.pdf') && !link.toLowerCase().includes('download')) {
                    // Open PDF in the site viewer (pass file path via query param)
                    // Open in a new tab to avoid losing the current page
                    window.open('Others-pages/pdf-viewer.html?file=' + encodeURIComponent('../' + link), '_blank', 'noopener');
                } else if (link.includes('download')) {
                    // For explicit download links, create a temporary anchor element
                    const tempLink = document.createElement('a');
                    tempLink.href = link;
                    tempLink.download = link.split('/').pop(); // Get filename
                    tempLink.style.display = 'none';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                } else {
                    // For regular navigation links
                    window.location.href = link;
                }
                closeSearchModal();
            });
        });
    }

    // Event listeners for search modal
    // Mobile search icon removed - desktop-search handles icon mode now

    // Desktop search button handled below per breakpoint

    if (searchModalClose) {
        searchModalClose.addEventListener('click', closeSearchModal);
    }

    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', closeSearchModal);
    }

    if (searchModalInput) {
        const debounced = debounce((val) => doSearch(val), 150);
        searchModalInput.addEventListener('input', (e) => {
            debounced(e.target.value);
        });

        searchModalInput.addEventListener('keydown', (e) => {
            const items = Array.from(searchResults.querySelectorAll('.search-result-item'));
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!items.length) return;
                currentResultIndex = (currentResultIndex + 1) % items.length;
                items.forEach((el, i) => el.classList.toggle('active', i === currentResultIndex));
                items[currentResultIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!items.length) return;
                currentResultIndex = (currentResultIndex - 1 + items.length) % items.length;
                items.forEach((el, i) => el.classList.toggle('active', i === currentResultIndex));
                items[currentResultIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                const active = items[currentResultIndex] || items[0];
                if (active) {
                    const link = active.getAttribute('data-link');
                    addRecentSearch(searchModalInput.value.trim());

                    // Handle different link types
                    if (link.includes('.pdf') && !link.toLowerCase().includes('download')) {
                        // Open PDF in the site viewer (pass file path via query param)
                        // Open in a new tab to avoid losing the current page
                        window.open('Others-pages/pdf-viewer.html?file=' + encodeURIComponent('../' + link), '_blank', 'noopener');
                    } else if (link.includes('download')) {
                        // For explicit download links, create a temporary anchor element
                        const tempLink = document.createElement('a');
                        tempLink.href = link;
                        tempLink.download = link.split('/').pop(); // Get filename
                        tempLink.style.display = 'none';
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);
                    } else {
                        // For regular navigation links
                        window.location.href = link;
                    }
                    closeSearchModal();
                }
            }
        });
    }

    if (searchModalButton) {
        searchModalButton.addEventListener('click', () => {
            doSearch(searchModalInput.value);
        });
    }

    // Close search modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    // Make closeSearchModal available globally for onclick handlers
    // Make closeSearchModal available globally for onclick handlers
    window.closeSearchModal = closeSearchModal;



    // Function to show inline validation messages for desktop search
    function showDesktopSearchMessage(input, message, isError = false) {
        // Remove existing message if any
        const existingMsg = input.parentElement.querySelector('.desktop-search-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create new message element
        const msgEl = document.createElement('div');
        msgEl.className = 'desktop-search-message';
        msgEl.textContent = message;
        msgEl.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            padding: 8px 12px;
            background: ${isError ? 'var(--error, #ef4444)' : 'var(--success, #10b981)'};
            color: white;
            border-radius: 8px;
            font-size: 0.75rem;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        // Insert message
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(msgEl);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (msgEl && msgEl.parentElement) {
                msgEl.remove();
            }
        }, 3000);
    }

    // Add search functionality to desktop search bars (dropdown with results, desktop-only)
    const desktopSearchInputs = document.querySelectorAll('.desktop-search .search-input');
    const desktopSearchButtons = document.querySelectorAll('.desktop-search .search-button');
    const desktopSearchClears = document.querySelectorAll('.desktop-search .search-clear');
    const desktopSearchResultsContainer = document.getElementById('desktopSearchResults');
    let currentDesktopResultIndex = -1;

    // Desktop gating (Laptop and larger only)
    const desktopMql = window.matchMedia('(min-width: 1024px)');
    let isDesktop = desktopMql.matches;

    function hideAllDesktopDropdowns() {
        document.querySelectorAll('.desktop-search-results').forEach(rc => rc.classList.remove('active'));
        currentDesktopResultIndex = -1;
    }

    desktopMql.addEventListener('change', (e) => {
        isDesktop = e.matches;
        if (!isDesktop) {
            hideAllDesktopDropdowns();
        } else {
            // If switching to desktop, close the mobile/tablet modal
            closeSearchModal();
        }
    });

    // Helper function to show search results in dropdown
    function showDesktopSearchResults(query, container) {
        if (!container) return;

        if (query.length < 1) {
            container.classList.remove('active');
            container.innerHTML = '';
            return;
        }

        // Show helpful message for short queries (less than 3 chars)
        if (query.length < 3) {
            const headerHtml = `
                <div class="desktop-search-results-header">
                    <div class="desktop-search-results-title">Keep typing...</div>
                </div>
            `;
            const bodyHtml = `
                <div class="desktop-search-no-results">Type at least 3 characters for better results</div>
            `;
            container.innerHTML = headerHtml + `<div class="desktop-search-results-body">${bodyHtml}</div>`;
            container.classList.add('active');

            // Wire suggestion chips
            const parentSearch = container.closest('.desktop-search');
            const parentInput = parentSearch ? parentSearch.querySelector('.search-input') : null;
            container.querySelectorAll('.suggestion-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const q = chip.getAttribute('data-q') || '';
                    if (parentInput) parentInput.value = q;
                    showDesktopSearchResults(q, container);
                });
            });
            return;
        }

        const lowerQuery = query.toLowerCase().trim();
        const tokens = lowerQuery.split(/\s+/).filter(Boolean);
        const resultsFull = searchableContent
            .map(item => {
                const hay = (item.title + ' ' + item.description).toLowerCase();
                const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) +
                    (item.title.toLowerCase().startsWith(lowerQuery) ? 2 : 0) +
                    (item.title.toLowerCase().includes(lowerQuery) ? 1 : 0);
                return { item, score };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score);

        const totalCount = resultsFull.length;
        const results = resultsFull.slice(0, 6); // Limit to top 6 results

        // Header without 'View all' button
        const headerHtml = `
            <div class="desktop-search-results-header">
                <div class="desktop-search-results-title">Top results</div>
            </div>
        `;

        let bodyHtml = '';
        if (totalCount === 0) {
            bodyHtml = `
                <div class="desktop-search-no-results">No results found</div>
            `;
        } else {
            currentDesktopResultIndex = -1;
            bodyHtml = results.map((result, idx) => `
                <div class="desktop-search-result-item" data-index="${idx}" data-link="${result.item.link}">
                    <div class="desktop-search-result-title">${highlightMatches(result.item.title, query)}</div>
                    <div class="desktop-search-result-description">${highlightMatches(result.item.description, query)}</div>
                </div>
            `).join('');
        }

        // No footer on desktop
        const footerHtml = '';

        // Wrap body in scrollable container
        container.innerHTML = headerHtml + `<div class="desktop-search-results-body">${bodyHtml}</div>` + footerHtml;

        container.classList.add('active');

        // No View all buttons to wire up

        // Wire suggestion chips
        const parentSearch = container.closest('.desktop-search');
        const parentInput = parentSearch ? parentSearch.querySelector('.search-input') : null;
        container.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const q = chip.getAttribute('data-q') || '';
                if (parentInput) parentInput.value = q;
                showDesktopSearchResults(q, container);
            });
        });

        // Add click handlers to results
        container.querySelectorAll('.desktop-search-result-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const link = el.getAttribute('data-link');
                addRecentSearch(query);
                navigateToLink(link);
                container.classList.remove('active');
            });
        });
    }

    // Helper function to navigate to different link types
    function navigateToLink(link) {
        if (link.includes('.pdf') && !link.toLowerCase().includes('download')) {
            window.open('Others-pages/pdf-viewer.html?file=' + encodeURIComponent('../' + link), '_blank', 'noopener');
        } else if (link.includes('download')) {
            const tempLink = document.createElement('a');
            tempLink.href = link;
            tempLink.download = link.split('/').pop();
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
        } else {
            window.location.href = link;
        }
    }

    // Debounced search for desktop
    const debouncedDesktopSearch = debounce((query, container) => {
        showDesktopSearchResults(query, container);
    }, 300);

    desktopSearchInputs.forEach(input => {
        const container = input.closest('.desktop-search');
        const clearBtn = container?.querySelector('.search-clear');
        const resultsContainer = container?.querySelector('.desktop-search-results');

        // Toggle clear button visibility
        const toggleClear = () => {
            if (!clearBtn) return;
            const show = input.value.trim().length > 0;
            clearBtn.hidden = !show;
        };
        input.addEventListener('input', (e) => {
            toggleClear();
            const query = e.target.value.trim();
            if (!isDesktop) {
                // Do not show dropdown on non-desktop
                resultsContainer?.classList.remove('active');
                return;
            }
            if (query.length >= 1) {
                // Show dropdown with 1+ characters (shows "Keep typing..." for 1 char)
                debouncedDesktopSearch(query, resultsContainer);
            } else {
                resultsContainer?.classList.remove('active');
            }
        });
        toggleClear();

        // Handle keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (!isDesktop) return; // desktop-only navigation
            if (!resultsContainer) return;
            const items = Array.from(resultsContainer.querySelectorAll('.desktop-search-result-item'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!items.length) return;
                currentDesktopResultIndex = (currentDesktopResultIndex + 1) % items.length;
                items.forEach((el, i) => el.classList.toggle('active', i === currentDesktopResultIndex));
                items[currentDesktopResultIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!items.length) return;
                currentDesktopResultIndex = (currentDesktopResultIndex - 1 + items.length) % items.length;
                items.forEach((el, i) => el.classList.toggle('active', i === currentDesktopResultIndex));
                items[currentDesktopResultIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();

                // If there are visible results, navigate to the selected/first one
                if (items.length > 0) {
                    const active = items[currentDesktopResultIndex] || items[0];
                    const link = active.getAttribute('data-link');
                    addRecentSearch(query);
                    navigateToLink(link);
                    resultsContainer.classList.remove('active');
                } else if (query.length >= 2) {
                    // No visible results but valid query - trigger search
                    showDesktopSearchResults(query, resultsContainer);
                } else {
                    // Query too short
                    showDesktopSearchMessage(input, 'Please enter at least 2 characters to search', true);
                }
            } else if (e.key === 'Escape') {
                resultsContainer.classList.remove('active');
                currentDesktopResultIndex = -1;
            }
        });

        // Show results on focus if there's a query (desktop only)
        input.addEventListener('focus', () => {
            if (!isDesktop) return;
            const query = input.value.trim();
            if (query.length >= 2 && resultsContainer) {
                showDesktopSearchResults(query, resultsContainer);
            }
        });

        // On non-desktop, Enter opens the modal with results
        input.addEventListener('keypress', (e) => {
            if (isDesktop) return;
            if (e.key === 'Enter') {
                const q = input.value.trim();
                if (q.length < 2) {
                    showDesktopSearchMessage(input, 'Please enter at least 2 characters to search', true);
                    return;
                }
                openSearchModal();
                setTimeout(() => {
                    if (searchModalInput) {
                        searchModalInput.value = q;
                        doSearch(q);
                    }
                }, 150);
            }
        });
    });

    desktopSearchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.closest('.desktop-search')?.querySelector('.search-input');
            const resultsContainer = button.closest('.desktop-search')?.querySelector('.desktop-search-results');
            if (!input) return;
            const query = input.value.trim();
            if (query.length < 2) {
                showDesktopSearchMessage(input, 'Please enter at least 2 characters to search', true);
                return;
            }
            if (isDesktop && resultsContainer) {
                showDesktopSearchResults(query, resultsContainer);
            } else {
                // On Tablet (non-desktop), open the modal with results
                openSearchModal();
                setTimeout(() => {
                    if (searchModalInput) {
                        searchModalInput.value = query;
                        doSearch(query);
                    }
                }, 150);
            }
        });
    });

    desktopSearchClears.forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.desktop-search');
            const input = container?.querySelector('.search-input');
            const resultsContainer = container?.querySelector('.desktop-search-results');
            if (input) {
                input.value = '';
                btn.hidden = true;
                input.focus();
            }
            if (resultsContainer) {
                resultsContainer.classList.remove('active');
            }
        });
    });

    // Progressive Responsive Search - Smart mode detection based on placeholder visibility
    function updateSearchMode() {
        const desktopSearchContainers = document.querySelectorAll('.desktop-search');

        desktopSearchContainers.forEach(container => {
            const navContainer = container.closest('.nav-container');
            const searchInput = container.querySelector('.search-input');
            if (!navContainer || !searchInput) return;

            // Get all navbar children to calculate available space
            const navChildren = Array.from(navContainer.children);
            const navWidth = navContainer.offsetWidth;

            // Calculate total width of all elements except search
            let otherElementsWidth = 0;
            navChildren.forEach(child => {
                if (!child.classList.contains('desktop-search')) {
                    otherElementsWidth += child.offsetWidth;
                }
            });

            // Add padding and gaps
            const computedStyle = window.getComputedStyle(navContainer);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            const gap = parseFloat(computedStyle.gap) || 10;
            const totalGaps = gap * (navChildren.length - 1);

            const usedSpace = otherElementsWidth + paddingLeft + paddingRight + totalGaps;
            const availableSpace = navWidth - usedSpace;

            // Minimum space needed to show placeholder text comfortably
            // "Search..." = ~60-70px + padding + icon space = ~120px minimum
            const minWidthForPlaceholder = 120;

            // Icon mode only needs ~40px
            const iconWidth = 40;

            // Check if navbar is actually overflowing
            const isOverflowing = navContainer.scrollWidth > navContainer.offsetWidth;

            // Smart decision:
            // 1. If available space < 120px OR overflowing → icon mode
            // 2. If available space >= 120px → show search box (will shrink via CSS)
            const shouldUseIconMode = isOverflowing || availableSpace < minWidthForPlaceholder;

            if (shouldUseIconMode) {
                container.classList.add('icon-mode');
            } else {
                container.classList.remove('icon-mode');

                // Set dynamic max-width based on available space
                // Allow search to take remaining space but cap at 280px
                const maxSearchWidth = Math.min(availableSpace - 20, 280);
                if (maxSearchWidth >= minWidthForPlaceholder) {
                    container.style.maxWidth = `${maxSearchWidth}px`;
                }
            }
        });
    }

    // Run on load and resize
    updateSearchMode();
    window.addEventListener('resize', debounce(updateSearchMode, 150));

    // Handle search icon button click (opens modal when in icon mode)
    const searchIconButtons = document.querySelectorAll('.desktop-search .search-icon-button');
    searchIconButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            openSearchModal();
        });
    });

    // Close dropdown when clicking outside (desktop only)
    document.addEventListener('click', (e) => {
        if (!isDesktop) return;
        if (!e.target.closest('.desktop-search')) {
            hideAllDesktopDropdowns();
        }
    });

    // Build index after DOM is ready
    buildSearchIndex();

    // Cross-page search: open modal if ?q= is present
    try {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q !== null) {
            openSearchModal();
            setTimeout(() => {
                searchModalInput.value = q;
                doSearch(q);
            }, 120);
            // Clean the URL to avoid re-trigger on refresh
            const cleanUrl = location.pathname + location.hash;
            window.history.replaceState({}, '', cleanUrl);
        }
    } catch { }

    /* ==================== Smooth Scrolling & Active Navigation ==================== */
    const sections = document.querySelectorAll('section[id], header[id]');
    const desktopNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sidebarNavLinks = document.querySelectorAll('.sidebar-links a[href^="#"]');
    const allNavLinks = [...desktopNavLinks, ...sidebarNavLinks];

    // Calculate dynamic offsets (navbar + banner)
    function getOffsets() {
        const navbar = document.getElementById('navbar');
        const noticeBanner = document.querySelector('.notice-banner');
        const navbarHeight = navbar ? navbar.offsetHeight : 48;
        const bannerHeight = noticeBanner ? noticeBanner.offsetHeight : 35;
        return navbarHeight + bannerHeight;
    }

    // Update active navigation link
    function updateActiveLink(sectionId) {
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');

            // Normalize href to handle: #section, index.html#section, ./index.html#section, etc.
            const normalizedHref = href.replace(/^.*#/, '#');
            if (normalizedHref === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Main function to determine active section
    function highlightActiveNav() {
        const totalOffset = getOffsets();
        const scrollPos = window.scrollY;
        const activationPoint = scrollPos + totalOffset + 50; // 50px buffer for better UX

        let currentSection = null;
        let bestScore = -Infinity;

        // If at the very top, always highlight home
        if (scrollPos < 80) {
            currentSection = 'home';
        } else {
            sections.forEach(section => {
                const sectionId = section.getAttribute('id');
                if (!sectionId) return;

                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollPos;
                const sectionBottom = sectionTop + rect.height;

                // Check if activation point is within this section
                const isInSection = activationPoint >= sectionTop && activationPoint <= sectionBottom;

                // Also check if section top has passed the activation point (for sections we're scrolling into)
                const hasPassedActivation = sectionTop <= activationPoint;

                if (isInSection || hasPassedActivation) {
                    // Calculate score: prefer sections where activation point is closer to section top
                    const distanceFromTop = Math.abs(activationPoint - sectionTop);
                    const sectionHeight = rect.height;
                    const normalizedDistance = distanceFromTop / Math.max(sectionHeight, 100);

                    // Higher score for sections where we're closer to the top
                    let score = 1000 - normalizedDistance;

                    // If activation point is within section, boost score
                    if (isInSection) {
                        score += 500;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        currentSection = sectionId;
                    }
                }
            });

            // Fallback: if no section found, find the closest one above activation point
            if (!currentSection) {
                let closestSection = null;
                let closestDistance = Infinity;

                sections.forEach(section => {
                    const sectionId = section.getAttribute('id');
                    if (!sectionId) return;

                    const rect = section.getBoundingClientRect();
                    const sectionTop = rect.top + scrollPos;

                    if (sectionTop <= activationPoint) {
                        const distance = activationPoint - sectionTop;
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestSection = sectionId;
                        }
                    }
                });

                if (closestSection) {
                    currentSection = closestSection;
                } else {
                    // Ultimate fallback: use home
                    currentSection = 'home';
                }
            }
        }

        // Update navigation links
        if (currentSection) {
            updateActiveLink(currentSection);
        }
    }

    // Use IntersectionObserver as primary method for accurate detection
    let activeSectionId = 'home';
    let observerInstance = null;

    function setupObserver() {
        // Clean up existing observer
        if (observerInstance) {
            sections.forEach(section => {
                if (section.getAttribute('id')) {
                    observerInstance.unobserve(section);
                }
            });
        }

        const totalOffset = getOffsets();
        observerInstance = new IntersectionObserver((entries) => {
            // Find the section that's most visible at the activation point
            const activationPoint = window.scrollY + totalOffset + 50;
            let bestSection = null;
            let bestScore = -Infinity;

            entries.forEach(entry => {
                const sectionId = entry.target.getAttribute('id');
                if (!sectionId) return;

                const rect = entry.target.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;

                // Check if section is intersecting and near activation point
                if (entry.isIntersecting) {
                    const distanceFromActivation = Math.abs((sectionTop + totalOffset) - activationPoint);
                    const visibilityScore = entry.intersectionRatio * 1000;
                    const proximityScore = 1000 / (1 + distanceFromActivation / 10);
                    const totalScore = visibilityScore + proximityScore;

                    if (totalScore > bestScore) {
                        bestScore = totalScore;
                        bestSection = sectionId;
                    }
                }
            });

            // Also check all sections for the one at activation point
            sections.forEach(section => {
                const sectionId = section.getAttribute('id');
                if (!sectionId) return;

                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const sectionBottom = sectionTop + rect.height;

                if (activationPoint >= sectionTop && activationPoint <= sectionBottom) {
                    const distanceFromTop = activationPoint - sectionTop;
                    const score = 2000 - (distanceFromTop / 10);

                    if (score > bestScore) {
                        bestScore = score;
                        bestSection = sectionId;
                    }
                }
            });

            // Handle top of page
            if (window.scrollY < 80) {
                bestSection = 'home';
            }

            if (bestSection && bestSection !== activeSectionId) {
                activeSectionId = bestSection;
                updateActiveLink(bestSection);
            }
        }, {
            root: null,
            rootMargin: `-${totalOffset}px 0px -50% 0px`,
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        });

        // Observe all sections
        sections.forEach(section => {
            if (section.getAttribute('id')) {
                observerInstance.observe(section);
            }
        });
    }

    // Initialize observer
    setupObserver();

    // Throttled scroll handler as backup
    let scrollThrottle;
    function throttledHighlight() {
        if (scrollThrottle) return;
        scrollThrottle = setTimeout(() => {
            highlightActiveNav();
            scrollThrottle = null;
        }, 50);
    }

    window.addEventListener('scroll', throttledHighlight, { passive: true });

    // Handle resize to recalculate offsets and update observer
    let resizeThrottle;
    window.addEventListener('resize', () => {
        if (resizeThrottle) return;
        resizeThrottle = setTimeout(() => {
            setupObserver();
            highlightActiveNav();
            resizeThrottle = null;
        }, 150);
    }, { passive: true });

    // Initialize on load
    window.addEventListener('load', () => {
        setupObserver();
        highlightActiveNav();
        setTimeout(highlightActiveNav, 100);
    });

    // Initial highlight
    highlightActiveNav();

    /* ==================== Skill Bars Animation ==================== */
    // Support both new (.progress [data-value]) and legacy (.skill-bar [data-width]) bars
    const progressBars = document.querySelectorAll('.progress');
    const legacySkillBars = document.querySelectorAll('.skill-bar');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                if (bar.classList.contains('progress')) {
                    const value = bar.getAttribute('data-value') || '0';
                    // Set width and expose score out of 10 for labels
                    bar.style.width = value + '%';
                    const score = (parseFloat(value) / 10).toFixed(1).replace(/\.0$/, '');
                    bar.setAttribute('data-score', score);
                } else if (bar.classList.contains('skill-bar')) {
                    const value = bar.getAttribute('data-width') || '0';
                    bar.style.width = value + '%';
                    // If a rating element exists, ensure it's X/10
                    const item = bar.closest('.skill-item');
                    const rating = item ? item.querySelector('.skill-rating') : null;
                    if (rating) {
                        const score = (parseFloat(value) / 10).toFixed(1).replace(/\.0$/, '');
                        rating.textContent = `${score}/10`;
                    }
                }
                progressObserver.unobserve(bar);
            }
        });
    }, observerOptions);

    [...progressBars, ...legacySkillBars].forEach(bar => progressObserver.observe(bar));

    // Remove legacy in-page filter search; all search routes to the modal now

    /* ==================== Navbar Scroll Effect ==================== */
    const mainNavbar = document.getElementById('navbar');
    if (mainNavbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNavbar.classList.add('scrolled');
            } else {
                mainNavbar.classList.remove('scrolled');
            }
        });
    }

    /* ==================== Accessibility & Performance ==================== */
    // Detect backdrop-filter support
    if (!CSS.supports || !CSS.supports('backdrop-filter', 'blur(10px)')) {
        document.documentElement.classList.add('no-backdrop');
    }

    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function applyMotionPreference() {
        if (prefersReducedMotion.matches) {
            document.querySelectorAll('.card-glass, .button-glass').forEach(el => {
                el.style.transitionDuration = '0.01ms';
            });
        }
    }
    applyMotionPreference();
    prefersReducedMotion.addEventListener?.('change', applyMotionPreference);

    /* ==================== Contact Form ==================== */
    // Contact form logic is handled in contact.html specific script


    /* ==================== Apply Ripple Effects ==================== */
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    /* ==================== Broken Link Guard & Mailto Validation ==================== */
    function isHttpContext() {
        return location.protocol === 'http:' || location.protocol === 'https:';
    }

    function isValidEmail(email) {
        const simple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return simple.test(email);
    }

    document.addEventListener('click', async (e) => {
        const a = e.target.closest && e.target.closest('a');
        if (!a) return;

        // Skip checks if developer opts out
        if (a.dataset && a.dataset.skipCheck === 'true') return;

        const rawHref = a.getAttribute('href');
        if (!rawHref) return;

        // Redirect broken placeholder links to 404
        if (rawHref === '#') {
            e.preventDefault();
            window.location.href = 'Others-pages/404.html';
            return;
        }

        // Ignore valid in-page anchors (like #home, #education, etc.)
        if (rawHref.startsWith('#')) return;

        // Validate mailto links and enforce allowlist
        if (rawHref.toLowerCase().startsWith('mailto:')) {
            try {
                // Extract the primary recipient before any query params
                const addrPart = rawHref.slice(7).split('?')[0];
                const decoded = decodeURIComponent(addrPart).trim().toLowerCase();

                // Must be a syntactically valid email AND on the allowlist
                if (!isValidEmail(decoded) || !ALLOWED_MAILTO.has(decoded)) {
                    e.preventDefault();
                    window.location.href = 'Others-pages/404.html';
                }
            } catch (_) {
                e.preventDefault();
                window.location.href = 'Others-pages/404.html';
            }
            return;
        }

        // Ignore protocols we don't validate
        if (/^(tel:|javascript:|data:)/i.test(rawHref)) return;

        // Only attempt fetch checks when running over HTTP(S) and same-origin
        if (!isHttpContext()) return;

        let url;
        try { url = new URL(rawHref, location.href); } catch { return; }

        if (url.origin !== location.origin) return; // don't check cross-origin links

        // Perform a lightweight HEAD request to see if target exists
        try {
            const res = await fetch(url.href, { method: 'HEAD' });
            if (!res.ok) {
                // Some servers may not support HEAD; allow through on 405/501
                if (res.status === 405 || res.status === 501) return;
                e.preventDefault();
                window.location.href = 'Others-pages/404.html';
            }
        } catch (err) {
            // Network or fetch error -> route to 404
            e.preventDefault();
            window.location.href = 'Others-pages/404.html';
        }
    }, true); // capture phase to intercept early
};

/* Mobile inline expandable search removed to prevent duplicate inputs.
   Mobile icon will open the modal via existing click handler (openSearchModal).
   Desktop search continues to show dropdown on ≥1025px. */


/* SwipeCircleArrow class removed - arrow indicator disabled */


// Logo Click Animation & Reload Logic
const initPart2 = () => {
    // Restore scroll position if saved
    const savedScroll = sessionStorage.getItem('restoreScrollPosition');
    if (savedScroll) {
        // Use setTimeout to ensure layout is stable before scrolling
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScroll, 10));
        }, 0);
        sessionStorage.removeItem('restoreScrollPosition');
    }


    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();

            // Save current scroll position
            sessionStorage.setItem('restoreScrollPosition', window.scrollY);

            // Add animation class
            logo.classList.add('logo-exit-anim');

            // Wait for animation to finish (500ms) then reload
            setTimeout(() => {
                location.reload();
            }, 500);
        });
    }

    /* ==================== Scroll Position Restoration System ==================== */
    /**
     * Dual-layer scroll position restoration:
     * 1. Primary: Browser's native History API (automatic)
     * 2. Fallback: Manual sessionStorage tracking (for older browsers)
     */

    // Enable browser's native scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
    }

    // Manual tracking as fallback
    window.addEventListener('beforeunload', () => {
        try {
            const scrollData = {
                y: window.scrollY,
                timestamp: Date.now()
            };
            sessionStorage.setItem(`scrollPos_${window.location.pathname}`, JSON.stringify(scrollData));
        } catch (e) {
            console.warn('Could not save scroll position:', e);
        }
    });

    // Restore scroll position on page load
    window.addEventListener('load', () => {
        try {
            const savedData = sessionStorage.getItem(`scrollPos_${window.location.pathname}`);
            if (savedData) {
                const { y, timestamp } = JSON.parse(savedData);
                // Only restore if data is recent (within 5 minutes)
                if (Date.now() - timestamp < 300000) {
                    let attempts = 0;
                    const restore = () => {
                        window.scrollTo(0, y);
                        if (Math.abs((window.scrollY || window.pageYOffset) - y) > 2 && attempts < 10) {
                            attempts++;
                            setTimeout(restore, 50);
                        }
                    };
                    setTimeout(restore, 0);
                }
            }
        } catch (e) {
            console.warn('Could not restore scroll position:', e);
        }
    });

    // Save scroll position to history state before navigation
    function saveScrollToHistory() {
        try {
            const currentState = history.state || {};
            history.replaceState({
                ...currentState,
                scrollPos: window.scrollY,
                timestamp: Date.now()
            }, '', window.location.href);
        } catch (e) {
            console.warn('Could not save scroll to history:', e);
        }
    }

    // Save scroll position when clicking links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && !link.hasAttribute('target') && link.href && !link.href.startsWith('javascript:')) {
            saveScrollToHistory();
        }
    });

    // Restore scroll position on popstate (back/forward navigation)
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.scrollPos !== undefined) {
            let attempts = 0;
            const y = event.state.scrollPos;
            const restore = () => {
                window.scrollTo(0, y);
                if (Math.abs((window.scrollY || window.pageYOffset) - y) > 2 && attempts < 10) {
                    attempts++;
                    setTimeout(restore, 50);
                }
            };
            setTimeout(restore, 0);
        }
    });

    window.addEventListener('pageshow', (e) => {
        try {
            const stateY = history.state && history.state.scrollPos !== undefined ? history.state.scrollPos : null;
            let y = stateY;
            if (y === null) {
                const savedData = sessionStorage.getItem(`scrollPos_${window.location.pathname}`);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    if (parsed && typeof parsed.y === 'number') y = parsed.y;
                }
            }
            if (typeof y === 'number') {
                let attempts = 0;
                const restore = () => {
                    window.scrollTo(0, y);
                    if (Math.abs((window.scrollY || window.pageYOffset) - y) > 2 && attempts < 10) {
                        attempts++;
                        setTimeout(restore, 50);
                    }
                };
                setTimeout(restore, 0);
            }
        } catch { }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveScrollToHistory();
        }
    });

    window.addEventListener('orientationchange', () => {
        const stateY = history.state && history.state.scrollPos !== undefined ? history.state.scrollPos : null;
        let y = stateY;
        if (y === null) {
            try {
                const savedData = sessionStorage.getItem(`scrollPos_${window.location.pathname}`);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    if (parsed && typeof parsed.y === 'number') y = parsed.y;
                }
            } catch { }
        }
        if (typeof y === 'number') {
            setTimeout(() => {
                let attempts = 0;
                const restore = () => {
                    window.scrollTo(0, y);
                    if (Math.abs((window.scrollY || window.pageYOffset) - y) > 2 && attempts < 10) {
                        attempts++;
                        setTimeout(restore, 50);
                    }
                };
                restore();
            }, 100);
        }
    });

    /* ==================== Back Navigation Swipe Gesture ==================== */
    /**
     * BackNavigationSwipe - Swipe from left edge to go back
     * 
     * Features:
     * - Swipe right from left edge triggers browser back navigation
     * - Page slide-out animation
     * - Automatic scroll position restoration
     * - Safety checks for history availability
     */
    class BackNavigationSwipe {
        constructor(options = {}) {
            // Configuration
            this.config = {
                swipeThreshold: 50,
                velocityThreshold: 0.3,
                mobileMaxWidth: 768,
                ...options
            };

            // State
            this.isSwiping = false;
            this.startX = 0;
            this.startY = 0;
            this.currentX = 0;
            this.currentY = 0;
            this.lastX = 0;
            this.lastTime = 0;
            this.velocity = 0;

            // Indicator removed - no visual feedback

            // Check if we're on mobile
            this.isMobile = () => window.innerWidth <= this.config.mobileMaxWidth;

            this.init();
        }

        init() {
            // Indicator creation removed

            // Bind events
            this.bindEvents();

            // Handle window resize
            window.addEventListener('resize', () => this.handleResize());
        }



        bindEvents() {
            // Touch events for swipe gesture
            document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        }

        handleTouchStart(e) {
            // Only handle on mobile
            if (!this.isMobile()) return;

            // Disable swipe if sidebar or settings panel is open
            if (document.body.classList.contains('sidebar-open') || document.body.classList.contains('no-scroll')) return;

            const touch = e.touches[0];
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.lastX = touch.clientX;
            this.lastTime = Date.now();

            // Only start swipe if touch starts near left edge (within 30px)
            const isEdgeSwipe = this.startX < 30;

            if (isEdgeSwipe && window.history.length > 1) {
                this.isSwiping = true;
                // Indicator removed - no visual feedback
            }
        }

        handleTouchMove(e) {
            if (!this.isSwiping || !this.isMobile()) return;

            const touch = e.touches[0];
            this.currentX = touch.clientX;
            this.currentY = touch.clientY;

            const deltaX = this.currentX - this.startX;
            const deltaY = this.currentY - this.startY;

            // Calculate velocity
            const now = Date.now();
            const timeDelta = now - this.lastTime;
            if (timeDelta > 0) {
                this.velocity = (this.currentX - this.lastX) / timeDelta;
            }
            this.lastX = this.currentX;
            this.lastTime = now;

            // Only handle horizontal swipes to the right
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaX > 0) {
                e.preventDefault();

                const progress = Math.min(deltaX / 200, 1); // 200px for full progress
                this.updateSwipeProgress(progress, deltaX);
            }
        }

        handleTouchEnd(e) {
            if (!this.isSwiping || !this.isMobile()) return;

            const deltaX = this.currentX - this.startX;
            const deltaY = this.currentY - this.startY;

            // Only process if it's a horizontal swipe to the right
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaX > 0) {
                const progress = Math.min(deltaX / 200, 1);

                // Determine if we should navigate back
                const shouldGoBack =
                    progress > 0.4 || // More than 40% swiped
                    Math.abs(this.velocity) > this.config.velocityThreshold; // Fast swipe

                if (deltaX > this.config.swipeThreshold && shouldGoBack) {
                    this.navigateBack();
                } else {
                    this.resetSwipe();
                }
            }

            this.isSwiping = false;
            // Indicator removed - no visual feedback
        }

        updateSwipeProgress(progress, deltaX) {
            // Clamp progress
            progress = Math.max(0, Math.min(1, progress));

            // Calculate dynamic values
            const absVelocity = Math.abs(this.velocity);
            const velocityFactor = Math.min(absVelocity * 2, 1);

            // Indicator updates removed - no visual feedback

            // Optional: Add page slide effect
            if (progress > 0.1) {
                document.body.style.transform = `translateX(${progress * 20}px)`;
                document.body.style.opacity = `${1 - (progress * 0.1)}`;
            }
        }



        navigateBack() {
            // Save current scroll position before navigating
            saveScrollToHistory();

            // Add slide-out animation
            document.body.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            document.body.style.transform = 'translateX(100%)';
            document.body.style.opacity = '0.5';

            // Navigate back after animation
            setTimeout(() => {
                window.history.back();
            }, 300);
        }

        resetSwipe() {
            // Reset page position
            document.body.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            document.body.style.transform = 'translateX(0)';
            document.body.style.opacity = '1';

            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }

        handleResize() {
            // Reset if switching to desktop
            if (!this.isMobile()) {
                this.resetSwipe();
            }
        }
    }

    /* ==================== Page Detection and Initialization ==================== */
    /**
     * Detect page type and initialize appropriate swipe handler
     * - index.html with sidebar: MobileSidebarSwipe (already initialized above)
     * - Other pages: BackNavigationSwipe
     */
    function detectPageType() {
        // Check if sidebar menu exists in DOM
        const hasSidebar = document.getElementById('sidebarMenu') !== null;

        // Check current page filename
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (hasSidebar && (currentPage === 'index.html' || currentPage === '')) {
            return 'sidebar';
        } else {
            return 'back';
        }
    }

    // Initialize appropriate swipe handler based on page type
    // Sidebar swipe is already initialized above for index.html
    // Initialize back navigation swipe for non-index pages
    const pageType = detectPageType();

    if (pageType === 'back') {
        // Initialize back navigation swipe for non-index pages
        // Always initialize, let the class handle mobile detection internally
        const backSwipe = new BackNavigationSwipe({
            swipeThreshold: 50,
            velocityThreshold: 0.3
        });
    }

    /* ==================== Settings Panel Logic ==================== */
    // Logic moved to initApp to ensure correct scope and functionality

};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        initPart2();
    });
} else {
    initApp();
    initPart2();
}
