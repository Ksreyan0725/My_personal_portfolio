// Modern Portfolio JavaScript with Ripple Animations

// Detect touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;
    const body = document.body;
    // Default to 'system' if no preference is saved
    let currentTheme = localStorage.getItem('theme') || 'system';
    // Allowed mailto recipients (enforced site-wide)
    const ALLOWED_MAILTO = new Set(['sreyanpattanayak@zohomail.com']);

    // Add touch device class if needed
    if (isTouchDevice) {
        document.documentElement.classList.add('touch-device');
    }

    /* ==================== Theme Management ==================== */
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
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
            const themeIcon = themeToggle.querySelector('.theme-icon');
            const themeText = themeToggle.querySelector('.theme-text');
            
            if (themeIcon && themeText) {
                // Show gear icon for System mode, sun/moon for explicit Light/Dark
                themeIcon.textContent = theme === 'system' ? '⚙️' : 
                                      theme === 'dark' ? '🌙' : '☀️';
                // Keep the label as the selected mode (System/Light/Dark)
                themeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
            }
        }

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
    const menuIcon = document.getElementById('menuIcon');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');

    // Open sidebar
    function openSidebar() {
        sidebarMenu.classList.add('active');
        sidebarOverlay.classList.add('active');
        menuIcon.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close sidebar
    function closeSidebar() {
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        menuIcon.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Event listeners
    if (menuIcon) {
        menuIcon.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking a link
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeSidebar();
        });
    });

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarMenu.classList.contains('active')) {
            closeSidebar();
        }
    });

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

    // Searchable content from the page
    let searchableContent = [
        { title: 'Home', description: 'Main page with profile and introduction', link: '#home' },
        { title: 'Education', description: 'BCA, Class 12, Class 10 details', link: '#education' },
        { title: 'Projects', description: 'CodePilot AI IDE, Research projects', link: '#projects' },
        { title: 'Certifications', description: 'Professional certifications and courses', link: '#certifications' },
        { title: 'Skills', description: 'Programming languages and technical skills', link: '#skills' },
        { title: 'Contact', description: 'Get in touch via email or social media', link: 'contact.html' },
        { title: 'Services', description: 'Professional services offered', link: 'service.html' },
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
            document.querySelectorAll('a[href*="contact"], a[href*="service"]').forEach(link => {
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

    // Close search modal
    function closeSearchModal() {
        searchModal.classList.remove('active');
        searchModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchModalInput.value = '';
        searchResults.innerHTML = '';
        currentResultIndex = -1;
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
                    window.open('pdf-viewer.html?file=' + encodeURIComponent(link), '_blank', 'noopener');
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
    // Mobile search icon opens the search modal
    if (mobileSearchIcon) {
        mobileSearchIcon.addEventListener('click', openSearchModal);
    }

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
                        window.open('pdf-viewer.html?file=' + encodeURIComponent(link), '_blank', 'noopener');
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

    // Add search functionality to desktop search bars (open modal, reuse same engine)
    const desktopSearchInputs = document.querySelectorAll('.desktop-search .search-input');
    const desktopSearchButtons = document.querySelectorAll('.desktop-search .search-button');
    const desktopSearchClears = document.querySelectorAll('.desktop-search .search-clear');

    desktopSearchInputs.forEach(input => {
        // toggle clear button visibility
        const container = input.closest('.desktop-search');
        const clearBtn = container?.querySelector('.search-clear');
        const toggleClear = () => {
            if (!clearBtn) return;
            const show = input.value.trim().length > 0;
            clearBtn.hidden = !show;
        };
        input.addEventListener('input', toggleClear);
        // initialize
        toggleClear();

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query.length < 4) {
                    // Show inline message for validation
                    showDesktopSearchMessage(input, 'Please enter at least 4 characters to search', true);
                    return;
                }
                openSearchModal();
                setTimeout(() => {
                    searchModalInput.value = input.value;
                    doSearch(input.value);
                }, 150);
            }
        });
    });

    desktopSearchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.closest('.desktop-search')?.querySelector('.search-input');
            if (input && input.value.trim()) {
                const query = input.value.trim();
                if (query.length < 4) {
                    showDesktopSearchMessage(input, 'Please enter at least 4 characters to search', true);
                    return;
                }
                openSearchModal();
                setTimeout(() => {
                    searchModalInput.value = input.value;
                    doSearch(input.value);
                }, 150);
            } else {
                openSearchModal();
            }
        });
    });

    desktopSearchClears.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement?.querySelector('.search-input');
            if (input) {
                input.value = '';
                btn.hidden = true;
                input.focus();
            }
        });
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
    } catch {}

    /* ==================== Smooth Scrolling & Active Navigation ==================== */
    const sections = document.querySelectorAll('section[id], header[id]');
    const desktopNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sidebarNavLinks = document.querySelectorAll('.sidebar-links a[href^="#"]');
    const allNavLinks = [...desktopNavLinks, ...sidebarNavLinks];

    function highlightActiveNav() {
        // Get navbar height to offset scroll position
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const scrollPos = window.scrollY + navbarHeight + 10;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            // Check if we're in this section
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // If we're at the very top, make sure home is active
        if (window.scrollY < 100) {
            currentSection = 'home';
        }
        
        // Update all nav links
        if (currentSection) {
            allNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', highlightActiveNav);
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
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('.submit-button');
            const formStatus = document.getElementById('form-status');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            formStatus.textContent = '';
            formStatus.style.color = '';
            
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    formStatus.textContent = '✓ Thank you for your message! I will get back to you soon.';
                    formStatus.style.color = '#10b981';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    formStatus.textContent = '✗ ' + (data.errors ? 
                        data.errors.map(error => error.message).join(', ') :
                        'Oops! There was a problem submitting your form.');
                    formStatus.style.color = '#ef4444';
                }
            } catch (error) {
                formStatus.textContent = '✗ Oops! There was a problem submitting your form. Please try again.';
                formStatus.style.color = '#ef4444';
                console.error('Form submission error:', error);
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

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
            window.location.href = '404.html';
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
                    window.location.href = '404.html';
                }
            } catch (_) {
                e.preventDefault();
                window.location.href = '404.html';
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
                window.location.href = '404.html';
            }
        } catch (err) {
            // Network or fetch error -> route to 404
            e.preventDefault();
            window.location.href = '404.html';
        }
    }, true); // capture phase to intercept early
});