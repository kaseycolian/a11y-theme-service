# AGENTS.md — A11Y Way pages (for any AI agent)

**Audience: the maintainer of the A11Y Way brand, and contributors to it. Not theme users.**

This directory is everything A11Y Way brand related: the `a11y-way-pages` skill, the site furniture it
distributes, the two published brand pages, and the tooling that builds them. It lives inside the
theme-service repo for one reason — the brand pages are built entirely from these themes, so they must
track the current state of them.

**The dependency runs one way.** a11y-way-pages consumes theme-service; theme-service knows nothing
about a11y-way-pages. Nothing outside this directory may reference anything inside it, except the
three places that must name a path to do their job: `install/` (to link the skill), `.gitignore`, and
`.github/workflows/pages.yml`. If you find yourself adding a reference from a theme-service file into
this directory, that is the signal you are solving it in the wrong place.

**This skill never touches themes.** No palettes, no `build-themes`, no `themes/`. If page work needs
a color role that has no token, stop and flag it — that is the theme-service skill's job (root
`AGENTS.md`), not this one's.

## What's here

- `skill/` — the `a11y-way-pages` skill: `SKILL.md` + `references/*.md`, the shared how-to docs.
- `assets/` — the furniture this skill distributes: `site-header.css`, `site-footer.css`,
  `brand-mark.svg` + `brand-mark-theme.js`, `favicon.svg` + `favicon-theme.js`, `header-image.webp`.
  **Not** vendored by a consuming app as part of theming.
- `site/` — the two published pages, `overview.html` and `preview.html`.
- `tools/` — `build-site.mjs` (orchestrator), `assemble-site.mjs` (the real builder), `serve-site.mjs`.
- `docs/superpowers/` — design history for the site. Historical; not a current contract.

## Putting the header and footer on a page

1. **Confirm the target is themed** (a `THEME-SERVICE.md` exists). The furniture is built entirely
   from theme tokens; without them it renders as unstyled boxes. If it isn't themed, do the theme work
   first — root `AGENTS.md`.
2. **Pick the task and follow the matching reference:**
   - New page in a repo that already has the furniture, a repo with none, or a repo with **its own**
     header/footer → `skill/references/applying-header-footer.md`.
   - What the pieces are made of, for rebuilding in another stack →
     `skill/references/header-footer-anatomy.md`.
   - Re-sync a repo to the latest → `skill/references/updating-header-footer.md`.
3. **Ask the brand questions first** — name, mark, which parts, nav segments, cross-links, replace vs
   restyle, class naming. Detect from the repo, propose, confirm. Never rebrand a repo silently.
4. **Verify** with `skill/references/page-a11y-checklist.md`.

## The published site

`site/overview.html` (`/`) and `site/preview.html` (`/preview/`) are deployed to GitHub Pages by
`.github/workflows/pages.yml`, which builds themes from the highest-numbered `discovery/draft-N` and
then runs `tools/assemble-site.mjs`.

Both pages share one header **and** one footer: the markup is duplicated (the header differs only in
which `.pagenav-seg` carries `aria-current`; the footer blocks are byte-identical), while the styles
live once in `assets/site-header.css` and `assets/site-footer.css` — **edit there**, not in either
page's `<style>`. These two pages are the reference implementation `header-footer-anatomy.md` cites by
name, so changing the header or footer here changes what the skill tells other repos to build.

`site/preview.html` renders `gallery/gallery.js` from the theme-service side — the one authoritative
component sheet, also rendered by `discovery/draft-N/index.html`. Add a component there, not here.

### Working on it locally

```sh
npm run dev:overview-site         # build _site/, serve it, rebuild on change
npm run dev:overview-site:build   # build only — a dry run of the Pages deploy
npm run dev:install-pages-skill   # link ONLY this skill into ~/.claude/skills, from this clone
```

`assemble-site.mjs` rewrites each page's relative links for the deployed clean URLs without modifying
the sources, so both pages still open correctly from `file://`. Every rewrite is an exact-string
replace that **fails loudly** if the token is absent — so a moved asset link errors the build rather
than silently shipping a broken URL. Its paths are relative, so it must run with the **repo root** as
cwd; `build-site.mjs` and the workflow both do.
