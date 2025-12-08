// Contact Page JavaScript - Complete Independent Functionality

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {

    // ==================== Theme Toggle ====================
    const themeToggle = document.getElementById("themeToggle");
    const html = document.documentElement;
    const themeIcon = themeToggle.querySelector(".theme-icon");
    const themeText = themeToggle.querySelector(".theme-text");

    const themes = [
        { name: "system", icon: "⚙️", text: "System" },
        { name: "light", icon: "☀️", text: "Light" },
        { name: "dark", icon: "🌙", text: "Dark" },
    ];

    let currentThemeIndex = 0;

    // Load saved theme
    const savedTheme = localStorage.getItem("theme") || "system";
    currentThemeIndex = themes.findIndex((t) => t.name === savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;

    function applyTheme(themeName) {
        if (themeName === "system") {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            html.setAttribute("data-theme", prefersDark ? "dark" : "light");
        } else {
            html.setAttribute("data-theme", themeName);
        }
    }

    // Initialize theme
    applyTheme(themes[currentThemeIndex].name);
    updateThemeButton(currentThemeIndex);

    // Listen for system theme changes when in system mode
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
            if (themes[currentThemeIndex].name === "system") {
                html.setAttribute("data-theme", e.matches ? "dark" : "light");
            }
        });

    // Reapply theme when page becomes visible (handles browser minimize/restore)
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            const storedTheme = localStorage.getItem("theme") || "system";
            const storedIndex = themes.findIndex((t) => t.name === storedTheme);
            if (storedIndex !== -1) {
                currentThemeIndex = storedIndex;
                applyTheme(storedTheme);
                updateThemeButton(currentThemeIndex);
            }
        }
    });

    // Reapply theme when window regains focus (handles browser reopen)
    window.addEventListener("focus", () => {
        const storedTheme = localStorage.getItem("theme") || "system";
        const storedIndex = themes.findIndex((t) => t.name === storedTheme);
        if (storedIndex !== -1) {
            currentThemeIndex = storedIndex;
            applyTheme(storedTheme);
            updateThemeButton(currentThemeIndex);
        }
    });

    // Toggle theme on click
    themeToggle.addEventListener("click", () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const currentTheme = themes[currentThemeIndex].name;

        applyTheme(currentTheme);
        updateThemeButton(currentThemeIndex);
        localStorage.setItem("theme", currentTheme);
    });

    function updateThemeButton(index) {
        const theme = themes[index];
        const themeIcon = themeToggle.querySelector(".theme-icon");
        const themeText = themeToggle.querySelector(".theme-text");

        if (themeIcon) {
            // Update icon source based on theme
            if (theme.name === 'system') {
                themeIcon.src = 'assets/icons/system-theme.png';
            } else if (theme.name === 'light') {
                themeIcon.src = 'assets/icons/light-mode.png';
            } else if (theme.name === 'dark') {
                themeIcon.src = 'assets/icons/dark-mode.png';
            }
        }

        if (themeText) {
            themeText.textContent = theme.text;
        }
    }

    // ==================== Contact Page Search ====================
    (function initContactSearch() {
        const container = document.querySelector('.search-container');
        if (!container) return;
        const input = container.querySelector('.search-input');
        const btn = container.querySelector('.search-button');
        const clearBtn = container.querySelector('.search-clear');
        const resultsEl = container.querySelector('#desktopSearchResults') || container.querySelector('.desktop-search-results');

        const toggleClear = () => {
            if (!clearBtn) return;
            const show = input.value.trim().length > 0;
            clearBtn.hidden = !show;
        };

        input.addEventListener('input', (e) => {
            toggleClear();
            const q = e.target.value.trim();
            if (q.length >= 2) {
                renderResults(q);
            } else {
                resultsEl?.classList.remove('active');
                resultsEl?.replaceChildren();
            }
        });
        toggleClear();

        clearBtn?.addEventListener('click', () => {
            input.value = '';
            clearBtn.hidden = true;
            input.focus();
        });

        function showSearchMessage(message, isError = false) {
            let msgEl = container.querySelector('.search-error');
            if (!msgEl) {
                msgEl = document.createElement('div');
                msgEl.className = 'search-error';
                container.appendChild(msgEl);
            }
            msgEl.textContent = message;
            if (isError) {
                msgEl.style.background = 'rgba(239, 68, 68, 0.95)';
                msgEl.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                msgEl.style.boxShadow = '0 10px 24px rgba(239, 68, 68, 0.35)';
            } else {
                msgEl.style.background = 'rgba(99, 102, 241, 0.95)';
                msgEl.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                msgEl.style.boxShadow = '0 10px 24px rgba(99, 102, 241, 0.35)';
            }
            requestAnimationFrame(() => {
                msgEl.classList.add('show');
            });
            setTimeout(() => {
                msgEl.classList.remove('show');
                setTimeout(() => msgEl.remove(), 250);
            }, 2500);
        }

        function getDataset() {
            try {
                if (typeof searchableContent !== 'undefined' && Array.isArray(searchableContent)) {
                    return searchableContent;
                }
            } catch { }
            return [
                { title: 'Home', description: 'Go to home', link: 'index.html#home' },
                { title: 'Projects', description: 'View projects', link: 'index.html#projects' },
                { title: 'Skills', description: 'View skills', link: 'index.html#skills' },
                { title: 'Contact', description: 'Contact page', link: 'contact.html' },
            ];
        }

        function renderResults(query) {
            if (!resultsEl) return;
            const items = getDataset();
            const q = query.toLowerCase();
            const tokens = q.split(/\s+/).filter(Boolean);
            const ranked = items
                .map(item => {
                    const hay = (item.title + ' ' + item.description).toLowerCase();
                    const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) +
                        (item.title.toLowerCase().startsWith(q) ? 2 : 0) +
                        (item.title.toLowerCase().includes(q) ? 1 : 0);
                    return { item, score };
                })
                .filter(x => x.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 6);

            resultsEl.replaceChildren();
            if (!ranked.length) {
                const empty = document.createElement('div');
                empty.className = 'desktop-search-result-item no-results';
                empty.setAttribute('role', 'status');
                empty.textContent = 'No results found';
                resultsEl.appendChild(empty);
                resultsEl.classList.add('active');
                return;
            }
            ranked.forEach(({ item }) => {
                const el = document.createElement('div');
                el.className = 'desktop-search-result-item';
                el.setAttribute('data-link', item.link);
                el.innerHTML = `<div class="desktop-search-result-title">${item.title}</div>
                      <div class="desktop-search-result-desc">${item.description}</div>`;
                el.addEventListener('click', () => {
                    window.location.href = item.link;
                });
                resultsEl.appendChild(el);
            });
            resultsEl.classList.add('active');
        }

        btn?.addEventListener('click', () => {
            const q = input.value.trim();
            if (q.length >= 2) {
                renderResults(q);
                const first = resultsEl?.querySelector('.desktop-search-result-item');
                const link = first?.getAttribute('data-link');
                if (link) window.location.href = link;
            } else if (q.length > 0) {
                showSearchMessage('Please enter at least 2 characters to search', true);
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = input.value.trim();
                if (q.length >= 2) {
                    renderResults(q);
                    const first = resultsEl?.querySelector('.desktop-search-result-item');
                    const link = first?.getAttribute('data-link');
                    if (link) window.location.href = link;
                } else if (q.length > 0) {
                    showSearchMessage('Please enter at least 2 characters to search', true);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                resultsEl?.classList.remove('active');
            }
        });
    })();

    // ==================== Long-Press to Copy Link (Mobile) ====================
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function initLongPressCopy() {
        if (!isTouchDevice) return;

        const links = document.querySelectorAll('.social-icons a, a[href*="github.com"], a[href*="linkedin.com"], a[href*="facebook.com"], a[href*="x.com"], a[href*="instagram.com"], a[href*="youtube.com"]');

        links.forEach(link => {
            let pressTimer = null;
            let touchMoved = false;
            let touchStartX = 0;
            let touchStartY = 0;

            link.addEventListener('touchstart', (e) => {
                touchMoved = false;
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;

                pressTimer = setTimeout(() => {
                    if (!touchMoved) {
                        const url = link.href;

                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(url)
                                .then(() => showCopyFeedback('Link copied!'))
                                .catch(() => fallbackCopyToClipboard(url));
                        } else {
                            fallbackCopyToClipboard(url);
                        }
                        e.preventDefault();
                    }
                }, 600);
            }, { passive: false });

            link.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartX);
                const deltaY = Math.abs(touch.clientY - touchStartY);

                if (deltaX > 10 || deltaY > 10) {
                    touchMoved = true;
                    clearTimeout(pressTimer);
                }
            }, { passive: true });

            link.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            }, { passive: true });

            link.addEventListener('touchcancel', () => {
                clearTimeout(pressTimer);
            }, { passive: true });
        });
    }

    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            showCopyFeedback(successful ? 'Link copied!' : 'Copy failed', !successful);
        } catch (err) {
            showCopyFeedback('Copy failed', true);
        }
        document.body.removeChild(textArea);
    }

    function showCopyFeedback(message, isError = false) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

        if (!document.getElementById('copyFeedbackStyles')) {
            const style = document.createElement('style');
            style.id = 'copyFeedbackStyles';
            style.textContent = `
            @keyframes toastFadeIn {
                from { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(-20px);
                }
                to { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes toastFadeOut {
                from { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0);
                }
                to { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(-10px);
                }
            }
        `;
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(-50%) translateY(0)';
        });

        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(-50%) translateY(-10px)';

            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    // Initialize long-press functionality
    initLongPressCopy();

    // ==================== Share Target API Handler ====================
    const params = new URLSearchParams(window.location.search);
    if (params.has('subject')) {
        const subjectField = document.getElementById('subject');
        if (subjectField) {
            const options = Array.from(subjectField.options).map(opt => opt.value);
            if (options.includes(params.get('subject'))) {
                subjectField.value = params.get('subject');
            } else {
                subjectField.value = 'general';
            }
        }
    }
    if (params.has('message')) {
        const messageField = document.getElementById('message');
        if (messageField) {
            let messageText = params.get('message');
            if (params.has('url')) {
                messageText += `\n\nShared URL: ${params.get('url')}`;
            }
            messageField.value = messageText;
        }
    }

    // Form Validation and Accessibility
    (function () {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const submitButton = form.querySelector('.submit-button');

        // Validation rules
        const validators = {
            name: (value) => {
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            },
            email: (value) => {
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                return '';
            },
            phone: (value) => {
                // Optional field
                if (!value.trim()) return '';
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
                return '';
            },
            subject: (value) => {
                if (!value) return 'Please select a subject';
                return '';
            },
            message: (value) => {
                if (!value.trim()) return 'Message is required';
                if (value.trim().length < 10) return 'Message must be at least 10 characters';
                return '';
            }
        };

        // Validate single field
        function validateField(field) {
            const fieldName = field.name;
            const errorSpan = document.getElementById(`${fieldName}-error`);
            if (!errorSpan) return true;

            const errorMessage = validators[fieldName](field.value);

            if (errorMessage) {
                field.setAttribute('aria-invalid', 'true');
                errorSpan.textContent = errorMessage;
                errorSpan.classList.add('active');
                return false;
            } else {
                field.setAttribute('aria-invalid', 'false');
                errorSpan.textContent = '';
                errorSpan.classList.remove('active');
                return true;
            }
        }

        // Add blur validation to all fields
        ['name', 'email', 'phone', 'subject', 'message'].forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => validateField(field));
                field.addEventListener('input', () => {
                    // Clear error on input if field was invalid
                    if (field.getAttribute('aria-invalid') === 'true') {
                        validateField(field);
                    }
                });
            }
        });

        // Form submission
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Honeypot check (Spam Protection)
            const honeypot = form.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                form.reset();
                return;
            }

            // Fix for Formspree subject: Update hidden _subject input with selected value
            const subjectInput = document.getElementById("subject");
            const subjectHidden = form.querySelector('input[name="_subject"]');
            if (subjectHidden && subjectInput && subjectInput.value) {
                subjectHidden.value = `New submission: ${subjectInput.value}`;
            }

            // Validate all fields
            let isValid = true;
            ['name', 'email', 'phone', 'subject', 'message'].forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field && !validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                // Focus first invalid field
                const firstInvalid = form.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Show loading state
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending';

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    form.reset();
                    // Reset all aria-invalid states
                    ['name', 'email', 'phone', 'subject', 'message'].forEach(fieldName => {
                        const field = document.getElementById(fieldName);
                        if (field) field.setAttribute('aria-invalid', 'false');
                    });
                    showToast('Message sent successfully!', 'success');
                    // Redirect to thank you page after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = 'pages/thank-you.html';
                    }, 1500);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                showToast('Failed to send message. Please try again.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = originalText;
            }
        });

        // Toast notification function
        function showToast(message, type = 'success') {
            const toast = document.getElementById('contactToast');
            if (!toast) return;

            toast.textContent = message;
            toast.className = `toast ${type} active`;

            setTimeout(() => {
                toast.classList.remove('active');
            }, 4000);
        }

        // Handle Share Target API data
        const params = new URLSearchParams(window.location.search);
        if (params.has('subject')) {
            const subjectField = document.getElementById('subject');
            if (subjectField) {
                // Check if the value exists in options, if not set to general or append
                const options = Array.from(subjectField.options).map(opt => opt.value);
                if (options.includes(params.get('subject'))) {
                    subjectField.value = params.get('subject');
                } else {
                    subjectField.value = 'general'; // Default fallback
                }
            }
        }
        if (params.has('message')) {
            const messageField = document.getElementById('message');
            if (messageField) {
                let messageText = params.get('message');
                if (params.has('url')) {
                    messageText += `\n\nShared URL: ${params.get('url')}`;
                }
                messageField.value = messageText;
            }
        }
    })(); // Close Form Validation IIFE

    // ==================== Swipe Back Navigation (PWA) ====================
    (function initSwipeBackNavigation() {
        // Only enable in PWA mode or mobile devices
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isPWA && !isMobile) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentX = 0;
        let isSwiping = false;
        const swipeThreshold = 100; // Minimum swipe distance
        const edgeThreshold = 50;   // Must start from left edge

        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            // Only start swipe if touch starts from left edge
            if (touchStartX <= edgeThreshold) {
                isSwiping = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;

            const touch = e.touches[0];
            touchCurrentX = touch.clientX;
            const touchCurrentY = touch.clientY;

            const deltaX = touchCurrentX - touchStartX;
            const deltaY = Math.abs(touchCurrentY - touchStartY);

            // Only continue if horizontal swipe (not vertical scroll)
            if (deltaY > 30) {
                isSwiping = false;
                return;
            }

            // Visual feedback: slightly move the page
            if (deltaX > 0 && deltaX < 200) {
                document.body.style.transform = `translateX(${deltaX * 0.3}px)`;
                document.body.style.transition = 'none';
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (!isSwiping) return;

            const deltaX = touchCurrentX - touchStartX;

            // Reset visual feedback
            document.body.style.transform = '';
            document.body.style.transition = 'transform 0.3s ease';

            // Navigate back if swipe distance exceeds threshold
            if (deltaX > swipeThreshold) {
                // Add fade-out animation
                document.body.style.opacity = '0.7';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 150);
            }

            isSwiping = false;
            touchCurrentX = 0;
        }, { passive: true });

        document.addEventListener('touchcancel', () => {
            isSwiping = false;
            touchCurrentX = 0;
            document.body.style.transform = '';
            document.body.style.transition = 'transform 0.3s ease';
        }, { passive: true });

        console.log('Swipe-back navigation initialized for contact page');
    })();

    // ==================== Back Button Navigation (PWA) ====================
    (function initBackButtonNavigation() {
        // Handle browser/device back button
        // Push a state to enable back button detection
        if (window.history.state === null) {
            window.history.pushState({ page: 'contact' }, '', window.location.href);
        }

        // Listen for back button press
        window.addEventListener('popstate', (event) => {
            // Navigate to index.html when back button is pressed
            window.location.href = 'index.html';
        });

        console.log('Back button navigation initialized for contact page');
    })();

}); // Close DOMContentLoaded wrapper