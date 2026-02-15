const CACHE_NAME = 'rider-sos-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/generated/sos-shield.dim_256x256.png',
  '/assets/generated/rider-silhouette.dim_512x512.png',
  '/assets/generated/hazard-icons-sprite.dim_1024x256.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
