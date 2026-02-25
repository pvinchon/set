# Research: Migrate to Dynamic Framework (PWA-Compatible)

**Feature**: 007-migrate-dynamic-framework
**Date**: 2026-02-24

## 1. Framework Selection

### Decision: SvelteKit with @sveltejs/adapter-static

### Rationale

SvelteKit is a full application framework built on Vite that satisfies the user requirement for routing, a component model, and integrated build tooling:

- **Compile-time framework**: Svelte compiles components to vanilla JS at build time. The runtime is ~7–10 KB gzipped — within the 100 KB budget (current ~88 KB + ~10 KB = ~98 KB).
- **File-based routing**: SvelteKit provides file-system routing via `src/routes/`, eliminating the hand-written `src/screens/router.ts`.
- **Component model**: `.svelte` single-file components replace manual DOM construction (`document.createElement` patterns). Reactive declarations simplify state-to-DOM binding.
- **Static adapter**: `@sveltejs/adapter-static` produces static files deployable to GitHub Pages — no server runtime needed.
- **Vite-powered**: SvelteKit uses Vite under the hood, providing HMR, TailwindCSS integration, and modern bundling.
- **PWA support**: `@vite-pwa/sveltekit` integrates Workbox-based service worker generation with SvelteKit.

### Alternatives Considered

| Framework               | Status    | Why Rejected                                                                                                                         |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Vite (standalone)**   | Evaluated | Build tool only — no routing, no component model. User explicitly requested a "full application framework."                          |
| **Fresh** (Deno-native) | Evaluated | Docs state "if you want to build a SPA, Fresh is not the right framework." Requires server runtime — incompatible with GitHub Pages. |
| **Astro** (v5.17)       | Evaluated | Islands architecture provides zero benefit when 100% of the page is client-side JS.                                                  |
| **Aleph.js**            | Evaluated | Abandoned; last meaningful commit 2023.                                                                                              |
| **Ultra**               | Evaluated | Unmaintained since mid-2024.                                                                                                         |

### Runtime Decision: Node.js Everywhere

SvelteKit's CLI (`svelte-kit sync`, `svelte-package`) requires Node.js. Rather than maintaining a dual Deno+Node runtime, the project fully adopts the Node.js/npm ecosystem:

- **Build/Dev**: `npm run dev`, `npm run build`
- **Tests**: Vitest (replaces `deno test` + `jsr:@std/assert`)
- **Lint**: ESLint with `@eslint/js` + `typescript-eslint` (replaces `deno lint`)
- **Format**: Prettier (replaces `deno fmt`)

Single runtime simplifies CI/CD (only `actions/setup-node@v4`), eliminates the `deno.json` config, and avoids path alias duplication.

### Scaffolding Command

The project foundation is created by the Svelte CLI:

```bash
npx sv create \
  --template minimal \
  --types ts \
  --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:none" sveltekit-adapter="adapter:static" \
  --install npm \
  <target-directory>
```

This generates a complete SvelteKit project with all tooling pre-configured. The migration builds on top of this scaffold output.

### Node.js Version Requirement

Scaffold dependencies (specifically `@eslint/compat@^2.0.2`) require **Node.js `^20.19.0 || ^22.13.0 || >=24`**. The recommended version is **Node.js 22 LTS** (22.13.0+). The `.npmrc` includes `engine-strict=true` to enforce this.

## 2. Component Migration Scope

### Decision: Rewrite 6 DOM-constructing files into Svelte 5 components (694 lines)

### Rationale

SvelteKit requires `.svelte` files for its component model and routing. The following files use manual DOM construction (`document.createElement`, `innerHTML`, event listener wiring) and must be rewritten using **Svelte 5 runes** (`$props()`, `$state()`, `$derived()`, `$effect()`):

| Current File                     | Lines | Becomes                           |
| -------------------------------- | ----- | --------------------------------- |
| `src/screens/title/component.ts` | 112   | `src/routes/+page.svelte`         |
| `src/screens/play/component.ts`  | 80    | `src/routes/play/+page.svelte`    |
| `src/game/board/component.ts`    | 259   | `src/lib/game/board/Board.svelte` |
| `src/game/card/renderer.ts`      | 150   | `src/lib/game/card/Card.svelte`   |
| `src/screens/router.ts`          | 67    | **Deleted** (SvelteKit routing)   |
| `src/game/main.ts`               | 26    | **Deleted** (SvelteKit app entry) |

All 14+ pure TypeScript game logic files (card model, deck, set validation, state management, selection, difficulty, attributes, utilities) remain **unchanged**. They move from `src/game/` to `src/lib/game/` to use SvelteKit's `$lib` alias.

### Svelte 5 Props Pattern

The scaffold uses Svelte 5 runes. Components receive props via `$props()`:

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

The root layout uses `children` snippet (replaces `<slot />`):

```svelte
<script lang="ts">
	let { children } = $props();
</script>

{@render children()}
```

### Alternatives Considered

| Approach                                  | Why Rejected                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Keep vanilla DOM alongside SvelteKit      | Anti-pattern — bypasses SvelteKit's reactivity and would need manual wiring for each page. |
| Wrapper components that call vanilla code | Still requires manual DOM mounting/cleanup — all the complexity with none of the benefits. |

## 3. Static Adapter Configuration

### Decision: `@sveltejs/adapter-static` with prerendered SPA fallback

### Rationale

The Set game is a fully client-side SPA. The static adapter:

- Prerenders routes at build time (`/` and `/play`)
- Produces a `build/` directory with static HTML, CSS, JS
- Sets `fallback: "404.html"` for SPA client-side routing support on GitHub Pages

The scaffold generates a minimal `svelte.config.js` that only needs the base path added:

```js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		paths: { base: '/set' }
	}
};

export default config;
```

### Output Structure

```
build/
├── index.html
├── play/index.html
├── 404.html
├── manifest.webmanifest
├── service-worker.js
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
└── _app/
    ├── immutable/
    │   ├── chunks/
    │   └── entry/
    └── version.json
```

## 4. PWA & Service Worker Migration

### Decision: `@vite-pwa/sveltekit` with `injectManifest` strategy

### Rationale

The existing hand-written service worker logic (cache-first strategy, cache invalidation on activate) is preserved. `@vite-pwa/sveltekit` integrates with SvelteKit's build to generate the precache manifest.

| Aspect                | Current (Lume)                           | New (SvelteKit)                                           |
| --------------------- | ---------------------------------------- | --------------------------------------------------------- |
| Cache URL injection   | `__CACHE_URLS__` → JS array literal      | `self.__WB_MANIFEST` → array of `{url, revision}` objects |
| Cache name            | `__CACHE_NAME__` → `set-v${Date.now()}`  | Derive from manifest hash or keep timestamp approach      |
| Build-time processing | Custom Lume plugin (`src/pwa/plugin.ts`) | `@vite-pwa/sveltekit` config in `vite.config.ts`          |
| SW source             | `src/pwa/src/service_worker.js` (raw JS) | `src/service-worker.ts` (can be TypeScript)               |
| Dev mode              | SW enabled (manual toggle)               | SW disabled (`devOptions.enabled: false`)                 |

### Alternatives Considered

| Approach                               | Why Rejected                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `generateSW` strategy                  | Replaces hand-written SW with auto-generated one — loses custom cache logic. |
| SvelteKit built-in `service-worker.ts` | Less mature than Workbox; no `injectManifest` equivalent.                    |
| Raw Workbox (no plugin)                | More manual wiring; plugin integrates with SvelteKit build already.          |

## 5. TailwindCSS Integration

### Decision: `@tailwindcss/vite` plugin (provided by scaffold)

### Rationale

The scaffold generates TailwindCSS v4 integration out of the box:

- Plugin registered in `vite.config.ts`: `tailwindcss()` in the plugins array
- CSS entry point at `src/routes/layout.css` containing `@import 'tailwindcss'`
- Imported in `+layout.svelte` via `import './layout.css'`
- Prettier configured with `prettier-plugin-tailwindcss` for class sorting
- VS Code `files.associations` set to use `tailwindcss` language for `.css` files

No additional TailwindCSS configuration needed — the scaffold handles everything.

### Fallback

If the native Oxide engine has issues, use `@tailwindcss/postcss` with Vite's PostCSS support.

## 6. Path Aliases

### Decision: SvelteKit `$lib` alias + Vitest inherits from Vite config

### Rationale

With a single Node.js runtime, path resolution is unified:

1. **SvelteKit (dev/build)**: `$lib` alias resolves to `src/lib/` automatically. No config needed.
2. **Vitest (tests)**: Inherits `resolve.alias` from `vite.config.ts` — `$lib` works in test files automatically.
3. **TypeScript**: `tsconfig.json` extends `.svelte-kit/tsconfig.json` which sets up the alias.

In Svelte components: `import { createDeck } from "$lib/game/deck/mod";`
In Vitest tests: `import { createDeck } from "$lib/game/deck/mod";`

No duplicate alias configuration needed. The `deno.json` imports map is eliminated.

## 7. Environment Detection

### Decision: Replace `Deno.env.get("ENV")` with SvelteKit environment modules + Vitest globals

### Rationale

SvelteKit provides `$app/environment` with `dev`, `building`, `browser` booleans:

| Context           | Detection Method                             | Values           |
| ----------------- | -------------------------------------------- | ---------------- |
| Svelte components | `import { dev } from "$app/environment"`     | `true` / `false` |
| Svelte components | `import { browser } from "$app/environment"` | `true` / `false` |
| Tests (Vitest)    | `import.meta.env.MODE`                       | `"test"`         |

## 8. Testing Strategy

### Decision: Vitest with two test projects (scaffold-provided)

### Rationale

The scaffold generates a Vitest configuration with **two separate test projects** in `vite.config.ts`:

1. **`client` project** — Svelte component tests run in a real browser via Playwright:
   - Uses `@vitest/browser-playwright` provider (Chromium, headless)
   - Uses `vitest-browser-svelte` for component rendering
   - Matches: `src/**/*.svelte.{test,spec}.{js,ts}`
   - Excludes: `src/lib/server/**`

2. **`server` project** — Pure logic tests run in Node.js:
   - Environment: `node`
   - Matches: `src/**/*.{test,spec}.{js,ts}`
   - Excludes: `src/**/*.svelte.{test,spec}.{js,ts}`

Both use `expect.requireAssertions: true` by default.

### Migration Pattern

Game logic tests (14+ files) go into the **server** project. They're pure TypeScript — only the harness changes:

```typescript
// Before (Deno)
import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
Deno.test('drawCards returns requested count', () => {
	assertEquals(result.length, 3);
});

// After (Vitest)
import { expect, test } from 'vitest';
test('drawCards returns requested count', () => {
	expect(result).toHaveLength(3);
});
```

New Svelte component tests use the **client** project with browser rendering:

```typescript
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Card from './Card.svelte';

describe('Card.svelte', () => {
	it('should render card shape', async () => {
		render(Card, { props: { card, onSelect: () => {} } });
		const shape = page.getByTestId('card-shape');
		await expect.element(shape).toBeInTheDocument();
	});
});
```

### Test File Naming

The scaffold supports both `.test.ts` and `.spec.ts` patterns. Convention for this project:

- Game logic: `*.test.ts` (migrated from `*_test.ts`)
- Svelte components: `*.svelte.spec.ts` (new, runs in browser)

### CI Pipeline

```yaml
- name: All Tests
  run: npm run test
```

## 9. CI/CD Impact

### Decision: Node.js-only CI pipeline

| Step              | Current                              | New                                        |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| Setup             | `denoland/setup-deno@v2`             | `actions/setup-node@v4` (Node.js 22 LTS)   |
| Install deps      | N/A (Deno caches)                    | `npm ci`                                   |
| Format            | `deno fmt --check`                   | `npx prettier --check .`                   |
| Lint              | `deno lint`                          | `npm run lint` (Prettier check + ESLint)   |
| Test              | `deno task test`                     | `npm run test` (Vitest)                    |
| Build             | `deno task build` (Lume)             | `npm run build` (SvelteKit)                |
| Build + base path | `--location=https://...` (Lume flag) | `paths.base: "/set"` in `svelte.config.js` |
| Artifact path     | `_site/`                             | `build/`                                   |

### Browser Testing in CI

The `client` test project requires Playwright browsers. CI must install them:

```yaml
- run: npx playwright install chromium --with-deps
```

## 10. Lint & Format Tooling

### Decision: ESLint + Prettier (scaffold-provided)

### Rationale

The scaffold generates fully configured ESLint and Prettier setups.

**ESLint** (`eslint.config.js`) — flat config using `defineConfig`:

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-plugin-svelte` recommended + prettier rules
- `eslint-config-prettier` to disable formatting rules
- `@eslint/compat` `includeIgnoreFile` for `.gitignore` integration
- Svelte files get `projectService: true` + `extraFileExtensions: ['.svelte']`
- `no-undef` disabled (TypeScript handles this)

**Prettier** (`.prettierrc`):

- Tabs for indentation (`useTabs: true`)
- Single quotes
- No trailing commas
- 100 char print width
- `prettier-plugin-svelte` for `.svelte` formatting
- `prettier-plugin-tailwindcss` for class sorting
- `tailwindStylesheet` pointing to `src/routes/layout.css`

**`.prettierignore`**: Ignores lock files and `/static/`

The `lint` script combines both: `prettier --check . && eslint .`

### Alternatives Considered

| Tool                     | Why Not Chosen                                                            |
| ------------------------ | ------------------------------------------------------------------------- |
| Biome                    | Lacks Svelte file support — would need Prettier for `.svelte` anyway.     |
| `deno lint` + `deno fmt` | Would require maintaining Deno alongside Node.js (dual runtime rejected). |

## 11. Constitution Compliance

### Violations Requiring Amendment

| Constitution Clause                                 | Violation                                              | Justification                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Lume is the static site generator"                 | Replacing Lume with SvelteKit                          | This migration IS the feature. Lume constraint was descriptive of current state, not prescriptive.                                                                                     |
| "Zero external runtime dependencies: no frameworks" | Svelte runtime (~7–10 KB gzipped) ships to the browser | The spirit was "no heavy frameworks bloating the bundle." Svelte's compile-time approach keeps the runtime minimal. Total payload still under 100 KB. User explicitly chose SvelteKit. |
| "Runtime: Deno" / "Local dev: deno task only"       | Replacing Deno with Node.js/npm entirely               | SvelteKit requires Node.js. Using npm everywhere is simpler than a dual runtime. User explicitly chose npm everywhere.                                                                 |
| "Testing: deno test"                                | Replacing with Vitest                                  | Vitest is the standard test runner for Vite/SvelteKit projects. Test logic is preserved; only the harness changes.                                                                     |

### Compliant Areas

- Payload under 100 KB: ~88 KB current + ~10 KB Svelte runtime = ~98 KB (tight but within budget)
- Offline-first: `@vite-pwa/sveltekit` preserves all PWA capabilities
- Simplicity: Svelte components are more declarative than manual DOM construction
- TypeScript: Unchanged for game logic; Svelte files support TypeScript in `<script lang="ts">`
- TailwindCSS: Native Vite plugin, works in `.svelte` files
- GitHub Actions: Single runtime setup (Node.js only)
- GitHub Pages: Static output via `adapter-static`

### Required Constitution Amendments

1. Replace "Lume is the static site generator" → "SvelteKit with adapter-static is the application framework"
2. Replace "no frameworks" → "Svelte is the UI framework (compile-time, minimal runtime)"
3. Replace "Deno" runtime references → "Node.js 22 LTS / npm"
4. Replace "deno test" → "Vitest"
5. Replace "deno task for local dev" → "npm scripts for all local commands"

## 12. Build Size Baseline

| Asset               | Current Size | Expected After Migration                  |
| ------------------- | ------------ | ----------------------------------------- |
| `main.js`           | 37 KB        | ~44–47 KB (game logic + Svelte runtime)   |
| `style.css`         | 18 KB        | ~18 KB (unchanged, same Tailwind classes) |
| `service_worker.js` | 1.2 KB       | ~1.5 KB (Workbox manifest injection)      |
| `index.html`        | 619 B        | ~1–2 KB (SvelteKit shell)                 |
| Icons (4 PNGs)      | ~30 KB       | ~30 KB (unchanged)                        |
| **Total**           | **~88 KB**   | **~95–98 KB**                             |

The ~10 KB increase from Svelte runtime keeps total payload under the 100 KB constitution limit.
