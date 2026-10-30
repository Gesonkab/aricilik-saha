/* Arılık Saha · çevrimdışı önbellek */
var C = 'saha-6900c7c546', FONTS = 'saha-fonts';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C && k !== FONTS; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(FONTS).then(function (c) { return c.match(r).then(function (hit) { return hit || fetch(r).then(function (res) { c.put(r, res.clone()); return res; }); }); }));
    return;
  }
  if (u.origin !== location.origin) return;
  /* önce önbellek (internetsiz açılır), arka planda güncelle */
  e.respondWith(caches.open(C).then(function (c) {
    return c.match(r, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(function () { return hit || (r.mode === 'navigate' ? c.match('index.html') : undefined); });
      return hit || net;
    });
  }));
});
