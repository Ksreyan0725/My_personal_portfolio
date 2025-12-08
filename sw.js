// Service Worker for Portfolio PWA
// Version 3.1
const CACHE_NAME = 'portfolio-v3.1';
const RUNTIME_CACHE = 'portfolio-runtime-v3.1';

// Critical resources for initial load (minimal set for fast install)
const CORE_ASSETS = [
    '/My_personal_portfolio/',
    '/My_personal_portfolio/index.html',
    '/My_personal_portfolio/manifest.json'
];

// Secondary resources to cache after install (lazy cache)
const SECONDARY_ASSETS = [
    '/My_personal_portfolio/contact.html',
    '/My_personal_portfolio/assets/css/style.css',
    '/My_personal_portfolio/assets/css/responsive.css',
    '/My_personal_portfolio/assets/css/preloader.css',
    '/My_personal_portfolio/assets/css/install-button.css',
    '/My_personal_portfolio/assets/css/theme-schedule.css',
    '/My_personal_portfolio/assets/css/skeleton.css',
    '/My_personal_portfolio/assets/css/print.css',
    '/My_personal_portfolio/script.js',
    '/My_personal_portfolio/assets/js/theme-schedule.js',
    '/My_personal_portfolio/assets/js/constants.js',
    '/My_personal_portfolio/assets/icons/favicon.png',
    '/My_personal_portfolio/assets/icons/system-theme.png',
    '/My_personal_portfolio/assets/icons/custom-theme.png',
    '/My_personal_portfolio/assets/icons/light-mode.png',
    '/My_personal_portfolio/assets/icons/dark-mode.png',
    '/My_personal_portfolio/assets/icons/github.png',
    '/My_personal_portfolio/assets/icons/linkedin.png',
    '/My_personal_portfolio/assets/icons/nightlight-icon.png',
    '/My_personal_portfolio/assets/icons/search.png',
    '/My_personal_portfolio/assets/icons/setting-button.png',
    '/My_personal_portfolio/assets/icons/side-menu.png',
    '/My_personal_portfolio/assets/images/my-photo.jpg'
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
        caches.match(event.request)
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

                        // Only cache same-origin requests
                        if (event.request.url.startsWith(self.location.origin)) {
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
                        return caches.match('/My_personal_portfolio/index.html');
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
        icon: '/My_personal_portfolio/assets/icons/pwa-icon-192.png',
        badge: '/My_personal_portfolio/assets/icons/favicon.png',
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
        clients.openWindow('/My_personal_portfolio/')
    );
});
