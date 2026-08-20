# Overview Pass 2 — Polished Diagrams + GitHub Pages Home

**Date:** 2026-07-28
**Status:** Approved (design)
**Predecessor:** `2026-07-28-overview-hero-graphic-design.md` (Pass 1 — hero, shipped)

## Purpose

`docs/overview.html` becomes the **GitHub Pages home page** for the public repo
(`kaseycolian/theme-service`) — the page a human lands on to understand, at a glance, what the
repo does. Pass 2 finishes the polished visual overview (the five remaining diagrams + hero
tidy-ups), wires the page to the live product preview, and ships a GitHub Actions workflow that
builds the themes and deploys the site to Pages.

## Scope changes vs. the original Pass 2

The Pass 1 spec listed Pass 2 as "remaining diagrams + image export." Per the user:

- **DROPPED — image export.** The graphics live on the page itself; this page is the human
  quick-view, so no PNG/SVG export step is needed.
- **ADDED — GitHub Pages deployment** via GitHub Actions.
- **ADDED — home ↔ themes navigation** (a "See Built-In Themes" CTA + a back-to-home header on
  the preview).
- **ADDED — always-latest guarantee** so the deployed preview always shows the most recently
  finalized themes.

## Deliverables

### 1. Five remaining diagrams (core visual work)

Style, directly in `docs/overview.html`, the five flows already documented as mermaid in
`docs/OVERVIEW.md`, reusing the **locked** component system established by the hero
(`.node-card`, `.node-card--accent`, `.connector`, `.connector--dashed`, `.node-label`,
`.node-sub`). Each is 100% theme-token driven (no hardcoded colors) so it re-skins live across all
16 themes via the existing selector.

| # | Section in OVERVIEW.md | Shape |
|---|------------------------|-------|
| 1 | Who uses it, and the two ways in | decision → two paths → two outcomes |
| 2 | Workflow A — Apply the themes to an app | request → agent wiring → confirm → done |
| 3 | Workflow B — Clone / save / update (local + GitHub) | clone → save-local → optional GitHub → update |
| 4 | Workflow C — Create or edit a theme | edit source → build (AA-validate) → output |
| 5 | Workflow D — Releasing (origin owner) | change → release script → tag/push → forks update |

Requirements:
- Reuse existing components; add new shared sub-components only if a flow genuinely needs one
  (e.g. a small branch/decision node), and keep them token-driven and reusable.
- Responsive: multi-column on desktop, stacks vertically on narrow widths, no horizontal overflow.
- Content parity with the corresponding OVERVIEW.md mermaid diagram (same nodes/labels/intent) so
  the two stay in sync.

### 2. Hero polish (deferred Pass 1 cleanups)

- Add `aria-hidden="true"` to the defs-only `<svg>` (~line 92).
- Drop the redundant `<label>` + `aria-label` double-name on the theme `<select>` (~line 79).
- Remove the unused `.hero-flow-svg` CSS rule (~line 62).
- Add the positioned dashed skill→build/apps `.connector--dashed` (currently conveyed only by the
  caption text).
- (Image-export portion of the original deferred item is **dropped**.)

### 3. Home ↔ themes navigation

- **Home** (`docs/overview.html`): a prominent **"See Built-In Themes →"** call-to-action in the
  topbar, beside the theme selector, linking to the product preview at `../themes/preview.html`.
  Styled with theme tokens (reuse the button/accent styles already available).
- **Themes page** (`themes/preview.html`): add a slim **sticky header** — a title and a
  **"← Overview"** back link to `../docs/overview.html` — styled with theme tokens (the page
  already loads `theme.css`). This gives two-way navigation without leaving the neon brand.

`themes/preview.html` is hand-authored and committed, so this header is a permanent source edit.

### 4. GitHub Pages via GitHub Actions

New workflow `.github/workflows/pages.yml`:

- **Triggers:** `push` to `main`, plus `workflow_dispatch` (manual re-deploy).
- **Permissions / concurrency:** the standard Pages setup (`pages: write`, `id-token: write`;
  concurrency group `pages`, cancel-in-progress false).
- **Build job:** checkout → setup Node (LTS) → `npm ci` → **auto-detect the highest-numbered
  `discovery/draft-N`** → build themes from that draft (e.g. `node tools/build-final.mjs <N>
  --write`, i.e. the existing build entry with the detected draft number) → **assemble `_site/`** →
  `actions/upload-pages-artifact` with `path: _site`.
- **Deploy job:** `actions/deploy-pages`.

Building themes in the workflow is mandatory because `themes/theme.css` (and siblings) are gitignored
build output — a fresh checkout does not contain them, and both the home page and the preview render
them.

**`_site/` assembly (mirrors the repo so existing relative paths resolve unchanged):**

```
_site/
  index.html            # redirect → docs/overview.html   (the home entry point)
  docs/overview.html    # ../themes/… resolves to /themes/…  ✓
  themes/               # freshly built assets, incl. preview.html
```

- The home entry is a **root redirect** (`_site/index.html` = a minimal meta-refresh + JS redirect
  to `docs/overview.html`). This keeps `overview.html` in `docs/` with its current `../themes/`
  paths untouched — source == deployed, no path rewriting.
- Copy only what the site needs (`index.html`, `docs/overview.html`, `themes/`) so the artifact is
  clean (no `node_modules`, tools, etc.).
- Path checks that must hold in the deployed layout:
  - `/docs/overview.html` → `../themes/theme.css` = `/themes/theme.css` ✓
  - "See Built-In Themes" → `../themes/preview.html` = `/themes/preview.html` ✓
  - preview back link → `../docs/overview.html` = `/docs/overview.html` ✓

**Always-latest guarantee (auto-detect):** the workflow sources the highest-numbered
`discovery/draft-N`. Because `preview.html` renders the built `theme.css`, the deployed preview
always reflects the newest finalized draft with **no manual step** when a future draft is added.
*Assumption:* highest `draft-N` == latest finalized draft. This holds in the current flow (each
`draft-N` is a finalized snapshot; `draft-1` frozen, higher N supersedes). Documented as a
convention (see §5) so the assumption is explicit and maintained.

The user is responsible for enabling Pages → "Deploy from GitHub Actions" in repo settings (out of
scope for the code).

### 5. Documentation / agent-workflow consistency

The auto-detect convention must be reflected everywhere the theme-creation / finalize workflow is
documented, so future drafts are understood to auto-publish:

- **`docs/OVERVIEW.md`** status block: check off Pass 2; mark image export **dropped (graphics live
  on the page)**; add a **Live demo** link to the Pages URL; note the See-Built-In-Themes / preview
  navigation.
- **Finalize/create-theme docs** (the relevant `skill/references/*.md` — e.g. adding-a-theme.md —
  and/or `CREATING-THEMES.md`, and the agent-agnostic `AGENTS.md`): add a short note that finalizing
  a new draft as the highest-numbered `discovery/draft-N` automatically becomes the live "Built-In
  Themes" preview on the GitHub Pages site (via the Pages workflow's auto-detect), so no extra step
  is needed to publish it. State the "highest N = latest finalized" convention explicitly.

## Non-goals

- Image/PNG/SVG export of the diagrams (explicitly dropped).
- Redesigning `themes/preview.html` beyond adding the back-to-home header.
- Modifying the frozen `discovery/draft-1` (or other existing draft) pages.
- Changing the product's default build draft or `build-final.mjs` selection logic — the auto-detect
  lives in the **Pages workflow**, not the product build.
- Enabling Pages in repo settings (a one-time manual step the user performs).

## Verification

Reuse the Pass 1 method (documented in the Pass 1 plan):

- **Visual / theming:** headless Edge screenshot with `?theme=<id>` deep-link (theme-init.js honors
  it) across a representative set of the 16 themes (dark + light), Read the PNGs to confirm each
  diagram re-skins and reads cleanly.
- **Layout truth (overflow/clipping):** global Playwright driving system Chrome
  (`C:/Program Files/Google/Chrome/Application/chrome.exe`, `NODE_PATH=$(npm root -g)`,
  `waitUntil: domcontentloaded` + `waitForTimeout`); assert `scrollWidth == innerWidth` at mobile,
  tablet, and desktop widths. Do **not** trust eyeballed neon screenshots for overflow.
- **Nav:** confirm both links resolve in the deployed layout (home → preview, preview → home) and in
  the in-repo layout.
- **Workflow:** validate `pages.yml` builds themes and assembles `_site/` locally (dry-run the
  assembly + build steps), and that the auto-detect picks the highest `draft-N`.

## Open assumptions (documented, non-blocking)

- Highest `discovery/draft-N` == latest finalized themes (see §4).
- Node LTS + `npm ci` succeed in CI as they do locally (existing `package.json`).
