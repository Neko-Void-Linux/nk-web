# Neko-Void Portal Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and run a concrete Neko-Void portal demo that makes the project proposition, edition selection, installation path, trust signals, and downloads clearer without losing the existing console aesthetic.

**Architecture:** Keep the static Vite page and progressive no-JavaScript fallback. Add a single release manifest consumed by the download service and generated/static markup, update the UI manager to synchronize section state with the URL, and extend the existing CSS with focused hero, trust, quick-start, edition, status, and footer styles.

**Tech Stack:** HTML5, CSS, vanilla ES modules, Vite, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-22-neko-void-portal-design.md`

## Global Constraints

- Preserve the brutalist console visual language and existing desktop/mobile breakpoints.
- Keep no-JavaScript mode readable and navigable; static download hrefs must remain valid.
- Do not push or publish changes.
- Keep external ISO hosting unchanged.
- Do not add a runtime framework or dependency.
- Release metadata must be validated as 64-character hexadecimal SHA256 when present.

### Task 1: Add manifest validation and release metadata

**Files:**

- Create: `public/data/releases.json`
- Create: `tests/site-content.test.mjs`
- Modify: `package.json`

**Interfaces:**

- `releases.json` provides `editions`, each with `id`, `name`, `kind`, `status`, `recommended`, `description`, `version`, `architecture`, `installer`, `sha256`, and `url`.
- Tests read the repository files directly and validate the acceptance criteria without a browser dependency.

- [ ] Write tests for a recommended edition, valid SHA256 metadata, the new hero copy, the quick-start headings, footer links, and SEO metadata.
- [ ] Run `node --test tests/site-content.test.mjs` and confirm the new assertions fail because the content does not exist yet.
- [ ] Add the manifest with the current public editions and metadata used by the demo.
- [ ] Add a `test` script using `node --test`.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Implement the portal content and metadata

**Files:**

- Modify: `index.html`
- Modify: `css/components/hero.css`
- Modify: `css/components/cards.css`
- Modify: `css/styles.css`
- Modify: `css/base/no-js.css`

**Interfaces:**

- The HTML keeps existing section IDs and language spans so the current UI manager and no-JS rules remain compatible.
- Edition cards include stable IDs that `DownloadService` can hydrate from the manifest.

- [ ] Extend the document head with description, canonical, Open Graph, and theme metadata.
- [ ] Replace the ambiguous hero links with a proposition, recommended download CTA, edition CTA, trust strip, and quick-start content.
- [ ] Add edition descriptions, release facts, and verification labels while keeping the existing cards accessible without JavaScript.
- [ ] Add an installer-status block, support/documentation links, and a populated footer with license placeholder wording.
- [ ] Add no-JavaScript styles for the new blocks and verify stacked mobile layout.
- [ ] Run the focused tests and inspect the static HTML for required sections.

### Task 3: Connect manifest-driven downloads and reliable navigation

**Files:**

- Modify: `js/services/DownloadService.js`
- Modify: `js/ui/UIManager.js`
- Modify: `public/dd/index.html`
- Modify: `public/dd/downloads.xml`
- Modify: `public/dd/flavors.xml`

**Interfaces:**

- `loadDownloadLinks()` reads the manifest and hydrates `data-edition-id` elements while preserving static hrefs.
- `UIManager.initNavTabs()` uses `history.pushState`/`popstate` and the existing `data-target` values.

- [ ] Add failing tests for manifest-to-card lookup, deep-link section restoration, and a visible download fallback message.
- [ ] Run the tests and confirm the failures identify missing behavior.
- [ ] Update the download service to use manifest metadata and preserve copy-to-clipboard behavior.
- [ ] Update navigation to synchronize active section and `location.hash` without breaking no-JS anchors.
- [ ] Make the download route render a manual fallback link and useful error text before attempting a redirect.
- [ ] Run tests and verify all current edition IDs still resolve.

### Task 4: Build and run the demo

**Files:**

- Modify: `README.md`

- [ ] Install the existing locked dependencies without adding a framework.
- [ ] Run the full test suite.
- [ ] Run `npm run build` and verify the production build exits successfully.
- [ ] Start the Vite preview server on a local port.
- [ ] Inspect desktop and mobile states in the browser: hero, downloads, quick start, language switcher, hash navigation, and fallback route.
- [ ] Report the local URL and changed files; do not push or publish.
