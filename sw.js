const CACHE_NAME = 'datasantri-qiraati-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './css/style.css',
  './js/app.js',
  './img/logo-qiraati.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA: Aset pre-cache dilewati:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan cache permintaan non-GET
  if (req.method !== 'GET') {
    return;
  }

  // Network-First untuk permintaan API GAS / dinamis agar data selalu real-time
  if (url.hostname.includes('script.google.com') || url.hostname.includes('api.github.com') || url.search.includes('action=')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Stale-While-Revalidate untuk aset aplikasi statis
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
