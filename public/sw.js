// sw.js
const RUNTIME = 'runtime-v1';

self.addEventListener('fetch', (event) => {
  // ⬅️ JANGAN ganggu request selain GET
  if (event.request.method !== 'GET') return;

  // (opsional) skip origin tertentu
  // const url = new URL(event.request.url);
  // if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((res) => {
        // hanya simpan kalau status OK dan tipe basic
        if (
          res &&
          res.status === 200 &&
          res.type === 'basic'
        ) {
          const resClone = res.clone();
          caches.open(RUNTIME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return res;
      }).catch(() => cached); // fallback kalau offline
    })
  );
});
