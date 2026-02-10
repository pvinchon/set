# Set Constitution

## Core Principles

### I. Lightweight & Fast

Every asset, dependency, and line of code MUST justify its weight.

- Total initial payload MUST remain under 100 KB (compressed).
- Zero external runtime dependencies: no frameworks, no CDN calls,
  no third-party analytics at load time.
- First Contentful Paint MUST occur within 1 second on a median
  mobile connection (3G Fast profile).
- Deno is the build tool. Lume is the static site generator. Its 
  output MUST be optimised (minified, compressed).

**Rationale**: A game that loads instantly feels native and keeps
players engaged. Heavy pages lose users before the first card is
dealt.

### II. Offline-First

The game MUST be fully playable without a network connection after
the first visit.

- A Service Worker MUST cache all critical assets on install.
- The app MUST register as a Progressive Web App (PWA) with a
  valid manifest so it can be added to a home screen.
- No gameplay feature may depend on a live server round-trip.
- Cache versioning MUST invalidate stale assets on deploy.

**Rationale**: A card game should work on a plane, in the subway,
or on spotty café Wi-Fi. Offline capability removes friction and
makes Set a reliable time-filler.

### III. Simplicity

When in doubt, leave it out.

- The UI MUST present only the elements needed for the current
  game state — no chrome, no settings panels, no menus unless
  absolutely required.
- Every new feature MUST be justified against the question: "Does
  this make playing a round of Set better?"
- YAGNI applies universally: do not build for hypothetical future
  needs.
- Code SHOULD read clearly without extensive comments; prefer
  descriptive names and small functions.

**Rationale**: Set's elegance comes from its rules. The digital
version should mirror that minimalism — nothing competes with the
cards for the player's attention.

## Technical Constraints

- **Runtime**: Deno (latest stable). All tooling, scripts, and
  development tasks run under Deno.
- **Language**: TypeScript for all game logic and build
  configuration. HTML and CSS for markup and styling.
- **Styling**: Tailwind CSS for utility-first styling. Only used
  classes MUST ship (purge unused styles at build time).
- **Build**: Lume (Deno-native static site generator). Lume
  handles templating, asset pipeline, and static output.
- **Platform**: Modern evergreen browsers (last 2 versions of
  Chrome, Firefox, Safari, Edge). No IE support.
- **Rendering**: DOM-based.
- **Testing**: `deno test` for automated tests covering game logic
  (valid Set detection, deck generation, scoring).
- **Repository**: GitHub. All source code, issues, and project
  management live on GitHub.
- **Continuous Integration**: GitHub Actions MUST run on every
  push and pull request. The pipeline MUST lint, test, and build
  the site. A failing pipeline MUST block merge.
- **Continuous Deployment**: GitHub Actions MUST deploy the Lume
  build output to GitHub Pages on every merge to `main`. No
  manual deploy steps.
- **Hosting**: GitHub Pages. The site MUST be fully functional as
  static files served from GitHub Pages.
- **Accessibility**: MUST meet WCAG 2.1 AA for colour contrast and
  keyboard navigation at minimum.

## Development Workflow

- **Commits**: Small, atomic commits. Each commit SHOULD leave the
  game in a working state.
- **Branching**: Feature branches off `main`. Merge via GitHub
  pull request after self-review or peer review.
- **Continuous Integration gate**: Every PR MUST pass the GitHub
  Actions pipeline (lint, test, build) before merge. No
  exceptions.
- **Continuous Deployment flow**: Merging to `main` triggers
  automatic deployment to GitHub Pages via GitHub Actions.
- **Performance gate**: The Continuous Integration pipeline SHOULD
  include a Lighthouse audit. Performance score MUST be ≥ 95.
- **Local dev**: Use `deno task` for all local commands (serve,
  build, test, lint). No global tool installs beyond Deno.

## Governance

This constitution is the highest authority for project decisions.
All contributions MUST comply with the principles above.

- **Amendments**: Any change to this constitution MUST be proposed
  in a dedicated PR, reviewed, and merged into `main`.
- **Versioning**: The constitution follows semantic versioning
  (MAJOR.MINOR.PATCH). Principle removals or redefinitions are
  MAJOR; new principles or material expansions are MINOR;
  clarifications and typo fixes are PATCH.
- **Compliance**: Every PR review SHOULD include a constitution
  compliance check. Violations MUST be resolved or explicitly
  justified before merge.

**Version**: 1.0.0 | **Ratified**: 2026-02-10 | **Last Amended**: 2026-02-10
