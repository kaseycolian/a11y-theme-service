# Finalized Themes

Apps consume these files. Every theme here is validated to WCAG 2.2 AA in every state — a theme that
fails contrast is never written, so nothing in this folder can ship a failing pair. The token/registry/helper
files are **build output** — run `npm run build-themes` from the repo root to (re)generate them
(they're gitignored, not committed, so forks can pull origin updates conflict-free). The
hand-authored `effects.css`, `components.css`, and `preview.html` are committed. Source of truth =
the palette files (`tools/palettes/draft-*.mjs` built-in + `local.mjs` yours).

## Files

| File | What it is |
|------|-----------|
| `theme.css` | All color tokens. `:root` = the default theme (**Rink Classic**, dark, auto-switching to light under `prefers-color-scheme: light`). Every theme is also a `[data-theme="<id>"]` block. **Generated** — do not hand-edit. |
| `effects.css` | Neon glow / grid / gradient-scrollbar recipes, as tokens. Motion-gated. |
| `components.css` | Opt-in class-based component styles (buttons, inputs, dropdown, switch, notices, tabs, …) with full focus/hover/active/disabled/expanded states. |
| `dropdown.css` + `dropdown.js` | The **accessible dropdown / listbox** — a themed port of the `dropdown` component from the a11y-component-examples library. Optional; include both or neither. See "Accessible dropdown" below. |
| `tokens.json` | Structured mirror of every theme's tokens (for tooling / non-CSS consumers). |
| `themes.index.json` | Registry: families, modes, and the default — drives theme pickers and the add-theme flow. |
| `theme-init.js` | **External** (CSP-safe) script: applies the saved/`?theme=` theme before first paint. Load in `<head>`. |
| `theme-select.js` | **External** (CSP-safe, generated) script: populates & wires any `<select data-theme-select>` + `[data-motion-toggle]`. |
| `preview.html` | Live theme switcher + usage example. Open it in a browser. Its component gallery is rendered from `gallery/` — the same template the palette discovery page uses, so the two can't drift. Add a card there, not here. |

## Use it in an app

1. Include the three stylesheets (order matters: theme → effects → components):

   ```html
   <link rel="stylesheet" href="theme.css">
   <link rel="stylesheet" href="effects.css">
   <link rel="stylesheet" href="components.css">
   ```

2. Do nothing else and you get **Rink Classic**, dark by default and light when the OS
   prefers light. To force a specific theme, set `data-theme` on the root element:

   ```html
   <html data-theme="synthwave-sunset-dark">
   ```

3. Use the component classes in markup: `.btn.btn-solid.a-pink`, `.input`, `.field-label`,
   `.notice.success`, `.drop`, `.switch`, `.tab`, etc. (see `preview.html`). Or just consume the
   tokens (`var(--accent-pink)`, `var(--bg)`, …) in your own CSS.

4. **Disable animations** (beyond OS `prefers-reduced-motion`): set `data-motion="off"` on the
   root element. All transitions, press effects, and glow pulses stop.

Available theme ids: `rink-classic-{dark,light}`, `midnight-arcade-{dark,light}`,
`hot-neon-{dark,light}`, `synthwave-sunset-{dark,light}`, `acid-arcade-{dark,light}`.

## Theme selector (vanilla / extensions)

Two external scripts do it all — **never** inline them (Manifest V3 / strict CSP block inline
scripts, which silently leaves the dropdown empty):

```html
<head>
  <script src="theme-init.js"></script>   <!-- applies saved/?theme= theme before paint -->
  <link rel="stylesheet" href="theme.css">
  <link rel="stylesheet" href="effects.css">
</head>
<body>
  <select data-theme-select aria-label="Theme"></select>
  <label><input type="checkbox" data-motion-toggle> Reduce motion</label>
  <script src="theme-select.js"></script>  <!-- fills + wires the selector/toggle -->
</body>
```

`theme-select.js` is generated with the theme list baked in (mirrors `themes.index.json`) and
persists the choice. React/Angular use their own provider instead — see the skill's
`applying-themes.md`.

Options are emitted **grouped by theme name** (`<optgroup>`), so each row states only what its
heading has not — `Dark`, `Dark · No Background` — rather than repeating the name down the list.
Each carries `data-dropdown-swatch` (that theme's four accents), `data-dropdown-secondary` (its id)
and `data-dropdown-full-label` (the composed `Hot Neon · Dark · No Background`, for the closed
trigger and type-ahead). A plain `<select>` ignores all three and just shows the row text — so the
snippet above is unchanged. To render them, add `data-dropdown` and load `dropdown.js`:

```html
<span id="theme-cap">Theme</span>
<select data-theme-select data-dropdown aria-labelledby="theme-cap"></select>
<script src="dropdown.js"></script>
<script src="theme-select.js"></script>
```

Either script order works. Without `data-dropdown` nothing changes, so an app that vendored an
earlier version keeps its native control through an update.

## Accessible dropdown (`dropdown.css` + `dropdown.js`)

A themed port of the `dropdown` component from the **a11y-component-examples** library. The
behavior is upstream's; the names are this repo's — `.dropdown-*` classes, `data-dropdown-*` hooks
and `window.ThemeService`, matching `.btn` / `.input` / `.field` rather than upstream's `ac-` prefix
(which exists over there to avoid colliding with exactly those names). So it is **not** a drop-in
re-copy from upstream: porting a fix means translating identifiers, and `dropdown.js`'s header
carries the full mapping. It is the control the theme picker in `preview.html`'s header uses.

`.dropdown` is a separate component from `.drop` in `components.css`, not a rename of it — `.drop`
is styles-only for a listbox you wire yourself, and nothing here styles a bare `.drop*` selector.

It **progressively enhances a real `<select>`**. The native element stays in the DOM as the value
store, so `.value`, `.selectedIndex`, `change` listeners and form submission keep working — you can
drop it onto an existing form and nothing downstream needs to know.

```html
<div class="field">
  <label class="field-label" for="region">Region</label>
  <select id="region" data-dropdown>
    <optgroup label="Americas">
      <option value="us-east">US East</option>
      <option value="sa-east" disabled>South America (at capacity)</option>
    </optgroup>
  </select>
</div>
```

Anything with `[data-dropdown]` is enhanced on `DOMContentLoaded`. Per-option decoration, all
optional:

| Attribute | Renders | In the accessible name? |
| --------- | ------- | ----------------------- |
| `data-dropdown-icon="<symbol id>"` | `<use href="#id">` from an SVG sprite | No — `aria-hidden` decoration |
| `data-dropdown-swatch="#hex,#hex,…"` | a color strip | No — `aria-hidden` decoration |
| `data-dropdown-secondary="text"` | a muted second line | **Yes** — it is content, not filler |
| `data-dropdown-full-label="text"` | *nothing* in the row — used for the **closed trigger** and type-ahead | No — the row's own text is the name |
| `data-dropdown-empty-text="…"` | the empty-state message | — |

`data-dropdown-full-label` exists for grouped lists whose rows drop what the heading already said.
The theme picker groups by theme name, so its rows read `Dark` and `Dark · No Background` — fine
under a "Hot Neon" heading, useless on the closed trigger, which has no heading near it, and
unmatchable by type-ahead, where what a user types is `hot`. Give the option the composed
`Hot Neon · Dark · No Background` and both read that instead. Omit it and the row's own text is
used, so ordinary dropdowns need nothing.

Two attributes go on the `<select>` rather than an option:

| Attribute | Effect |
| --------- | ------ |
| `data-dropdown-anchor="<css selector>"` | Size and align the open panel to the nearest matching **ancestor** instead of to the trigger |
| `data-dropdown-swatch-style="dots"` | Render `data-dropdown-swatch` as separate glowing circles instead of the default contiguous strip |

Use it when the trigger sits inside a group — a label cap, an addon, an icon rail — so that what
the user reads as "the control" is the whole group. Without it the panel starts partway across the
group and looks detached. The site header does exactly this
(`data-dropdown-anchor=".theme-console"`), which is why its list spans the cap and the lamps too. It is
opt-in: with no attribute the panel matches the trigger, the way a native `<select>` behaves.

### Console — cap and control in one pill

For a label that reads better *as part of* the control than stacked above it — a persistent
instrument in a toolbar or rail, rather than a field in a form:

```html
<div class="dropdown-console">
  <span class="dropdown-console-cap" id="theme-cap">Theme</span>
  <select id="theme" data-dropdown data-dropdown-anchor=".dropdown-console"
          aria-labelledby="theme-cap"></select>
</div>
```

A `<div>`, **not** a `<label>`: once `dropdown.js` runs the real control is a `<button>`, which a
wrapping label neither names nor focuses. `aria-labelledby` on the cap is what makes the trigger
announce "Theme, *current value*". If you hide the cap responsively, **clip it** — a name pointing at
a `display: none` element resolves to nothing. The site header's `.theme-console` is this pattern
specialized (lamps, a fixed width, its own breakpoints); the gallery's theme-picker card uses the
generic one.

`data-dropdown-swatch-style="dots"` is the same kind of opt-in for the swatch. The header's trigger
already shows the palette as four dots (`.tc-lamps`), and a contiguous strip in the rows below it
meant reading the same four accents in two different shapes; the dots make one notation of it. The
gallery's "Theme picker" card shows it next to the six cards that keep the default strip.

Supports plain lists, icons, swatches, secondary text, `<optgroup>` hierarchies, disabled options,
and the empty state. Keyboard: `↓`/`↑` (wrapping), `Home`/`End`, `Enter`/`Space`, `Esc`, `Tab`, and
type-ahead. When open, DOM focus moves onto the option itself rather than using
`aria-activedescendant`, because the latter is unreliable on VoiceOver for iOS and TalkBack.

The panel is `position: fixed` and promoted to the **top layer** via the Popover API, so an ancestor
with `overflow: hidden` or a `transform` cannot clip it. It re-anchors on scroll/resize and flips
above the trigger when there is more room there. It takes its width and left edge from its anchor
(the trigger, or `data-dropdown-anchor` — see above), so the anchor's width is what sizes the list.

The elements it builds are `.dropdown` (wrapper) wrapping `.dropdown-toggle`, `.dropdown-panel` >
`.dropdown-list` > `.dropdown-option`, and the hidden `.dropdown-native` select. Target those to
restyle it; `assets/site-header.css` is a worked example.

```js
// window.ThemeService — the only global this file adds. Not to be confused with an
// Angular ThemeService class, which is app code (see Framework notes below).
const dd = window.ThemeService.createDropdown(el, { emptyText: 'Nothing saved yet', anchor: groupEl });
dd.rebuild();  // after you change the options — the rows are not observed
dd.sync();     // after you set select.value programmatically
dd.destroy();  // unbinds and restores the native <select>
```

Idempotent — a second call on the same element returns the existing instance. `<select multiple>`
is deliberately left native (different keyboard model and ARIA contract).

**Gotchas.** Give it a real label (`<label for>`, `aria-labelledby`, or `aria-label`); the script
forwards whichever it finds, along with `aria-describedby`. Call `rebuild()` after changing options.
A label pointing at a `display: none` element resolves to an empty name — if you hide a label
responsively, clip it instead. Prefer `<label for>` over a wrapping `<label>`, since the enhanced
control is a `<button>`.

## Framework notes

- **Vanilla:** link the CSS, toggle `data-theme` on `<html>`. Done.
- **Angular:** add the three files to `angular.json` `styles[]`; a small `ThemeService` sets
  `data-theme` via `Renderer2`. Tokens pierce view-encapsulation (custom properties cascade
  through Shadow DOM).
- **React:** import the CSS once at the app root; set `data-theme` from a context/provider.
  Tokens work in CSS Modules, styled-components, Tailwind (`var()`), or inline styles.

## Regenerate

Never edit `theme.css` / `tokens.json` / `themes.index.json` by hand — edit the palette
source and rebuild:

```
node tools/build-final.mjs --write       # from the current selected draft (draft-2)
```

The finalizer re-validates every color pair against WCAG 2.2 AA and refuses to write on any failure.
