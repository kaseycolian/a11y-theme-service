# Creating & editing themes (Path 2)

Add new themes or restyle existing ones with the same guided process this repo was built with — a
walkthrough for choosing colors that checks contrast as it goes. **A theme that fails WCAG 2.2 AA is
never written:** the generators refuse to write if any color pair fails, so you cannot end up with a
non-compliant theme. You don't need to know the internals — an agent (Claude Code, via the installed
**theme-service skill**, or any agent following [`AGENTS.md`](AGENTS.md)) drives it.

> Prerequisite: you've cloned the repo (and, for Claude, run the installer — see the README Path 1).
> Theme work happens **inside this repo**, then you commit the result.

There are three ways in. All end the same way: validated palettes → rebuilt `themes/` → commit.
Pick whichever matches what you have.

---

## Where your themes live & how they persist

Creating/editing themes modifies the **theme-service source repo** your machine points to — **not** the
app you're theming (apps only get vendored *copies*).

- **Your themes go in `tools/palettes/local.mjs`** (shipped empty). The origin never touches it, so
  your themes survive every update. Built-in themes live in `tools/palettes/draft-*.mjs` (the origin's).
  `npm run build-themes` **merges** both into `themes/` (or `build-themes:mine` for only yours).
- **Persist by committing** in the source repo after building. **Git-local is enough — no GitHub
  required.** A remote is optional (backup / sync across machines / sharing).
- **Use your own copy as the source:** fork or copy this repo, then run the installer from *your* copy
  (or `node install/install.mjs --source <path>`) so agents save into it. The "which repo is my source"
  pointer is machine-local (`~/.claude/theme-service.local.json`) and **never committed**; change it
  anytime (re-run install / `--source` / edit the file).
- **Get the origin's updates without losing your themes:** `npm run update-from-origin` then
  `npm run build-themes` (see "Own your copy" in the README). You're **asked** whether to include the
  origin's built-in themes; **nothing is ever auto-deleted**.

---

## A. You already have a palette

Best when you know the colors you want (a brand palette, a screenshot you're matching, a variant of an
existing theme). Give the agent the colors; it fills in any missing roles, validates AA, and adds it.

> Use the theme-service skill to add a new theme from this palette: &lt;paste hexes / describe the
> colors&gt;. Base it on &lt;existing theme&gt; if it's a variant. Validate AA, regenerate the finalized
> themes, and bump the version.

A full theme needs values for these roles (the agent derives any you don't provide, in-family):
background / panel / elevated surfaces, primary + muted text, border + strong border, focus ring,
four accents (pink/green/blue/purple) and the text color that sits **on** each accent fill. See any
entry in [`tools/palettes/draft-2.mjs`](tools/palettes/draft-2.mjs) for the exact shape.

## B. Let the agent recommend a palette (guided)

Best when you have a *vibe* but not exact colors. The agent proposes a coherent palette from a short
brief and iterates with you — the same socratic process used for the originals.

> Use the theme-service skill to guide me through creating a new theme. I want a vibe like
> &lt;1–2 sentences: mood, era, must-have hues&gt;. Propose a palette, iterate with me, then validate AA
> and add it.

## C. Design an entirely new theme style / family

Best when you want a distinct new look — a fresh aesthetic, not just another palette. This is the
original discovery process: explore candidates side-by-side, pick winners, finalize. By default new
themes stay in the retro-neon brand family for cross-app consistency, **but you can ask for a new
aesthetic** if you want a separate style available in the picker.

> Use the theme-service skill to design a new theme family called "&lt;name&gt;". &lt;Describe the aesthetic /
> inspiration&gt;. Build the candidates as a new discovery draft so I can compare them, then finalize the
> ones I pick and bump the version.

The agent will: build a new `discovery/draft-N/` you can open in a browser to compare, let you tweak,
then finalize your picks into `themes/`.

---

## What happens under the hood (reference)

The skill follows [`skill/references/adding-a-theme.md`](skill/references/adding-a-theme.md). The
manual workflow, if you want to drive it yourself:

1. **Add the palette.** If you're a **fork user**, put it in `tools/palettes/local.mjs` (the origin
   never touches it). If you **own the origin**, add it to the built-in draft the finalizer sources
   (the highest-numbered `tools/palettes/draft-N.mjs`) — or start a new `draft-N.mjs` for a fresh side-by-side exploration.
   Reuse the token shape from existing entries; set a clear `label`/`group`. Optional per-theme
   background strength via `grid` (0 = off, 0.22 = subdued, ~0.40 = pronounced), and which accent each
   heading level uses via `headings` (default: h1 pink, h2 green, h3 blue, h4 purple), and which one
   the field labels use via `labels` (default: green). The backdrop can
   be falling code (`backdrop: 'rain'`) or drifting flowers (`backdrop: 'flowers'`) instead of the
   grid, in `backdropColor`.
2. **Validate AA.** `npm run validate` (built-ins) or just build — `build-final.mjs` validates every
   pair (built-in **and** local) and refuses to write on any failure. Watch the ceilings (deep
   purple/green as *small* text on dark, and any accent as small text on light, are bounded — use
   `tools/contrast-checker/` to find the deepest passing value).
3. **Review (optional, origin/new families).** `node tools/build-palettes.mjs <N> --write` then open
   `discovery/draft-<N>/index.html` to compare candidates side-by-side.
4. **Build.** `npm run build-themes` regenerates `themes/` (merging built-ins + your `local.mjs`;
   `build-themes:mine` for only yours). The theme list flows into `theme-select.js` automatically. To
   change the flagship default, set `DEFAULT_FAMILY` in `tools/build-final.mjs`.
5. **Commit** (git-local persists; push optional). If you own the origin and are cutting a release,
   `npm run release <patch|minor|major> -- --note "…"` bumps `VERSION`, updates `CHANGELOG.md`, commits,
   and tags `vX.Y.Z`. Commit first for real: it commits only those two files, so it **refuses on a
   dirty tree** rather than tag a commit without your themes in it. New themes are additive → `minor`.

**Publishing (origin repo).** The Pages workflow (`.github/workflows/pages.yml`) auto-detects the
**highest-numbered `discovery/draft-N`** and builds themes from it, so finalizing a new draft as the
highest `draft-N` publishes it on the next push to `main` — no extra step. Convention: highest
`draft-N` = the latest finalized set.

## Rolling changes out to your apps

Once a theme is added or changed here, bring any app up to date with the update flow — no manual
re-theming:

> Update this repo to the latest theme-service version.

Apps with a data-driven selector show new themes automatically. See
[`skill/references/updating-themes.md`](skill/references/updating-themes.md).
