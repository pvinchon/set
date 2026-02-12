# Implementation Plan: Offline Support (PWA)

**Branch**: `002-offline-support` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-offline-support/spec.md`

## Summary

Make the site fully functional offline after a single online visit by adding a Service Worker that precaches all build outputs, a web app manifest for home-screen installability, and PWA icons. Lume has no built-in PWA plugins, so the Service Worker and manifest are hand-written static files processed through the existing Lume build pipeline. A Lume `process()` hook auto-generates the precache URL list and injects the SW registration script into every HTML page at build time.

## Technical Context

**Language/Version**: TypeScript (Deno latest stable) for build config; vanilla JavaScript for the Service Worker (runs in the browser, not Deno)  
**Primary Dependencies**: Lume 3.2.1 (static site generator), Tailwind CSS (styling), no new dependencies  
**Storage**: Browser Cache Storage API (client-side only)  
**Testing**: `deno test` for build-time assertions (manifest validity, SW file presence, precache list correctness)  
**Target Platform**: Modern evergreen browsers (last 2 versions of Chrome, Firefox, Safari, Edge); hosted on GitHub Pages  
**Project Type**: Static website (single project)  
**Performance Goals**: Total initial payload < 100 KB compressed; FCP < 1s on 3G Fast (per constitution); SW + manifest add < 50 KB  
**Constraints**: No external runtime dependencies; no CDN calls; offline-capable after first visit; GitHub Pages hosting (no custom headers)  
**Scale/Scope**: 1 HTML page, 1 CSS file, 4 icon files, 1 SW file, 1 manifest file — tiny site

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|---|---|---|---|
| **I. Lightweight & Fast** | Payload < 100 KB compressed | PASS | SW (~2 KB) + manifest (~0.5 KB) + icons (~30 KB) well under budget |
| **I. Lightweight & Fast** | Zero external runtime dependencies | PASS | No new dependencies; SW is vanilla JS |
| **I. Lightweight & Fast** | FCP < 1s on 3G Fast | PASS | SW registration is async, does not block rendering |
| **I. Lightweight & Fast** | Deno + Lume for build | PASS | All build integration uses Lume plugins/hooks |
| **II. Offline-First** | SW caches all critical assets on install | PASS | Primary deliverable of this feature |
| **II. Offline-First** | Valid PWA manifest for home screen | PASS | Primary deliverable of this feature |
| **II. Offline-First** | Cache versioning invalidates stale assets | PASS | Cache name includes build timestamp; activate event purges old caches |
| **III. Simplicity** | YAGNI — no speculative features | PASS | Only what's needed: SW, manifest, icons. No push notifications, no background sync |
| **Technical** | TypeScript for build config | PASS | `_config.ts` changes are TypeScript |
| **Technical** | Tailwind CSS (purge unused) | N/A | No Tailwind changes needed |
| **Technical** | `deno test` for tests | PASS | Tests will use `deno test` |
| **Technical** | GitHub Actions CI/CD | PASS | No pipeline changes needed; SW is a build output |
| **Technical** | GitHub Pages hosting | PASS | All files are static; SW scope works at root |
| **Workflow** | Small, atomic commits | PASS | Feature decomposes into 3-4 small commits |

**Gate result: PASS — no violations.**

## Project Structure

### Documentation (this feature)

```text
specs/002-offline-support/
├── plan.md              # This file
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: data model (cache entities)
├── quickstart.md        # Phase 1: developer quickstart
├── contracts/
│   └── README.md        # Phase 1: contract notes (no REST API)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── index.vto            # (existing) — no changes needed
├── style.css            # (existing) — no changes needed
├── service_worker.js                # NEW: Service Worker (vanilla JS, precache list injected at build)
├── manifest.webmanifest # NEW: PWA manifest (static JSON)
├── icons/               # NEW: PWA icons directory
│   ├── icon-192.png     #   192×192 standard icon
│   ├── icon-512.png     #   512×512 standard icon
│   ├── icon-maskable-192.png  # 192×192 maskable icon
│   └── icon-maskable-512.png  # 512×512 maskable icon
└── _includes/
    └── layout.vto       # (existing) — add manifest link + apple-touch-icon

_config.ts               # (existing) — add SW/manifest to build, add process() hooks

tests/
└── build_test.ts        # (existing) — add PWA output assertions
```

**Structure Decision**: Single project. New files are added directly under `src/` alongside existing content. The `icons/` subdirectory keeps image assets organised. No new top-level directories needed.
