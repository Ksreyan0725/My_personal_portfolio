// Service Worker for Portfolio PWA
// Version 1.0.0

const CACHE_NAME = 'portfolio-v1';
const urlsToCache = [
    '/My_personal_portfolio/',
    '/My_personal_portfolio/index.html',
    '/My_personal_portfolio/contact.html',
    '/My_personal_portfolio/assets/css/style.css',
    '/My_personal_portfolio/assets/css/responsive.css',
    '/My_personal_portfolio/script.js',
    '/My_personal_portfolio/assets/images/my-photo.jpg',
    '/My_personal_portfolio/assets/icons/favicon.png',
    '/My_personal_portfolio/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch((error) => {
                    console.error('Fetch failed:', error);
                    // Return offline page if available
                    return caches.match('/My_personal_portfolio/pages/maintenance.html');
                });
            })
    );
});

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
