# main Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-11

## Active Technologies
- TypeScript (Deno latest stable) for build config; vanilla JavaScript for the Service Worker (runs in the browser, not Deno) + Lume 3.2.1 (static site generator), Tailwind CSS (styling), no new dependencies (002-offline-support)
- Browser Cache Storage API (client-side only) (002-offline-support)
- TypeScript (Deno latest stable) for game logic and build; vanilla JavaScript for browser runtime + Lume 3.2.1 (static site generator), Tailwind CSS (styling), no new dependencies (003-set-card-game)
- N/A -- no persistence; game state is in-memory only (003-set-card-game)
- TypeScript (Deno latest stable) + Lume (static site generator), Tailwind CSS, esbuild plugin (003-set-card-game)
- N/A (in-memory only, no persistence) (003-set-card-game)
- TypeScript (Deno latest stable) + Tailwind CSS v4 (via Lume plugin), Lume v3.2.1, esbuild (004-board-animations)
- TypeScript (Deno latest stable) + Lume v3.2.1 (SSG), Tailwind CSS v4, esbuild (bundler) — zero runtime dependencies (005-title-screen-difficulty)
- N/A — no persistence, state is in-memory only (005-title-screen-difficulty)

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
- 005-title-screen-difficulty: Added TypeScript (Deno latest stable) + Lume v3.2.1 (SSG), Tailwind CSS v4, esbuild (bundler) — zero runtime dependencies
- 004-board-animations: Added TypeScript (Deno latest stable) + Tailwind CSS v4 (via Lume plugin), Lume v3.2.1, esbuild
- 004-board-animations: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
