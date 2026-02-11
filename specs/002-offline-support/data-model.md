# Data Model: Offline Support (PWA)

**Feature**: 002-offline-support  
**Date**: 2026-02-11

## Overview

This feature has no server-side data model. All data is client-side, managed by the browser's Service Worker and Cache Storage APIs. The "entities" below describe the logical structure of the files and caches involved.

## Entities

### 1. Precache Manifest

An ordered list of URLs representing every asset the Service Worker should cache during installation.

| Field | Type | Description |
|---|---|---|
| `urls` | `string[]` | Relative URL paths of all build outputs (e.g., `"/"`, `"/style.css"`, `"/icons/icon-192.png"`) |

- **Generated at**: Build time, by Lume `process()` hook
- **Embedded in**: `service_worker.js` as a JavaScript array constant
- **Lifecycle**: Regenerated on every build; changes trigger SW update

### 2. Cache Store

A named browser cache containing pre-fetched responses for all precached URLs.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Unique cache identifier, e.g., `"set-v1739000000"` (includes build timestamp) |
| `entries` | `Map<Request, Response>` | Browser-managed map of request→response pairs |

- **Created during**: SW `install` event
- **Purged during**: SW `activate` event (old caches with different names are deleted)
- **Read during**: SW `fetch` event (cache-first lookup)

### 3. Web App Manifest

A JSON file describing the application's identity and display preferences.

| Field | Value | Purpose |
|---|---|---|
| `name` | `"Set"` | Full application name |
| `short_name` | `"Set"` | Name shown under home-screen icon |
| `start_url` | `"/"` | URL opened when launched from home screen |
| `display` | `"standalone"` | Removes browser chrome |
| `background_color` | `"#ffffff"` | Splash screen background |
| `theme_color` | `"#111827"` | Browser toolbar colour (gray-900 from Tailwind) |
| `icons` | Array of icon descriptors | See Icon Assets below |

### 4. Icon Assets

PNG images used by the manifest and browsers for home-screen display.

| File | Size | Purpose | `purpose` field |
|---|---|---|---|
| `icon-192.png` | 192×192 | Standard app icon | `any` (default) |
| `icon-512.png` | 512×512 | Splash screen / high-DPI | `any` (default) |
| `icon-maskable-192.png` | 192×192 | Android adaptive icon | `maskable` |
| `icon-maskable-512.png` | 512×512 | Android adaptive splash | `maskable` |

- **Standard icons**: Content fills the full canvas
- **Maskable icons**: Important content within the inner 80% "safe zone"; outer 10% on each side may be cropped by the OS

## State Transitions

```
[No SW installed]
    │
    ▼  (first online visit)
[SW installing] ──precache all URLs──▶ [SW installed + active]
    │                                       │
    │                                       ▼  (visitor goes offline)
    │                                  [Serving from cache]
    │                                       │
    │                                       ▼  (visitor comes back online)
    │                                  [SW checks for update]
    │                                       │
    │                              ┌────────┴────────┐
    │                              ▼                  ▼
    │                     [No update]          [New SW found]
    │                     (continue)            │
    │                                           ▼
    │                                  [New SW installing]
    │                                  (precache new URLs)
    │                                           │
    │                                           ▼
    │                                  [skipWaiting → activate]
    │                                  (delete old caches)
    │                                           │
    │                                           ▼
    │                                  [clients.claim → serving new content]
```

## Validation Rules

- The precache manifest MUST contain at least `"/"` (the root page) and `"/style.css"`
- The cache name MUST be prefixed with `"set-"` to avoid conflicts with other sites on the same GitHub Pages origin
- The manifest MUST include at least one icon at 192×192 and one at 512×512
- The manifest `start_url` MUST match the site's base path
- All precache URLs MUST be relative paths (not absolute URLs with domain)
