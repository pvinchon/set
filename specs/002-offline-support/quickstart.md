# Quickstart: Offline Support (PWA)

**Feature**: 002-offline-support  
**Date**: 2026-02-11

## Prerequisites

- Deno (latest stable) installed
- Repository cloned, on branch `002-offline-support`

## Build and Test

```bash
# Build the site (includes SW precache injection)
deno task build

# Run tests (verifies PWA outputs)
deno task test

# Serve locally with live reload
deno task serve
```

## Verify Offline Support Locally

1. Run `deno task serve` and open the site in Chrome
2. Open DevTools → Application → Service Workers
3. Confirm the SW is registered and active
4. Open DevTools → Application → Cache Storage
5. Confirm a cache named `set-v{timestamp}` exists with all assets
6. In DevTools → Network, check "Offline"
7. Reload the page — it should load fully from cache
8. Uncheck "Offline" to restore connectivity

## Verify PWA Installability

1. Run `deno task serve` and open the site in Chrome
2. Open DevTools → Application → Manifest
3. Confirm the manifest is detected with name, icons, display mode
4. Look for the install icon in the address bar (or three-dot menu → "Install")
5. Install and verify it opens in a standalone window

## Verify with Lighthouse

1. Open DevTools → Lighthouse
2. Run a "Progressive Web App" audit
3. Confirm the "Installable" badge is earned

## Key Files

| File                       | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `src/service_worker.js`    | Service Worker source (precache list injected at build) |
| `src/manifest.webmanifest` | PWA manifest                                            |
| `src/icons/`               | App icons (192, 512, maskable variants)                 |
| `_config.ts`               | Lume build config with PWA hooks                        |
| `src/_includes/layout.vto` | HTML layout (manifest link + apple-touch-icon)          |
| `tests/build_test.ts`      | Build output assertions including PWA checks            |

## Architecture Notes

- The Service Worker uses a **precache-all + cache-first** strategy
- The precache URL list and cache name are injected into `service_worker.js` at build time by a Lume `process()` hook — there are placeholder tokens (`__PRECACHE_URLS__`, `__CACHE_NAME__`) in the source file
- SW registration is injected into HTML pages by another `process()` hook
- No external dependencies are added — the SW is vanilla JavaScript
- Icon PNGs must be created/sourced before implementation (not auto-generated)
