# gallery/ — the component gallery, one copy

The gallery is the component sheet you see on the theme preview page and on the palette discovery
page. Both render **this** template. There is no second copy to keep in step.

| File | What it is |
|------|------------|
| `gallery.js` | The markup. Classic script (no ESM, no fetch, no deps) → works from `file://` and under a strict CSP. Exposes `window.ThemeGallery`. |
| `gallery.css` | The gallery's own layout furniture, written against theme tokens only. |

Neither file is part of what a consuming app vendors — the *components* inside the cards are, and
those live in `themes/components.css` + `themes/effects.css`. Nothing here carries a color.

## The three levels, and only three

```
<host>  >  section.cat  >  .cat-grid  >  .block
```

A **category** is a kind of component (Typography, Inputs, …). A **block** is one component card.

- **Add a component:** add a `.block` inside the right `.cat-grid` in `gallery.js`. No CSS, no layout
  work — `.cat-grid` is `auto-fit` + `minmax`, so it picks its own column count.
- **Add a category:** add one `cat('<slug>', 'Title', 'Note', \`…\`)` entry in `gallery.js`, then one
  `<a href="#cat-<slug>">` line in the host page's `.cat-nav`. The section id, accessible name
  and heading rank come from the `cat()` helper, so they can't drift.
- Both pages pick the change up on reload. There is no build step.

## The API

```js
ThemeGallery.html({ sfx, heading, name, swatches })  // -> the six <section class="cat"> blocks
ThemeGallery.SPRITE                                  // the <svg class="sprite"> symbol library
ThemeGallery.mount(hostEl)                           // hostEl.innerHTML = SPRITE + html(...)
```

| Option | Why it exists |
|--------|---------------|
| `sfx` | Suffix for every `id` / `for` / radio `name` and the in-page anchors. `''` on a page with one gallery; the palette id on the discovery page, where 16 copies share one document and duplicate ids would break both `<label for>` and the dropdown's `aria-labelledby`. |
| `heading` | Rank for `.cat-title`; `.sub-head` follows at `heading + 1`. `2` where the page `<h1>` is the page title (preview), `3` where an `<h2>` already names the palette (discovery). |
| `name` | The theme this copy renders. Given, each region is labelled **"`<Category>` for `<name>`"** (`aria-label="Typography for Rink Classic"`); omitted, the region points at its own visible heading (`aria-labelledby`). Discovery passes the palette label for the same reason it passes `sfx`: twenty regions all called "Typography" give a screen-reader user nothing to navigate by, and the visible heading can't spell the theme out because the palette's `<h2>` already does that on screen. A single-gallery page should omit it — matching the visible heading is the stronger option whenever it's unambiguous. |
| `swatches` | `"#hex,#hex,#hex,#hex"` for the accent-swatch card. The only content that legitimately differs per page: discovery passes the palette it is sitting in (a fixed set of hexes would look identical in all 20 sections and prove nothing), preview falls back to the built-in theme families. |

The **Theme picker** card (the 7th select variant) takes no option — its list is a static two-family
subset hardcoded in `gallery.js`, identical on both pages. The real list is generated into
`themes/theme-select.js` from `themes.index.json`, but this file has to run from `file://` on the
discovery drafts where nothing can read that JSON, and the card is demonstrating a *picker* — several
themes side by side is the point, so there is nothing per-page to substitute the way `swatches` does.
It is a specimen: picking a row does not change the page theme.

## The two call sites

**`a11y-way-pages/site/preview.html`** — declarative. A host div right after `.page-head`, and the script after it:

```html
<div id="gallery" data-gallery data-gallery-heading="2"></div>
…
<script src="../gallery/gallery.js"></script>
<script src="dropdown.js"></script>
```

`gallery.js` mounts every `[data-gallery]` (reading `data-gallery-heading`, `data-gallery-suffix`,
`data-gallery-name`, `data-gallery-swatches`) as soon as it runs, and again on `DOMContentLoaded` if the host wasn't parsed
yet — `mount()` is idempotent. **Load it before `themes/dropdown.js`** either way: that script
enhances `[data-dropdown]` on its own `DOMContentLoaded` pass, and this ordering guarantees the
gallery's seven selects are in the DOM by then.

**`discovery/draft-N/index.html`** — imperative, once per palette:

```js
main.insertAdjacentHTML('afterbegin', ThemeGallery.SPRITE);   // one sprite for the document
…
`<div class="sec-body">${ThemeGallery.html({
   sfx: p.id, heading: 3, name: `${fullName(p)}, ${modeLabel(p)}`, swatches: accentsOf(p.id).join(','),
 })}</div>`
```

`.sec-body` is also where that page dials the density knobs down (`--gal-card-pad`, `--gal-col-min`,
…, see the top of `gallery.css`) — 16 galleries in one document want tighter cards than a single
gallery does.

**Both hosts spend `--gal-section-gap` themselves.** `[data-gallery]` is `display: contents`, so the
gap between one `section.cat` and the next belongs to whatever laid the sections out — the host's own
flex/grid `gap`. The *value* still lives with the rest of the scale at the top of `gallery.css`, so a
host writes `gap: var(--gal-section-gap)` rather than a number of its own; that is what keeps the two
pages' vertical rhythm from drifting apart the way their card spacing can't.

## Site build

`tools/assemble-site.mjs` copies this folder to `_site/gallery/`. `../gallery/…` resolves correctly
from both `a11y-way-pages/site/preview.html` in the repo and `_site/preview/index.html` in the deployed tree, so
there is nothing to rewrite.
