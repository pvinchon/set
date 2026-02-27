# Quickstart: Hello World Website with CI/CD

**Branch**: `001-hello-world-website` | **Date**: 2026-02-11

## Prerequisites

- [Deno](https://deno.com/) (latest stable) installed locally.
- A GitHub account with access to the repository.

## Local Development

### 1. Clone and checkout the feature branch

```bash
git clone <repo-url>
cd <repo-name>
git checkout 001-hello-world-website
```

### 2. Install Lume (first time only)

Lume is bootstrapped via `deno.json` tasks — no global install needed. Dependencies are fetched automatically on first run.

### 3. Start the development server

```bash
deno task serve
```

Opens a local server (default `http://localhost:3000`) with live reload. Edit `src/index.vto` or `src/style.css` and see changes instantly.

### 4. Build for production

```bash
deno task build
```

Outputs optimised static files to `_site/`.

### 5. Check formatting

```bash
deno fmt --check
```

To auto-format files in place:

```bash
deno fmt
```

### 6. Run linting

```bash
deno lint
```

### 7. Run tests

```bash
deno task test
```

Validates build output: checks that `_site/index.html` exists, contains "Hello, World!", is well-formed HTML, and that the CSS file is present.

## CI/CD

### CI (every push & PR)

Defined in `.github/workflows/ci.yml`. Steps:

1. Checkout → Setup Deno (cached) → `deno fmt --check` → `deno lint` → `deno task test` → `deno task build`
2. Must pass for PRs to be mergeable (branch protection required status check).

### CD (merge to `main`)

Defined in `.github/workflows/cd.yml`. Steps:

1. Checkout → Setup Deno (cached) → `deno task build` → Upload artifact → Deploy to GitHub Pages
2. Site is live at the GitHub Pages URL within minutes.

### Branch Protection Setup

In the GitHub repo: **Settings → Branches → Branch protection rules** for `main`:

- Require status checks to pass before merging: enable the CI workflow job.
- Require branches to be up to date before merging.

## Project Structure

```
.
├── _config.ts                  # Lume configuration
├── deno.json                   # Deno tasks, imports, compiler options
├── src/
│   ├── index.vto               # Hello World page template
│   ├── _includes/
│   │   └── layout.vto          # Base HTML layout
│   └── style.css               # Tailwind CSS entry point
├── tests/
│   └── build_test.ts           # Build output validation tests
├── .github/workflows/
│   ├── ci.yml                  # CI pipeline
│   └── cd.yml                  # CD pipeline
└── _site/                      # Build output (git-ignored)
```

## Common Tasks

| Task                        | Command                  |
| --------------------------- | ------------------------ |
| Dev server with live reload | `deno task serve`        |
| Production build            | `deno task build`        |
| Check formatting            | `deno fmt --check`       |
| Auto-format                 | `deno fmt`               |
| Lint TypeScript             | `deno lint`              |
| Run tests                   | `deno task test`         |
| Upgrade Lume                | `deno task lume upgrade` |
