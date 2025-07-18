const cacheName = 'autocaravana-v1';
const assets = ['/', '/index.html', '/main.js', '/manifest.json', '/repetidores.csv',
                'https://unpkg.com/leaflet/dist/leaflet.css',
                'https://unpkg.com/leaflet/dist/leaflet.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(cacheName).then(c => c.addAll(assets)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
