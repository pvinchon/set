# Research: Hello World Website with CI/CD

**Branch**: `001-hello-world-website` | **Date**: 2026-02-11

## Decision Log

### 1. Static Site Generator Setup — Lume with Deno

**Decision**: Use Lume (latest stable) as the Deno-native static site generator.

**Rationale**: Mandated by the constitution. Lume provides built-in Tailwind CSS plugin, Vento templating, asset pipeline, and minification — all that's needed for a "Hello, World!" page with zero external runtime dependencies.

**Alternatives considered**:
- Fresh (Deno web framework) — Rejected: requires a server runtime; violates "static files only" constraint.
- Plain Deno script generating HTML — Rejected: reinvents asset pipeline, templating, and dev server already provided by Lume.

**Setup**:
- `deno run -A https://lume.land/init.ts` scaffolds `_config.ts` and `deno.json`.
- Source files in `src/` directory; Lume outputs to `_site/`.
- `deno.json` tasks: `build`, `serve`, `lume` (base), `test`, `lint`, `fmt`.

### 2. Styling — Tailwind CSS via Lume Plugin

**Decision**: Use the Lume Tailwind CSS plugin (`lume/plugins/tailwindcss.ts`).

**Rationale**: Mandated by the constitution. The plugin scans HTML output for used classes and generates only the necessary CSS (tree-shaking built-in). Output is minified via the `minify: true` option.

**Alternatives considered**:
- Hand-written CSS — Rejected: constitution mandates Tailwind CSS.
- PostCSS + Tailwind standalone — Rejected: unnecessary complexity; Lume plugin handles it natively.

**Configuration**:
```typescript
// _config.ts
import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";

const site = lume({ src: "./src" });
site.use(tailwindcss({ minify: true }));
export default site;
```

Entry CSS file (`src/style.css`):
```css
@import "tailwindcss";
```

### 3. Templating — Vento

**Decision**: Use Vento (`.vto`) templates, Lume's default template engine.

**Rationale**: Vento is Lume's built-in engine — zero additional dependencies. Supports layouts, includes, and data cascading. Sufficient for a single-page site.

**Alternatives considered**:
- Nunjucks — Rejected: requires additional Lume plugin import; no added value for one page.
- Plain HTML — Acceptable but loses layout composition; Vento adds negligible overhead and supports future page additions.

### 4. CI Pipeline — GitHub Actions

**Decision**: Single GitHub Actions workflow (`ci.yml`) triggered on `push` and `pull_request` events. Steps: install Deno → fmt check → lint → test → build.

**Rationale**: Mandated by constitution. GitHub Actions is the native CI for GitHub repos. `denoland/setup-deno@v2` action provides caching.

**Alternatives considered**:
- Deno Deploy CI — Rejected: doesn't support custom lint/test steps or branch protection gating.

**Workflow pattern**:
```yaml
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v2
        with: { cache: true }
      - run: deno fmt --check
      - run: deno lint
      - run: deno task test
      - run: deno task build
```

Branch protection rules on `main` require the CI job to pass before merge.

### 5. CD Pipeline — GitHub Actions + GitHub Pages

**Decision**: Separate GitHub Actions workflow (`cd.yml`) triggered only on `push` to `main`. Builds the site and deploys to GitHub Pages using the official `actions/deploy-pages@v4` action.

**Rationale**: Mandated by constitution. The official Lume documentation recommends this exact pattern. Uses the Pages artifact upload/deploy flow (no `gh-pages` branch needed).

**Alternatives considered**:
- `gh-pages` branch deployment — Rejected: legacy pattern; modern Pages uses artifact-based deployment.
- Combined CI+CD in one workflow — Rejected: CI should run on all branches/PRs; CD only on `main` merge. Separation is cleaner.

**Workflow pattern** (from Lume docs):
```yaml
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v2
        with: { cache: true }
      - run: deno task build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: "_site" }
      - uses: actions/deploy-pages@v4
```

### 6. Testing Strategy

**Decision**: `deno test` with build-output validation tests.

**Rationale**: For a Hello World page, there's no game logic yet. Tests validate that:
1. The Lume build succeeds and produces `_site/index.html`.
2. The output HTML contains the "Hello, World!" text.
3. The output HTML is valid (well-formed).
4. The CSS file exists and is non-empty.

**Alternatives considered**:
- Browser-based tests (Puppeteer) — Rejected: overkill for static content validation; adds heavy dependency.
- Lighthouse in CI — Included as a separate CI step (not a Deno test), per constitution's performance gate.

### 7. Linting

**Decision**: `deno lint` for TypeScript files. Deno's built-in linter covers the config and test files.

**Rationale**: Constitution requires linting in CI. Deno's built-in linter is zero-dependency and fast.

**Alternatives considered**:
- ESLint — Rejected: requires Node.js; Deno has its own linter.

### 8. Formatting

**Decision**: `deno fmt --check` in CI to verify code formatting; `deno fmt` locally to auto-format. Runs as the first CI step (before lint) so contributors get fast feedback on style issues.

**Rationale**: Consistent formatting eliminates style debates in code review and keeps diffs clean. Deno's built-in formatter is zero-dependency, opinionated, and fast. Running the check before lint ensures formatting issues are caught first (they're the cheapest to fix).

**Alternatives considered**:
- Prettier — Rejected: requires Node.js; Deno has its own formatter.
- No formatter — Rejected: inconsistent style leads to noisy diffs and review friction.

### 9. Concurrent Deployment Handling

**Decision**: GitHub Actions naturally serialises deployments to the same environment. The `cd.yml` workflow uses the `github-pages` environment with `concurrency: { group: "pages", cancel-in-progress: false }` to queue rather than race deployments.

**Rationale**: Addresses the edge case of two rapid merges to `main`. GitHub's concurrency control ensures deployments are sequential and the latest merge always wins.
