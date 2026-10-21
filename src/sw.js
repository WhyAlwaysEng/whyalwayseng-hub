const CACHE_NAME = "sw-store-v2";
const ASSETS = [
  "./",
  "./styles.css",
  "./app.js",
  "./vendor/alpine.min.js",
  "./vendor/marked.min.js",
  "./vendor/purify.min.js",
  "./vendor/fuse.min.js",
  "./locales/en.json",
  "./locales/th.json",
  "./data/catalog.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Stale-while-revalidate for catalog.json
  if (url.pathname.endsWith("/catalog.json")) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return cache.match(e.request);
        }
      })
    );
    return;
  }

  // Cache-first for other static assets
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
