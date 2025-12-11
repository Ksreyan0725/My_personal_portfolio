/**
 * Features Module
 * Handles skill bars, project filtering, and other UI features
 * Extracted from script.js (various sections)
 */

/**
 * Initialize skill bars animation
 */
export function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');

    if (skillBars.length === 0) return;

    // Set all bars to 0 width initially
    skillBars.forEach(bar => {
        bar.style.width = '0%';
        bar.style.transition = 'width 1.5s ease-out';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const widthValue = bar.getAttribute('data-width') || '0';
                const width = widthValue.includes('%') ? widthValue : widthValue + '%';

                // Delay slightly to ensure transition works
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);

                observer.unobserve(bar);
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => observer.observe(bar));
    console.log(`✅ Skill bars initialized (${skillBars.length} bars)`);
}

/**
 * Initialize project filtering
 */
export function initProjectFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length === 0 || projectCards.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    console.log(`✅ Project filtering initialized (${filterBtns.length} filters, ${projectCards.length} projects)`);
}

/**
 * Initialize scroll position restoration
 */
export function initScrollRestoration() {
    // Save scroll position before page unload
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    });

    // Restore scroll position on page load
    window.addEventListener('load', () => {
        const savedPosition = sessionStorage.getItem('scrollPosition');
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
                sessionStorage.removeItem('scrollPosition');
            }, 100);
        }
    });

    console.log('✅ Scroll restoration initialized');
}

/**
 * Initialize accessibility features
 */
export function initAccessibility() {
    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.documentElement.classList.add('reduce-motion');
        console.log('✅ Reduced motion enabled');
    }

    // Add keyboard navigation support
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');

    focusableElements.forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    el.click();
                }
            }
        });
    });

    console.log('✅ Accessibility features initialized');
}

/**
 * Initialize long-press to copy link (mobile)
 */
export function initLongPressCopy() {
    const links = document.querySelectorAll('a[href]');
    let pressTimer;

    links.forEach(link => {
        link.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                const url = link.href;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        showCopyNotification();
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                    });
                }
            }, 800); // 800ms long press
        });

        link.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        link.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    });

    console.log(`✅ Long-press copy initialized (${links.length} links)`);
}

/**
 * Show copy notification
 */
function showCopyNotification() {
    const notification = document.createElement('div');
    notification.textContent = 'Link copied!';
    notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-color);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeInOut 2s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

/**
 * Initialize all features
 */
export function initFeatures() {
    console.log('✅ Features module initialized');

    initSkillBars();
    initProjectFiltering();
    initScrollRestoration();
    initAccessibility();
    initLongPressCopy();
}
