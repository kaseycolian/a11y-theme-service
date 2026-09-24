# Architecture

How the theme-service fits together, for developers and agents. This is the durable reference; the
task-oriented how-tos are in `skill/references/`.

## Layers (a value flows down, never up)

```
tools/palettes/draft-<n>.mjs   ← BUILT-IN palette source (origin's; committed)
tools/palettes/local.mjs       ← LOCAL palette source (a fork's own themes; committed in the fork)
        │  npm run build-themes   (build-final.mjs: merge built-ins[gated] + local; validates AA)
        ▼
themes/  (BUILD OUTPUT — gitignored, not committed; regenerate any time)
  theme.css  tokens.json  themes.index.json  theme-init.js  theme-select.js
themes/  (COMMITTED, hand-authored): effects.css  components.css  dropdown.css  dropdown.js
                                     README.md
        │  (vendored/copied into each app; version recorded in the app's THEME-SERVICE.md)
        ▼
consuming apps                 ← include theme.css+effects.css+components.css, set data-theme

discovery/draft-<n>/  ← optional review playground (owner): node tools/build-palettes.mjs <n> --write
gallery/              ← the component gallery, rendered by the discovery pages (and by the brand
                         site in a11y-way-pages/, which consumes this repo but is not part of it)
```

- **Built-ins vs local:** `build-final.mjs` merges the origin's built-in themes (from the highest-numbered `draft-N.mjs`,
  included unless `--no-builtin` / the machine-local `includeBuiltinThemes:false`) with a fork's own
  themes (`local.mjs`, always). Local ids must not collide with built-ins (the build errors if so).
- **Generated files are build output** — `theme.css`, `tokens.json`, `themes.index.json`,
  `theme-init.js`, `theme-select.js` are gitignored so forks pull origin updates conflict-free, then
  rebuild. Never hand-edit them; edit the palette source and run `npm run build-themes`.
- **VERSION** is the single source of truth (`build-final.mjs` reads it); `npm run release` bumps it,
  updates `CHANGELOG.md`, commits, and tags `vX.Y.Z`.

## Token contract

Each theme is a flat set of CSS custom properties. Colors (per theme, in `theme.css`):

`--bg --bg-panel --bg-elevated` (surfaces, ascending elevation) · `--text --text-muted` ·
`--border --border-strong` · `--focus-ring` · four accents `--accent-{pink,green,blue,purple}` each
with an on-fill text color `--on-{pink,green,blue,purple}`. `--accent-h1` … `--accent-h4` are the heading
colors (`.t-h1` … `.t-h4`): each one of the four accents, pink → green → blue → purple unless the palette
names others in `headings`, so a theme can recolor its headings without recoloring its errors or links.
Plus `color-scheme` and `--glow-strength` (1 dark / 0.35 light), `--fx-grid-opacity` (the backdrop's strength), and the backdrop pattern: `--fx-backdrop-image`,
`-color`, `-mask`, `-anim` are `initial` (the grid) unless the palette sets `backdrop: 'rain'`, which
turns on falling glyphs (`tools/rain.mjs`, drawn through the `--fx-rain` mask in `effects.css`) in
`rainColor`. The build checks every text, focus and border color over the rain's brightest glyph.

Structural tokens (theme-independent, in `components.css` `:root`): `--font-ui --font-mono
--radius --radius-sm --radius-pill --dur --press-y --press-s`. Effect recipe tokens (in `effects.css`
`:root`): `--motion`, `--grid-line-*`, `--tglow-*` / `--tglow-*-sm` (heading vs small-text glow),
`--bglow-*` / `--bglow-*-hi` (box glow, normal/hover).

## Theming mechanism

- `:root` carries the **default** theme (Rink Classic dark). A `prefers-color-scheme: light` media
  query swaps `:root:not([data-theme])` to Rink Classic light — so "do nothing" gives auto dark/light.
- Any theme is forced by `data-theme="<family>-<mode>"` on the root element (more specific than
  `:root`, so it wins). Ten ids: `{rink-classic, midnight-arcade, hot-neon, synthwave-sunset,
  acid-arcade}-{dark, light}`.
- Motion: `--motion` (1/0) gates all transitions (`--dur`) and press transforms (`--press-*`). It
  flips to 0 under `prefers-reduced-motion: reduce` **or** `data-motion="off"` on the root. No blanket
  `!important` reset is used, so a host app's own animations are untouched.
- Glow/grid/scrollbar are derived from the accent tokens via `color-mix`, scaled by `--glow-strength`,
  so light themes automatically render restrained bloom.

## Framework wiring (same CSS, three stacks)

- **Vanilla:** link the three files; set `data-theme` on `<html>`.
- **Angular:** add files to `angular.json` `styles[]`; a small `ThemeService` sets `data-theme` via
  `Renderer2`. Custom properties pierce view-encapsulation/Shadow DOM.
- **React:** import the CSS at the app root; set `data-theme` from a context/provider. Tokens work in
  CSS Modules, styled-components, Tailwind (`var()`), or inline styles.
- `tokens.json` mirrors every value for non-CSS tooling (Style Dictionary, Tailwind config, RN, …).

## Distribution & versioning

- `skill/` installs into `~/.claude/skills/theme-service` (junction on Windows, symlink elsewhere) via
  `install/`. Two modes: `npm run install-all` (link skill + build themes) and `npm run
  install-no-themes` (link skill only); both pass `--only theme-service`, so a theme user installs
  this skill and nothing else. `AGENTS.md` mirrors the skill for non-Claude agents.
- **Machine-local config** `~/.claude/theme-service.local.json` (OUTSIDE the repo, gitignored, never in
  commit history): `{ repo, version, includeBuiltinThemes, history[] }`. It's the **changeable source
  pointer** (which theme-service clone this machine uses — set on install; change via re-install /
  `--source` / editing it), the built-ins preference, and the **install/update history** (agents read
  it). No machine paths are ever committed.
- **Forks & updates:** anyone clones/forks the origin as their own source. Their themes live in
  `local.mjs`; the origin never touches it. `npm run update-from-origin` fetches + merges the origin
  (conflict-free, since generated files aren't committed), then `npm run build-themes` rebuilds —
  optionally excluding the origin's built-ins. Nothing is ever auto-deleted.
- Consuming apps **vendor** a copy of the theme CSS and record the `VERSION` in their `THEME-SERVICE.md`
  tracking log; the app update flow diffs against the repo `VERSION`. `CHANGELOG.md` + git tags
  document each version.

## Public-git safety

Only CSS/JSON/HTML/JS/docs and installer scripts. No secrets, credentials, usernames, email, or
absolute home paths in committed files. `.gitignore` excludes local config and `.claude/`.
