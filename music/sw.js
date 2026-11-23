/* ฟังเพลง service worker - build 202611231200 */
const CACHE = 'fangpleng-202611231200';
const SHELL = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', e => {
  // only clean up this app's own old caches (the gold app shares this origin)
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k.startsWith('fangpleng-') && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // YouTube, thumbnails and title lookups go straight to the internet
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(r => {
      if (r.ok && !u.search) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
