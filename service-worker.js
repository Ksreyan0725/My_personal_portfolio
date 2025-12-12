// Service Worker for Kumar Sreyan Pattanayak Portfolio
// Version 1.1.3

const CACHE_NAME = 'ksp-portfolio-v3.3.3.3.3.3.1.1.1.1.1.3';
const urlsToCache = [
    '/My_personal_portfolio/',
    '/My_personal_portfolio/index.html',
    '/My_personal_portfolio/contact.html',
    '/My_personal_portfolio/assets/css/style.css',
    '/My_personal_portfolio/assets/css/responsive.css',
    '/My_personal_portfolio/script.js',
    '/My_personal_portfolio/assets/images/my-photo.jpg',
    '/My_personal_portfolio/assets/icons/favicon.png',
    // Add more critical assets as needed
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
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
                }).catch(() => {
                    // Offline fallback
                    if (event.request.destination === 'document') {
                        return caches.match('/My_personal_portfolio/index.html');
                    }
                });
            })
    );
});
