# TODO

Deferred work, recorded so it survives between sessions. Not a backlog of everything — just the
things that were deliberately postponed, with enough context to pick up cold.

---

## 1. A theme-service preview page

**Status:** not started.

Theme users have no brand-free page that renders the finished themes.
`a11y-way-pages/site/preview.html` is a public A11Y Way brand page and belongs to the other audience;
the theme-creation flow verifies in `discovery/draft-N/index.html`, which is a palette **review** page,
not a product preview.

Build a preview page under `themes/` that is:

- **Basic, not brand-tight.** No A11Y Way header or footer, and **no dependency on anything in
  `a11y-way-pages/`** — that would re-introduce the coupling `ee92801` just removed. This is the
  hard constraint; everything else is taste.
- **A theme selector in the header.** Use `.dropdown-console` from `themes/dropdown.css`. It was added
  in v1.2.0 precisely so a cap-plus-control pill is reachable by pages that do not load the site
  header — see the comment above that rule.
- **A simple footer, referential to the brand.** Links to the GitHub source and the GitHub Pages URL,
  so a theme user can find the A11Y Way sites without the page pretending to be one.
- **Rendering `gallery/gallery.js`** — the one authoritative component sheet, also rendered by the
  discovery pages. Add components there, never inline.

When it exists, repoint the places currently sending theme users to the discovery pages:
`README.md` ("Explore the themes"), `skill/references/adding-a-theme.md` step 4, and `themes/README.md`.

Until then, `discovery/draft-N/index.html` is the answer.
