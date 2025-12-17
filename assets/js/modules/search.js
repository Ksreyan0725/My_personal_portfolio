/**
 * Search Module
 * Handles search modal, desktop search, and search functionality
 * Extracted from script.js lines 1232-2028
 */

// Import utilities
import { debounce, highlightMatches } from './utils.js';

// Constants
const RECENT_SEARCHES_KEY = 'recentSearchesV1';

// DOM Elements
const mobileSearchIcon = document.getElementById('mobileSearchIcon');
const tabletSearchBtn = document.getElementById('tabletSearchBtn');
const searchModal = document.getElementById('searchModal');
const searchModalClose = document.getElementById('searchModalClose');
const searchModalOverlay = document.getElementById('searchModalOverlay');
const searchModalInput = document.getElementById('searchModalInput');
const searchModalButton = document.getElementById('searchModalButton');
const searchResults = document.getElementById('searchResults');

// State
let currentResultIndex = -1;
let searchableContent = [
    { title: 'Home', description: 'Main page with profile and introduction', link: '#home' },
    { title: 'Education', description: 'BCA, Class 12, Class 10 details', link: '#education' },
    { title: 'Projects', description: 'CodePilot AI IDE, Research projects', link: '#projects' },
    { title: 'Certifications', description: 'Professional certifications and courses', link: '#certifications' },
    { title: 'Skills', description: 'Programming languages and technical skills', link: '#skills' },
    { title: 'Contact', description: 'Get in touch via email or social media', link: 'contact.html' },
    { title: 'Resume', description: 'Download resume PDF file', link: 'assets/docs/kumar-sreyan-pattanayak-resume.pdf' },
    { title: 'Download Resume', description: 'Download Kumar Sreyan Pattanayak resume PDF', link: 'assets/docs/kumar-sreyan-pattanayak-resume.pdf' },
    { title: 'CV', description: 'Curriculum Vitae - Resume PDF download', link: 'assets/docs/kumar-sreyan-pattanayak-resume.pdf' },
    { title: 'PDF', description: 'Resume in PDF format for download', link: 'assets/docs/kumar-sreyan-pattanayak-resume.pdf' },
    { title: 'Python', description: 'Programming language - Python development', link: '#skills' },
    { title: 'JavaScript', description: 'Programming language - Web development', link: '#skills' },
    { title: 'Web Development', description: 'HTML, CSS, JavaScript, React', link: '#skills' },
    { title: 'CodePilot AI IDE', description: 'AI-powered development environment project', link: '#projects' },
    { title: 'BCA', description: 'Bachelor of Computer Applications', link: '#education' },
    { title: 'Roland Institute of Technology', description: 'Current college', link: '#education' }
];

/**
 * Build search index from DOM
 */
function buildSearchIndex() {
    try {
        const items = [];

        // Sections
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

        // Resume/Download buttons
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

        // CTA buttons
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

        // Contact links
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

        // Merge and deduplicate
        const key = o => `${o.title}|${o.link}`.toLowerCase();
        const map = new Map(searchableContent.map(i => [key(i), i]));
        items.forEach(i => { if (!map.has(key(i))) map.set(key(i), i); });
        searchableContent = Array.from(map.values());
    } catch (e) {
        console.warn('Search index build warning:', e);
    }
}

/**
 * Get recent searches from localStorage
 */
function getRecentSearches() {
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); } catch { return []; }
}

/**
 * Add search to recent searches
 */
function addRecentSearch(q) {
    const list = getRecentSearches().filter(x => x.toLowerCase() !== q.toLowerCase());
    list.unshift(q);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list.slice(0, 5)));
}

/**
 * Render search suggestions
 */
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

/**
 * Handle link navigation
 */
function handleLinkNavigation(link, query) {
    addRecentSearch(query);

    if (link.includes('.pdf') && !link.toLowerCase().includes('download')) {
        window.open('pages/pdf-viewer.html?file=' + encodeURIComponent('../' + link), '_blank', 'noopener');
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
    closeSearchModal();
}

/**
 * Perform search
 */
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
            handleLinkNavigation(link, query);
        });
    });
}

/**
 * Open search modal
 */
export function openSearchModal() {
    if (!searchModal) return;

    searchModal.classList.add('active');
    searchModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; // Force scroll lock on html

    setTimeout(() => {
        searchModalInput.focus();
    }, 100);

    currentResultIndex = -1;

    if (!searchModalInput.value.trim()) {
        renderSuggestions();
    }
}

/**
 * Close search modal
 */
export function closeSearchModal() {
    if (!searchModal) return;

    searchModal.classList.add('closing');
    searchModalOverlay.classList.remove('active');

    setTimeout(() => {
        searchModal.classList.remove('active');
        searchModal.classList.remove('closing');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = ''; // Restore html scroll
        searchModalInput.value = '';
        searchResults.innerHTML = '';
        currentResultIndex = -1;
    }, 400);
}

/**
 * Show search notification message
 */
function showSearchNotification(inputElement, message) {
    // Remove any existing notification
    const existing = document.querySelector('.search-notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'search-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 8px;
        padding: 12px 16px;
        background: #c53434ff;
        border: 2px solid #ef4444;
        border-radius: 8px;
        color: #350101ff;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        animation: slideDown 0.3s ease;
    `;

    // Add CSS animation if not exists
    if (!document.getElementById('search-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'search-notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Insert after the search container
    const container = inputElement.closest('.desktop-search');
    if (container) {
        container.style.position = 'relative';
        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

/**
 * Desktop Search Dropdown Functionality
 */
const desktopSearchInputs = document.querySelectorAll('.desktop-search .search-input');
const desktopSearchButtons = document.querySelectorAll('.desktop-search .search-button');
const desktopSearchClears = document.querySelectorAll('.desktop-search .search-clear');
const desktopSearchResultsContainer = document.getElementById('desktopSearchResults');
let currentDesktopResultIndex = -1;

// Desktop gating (Desktop and larger - 900px+)
const desktopMql = window.matchMedia('(min-width: 900px)');
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

    container.innerHTML = headerHtml + `<div class="desktop-search-results-body">${bodyHtml}</div>`;
    container.classList.add('active');

    // Add click handlers to results
    container.querySelectorAll('.desktop-search-result-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const link = el.getAttribute('data-link');
            addRecentSearch(query);
            handleLinkNavigation(link, query);
            container.classList.remove('active');
        });
    });
}

// Debounced search for desktop
const debouncedDesktopSearch = debounce((query, container) => {
    showDesktopSearchResults(query, container);
}, 300);

/**
 * Initialize search functionality
 */
export function initSearch() {
    console.log('✅ Search module initialized');

    // Expose globally for compatibility
    window.closeSearchModal = closeSearchModal;
    window.openSearchModal = openSearchModal;

    // Build search index
    buildSearchIndex();

    // Mobile search icon
    if (mobileSearchIcon) {
        mobileSearchIcon.addEventListener('click', openSearchModal);
    }

    // Tablet search button
    if (tabletSearchBtn) {
        tabletSearchBtn.addEventListener('click', openSearchModal);
    }

    // Close button
    if (searchModalClose) {
        searchModalClose.addEventListener('click', closeSearchModal);
    }

    // Overlay click
    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', closeSearchModal);
    }

    // Search input
    if (searchModalInput) {
        const debounced = debounce((val) => doSearch(val), 150);
        searchModalInput.addEventListener('input', (e) => {
            debounced(e.target.value);
        });

        // Keyboard navigation
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
                    handleLinkNavigation(link, searchModalInput.value.trim());
                }
            }
        });
    }

    // Search button
    if (searchModalButton) {
        searchModalButton.addEventListener('click', () => {
            doSearch(searchModalInput.value);
        });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    // Desktop search event listeners
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
            const isCurrentlyDesktop = window.innerWidth >= 900;

            if (!isCurrentlyDesktop) {
                resultsContainer?.classList.remove('active');
                return;
            }
            if (query.length >= 1) {
                debouncedDesktopSearch(query, resultsContainer);
            } else {
                resultsContainer?.classList.remove('active');
            }
        });
        toggleClear();

        // Handle keyboard navigation
        input.addEventListener('keydown', (e) => {
            const isCurrentlyDesktop = window.innerWidth >= 900;
            if (!isCurrentlyDesktop) return;
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

                if (query.length === 0) {
                    showSearchNotification(input, 'Please enter something to search');
                    return;
                }

                if (items.length > 0) {
                    const active = items[currentDesktopResultIndex] || items[0];
                    const link = active.getAttribute('data-link');
                    addRecentSearch(query);
                    handleLinkNavigation(link, query);
                    resultsContainer.classList.remove('active');
                }
            } else if (e.key === 'Escape') {
                resultsContainer.classList.remove('active');
                currentDesktopResultIndex = -1;
            }
        });

        // Show results on focus if there's a query (desktop only)
        input.addEventListener('focus', () => {
            const isCurrentlyDesktop = window.innerWidth >= 900;
            if (!isCurrentlyDesktop) return;
            const query = input.value.trim();
            if (query.length >= 2 && resultsContainer) {
                showDesktopSearchResults(query, resultsContainer);
            }
        });
    });

    // Search button handlers
    desktopSearchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const container = button.closest('.desktop-search');
            const input = container?.querySelector('.search-input');
            const resultsContainer = container?.querySelector('.desktop-search-results');
            if (!input) return;

            const query = input.value.trim();
            const isCurrentlyDesktop = window.innerWidth >= 900;

            if (query.length === 0) {
                showSearchNotification(input, 'Please enter something to search');
                return;
            }

            if (isCurrentlyDesktop && resultsContainer) {
                showDesktopSearchResults(query, resultsContainer);
            } else {
                // On mobile/tablet, open the modal with results
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

    // Clear button handlers
    desktopSearchClears.forEach(clearBtn => {
        clearBtn.addEventListener('click', () => {
            const container = clearBtn.closest('.desktop-search');
            const input = container?.querySelector('.search-input');
            const resultsContainer = container?.querySelector('.desktop-search-results');
            if (input) {
                input.value = '';
                clearBtn.hidden = true;
                input.focus();
            }
            if (resultsContainer) {
                resultsContainer.classList.remove('active');
            }
        });
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.desktop-search')) {
            hideAllDesktopDropdowns();
        }
    });

    console.log(`✅ Desktop search initialized (${desktopSearchInputs.length} inputs)`);
}

// Export for use in other modules
export { buildSearchIndex, doSearch };

