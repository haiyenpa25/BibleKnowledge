// BibleKnowledge PWA Service Worker (ROADMAP1.md Offline Support)
const CACHE_NAME = 'bibleknowledge-v1';
const STATIC_ASSETS = [
  '/',
  '/bible',
  '/explore',
  '/learn',
  '/research',
  '/study',
  '/library',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets could not be pre-cached:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Handle static assets (cache-first)
  if (
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // Handle API requests and web routes (Network-first with offline cache fallback)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        console.log('[SW] Network failed, serving cached fallback for:', request.url);
        const cached = await caches.match(request);
        if (cached) return cached;

        // If navigation request failed, fallback to /bible
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/bible');
          if (fallback) return fallback;
        }

        return new Response(
          JSON.stringify({
            offline: true,
            message: 'Thiết bị đang ngoại tuyến. Vui lòng kết nối mạng để tải dữ liệu mới nhất.'
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      })
  );
});
