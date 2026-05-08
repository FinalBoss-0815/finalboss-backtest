// FinalBoss Service Worker v1.1.0-beta
// Cache-first für statische Assets, Network für Binance-API.
// Robuste Install-Phase — fehlende Assets blockieren nicht.
// HINWEIS: CACHE_NAME bei jedem Release hochzählen damit User die neue Version kriegen!

const CACHE_NAME = 'finalboss-v1.1.0-beta-' + Date.now().toString().slice(0, 10);
const ASSETS = ['./', './index.html', './backtest_app.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Best-effort caching — Fehler einzelner Files blockieren nicht
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

  // Cache-first für statische Assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Nur erfolgreiche, gleichherkunfts Responses cachen
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() =>
        // Network-Fehler: versuche cached HTML als Fallback
        caches.match('./') || caches.match('./backtest_app.html')
      );
    })
  );
});
