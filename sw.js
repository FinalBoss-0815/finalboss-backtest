// FinalBoss Service Worker v1.2.0-beta — COI-Headers für SharedArrayBuffer
// Cache-first für statische Assets, Network für Binance-API.
// NEU in v1.2: Cross-Origin-Isolation Headers für ffmpeg.wasm Support
// HINWEIS: CACHE_NAME bei jedem Release hochzählen damit User die neue Version kriegen!

const CACHE_NAME = 'finalboss-v1.2.0-beta-' + Date.now().toString().slice(0, 10);
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

  // Niemals API/WebSocket/Non-GET cachen — diese müssen immer live sein
  if (
    url.includes('binance.com') ||
    url.includes('binance.us') ||
    url.startsWith('ws:') ||
    url.startsWith('wss:') ||
    e.request.method !== 'GET'
  ) {
    return; // Browser handelt fetch normal (kein respondWith)
  }

  // Helper: Response mit Cross-Origin-Isolation Headers anreichern
  // Wird für ALLE same-origin Requests + Cross-Origin-Resources gemacht damit ffmpeg.wasm
  // SharedArrayBuffer nutzen kann (GitHub Pages sendet diese Headers nicht selbst).
  const addCOIHeaders = (response) => {
    if (!response || response.status === 0) return response;
    const newHeaders = new Headers(response.headers);
    // COEP credentialless: erlaubt cross-origin Resourcen ohne CORP-Header
    newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };

  // Cache-first für statische Assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return addCOIHeaders(cached);
      return fetch(e.request).then(response => {
        // Nur erfolgreiche, gleichherkunfts Responses cachen
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return addCOIHeaders(response);
      }).catch(() =>
        // Network-Fehler: versuche cached HTML als Fallback
        caches.match('./').then(addCOIHeaders) || caches.match('./backtest_app.html').then(addCOIHeaders)
      );
    })
  );
});
