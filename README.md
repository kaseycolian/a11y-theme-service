# Theme Service

Create **WCAG 2.2 compliant** themes, then install them into a new or existing app. Use the themes
that ship here, or use the skill (`AGENTS.md` for other agents) to create your own — a guided process
for choosing colors that checks contrast as it goes. **A theme that fails WCAG 2.2 AA is never
written.** Accessibility is handled at the palette stage, before any app consumes the theme.

Lightweight and framework-agnostic: the source of truth is plain **CSS custom properties** (with a
JSON mirror), so it drops into vanilla JS/CSS, Angular, or React with **no build step** for the app
consuming it. Default theme is **Rink Classic** (dark, auto-light by OS).
The discovery pages (`discovery/draft-N/index.html`) show every theme in real components.

**New here?** Start with the **[Visual Overview](docs/OVERVIEW.md)** — diagrams of what it is, how you
use it, and the clone / save / update workflow (local + optional GitHub).

---

## Two ways to use it

You can use everything **as-is** without touching the theme-creation process — or opt into the full
guided workflow to add and change themes. Both paths are contrast-checked the same way. Pick your
path:

### Path 1 — Use the themes as-is

Install once, then apply the existing themes to any repo on your machine. No palette/creation work.

1. **Clone** this repo anywhere.
2. **Install** — two modes. Both link the **`theme-service`** skill into `~/.claude/skills` and write
   a machine-local pointer to this repo (nothing is written *inside* the repo):
   ```sh
   npm run install-all         # install the skill AND build the themes (recommended)
   npm run install-no-themes    # install the skill only — don't generate any themes
   # (the platform scripts install/install.ps1 · install/install.sh do the same)
   ```
   That is the only skill you need. The repo also holds `a11y-way-pages/` — the A11Y Way brand site
   and its own skill — which is maintainer-only and is deliberately **not** installed by any of the
   commands above.
   The theme files (`themes/theme.css`, `tokens.json`, …) are **build output**, not committed —
   `install-all` produces them; run `npm run build-themes` any time to (re)generate. Re-run install
   to refresh the link.
3. **Apply to any repo.** Open that repo in Claude Code (or another agent) and say:
   > Use the theme-service skill to add multi-theme support + a theme selector to this app, mapping
   > the existing components onto the theme tokens; build it and confirm every theme renders and
   > passes WCAG 2.2 AA.

   The agent vendors the theme CSS, wires a theme picker (all themes), and maps the app's existing
   components onto the tokens — existing markup untouched. Full prompts & per-case variants:
   **[USAGE.md](USAGE.md)**.

Later, to pull in updates after you (or an upstream) change the themes:
> Update this repo to the latest theme-service version.

**Using a non-Claude agent?** You can skip the skill install entirely — point your agent at
[`AGENTS.md`](AGENTS.md) in this repo. It mirrors the skill's instructions and the detailed how-tos in
`skill/references/`, so any agent can apply/update/create themes by following it.

### Path 2 — Create or edit themes

Add new themes or restyle existing ones using the same guided process this repo was built with —
provide your own palette, have the agent recommend one, or design an entirely new aesthetic. It stays
AA-validated and consistent, so new themes are reusable across all your apps.

Full walkthrough & prompts: **[CREATING-THEMES.md](CREATING-THEMES.md)**. In short, tell your agent:
> Use the theme-service skill to add a new theme — &lt;paste a palette&gt; / guide me to one / design a new
> theme family called "&lt;name&gt;". Validate AA, regenerate, and bump the version.

You don't have to choose Path 2 to use the service — Path 1 is complete on its own.

> **Not a theme user?** `a11y-way-pages/` is the A11Y Way brand site and the skill that stands up its
> header, footer and favicon. Separate audience, separate docs — see
> [`a11y-way-pages/README.md`](a11y-way-pages/README.md). Nothing in the theme service depends on it,
> and none of the install commands above touch it.

---

## Own your copy: your themes + my updates

This repo is the **origin**. Fork or clone it and it becomes **your** source of truth.

- **Your themes live in `tools/palettes/local.mjs`** (shipped empty). Add themes there, run
  `npm run build-themes`, and **commit** — they persist. **Git-local is enough; GitHub is optional**
  (add your own remote only to back up / sync across machines / share). The origin never edits
  `local.mjs`, so your themes are never touched by updates.
- **Pull my updates without losing your themes.** The generated `themes/` aren't committed and your
  `local.mjs` is origin-untouched, so syncing is conflict-free:
  ```sh
  # one-time: point at this origin
  npm run update-from-origin -- --set-upstream https://github.com/kaseycolian/theme-service.git
  npm run update-from-origin        # fetch + merge my latest  (or  -- --tag vX.Y.Z)
  npm run build-themes              # rebuild incl. my built-in themes
  npm run build-themes:mine         # …or rebuild with ONLY your themes
  ```
  An agent-driven update **asks** whether to include my built-in themes. **Nothing is ever
  auto-deleted** — themes are removed only when you ask. Your machine's install/update log lives in
  `~/.claude/theme-service.local.json` (never committed) for you and agents to review.
- **"Which repo is my source"** is a machine-local pointer (`~/.claude/theme-service.local.json`,
  gitignored, never in commit history). Change it by re-running the installer from the clone you want,
  or `node install/install.mjs --source <path>`.

---

## What's in the box

```
themes/            The distributable themes. effects.css, components.css, dropdown.css, dropdown.js,
                   README.md are
                   committed; theme.css / tokens.json / themes.index.json / theme-init.js /
                   theme-select.js are BUILD OUTPUT (gitignored) — run `npm run build-themes`.
tools/             build-final.mjs (build themes/), build-palettes.mjs (discovery drafts),
                   release.mjs (version + tag), update-from-origin.mjs (pull origin updates),
                   palettes/ (draft-*.mjs = built-in source; local.mjs = YOUR themes),
                   contrast-checker/ (standalone WCAG library + CLI)
gallery/           The component gallery, ONE copy: gallery.js (markup) + gallery.css (layout).
                   Rendered by the discovery pages (and by the brand site), so a card added once
                   shows up everywhere. See gallery/README.md
skill/             The theme-service skill (SKILL.md + references/) — how agents apply/update/add themes
a11y-way-pages/    MAINTAINER ONLY — the A11Y Way brand site: its skill, the header/footer/favicon
                   furniture, the two published pages and the site build. Consumes theme tokens
                   read-only, never edits themes. Nothing outside it depends on it
AGENTS.md          Agent-agnostic mirror of the theme-service skill (for non-Claude agents)
discovery/         Palette-selection playground (draft-1/2/3) — reference for how themes were chosen
install/           install.mjs (cross-platform) / install.ps1 / install.sh — link the skill(s) + write
                   the machine-local pointer, via the shared write-config.mjs
package.json       scripts: install-all, install-no-themes, build-themes, build-themes:mine,
                   update-from-origin, release, validate (no dependencies)
USAGE.md           How to ask an agent to APPLY the themes to a repo
CREATING-THEMES.md How to CREATE or EDIT themes (Path 2)
ARCHITECTURE.md    How it all fits: the layers, token contract, theming mechanism, framework wiring
TODO.md            Deferred work with the context to pick it up cold — read this before starting
                   anything new here
CHANGELOG.md  VERSION   (VERSION is the single source of truth; `npm run release` bumps + tags it)
```

## The themes

Five families, each in dark + light, several with a grid-off "(No Background)" variant:
`rink-classic`, `midnight-arcade`, `hot-neon`, `synthwave-sunset`, `acid-arcade`. Default is
**Rink Classic**. Theme ids are `<family>-<mode>` (e.g. `synthwave-sunset-dark`) and
`<family>-<mode>-no-background` for the grid-off variants.

**Consume them** (vanilla): include the CSS and set `data-theme` on `<html>` (or nothing for the
auto default). Full integration notes — including Angular/React and the CSP-safe selector helpers —
are in [`themes/README.md`](themes/README.md).

## Explore the themes

- **`discovery/draft-N/index.html`** — every candidate palette shown in real components, with a
  live switcher (open in a browser).
- **`discovery/index.html`** — the draft playground: every candidate palette rendered with the full
  component gallery, side by side, with computed AA ratios. Reference for the creation process.

Both render the **same** gallery, from `gallery/` — one copy of the markup, one copy of its layout. A
component added there appears on both pages; neither can drift from the other.

## Build / validate / release (tooling)

```sh
npm run build-themes           # build themes/ (built-in + your local.mjs themes)
npm run build-themes:mine      # build themes/ with ONLY your local themes (exclude built-ins)
npm run validate               # AA-check the built-in palette source (no write)
npm run release minor -- --note "what changed"   # bump VERSION + CHANGELOG + git tag vX.Y.Z
```

`release` commits only `VERSION` + `CHANGELOG.md`, so it **refuses on a dirty tree** — otherwise the tag
would point at a commit missing the work it claims to ship. Commit your feature work first (or pass
`--allow-dirty` if you mean it). `--note` is required: it is the entry apps read to decide whether an
upgrade affects them. It prints the bump rule and `X.Y.Z -> X.Y.Z` and asks to confirm before writing;
pass `--yes` to skip that.

The generators **refuse to write if any pair fails WCAG 2.2 AA** (your own `local.mjs` themes are validated
too). The standalone checker is in [`tools/contrast-checker/`](tools/contrast-checker/) (library + CLI,
usable in any project).

## The A11Y Way brand site (maintainers only)

The published GitHub Pages site, the header/footer/favicon furniture, and the skill that installs them
on other repos all live in **[`a11y-way-pages/`](a11y-way-pages/)**. None of it is needed to install or
use the theme service, and nothing in the theme service depends on it.

Its README covers the local dev loop (`npm run dev:overview-site`) and how to work on the furniture.

**Versioning:** `VERSION` is the single source of truth (`build-final.mjs` reads it). `npm run release`
bumps it, prepends a `CHANGELOG.md` entry, commits, and creates the git tag `vX.Y.Z` (push with
`git push --follow-tags`). Additive theme/token changes → minor; token renames/removals or a
default-theme change → major. Consuming apps record the version they vendored and use the update flow.
