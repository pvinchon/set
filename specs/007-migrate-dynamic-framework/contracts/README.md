# Contracts: Migrate to Dynamic Framework

**Feature**: 007-migrate-dynamic-framework
**Date**: 2026-02-24

## Overview

This migration has no API contracts (no server, no REST/GraphQL endpoints). The "contracts" are the SvelteKit configuration interfaces, Svelte component contracts, and the file conventions that the framework expects. Many are provided by the `sv create` scaffold and need only minor modifications.

## Contract 1: SvelteKit Configuration — MODIFY

**File**: `svelte.config.js`

Scaffold provides a minimal config. Add `fallback` and `paths.base`:

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

## Contract 2: Vite Configuration — MODIFY

**File**: `vite.config.ts` (TypeScript — scaffold-generated)

Scaffold provides the full Vitest two-project setup. Add `@vite-pwa/sveltekit` plugin:

```typescript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			devOptions: { enabled: false },
			manifest: {
				name: 'Set',
				short_name: 'Set',
				start_url: '/set/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#111827',
				icons: [
					{ src: '/set/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/set/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/set/icons/icon-maskable-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/set/icons/icon-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
```

## Contract 3: HTML Shell — MODIFY

**File**: `src/app.html` (scaffold-generated)

Scaffold provides the basic shell. Update icon and add PWA meta:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#111827" />
		<link rel="icon" href="%sveltekit.assets%/icons/icon-192.png" />
		<link rel="apple-touch-icon" href="%sveltekit.assets%/icons/icon-192.png" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

## Contract 4: Service Worker Interface — NEW

**File**: `src/service-worker.ts`

Must contain the `self.__WB_MANIFEST` injection point for Workbox:

```typescript
declare const self: ServiceWorkerGlobalScope;

// Workbox replaces this with the precache manifest at build time
const precacheEntries = self.__WB_MANIFEST;
```

The service worker must:

- Extract URLs from precache entries
- Cache all entries on install
- Delete old caches on activate
- Serve cache-first on fetch

## Contract 5: Svelte Component Interface — Card — NEW

**File**: `src/lib/game/card/Card.svelte`

Uses Svelte 5 runes for props:

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

Props:

- `card` (Card): The card data to render
- `selected` (boolean): Whether the card is visually selected
- `onSelect` (callback): Called when the card is clicked

## Contract 6: Svelte Component Interface — Board — NEW

**File**: `src/lib/game/board/Board.svelte`

Uses Svelte 5 runes for props:

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

Props:

- `board` (Board): The board state with card positions
- `selectedCards` (Card[]): Currently selected cards
- `onCardSelect` (callback): Called when a card is selected/deselected

## Contract 7: Package Scripts — MODIFY

**File**: `package.json` (scaffold-generated)

Scaffold provides all scripts. Only modification: add `@vite-pwa/sveltekit` dependency and update `name`:

```json
{
	"name": "set",
	"private": true,
	"version": "0.0.1",
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"prepare": "svelte-kit sync || echo ''",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write .",
		"test:unit": "vitest",
		"test": "npm run test:unit -- --run"
	}
}
```

## Contract 8: ESLint Configuration — SCAFFOLD

**File**: `eslint.config.js` (no modifications needed)

```javascript
import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
```

## Contract 9: Prettier Configuration — SCAFFOLD

**File**: `.prettierrc` (no modifications needed)

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }],
	"tailwindStylesheet": "./src/routes/layout.css"
}
```

## Contract 10: Output Directory Structure

**Directory**: `build/` (after `npm run build`)

```
build/
├── index.html                    # Prerendered title page
├── play/
│   └── index.html                # Prerendered play page
├── 404.html                      # SPA fallback
├── manifest.webmanifest          # Generated by @vite-pwa/sveltekit
├── service-worker.js             # Compiled from src/service-worker.ts
├── icons/                        # Copied from static/icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
└── _app/                         # SvelteKit generated assets
    ├── immutable/
    │   ├── chunks/               # Code-split JS chunks
    │   └── entry/                # Entry points
    └── version.json              # App version for cache busting
```

## Contract 11: Test File Conventions

### Game Logic Tests (server project)

**Pattern**: `src/lib/game/**/*.test.ts`

```typescript
import { describe, expect, test } from 'vitest';

test('drawCards returns requested count', () => {
	expect(result).toHaveLength(3);
});
```

### Svelte Component Tests (client project)

**Pattern**: `src/**/*.svelte.spec.ts`

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
