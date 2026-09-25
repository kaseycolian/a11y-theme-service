# Adding a new theme to the theme-service

Three entry points: the user **provides a palette**, wants a **guided recommendation**, or wants to
**design a whole new theme style/family**. All end the same way: a new AA-validated palette in the
source, regenerated finals, a version bump.

**Consistency vs. flexibility:** default to the existing brand family (retro-neon — a dark base +
off-white text + four neon accents, or the light equivalent with saturated solids and low glow) so
all apps read as one brand. But the user may explicitly ask for a **new aesthetic / new family** (a
distinct style available alongside the neon ones) — support that too. Either way: keep the same
**token contract** (all roles below defined) and pass **WCAG AA 2.2** in every state. When the ask is
a broad new style rather than a single palette, use Option 3 (a fresh discovery draft to review
side-by-side) rather than adding blind.

## Option 1 — User provides a palette
Collect (or infer) the full token set for the mode(s) they want. A theme needs values for:
`bg, panel, elevated, text, muted, border, borderStrong, focus, pink, onPink, green, onGreen,
blue, onBlue, purple, onPurple` (see any entry in `tools/palettes/draft-2.mjs`). If they give only a
few colors, derive the rest in-family (deep base + light text for dark; light paper + deep saturated
accents + white `on*` for light).

Optional `headings` picks which accent each heading level uses, e.g. `{ h1: 'green', h3: 'green' }`;
levels left out keep the neon order (h1 `pink`, h2 `green`, h3 `blue`, h4 `purple`). Pink is also the
error color and blue the link color, so when the user wants different heading colors, set `headings`
rather than moving their accents between slots (see NEO in `draft-4.mjs`, all-green h1–h3, or Rebecca
in `draft-5.mjs`, purple h1, h3 and h4).

Optional `backdrop` swaps the grid for a pattern: `'rain'`, falling code (NEO), or `'flowers'`, small
violets, forget-me-nots and daisies drifting slowly down (Rebecca, in `draft-5.mjs`). The pattern is
painted in `backdropColor` (default: the green accent for rain, the purple for flowers; rain also
still takes `rainColor`), at the palette's `grid` strength. Text sits on it, so the build checks text,
muted, every accent, the focus ring and the strong border over its most opaque point; if that fails,
lower `grid` or darken the failing color. Both patterns move, so a consuming app needs the motion
toggle (WCAG 2.2.2). The tiles are generated into `effects.css` by `tools/rain.mjs` and
`tools/flowers.mjs`; a new pattern follows the same shape.

## Option 2 — Guided recommendation (socratic)
Walk the same process used to design the originals: ask for a vibe/color story (1–2 sentences),
mode(s), and any must-have hues; propose a coherent palette; iterate. Default to the retro-neon
family so apps read as one brand — unless the user explicitly wants a new aesthetic (then confirm the
direction, still keeping the token contract + AA).

## Option 3 — Design a whole new theme style / family
For a distinct new look (not just another palette): build the candidates as a **new discovery draft**
so the user can compare side-by-side before committing. Create `tools/palettes/draft-<n>.mjs` with the
candidate palettes, generate + review, iterate, then finalize the picks. This is the original
discovery→finalize flow; it supports either brand-consistent variants or a deliberately new aesthetic.

## Then, for any option
1. **Add the palette object(s)** to the palette source — in the SOURCE repo the config points at (not
   the app repo):
   - **Fork user / adding to your own set:** put it in `tools/palettes/local.mjs` (the origin never
     touches it, so it survives updates). This is the default for anyone who isn't the origin owner.
   - **Origin owner / new candidate round (Option 3):** add to the built-in draft `build-final.mjs`
     sources (the highest-numbered `draft-N.mjs`), or create a new `tools/palettes/draft-<n>.mjs` to explore.
   Use the key shape `<mode>-NN-<family>` with a clear `label`/`group`. Optional per-theme background
   strength via a `grid` field (0 = off, 0.22 = subdued default, ~0.40 = pronounced). Add a
   `-no-background` suffix to a key for a grid-off variant.
2. **Validate AA** — `npm run build-themes` (or `node tools/build-palettes.mjs <n>` for a draft)
   validates every pair — **built-in and local** — and **refuses to write** on any failure. Watch the
   ceilings: deep purple/green as **small text** on dark, and any accent as small text on light, are
   contrast-bound; adjust luminance until ≥4.5 (use `tools/contrast-checker/` for the deepest passing
   value).
3. **Build.** `npm run build-themes` regenerates `themes/` (merging built-ins + `local.mjs`; use
   `npm run build-themes:mine` to build only local themes). For a new-family exploration, review first
   with `node tools/build-palettes.mjs <n> --write` → `discovery/draft-<n>/index.html`.
4. **Verify** in `discovery/draft-<n>/index.html` (the new theme renders correctly in every component),
   then walk `wcag-checklist.md`. **Never delete existing themes** to make room — only add.
   Both that page and the draft page render the same gallery (`gallery/`), so either one exercises
   every component; use the draft page when you want all palettes side by side.
5. **Commit** in the source repo (git-local persists; push optional). **Origin owner cutting a
   release:** `npm run release <patch|minor|major> -- --note "…"` bumps `VERSION`, updates `CHANGELOG`,
   commits, and tags `vX.Y.Z`.
6. Downstream apps pick up new themes via the **update flow** (`updating-themes.md`); a data-driven
   selector shows them automatically. Forks pick up origin changes via `updating-from-origin.md`.
7. **Publishing (origin repo).** The Pages workflow (`.github/workflows/pages.yml`) auto-detects the
   **highest-numbered `discovery/draft-N`** and builds themes from it, so finalizing a new draft as the
   highest `draft-N` publishes it on the next push to `main` — no extra step. Convention: highest
   `draft-N` = the latest finalized set. (What that workflow *renders* is the A11Y Way brand site, which
   is `a11y-way-pages/`'s concern, not this skill's.)

## Changing the default/flagship theme
Set `DEFAULT_FAMILY` in `tools/build-final.mjs` to the family you want on `:root`, re-run
`npm run build-themes`, and (origin owner) `npm run release` with a note — apps relying on the auto
default will change appearance, so call it out.
