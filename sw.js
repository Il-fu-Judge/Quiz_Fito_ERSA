const CACHE_NAME = 'fito-quiz-v1';
const ASSETS = [
  'index.html',
  'main.js',
  'quiz.json',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Installa e salva i file in cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Risponde con la cache quando non c'è rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
