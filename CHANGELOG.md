# Changelog

All notable changes to the theme-service. Apps record the version they vendored and use this log
(plus `updating-themes.md`) to migrate. Versioning: minor bump for additive themes/tokens, major for
breaking token renames/removals or a default-theme change.

## 1.5.0 — 2026-09-24

RFG, a new theme family, and a theme selector sorted A→Z

### TL;DR

- **New theme family: RFG.** Lime green, neutral grey and blue, in that order, on neutral greys. It
  comes in dark and light, each with a **No Background** twin: `rfg-dark`, `rfg-dark-no-background`,
  `rfg-light`, `rfg-light-no-background`. All four pass WCAG 2.2 AA.
- **The theme selector is sorted.** Automatic comes first, then the themes A→Z. Inside each theme
  the rows read Dark, Dark · No Background, Light, Light · No Background.
- **Theme rows no longer show the theme id** as secondary text. Only the Automatic row keeps its
  "follows your OS" line.

### Upgrading

1. **Apps with the generated selector (`theme-select.js`):** vendor the new `themes/` files. RFG
   shows up in the list on its own, and the list takes the new order. No token was added, renamed or
   removed, and every existing theme is identical.
2. **Apps with a hand-built theme list:** add the four `rfg-*` ids if you want RFG. Nothing else
   changes.

---

**How RFG is built.** The pink slot is a grey, not a red, so errors are grey here, as in NEO. They
still carry a ✗ glyph and a word, so the state never rides on color alone. The light-mode accents
keep their hue and are darkened only as far as 4.5:1 needs. The green buttons are lettered in dark
grey on dark, because white on that lime is 1.95:1.

## 1.4.2 — 2026-09-24

NEO: a brighter dark-mode rain

### TL;DR

- **Dark-mode rain stands out more.** It falls at 0.17, up from 0.10. Its brightest glyph is now 1.30:1
  against the page, up from 1.13:1.
- **To make room, dark NEO's steel grey is one step lighter:** `#798aa4`, up from `#6d7e98`. It has the
  same hue and the same greyness. This is the blue and the pink slot, which share one color.

### Upgrading

1. **Apps that offer NEO:** vendor the new `themes/` files. Only dark NEO's steel grey and its rain
   strength changed. No token was added, renamed or removed, and every other theme is identical.

---

**Why the grey moved.** Text over the rain has to reach 4.5:1 against the rain's brightest glyph, and
the steel grey was the color holding the rain down. At `#798aa4` it passes with the rain at 0.17.
From there the strong border is the next limit. The grey buttons keep their `#040b18` lettering,
which now has more contrast than before.

## 1.4.1 — 2026-09-24

NEO: a steel-grey accent in place of the violet, and a brighter light-mode rain

### TL;DR

- **No more violet in NEO.** The pink slot now uses the same color as blue, so errors, radios, pressed
  chips and the header's accent line match the links and info messages. That color is also now a
  steel grey instead of an indigo.
- **Light-mode rain stands out more.** It falls in a neon green over a lighter grey page, and the page
  between the glyphs has no green in it.

### Upgrading

1. **Apps that offer NEO:** vendor the new `themes/` files. Only NEO's color values changed. No token
   was added, renamed or removed, and every other theme is identical.
2. **Errors in NEO share the info color now.** They are still told apart by symbol and wording (✗ and
   ⓘ), so no state relies on color alone. If your app tells errors apart by color only, add a symbol
   or a word.

---

**Steel grey.** Dark: `#6d7e98`, with `#040b18` lettering (4.77:1). Light: `#314058`, with white
lettering (10.5:1). It is the earlier indigo navy at under half the chroma, moved from hue 273 to
258, because a grey with an indigo cast reads lavender.

**Light-mode rain.** Neon `#39ff14` at 0.26, on the hue of the digital-rain still. The page is now
`#f9fafc`: still a grey that sets the white panels apart, but lighter, so the rain has more room
before text over it would drop below 4.5:1. The rain paints only its glyphs.

## 1.4.0 — 2026-09-24

NEO, a Matrix-themed family, and a digital-rain backdrop

### TL;DR

- **New theme family: NEO.** `neo-dark` and `neo-light`, each with a No Background variant, so 20
  built-in themes. Black and code green with a violet and an indigo navy, themed on The Matrix.
- **New backdrop: rain.** Falling columns of glyphs in place of the grid, chosen per theme. Text sits
  on it, so the build checks every text, accent, focus and border color over its brightest glyph.
  It stops when motion is off.
- **Headings can take any accent, per level.** Every existing theme keeps pink, green, blue, purple.
- **`npm run build-themes` builds from the highest-numbered draft**, the rule the Pages workflow and
  the tests already used. Before, it was pinned to draft 3.

### Upgrading

1. **Apps:** vendor the new `themes/` files. Existing themes look the same. Headings and the
   backdrop read new tokens with fallbacks, so an older `theme.css` next to the new CSS still
   renders the old look.
2. **Apps that offer NEO:** include the "Reduce motion" control (`data-motion-toggle`). The rain
   moves, and WCAG 2.2.2 needs a way to stop it. Under a CSP that restricts `img-src`, allow `data:`,
   or the rain is not drawn (nothing else is affected).
3. **Your own themes** (`tools/palettes/local.mjs`): nothing to do. New optional fields: `headings`,
   `backdrop`, `rainColor`.

---

**NEO.** Dark: a black page with near-black panels (`#000c02`, raised `#001800`), code-green text
`#59f380`, green `#35da65`, violet `#925aff`, steel indigo `#6c7ab5`. Light: a cool grey page
`#f4f6f9` with white panels, green `#117e16`, violet `#321a5f`, indigo navy `#2e3976`. H1 to H3 are
green. Errors are violet rather than red; they still carry a ✗ and a word, so no state relies on
color alone.

**Rain backdrop.** A palette sets `backdrop: 'rain'`, and `rainColor` (default: its green accent)
falls at its `grid` strength. `tools/rain.mjs` generates the glyph tiles into `effects.css`
(`--fx-rain`), and `rain.test.mjs` fails if the two drift apart. Two layers fall at different
speeds, stepped to about 16 repaints a second. `prefers-reduced-motion` and `data-motion="off"` hold
it still. New tokens on every theme: `--fx-backdrop-image`, `-color`, `-mask` and `-anim`, which are
`initial` (the grid) unless the theme rains. `tokens.json` records each theme's `backdrop`.

**Heading tokens.** `--accent-h1` to `--accent-h4`, set on every theme from the optional `headings`
palette field. `.t-h1` to `.t-h4` read them, and so do the gallery's app headings.

**Build.** `npm run validate` checks draft 4. There is a new review page at `discovery/draft-4/`.

## 1.3.0 — 2026-09-24

Stricter contrast checks and a one-skill install

### TL;DR

- **Contrast ratios are compared exactly now.** A pair at 4.496:1 used to round up to 4.50 and
  pass. WCAG says it doesn't meet 4.5:1, and now the theme builder, `npm run validate` and the
  contrast checker agree.
- **`--border-strong` is checked on every surface:** `--bg` and `--bg-elevated` as well as
  `--bg-panel`.
- **The install commands install one skill.** `npm run install-all` and the other install scripts
  link only `theme-service` now.

### Upgrading

1. **Apps:** nothing to do. No token value changed and every built-in theme still passes, so the
   theme files an app vendored are still correct.
2. **Your own themes** (`tools/palettes/local.mjs`): run `npm run build-themes`. A theme that only
   just passed before can fail now. The build names the pair and its ratio, for example
   `--border-strong on --bg: 2.98:1, needs 3:1`.
3. **Code that calls the contrast checker:** `rate()` and `checkPairs()` return `ratio` truncated
   to two decimals instead of rounded (4.4959 is `4.49`, was `4.5`). Pass/fail uses the exact value.

---

**Contrast checks.**

- The theme builder (`npm run build-themes`), `npm run validate`, and the contrast checker's library
  and CLI compare the exact ratio. W3C: "the computed values should not be rounded (e.g., 4.499:1
  would not meet the 4.5:1 threshold)"
  ([Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- The CLI's single-pair `--min` check used to pass a near miss, even with ✗ printed for AA on the
  line above it. It now fails and exits 1.
- Ratios are shown truncated, never rounded up. `contrast.mjs` exports a new `floor2()`. `round2()`
  is still exported for existing callers, but don't use it for pass/fail.
- `--border-strong` draws the edge of ghost and icon buttons, the switch track and toggle chips.
  Those sit on the page and in menus as well as on panels, so it's now checked at 3:1 on all three
  surfaces. That's 28 checks per theme, up from 26.
- The pair list lives in one file, `tools/palette-checks.mjs`, used by both the builder and
  `npm run validate`, so the two can't disagree.
- When the builder refuses a theme, it lists each failing pair and its ratio instead of only a
  count.
- `npm run validate` now exits 1 when a theme fails, so it can gate CI. It used to print the
  failure and exit 0.
- `npm test` runs new unit tests for the contrast checker, the pair list, and both builders refusing
  to write a failing theme. They use Node's built-in test runner, so there are no dependencies.
- The draft 3 discovery page shows the new checks.

**Installing.**

- `npm run install-all`, `install-no-themes` and `install-skill` link only the `theme-service`
  skill. They used to link the A11Y Way pages skill too, which theme users don't need. Running
  `install/install.sh` or `install/install.ps1` yourself still links both unless you pass
  `--only theme-service` (`-Only theme-service` in PowerShell).
- Re-running the installer keeps your settings. `install.sh` and `install.ps1` used to rewrite
  `~/.claude/theme-service.local.json` from scratch, dropping your built-in themes preference and
  your install history. The PowerShell one also wrote a byte-order mark that made the file
  unreadable. Both now use the same config writer as `install.mjs`, and both gained `--only`,
  `--source`, `--builtins` and `--help` (`-Only`, `-Source`, `-Builtins`, `-Help` in PowerShell).
- `themes/preview.html` is gone from `themes/`. To see every theme in real components, open
  `discovery/draft-3/index.html`.

## 1.2.0 — 2026-08-11

### TL;DR

- **A theme's name is three parts now** (`name` / `group` / `description`) instead of one `label`
  string, so the theme picker can group by family and stop repeating itself. `label` still works,
  but **its value changed**.
- **The background effect can go on the header and footer**, not just the page background — and the
  apply interview now *asks* where you want it instead of guessing.
- **The brand lockup is a step larger** at every width. Header height is unchanged.

### Upgrading — four things that may need action

1. **Fork themes** in `tools/palettes/local.mjs`: rename `label` → `name` and `group` → `cohort`.
2. **Vendored header markup:** add `data-dropdown-swatch-style="dots"` to its `<select>`, or the
   theme console's swatches silently fall back to strips.
3. **Vendored `site-footer.css`** with an override on `.site-footer::before`: move it to `::after`.
   Overrides of `.ftr-link::before` / `.ftr-here::before` did not move.
4. **Anything reading a theme's `label`** and expecting the old string: `hot-neon-dark-no-background`
   is now `"Hot Neon · Dark · No Background"`, was `"Hot Neon (No Background)"`.

No token was renamed or removed and the default theme is unchanged, so nothing breaks from the token
surface alone. Everything below is the reasoning behind the three headlines.

---

**A theme's display name is three parts now, not one string.** Every theme carries `name`
(`"Hot Neon"`), `group` (`"Dark"` / `"Light"`, may be empty) and `description` (`"No Background"`,
may be empty); `label` is the three composed with ` · `. Composing at render time is what lets one
theme read differently per context — and it removes the reverse direction, where `build-final.mjs`
had to regex-strip `" (No Background)"` back off a finished label to recover the family heading,
silently getting it wrong for any name that did not end that way.

- **The header dropdown stops repeating itself.** It groups by `name`, so a row states only what its
  heading has not: `Hot Neon` › `Dark`, `Dark · No Background`, `Light`. New optional
  `data-dropdown-full-label` carries the composed name to the two places a bare row is not enough —
  the **closed trigger**, which has no heading near it, and **type-ahead**, so `sy` still finds
  Synthwave Sunset. Options without it fall back to their own text; plain dropdowns are unaffected.
- **New `data-dropdown-swatch-style="dots"`** on a `<select>` renders swatches as separate glowing
  circles instead of the default strip. This is the header's existing look, moved out of
  `site-header.css` into `dropdown.css` so it is reachable by pages that do not load the header.
  **If you vendored the header markup, add this attribute to its `<select>`** — without it the theme
  console falls back to strips.
- **New `.dropdown-console`** in `dropdown.css` — a cap and the control in one pill, with the
  divider, flat trigger and wrapping focus ring the site header's `.theme-console` has. The header
  keeps its own rules (it also carries lamps, a fixed width and four breakpoints) and ships
  standalone, so the shared parts are duplicated on purpose — change one, change the other.
- **New gallery card**: "Theme picker — capped pill, grouped, dots", a 7th variant under *Select —
  list organizations*, documenting all of the above.
- **Migration.** `themes.index.json` and `tokens.json` theme entries gain `name` / `group` /
  `description`, and **`label` changes value** — `hot-neon-dark-no-background` was
  `"Hot Neon (No Background)"` and is now `"Hot Neon · Dark · No Background"` (it already included
  the mode in the select list; now it is stored that way). Family entries gain `name`; their `label`
  is unchanged. Reading `label` still works everywhere it did.
- **Palette sources** (`tools/palettes/*.mjs`) rename `label` → `name` and `group` → `cohort`. The
  old `group` was the discovery pages' review bucket (`"Faithful · Dark"`), unrelated to the new
  `group`; `cohort` keeps them apart. Fork themes in `local.mjs` need the same two renames — see the
  contract comment at the top of that file. `group` and `description` are optional; `group` defaults
  to the capitalized `mode`.

**The background effect can go on the header and footer now, and applying it is a question rather
than a guess.** Where the retro grid (`.fx-grid`, strength `--fx-grid-opacity`) lands is now Step 0
question 3 of the apply interview: **page background only** (the default, and what every themed repo
does today), **header/footer only**, or **the whole page** — page surface plus both bars. The answer
is recorded in `THEME-SERVICE.md` under "Applied configuration", so a later session can see what was
intended instead of re-deciding. A repo whose log predates the question is read as "page background
only" and left alone.

- **Two bugs made the header/footer answer impossible**, both fixed in the vendored bar CSS:
  - **`site-footer.css`: the lit top tube moved from `.site-footer::before` to `.site-footer::after`**,
    matching the header, which has always drawn its tube on `::after`. `.fx-grid` paints on `::before`
    at `z-index: -1`, and `site-footer.css` loads after `effects.css` — so the tube won on source
    order and the grid rendered nothing on the footer. `::before` is now free on **both** bars. No
    layout or visual change: the tube is absolutely positioned at the top edge either way, and it
    still paints above the grid. The forced-colors `display: none` moved with it.
  - **`site-header.css` gains `.site-header.fx-grid { position: sticky; top: 0; }`.** `.fx-grid` sets
    `position: relative`, same specificity as `.site-header`, so a page that loaded `effects.css`
    last lost its sticky rail as soon as the effect was applied. `0-2-0` wins in either direction.
- Applying `.fx-grid` to an app's **own** header/footer (not these bars) needs the check the apply
  reference now spells out: if the element already uses `::before` or sets `position`, put the class
  on a full-bleed wrapper inside it instead. The rule is *what the surface stands for* — an embedded
  app frame or a full-popup wrapper is a page background in its own right and keeps the class; a card
  on the host page does not.

**The brand lockup is a step larger again, and the nav stops stepping where the brand does.** The
rail's vertical gutter went fluid in 1.1.0, which left the lockup looking small inside a taller
header — worst on a phone, where a tracked 10.5px cap was at the floor of comfortable reading.

- Wordmark **17 / 16 / 15px** and tag **13.5 / 13 / 12px** across `≥621 / ≤620 / ≤430`, wordmark
  larger than tag at every step. `.ftr-wordmark` moves to 17px with it. Tag tracking eases as the
  size grows (`.16em → .13em`, `.13em → .11em`) — the old ratios were tuned for a 10px cap and read
  loose at 13px. Header height is unchanged: the stacked lockup grows to 32.5px, still inside the
  36px the nav pill sets.
- **`.pagenav-seg` no longer steps at 430** — its compact size now covers the whole `≤620` range.
  This is the same non-monotonic failure as 1.1.0's 400→430 move, and the lesson is that moving the
  boundary was never the fix: **two zones stepping on one boundary is.** Together the brand and nav
  wanted ~28px of width for 1px of viewport, and with the Verdana fallback 431–446px wrapped to
  three rows while 430px stayed on two. Separated, 430 carries only the brand's 1px. Costs 6px per
  pill between 431 and 620, where there is slack to spare.
- Measured on both fallback faces, monotonic throughout: one row from 360px (Trebuchet) and 414px
  (Verdana), 106px unwrapped, 144.3px wrapped. Anchors still clear the sticky rail everywhere —
  7.2px at the tightest, the wrapped phone case.
- **Verdana's one-row threshold moved 375px → 414px**, so a 390px iPhone now gets the three-row
  header rather than two. That is the cost of the larger type, taken deliberately: the wrapped
  layout is the designed fallback and stays legible, where the smaller type was not.

## 1.1.0 — 2026-07-31

**The header rail has room to breathe, and it scales.** `.hdr-inner`'s vertical padding was a flat
11px at every width; it is now `clamp(13px, 2.2vw, 22px)` — double the old value once there is a
desktop's worth of width, tapering to 13px on a phone. The taper is the point: the bar is **sticky**,
so every pixel of padding is a pixel of a small screen permanently spent, and below 620px the rail is
already two or three rows tall. A clamp rather than a step per breakpoint so it grows smoothly
instead of jumping 9px at 621px.

- **Side padding is untouched** and stays `clamp(16px, 3vw, 32px)` — that is the shared rail geometry
  lining header content up with footer content, and it is now commented as independent of the
  vertical so the two do not get "tidied" into moving together.
- The `≤620` and `≤430` blocks set **`padding-inline` only**. A padding shorthand there would have
  silently overwritten the vertical clamp and reinstated the hard step. Measured heights: 106px on a
  phone, ramping 107 → 124px across 621–1000px, and 80px on the single-rail desktop layout.
- **`--gal-scroll-margin` moved with it**, which is the part that fails silently. The rail is sticky,
  so an anchor jump that does not clear it puts the heading *underneath* the header with no overflow
  or scrollbar to notice. The `themes/preview.html` override is now a `calc()` off the same clamp so
  it tracks the rail instead of drifting, with steps for the two heights the calc cannot know about:
  the single-rail layout above 1080px, and the **three-row** layout once the page nav wraps below
  430px — a case the old flat 104px never covered either. Verified by actually calling
  `scrollIntoView()` at each width: headings now clear the header by 10–46px everywhere, where before
  they were hidden under it by up to 37px on a narrow phone.
- `gallery/gallery.css`'s default rose 104 → 132px and now says it assumes the shipped header and
  should be overridden per page.

**The mobile header keeps saying which A11Y Way site you are on.** The site header dropped
`.brand-tag` at 620px and all of `.brand-name` at 400px, so on a phone every sibling site rendered
the same wordmark — and under 400px the same bare mark. The tag is the only part of the lockup that
differs between the two sibling sites, so the responsive rules were spending the
*distinguishing* half of the identity to keep the *shared* half. Nothing in the brand zone is hidden
for space any more. Header height is unchanged at every width; no token changed.

- **`assets/site-header.css`** — below 620px `.brand-name` becomes a column: wordmark over tag, mark
  to its left. Stacked, the lockup takes the width of its longer line instead of the sum of both,
  which is what buys the room to keep the tag. It costs no height because `.pagenav` already makes
  that row 36px. `.brand-dot` (a separator for a horizontal lockup) hides; `.brand-tag` picks up the
  `.tc-cap` voice — mono, 10px, tracked out, uppercase — so the header has one treatment for small
  labels. The 400px block no longer hides anything: it steps type and gutters down and keeps both
  lines to 320px.
- **New `.seg-tail`** — below 620px the page nav sheds its redundant word (`Preview Themes` →
  `Preview`; the tag beside it already says "Themes"). **Clipped, not removed**, like `.tc-cap`, so
  the accessible name stays `Preview Themes` at every width. Verified against the a11y tree, not
  `innerText`. The label is wrapped in a **`.seg-label`** so the whole thing is one flex item:
  `.pagenav-seg` is an `inline-flex`, and left as two items the word breaks twice — flex strips each
  item's whitespace (rendering `PreviewThemes`) and the accessible-name algorithm inserts its own
  separator between the blockified items, so a `gap` or `&nbsp;` fix yields a double space in the
  announced name. One item, tail inline, is ordinary text flow.
- **Both pages lost the brand's `aria-label`.** It existed as the fallback name for the widths where
  the words were hidden. With the words always on screen the link names itself from its own content
  (`The A11Y Way Themes`, the separator being `aria-hidden`), so the accessible name can no longer
  drift from the rendered one. Markup change only in `docs/overview.html` and `themes/preview.html`;
  no href changed, so `tools/assemble-site.mjs` string matching is unaffected.
- **The page nav now drops under the brand on its own, with no breakpoint.** Below 620px `.hdr-inner`
  is a wrapping flex row and `.pagenav` is `flex: none`, so it keeps its width and the line breaks
  rather than the pill being crushed. This replaces the old failure: pinned to the right of a `1fr`
  track, the nav overflowed *leftward under the brand* once it outgrew the track — the two silently
  overlapped and no scrollbar ever appeared, so `scrollWidth` reported clean the whole time.
  Critically, the width where that starts depends on the **rendered font**, not the viewport:
  `--font-ui` falls back `"Trebuchet MS"` → `"Segoe UI"` → `Verdana`, and measured, the collision
  moves from 324px on Trebuchet to **364px on Verdana** — so phones were overlapping at 320 *and*
  360 while a Windows browser looked fine, and any px breakpoint would have been tuned to the wrong
  machine. Wrapping asks whether it actually fits, so it is right on untested fonts and widths too.
- Three details make that layout hold, all load-bearing: a generated `.hdr-inner::before`
  (`flex: 0 0 100%`, `order: 3`) forces the break between the two groups, without which "Reduce
  motion" rides up beside the nav from ~520px; `margin-top: -8px` on the switch and console cancels
  the row-gap that break is charged on *both* sides of (a negative margin on the break itself does
  nothing — Chrome floors a flex line's cross size at 0); and `flex: 1 1 0` on the console keeps its
  ~316px content width out of the line-breaking maths, which otherwise pushed it to a fourth row
  under ~420px. `order` is used only to position the break — 1, 2, 4, 5 is DOM order untouched, so
  tab order still matches reading order. Verified reproducing the grid's geometry to the pixel: both
  rows centre on 28 and 72 as before, and the unwrapped header is still exactly 100px.
- **The lockup is a step larger at every width**, and its type ladder now lives on one carrier so
  there is a single place to look for it. The wordmark's size is on `.brand-name` (`.brand-title` and
  `.brand-dot` inherit it, so the separator can never fall out of scale with the words); the tag
  keeps its own because it is a different face. Wordmark **15 / 14 / 13px** and tag
  **12.5 / 11.5 / 10.5px** across `≥621 / ≤620 / ≤430`, wordmark larger than tag at every step.
  `.ftr-wordmark` moves to 15px with it — the two lockups are meant to be the same object. Header
  height is unchanged: the stacked lockup grows to 28.8px, still inside the 36px the nav pill sets.
- **The narrowest breakpoint moved 400px → 430px, and the number is load-bearing.** That boundary
  steps the brand *and* the nav at once — ~28px of extra width for 1px of viewport — so it has to sit
  where the width can pay for it. At 400 it could not once the type grew: with the Verdana fallback,
  401–424px failed to fit the wider pair on one line and wrapped to three rows **while 390px stayed
  on two**. A narrower viewport showing fewer rows reads as a bug, and it caught 414px, a real iPhone
  width. 430px is the widest phone in portrait; measured on both fallback faces the step is
  affordable there, so the discontinuity is gone rather than relocated. Wrap points after the change:
  ≤320px on Trebuchet, ≤375px on Verdana, monotonic from there up on both.
- **Skill docs updated** so sibling sites inherit this on their next sync — `header-footer-anatomy.md`
  (breakpoints, the brand row, the two re-cut traps), `applying-header-footer.md` (the tag is the
  differentiator and is never dropped for space), `page-a11y-checklist.md` (name + tag legible at
  320px; shortened labels must be clipped and name-stable).

**The footer's cross-link to the component library says it is a separate site, and opens in a new
tab.** The index's two products were annotated asymmetrically: this site's row said `● YOU ARE HERE`,
the sibling's row said nothing at all — the only signal that it left the site was an 11px `↗` that is
`aria-hidden` decoration.

- Only the **current** product carries a text label (`.ftr-here`, "You are here"); the sibling is
  marked by the `↗` alone. A deliberate asymmetry — it keeps a second line of type out of the index.
- **`target="_blank" rel="noopener"` on that link only.** `noreferrer` is deliberately omitted — one
  owner runs both sites, and it would strip the only signal that traffic came from the other product.
  "Source on GitHub" stays same-tab on purpose, so the behaviour reads as "this is the other A11Y Way
  site" rather than "this is any outbound link".
- **The warning lives in the accessible name, not in the glyph.** The `↗` says "new tab" only to
  people who can see it, so `.ftr-newtab` carries a clipped "opens in a new tab" — without it the new
  window is unannounced, which is the actual SC 3.2.5 complaint. Announced name is *"Accessible
  Component Library opens in a new tab A reference library of common UI components…"*, read from the
  a11y tree, not `innerText`.
- **No punctuation before "opens", and that is deliberate.** Clipping positions the span absolutely,
  which blockifies it, and the accessible-name algorithm inserts its own space between block boxes —
  a leading comma announces as "Library **,** opens in a new tab". Letting the inserted space be the
  word space makes the name read as one sentence. Same family of trap as the header nav's
  `.seg-tail`, and it is now written into the checklist.
- **Both products renamed and re-described** in the index, on both pages: "Component Guide" →
  **Accessible Component Library**, "Themes" → **Accessible Theming Service**, each with new copy.
  The names are what a visitor is choosing between, so they now say what each thing *is* rather than
  leaning on the family context to carry it.
- Note this is the **only** `target="_blank"` in the repo, and `page-a11y-checklist.md` forbids
  unrequested ones (SC 3.2.5). That item now also carries the recipe for when a new tab *is* asked
  for, so the source no longer contradicts its own audit.

**The footer's lede lies down on tablets and small laptops.** Between 620px and 1080px the footer is
a single column, and the lede kept its column shape there — three stacked rows down the left edge
with most of the rail empty beside them. The narrow measure causing it is inherited from the
two-column layout above 1080px, where it is doing real work; below that it only made the footer tall.

- **`assets/site-footer.css`** — a new `@media (min-width: 621px) and (max-width: 1079.98px)` block
  turns `.ftr-lede` into a full-width band: `flex-direction: row`, `.ftr-mission` drops its `32ch`
  measure and takes the slack, `.ftr-src` loses the 3px optical nudge that centred it under the text
  above.
- **The mission is re-typed inside the band, and only there** — `--font-mono` 12.5px `--text-muted`,
  anchored by a 1px `border-left`. Laying it down was not enough on its own: it kept the treatment it
  earns above 1080px, where it is the lede's hero statement in a narrow column, and on a rail beside a
  13px wordmark and a 12.5px link that made it the loudest thing in the footer with nothing holding
  it. Mono/muted is the voice the system already uses for descriptors (`.tc-cap`, the header's
  `.brand-tag`), so the demotion is a borrow rather than a new idea, and the wordmark is untouched.
  **No new color pair** — `--text-muted` here is already AA-validated by the theme build and
  `.ftr-desc` runs it at this exact size. The rule uses `align-self: stretch` so it spans the band's
  full height instead of one line of text, and it is a real border, not a painted pseudo-element:
  HCM keeps borders and replaces backgrounds, so unlike the footer's other rules it needs no
  `forced-colors` patch — verified resolving to `CanvasText`.
- **Footer vertical padding tightened at every width** — `.ftr-inner` 42/46px → 30/34px with the gap
  34px → 26px, and the phone override 32/36px → 24/28px with gap 28px → 22px. The +4px bottom-heavy
  asymmetry is preserved: the slab ends the page, so an even split reads top-heavy. The horizontal
  `clamp(16px, 3vw, 32px)` is untouched — that is the shared rail geometry that lines footer content
  up with header content, and it is the *only* thing `.ftr-inner` shares with `.hdr-inner` (the
  vertical values are independent, so changing the header's padding needs no footer change).
- Measured on both pages against the pre-band baseline: the footer goes **358px → 222px** in the band
  (lede 136.5px → 32px, mission on one line from ~840px up and two below), **233.5px → 209.5px** at
  ≥1080px and **309.6px → 287.6px** at 620px. Asserted from `getComputedStyle`, not by eye, that the
  re-typing is scoped to the band: at 400, 620, 1080, 1200 and 1440px the mission still computes to
  `--font-ui` at `--text`. No horizontal overflow at any width on either page.
- Reading order is untouched (the three parts run left to right in DOM order), and only the lede
  changes: the index keeps its `auto-fit` grid, so the two products still collapse on their own. The
  `<p>` becomes a flex box to re-centre its text inside the stretched rule box — no markup changed,
  on either page.
- The block lives in the Responsive section at the foot of the file **by necessity, not tidiness** —
  it overrides `.ftr-mission`'s measure cap at equal specificity, so source order is the only thing
  that decides it. Placed beside the other `.ftr-lede` rules it silently does nothing.
- Corrected in `header-footer-anatomy.md` while documenting the band: the footer breakpoint list said
  **880px** split the lede from the index. It has been 1080px.

**One component gallery, rendered by both pages.** `themes/preview.html` and
`discovery/draft-N/index.html` each carried their own hand-maintained copy of the component sheet, in
two dialects, and had drifted: the preview page never got the App-recreation frames or the richer
button/input/tabs cards. Both now render `gallery/gallery.js` + `gallery/gallery.css`, so a card added
once appears on both. No token changed and nothing an app vendors changed behaviour.

- **New `gallery/`** — `gallery.js` (the markup, a classic script exposing `window.ThemeGallery`;
  works from `file://` and under a strict CSP), `gallery.css` (its layout), `README.md` (how to add a
  card or a category). Not vendored by consuming apps.
- `themes/preview.html` now mounts the gallery into `<div id="gallery" data-gallery>` after its page
  head; its own `<style>` keeps only page chrome. It gained the **App recreations** category (plus a
  `.cat-nav` entry) and richer Buttons/Inputs/Surfaces cards. Header and page head are unchanged.
- `discovery/draft-3/` **lost its CSS/JS forks**: it now links `themes/effects.css`,
  `themes/components.css` and `themes/dropdown.{css,js}` directly instead of stale copies under
  `styles/` + `scripts/` (both folders deleted). The discovery page therefore shows exactly what an
  app gets, and finalizing a draft no longer needs a rescoping step.
- `themes/effects.css` derives its glow/grid tokens on `:root, [data-palette]` rather than `:root`
  alone, and its motion-off rules reach `[data-palette]` descendants. Custom properties compute where
  they are declared, so this is what lets one file serve both the app path (`:root` + `theme.css`) and
  the discovery page (a different palette per section, nothing on `:root`). **Inert for consuming
  apps** — no app has a `[data-palette]` attribute.
- **A11y — the discovery page's 96 component regions had 6 names between them.** Every
  `section.cat` was named by its own `<h3>`, so a screen-reader user moving by region heard
  "Typography", "Buttons", … sixteen times over with nothing to say which palette they were in. The
  gallery takes an optional `name` and labels each region **"`<Category>` for `<theme>`"**; discovery
  passes the palette's visible label *and* group (`"Typography for Rink Classic, Faithful · Dark"`)
  because the labels alone repeat — dark and light are each "Rink Classic". `themes/preview.html`
  renders one gallery, so it omits `name` and keeps pointing at its own visible headings.
- Renamed while moving into the shared stylesheet: `.preview` → `.app-preview`,
  `.app-head .title` → `.app-title` (both were too generic for a shared file). They only ever existed
  on the discovery page.
- `tools/assemble-site.mjs` copies `gallery/` into `_site/gallery/` (no link rewrite needed —
  `../gallery/…` resolves the same from `themes/preview.html` and `/preview/`);
  `tools/serve-site.mjs` watches it.

## 1.0.0 — 2026-07-29

**BREAKING** — the dropdown's class names, data attributes and JS global are renamed. Nothing else
changed, and no token was touched.

### What broke

`dropdown.css` + `dropdown.js` arrived in 0.4.0 carrying the naming of the library they were ported
from (**a11y-component-examples**), which made them the only files here using an `ac-` prefix,
`data-ac-*` hooks and a `window.AC` global while `components.css` uses bare `.btn` / `.input` /
`.field`. That prefix exists upstream specifically to avoid colliding with those names, so it had no
reason to travel here.

If you vendored 0.4.0 and use these two files, apply this mapping to your markup and CSS. It is
mechanical and total — there is no behavior change hiding in it:

| 0.4.0 | 1.0.0 |
| --- | --- |
| `.ac-dropdown` | `.dropdown` |
| `.ac-dropdown__toggle`, `__panel`, `__list`, `__option`, `__value`, `__caret`, `__text`, `__primary`, `__secondary`, `__icon`, `__swatch`, `__check`, `__empty`, `__native`, `__group`, `__group-label` | same part names with a single hyphen: `.dropdown-toggle`, `.dropdown-panel`, … |
| `.ac-dropdown--disabled` / `.ac-dropdown--up` | `.dropdown-disabled` / `.dropdown-up` |
| `data-ac-dropdown` | `data-dropdown` |
| `data-ac-anchor`, `data-ac-icon`, `data-ac-swatch`, `data-ac-secondary`, `data-ac-empty-text` | `data-dropdown-anchor`, `data-dropdown-icon`, … |
| `window.AC.createDropdown(el)` | `window.ThemeService.createDropdown(el)` |
| `select._acDropdown` | `select._dropdown` |

`.dropdown` is a **different component** from the long-standing `.drop` in `components.css`, not a
rename of it. `.drop` is unchanged; nothing styles a bare `.drop*` selector.

If you regenerate `theme-select.js` (`npm run build-themes`) you get the new hooks automatically —
the generator emits `data-dropdown-swatch` / `data-dropdown-secondary` and re-enhances through
`window.ThemeService`. A stale hand-copied `theme-select.js` is the failure to watch for: the picker
still switches themes but silently stops rendering swatches.

### Not a drop-in re-copy from upstream any more

Porting an upstream fix now means translating identifiers rather than copying the file. `dropdown.js`
carries the full mapping in its header, and both it and `themes/README.md` no longer claim the
line-for-line parity they used to — that claim was false the moment the names changed.

### Also in this release

- **Fix** — `-webkit-user-select` added to the trigger. Without it, a slow double-click in Safari
  selected the value text instead of reopening the panel.
- `forced-color-adjust: none` in the forced-colors block is documented as a deliberate false-positive
  for linters that flag it as Safari-unsupported: the whole `@media (forced-colors: active)` block
  never matches in Safari, and removing the property would break the focused-row cue on Windows
  High Contrast.
- `npm run release` refuses to run on a dirty tree (it commits only `VERSION` + `CHANGELOG.md`, so it
  was able to tag a commit that did not contain the work), requires `--note`, and confirms the bump
  rule and version transition before writing. `--allow-dirty` and `--yes` override.

## 0.4.0 — 2026-07-29

Themed dropdown component, plus `--glow-strength` finally applying per theme.

- **New `themes/dropdown.css` + `themes/dropdown.js`** — a progressively enhanced `<select>`,
  styled entirely from tokens. Supports plain / icon / color-swatch / secondary-text / grouped
  (`<optgroup>`) / empty / disabled lists via `data-ac-*` attributes on the markup. Additive and
  opt-in: without the script a plain `<select>` still renders and still works, so vendoring these
  two files is optional. The site header's theme picker now uses it.
- **Fix — `--glow-strength` was pinned to `1` for every theme.** `effects.css` declared it inside a
  `:root` block as a fallback for being loaded without `theme.css`. `:root` and `[data-theme="…"]`
  have identical specificity, and every page loads `effects.css` second, so the fallback won on
  source order and the 8 light themes' `0.35` had never taken effect. Now declared as
  `:where(:root)`, which loses to any theme.
  **Visible change for consuming apps:** every glow built on `effects.css` (headings, borders,
  fills, scrollbar) is dialed back on the **light** themes — which is what those themes always
  specified. Dark themes render identically. No token values changed, so AA results are unchanged.
- `tools/build-palettes.mjs` now emits `--glow-strength` per palette, so the discovery pages gate
  glow the same way the built themes do.
- `themes/preview.html` reorganized into component categories (`section.cat` > `.cat-grid` >
  `.block`), and `discovery/draft-3` rebuilt on the same system so a component designed on one page
  drops into the other unchanged.
- `discovery/draft-3` contrast report regenerated: it was stale at **19** pairs per palette against
  the checker's **26** (the `--bg-elevated` pairs added for the dropdown panel were missing from the
  committed data). All 16 themes remain **AA at 26/26**.

## 0.3.0 — 2026-07-24

Forkable/updatable service: fork-local themes (local.mjs), conflict-free upstream sync (update-from-origin) with opt-in built-ins, two install modes, and release tagging. Generated theme files are now build output (gitignored). No consuming-app token changes.

## 0.2.0 — 2026-07-23

Per-theme background strength + "(No Background)" variants.

- New per-theme token **`--fx-grid-opacity`** controls the retro checkerboard backdrop
  (`0` = off, `0.22` = subdued default, `0.40` = pronounced). `effects.css` now reads it:
  `.fx-grid::before { opacity: var(--fx-grid-opacity, 0.22) }`.
- **6 new themes (16 total)** — "(No Background)" variants (grid off, solid bg) for:
  `rink-classic-{dark,light}`, `midnight-arcade-{dark,light}`, `hot-neon-dark`, `acid-arcade-light`.
  Ids follow `<family>-<mode>-no-background`.
- The three faithful **dark** themes (`rink-classic-dark`, `midnight-arcade-dark`, `hot-neon-dark`)
  now render a **more pronounced grid (0.40)** — a small visual change if the app uses `.fx-grid`.
  All other themes unchanged. No color/token-value changes → AA results identical.
- Sourced from `discovery/draft-3`. Additive — new themes appear automatically in data-driven
  selectors (`theme-select.js` regenerated with all 16) after the update flow.

## 0.1.1 — 2026-07-23

Selector integration hardened for strict-CSP / Manifest V3 contexts.

- Added **`themes/theme-init.js`** and **`themes/theme-select.js`** — external, CSP-safe helper
  scripts. `theme-init.js` applies the saved/`?theme=` theme before first paint; `theme-select.js`
  (generated with the theme list baked in) populates and wires any `<select data-theme-select>` and
  `[data-motion-toggle]`, persisting to `localStorage`.
- Skill (`applying-themes.md`) rewritten to use external scripts and warn that **inline scripts are
  blocked by MV3/strict CSP** (a theme dropdown silently failing to populate is the tell). Verification
  now requires testing in the real runtime, not just a `file://` preview.
- No token/theme value changes — purely additive; safe update for all apps.

## 0.1.0 — 2026-07-23

Initial finalized release.

- **10 themes** across 5 families × dark/light: Rink Classic, Midnight Arcade, Hot Neon,
  Synthwave Sunset, Acid Arcade.
- **Default:** Rink Classic — dark on `:root`, auto-light via `prefers-color-scheme`.
- `themes/theme.css`, `tokens.json`, `themes.index.json`, `effects.css`, `components.css`,
  `preview.html` — generated from `tools/palettes/draft-2.mjs` via `tools/build-final.mjs`.
- All color pairs validated WCAG AA 2.2 (contrast, focus/hover/active/disabled/expanded states,
  motion-off two ways).
- Distribution: Claude skill (`skill/`) + `AGENTS.md` + installers (`install/`); standalone WCAG
  contrast checker (`tools/contrast-checker/`).
