/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Workbox replaces this with the precache manifest at build time
const precacheEntries: Array<string | { url: string; revision: string | null }> =
	self.__WB_MANIFEST;

const CACHE_NAME = `set-precache-v1`;

/** Extract URL strings from precache entries. */
function getUrls(): string[] {
	return precacheEntries.map((entry) => (typeof entry === 'string' ? entry : entry.url));
}

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(getUrls());
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
	// Only handle GET requests
	if (event.request.method !== 'GET') return;

	// Only handle same-origin requests
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		caches.match(event.request).then((cached) => {
			return cached || fetch(event.request);
		})
	);
});
