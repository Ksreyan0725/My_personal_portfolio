// Service Worker for Portfolio PWA
// Version 3.5 - Fixed cache paths
const CACHE_NAME = 'portfolio-v3.5';
const RUNTIME_CACHE = 'portfolio-runtime-v3.5';

// Critical resources for initial load (minimal set for fast install)
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/preloader.css',
    './assets/css/core.css',
    './script.js',
    './assets/js/main.js',
    './assets/js/modules/preloader.js',
    './assets/js/modules/utils.js',
    './assets/js/modules/theme.js'
];

// Secondary resources to cache after install (lazy cache)
const SECONDARY_ASSETS = [
    './contact.html',
    './assets/css/navigation.css',
    './assets/css/search.css',
    './assets/css/sidebar.css',
    './assets/css/settings.css',
    './assets/css/settings-fix.css',
    './assets/css/responsive.css',
    './assets/css/install-button.css',
    './assets/css/skeleton.css',
    './assets/css/print.css',
    './assets/js/theme-schedule.js',
    './assets/js/constants.js',
    './assets/js/modules/sidebar.js',
    './assets/js/modules/settings.js',
    './assets/js/modules/search.js',
    './assets/js/modules/pwa.js',
    './assets/js/modules/navigation.js',
    './assets/js/modules/features.js',
    './assets/js/modules/security.js',
    // All PNG icons for perfect offline mode
    'assets/icons/certification.webp',
    'assets/icons/contact.webp',
    'assets/icons/custom-theme.webp',
    'assets/icons/dark-mode.webp',
    'assets/icons/download.webp',
    'assets/icons/education.webp',
    'assets/icons/facebook.webp',
    'assets/icons/favicon.webp',
    'assets/icons/github.webp',
    'assets/icons/gmail.webp',
    'assets/icons/home.webp',
    'assets/icons/instagram.webp',
    'assets/icons/light-mode.webp',
    'assets/icons/linkedin.webp',
    'assets/icons/maintenance.webp',
    'assets/icons/nightlight-icon.webp',
    'assets/icons/nightlight-notification.webp',
    'assets/icons/pdf.webp',
    'assets/icons/printer.webp',
    'assets/icons/project.webp',
    'assets/icons/pwa-icon-192.webp',
    'assets/icons/pwa-icon-512.webp',
    'assets/icons/search.webp',
    './assets/icons/setting-button.png',
    'assets/icons/side-menu.webp',
    'assets/icons/skills.webp',
    'assets/icons/system-theme.webp',
    'assets/icons/teams.webp',
    'assets/icons/telegram.webp',
    'assets/icons/x.webp',
    'assets/icons/zoho-dark.webp',
    'assets/icons/zohomail.webp',
    './assets/icons/my-photo.jpg'
];

// Install event - cache only critical resources for fast install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('Core assets cached successfully');
                // Skip waiting immediately for faster activation
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches and cache secondary assets
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Cache secondary assets in background (non-blocking)
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Caching secondary assets');
                // Use Promise.allSettled to continue even if some fail
                return Promise.allSettled(
                    SECONDARY_ASSETS.map(url =>
                        cache.add(url).catch(err => console.warn('Failed to cache:', url, err))
                    )
                );
            }),
            // Take control immediately
            self.clients.claim()
        ])
    );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Optimized fetch strategy: Cache First with Network Fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response immediately
                    // Update cache in background for next time
                    updateCacheInBackground(event.request);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Cache same-origin requests and specific external resources
                        if (event.request.url.startsWith(self.location.origin) ||
                            event.request.url.startsWith('https://fonts.googleapis.com') ||
                            event.request.url.startsWith('https://fonts.gstatic.com') ||
                            event.request.url.startsWith('https://unpkg.com')) {
                            const responseToCache = response.clone();
                            caches.open(RUNTIME_CACHE)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        // Return offline page if available
                        return caches.match('./index.html');
                    });
            })
    );
});

// Background cache update (stale-while-revalidate pattern)
function updateCacheInBackground(request) {
    fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, response);
                });
            }
        })
        .catch(() => {
            // Silently fail - we already have cached version
        });
}

// Background sync for form submissions (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-form') {
        event.waitUntil(syncFormData());
    }
});

async function syncFormData() {
    // Placeholder for syncing form data when back online
    console.log('Syncing form data...');
}

// Push notification support (for future use)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: 'assets/icons/pwa-icon-192.webp',
        badge: 'assets/icons/favicon.webp',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Portfolio Update', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});

