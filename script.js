// Modern Portfolio JavaScript with Ripple Animations

document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;
    const body = document.body;

    /* ==================== Ripple Animation Functions ==================== */
    // Ripple animation function for buttons
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
        
        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Full-page theme transition ripple
    function createPageRipple(event) {
        const ripple = document.createElement('div');
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        ripple.className = 'page-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        document.body.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => ripple.remove(), 800);
    }
    
    // Theme transition wave from settings gear
    function createThemeTransitionWave(targetTheme) {
        const settingsGear = document.getElementById('settingsGear');
        if (!settingsGear) return;
        
        const ripple = document.createElement('div');
        const rect = settingsGear.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        ripple.className = 'page-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        // Determine actual theme (handle 'system' preference)
        let actualTheme = targetTheme;
        if (targetTheme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            actualTheme = systemPrefersDark ? 'dark' : 'light';
        }
        
        // Set data attribute to style the ripple based on target theme
        ripple.setAttribute('data-target-theme', actualTheme);
        
        document.body.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => ripple.remove(), 800);
    }

    /* ==================== Settings Gear Theme Selector ==================== */
    const settingsGear = document.getElementById('settingsGear');
    const themeDropdown = document.getElementById('themeDropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    if (settingsGear && themeDropdown && themeOptions.length > 0) {
        // Load saved theme preference - supports GitHub Pages with fallback
        let savedThemePreference = 'system';
        try {
            savedThemePreference = localStorage.getItem('themePreference') || 'system';
        } catch (e) {
            console.warn('localStorage not available, using default theme');
        }
        
        // Apply theme based on preference
        function applyTheme(preference, animate = false) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            let theme;
            
            if (preference === 'system') {
                theme = systemPrefersDark ? 'dark' : 'light';
            } else {
                theme = preference;
            }
            
            // Add transition class for smooth animation
            if (animate) {
                htmlElement.classList.add('theme-transitioning');
            }
            
            // Apply theme
            htmlElement.setAttribute('data-theme', theme);
            document.body.classList.toggle('darkmode', theme === 'dark');
            
            // Update active theme option
            themeOptions.forEach(option => {
                option.classList.toggle('active', option.dataset.theme === preference);
            });
            
            // Remove transition class after animation completes
            if (animate) {
                setTimeout(() => {
                    htmlElement.classList.remove('theme-transitioning');
                }, 600);
            }
        }
        
        // Initialize with saved preference
        applyTheme(savedThemePreference);
        
        // Listen for system theme changes if system default is selected
        const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        systemThemeMedia.addEventListener('change', () => {
            let currentPreference = 'system';
            try {
                currentPreference = localStorage.getItem('themePreference') || 'system';
            } catch (e) {
                currentPreference = 'system';
            }
            if (currentPreference === 'system') {
                applyTheme('system', true);
            }
        });
        
        // Toggle dropdown - Optimized for performance
        settingsGear.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const isOpen = themeDropdown.classList.contains('show');
            
            if (isOpen) {
                themeDropdown.classList.remove('show');
                settingsGear.classList.remove('active');
            } else {
                themeDropdown.classList.add('show');
                settingsGear.classList.add('active');
            }
        }, { passive: false });
        
        // Handle theme selection
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedTheme = option.dataset.theme;
                
                // Create wave transition effect from settings gear
                createThemeTransitionWave(selectedTheme);
                
                // Save preference with error handling for GitHub Pages
                try {
                    localStorage.setItem('themePreference', selectedTheme);
                } catch (e) {
                    console.warn('Unable to save theme preference');
                }
                
                // Apply theme with smooth animation after slight delay for ripple to start
                setTimeout(() => {
                    applyTheme(selectedTheme, true);
                }, 50);
                
                // Close dropdown with slight delay
                setTimeout(() => {
                    themeDropdown.classList.remove('show');
                    settingsGear.classList.remove('active');
                }, 150);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsGear.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.remove('show');
                settingsGear.classList.remove('active');
            }
        });
        
        // Close dropdown with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && themeDropdown.classList.contains('show')) {
                themeDropdown.classList.remove('show');
                settingsGear.classList.remove('active');
                settingsGear.focus();
            }
        });
    }

    /* ==================== Backdrop-filter Fallback & Reduced Motion ==================== */
    const supportsBackdrop = CSS && CSS.supports && (CSS.supports('backdrop-filter: blur(1px)') || CSS.supports('-webkit-backdrop-filter: blur(1px)'));
    if (!supportsBackdrop) {
        body.classList.add('no-backdrop');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function applyMotionPreference() {
        if (prefersReducedMotion.matches) {
            // Minimize non-essential animations for accessibility
            document.querySelectorAll('.card-glass, .button-glass').forEach(el => {
                el.style.transitionDuration = '0.01ms';
            });
        }
    }
    applyMotionPreference();
    prefersReducedMotion.addEventListener?.('change', applyMotionPreference);

    /* ==================== Mobile Navigation ==================== */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        // Initialize ARIA state for accessibility
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!expanded));
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ==================== Smooth Scrolling & Active Navigation ==================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Highlight active section in navigation
    function highlightActiveNav() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveNav);
    highlightActiveNav(); // Call on load

    /* ==================== Skill Bars Animation ==================== */
    let skillBarsAnimated = false;
    
    function animateSkillBars() {
        if (skillBarsAnimated) return; // Prevent re-animation
        skillBarsAnimated = true;
        
        // Faster animation on mobile devices
        const isMobileDevice = window.innerWidth <= 768;
        const animationSpeed = isMobileDevice ? 25 : 50;
        const staggerDelay = isMobileDevice ? 50 : 100;
        
        document.querySelectorAll('.progress').forEach((bar, index) => {
            const value = bar.getAttribute('data-value');
            const numericValue = parseInt(value);
            
            // Skip animation for 0% bars - keep them empty but show label
            if (value && numericValue > 0) {
                // Delay each bar animation slightly for a staggered effect
                setTimeout(() => {
                    bar.style.width = value + '%';
                    
                    // Animate percentage number from 0 to final value
                    let currentPercent = 0;
                    const targetPercent = numericValue;
                    const increment = isMobileDevice ? Math.max(targetPercent / 15, 2) : Math.max(targetPercent / 30, 1);
                    
                    const percentInterval = setInterval(() => {
                        currentPercent += increment;
                        if (currentPercent >= targetPercent) {
                            currentPercent = targetPercent;
                            clearInterval(percentInterval);
                        }
                        const display = Math.round(currentPercent);
                        // Update both the fill and its container so CSS can read it from the container
                        bar.setAttribute('data-value', display);
                        if (bar.parentElement) {
                            bar.parentElement.setAttribute('data-value', display);
                        }
                    }, animationSpeed);
                }, index * staggerDelay);
            } else if (numericValue === 0) {
                // Ensure 0% bars stay at 0 width but keep data-value for label
                bar.style.width = '0%';
                bar.setAttribute('data-value', '0');
            }
        });
    }

    /* ==================== Intersection Observer for Animations ==================== */
    // Use lower threshold for smaller screens for better performance
    const isMobile = window.innerWidth <= 768;
    const observerOptions = {
        threshold: isMobile ? 0.1 : 0.2,
        rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate skill bars when skills section is visible
                if (entry.target.classList.contains('skills')) {
                    animateSkillBars();
                }
                // Add smooth reveal class
                entry.target.classList.add('in-view');
                
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply base reveal class and observe
    document.querySelectorAll('.skills, .achievement-card, .detail-item, .timeline-item, .glass-panel').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Also observe the timeline element itself for the vertical line animation
    const timelineElement = document.querySelector('.timeline');
    if (timelineElement) {
        observer.observe(timelineElement);
    }

    /* ==================== Contact Form with Formspree Backend ==================== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('.submit-button');
            const formStatus = document.getElementById('form-status');
            const originalText = submitButton.textContent;
            
            // Update button state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            formStatus.textContent = '';
            formStatus.style.color = '';
            
            // Prepare form data
            const formData = new FormData(contactForm);
            
            try {
                // Submit to Formspree
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Success
                    formStatus.textContent = '✓ Thank you for your message! I will get back to you soon.';
                    formStatus.style.color = '#10b981'; // Green color
                    contactForm.reset();
                } else {
                    // Error from Formspree
                    const data = await response.json();
                    if (data.errors) {
                        formStatus.textContent = '✗ ' + data.errors.map(error => error.message).join(', ');
                    } else {
                        formStatus.textContent = '✗ Oops! There was a problem submitting your form.';
                    }
                    formStatus.style.color = '#ef4444'; // Red color
                }
            } catch (error) {
                // Network or other error
                formStatus.textContent = '✗ Oops! There was a problem submitting your form. Please try again.';
                formStatus.style.color = '#ef4444'; // Red color
                console.error('Form submission error:', error);
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    /* ==================== Navbar Hide/Show on Scroll ==================== */
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    // if (navbar) {
    //     window.addEventListener('scroll', () => {
    //         const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
    //         // Hide navbar on scroll down, show on scroll up
    //         if (scrollTop > lastScrollTop && scrollTop > 100) {
    //             navbar.style.transform = 'translateY(-100%)';
    //         } else {
    //             navbar.style.transform = 'translateY(0)';
    //         }
            
    //         lastScrollTop = scrollTop;
    //     });
    // }

    /* ==================== Notification Panel Animation ==================== */
    const notificationPanel = document.getElementById('notificationPanel');
    
    if (notificationPanel) {
        // Show notification after page loads
        setTimeout(() => {
            notificationPanel.classList.add('show');
            
            // Hide notification after 5 seconds (slide out to left)
            setTimeout(() => {
                notificationPanel.classList.remove('show');
                notificationPanel.classList.add('hide');
            }, 5000);
        }, 1000); // Wait 1 second after page load before showing
    }

});


// Redirect to thank-you.html on form submission
const form = document.getElementById('myForm');

if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from actually submitting

        // You can do any validation or processing here if needed

        // Redirect to thank-you.html
        window.location.href = 'thank-you.html';
    });
}
