# AGENTS.md — Theme Service (for any AI agent)

This repo creates **WCAG 2.2 AA compliant themes** and installs them into other apps, new or legacy.
Themes are created through a guided process for choosing colors; the build checks every color pair and
**refuses to write a theme that fails**. It's a framework-agnostic system of plain CSS custom
properties, so a consuming app needs no build step.

It's also model-agnostic: Claude Code loads it as a skill (`skill/SKILL.md`), and any other agent
(Copilot, GPT, Gemini, …) can follow **this file**. The detailed, non-agent-specific procedures live in
`skill/references/` and are shared by both.

A **second, separate skill** ships here too: `skill-a11y-way-pages/` stands up the site header, footer
and favicon on a page (see "Page header and footer" below). The two are deliberately independent — the
pages skill consumes theme tokens read-only and never creates or edits a theme, so neither can disturb
the other's work.

## What's here

- `themes/` — the distributable themes (all AA-validated). `effects.css`, `components.css`,
  `preview.html`, `README.md` are committed; `theme.css`, `tokens.json`, `themes.index.json`,
  `theme-init.js`, `theme-select.js` are **build output** (gitignored) — produced by
  `npm run build-themes`. Default = **Rink Classic**, auto dark/light.
- `gallery/` — the component gallery, one copy: `gallery.js` (markup) + `gallery.css` (layout).
  `themes/preview.html` and `discovery/draft-N/index.html` both render it, so a component added there
  appears on both and neither page can drift. Not vendored by an app; see `gallery/README.md`.
- `VERSION` — the theme-service version (single source of truth; `npm run release` bumps + tags it).
- `tools/` — `build-final.mjs` (build `themes/`), `build-palettes.mjs` (discovery drafts),
  `release.mjs` (version + tag), `update-from-origin.mjs` (pull origin updates), `palettes/`
  (`draft-*.mjs` = built-in source; `local.mjs` = a fork's own themes), `contrast-checker/`.
- `discovery/` — palette-selection playground (drafts). Not consumed by apps.
- `skill/` — the theme-service skill; `skill/references/*.md` are the shared how-to docs.
- `skill-a11y-way-pages/` — the page header/footer/favicon skill; `references/*.md` likewise.
- `assets/` — the site's own furniture: `site-header.css`, `site-footer.css`, `brand-mark.svg` +
  `brand-mark-theme.js`, `favicon.svg` + `favicon-theme.js`. **Not** vendored by a consuming app as
  part of theming — it's what the `a11y-way-pages` skill distributes.
- `ARCHITECTURE.md` — how it all fits, the token contract, and framework wiring.

## How to use it in another repo

1. **Locate this repo.** If you're on a machine where it's installed, `~/.claude/theme-service.local.json`
   holds `{ "repo": "<path>" }`. Otherwise ask the user for the clone path.
2. **Pick the task and follow the matching reference** (these are the same docs the Claude skill uses):
   - Add themes to a **new** app → `skill/references/applying-themes.md` (New / greenfield).
   - Add themes + a **theme selector** to an **existing** app, keeping its components and making them
     render every theme → `skill/references/applying-themes.md` (Existing project). It contains the
     color-role → token mapping table, the selector snippets (vanilla/Angular/React), and the
     anti-flash bootstrap.
   - **Update** a consuming app to the latest version → `skill/references/updating-themes.md`.
   - **Add a new theme** to this repo → `skill/references/adding-a-theme.md`.
   - **Update this theme-service fork/clone from its origin** (keep the user's themes) →
     `skill/references/updating-from-origin.md`.
3. **Verify** with `skill/references/wcag-checklist.md` and the checker in `tools/contrast-checker/`.

## Page header and footer (a separate skill)

Putting this site's **furniture** — the sticky header, the footer, the themed favicon — on a page is a
different job with a different skill: `skill-a11y-way-pages/SKILL.md`, mirrored by the same
`references/` docs so any agent can follow them.

1. **Confirm the target is themed** (a `THEME-SERVICE.md` exists). The furniture is built entirely
   from theme tokens; without them it renders as unstyled boxes. If it isn't themed, do the theme work
   above **first**.
2. **Pick the task and follow the matching reference:**
   - New page in a repo that already has the furniture, a repo with none, or a repo with **its own**
     header/footer → `skill-a11y-way-pages/references/applying-header-footer.md`.
   - What the pieces are made of, for rebuilding in another stack →
     `skill-a11y-way-pages/references/header-footer-anatomy.md`.
   - Re-sync a repo to the latest → `skill-a11y-way-pages/references/updating-header-footer.md`.
3. **Ask the brand questions first** — name, mark, which parts, nav segments, cross-links, replace vs
   restyle, class naming. Detect from the repo, propose, confirm. Never rebrand a repo silently.
4. **Verify** with `skill-a11y-way-pages/references/page-a11y-checklist.md`.

**That skill never touches themes.** No palettes, no `build-themes`, no `themes/`. If page work needs
a color role that has no token, stop and flag it — that's this file's job, not that skill's.

## Non-negotiables

- **Confirm before changing (existing apps).** Ask the user the Step 0 questions in
  `skill/references/applying-themes.md`: component **styling depth** (colors-only vs full restyle),
  **fonts** (replace vs keep), **background effect placement** (`.fx-grid` on the page background only,
  the header/footer only, or the whole page), any **existing selector** (replace vs wire-in; keep vs
  delete old themes), and **selector placement**. Don't restyle components or replace fonts without
  opt-in.
- **Keep the tracking log.** Every themed repo has a `THEME-SERVICE.md` (version + decisions + dated
  History). Check for it first — if present, the repo is already themed: read it and follow
  `skill/references/updating-themes.md` instead of re-applying. Always append a History entry.
- **Vendor** the theme CSS into the target repo (copy into `src/theme/` or `assets/theme/`); never
  hardcode an absolute path to this repo in app code.
- **Default** = Rink Classic (dark, auto-light by OS). Force a theme with `data-theme="<id>"` on
  `<html>`; disable animation with `data-motion="off"`.
- **Preserve** the target app's existing markup/structure by default — map its colors onto the tokens.
  Only migrate components to the `components.css` classes if the user opted into a full restyle, and
  then keep every existing behavior/handler/ARIA intact.
- **Adding/creating themes happens in the SOURCE repo** (from the config), not the app repo. A fork's
  own themes go in `tools/palettes/local.mjs`; run `npm run build-themes` (merges built-ins + local) and
  **commit in the source repo** (git-local persists; GitHub optional). Never hand-edit the generated
  `themes/` files.
- **Publishing to the live site (origin repo only).** The GitHub Pages home (`docs/overview.html`)
  links the live template page (`themes/preview.html`) from its "Preview Themes" nav segment; that page
  renders the built `theme.css` and shows every theme in real components.
  Both pages share one header **and one footer**: markup is duplicated (the header differs only in
  which `.pagenav-seg` carries `aria-current`; the footer blocks are byte-identical), styles live
  once in `assets/site-header.css` and `assets/site-footer.css` — edit there, not in either page's
  `<style>`. Those two files are the site's own header/footer; they are NOT part of what a consuming
  app vendors. To stand up the same header/footer on a new page here or in another repo, use the
  **`a11y-way-pages` skill** (`skill-a11y-way-pages/`, mirrored below).
  `.github/workflows/pages.yml` auto-detects the **highest-numbered `discovery/draft-N`** and builds
  themes from it — finalizing a new draft as the highest `draft-N` makes it the live preview on the
  next push to `main`, no extra publish step. Convention: highest `draft-N` = the latest finalized set.
  To work on those two pages locally, run **`npm run dev:overview-site`** (build + serve `_site/` with
  the deployed clean URLs, rebuild on change; `:build` / `:serve` variants exist). The `dev:overview-site*`
  scripts are maintainer-only site tooling — they are NOT part of installing or using the theme service.
- **Never auto-delete or overwrite a user's themes.** Their themes live in `local.mjs` (origin never
  touches it); rebuilding only regenerates. Remove a theme only on explicit request. When updating a
  fork from origin, follow `updating-from-origin.md` and **ask before including built-in themes**.
- **Only use tokens/themes from `themes/`.** Never invent colors. Keep everything AA 2.2 and
  dependency-free. This repo is public — never add secrets or machine-specific paths.
