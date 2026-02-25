# Feature Specification: Migrate to Dynamic Framework (PWA-Compatible)

**Feature Branch**: `007-migrate-dynamic-framework`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Migrate from lume towards a more dynamic framework that would still work as a pwa"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Application Runs Under a Dynamic Framework (Priority: P1)

A user navigates to the Set Card Game URL in their browser. The application loads and renders the title screen, just as it does today, but is now served and built by a dynamic framework instead of the Lume static site generator. The entire user experience — title screen, difficulty selection, gameplay, animations — remains identical.

**Why this priority**: The migration must first achieve feature parity. If the game does not work exactly as before, nothing else matters.

**Independent Test**: Open the application in a browser, play a full game from title screen through difficulty selection to gameplay completion, and confirm all existing functionality works identically.

**Acceptance Scenarios**:

1. **Given** the application is built with the new framework, **When** a user visits the root URL, **Then** the title screen is displayed with the same visual appearance and behaviour as the current Lume-based version.
2. **Given** the user is on the title screen, **When** they select a difficulty and start a game, **Then** the play screen loads with working card rendering, selection, set validation, and board animations.
3. **Given** the application is running, **When** a user navigates between screens, **Then** screen transitions and animations behave identically to the current version.

---

### User Story 2 - PWA Functionality Is Preserved (Priority: P1)

A user installs the Set Card Game as a PWA on their device. The app icon appears on their home screen, the app launches in standalone mode, and the service worker caches assets for offline play.

**Why this priority**: PWA support is an explicit constraint of the migration and is equally critical as feature parity.

**Independent Test**: Install the app as a PWA, go offline, and confirm the game loads and plays fully from cache.

**Acceptance Scenarios**:

1. **Given** the application is served by the new framework, **When** a user visits in a modern browser, **Then** the browser offers to install the app as a PWA (manifest and service worker are present and valid).
2. **Given** the user has previously visited the app while online, **When** they open the app without an internet connection, **Then** all critical assets are served from the service worker cache and the game is fully playable.
3. **Given** a new version of the app is deployed, **When** a returning user opens the app, **Then** the service worker updates its cache and the user receives the latest version.

---

### User Story 3 - Development Workflow Supports Hot Reload (Priority: P2)

A developer working on the Set Card Game runs a local development server. When they change a source file, the browser automatically refreshes or hot-reloads to display the change without a manual browser refresh.

**Why this priority**: A modern development experience with fast feedback loops is a key motivation for migrating away from a static site generator.

**Independent Test**: Start the dev server, edit a component file, and observe the browser reflecting the change within seconds.

**Acceptance Scenarios**:

1. **Given** the developer has the dev server running, **When** they modify a TypeScript source file, **Then** the browser reflects the change within 3 seconds without a full page reload where feasible.
2. **Given** the developer has the dev server running, **When** they modify a CSS/style file, **Then** style changes are applied in the browser without a full page reload.

---

### User Story 4 - Production Build Produces Optimised Static Output (Priority: P2)

A developer runs the production build command. The framework produces an optimised bundle of static assets (HTML, CSS, JS) that can be deployed to any static hosting service (e.g., GitHub Pages, Netlify, Cloudflare Pages), preserving current deployment flexibility.

**Why this priority**: The Set Card Game is a client-side app with no server-side logic. The ability to deploy as static files is essential for simplicity and cost.

**Independent Test**: Run the build command, inspect the output directory, and deploy to a static host to verify the app works end-to-end.

**Acceptance Scenarios**:

1. **Given** a developer runs the production build command, **When** the build completes, **Then** the output directory contains optimised, minified HTML, CSS, and JS files ready for static deployment.
2. **Given** the production build output, **When** deployed to a static file server, **Then** the application functions identically to the development version including PWA features.
3. **Given** the production build, **When** compared to the current Lume build output, **Then** the total asset size does not increase by more than 20%.

---

### User Story 5 - Service Worker Is Not Registered in Development (Priority: P3)

During local development, the service worker is not registered so that developers do not encounter stale cached assets while iterating on changes.

**Why this priority**: This is a quality-of-life improvement for developers. Stale caches during development cause confusion and wasted debugging time.

**Independent Test**: Start the dev server, open browser DevTools, and confirm no service worker is registered.

**Acceptance Scenarios**:

1. **Given** the application is running in development mode, **When** a developer inspects the Service Workers panel in DevTools, **Then** no service worker is registered.
2. **Given** the application is running in production mode, **When** a user inspects the Service Workers panel, **Then** the service worker is properly registered and caching assets.

---

### Edge Cases

- What happens when the new framework dev server is started but the build output directory does not yet exist? The server should build on demand or serve from source.
- How does the migration handle existing bookmarks or cached versions of the old site? The same URL paths and service worker scope must be preserved to avoid breaking existing PWA installations.
- What happens if TailwindCSS integration differs between Lume and the new framework? Styling must remain visually identical.
- How are existing test files (using Deno.test + jsr:@std/assert) migrated to the new test runner?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The application MUST render and function identically to the current Lume-based version across all screens (title, play) and interactions (card selection, set validation, board animations, screen transitions).
- **FR-002**: The application MUST serve a valid web app manifest at `/manifest.webmanifest` with the same metadata (name, icons, display mode, theme colour) as the current version.
- **FR-003**: The application MUST register a service worker in production that pre-caches all critical assets for offline play.
- **FR-004**: The application MUST NOT register a service worker in development mode.
- **FR-005**: The production build MUST output static files (HTML, CSS, JS, icons, manifest) deployable to any static hosting service without a server runtime.
- **FR-006**: The development server MUST support automatic browser refresh or hot module replacement when source files change.
- **FR-007**: The build system MUST bundle and minify TypeScript source files for production.
- **FR-008**: The build system MUST process TailwindCSS (or equivalent utility CSS) and produce a minified stylesheet for production.
- **FR-009**: The application MUST serve the service worker from the root scope and provide a valid manifest URL. Asset filenames (JS, CSS) MAY use any naming convention including hashed filenames. The service worker MUST be updated to pre-cache whatever asset URLs the build produces.
- **FR-010**: The existing game logic modules (card, deck, board, selection, set validation, state, difficulty) MUST continue to work without modification to their public interfaces.
- **FR-011**: The existing test suite MUST continue to pass without modification (or with minimal test infrastructure changes only).
- **FR-012**: The framework MUST use Node.js/npm as the runtime environment for development, build, test, and lint tooling.
- **FR-013**: All Lume-specific files (`_config.ts`, `src/pwa/plugin.ts`, Vento templates, Lume lint plugin references) and Deno-specific files (`deno.json`) MUST be removed as part of the migration. Git history serves as archive.

### Key Entities

- **Build Configuration**: Replaces the current `_config.ts` Lume configuration. Defines entry points, plugins, output settings, and environment-specific behaviour.
- **Service Worker**: The offline caching worker. Must be generated or processed at build time to inject the correct cache name and asset URLs.
- **HTML Shell**: Replaces the current Vento templates (`layout.vto`, `index.vto`). The single-page HTML entry point that loads the app.
- **Asset Pipeline**: The bundling, minification, and CSS processing chain that replaces Lume esbuild + TailwindCSS plugins.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All existing game functionality works identically — a user cannot distinguish between the old and new version during gameplay.
- **SC-002**: Lighthouse PWA audit scores remain at or above the current level (all PWA checks pass).
- **SC-003**: The application loads and becomes interactive within 2 seconds on a standard broadband connection.
- **SC-004**: The production build completes in under 30 seconds.
- **SC-005**: The total production asset size does not increase by more than 20% compared to the current Lume build.
- **SC-006**: The development server starts and is ready to serve within 5 seconds.
- **SC-007**: Source file changes are reflected in the browser within 3 seconds during development.
- **SC-008**: All existing unit tests pass without changes to test logic (test infrastructure changes are acceptable).
- **SC-009**: The application works offline after a single online visit, with all game features available.

## Assumptions

- The Set Card Game is a purely client-side, single-page application with no server-side rendering requirements. "Dynamic framework" in this context means a full application framework that includes routing, a component model, and integrated build tooling (e.g., Fresh, Astro, SvelteKit), replacing Lume's static site generation with a richer development paradigm.
- The migration follows a complete replacement strategy: Lume is removed entirely and replaced with the new framework in one pass, rather than running both side-by-side. The existing test suite provides the safety net for validating feature parity.
- The migration to SvelteKit requires rewriting DOM-constructing files (screen components, card renderer, board component, router, app entry) into Svelte components. Pure game logic modules remain unchanged.
- TailwindCSS (or an equivalent utility-first CSS framework) will continue to be used for styling.
- The path alias convention will be preserved or mapped to an equivalent path alias in the new framework configuration.
- Deployment target remains static file hosting (no server runtime required in production).
- Node.js/npm is the sole runtime. Deno is fully replaced — tests migrate to Vitest, linting to ESLint, formatting to Prettier.
- Browser target is evergreen only (latest Chrome, Firefox, Safari, Edge). The build target is ESNext with no polyfills required.

## Clarifications

### Session 2026-02-24

- Q: Should the migration be a complete replacement, incremental side-by-side, or shadow build? → A: Complete replacement — remove Lume entirely, replace in one pass.
- Q: Must the current URL structure be preserved exactly, or can asset URLs change? → A: Fully flexible — no URL constraints; service worker scope and manifest URL are the only requirements.
- Q: Should Lume-specific files be deleted or kept for reference? → A: Delete all — git history serves as archive.
- Q: What is the browser compatibility target? → A: Evergreen only — latest Chrome, Firefox, Safari, Edge; ESNext target, no polyfills.
- Q: What does "dynamic framework" mean — full app framework, build tool with dev server, or build tool only? → A: Full application framework — includes routing, component model, and build tooling.
- Q: Should the project use Deno, Node.js, or both as runtime? → A: npm everywhere — Node.js/npm as sole runtime for all tooling (build, dev, test, lint, format). Deno is fully replaced.

### Session 2026-02-25

- Q: How should the SvelteKit project be bootstrapped? → A: Use `npx sv create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:none" sveltekit-adapter="adapter:static" --install npm <path>`. Build on top of the scaffold output.
