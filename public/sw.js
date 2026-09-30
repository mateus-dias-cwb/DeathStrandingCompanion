const CACHE_NAME = 'bridge-planner-shell-v2';
const PRECACHE_BUILD_ASSETS = [];
const APP_SHELL = [
  './',
  './manifest.webmanifest',
  './icons/bridge-planner.svg',
  './icons/bridge-planner-180.png',
  './icons/bridge-planner-192.png',
  './icons/bridge-planner-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([...APP_SHELL, ...PRECACHE_BUILD_ASSETS]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('bridge-planner-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        let response;
        try {
          response = await fetch(event.request);
        } catch (error) {
          const cached = await caches.match('./');
          if (cached) return cached;
          throw error;
        }

        if (!response.ok) {
          return (await caches.match('./')) || response;
        }

        await (await caches.open(CACHE_NAME)).put('./', response.clone());
        return response;
      })(),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then(async (response) => {
      if (response.ok) {
        await (await caches.open(CACHE_NAME)).put(event.request, response.clone());
      }
      return response;
    })),
  );
});
