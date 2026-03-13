/* ═══════════════════════════════════════════════════
   ProTrack — service-worker.js
   Enables offline use and "Add to Home Screen" on mobile.
   Uses a Cache-First strategy for app shell files.
   ═══════════════════════════════════════════════════ */

// ── Cache version. Bump this whenever you update files! ──
const CACHE_NAME = 'protrack-v6';

// ── Files to cache for offline use ──
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Google Fonts are fetched at runtime but we cache them on first load
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap',
];

// ── INSTALL: cache all static assets ──
self.addEventListener('install', event => {
  console.log('[ProTrack SW] Installing…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // cache.addAll() fetches and caches all listed URLs
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Skip the waiting phase so the new SW activates immediately
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: delete old caches ──
self.addEventListener('activate', event => {
  console.log('[ProTrack SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)  // remove any old cache versions
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())   // take control of all open tabs
  );
});

// ── FETCH: serve from cache, fall back to network ──
self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Return cached version immediately
        return cached;
      }
      // Not in cache — try the network
      return fetch(event.request).then(response => {
        // Only cache valid responses (not errors, not opaque)
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        // Save a clone in the cache for next time
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // If both cache and network fail, return offline fallback
        // (The index.html is already cached so the app will still load)
        return caches.match('/index.html');
      });
    })
  );
});
