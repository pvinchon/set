# Research: Offline Support (PWA)

**Feature**: 002-offline-support  
**Date**: 2026-02-11

## 1. Lume PWA Plugin Support

**Decision**: Hand-write all PWA files (Service Worker, manifest, icons). Use Lume's `site.process()` and `site.add()` hooks for build integration.

**Rationale**: Lume 3.x has no built-in Service Worker, manifest, or PWA plugin. The `lumeland/experimental-plugins` repository also has nothing for PWA. The site is tiny, so a hand-written SW is simpler and more transparent than pulling in an external tool like Workbox.

**Alternatives considered**:
- **Workbox (Google's SW library)**: Adds ~12 KB runtime dependency; violates the constitution's "zero external runtime dependencies" principle. Overkill for a site with 5-6 assets.
- **Custom Lume plugin**: Would abstract SW generation but adds indirection for minimal benefit on a small site. Could be extracted later if the site grows.

## 2. Caching Strategy

**Decision**: Precache all build outputs in the `install` event. Serve all requests cache-first with network fallback.

**Rationale**: The entire site is under 100 KB. Precaching everything guarantees complete offline support from the first visit. Cache-first eliminates network latency for returning visitors. The simplicity of "cache everything" matches the constitution's Simplicity principle.

**Alternatives considered**:
- **Stale-while-revalidate**: Provides background freshness, but adds complexity. Not needed because the SW file itself changes on every deploy, triggering a full cache refresh.
- **Network-first**: Adds latency on every online visit. Wrong trade-off for an offline-first site.
- **Runtime caching (cache on fetch)**: Means first visit doesn't cache everything — offline won't work until all pages are visited. Unacceptable for FR-002.

## 3. Cache Versioning and Invalidation

**Decision**: Embed a build timestamp in the SW file as the cache name (e.g., `set-v1739000000`). At build time, Lume's `process()` hook writes the list of all output URLs into the SW file. Any content change → different URL list → different SW file → browser triggers update → `activate` event deletes old caches.

**Rationale**: The browser compares the SW file byte-for-byte on each navigation. Embedding the URL list means any content change causes the SW to differ, so no separate version bumping is needed. The build timestamp in the cache name ensures unique cache namespacing.

**Alternatives considered**:
- **Content hashes per file** (Workbox-style): Per-file granularity is unnecessary when the total cache is under 100 KB. Adds build complexity.
- **Manual version string**: Requires developer to remember to bump a version on every deploy. Error-prone.
- **Git commit hash**: Would work but requires git access at build time, which may not be available in all CI environments.

## 4. Service Worker Lifecycle

**Decision**: Use `skipWaiting()` in the `install` event and `clients.claim()` in the `activate` event.

**Rationale**: The site is content-only with no client-side state. There is no risk of version mismatches between in-flight requests. `skipWaiting()` ensures the new SW activates immediately without waiting for all tabs to close. `clients.claim()` ensures existing tabs use the new SW on their next fetch. This gives users the fastest path to updated content.

**Alternatives considered**:
- **Wait for tab close** (default lifecycle): Users would need to close all tabs and reopen to get updates. Unnecessary friction for a stateless content site.

## 5. GitHub Pages Compatibility

**Decision**: No special handling needed. Prefix cache names with `set-` to avoid conflicts with other sites on the same `github.io` origin.

**Rationale**: GitHub Pages serves over HTTPS (SW requirement met). The `Cache-Control: max-age=600` header on GH Pages does not affect the Cache Storage API. Browsers (Chrome 68+) bypass HTTP cache when checking for SW file updates. The SW will be at the site root (`/service_worker.js`), and if the site is served from a subpath (`/repo/`), Lume's `basePath` plugin handles URL rewriting.

**Alternatives considered**:
- **Custom headers via `_headers` file**: Not supported on GitHub Pages. Would require Cloudflare or Netlify.

## 6. PWA Manifest and Icons

**Decision**: Provide a `manifest.webmanifest` with `display: standalone`, plus PNG icons at 192×192 and 512×512 (both standard and maskable variants). Add `<link rel="apple-touch-icon">` in the HTML `<head>` for iOS Safari.

**Rationale**: These are the minimum requirements for Chrome's installability check (name, start_url, display, 192px + 512px icons). Maskable icon variants ensure proper display on Android when adaptive icons are used. The apple-touch-icon link is needed because Safari ignores manifest icons.

**Alternatives considered**:
- **SVG icon only**: Good for scaling but not supported by all browsers for manifest icons. PNG is universally supported.
- **`display: fullscreen`**: Hides the status bar; appropriate for games but not for a content page at this stage.
- **`display: minimal-ui`**: Adds back/forward buttons; unnecessary for a single-page site.

## 7. Build Integration Approach

**Decision**: Add a Lume `process()` hook in `_config.ts` that:
1. Enumerates all output URLs from `site.pages`
2. Generates a precache manifest array
3. Injects the array into `service_worker.js` (replacing a placeholder token)
4. Injects a `<script>` tag for SW registration into all HTML pages  
5. Injects `<link rel="manifest">` and `<link rel="apple-touch-icon">` into the HTML `<head>`

**Rationale**: This keeps the SW file readable as a standalone JS file with a clear placeholder. Build-time injection means the URL list is always in sync with the actual build output. HTML injection via `process()` avoids modifying every template manually.

**Alternatives considered**:
- **Template the SW using `.vto`**: Lume would process it as a template. Risk of interference with JS syntax and Vento delimiters. Harder to lint/test as JS.
- **Manual `<script>` in layout.vto**: Works but requires manual maintenance if layouts change. The `process()` approach is more robust.
- **Separate build script**: Adds a step outside the Lume pipeline. Violates the "use `deno task` for all local commands" workflow rule.
