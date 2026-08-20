---
name: a11y-way-pages
description: Stand up the shared site header, footer and favicon on a page — in this repo or any other — matched to that repo's own brand. Use when the user wants a new page to look like the rest of the site, wants a header/footer/favicon added to an app, wants two sites cross-linked through a footer, wants a repo's existing header or footer restyled to the brand, or wants a repo re-synced to the latest header/footer. It asks about brand name, mark and cross-links before touching anything, and it never creates or edits themes — it only consumes theme tokens. Triggers on "add a header and footer", "add the site footer", "make this page match the site", "add a favicon", "brand this page", "cross-link my sites", "restyle the header", "update the header and footer".
---

# A11Y Way pages — stand up the site header, footer and favicon on any page

This skill puts **page furniture** on a page: the sticky site header (brand lockup, page nav, motion
toggle, theme console), the site footer (cross-linked product family + source link), and the themed
favicon/brand mark. It works on a new page in this repo and on a page in a completely different repo,
adapting the brand, the class names and the templating language to whatever that repo already uses.

The **source of truth** is the theme-service repo's `a11y-way-pages/assets/` folder: `site-header.css`,
`site-footer.css`, `brand-mark.svg` + `brand-mark-theme.js`, `favicon.svg` + `favicon-theme.js`. The
reference *markup* lives in `a11y-way-pages/site/overview.html` and `a11y-way-pages/site/preview.html`, which carry the header and
footer verbatim. `references/header-footer-anatomy.md` documents the contract behind both, so you can
rebuild them in a repo whose stack looks nothing like this one.

**This skill never touches themes.** It reads theme tokens; it does not create, edit, rebuild or
delete them. Anything about colors, palettes or new themes belongs to the **`theme-service` skill** —
route there and come back.

## Step 0 — Locate the source, and confirm the target is themed (do this first)

**Find the source repo**, in this order:
1. Read the machine-local config `~/.claude/theme-service.local.json` → `{ "repo": "<abs path>" }`.
2. If missing, this skill lives at `~/.claude/skills/a11y-way-pages/` (symlink/junction into the
   repo's `a11y-way-pages/skill/`); its real grandparent directory is the repo. Resolve it, or check
   the repo's `AGENTS.md`.
3. If you still can't find it, tell the user to run the installer (`install/install.ps1` on Windows,
   `install/install.sh` on macOS/Linux) from their clone, or ask for the repo path.

Confirm the source has `a11y-way-pages/assets/site-header.css`, `a11y-way-pages/assets/site-footer.css`
and a top-level `VERSION`.

**Then confirm the target repo is themed.** The header and footer are built entirely from theme
tokens — `--bg-panel`, `--text`, `--text-muted`, `--border`, `--focus-ring`, `--accent-*`,
`--glow-strength`, `--motion`, `--dur`, `--radius*`, `--font-ui`, `--font-mono`. Without those they
render as unstyled boxes. Look for a `THEME-SERVICE.md` anywhere in the target (usually
`src/theme/`, `assets/theme/`, or `src/site/theme/`).

- **Found it** → good. Read it: it records which files are vendored and any deliberate deviations you
  must not "fix".
- **Not found** → **stop.** Tell the user this needs the **`theme-service` skill** first ("apply the
  theme service to this repo"), then come back. Do not improvise colors and do not hardcode hex —
  see Core rules.

## Step 1 — Identify the task

| User intent | Go to |
|-------------|-------|
| Add a **new page** to a repo that already has this header/footer | `references/applying-header-footer.md` → "Path A — New page, furniture already present" |
| Add the header/footer to a repo that has **none** | `references/applying-header-footer.md` → "Path B — Greenfield" |
| Repo has **its own** header/footer — make it match the brand | `references/applying-header-footer.md` → "Path C — Existing furniture" |
| **Favicon / brand mark only** | `references/applying-header-footer.md` → "Path D — Brand assets only" |
| **Update** a repo's header/footer to the latest version | `references/updating-header-footer.md` |
| "What is this thing made of?" / rebuilding it in another language | `references/header-footer-anatomy.md` |

**Check for the tracking log first.** Every repo this skill has touched has an `A11Y-WAY-PAGES.md`
beside its vendored CSS. If it exists, the repo already has the furniture: read it and use the
**update** flow (`updating-header-footer.md`), don't re-apply from scratch.

## Step 2 — Detect the templating layer (before applying)

This decides whether the markup gets duplicated or written once:

- `astro.config.*` → **Astro** — one `.astro` component, used from the base layout.
- `package.json` with `react`/`next` → **React/Next** — one component.
- `angular.json` → **Angular** — one component.
- `vue`/`nuxt`, `svelte`/`sveltekit` → same idea, one component.
- A static-site generator with partials/includes (Eleventy, Jekyll, Hugo) → **one partial**.
- Plain `.html` files with no templating → **duplicate the markup**, and add the "keep these
  identical" comment the source pages carry.

**Duplicate only when there is no templating layer.** The theme-service repo itself duplicates because
it is hand-written HTML with no build step — that is a constraint, not the ideal. In a repo with a
templating layer, one component is strictly better and is what you should write.

## Step 3 — Ask the brand questions (before touching any file)

Applying furniture to a real repo means putting *someone's brand* on *their pages*. Get the seven
answers in `references/applying-header-footer.md` → "Step 0 — the brand interview" first. **Detect
before you ask**: read their `<title>`, site-constants module, README heading and git remote, propose
what you found, and let the user correct it. Never ask cold for something the repo already states.

Summarize the answers back, then record them in `A11Y-WAY-PAGES.md`. In a genuinely non-interactive
run, use the recommended defaults and note the assumption in the History log.

## Step 4 — Apply, then verify

Follow the relevant path exactly. Always finish with `references/page-a11y-checklist.md` — landmarks,
tab order, focus rings, target sizes, contrast in **every** theme the repo offers, forced colors,
reduce-motion, and the cross-browser/size ladder. Run the source repo's `tools/contrast-checker/` on
any color pair you introduced.

## Core rules (apply everywhere)

- **Never touch themes.** No editing `theme.css`, `tokens.json`, `themes.index.json`,
  `tools/palettes/*`, no `build-themes`, no adding or removing a theme. If the work needs a new color
  role, **stop and flag it** — that is the `theme-service` skill's job. This skill consumes tokens
  read-only, and that boundary is what lets the two be used together safely.
- **Never invent colors.** Every value is a token. If a role has no token, say so rather than
  hardcoding a hex. The one exception is `CanvasText` and friends inside `@media (forced-colors:
  active)`, which are system keywords, not colors.
- **Vendor, don't hardlink.** Copy the CSS **into** the target repo so it survives being cloned on
  another machine. Never reference an absolute path to the theme-service repo from app code.
- **Confirm before you change.** Ask the brand questions first. Don't replace an existing header or
  footer, swap a logo, or change a site's name without an explicit opt-in — the default for a repo
  that already has furniture is **restyle in place**, keeping its markup, ARIA and handlers.
- **Match the repo, not this repo.** Its class-naming convention, its templating language, its file
  layout, its brand. "Mimic the source" means *the same result*, not the same characters.
- **Structure with rules and space, not boxes.** The header is a rail of type and one lit edge; the
  footer is drawn to the same brief, so the two bracket the page as one frame. No panel backgrounds,
  border boxes or chips in the footer — a tray of rounded cards is the generic default this system
  exists to avoid. Carry the hierarchy in type size, and let one decorative idea repeat at two scales
  rather than adding a second. See `references/header-footer-anatomy.md` → "Footer — two zones".
- **Keep the tracking log.** Every repo gets an `A11Y-WAY-PAGES.md` recording the version, the brand
  decisions on record, and a dated **append-only History**. Check for it first; always write it
  (first apply) or append to it (later work).
- **Works everywhere, at every size.** 320px to ultrawide with no horizontal scroll, reflow at 200%
  and 400% zoom, Chromium + Gecko + WebKit, and a stated fallback for every progressive enhancement.
  This is the brand promise, not a polish step — a page that only works in one browser fails the
  whole point of the product.
- **Accessibility is the deliverable.** One `banner`, one `contentinfo`, a skip link first in tab
  order, uniquely named `nav`s, `aria-current` on the current item, visible focus, ≥24×24 targets, no
  unrequested `target="_blank"`, and no new headings injected into a page's outline. WCAG 2.2 AA is
  the floor, in every theme.
- **Keep it lightweight & build-step-free.** Plain CSS custom properties, no new dependencies, no
  inline scripts (CSP-safe: the favicon and brand-mark themers are external files).
