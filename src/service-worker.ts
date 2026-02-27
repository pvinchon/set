/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Take control of all clients immediately when a new SW activates.
self.skipWaiting();
clientsClaim();

// Remove precache entries from previous SW versions that are no longer in the manifest.
cleanupOutdatedCaches();

// Precache all assets injected by Workbox and add cache-first routes for them.
precacheAndRoute(self.__WB_MANIFEST);
