# Applying themes to a project

Goal: the target app renders **any** theme from the theme-service and lets the user pick one, with
a default of Rink Classic (dark, auto-light by OS). Everything stays WCAG AA 2.2.

There are two paths. Read the one that matches the project, then the stack section, then verify.

---

## Step 0 — Confirm the approach with the user (do this FIRST)

Applying to a real app involves choices that materially change the result and are annoying to undo.
**Ask the user these before doing the work** (Claude: use AskUserQuestion; other agents: ask plainly).
Summarize their choices back, then record them in `THEME-SERVICE.md` (see Common setup step 3). If the
session is genuinely non-interactive, use the **recommended default** and note the assumption in the
history log so a later session can revisit it.

1. **Component styling depth — how much should the app's components change?**
   - **Colors only (recommended default):** apply the theme tokens (and, if wanted, the glow/effects)
     to the app's *existing* components. They keep their current shape, layout, and behavior — just
     re-colored. Lowest risk, smallest diff. Change as little of the components' own styling as
     possible while pulling the palette through.
   - **Full restyle to match the theme-service look:** components adopt the same **look, feel, and
     interaction** as the reference gallery in `gallery/gallery.js` — the one the discovery pages
     (`discovery/draft-N/index.html`) render, so it is the canonical example of every component in its
     intended markup — by using the `components.css` classes, while **preserving all existing functionality**. Bigger
     visual change and more work; only do it if the user opts in. Do **not** rewrite the whole UI
     without this explicit go-ahead.
   - If they're unsure, offer a **visual before/after** (a small scratch page or screenshots of a few
     key components both ways). Say up front it takes extra time/tokens, and only build it on request.

2. **Fonts — replace the app's fonts with the theme fonts** (`--font-ui` / `--font-mono`), or keep the
   app's current fonts and apply colors/effects only? (Default: **keep the app's fonts** unless they
   want the full retro-neon look.)

3. **Background effect — where should it go?** Several themes carry a background effect (`.fx-grid`,
   at each theme's own `--fx-grid-opacity`): the retro crossing-line grid on most, falling code ("rain")
   on NEO. Ask which surfaces it paints on:
   - **The page background only (recommended default):** `.fx-grid` on the page-level background
     surface — `<body>` or the main full-width wrapper — and **nothing else**. Sections, cards and
     panels sitting *on top* of that background stay flat; the grid is the backdrop they sit over.
     This is what every already-themed repo does.
   - **The header and footer only:** `.fx-grid` on the header and footer components, and **not** on
     the page background surface. The bars carry the effect; the page behind them is a flat `--bg`.
   - **The whole page — background, header and footer:** `.fx-grid` on the page background surface
     **and** on the header and footer components. The strongest read of the retro look.
   - Either way it costs nothing on the plain themes: `.fx-grid::before` reads
     `opacity: var(--fx-grid-opacity)`, which is `0` on the **"(No Background)"** variants, so the
     effect auto-hides there wherever you put it. Record which surfaces you marked.
   - **NEO's rain moves.** It falls until motion is off, so an app that offers NEO must also offer the
     "Reduce motion" control (`data-motion-toggle`) — WCAG 2.2.2 requires a way to pause anything that
     moves for more than five seconds. `prefers-reduced-motion` holds it still too. Its glyphs are
     `data:` SVG images, so a CSP that restricts `img-src` has to allow `data:`, or the rain is not drawn
     (the page is otherwise unaffected).
   - If the app has no header/footer, only the first option is meaningful — say so and move on.

4. **Existing theme selector (ask only if the app already has one):**
   - **Replace** the app's selector with the theme-service one, or **wire the new themes into the
     existing dropdown** (keep their control, add our themes as options + persistence)?
   - **Existing themes:** remove the app's old themes, or keep them **alongside** the new ones?

5. **Selector placement** — propose a logical spot and confirm it (see "Selector placement" below).

For a **new / greenfield** project there's no existing selector/themes/components to reconcile, so
skip the "existing" parts of 1, 2 and 4; still ask **background effect placement** (3 — it applies
just as much to a new app), and confirm **selector placement** (per the intended UX and any user
requirements) and that using the full component classes is wanted (usually yes).

---

## Common setup (both paths)

1. **Choose a vendor folder** in the target repo for the copied theme files:
   - Vanilla: `assets/theme/` (or next to existing CSS).
   - Angular: `src/theme/`.
   - React: `src/theme/`.
2. **Copy from the source `themes/`** into that folder:
   - Always: `theme.css` (color tokens for all themes).
   - Almost always: `effects.css` (glow/grid/scrollbar recipes — the neon identity).
   - **New projects only** (or existing apps adopting our components): `components.css`.
   - **Vanilla / extension / any non-framework app:** also copy `theme-init.js` and `theme-select.js`
     (the CSP-safe selector helpers — see "The theme selector" below). React/Angular apps use their
     own provider instead and don't need these.
   - **Optional, both or neither:** `dropdown.css` + `dropdown.js` — the accessible dropdown/listbox
     (grouped options, icons, swatches, secondary text, full keyboard + screen-reader model). Copy
     them if the app wants that control, or wants the theme selector rendered with swatches and
     family groups. Skip them and the selector stays a native `<select>`.
   - Copy `themes.index.json` too (registry reference).
3. **Write / update the tracking log `<vendor>/THEME-SERVICE.md`.** This is the record future agent
   sessions read to know this repo already uses the theme-service, what was decided, and what changed.
   On the **first** apply, create it from this template; on any later apply/update, **append a new
   History entry** (never rewrite past entries) and refresh the "Applied configuration" + version.

   ```markdown
   # Theme Service

   This app's theming comes from the shared **theme-service** — currently on version `<VERSION>`.
   The files in this folder are vendored copies of the source of truth; do not hand-edit generated
   token files, and do not hardcode colors — consume the theme tokens (`var(--…)`).

   ## For agents working in this repo
   This repo **already uses the theme-service** (see History below). Use the **theme-service skill**
   (or its `AGENTS.md`) for any theme work here — don't improvise, and don't re-apply from scratch.
   - Update to latest:  "Update this repo to the latest theme-service version."
   - Add/change themes:  see the theme-service repo's `CREATING-THEMES.md`.
   Rules: keep WCAG AA 2.2 · default theme is Rink Classic · the selector uses the **external**
   `theme-init.js` / `theme-select.js` (never inline scripts — MV3/strict CSP blocks them).

   ## Applied configuration (current decisions on record)
   - Component styling: `<colors-only | full-restyle>`
   - Fonts: `<kept app fonts | replaced with theme fonts>`
   - Background effect: `<page background | header + footer | page + header + footer | off>` — `.fx-grid` on: `<selector(s)>`
   - Selector: `<theme-service selector | wired into existing dropdown>` — placement: `<where>`
   - Existing themes: `<none | removed | kept alongside>`

   ## History
   <!-- Append one entry per apply/update. Most recent last. Never edit past entries. -->
   - `<YYYY-MM-DD>` — Applied theme-service `v<VERSION>`. `<one-line summary: what was done + key decisions>`.
   ```

   The version line is also what `updating-themes.md` diffs against later. If a `THEME-SERVICE.md`
   already exists, the app was themed before — read its History and "Applied configuration" and follow
   `updating-themes.md` instead of applying fresh.
4. **Load order matters:** `theme.css` → `effects.css` → `components.css` → `dropdown.css`.

The default theme applies with **no** `data-theme`. Force one with `data-theme="<id>"` on the root
`<html>` element. Theme ids come from `themes.index.json` (`themes[].id`), e.g.
`rink-classic-dark`, `synthwave-sunset-light`.

---

## Path A — New / greenfield project

Use the component classes directly; the app inherits the full look for free.

1. Include all three CSS files (order above).
2. Build UI with the component classes: `.btn.btn-solid.a-pink`, `.btn-outline`, `.btn-ghost`,
   `.btn-icon`, `.input`, `.textarea`, `.select`, `.field`/`.field-label`, `.drop`/`.drop-toggle`/
   `.drop-panel`, `.choice`, `.switch`, `.notice.{info,success,warn,error}`, `.badge`, `.chip-toggle`,
   `.tabs`/`.tab`, `.result`, `.t-h1..t-h4`/`.t-body`/`.t-muted`/`.t-link`, and effect classes
   `.fx-grid`, `.fx-scroll`, `.fx-bar-top`/`.fx-bar-bottom`. (See `gallery/gallery.js` for a full
   gallery of every class + state in its intended markup — it is what `discovery/draft-N/index.html`
   renders, so it is the one authoritative copy.) Put `.fx-grid` on the
   surfaces the **Step 0 question 3** answer names — see the placement table in Path B below.
3. Add the **theme selector** (below) and the **motion toggle** (optional).
4. Verify against `wcag-checklist.md`.

---

## Path B — Existing project (extend to multi-theme)

The app already has its own markup and CSS. Which of the Step 0 **component-styling-depth** choices
the user made decides how far you go:

- **Colors only (default):** do **not** rewrite components. Make the app's *existing* styles consume
  theme tokens (B1–B2), so every theme re-skins the current UI with minimal change. This is the bulk
  of this section.
- **Full restyle:** in addition to the token mapping, migrate the app's components to the
  `components.css` classes (`.btn`, `.input`, `.notice`, `.drop`, `.switch`, `.tab`, …) so they match
  the gallery's look/feel/interaction — **preserving every existing behavior, handler, and ARIA
  attribute**. Do this component-by-component, verifying functionality after each; never bulk-replace
  markup blind. Fall back to colors-only for anything risky, and tell the user what you left.

If the user chose to **replace fonts**, also point the app's font stack at `--font-ui` / `--font-mono`
(e.g. set them on `body`/`:root`); otherwise leave the app's fonts alone. Steps (colors-only path):

### B1. Audit the app's current colors
Find hardcoded colors (hex/rgb/hsl/named) in the app's CSS/SCSS/styled-components/inline styles.
Group them by role: page background, card/panel surfaces, popovers/menus, primary text, secondary/
muted text, borders/dividers, control borders, focus outlines, links, primary action/brand color,
success, error/danger, info, warning.

### B2. Map each role to a token
Replace hardcoded values with `var(--token)` using this mapping (do not change layout, only colors):

| App role | Token |
|----------|-------|
| Page / body background (base) | `--bg` |
| Card / panel / raised surface | `--bg-panel` |
| Popover / menu / modal / dropdown surface | `--bg-elevated` |
| Primary body text | `--text` |
| Secondary / placeholder / disabled text | `--text-muted` |
| Subtle divider / hairline border | `--border` |
| Visible control border (input/button outline) | `--border-strong` |
| Focus outline / ring | `--focus-ring` |
| Primary action / brand accent | `--accent-pink` (or the closest accent to the brand hue) |
| Headings, by level | `--accent-h1` … `--accent-h4` (fall back to pink, green, blue, purple: e.g. `var(--accent-h1, var(--accent-pink))`) |
| Links / informational | `--accent-blue` |
| Success / confirm | `--accent-green` |
| Secondary accent / warning | `--accent-purple` |
| Text placed **on** a filled accent button | `--on-pink` / `--on-green` / `--on-blue` / `--on-purple` (match the fill) |

Semantic states: success→green, error/danger→pink, info→blue, warning→purple. (This brand uses
purple for warning rather than amber; if the app truly needs a distinct amber warning, note it — a
per-theme amber exists only in some themes, so keep warning on `--accent-purple` for cross-theme
consistency, or raise `adding-a-theme.md`.)

Notes:
- The tokens are defined on `:root` and `[data-theme]`, so the app's existing selectors keep working —
  they just read `var(--…)` now.
- For translucent fills/tints, use `color-mix(in srgb, var(--accent-x) N%, transparent)` or
  `color-mix(in srgb, var(--accent-x) N%, var(--bg-panel))` (opaque) instead of rgba literals.
- You usually only need `theme.css` (+ `effects.css` if you want the glow) for this path;
  `components.css` is optional and only if the app adopts our component classes.
- **The neon effects are opt-in via classes** — the tokens re-color everything, but the *effects*
  only paint on an element carrying their class. Most importantly, the **retro grid backdrop needs
  `.fx-grid` on a surface**; without it, the "with background" themes look flat because there's no
  element for the checkerboard to render on. It respects each theme's `--fx-grid-opacity`, so it shows
  on grid themes and **auto-hides on the "(No Background)" variants**. Similarly, the gradient
  scrollbar needs `.fx-scroll` on a scroll area, and the mirrored gradient bars use `.fx-bar-top` /
  `.fx-bar-bottom`.

  **Where `.fx-grid` goes is the Step 0 question 3 answer — don't pick a surface yourself:**

  | Answer | Mark with `.fx-grid` | Leave unmarked |
  |---|---|---|
  | Page background only *(default)* | The page background surface — `<body>`, the main full-width wrapper, or a full-popup wrapper | Header, footer, and every section/card/panel on top of the background |
  | Header and footer only | The header and footer components | The page background surface |
  | Whole page | The page background surface **and** the header and footer components | Sections/cards/panels on top of the background |

  In every case, **never** put it on the panels and sections layered over the page background — the
  grid is the backdrop they sit over, and stacking it re-darkens each surface.

  The test is *what the surface stands for*, not how deeply it's nested. A surface that is itself a
  page background in its own right still counts as one: an extension's full-popup wrapper, an embedded
  app frame or device mock, a preview pane rendering a document. The gallery is the worked example:
  a page puts `.fx-grid` on `<body>` and nothing else, yet the `.app-frame` miniature in
  `gallery/gallery.js` carries it too — because that frame stands in for the *app's* background, not
  for a card on the host page.

  Two notes on the header/footer answers:
  - **A bar can take the class directly if it leaves `::before` free.** `.fx-grid` paints its
    backdrop on `::before` at `z-index: -1`, so a header or footer that draws its own decoration on
    `::after` (rather than `::before`) composes with it cleanly — add `fx-grid` to the element and
    you are done.
  - **An app's own header/footer needs two checks first.** `.fx-grid` paints on `::before` at
    `z-index: -1` and sets `position: relative`. If the element already uses `::before`, or sets
    `position` to anything other than `relative` (a sticky header especially), the class will either
    render nothing or break the element. In that case put `.fx-grid` on a **full-bleed wrapper inside**
    the component instead — e.g. `<header class="app-header"><div class="fx-grid">…</div></header>` —
    and keep the wrapper outside any max-width inner rail so it spans the bar.

  If the page background surface is translucent glass over the body (the site header and footer are,
  by design), the body's grid already shows through it. That's intended — don't add `.fx-grid` to the
  bars to "fix" it unless the user asked for the header/footer placement.

### B3. Ensure a themeable root
Confirm the mapped variables resolve: since they live on `:root`, any element can read them. If the
app scopes styles oddly (e.g. shadow DOM in Angular), `theme.css` on `:root` still cascades in
(custom properties pierce shadow boundaries).

### B4. Add / reconcile the theme selector (per the Step 0 question 4/5 decisions)
- **No existing selector:** add the theme-service selector (below), listing **all** themes, placed per
  "Selector placement".
- **Replace the existing selector:** swap their control for the theme-service one; remove their old
  theme CSS/JS if the user chose to delete old themes, or keep it if they're kept alongside.
- **Wire into the existing dropdown:** keep the app's selector control and add the theme-service theme
  ids as options; on change, set `data-theme` + persist (reuse the app's persistence or `theme-select.js`
  logic). If keeping old themes alongside, make sure their values and the new `data-theme` ids don't
  collide.

### B5. Verify each theme renders
Load the app, switch through every theme, and confirm text/controls stay legible and the layout is
unchanged. The tokens are AA by construction, but **app-specific color pairs you created must be
re-checked** with `tools/contrast-checker/` (e.g. `node cli.mjs "<fg>" "<bg>" --min 4.5`). Check the
states in `wcag-checklist.md`.

---

## The theme selector (all stacks)

Requirements:
- Lists **all** themes from `themes.index.json` (`themes[]`). Each entry stores its display name in
  three parts — `name` (`"Hot Neon"`), `group` (`"Dark"`/`"Light"`, may be `""`) and `description`
  (`"No Background"`, may be `""`) — plus `label`, the three composed as
  `"Hot Neon · Dark · No Background"`. Group the list by `name` and show only `group` + `description`
  in each row, so the name is not repeated on every line; use `label` wherever a row stands alone
  (a closed trigger, a settings summary),
  plus a default/"Auto" option (no `data-theme` → Rink Classic by OS).
- On change: set `document.documentElement.setAttribute('data-theme', id)` (or remove it for Auto).
- **Persist** to `localStorage` and **re-apply before first paint** to avoid a flash of the wrong theme.
- Include a "Reduce motion" control that toggles `data-motion="off"` on `<html>`. Optional only if no
  theme you offer has a moving backdrop: NEO's rain falls, and WCAG 2.2.2 needs a way to stop it.

### Selector placement
Put the picker where it reads as an intentional part of the UI, not bolted on:
- **Existing app:** place it where users look for appearance/settings controls **and** where it sits
  naturally beside neighboring elements — e.g. the header/toolbar, a settings menu or panel, or the
  footer. Match the **size, spacing, and alignment** of adjacent controls. If the user chose
  *full restyle*, style the control like the theme (`.select` / `.drop`); if *colors-only*, match the
  app's own control styling so it blends in. Avoid cramped or arbitrary spots. Propose the location and
  confirm before wiring it in.
- **New app:** place it per the intended UX and any user requirements — commonly a settings screen, an
  "Appearance" section, or a header control. If the layout isn't specified, ask.

> **CRITICAL — no inline scripts.** Do **not** put the bootstrap or selector logic in an inline
> `<script>…</script>`. **Manifest V3 browser extensions and any strict-CSP site block inline
> scripts**, so the selector silently won't populate (a common failure). Always load JS from
> **external files** (`<script src="…">`). The theme-service ships two ready-made, CSP-safe helpers
> for exactly this — use them for vanilla/extension apps.

### Vanilla / browser-extension / any non-framework app (use the shipped helpers)
You vendored `theme-init.js` and `theme-select.js` in the common setup. Wire them with two
`<script src>` tags and a marked `<select>` — no inline JS, no fetch, works under MV3 CSP:

```html
<head>
  <!-- Applies the saved/deep-linked theme before first paint (no flash). MUST be external. -->
  <script src="theme/theme-init.js"></script>
  <link rel="stylesheet" href="theme/theme.css">
  <link rel="stylesheet" href="theme/effects.css">
  <link rel="stylesheet" href="popup.css"><!-- your app's own styles -->
</head>
<body>
  <!-- Anywhere in your UI. theme-select.js finds it by the data-theme-select attribute
       and fills it with all themes + an "Auto" option. -->
  <select data-theme-select aria-label="Theme"></select>
  <!-- Optional motion toggle: -->
  <label><input type="checkbox" data-motion-toggle> Reduce motion</label>

  <!-- ...your app... -->

  <!-- Populates + wires the selector/toggle. MUST be external (defer/end-of-body both fine). -->
  <script src="theme/theme-select.js"></script>
</body>
```
That's the whole integration. `theme-select.js` is generated with the current theme list baked in
(mirrors `themes.index.json`), persists to `localStorage`, and reflects `?theme=<id>` deep-links.
No build step needed. The choices are saved under the keys `theme` and `motion`. Sites that share an
origin (two GitHub Pages projects under one account, say) share those keys, so a choice made on one
changes the other; give each its own with
`<html data-theme-storage="my-site-theme" data-motion-storage="my-site-motion">`, which both helpers read. **Browser extension note:** the theme files sit inside the package (`theme/…`),
so they load as `'self'` under the default MV3 CSP; if the app uses a bundler, make sure its build
copies the `theme/` folder into the output (e.g. an esbuild/webpack copy step).

### Angular
- Add the vendored CSS to `angular.json` `styles[]` (or `@import` in `src/styles.css`):
  `"src/theme/theme.css", "src/theme/effects.css", "src/theme/components.css"`.
- For pre-paint theming, load `theme-init.js` via `src/index.html` `<head>` with
  `<script src="theme-init.js"></script>` (external — never inline), or set the attribute in an
  `APP_INITIALIZER`.
- Manage switching with a service (this is already external code, so it's CSP-safe):
```ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private root = inject(DOCUMENT).documentElement;
  themes = /* import themes.index.json */ THEMES.themes;
  set(id: string | null) {
    if (id) { this.root.setAttribute('data-theme', id); localStorage.setItem('theme', id); }
    else { this.root.removeAttribute('data-theme'); localStorage.removeItem('theme'); }
  }
  setMotion(off: boolean) { off ? this.root.setAttribute('data-motion','off') : this.root.removeAttribute('data-motion'); }
}
```
- Bind a `<select>` in a settings/header component to `ThemeService.set(...)`, options from `themes`.
  (You don't need `theme-select.js` — the service is your selector wiring.)

### React
- Import the CSS once at the app root: `import './theme/theme.css'; import './theme/effects.css'; import './theme/components.css';`
- For pre-paint theming, load `theme-init.js` as an external script in `index.html` `<head>`
  (Vite/CRA/Next `_document`) — not an inline script.
- Manage switching with a hook/provider (external code, CSP-safe):
```tsx
import themesIndex from './theme/themes.index.json';
function useTheme() {
  const [id, setId] = useState(() => localStorage.getItem('theme') || '');
  useEffect(() => {
    const r = document.documentElement;
    if (id) { r.setAttribute('data-theme', id); localStorage.setItem('theme', id); }
    else { r.removeAttribute('data-theme'); localStorage.removeItem('theme'); }
  }, [id]);
  return { id, setId, themes: themesIndex.themes };
}
// render <select value={id} onChange={e=>setId(e.target.value)}> with a "" Auto option + themes.map(...)
```
- Tokens are consumable from CSS Modules, styled-components (`var(--accent-pink)`), Tailwind
  (`colors: { pink: 'var(--accent-pink)' }`), or inline styles. (No `theme-select.js` needed — the
  hook is your selector wiring.)

---

## Verification (all paths)
1. App loads with **Rink Classic** default (dark, or light if OS prefers light).
2. Selector lists **every** theme; switching re-skins the whole UI; choice persists across reload
   with **no flash** of the previous theme. **Test in the real runtime** (the actual extension via
   `chrome://extensions` → Load unpacked, or the served app), not just a `file://` preview — inline
   scripts that work in a plain file will be **blocked by MV3/CSP** in the real app, leaving the
   selector empty. If the dropdown is empty, you have an inline-script/CSP problem (use the external
   `theme-select.js`). Open the console and check for CSP violation errors.
3. Keyboard-tab shows a visible focus ring on every control (`--focus-ring`).
4. `data-motion="off"` (or the reduce-motion control / OS setting) stops transitions & glow pulses.
5. Any app-specific color pairs pass `tools/contrast-checker/` at AA. Walk `wcag-checklist.md`.
6. If the user chose *full restyle*, confirm each migrated component still **works** (clicks, keyboard,
   ARIA, form submits) — not just that it looks right.
7. **Background effect lands where the user asked.** On a grid theme (e.g. `rink-classic-dark`), the
   grid is visible on exactly the surfaces the Step 0 question 3 answer named and **nowhere else** —
   in particular not stacked on the sections/cards over the page background. Switch to the matching
   **"(No Background)"** variant and confirm it disappears from all of them. If you marked a header or
   footer, also confirm the bar kept its own decoration (the lit tube) and its own positioning (a
   sticky header still sticks).
8. **Write / append `<vendor>/THEME-SERVICE.md`**: set the current version + "Applied configuration"
   (the Step 0 decisions) and **append a dated History entry** summarizing what you did (and any
   defaults you assumed in a non-interactive run). This is how the next session knows the repo is
   already themed and what was decided.
9. Summarize for the user: what changed, the decisions applied, and anything you deliberately left
   (e.g. components kept as colors-only).
