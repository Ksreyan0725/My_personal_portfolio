/**
 * Navigation Module
 * Handles active navigation, scroll observers, and navbar effects
 * Extracted from script.js lines 2029-2836
 */

// DOM Elements
const sections = document.querySelectorAll('section[id], header[id]');
const desktopNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sidebarNavLinks = document.querySelectorAll('.sidebar-links a[href^="#"]');
const allNavLinks = [...desktopNavLinks, ...sidebarNavLinks];
const navbar = document.getElementById('navbar');

// State
let activeSectionId = 'home';
let observerInstance = null;

/**
 * Calculate dynamic offsets (navbar + banner)
 */
function getOffsets() {
    const navbar = document.getElementById('navbar');
    const noticeBanner = document.querySelector('.notice-banner');
    const navbarHeight = navbar ? navbar.offsetHeight : 48;
    const bannerHeight = noticeBanner ? noticeBanner.offsetHeight : 35;
    return navbarHeight + bannerHeight;
}

/**
 * Update active navigation link
 */
function updateActiveLink(sectionId) {
    allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');

        const normalizedHref = href.replace(/^.*#/, '#');
        if (normalizedHref === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Highlight active navigation based on scroll position
 */
function highlightActiveNav() {
    const totalOffset = getOffsets();
    const scrollPos = window.scrollY;
    const activationPoint = scrollPos + totalOffset + 50;

    let currentSection = null;
    let bestScore = -Infinity;

    if (scrollPos < 80) {
        currentSection = 'home';
    } else {
        sections.forEach(section => {
            const sectionId = section.getAttribute('id');
            if (!sectionId) return;

            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollPos;
            const sectionBottom = sectionTop + rect.height;

            const isInSection = activationPoint >= sectionTop && activationPoint <= sectionBottom;
            const hasPassedActivation = sectionTop <= activationPoint;

            if (isInSection || hasPassedActivation) {
                const distanceFromTop = Math.abs(activationPoint - sectionTop);
                const sectionHeight = rect.height;
                const normalizedDistance = distanceFromTop / Math.max(sectionHeight, 100);

                let score = 1000 - normalizedDistance;

                if (isInSection) {
                    score += 500;
                }

                if (score > bestScore) {
                    bestScore = score;
                    currentSection = sectionId;
                }
            }
        });

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

            currentSection = closestSection || 'home';
        }
    }

    if (currentSection) {
        updateActiveLink(currentSection);
    }
}

/**
 * Setup Intersection Observer for sections
 */
function setupObserver() {
    if (observerInstance) {
        sections.forEach(section => {
            if (section.getAttribute('id')) {
                observerInstance.unobserve(section);
            }
        });
        observerInstance.disconnect();
    }

    const totalOffset = getOffsets();
    const rootMargin = `-${totalOffset + 50}px 0px -50% 0px`;

    observerInstance = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                if (sectionId) {
                    activeSectionId = sectionId;
                    updateActiveLink(sectionId);
                }
            }
        });
    }, {
        root: null,
        rootMargin: rootMargin,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
    });

    sections.forEach(section => {
        if (section.getAttribute('id')) {
            observerInstance.observe(section);
        }
    });
}

/**
 * Handle navbar scroll effect
 */
function handleNavbarScroll() {
    if (!navbar) return;

    const scrollThreshold = 50;

    if (window.scrollY > scrollThreshold) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

/**
 * Initialize navigation
 */
export function initNavigation() {
    console.log('✅ Navigation module initialized');

    // Setup observer
    setupObserver();

    // Initial highlight
    highlightActiveNav();

    // Scroll event listener (throttled)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        handleNavbarScroll();

        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            highlightActiveNav();
        });
    }, { passive: true });

    // Smooth scroll for nav links
    allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const targetId = href.replace(/^.*#/, '');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                e.preventDefault();
                const totalOffset = getOffsets();
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - totalOffset;

                // Check if desktop (>= 1024px)
                const isDesktop = window.innerWidth >= 1024;

                if (isDesktop && window.lenis) {
                    // Use Lenis for instant jump
                    window.lenis.scrollTo(targetSection, { immediate: true, offset: -totalOffset });
                    // Also fire native scrollTo as backup/sync
                    window.scrollTo({ top: targetPosition, behavior: 'auto' });
                } else {
                    // Default behavior
                    window.scrollTo({
                        top: targetPosition,
                        behavior: isDesktop ? 'auto' : 'smooth'
                    });
                }

                updateActiveLink(targetId);
            }
        });
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
        setupObserver();
    });

    // Logo Click to Reload
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        const reloadPage = () => {
            // Add clicked class for animation
            navLogo.classList.add('clicked');

            // Wait for animation to complete before reload
            setTimeout(() => {
                // Reload page from server (ignore cache) to ensure fresh load
                window.location.reload(true);
            }, 600); // Match animation duration
        };

        navLogo.addEventListener('click', reloadPage);

        // Accessibility: Allow Enter key to trigger
        navLogo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                reloadPage();
            }
        });
    }
}

// Export for use in other modules
export { updateActiveLink, highlightActiveNav, getOffsets };

