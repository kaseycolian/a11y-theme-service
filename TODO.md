# TODO

Deferred work, recorded so it survives between sessions. Not a backlog of everything — just the
things that were deliberately postponed with a reason.

## A theme-service preview page

**Status:** not started.

Theme users currently have no brand-free page that renders the finished themes. `site/preview.html` is
a public A11Y Way brand page and lives in `a11y-way-pages/`; the theme-creation flow verifies in
`discovery/draft-N/index.html`, which is a palette *review* page, not a product preview.

Build a `themes/` preview page for theme users that is:

- **Basic, not brand-tight.** It should not wear the A11Y Way header and footer, and it must not
  depend on anything in `a11y-way-pages/` — that would re-introduce the dependency this repo just
  removed.
- **A theme selector in the header.** `themes/dropdown.css`'s `.dropdown-console` is the control for
  this: it was added in v1.2.0 precisely so a cap-plus-control pill is reachable by pages that do not
  load the site header.
- **A simple footer, referential to the brand.** Links to the GitHub source and the GitHub Pages URL,
  so a theme user can find the A11Y Way sites without the page pretending to be one.
- **Rendering `gallery/gallery.js`**, the one authoritative component sheet.

Until it exists, point theme users at `discovery/draft-N/index.html`.
