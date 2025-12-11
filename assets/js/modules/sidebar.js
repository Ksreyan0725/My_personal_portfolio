/**
 * Sidebar Module
 * Mobile sidebar with swipe gesture support
 * Extracted from script.js lines 820-1231
 */

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
            swipeThreshold: 30,
            velocityThreshold: 0.3,
            glowColor: options.glowColor || '#0ea5e9',
            maxGlowIntensity: options.maxGlowIntensity || 0.6,
            transitionDuration: 280,
            indicatorFadeDuration: 200,
            easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
            easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
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

        this.isMobile = () => window.innerWidth <= this.config.mobileMaxWidth;
        this.init();
    }

    init() {
        if (!this.sidebar || !this.overlay) {
            console.warn('[MobileSidebarSwipe] Sidebar elements not found');
            return;
        }

        this.updateSidebarWidth();
        this.bindEvents();
        window.addEventListener('resize', () => this.handleResize());
    }

    bindEvents() {
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        if (this.menuIcon) {
            this.menuIcon.addEventListener('click', () => {
                this.isOpen ? this.close() : this.open();
            });
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        const navLinks = this.sidebar?.querySelectorAll('a');
        navLinks?.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.close(), 150);
            });
        });
    }

    handleTouchStart(e) {
        if (!this.isMobile()) return;
        if (document.body.classList.contains('no-scroll')) return;

        const target = e.target;
        const isInteractive = target.closest('button, a, input, textarea, select, .filter-btn, .project-card, [role="button"]');
        if (isInteractive) {
            this.isSwiping = false;
            return;
        }

        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.lastX = touch.clientX;
        this.lastTime = Date.now();
        this.isSwiping = true;

        if (this.sidebar) this.sidebar.style.transition = 'none';
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

        const now = Date.now();
        const timeDelta = now - this.lastTime;
        if (timeDelta > 0) {
            this.velocity = (this.currentX - this.lastX) / timeDelta;
        }
        this.lastX = this.currentX;
        this.lastTime = now;

        const isHorizontalEnough = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

        if (isHorizontalEnough) {
            e.preventDefault();

            if (!this.isOpen && deltaX > 0) {
                const progress = Math.min(deltaX / this.sidebarWidth, 1);
                this.updateSwipeProgress(progress, deltaX);
            } else if (this.isOpen && deltaX < 0) {
                const progress = Math.max(1 + (deltaX / this.sidebarWidth), 0);
                this.updateSwipeProgress(progress, deltaX);
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.isSwiping || !this.isMobile()) return;

        if (this.sidebar) this.sidebar.style.transition = '';
        if (this.pageWrapper) this.pageWrapper.style.transition = '';
        if (this.navbar) this.navbar.style.transition = '';
        if (this.noticeBanner) this.noticeBanner.style.transition = '';

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        const isHorizontalEnough = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

        if (isHorizontalEnough) {
            const progress = !this.isOpen
                ? Math.min(deltaX / this.sidebarWidth, 1)
                : Math.max(1 + (deltaX / this.sidebarWidth), 0);

            const shouldToggle =
                progress > 0.25 ||
                Math.abs(this.velocity) > this.config.velocityThreshold;

            if (!this.isOpen && deltaX > this.config.swipeThreshold && shouldToggle) {
                this.open();
            } else if (this.isOpen && deltaX < -this.config.swipeThreshold && shouldToggle) {
                this.close();
            } else {
                this.resetSwipe();
            }
        }

        this.isSwiping = false;

        if (this.sidebar) {
            this.sidebar.style.transform = '';
            this.sidebar.style.boxShadow = '';
        }
        if (this.pageWrapper) this.pageWrapper.style.transform = '';
        if (this.navbar) this.navbar.style.transform = '';
        if (this.noticeBanner) this.noticeBanner.style.transform = '';
    }

    updateSwipeProgress(progress, deltaX) {
        progress = Math.max(0, Math.min(1, progress));

        const absVelocity = Math.abs(this.velocity);
        const velocityFactor = Math.min(absVelocity * 2, 1);

        if (this.sidebar) {
            if (!this.isOpen) {
                const translateX = -100 + (progress * 100);
                this.sidebar.style.transform = `translateX(${translateX}%)`;
            } else {
                const translateX = (deltaX / this.sidebarWidth) * 100;
                this.sidebar.style.transform = `translateX(${translateX}%)`;
            }

            const glowIntensity = progress * this.config.maxGlowIntensity + (velocityFactor * 0.2);
            const glowBlur = 10 + (progress * 15) + (velocityFactor * 10);
            const glowColor = this.hexToRgba(this.config.glowColor, glowIntensity);

            this.sidebar.style.borderRight = `2px solid ${glowColor}`;
            this.sidebar.style.boxShadow = `0 0 ${glowBlur}px ${glowColor}`;
        }

        const updateTransform = (element) => {
            if (!element) return;
            if (!this.isOpen) {
                const translateX = progress * this.sidebarWidth;
                element.style.transform = `translateX(${translateX}px)`;
            } else {
                const translateX = this.sidebarWidth + deltaX;
                element.style.transform = `translateX(${translateX}px)`;
            }
        };

        updateTransform(this.pageWrapper);
        updateTransform(this.navbar);
        updateTransform(this.noticeBanner);

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
        this.animateOpen();
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.sidebar?.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        this.animateClose();
    }

    animateOpen() {
        if (this.sidebar) {
            setTimeout(() => {
                const glowColor = this.hexToRgba(this.config.glowColor, this.config.maxGlowIntensity);
                this.sidebar.style.borderRight = `2px solid ${glowColor}`;
                this.sidebar.style.boxShadow = `0 0 25px ${glowColor}`;
            }, 50);
        }
    }

    animateClose() {
        if (this.sidebar) {
            this.sidebar.style.borderRight = '1px solid transparent';
            this.sidebar.style.boxShadow = '';
        }
    }

    resetSwipe() {
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
            document.documentElement.style.setProperty('--sidebar-width', `${this.sidebarWidth}px`);
        }
    }

    handleResize() {
        this.updateSidebarWidth();
        if (!this.isMobile() && this.isOpen) {
            this.close();
        }
    }

    hexToRgba(hex, alpha = 1) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

/**
 * Initialize sidebar
 */
export function initSidebar() {
    console.log('✅ Sidebar module initialized');

    const sidebarSwipe = new MobileSidebarSwipe({
        glowColor: '#0ea5e9',
        maxGlowIntensity: 0.6,
        swipeThreshold: 30,
        velocityThreshold: 0.3
    });

    return sidebarSwipe;
}

export { MobileSidebarSwipe };
