// @ts-nocheck — this file runs in the browser, not Deno
// Service Worker for offline support (PWA)
// CACHE_NAME and PRECACHE_URLS are injected at build time by Lume.

const CACHE_NAME = "__CACHE_NAME__";
const PRECACHE_URLS = __PRECACHE_URLS__;

// Install: precache all critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

// Activate: delete old caches, claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("set-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
    ).then(() => self.clients.claim()),
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request)
    ),
  );
});
