const CACHE = 'exovia-neurocanvas-v14-safety-net';
const APP_SHELL = './index.html';
const ASSETS = [
  './', APP_SHELL, './manifest.webmanifest', './examples/live-evidence-room.json',
  './src/styles.css', './src/upgrade.css', './src/product.css', './src/mobile.css', './src/brain.css',
  './src/ai-bridge.css', './src/intelligence.css', './src/diagnostics.css', './src/live-room.css',
  './src/clarity.css', './src/simple-mode.css', './src/use-cases.css', './src/safety-net.css',
  './src/core.js', './src/upgrade.js', './src/product.js', './src/mobile.js', './src/brain.js',
  './src/ai-bridge.js', './src/intelligence.js', './src/diagnostics.js', './src/live-room.js',
  './src/clarity.js', './src/simple-mode.js', './src/use-cases.js', './src/safety-net.js'
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
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match(request)) || caches.match(APP_SHELL)));
    return;
  }
  event.respondWith(caches.match(request).then(async cached => {
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Offline asset unavailable.', { status: 503, statusText: 'Service Unavailable', headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  }));
});