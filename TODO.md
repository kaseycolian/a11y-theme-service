# TODO

Deferred work, recorded so it survives between sessions. Not a backlog of everything — just the
things that were deliberately postponed, with enough context to pick up cold.

---

## 1. Cut the v1.3.0 release

**Status:** not started. Last release was `v1.2.0`; `VERSION` still reads `1.2.0`.

Commit `ee92801` ("Split the A11Y Way brand out of the theme service") is committed and pushed but
**unreleased**. It warrants a **minor** bump because it moves vendored source paths.

```sh
npm run release minor -- --note "…"
```

Two things the changelog entry must say:

- **`assets/` moved to `a11y-way-pages/assets/`.** Any repo that vendored the header/footer furniture
  has a tracking log pinning the old root path. Known case:
  `a11y-component-examples/src/site/styles/A11Y-WAY-PAGES.md` says the files "come from the shared
  theme-service repo's `assets/`" — that line needs updating on its next re-sync.
  `a11y-way-pages/skill/references/updating-header-footer.md` already carries a "Moved in v1.3.0" note
  for whoever runs that re-sync.
- **The install commands changed shape.** `install-all` / `install-no-themes` / `install-skill` now
  pass `--only theme-service`, so they install **one** skill. `install.sh` and `install.ps1` gained
  `--only` / `--source` / `--builtins` / `--help`, and both stopped truncating
  `~/.claude/theme-service.local.json` (they were wiping `includeBuiltinThemes` and all of
  `history[]` on every run; the PowerShell one also wrote a BOM that made the file unparseable).

Note `release.mjs` prepends its entry **above the first `## ` heading**. There is no `## Unreleased`
section right now, so it will land correctly above `## 1.2.0` — but if someone adds one first, fold
it in by hand rather than letting the script strand it below the new heading.

---

## 2. A theme-service preview page

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
