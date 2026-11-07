/* MenúListo · service worker. Deja la app abierta sin conexión; la búsqueda de Mercadona y la consulta de códigos siempre van a la red. */
const CACHE = 'menulisto-715f83b9';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
const LIBS = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com']; // ZXing (lector de códigos) y tipografía: se guardan al primer uso
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const own = url.origin === location.origin;
  if (!own && !LIBS.includes(url.hostname)) return; // Mercadona, Open Food Facts: siempre red
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(cached => {
    const fresh = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => cached);
    return cached || fresh; // primero caché; se actualiza en segundo plano para la próxima apertura
  }));
});
