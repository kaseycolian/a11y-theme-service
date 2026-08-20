# A11Y Way — pages

**Maintainer only.** Nothing in this directory is needed to install or use the theme service.

This is everything A11Y Way brand related: the `a11y-way-pages` skill, the site furniture it
distributes, the two published pages, and the tooling that builds them.

## Why it lives in the theme-service repo

The brand pages are built entirely from these themes — every color, glow and motion gate is a theme
token. Keeping them here is what stops them drifting from the current state of the themes.

**The dependency runs one way:** a11y-way-pages consumes theme-service; theme-service knows nothing
about a11y-way-pages. A theme user can clone this repo, install, and apply themes without ever opening
this directory. Only three things outside it name a path inside, because they have to: `install/`
(to link the skill), `.gitignore`, and `.github/workflows/pages.yml`.

## Layout

```
skill/          The a11y-way-pages skill: SKILL.md + references/
                (brand interview, header/footer anatomy, update flow, a11y checklist)
assets/         The furniture this skill distributes — NOT vendored as part of theming:
                site-header.css, site-footer.css, brand-mark.svg + brand-mark-theme.js,
                favicon.svg + favicon-theme.js, header-image.webp
site/           The two published pages: overview.html (/) and preview.html (/preview/)
tools/          build-site.mjs (orchestrator) · assemble-site.mjs (the builder) · serve-site.mjs
docs/           superpowers/ — design history for the site. Historical, not a current contract
AGENTS.md       Agent-agnostic mirror of this skill (for non-Claude agents)
```

## Working on the site

```sh
npm run dev:overview-site         # build _site/, serve it, rebuild on source change
npm run dev:overview-site:build   # build _site/ only — a dry run of the Pages deploy
npm run dev:overview-site:serve   # serve the existing _site/ as-is (no build, no watch)
npm run dev:overview-site -- --port 5000
```

`assemble-site.mjs` rewrites each page's relative links for the deployed clean URLs **without**
modifying the sources, so both pages still open correctly from `file://`. Every rewrite is an
exact-string replace that fails loudly if the token is missing, so a moved asset link errors the build
instead of silently shipping a broken URL. It uses relative paths, so it must run with the **repo
root** as cwd — `build-site.mjs` and the Pages workflow both do.

Both pages share one header and one footer. The markup is duplicated (the header differs only in which
`.pagenav-seg` carries `aria-current`; the footer blocks are byte-identical), but the styles live once
in `assets/`. **Edit there**, not in either page's `<style>`.

`site/preview.html` mounts `gallery/gallery.js` from the theme-service side — the one authoritative
component sheet, also rendered by `discovery/draft-N/index.html`. Add a component there, not here.

## Working on the skill

```sh
npm run dev:install-pages-skill   # link ONLY this skill into ~/.claude/skills, from this clone
```

The two pages in `site/` are the reference implementation that `skill/references/header-footer-anatomy.md`
cites by name, so changing the header or footer here changes what the skill tells other repos to build.
Link the skill from this clone and apply it to a scratch repo to see an in-progress change land.

**This skill never touches themes.** No palettes, no `build-themes`, no `themes/`. If page work needs a
color role that has no token, stop and flag it — that is the theme-service skill's job.
