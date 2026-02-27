# Data Model: Migrate to Dynamic Framework

**Feature**: 007-migrate-dynamic-framework
**Date**: 2026-02-24

## Overview

This migration has no domain data model changes — the game entities (Card, Deck, Board, Selection, Set, State, Difficulty) are unchanged. The "data model" for this feature is the build/framework configuration, the Svelte component structure, and the test harness migration that replaces Lume + Deno with SvelteKit + Node.js.

The project is scaffolded with `npx sv create` and then modified. Entities below are marked as **SCAFFOLD** (generated, no/minimal changes), **MODIFY** (scaffold output that needs changes), or **NEW** (created on top of scaffold).

## Entity: SvelteKit Configuration — MODIFY

**File**: `svelte.config.js` (scaffold-generated)

Scaffold provides a minimal config. Modifications needed: add `fallback` and `paths.base`.

| Field            | Type    | Scaffold Value        | Modified Value                      |
| ---------------- | ------- | --------------------- | ----------------------------------- |
| `kit.adapter`    | Adapter | `adapter()` (no args) | `adapter({ fallback: "404.html" })` |
| `kit.paths.base` | string  | (not set)             | `"/set"`                            |

## Entity: Vite Configuration — MODIFY

**File**: `vite.config.ts` (scaffold-generated, TypeScript)

Scaffold provides Vitest two-project config. Modification needed: add `@vite-pwa/sveltekit` plugin.

| Field                           | Type     | Scaffold Value                                   | Modified Value                                      |
| ------------------------------- | -------- | ------------------------------------------------ | --------------------------------------------------- |
| `plugins`                       | Plugin[] | `[tailwindcss(), sveltekit()]`                   | `[tailwindcss(), sveltekit(), SvelteKitPWA({...})]` |
| `test.expect.requireAssertions` | boolean  | `true`                                           | `true` (keep)                                       |
| `test.projects[0]` (client)     | Object   | Browser/Playwright for `*.svelte.{test,spec}.*`  | Keep unchanged                                      |
| `test.projects[1]` (server)     | Object   | Node env for `*.{test,spec}.*` (excludes svelte) | Keep unchanged                                      |

## Entity: TypeScript Configuration — SCAFFOLD

**File**: `tsconfig.json` (no modifications needed)

| Field                                             | Value                           | Notes                               |
| ------------------------------------------------- | ------------------------------- | ----------------------------------- |
| `extends`                                         | `"./.svelte-kit/tsconfig.json"` | SvelteKit generates the base config |
| `compilerOptions.strict`                          | `true`                          |                                     |
| `compilerOptions.moduleResolution`                | `"bundler"`                     |                                     |
| `compilerOptions.rewriteRelativeImportExtensions` | `true`                          |                                     |
| `compilerOptions.sourceMap`                       | `true`                          |                                     |

Path aliases (`$lib`) are handled by SvelteKit's generated tsconfig.

## Entity: SvelteKit Type Declarations — SCAFFOLD

**File**: `src/app.d.ts` (no modifications needed)

Declares the `App` namespace with optional interfaces: `Error`, `Locals`, `PageData`, `PageState`, `Platform`.

## Entity: HTML Shell — MODIFY

**File**: `src/app.html` (scaffold-generated)

Scaffold provides the basic shell. Modifications needed: update icon, add PWA meta tags.

| Placeholder        | Purpose                                                                                |
| ------------------ | -------------------------------------------------------------------------------------- |
| `%sveltekit.head%` | SvelteKit injects CSS links, preload hints, meta tags                                  |
| `%sveltekit.body%` | SvelteKit injects rendered page content (wrapped in `<div style="display: contents">`) |

Scaffold default has `data-sveltekit-preload-data="hover"` on `<body>`.

## Entity: Root Layout — MODIFY

**File**: `src/routes/+layout.svelte` (scaffold-generated)

Uses Svelte 5 runes. Scaffold imports `layout.css` and renders children:

```svelte
<script lang="ts">
	import './layout.css';
	let { children } = $props();
</script>

{@render children()}
```

Modifications: add any global UI chrome (if needed), PWA update prompt.

## Entity: Layout CSS — MODIFY

**File**: `src/routes/layout.css` (scaffold-generated)

Scaffold provides minimal `@import 'tailwindcss'`. Existing custom Tailwind utilities (`@utility`) and styles from `src/style.css` must be merged in.

## Entity: Title Screen — MODIFY

**File**: `src/routes/+page.svelte` (scaffold placeholder → full rewrite)

Replaces `src/screens/title/component.ts` (112 lines of manual DOM).

| Responsibility       | Description                                       |
| -------------------- | ------------------------------------------------- |
| Difficulty selection | Renders difficulty options using Svelte `{#each}` |
| Navigation           | Uses SvelteKit `goto("/play")` to navigate        |
| State initialization | Calls game state generator on difficulty select   |

## Entity: Play Screen — NEW

**File**: `src/routes/play/+page.svelte`

Replaces `src/screens/play/component.ts` (80 lines of manual DOM).

| Responsibility        | Description                              |
| --------------------- | ---------------------------------------- |
| Board rendering       | Uses `<Board>` Svelte component          |
| Game state management | Reactive `$state()` bound to game state  |
| Win condition         | Navigates back to `/` on game completion |

## Entity: Board Component — NEW

**File**: `src/lib/game/board/Board.svelte`

Replaces `src/game/board/component.ts` (259 lines of manual DOM).

| Responsibility     | Description                                            |
| ------------------ | ------------------------------------------------------ |
| Card grid layout   | Renders cards using `{#each}` with `<Card>` components |
| Selection handling | Svelte event handling for card clicks                  |
| Animations         | CSS transitions or Svelte `transition:` directives     |
| Board state        | Reactive binding to board model via `$props()`         |

### Props (Svelte 5 runes)

```svelte
<script lang="ts">
	import type { Board } from './model.ts';
	import type { Card } from '../card/model.ts';

	let {
		board,
		selectedCards,
		onCardSelect
	}: {
		board: Board;
		selectedCards: Card[];
		onCardSelect: (card: Card) => void;
	} = $props();
</script>
```

## Entity: Card Component — NEW

**File**: `src/lib/game/card/Card.svelte`

Replaces `src/game/card/renderer.ts` (150 lines of manual DOM).

| Responsibility  | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| Card rendering  | SVG/HTML rendering of card attributes (shape, color, shading, number) |
| Selection state | Visual feedback for selected/unselected via Svelte class directives   |
| Click handling  | Calls `onSelect` prop on click                                        |

### Props (Svelte 5 runes)

```svelte
<script lang="ts">
	import type { Card } from './model.ts';

	let {
		card,
		selected = false,
		onSelect
	}: {
		card: Card;
		selected?: boolean;
		onSelect: (card: Card) => void;
	} = $props();
</script>
```

## Entity: Service Worker — NEW

**File**: `src/service-worker.ts`

Replaces `src/pwa/src/service_worker.js`.

| Field                | Type            | Description                                                    |
| -------------------- | --------------- | -------------------------------------------------------------- |
| `self.__WB_MANIFEST` | PrecacheEntry[] | Injected by Workbox at build time — array of `{url, revision}` |
| Cache strategy       | Logic           | Cache-first with network fallback (unchanged)                  |
| Cache invalidation   | Logic           | Old caches deleted on activate (unchanged)                     |

### State Transitions

```
Install → Precache all assets from __WB_MANIFEST
Activate → Delete old caches, claim clients
Fetch → Cache-first, fall back to network
```

## Entity: PWA Plugin Configuration

Added to scaffold's `vite.config.ts` as a Vite plugin.

| Field                | Type        | Description                                      |
| -------------------- | ----------- | ------------------------------------------------ |
| `strategies`         | string      | `injectManifest` — use hand-written SW           |
| `srcDir`             | string      | `"src"`                                          |
| `filename`           | string      | `"service-worker.ts"`                            |
| `manifest`           | WebManifest | PWA manifest fields (name, icons, display, etc.) |
| `devOptions.enabled` | boolean     | `false` — no SW in development                   |

## Entity: Package Configuration — MODIFY

**File**: `package.json` (scaffold-generated)

Scaffold provides all scripts and deps. Modifications: add `@vite-pwa/sveltekit`, update `name`.

| Field                 | Scaffold Value                                                 | Notes             |
| --------------------- | -------------------------------------------------------------- | ----------------- |
| `name`                | `"tmp-scaffold"`                                               | Change to `"set"` |
| `type`                | `"module"`                                                     | Keep              |
| `scripts.dev`         | `"vite dev"`                                                   | Keep              |
| `scripts.build`       | `"vite build"`                                                 | Keep              |
| `scripts.preview`     | `"vite preview"`                                               | Keep              |
| `scripts.prepare`     | `"svelte-kit sync \|\| echo ''"`                               | Keep              |
| `scripts.check`       | `"svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"` | Keep              |
| `scripts.check:watch` | Same + `--watch`                                               | Keep              |
| `scripts.lint`        | `"prettier --check . && eslint ."`                             | Keep              |
| `scripts.format`      | `"prettier --write ."`                                         | Keep              |
| `scripts.test:unit`   | `"vitest"`                                                     | Keep (watch mode) |
| `scripts.test`        | `"npm run test:unit -- --run"`                                 | Keep (single run) |

## Entity: ESLint Configuration — SCAFFOLD

**File**: `eslint.config.js` (no modifications needed)

Scaffold provides a complete flat config with:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-svelte` recommended + prettier
- `eslint-config-prettier`
- `.gitignore` integration via `@eslint/compat`
- Svelte file parser options (`projectService`, `extraFileExtensions`)
- `no-undef: 'off'` (TypeScript handles this)

## Entity: Prettier Configuration — SCAFFOLD

**File**: `.prettierrc` (no modifications needed)

| Field                | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| `useTabs`            | `true`                                                      |
| `singleQuote`        | `true`                                                      |
| `trailingComma`      | `"none"`                                                    |
| `printWidth`         | `100`                                                       |
| `plugins`            | `["prettier-plugin-svelte", "prettier-plugin-tailwindcss"]` |
| `tailwindStylesheet` | `"./src/routes/layout.css"`                                 |

Svelte file override: `{ files: "*.svelte", options: { parser: "svelte" } }`

## Entity: Environment Detection

Replaces `src/utils/environment.ts` (Deno.env-based).

| Context           | Detection Method                             | Values           |
| ----------------- | -------------------------------------------- | ---------------- |
| Svelte components | `import { dev } from "$app/environment"`     | `true` / `false` |
| Svelte components | `import { browser } from "$app/environment"` | `true` / `false` |
| Tests (Vitest)    | `import.meta.env.MODE`                       | `"test"`         |

## Files Removed (Lume/Deno-specific)

| File                                   | Reason                                                            |
| -------------------------------------- | ----------------------------------------------------------------- |
| `_config.ts`                           | Lume configuration — replaced by scaffold                         |
| `deno.json`                            | Deno configuration — replaced by scaffold                         |
| `src/pwa/plugin.ts`                    | Lume PWA plugin — replaced by `@vite-pwa/sveltekit`               |
| `src/pwa/src/service_worker.js`        | Moved to `src/service-worker.ts`                                  |
| `src/pwa/src/manifest.webmanifest.vto` | Vento template — replaced by plugin manifest config               |
| `src/index.vto`                        | Vento template — replaced by `src/app.html` (scaffold)            |
| `src/_includes/layout.vto`             | Vento layout — replaced by `src/routes/+layout.svelte` (scaffold) |
| `src/screens/router.ts`                | Manual router — replaced by SvelteKit file-based routing          |
| `src/screens/title/component.ts`       | Manual DOM — replaced by `src/routes/+page.svelte`                |
| `src/screens/play/component.ts`        | Manual DOM — replaced by `src/routes/play/+page.svelte`           |
| `src/game/board/component.ts`          | Manual DOM — replaced by Board.svelte                             |
| `src/game/card/renderer.ts`            | Manual DOM — replaced by Card.svelte                              |
| `src/game/main.ts`                     | App entry point — replaced by SvelteKit app entry                 |
| `src/style.css`                        | Merged into `src/routes/layout.css` (scaffold)                    |

## Files from Scaffold (generated by `sv create`)

| File                             | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `svelte.config.js`               | SvelteKit configuration (needs modification)           |
| `vite.config.ts`                 | Vite + Vitest configuration (needs modification)       |
| `package.json`                   | Dependencies and scripts (needs modification)          |
| `eslint.config.js`               | ESLint flat config (no changes)                        |
| `.prettierrc`                    | Prettier config (no changes)                           |
| `.prettierignore`                | Prettier ignore patterns (no changes)                  |
| `.npmrc`                         | `engine-strict=true` (no changes)                      |
| `.gitignore`                     | Node.js + SvelteKit ignores (no changes)               |
| `tsconfig.json`                  | TypeScript config extending SvelteKit (no changes)     |
| `src/app.html`                   | HTML shell (needs modification)                        |
| `src/app.d.ts`                   | SvelteKit type declarations (no changes)               |
| `src/routes/+layout.svelte`      | Root layout (needs modification)                       |
| `src/routes/+page.svelte`        | Home page placeholder (full rewrite)                   |
| `src/routes/layout.css`          | CSS entry `@import 'tailwindcss'` (needs modification) |
| `src/lib/index.ts`               | Library re-exports (no changes)                        |
| `src/lib/assets/favicon.svg`     | Default favicon (replace with game icon)               |
| `static/robots.txt`              | Robots file (no changes)                               |
| `.vscode/settings.json`          | TailwindCSS file association (no changes)              |
| `src/demo.spec.ts`               | Demo test — **delete after setup**                     |
| `src/routes/page.svelte.spec.ts` | Demo component test — **delete after setup**           |

## Files Added on Top of Scaffold

| File                              | Purpose                |
| --------------------------------- | ---------------------- |
| `src/routes/play/+page.svelte`    | Play screen page       |
| `src/lib/game/board/Board.svelte` | Board Svelte component |
| `src/lib/game/card/Card.svelte`   | Card Svelte component  |
| `src/service-worker.ts`           | Service worker source  |

## Files Modified (existing game files)

| File                        | Change                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| All `*_test.ts` files (14+) | Migrate from `Deno.test` + `jsr:@std/assert` to Vitest `test` + `expect`. Rename to `*.test.ts`. |
| `tests/build_test.ts`       | Update for `build/` output dir. Rename to `tests/build.test.ts`.                                 |
| `src/utils/environment.ts`  | Replace `Deno.env.get()` with `import.meta.env`                                                  |
| `.github/workflows/ci.yml`  | Replace `setup-deno` with `setup-node`, `npm ci`, `npm run test/lint/build`                      |
| `.github/workflows/cd.yml`  | Update artifact path from `_site` to `build`, use `npm run build`                                |

## Files Moved (unchanged content)

| From                         | To                               | Reason                      |
| ---------------------------- | -------------------------------- | --------------------------- |
| `src/game/attributes/`       | `src/lib/game/attributes/`       | SvelteKit `$lib` convention |
| `src/game/board/model.ts`    | `src/lib/game/board/model.ts`    | SvelteKit `$lib` convention |
| `src/game/board/replacer.ts` | `src/lib/game/board/replacer.ts` | SvelteKit `$lib` convention |
| `src/game/card/model.ts`     | `src/lib/game/card/model.ts`     | SvelteKit `$lib` convention |
| `src/game/card/equality.ts`  | `src/lib/game/card/equality.ts`  | SvelteKit `$lib` convention |
| `src/game/deck/*`            | `src/lib/game/deck/*`            | SvelteKit `$lib` convention |
| `src/game/difficulty/*`      | `src/lib/game/difficulty/*`      | SvelteKit `$lib` convention |
| `src/game/selection/*`       | `src/lib/game/selection/*`       | SvelteKit `$lib` convention |
| `src/game/set/*`             | `src/lib/game/set/*`             | SvelteKit `$lib` convention |
| `src/game/state/*`           | `src/lib/game/state/*`           | SvelteKit `$lib` convention |
| `src/utils/*`                | `src/lib/utils/*`                | SvelteKit `$lib` convention |
| `src/pwa/src/icons/*`        | `static/icons/*`                 | SvelteKit static assets     |
