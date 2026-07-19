const CACHE = 'exovia-neurocanvas-v5-secondary-brain';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles.css',
  './src/upgrade.css',
  './src/product.css',
  './src/mobile.css',
  './src/brain.css',
  './src/core.js',
  './src/upgrade.js',
  './src/product.js',
  './src/mobile.js',
  './src/brain.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const isWikipedia = /\.wikipedia\.org$/.test(requestUrl.hostname);
  const isPdfJs = requestUrl.hostname === 'cdn.jsdelivr.net' && requestUrl.pathname.includes('pdfjs-dist');

  if (isWikipedia) {
    event.respondWith(fetch(event.request).catch(() => new Response(JSON.stringify({error:'Wikipedia connector requires a network connection.'}), {status:503,headers:{'Content-Type':'application/json'}})));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok && (requestUrl.origin === self.location.origin || isPdfJs)) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});