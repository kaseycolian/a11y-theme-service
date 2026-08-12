---
name: theme-service
description: Create WCAG 2.2 AA compliant themes and install them into any repo, new or legacy. Use when the user wants accessible dark/light theming for a project (new or existing), give an app a theme selector with all the brand themes, wire up theme.css, re-sync a repo to the latest theme-service version, or create a new theme through a guided color process (a theme that fails contrast is never written). Triggers on "apply the theme service", "add the themes", "add a theme selector", "theme this app", "update themes to latest", "add a new theme", "make an accessible theme", "WCAG compliant theme".
---

# Theme Service — create WCAG 2.2 AA themes and install them into any repo

This skill installs a WCAG 2.2 AA theme system into any project, new or legacy, and keeps it in sync.
It also creates themes: a guided process for choosing colors where the build checks every color pair
and **refuses to write a theme that fails**.

The **source of truth** is the `theme-service` repo's `themes/` folder: `theme.css` (color tokens for
every theme), `effects.css` (glow/grid/scrollbar recipes), `components.css` (opt-in component classes),
`dropdown.css` + `dropdown.js` (the optional accessible dropdown/listbox), plus `tokens.json` and
`themes.index.json`. All themes are pre-validated to pass WCAG 2.2 AA in every state.

## Step 0 — Locate the theme-service source (do this first)

Find the source repo, in this order:
1. Read the machine-local config `~/.claude/theme-service.local.json` → `{ "repo": "<abs path>" }`.
2. If missing, this skill lives at `~/.claude/skills/theme-service/` (symlink/junction into the repo's
   `skill/`); its real parent directory is the repo. Resolve it, or check the repo's `AGENTS.md`.
3. If you still can't find it, tell the user to run the installer (`install/install.ps1` on Windows,
   `install/install.sh` on macOS/Linux) from their clone, or ask for the repo path.

Confirm the source has `themes/theme.css`, `themes/effects.css`, `themes/components.css`,
`themes/themes.index.json`, and a top-level `VERSION`. Everything you copy comes from `themes/`.

## Step 1 — Identify the task

| User intent | Go to |
|-------------|-------|
| Add theming to a **new** project, or a project with **no** theme system yet | `references/applying-themes.md` → "New / greenfield" |
| Add theming + a **theme selector** to an **existing** app (keep its components, make them render every theme) | `references/applying-themes.md` → "Existing project" |
| **Update** a *consuming app* that already uses these themes to the latest version | `references/updating-themes.md` |
| **Add a new theme** to the theme-service itself (from a palette, or guided) | `references/adding-a-theme.md` |
| **Update the theme-service repo itself** (a fork/clone) from its origin — new built-in themes + skill/tool changes, keeping the user's own themes | `references/updating-from-origin.md` |

## Step 2 — Detect the target stack (before applying)

Look for: `angular.json` → **Angular**; `package.json` with `react`/`react-dom` → **React**; otherwise
plain `index.html` + CSS → **Vanilla**. This decides where files go and how the selector is wired.
Each reference has a section per stack. When unsure, ask the user.

## Step 3 — Apply, then verify

Follow the relevant reference exactly. Always finish with the **verification** it lists, and check the
result against `references/wcag-checklist.md` (focus / hover / active / disabled / expanded states,
motion-off, and contrast). Run the standalone checker in `tools/contrast-checker/` if you introduce or
recolor any pairs.

## Core rules (apply everywhere)

- **Vendor, don't hardlink.** Copy the theme CSS **into** the target repo (e.g. `src/theme/` or
  `assets/theme/`) so it survives being cloned on another machine. Never reference an absolute path to
  the theme-service repo from app code.
- **Confirm before you change (existing apps).** Before applying, ask the user the Step 0 questions in
  `references/applying-themes.md`: **component styling depth** (colors-only vs full restyle to match
  the gallery), **fonts** (replace vs keep), **background effect placement** (`.fx-grid` on the page
  background only, the header/footer only, or the whole page), any **existing theme selector** (replace
  vs wire-in; keep vs delete old themes), and **selector placement**. Don't restyle components or
  replace fonts without an explicit opt-in. In a non-interactive run, use the recommended defaults and
  record the assumption.
- **Keep the tracking log.** Every themed repo has a `<theme-dir>/THEME-SERVICE.md` recording the
  version, the decisions on record, and a dated **History** of every apply/update. **Check for it first**
  — if it exists, the repo is already themed: read it and use the **update** flow, don't re-apply from
  scratch. Always write it (first apply) or append a History entry (later work).
- **Default theme = Rink Classic**, dark by default, light under `prefers-color-scheme: light`. Any
  theme is forced with `data-theme="<id>"` on the root element; `data-motion="off"` disables animation.
- **Keep it lightweight & build-step-free.** Plain CSS custom properties; no new dependencies.
- **Preserve the app's existing markup/structure.** For existing apps you map their colors onto the
  tokens — you don't rewrite their components.
- **Never invent colors.** Only use the tokens/themes from the source. If a needed role has no token,
  flag it (it may warrant `references/adding-a-theme.md`) rather than hardcoding.
- **Adding/creating themes happens in the SOURCE repo** the config points at — not the app repo. A
  fork's own themes go in `tools/palettes/local.mjs`; built-ins live in `tools/palettes/draft-*.mjs`.
  Run `npm run build-themes` (merges built-ins + local; `build-themes:mine` = only local) and **commit
  in the source repo** to persist (git-local is enough; GitHub optional). The generated `themes/` files
  are build output (gitignored), never hand-edited.
- **Never auto-delete or overwrite a user's themes.** Their themes are in `local.mjs`, which the origin
  never touches; rebuilding only regenerates. Remove a theme only on the user's **explicit** request.
  When syncing a fork from its origin, follow `references/updating-from-origin.md` and **ask whether to
  include the origin's built-in themes** before rebuilding.
