# main Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-11

## Active Technologies
- TypeScript (Deno latest stable) for build config; vanilla JavaScript for the Service Worker (runs in the browser, not Deno) + Lume 3.2.1 (static site generator), Tailwind CSS (styling), no new dependencies (002-offline-support)
- Browser Cache Storage API (client-side only) (002-offline-support)

- TypeScript (Deno latest stable) for build configuration; HTML + CSS for markup and styling + Lume (Deno-native static site generator), Tailwind CSS (via Lume plugin) (001-hello-world-website)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (Deno latest stable) for build configuration; HTML + CSS for markup and styling: Follow standard conventions

## Recent Changes
- 002-offline-support: Added TypeScript (Deno latest stable) for build config; vanilla JavaScript for the Service Worker (runs in the browser, not Deno) + Lume 3.2.1 (static site generator), Tailwind CSS (styling), no new dependencies

- 001-hello-world-website: Added TypeScript (Deno latest stable) for build configuration; HTML + CSS for markup and styling + Lume (Deno-native static site generator), Tailwind CSS (via Lume plugin)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
