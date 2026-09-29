/* DBYC Service Worker - Bosco Pulse Youth Movement Ecosystem */
const CACHE_NAME = 'dbyc-v20';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './dbyc-logo.jpg',
  './logo-data.js',
  './theme-data.js',
  './config.js',
  './utils.js',
  './auth.js',
  './api.js',
  './router.js',
  './dashboard.js',
  './events.js',
  './formation.js',
  './volunteer.js',
  './leaderboard.js',
  './members.js',
  './attendance.js',
  './qr-generator.js',
  './certificates.js',
  './reports.js',
  './voice-keyboard.js',
  './rules.js',
  './ai-doctor.js',
  './app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.log('Asset cache skip:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // 1. Google APIs & Backend: Network-First with cache fallback
  if (
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('accounts.google.com')
  ) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 2. HTML Navigation: Network-First, update cache on success, fallback to cache
  if (
    e.request.mode === 'navigate' ||
    url.pathname.endsWith('index.html') ||
    url.pathname === '/'
  ) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('/')))
    );
    return;
  }

  // 3. All other GET requests: Stale-While-Revalidate
  e.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(resp => {
          if (resp && resp.status === 200) {
            cache.put(e.request, resp.clone());
          }
          return resp;
        }).catch(() => cached);
        return cached || fetchPromise;
      });
    })
  );
});
