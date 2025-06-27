const CACHE_NAME = 'glock-config-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/data/colors.json',
  '/data/parts.json',
  '/g17.svg',
      '/img/192.png',
      '/img/512.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
