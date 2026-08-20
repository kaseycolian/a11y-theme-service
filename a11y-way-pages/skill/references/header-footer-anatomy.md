# Anatomy of the header, footer and brand assets

What the furniture is made of, so you can **rebuild** it in a repo whose stack looks nothing like the
source rather than copy-pasting markup that doesn't fit. Read this before Path B or Path C in
`applying-header-footer.md`.

Everything here is plain CSS custom properties and classic scripts. No framework, no build step, no
dependencies, no inline JS.

---

## The token contract

Both pieces consume only these, and define none of them. If the target repo has them, the furniture
works; if it doesn't, stop and run the **`theme-service` skill** first.

| Role | Tokens | Comes from |
|---|---|---|
| Surfaces | `--bg` · `--bg-panel` · `--bg-elevated` | `theme.css` |
| Text | `--text` · `--text-muted` | `theme.css` |
| Lines | `--border` · `--border-strong` | `theme.css` |
| Focus | `--focus-ring` | `theme.css` |
| Accents | `--accent-pink` · `--accent-green` · `--accent-blue` · `--accent-purple` (+ `--on-*`) | `theme.css` |
| Glow scale | `--glow-strength` (1 dark / ~0.35 light) | `theme.css` |
| Motion gate | `--motion` (1 or 0) · `--dur` | `effects.css` / `components.css` |
| Ready-made glows | `--bglow-blue`, `--tglow-*`, … | `effects.css` |
| Type + shape | `--font-ui` · `--font-mono` · `--radius` · `--radius-sm` · `--radius-pill` | `components.css` |

**If a repo doesn't vendor `components.css`** (a component library reasonably won't — it would collide
on class names), the shape/type tokens are missing. Check whether the repo defines the same names
itself before assuming they're absent; `a11y-component-examples` does exactly this in
`src/library/tokens/tokens.css`. If they genuinely aren't there, define the seven of them once in the
furniture's own stylesheet with the same names and semantics — never rename them.

**Theming mechanism:** `data-theme="<id>"` on the root element selects a theme; absent falls back to
`:root` (Rink Classic dark, auto-light under `prefers-color-scheme: light`). `data-motion="off"` on
the root disables animation. Both are set pre-paint by the external `theme-init.js`.

---

## Header — four zones, always in this DOM order

```
brand ....... who this is        (identity)
page nav .... where you are      (a two-stop segmented control)
motion ...... a preference       (quiet, lowest priority)
theme ....... the product itself (loudest, always reachable)
```

The responsive rules only ever **re-flow** these four, never reorder them, so tab order always matches
reading order (SC 2.4.3). Reference markup: `a11y-way-pages/site/overview.html` and
`a11y-way-pages/site/preview.html` — byte-identical except which `.pagenav-seg` carries
`aria-current="page"`. Styles: `a11y-way-pages/assets/site-header.css`.

| Part | Class | What it must keep |
|---|---|---|
| Skip link | `.skip-link` | **First element in `<body>`.** Off-screen via `transform`, not `display:none` — it must be focusable. Targets `#main`. |
| Rail | `.site-header` | `position: sticky; top: 0`. Glass surface. The lit tube is a `::after` on the **bottom** edge. |
| Inner | `.hdr-inner` | `max-width: 1600px`, `padding: clamp(13px, 2.2vw, 22px) clamp(16px, 3vw, 32px)`, flex row. **The two gutters are independent.** Vertical is the rail's breathing room and *must* taper — the bar is sticky, so every pixel is permanently spent on a small screen, and below 620px the rail is already two or three rows. Horizontal is the shared geometry that lines header content up with footer content (`.ftr-inner` carries the identical clamp) — do not change one because you changed the other. The responsive blocks below set **`padding-inline` only**; a shorthand there would silently overwrite the vertical clamp and put a hard step back at 621px. |
| Brand | `.brand` > `.brand-mark` + `.brand-name` (`.brand-title` + `.brand-dot` + `.brand-tag`) | An `<a>` with **no `aria-label`** — the wordmark and tag are on screen at every width, so the link names itself from its own text and the accessible name can never drift from the rendered one. The `<img>` is `alt=""` so the mark isn't announced twice. Only add an `aria-label` if you hide the words at some width, which this header deliberately does not. |
| Page nav | `.pagenav` > `.pagenav-seg` | `<nav aria-label="Pages">`. The current page is a `<span>` with `aria-current="page"`, **not** a link. Current state is a lifted chip + full-contrast text, never color alone. |
| Motion | `.motion` (uses shipped `.switch`) | A real `<label>` wrapping a real checkbox with `[data-motion-toggle]`. Keeps the 44×24 switch geometry. |
| Theme console | `.theme-console` > `.tc-cap` + `.tc-lamps` + `<select data-theme-select>` | A `<div>`, **not** a `<label>` — once `dropdown.js` enhances it the real control is a `<button>`, which a wrapping label would neither name nor focus. `.tc-cap` is the accessible name via `aria-labelledby`, so below 620px it is **clipped, not `display:none`** — a name pointing at a hidden element resolves to nothing. The `<select>` also carries `data-dropdown-swatch-style="dots"`, which swaps the dropdown's default swatch strip for circles matching the `.tc-lamps` next to it — **copy that attribute**, it lives in `themes/dropdown.css`, not in `site-header.css`, so a header without it silently falls back to strips. |

Breakpoints: **1080px** two-row grid (`brand | nav` / `motion | theme`), **620px** the rail switches
to a wrapping flex row, the brand lockup stacks (wordmark over tag) and both the console's cap and
the nav's `.seg-tail` are clipped, **430px** one step down in type and gutters.

**The lockup's type ladder** lives on two selectors and steps at those same widths. The wordmark's
size is on `.brand-name` — `.brand-title` has no `font-size` of its own and inherits it, as does
`.brand-dot`, so the separator can never fall out of scale with the words it separates. The tag
carries its own size because it is a different face. The wordmark stays the larger of the two at
every step:

| | ≥621px | ≤620px | ≤430px |
|---|---|---|---|
| wordmark (`.brand-name`) | 17px | 16px | 15px |
| tag (`.brand-tag`) | 13.5px | 13px | 12px |

`.ftr-wordmark` in `site-footer.css` copies the 17px verbatim so the header and footer lockups stay
the same object — **move them together.**

The steps are shallow by design. The rail's vertical gutter is fluid, so the header is tall enough
that small type reads as lost in it rather than compact, and the phone end suffers most — the tag is
the thing that goes unreadable first.

**Never let two zones step on the same boundary.** This is the rule that keeps the header monotonic,
and it is the one that has broken twice. When the brand and the nav both grew at 400px, that boundary
wanted ~28px of extra width in exchange for 1px of viewport, and with the Verdana fallback 401–424px
could not pay it: those widths wrapped to three rows while 390px stayed on two. Moving the boundary
to 430 bought room but kept both steps together, so raising the type again reproduced it exactly at
431–446px. The fix is not a bigger number — it is separating the steps. **The nav now holds its
compact size across the whole ≤620 range and does not step at 430 at all**, leaving that boundary to
the brand's 1px, which any width can afford. Verify by walking the ladder on both fallback faces and
checking the row count only ever falls as the viewport grows.

**The nav drops under the brand on its own, with no breakpoint.** Under 620px `.hdr-inner` is
`display: flex; flex-wrap: wrap`, and `.pagenav` is `flex: none` so it keeps its content width and
the LINE breaks instead of the pill being crushed. This is not a stylistic preference. In the grid
the nav is pinned to the right of a `1fr` track, so once its content outgrows the track it overflows
**leftward, underneath the brand** — the two silently overlap and no scrollbar ever appears to report
it. The width where that starts is a function of the rendered font, not the viewport: `--font-ui`
falls back `"Trebuchet MS"` → `"Segoe UI"` → `Verdana`, and measured, the collision moves from 324px
on Trebuchet to 364px on Verdana. Any px breakpoint picked on a Windows machine is therefore wrong on
the phones that need it most. Wrapping asks the real question — *does this fit?* — so it is correct
on fonts and widths nobody tested. Same reasoning as the footer index's auto-fit grid.

Three things hold that layout together, and all three are load-bearing:

- **A generated line break.** `.hdr-inner::before` with `flex: 0 0 100%` and `order: 3` forces the
  break between the two groups (`brand | nav`, then `motion | theme`). Without it the wrap is greedy
  and "Reduce motion" rides up beside the nav from ~520px, which is a different header rather than a
  narrower one. `order` is used **only** to slot this break in: 1, 2, 4, 5 is DOM order untouched, so
  tab order still matches reading order. A `::before` with no `content` generates nothing, so it must
  stay inside this query or it becomes a phantom cell in the grid above.
- **`margin-top: -8px` on the motion switch and the console.** That break is a real flex line, and
  `row-gap` is charged on *both* sides of it — 16px between the groups, and a rail 8px taller than it
  has always been. A negative margin on the break itself cannot fix this: Chrome floors a flex line's
  cross size at 0, so the line simply refuses to shrink. On the two items it works, because their
  line stays positive. Give both the **same** value: for margin-top `m` in a line of cross size `L`,
  an item's content centre lands at `(L + m) / 2` — no height term, so equal margins keep items with
  different heights on one centre line. Verified reproducing the grid's geometry to the pixel.
- **`flex: 1 1 0` on the console**, not `auto`, plus `width: auto` to cancel the 1080px block's
  `width: 100%`. Lines break on the flex *basis*, before any shrinking, so a content-sized console
  asks for ~316px, fails to fit beside the switch under ~420px, and takes a fourth row on exactly the
  phones with the least height to spare. From 0 it always fits, then grows into what the switch
  leaves — which is what the `1fr` track did.

**Nothing in the brand zone is ever hidden for space.** Sibling A11Y Way sites share a mark and a
wordmark, so the tag beside the name is the only thing that says which site you are on — it has to
survive the width where a visitor has the least other context. Stacking is what pays for it: the
lockup then takes the width of its longer line instead of the sum of both, and it costs no height
because the nav pills already make that row 36px tall. Below 620px the page nav also sheds its
redundant word (`Preview Themes` → `Preview`) via `.seg-tail`, which is **clipped, not removed**, so
the link's accessible name stays `Preview Themes` at every width.

Two traps if you re-cut this. `.brand-name` aligns on the **baseline** as a row; restate
`align-items: flex-start` when it becomes a column or the two lines centre on each other.

And `.pagenav-seg` is an `inline-flex`, which is why the label is wrapped in a `.seg-label` that
looks redundant and is not. Put the text and `.seg-tail` directly in the segment and they are **two
flex items**, which breaks the word twice: flex strips each item's leading and trailing whitespace,
so the words render welded (`PreviewThemes`), and the accessible-name algorithm then inserts its own
separator between the two blockified items — so patching the first problem with a `gap` or an
`&nbsp;` buys a **double space in the announced name**. One flex item, tail inline inside it, is
ordinary text flow: the space is just a space, in the DOM, on screen, and in the accessible name.
Verify by reading the a11y tree, not `innerText` — `innerText` shows clipped text as present and
hides this class of bug entirely.

**The one `target="_blank"` in the source.** The sibling-site cross-link opens in a new tab; nothing
else does, deliberately — including "Source on GitHub" in the lede, which is also outbound. Attaching
the behaviour to *that one link* keeps it meaning "this is the other A11Y Way site" rather than "this
is any outbound link", so do not "fix" the GitHub link for consistency. It carries `rel="noopener"`
(explicit, for engines that do not imply it) but **not** `noreferrer`: one owner runs both sites, and
stripping the referrer would throw away the only signal that traffic came from the other product.
See the Links section of `page-a11y-checklist.md` for what a requested new tab has to carry.

**If you change the header's height, one value downstream moves with it.** The rail is sticky, so any
in-page anchor needs a `scroll-margin-top` that clears it or the heading lands underneath — silently,
with no scrollbar or overflow to notice. In this repo that is `--gal-scroll-margin`
(`gallery/gallery.css` default, overridden in `a11y-way-pages/site/preview.html`), and the override is written as
a `calc()` off the same clamp so it follows the rail instead of drifting out of date. Remember the
rail has three heights, not one: single row above 1080px, two rows below it, and **three** once the
page nav wraps on a narrow phone. Verify by actually calling `scrollIntoView()` and measuring where
the heading lands relative to the header — comparing numbers by eye misses the wrapped case.

**Adapting the header.** The page nav assumes a small number of top-level pages. A repo with many
pages, or one that already has real navigation, should keep its own and take only the brand, motion
and theme zones — ask, don't assume (question 4 of the brand interview).

---

## Footer — two zones

```
lede ........ who this is, why it exists, where the code is  (a masthead)
index ....... the products, cross-linked                     (a nav)
```

Reference markup: same two pages, byte-identical. Styles: `a11y-way-pages/assets/site-footer.css`.

**No boxes.** This is the rule that keeps the footer from reading as a generic card tray. The header
is a rail of type and one lit edge; the footer is drawn to the same brief so the two bracket the page
as one frame. Structure comes from **rules and space** — the 2px tube along the top, and a 1px rule
above each product. Nothing here has a panel background, a border box or a chip. If a target's brand
genuinely wants cards, that's a deliberate deviation to record in `A11Y-WAY-PAGES.md`, not a default.

| Part | Class | What it must keep |
|---|---|---|
| Slab | `.site-footer` | Direct child of `<body>` = the page's **one** `contentinfo`. Not sticky. Lit tube is a `::after` on the **top** edge — `::after` like the header's, so `::before` stays free for `.fx-grid`. |
| Inner | `.ftr-inner` | Same `max-width` and `clamp()` padding as `.hdr-inner`, so footer content lines up with header content at every width. One column; two at **1080px** (`minmax(240px, 330px)` lede + `1fr` index) — the same width the header drops to two rows, and the width below which the index no longer has room to run two products beside a 330px lede. |
| Lede | `.ftr-lede` > `.ftr-brand` + `.ftr-mission` + `.ftr-src` | The lockup restated, **not as a link** — the header's already goes home, so a second one only adds a tab stop to the same destination. A column at the two extremes and a full-width **band** between 621px and 1080px, where the column shape would waste the rail — see the band note below. |
| Lockup | `.ftr-brand` > `img.brand-mark.ftr-mark` + `.ftr-wordmark` | Keep the `brand-mark` class: `brand-mark-theme.js` re-colors every `img.brand-mark` on the page. `.ftr-mark` sizes and lights it locally so this file stands alone. Wordmark repeats `.brand-title`'s size, weight and tracking verbatim. |
| Mission | `.ftr-mission` | Outside the band, the only prose here set in `--text` and a step larger than the descriptions — it is the reason the site exists, so it outranks the index rather than being filed into a meta bar. **Inside the band it is demoted to a mono, muted descriptor**, because there its role is different; see the band note below. |
| Source | `.ftr-src` | Tertiary, so no button and no pill — a labelled mark with `min-height: 32px` to clear SC 2.5.8. The glyph picks up a `drop-shadow` glow on hover, the one place the footer borrows the header's glow rather than its rules. |
| Index | `.ftr-family` | A `<nav>` with an `aria-label` and **no visible caption**: the lede beside it is the visible name, so a third label over two items is furniture. Never a heading — the furniture must not add entries to the host page's heading outline. |
| Rows | `.ftr-links` > `li` > `a.ftr-link` | CSS grid, `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`. The `min(…, 100%)` is what stops a 320px viewport overflowing — keep it. |
| The row rule | `.ftr-link::before` | 1px, `top: 0`, fading out over the last third. **This is the hover affordance** — see idiom 2 below. |
| Current product | `a.ftr-link[aria-current="true"]` + `.ftr-here` | `aria-current="true"`, not `"page"`: this marks the current item **in a set** (the product you're inside), which stays true across every page of that site. Its rule sits half-lit at rest, and "You are here" is real text beside a lit dot — never color alone. |
| New-tab warning | `.ftr-newtab` | Clipped, not `display:none` — **only** on a link that really opens a new tab. The `↗` beside it is `aria-hidden`, so without this the new window is announced to nobody and you have the SC 3.2.5 problem the arrow looked like it solved. No punctuation in front of it: clipping positions it absolutely, which blockifies it, and the accessible-name algorithm inserts its own space between block boxes — a leading comma announces as "Library **,** opens in a new tab". Let that inserted space be the word space. |
| External marker | `.ftr-ext` | An `aria-hidden="true"` glyph beside the name. The link text already names the destination, so it adds nothing to announce. Only the **current** product carries a text label (`.ftr-here`); the other is marked by this glyph alone — a deliberate asymmetry that keeps a second line of type out of the index. |

Breakpoints: both grids collapse on their own; **1080px** splits lede from index (same width the
header goes two-row), **621–1080px** lays the lede down as a band, **620px** tightens the rail,
**400px** steps the name size down. No breakpoint does the *index's* column collapse — that's
deliberate, so the footer survives container widths nobody anticipated.

**The lede band (621–1080px).** Below 1080px the footer is one column, and a lede left in its column
shape is three stacked rows down the left edge with most of the rail empty beside them — its narrow
measure is inherited from the two-column layout above 1080px, where it earns its keep, and is dead
weight here. In this range `.ftr-lede` goes `flex-direction: row`, `.ftr-mission` drops its
`max-width` and takes the slack, and `.ftr-src` loses its 3px optical nudge (that offset centres it
under the text above; in a row it just knocks the link off the centre line). Worth ~93–105px of
height on the exact viewports laptops and tablets use. Reading order is unchanged — the three parts
run left to right in DOM order. Only the lede lies down; the index keeps its auto-fit grid, so this
is a change of proportion, not of structure.

**Treatment follows role, not element.** The mission is also *re-typed* inside the band, and this is
the reasoning worth copying rather than the values. Above 1080px it is the lede's hero statement in a
narrow column, so `--text` at 14.5px is right. In the band it is a descriptor on a rail beside a 13px
wordmark and a 12.5px link, and that same treatment makes it the loudest thing in the footer, floating
mid-rail with nothing holding it. So in the band only it becomes `--font-mono` 12.5px `--text-muted`
— **the voice this system already uses for descriptors** (`.tc-cap`, `.brand-tag`), which is what
buys the separation without touching the wordmark. It is anchored by a 1px `border-left` on the
mission with `align-self: stretch` so the rule spans the band's full height rather than one line of
text; an inner `display: flex; align-items: center` re-centres the words in that taller box. Use a
real border, not a painted pseudo-element — HCM replaces backgrounds but keeps borders, so this rule
needs no `forced-colors` patch the way the footer's other rules do. Verified: it resolves to
`CanvasText` under HCM automatically.

Two constraints on any retune. **No new color pair** — `--text-muted` on this surface is already
AA-validated by the theme build (`.ftr-desc` runs it at this exact size); introducing an accent as
small text is contrast-bound on the light themes. And mono is wider than the UI face, so the mission
holds one line only from ~840px up; dropping to 12px moves that to ~805px if the two-line range
bothers you.

That block **must sit after `.ftr-mission`'s base rule** — it overrides the measure cap at equal
specificity, so source order is the only thing deciding it. Put it in the Responsive section at the
foot of the file, not beside the other `.ftr-lede` rules, or it silently does nothing.

---

## The five shared idioms

Copy these, in whatever syntax the target uses. They're what make the two pieces read as one system.

**1. Glass surface** — flat first so an engine without `color-mix()` keeps an opaque panel:
```css
background: var(--bg-panel);
background: color-mix(in srgb, var(--bg-panel) 88%, transparent);
-webkit-backdrop-filter: blur(10px) saturate(1.15);
backdrop-filter: blur(10px) saturate(1.15);
```

**2. The lit tube, at two sizes** — a 2px pink→purple→blue ramp with a glow that scales with the
theme. The header draws it on its bottom edge at `90deg`; the footer mirrors it to its top edge at
`270deg`, so the two bracket the page. Same mirroring `effects.css` uses for
`.fx-bar-top`/`.fx-bar-bottom` (135°/315°). It re-colors with the theme, which makes it a readout as
well as a rule.

Both bars draw the tube on **`::after`**, not `::before` — deliberately. `::before` is left free on
`.site-header` and `.site-footer` so `effects.css`'s `.fx-grid` can compose straight onto them when
the user wants the background effect on the header and footer. `.fx-grid` paints its backdrop on
`::before` at `z-index: -1`; put a tube there and it wins on source order, and the grid silently
never renders. Keep any new full-bleed decoration on the bars off `::before` for the same reason.
`.fx-grid` also sets `position: relative`, which is why `site-header.css` carries a
`.site-header.fx-grid { position: sticky }` guard — without it the rail stops sticking whenever
`effects.css` loads last.

The footer then repeats the idea one size down, as the thing each product reacts to — this is the
whole hover affordance, and the reason the rows need no card:

```css
.ftr-link::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: var(--border);                                  /* flat fallback */
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--border-strong) 45%, var(--border)) 62%, transparent);
  transition: background var(--dur) ease, box-shadow var(--dur) ease;
}
.ftr-link[aria-current]::before {   /* half-lit at rest — MUST precede :hover */
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--accent-blue) 45%, var(--border)) 62%, transparent);
}
.ftr-link:hover::before, .ftr-link:focus-visible::before {
  background: linear-gradient(90deg, var(--accent-blue) 62%, transparent);
  box-shadow: 0 0 calc(9px * var(--glow-strength))
              color-mix(in srgb, var(--accent-blue) 60%, transparent);
}
```

Two details that are easy to lose. The rule **fades out** rather than stopping square: the track is
wider than the text over it, so a full-bleed rule advertises the empty half, and the fade gives the
lit state somewhere to go. And the `[aria-current]` rule must come **before** the hover rules —
they're the same specificity, so source order is what lets hover win on the current item.

**3. Focus ring** — `outline: 3px solid var(--focus-ring); outline-offset: 2px` on `:focus-visible`.
Never removed, never replaced with a box-shadow that a forced-colors mode would drop.

**4. Motion gating** — every transition duration is `var(--dur)`, which is
`calc(var(--motion) * 0.15s)`. `--motion` goes to 0 under `[data-motion="off"]` **and** under
`prefers-reduced-motion`, so both the in-page toggle and the OS setting collapse animation for free.
Never write a raw `0.15s`.

**5. Forced colors** — anything drawn with a `background` disappears in Windows High Contrast, because
HCM replaces backgrounds with system colors. Every such boundary needs a `CanvasText` outline or
border putting it back:
```css
@media (forced-colors: active) {
  .site-footer { border-top: 1px solid CanvasText; }
  .site-footer::after { display: none; }    /* the tube is a background; it's gone anyway */
  .ftr-link::before { display: none; }      /* and so is every row rule */
  .ftr-link { border-top: 1px solid CanvasText; }
  .ftr-here::before { outline: 1px solid CanvasText; outline-offset: -1px; }
}
```
This one bites harder in a footer built from rules than in one built from cards: **every** boundary
the index has is a painted 1px background, so without the swap the whole structure vanishes and the
two products run together. Outlines rather than borders where the box geometry matters — they sit
outside the box, so the spacing the glow and gaps were tuned around is untouched.

---

## Contrast strategy — why accents never carry text

Accent colors as **small text** are contrast-bound on the light themes (see the source repo's
`skill/references/adding-a-theme.md`). So:

- Text is `--text` or `--text-muted` only. Both are AA-validated against every surface by the theme
  build, so **using them introduces no new color pair to check**.
- Accents appear on **borders and glows**, which need 3:1 rather than 4.5:1.
- Hover therefore changes the border, the glow and the underline — never the text color. That also
  keeps every state signal from being carried by color alone.

Follow this and the furniture inherits the theme build's validation instead of needing its own. Break
it and you must run `tools/contrast-checker/` against every theme the repo offers.

---

## Brand assets

Two SVGs, each with a sibling script that re-colors it per theme.

| File | What it is |
|---|---|
| `a11y-way-pages/assets/brand-mark.svg` | The 'A' bridge lockup mark, 200×200. Strokes read `var(--accent-pink)` / `var(--accent-green)` with brand-color fallbacks baked in, so the file also stands alone. |
| `a11y-way-pages/assets/brand-mark-theme.js` | Re-colors the header mark. Loaded `defer` from `<head>`. |
| `a11y-way-pages/assets/favicon.svg` | The tab icon. Uses its own `--a11y-theme-*` properties. |
| `a11y-way-pages/assets/favicon-theme.js` | Re-colors the favicon. Loaded `defer` from `<head>`. |

**Why the scripts exist:** a browser renders an `<img>` and a favicon in an **isolated document**, so
the page's custom properties never reach them and the baked-in fallbacks always win. Each script reads
the resolved tokens off `<html>`, stamps them onto a copy of the SVG, and hands over a `data:` URI.
Both re-run on `data-theme` changes via a `MutationObserver`.

**Why `<img>` and not `<svg><use href="brand-mark.svg#brand-mark">`:** an external `<use>` is a
cross-origin reference that browsers block on `file://` — the mark then renders as nothing at all.
Both source pages are meant to open from disk. In a repo that is **always served over http**, inlining
the SVG is better: it follows the theme with no JS at all, and you can drop `brand-mark-theme.js`.
Decide this per repo and record which you chose.

**Both scripts are progressive enhancement.** The static `<link rel="icon">` and the plain `<img>`
already show the marks in brand colors; the scripts only upgrade them. Any failure (CSP, `file://`
fetch block, parse error) degrades to the static asset.

**CSP note:** the generated icon and mark are `data:` URIs, so a strict policy needs `img-src data:`.
Both scripts are external files — nothing here is an inline script.

**A repo with its own logo** keeps it. Take the *treatment* (the size, the glow filter, the hover lift,
the `alt=""`-plus-labelled-link pattern) and point it at their asset. Ask first — question 2.

---

## Browser and device support

Every flourish is decorative and has a fallback. Non-negotiable: **320px to ultrawide, no horizontal
scroll; reflow at 200% and 400% zoom; Chromium, Gecko and WebKit.**

| Feature | Status | Without it |
|---|---|---|
| Custom properties, `clamp()`, flex, grid | universal | — |
| `color-mix()` | widely available since 2023 | declare a flat color first; the surface goes opaque |
| `backdrop-filter` | needs the `-webkit-` prefix for Safari — always pair them | surface is opaque; nothing lost |
| `@media (forced-colors)` | Chromium + Firefox | Safari has no HCM; normal styles already meet contrast |
| `:has()` | Baseline 2023 | used by the header's theme console only. The footer avoids it entirely |
| `MutationObserver`, `fetch`, `DOMParser` | universal | the static SVGs stand as-is |

Verified on the source pages with real engines: Chromium, Firefox, WebKit desktop, and WebKit at
390×844 (iPhone).
