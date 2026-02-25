# Contracts: Offline Support (PWA)

**Feature**: 002-offline-support  
**Date**: 2026-02-11

## Overview

This feature has no REST or GraphQL APIs. It is entirely client-side, using browser-native APIs (Service Worker, Cache Storage, Web App Manifest). The "contracts" below define the interfaces between build-time and runtime components.

## 1. Build → Service Worker Contract

The Lume build process injects data into `service_worker.js` by replacing placeholder tokens.

### Precache URL List

**Placeholder in `service_worker.js`**: `__PRECACHE_URLS__`  
**Replaced with**: A JSON array of URL strings at build time

```js
// Before build processing:
const PRECACHE_URLS = __PRECACHE_URLS__;

// After build processing (example):
const PRECACHE_URLS = [
	'/',
	'/style.css',
	'/icons/icon-192.png',
	'/icons/icon-512.png',
	'/icons/icon-maskable-192.png',
	'/icons/icon-maskable-512.png',
	'/manifest.webmanifest'
];
```

### Cache Name

**Placeholder in `service_worker.js`**: `__CACHE_NAME__`  
**Replaced with**: A string of the form `set-v{timestamp}`

```js
// Before:
const CACHE_NAME = '__CACHE_NAME__';

// After:
const CACHE_NAME = 'set-v1739000000';
```

## 2. HTML → Service Worker Registration Contract

The build process injects a `<script>` tag before `</body>` in every HTML page:

```html
<script>
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/service_worker.js');
	}
</script>
```

## 3. HTML → Manifest Contract

The build process injects into the `<head>` of every HTML page:

```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#111827" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

## 4. Service Worker → Browser Contract

### Install Event

- Opens a cache named `CACHE_NAME`
- Calls `cache.addAll(PRECACHE_URLS)` to fetch and store all assets
- Calls `self.skipWaiting()` to activate immediately

### Activate Event

- Deletes all caches whose name is not `CACHE_NAME`
- Calls `self.clients.claim()` to take over all open tabs

### Fetch Event

- Matches the request against the cache
- If found: returns the cached response
- If not found: fetches from network (fallback for any uncached requests)
