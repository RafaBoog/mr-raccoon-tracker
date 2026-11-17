const CACHE_NAME = "mr-raccoon-tracker-final-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
const EVIDENCE_IMAGES = [
  "assets/ada 1.webp",
  "assets/ada 2.webp",
  "assets/almoxarifado leste 1.webp",
  "assets/almoxarifado leste 2.webp",
  "assets/campo de tiro 1.webp",
  "assets/campo de tiro 2.webp",
  "assets/crocodilo 1.webp",
  "assets/crocodilo 2.webp",
  "assets/entrada externa 1.webp",
  "assets/entrada externa 2.webp",
  "assets/escritorio S.T.A.R.S. 1.webp",
  "assets/escritorio S.T.A.R.S. 2.webp",
  "assets/escritorio do chefe 1.webp",
  "assets/escritorio do chefe 2.webp",
  "assets/escritorio oeste 1.webp",
  "assets/escritorio oeste 2.webp",
  "assets/esgoto 1.webp",
  "assets/esgoto 2.webp",
  "assets/orfanato 1.webp",
  "assets/orfanato 2.webp",
  "assets/refeitorio laboratorio 1.webp",
  "assets/refeitorio laboratorio 2.webp",
  "assets/ruas de racoon 1.webp",
  "assets/ruas de racoon 2.webp",
  "assets/sala de descanso 1.webp",
  "assets/sala de descanso 2.webp",
  "assets/sala de soneca 1.webp",
  "assets/sala de soneca 2.webp",
  "assets/torre do relogio 1.webp",
  "assets/torre do relogio 2.webp"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    const results = await Promise.allSettled(EVIDENCE_IMAGES.map(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(path + " (" + response.status + ")");
      await cache.put(path, response);
    }));
    const failed = results.filter(result => result.status === "rejected");
    if (failed.length) console.warn("Imagens que não entraram no cache:", failed);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("mr-raccoon-tracker-") && key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html").then(cached => cached || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
