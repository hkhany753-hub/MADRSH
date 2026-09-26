const CACHE = 'madrsh-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/admin.css',
  '/calendar.css',
  '/tasks.css',
  '/app.js',
  '/config.js',
  '/auth-client.js',
  '/telegram-auth.js',
  '/calendar-bridge.js',
  '/calendar-fix.js',
  '/calendar-weekday-fix.js',
  '/chat-online.js',
  '/chat.js',
  '/online.js',
  '/shamsi-calendar.js',
  '/tasks.js',
  '/ui-fixes.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('/index.html'))
    )
  );
});
