// IMPORTANT: Bump this version number every time you deploy changes to the site.
// The browser only re-installs the service worker when this file's bytes change,
// so changing the version here forces old caches to be cleared (see 'activate' below)
// and stops returning-visitors from getting stuck on stale cached content.
const CACHE_VERSION = 'v2-2026-08-02';
const CACHE_NAME = 'mohit-portfolio-' + CACHE_VERSION;
const OFFLINE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/images/about.png'
];

// Install: pre-cache core files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(OFFLINE_URLS).catch(() => {
                // Ignore individual file failures so install doesn't break
            });
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: try network first, fall back to cache (so content stays fresh, but works offline)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
