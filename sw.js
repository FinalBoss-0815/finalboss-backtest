// FinalBoss Service Worker v1.4.0-beta — NETWORK-FIRST + Collision-Safe Cache
// Update-Verhalten: 1x Reload reicht jetzt fuer Updates (vorher 2x).
// Statisches Asset wie Bilder/Manifest = Cache-First (schnell)
// HTML/JS-Update = Network-First mit Cache-Fallback (immer aktuell wenn online)
// COI-Headers fuer SharedArrayBuffer / ffmpeg.wasm
// FIX in v1.4: Cache-Name nutzt FULL Timestamp damit keine Collisions

const CACHE_NAME = 'finalboss-v1.4.0-' + Date.now();
const ASSETS = ['./', './index.html', './backtest_app.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(ASSETS.map(url => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  if (
    url.includes('binance.com') ||
    url.includes('binance.us') ||
    url.startsWith('ws:') ||
    url.startsWith('wss:') ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  const addCOIHeaders = (response) => {
    if (!response || response.status === 0) return response;
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };

  const isHTMLorCode = (
    e.request.mode === 'navigate' ||
    e.request.destination === 'document' ||
    e.request.destination === 'script' ||
    e.request.destination === 'style' ||
    /\.(html|js|css|json)(\?|$)/i.test(url)
  );

  if (isHTMLorCode) {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return addCOIHeaders(response);
      }).catch(() => {
        return caches.match(e.request).then(cached => {
          if (cached) return addCOIHeaders(cached);
          return caches.match('./').then(addCOIHeaders) ||
                 caches.match('./index.html').then(addCOIHeaders);
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) {
          fetch(e.request).then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
            }
          }).catch(() => {});
          return addCOIHeaders(cached);
        }
        return fetch(e.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return addCOIHeaders(response);
        }).catch(() =>
          caches.match('./').then(addCOIHeaders) ||
          caches.match('./index.html').then(addCOIHeaders)
        );
      })
    );
  }
});
