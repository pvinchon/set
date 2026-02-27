# Data Model: Hello World Website with CI/CD

**Branch**: `001-hello-world-website` | **Date**: 2026-02-11

## Overview

This feature has no persistent data store. The "data model" consists entirely of static build-time assets and CI/CD configuration objects. Documented here for completeness and to inform task decomposition.

## Entities

### Page

The single HTML page output by the Lume build.

| Attribute       | Type   | Description                                   |
| --------------- | ------ | --------------------------------------------- |
| `greetingText`  | string | Primary visible content: "Hello, World!"      |
| `stylesheetRef` | string | Path to the generated CSS file (`/style.css`) |

**Lifecycle**: Generated at build time by Lume from `src/index.vto` + `src/_includes/layout.vto`. No runtime state transitions.

**Validation rules**:

- `greetingText` MUST contain "Hello, World!" (exact text).
- Output HTML MUST be well-formed.
- Output CSS MUST be present and non-empty after Tailwind purge.

### CI Pipeline Configuration

Defined in `.github/workflows/ci.yml`.

| Attribute        | Type     | Description                                              |
| ---------------- | -------- | -------------------------------------------------------- |
| `triggers`       | string[] | `push`, `pull_request`                                   |
| `steps`          | string[] | `checkout`, `setup-deno`, `fmt`, `lint`, `test`, `build` |
| `requiredStatus` | boolean  | Must pass for PR merge                                   |

### CD Pipeline Configuration

Defined in `.github/workflows/cd.yml`.

| Attribute     | Type     | Description                                                                             |
| ------------- | -------- | --------------------------------------------------------------------------------------- |
| `triggers`    | string[] | `push` to `main` only                                                                   |
| `steps`       | string[] | `checkout`, `setup-deno`, `build`, `configure-pages`, `upload-artifact`, `deploy-pages` |
| `environment` | string   | `github-pages`                                                                          |
| `concurrency` | string   | `pages` group, no cancel-in-progress                                                    |

## Relationships

```
Page ──[built by]──> Lume (_config.ts)
CI Pipeline ──[validates]──> Page (fmt, lint, test, build)
CD Pipeline ──[deploys]──> Page (build, upload, deploy)
CD Pipeline ──[depends on]──> CI Pipeline (must pass before merge triggers CD)
```

## State Transitions

None. This is a stateless static site. Each build produces a fresh, immutable snapshot deployed to GitHub Pages.
