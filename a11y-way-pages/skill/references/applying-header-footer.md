# Applying the header and footer to a page

Goal: a page carries the site's header, footer and favicon, rendered from the target repo's **own**
brand, in the target repo's **own** templating language and class-naming convention, passing WCAG 2.2
AA in every theme the repo offers and working from 320px up in every engine.

Read Step 0, then Common setup, then the one path that matches, then verify.

**Prerequisite:** the target repo must already be themed — see `../SKILL.md` Step 0. Without theme
tokens none of this renders. Read `header-footer-anatomy.md` if you're rebuilding rather than copying.

---

## Step 0 — The brand interview (do this FIRST)

You are about to put someone's brand on their pages. That is a set of choices that materially change
the result and are annoying to undo. **Ask before doing the work** (Claude: use AskUserQuestion; other
agents: ask plainly).

**Detect before you ask.** Every question below has a "look here first" — read the repo, propose what
you found, and let the user correct it. Asking cold for something the repo already states is a waste
of their time and reads as not having looked.

Summarize the answers back, then record them in `A11Y-WAY-PAGES.md` (Common setup, step 4). If the
session is genuinely non-interactive, use the **recommended default** and note the assumption in the
History log so a later session can revisit it.

### 1. Brand name and tagline

*Look here first:* a site-constants module (`src/**/site.*`, `config/site.*` — `SITE_NAME`,
`SITE_TAGLINE`), the `<title>` of an existing page, the README's H1, `package.json` `name` /
`description`.

Propose what you found. Confirm the exact casing — "The A11Y Way" and "The A11y Way" are different
strings and both appear in the wild. The header shows a short tag beside the name (the source uses
"WCAG 2.2 Themes"; its sibling uses "WCAG 2.2 Components"); ask what this site's is if it isn't
obvious.

**The tag is not decoration — it is the differentiator, and it is never dropped for space.** Sibling
A11Y Way sites share a mark and a wordmark, so the tag is the only thing in the header that answers
"which of these am I on". That makes it worth *more* than the wordmark on a phone, not less. The
source header used to hide the tag at 620px and the whole wordmark at 400px, which left every sibling
site showing an identical mark on a phone; it now stacks the lockup instead and keeps both lines to
320px. **Give this site a tag that is distinct from its siblings' at a glance** — prefer a different
word, not a longer version of the same one. A shared prefix is fine ("WCAG 2.2 …") as long as the
last word, the one that names the product, differs.

**If the repo has a constants module, use it** rather than hardcoding the name into the markup — that
module exists precisely so the visible brand and the tab title can't drift.

### 2. Brand mark and favicon

*Look here first:* `favicon.*`, `public/`, `static/`, `assets/` for an existing logo.

- **Reuse The A11Y Way mark** (recommended when the repo is part of that family) — vendor
  `brand-mark.svg` + `favicon.svg` and their themer scripts.
- **Use the repo's own logo** — keep their asset, apply the source's *treatment* (size, glow filter,
  hover lift, `alt=""` on the img — the wordmark beside it names the link, so the mark would only
  announce it twice).
- **Wordmark only** — no mark, just the styled name.

If the repo is **always served over http** (no `file://` use case), offer inlining the SVG instead of
`<img>` + themer script: it follows the theme with no JS at all. See `header-footer-anatomy.md` →
Brand assets for why the source repo can't do that.

### 3. Which parts

*Look here first:* does the repo already have a header? A footer? A favicon?

Header, footer, both, or brand assets only. Default: **both**, plus the favicon.

### 4. Page nav segments

*Look here first:* the routes/pages directory, or an existing nav component.

The header's `.pagenav` is a **two-stop segmented control** — it's designed for a site with a small
number of top-level pages. Propose the segments you found.

**Omit the page nav** if the repo already has real navigation, or has more than about four top-level
pages. Say so rather than cramming. Default: omit if they have one, include if they don't.

### 5. Footer cross-links

*Look here first:* `git remote get-url origin` for the source URL; the theme-service repo's own footer
for the family list.

Confirm: which sites belong in the family, one-line description for each, which one is **"you are
here"**, and this repo's source URL. Default: both A11Y Way sites plus the detected origin.

### 6. The repo already has a header or footer — replace, or restyle in place?

Ask this whenever anything was found in question 3.

- **Restyle in place (recommended default):** keep their markup, their ARIA, their event handlers and
  their component boundaries; change the *styling* and add the missing content. Replacing working
  furniture loses wiring you can't see from the outside — a theme picker bound to their own dropdown
  component, a nav that reads from their route registry, a motion toggle with an OS-detection branch.
- **Replace:** only on an explicit request, and only after you've read what you'd be deleting.

### 7. Class naming

*Look here first:* their existing CSS. BEM (`site-footer__inner`)? Utility classes? CSS modules?
Tailwind?

- **Match the repo (recommended default).** The source's `.ftr-inner` shorthand is *this* repo's
  convention, not a standard.
- **Adopt the source names** if the repo has no strong convention, or the user wants them aligned.

Record which you chose — the update flow needs to know the mapping.

---

## Common setup (all paths)

1. **Choose a location** for the vendored CSS. This is **app-owned site furniture**, not upstream
   theme files — keep it separate from the vendored theme directory:
   - Vanilla: `assets/site/` (or beside the existing site CSS).
   - Astro / React / Angular / Vue: next to the layout that uses it — `src/site/styles/`,
     `src/components/site/`.
   - If the repo has one site stylesheet, appending is fine — but keep the header and footer in clearly
     marked, contiguous blocks so the update flow can find them.

2. **Copy from the source `a11y-way-pages/assets/`:**
   - `site-header.css` — if applying the header.
   - `site-footer.css` — if applying the footer.
   - `brand-mark.svg` + `brand-mark-theme.js` — if reusing the A11Y Way mark.
   - `favicon.svg` + `favicon-theme.js` — if applying the themed favicon.

   Rename classes per question 7 as you copy. **Keep every comment** — they carry the reasoning
   (why the cap is clipped and not hidden, why the panel is `position: fixed`, why `inset: 0` and 65%
   on the swatch halo). A future maintainer who deletes a rule because it looked arbitrary is exactly
   what those comments prevent.

3. **Load order matters.** The furniture CSS must come **after** the theme CSS, and after
   `components.css` if the repo vendors it — a few rules deliberately override component defaults at
   equal specificity and rely on source order:

   ```
   theme.css → effects.css → components.css → dropdown.css → site-header.css → site-footer.css
   ```

4. **Write / update the tracking log `A11Y-WAY-PAGES.md`**, beside the vendored CSS. This is what a
   future session reads to know this repo already has the furniture, what was decided, and what
   changed. On the **first** apply create it from this template; on any later work **append a History
   entry** (never rewrite past ones) and refresh the configuration block and version.

   ```markdown
   # A11Y Way — page header & footer

   This repo's site header, footer and favicon come from the shared **theme-service** repo's
   `a11y-way-pages/assets/` — currently on version `<VERSION>`. The files here are vendored copies. Do not
   hardcode colors: everything consumes theme tokens (`var(--…)`).

   ## For agents working in this repo

   This repo **already has the A11Y Way page furniture** (see History). Use the
   **`a11y-way-pages` skill** (or the theme-service repo's `AGENTS.md`) for any header/footer/favicon
   work here — don't improvise, and don't re-apply from scratch.

   - Update to latest: "Update this repo's header and footer to the latest version."
   - New page: "Add a page with the site header and footer."

   Theme work — colors, palettes, adding a theme — is a **different skill** (`theme-service`).
   This one never edits themes.

   ## Vendored files

   | File | Purpose |
   |------|---------|
   | ... | ... |

   ## Brand decisions on record

   - **Brand name / tagline:** `<value>` — sourced from `<where>`.
   - **Brand mark:** `<A11Y Way mark | repo's own | wordmark only>`; `<img + themer | inlined SVG>`.
   - **Parts applied:** `<header | footer | both>` `<+ favicon>`.
   - **Page nav:** `<segments, or "omitted — repo has its own nav">`.
   - **Footer family:** `<sites + which is current>`. Source URL: `<url>`.
   - **Existing furniture:** `<none | restyled in place | replaced>`.
   - **Class naming:** `<source names | repo convention, e.g. BEM>`.
   - **Templating:** `<one component at path | duplicated across N pages>`.

   ### Deliberate deviations

   Anything intentionally different from the source, and **why**, so a future update doesn't
   "fix" it.

   ## History

   - `<YYYY-MM-DD>` — Applied header + footer at v`<VERSION>`. `<one line of what and why>`.
   ```

---

## Path A — New page, furniture already present

The easy case. The repo has an `A11Y-WAY-PAGES.md` and working furniture.

1. Read the tracking log. Honor every decision on record — especially deviations.
2. **Templated repo:** use the existing layout/component. Usually the whole job is "use the base
   layout and set the page title." Nothing to copy.
3. **Duplicated markup:** copy the header and footer blocks from an existing page verbatim, and change
   **only** which `.pagenav-seg` carries `aria-current="page"`. The footer block is byte-identical
   across pages — don't personalize it.
4. Add the page to the header's nav if it's a top-level page, **on every page** (the segmented control
   lists all of them).
5. Verify with `page-a11y-checklist.md`. Append a History entry.

---

## Path B — Greenfield

The repo is themed but has no furniture.

1. Do the brand interview. Do Common setup.
2. **Write the markup** against the reference in `a11y-way-pages/site/overview.html` /
   `a11y-way-pages/site/preview.html`, adapted
   per `header-footer-anatomy.md`. Keep the four header zones in DOM order and the footer's landmark
   rules — those are the parts that carry the accessibility, not the styling.
3. **Wire the head** — the favicon link plus the two themer scripts, `defer`, external (CSP-safe):
   ```html
   <link rel="icon" type="image/svg+xml" href="<path>/favicon.svg">
   <script src="<path>/favicon-theme.js" defer></script>
   <script src="<path>/brand-mark-theme.js" defer></script>
   ```
4. **The skip link is the first element in `<body>`** and targets the `<main>`'s id. If the repo has
   one already, don't add a second.
5. **The theme console** needs the repo's theme selector. If the repo already has a working picker,
   **use theirs** — put it in the console shell and keep their wiring. Only reach for the source's
   `theme-select.js` + `dropdown.js` if the repo has no picker at all. Never replace a working one
   without an opt-in (question 6).
6. Verify. Write `A11Y-WAY-PAGES.md`.

### Per-stack notes

**Vanilla, multi-page.** Duplicate the markup in each page. Add the source's comment above each block
("Keep this markup identical between X and Y") — it is the only thing preventing drift when there's no
templating layer. Consider whether a tiny include step is warranted; if the repo has deliberately
avoided a build step, don't add one.

**Astro.** One `SiteHeader.astro` + `SiteFooter.astro`, used from the base layout. Brand strings come
from the site-constants module. Mark the current nav segment by comparing `Astro.url.pathname`. The
themer scripts need `is:inline` so Astro doesn't bundle them (they read `document.currentScript.src`
to locate their sibling SVG — bundling breaks that).

**React / Next.** One component each. Same `currentScript` caveat: load the themer scripts as static
files from `public/`, not as imported modules. In Next, `next/script` with `strategy="beforeInteractive"`
for the favicon themer.

**Angular.** One component each, declared in the shell. Put the CSS in `styles.scss` (global), not in
component styles — view encapsulation would scope away the `:root` token lookups and the
`forced-colors` block.

**Vue / Svelte / SSGs with partials.** Same shape: one component or partial, brand strings from config.

---

## Path C — Existing furniture

The repo has its own header and/or footer. **Default is restyle in place** (question 6).

1. **Read what's there first.** Map their structure onto the source's zones before changing anything:

   | Source zone | Their equivalent | Action |
   |---|---|---|
   | `.skip-link` | ? | keep theirs if present |
   | `.site-header` / `.hdr-inner` | ? | restyle |
   | `.brand` | ? | restyle; swap strings only if question 1 said to |
   | `.pagenav` | their nav | **keep theirs** if it's real navigation |
   | `.motion` | their toggle | keep the control, restyle it |
   | `.theme-console` | their picker | **keep their picker**, wrap it in the console shell |
   | `.site-footer` | their footer | restyle, and add the family cross-links |

2. **Preserve behavior absolutely.** Every handler, every ARIA attribute, every id another script or
   test depends on. If you rename a class, grep for it across the repo — including tests — first.
3. **Add what's missing** rather than replacing what works. A repo with a plain footer usually needs
   the family cross-link nav added to it, not a new footer.
4. Record every deviation in the tracking log's "Deliberate deviations" section, with the reason.

---

## Path D — Brand assets only

Favicon and/or brand mark, no header or footer.

1. Copy `favicon.svg` + `favicon-theme.js` (and the mark pair if wanted).
2. Wire the `<head>` as in Path B step 3.
3. Confirm the static link works with JS disabled — that's the whole point of the two-file design.
4. Note the CSP requirement (`img-src data:`) if the repo has a policy.
5. Append a History entry.

---

## Verification

Do all of it. `page-a11y-checklist.md` is the gate.

1. **Renders** on every page that got the furniture, with no console errors.
2. **Every theme** the repo offers — cycle all of them. Text stays legible; the tube and glow re-color
   and scale with `--glow-strength`.
3. **Contrast** — if you kept text on `--text` / `--text-muted`, no new pair exists and the theme
   build's validation covers you. If you introduced any pair, check it:
   `node tools/contrast-checker/cli.mjs "<fg>" "<bg>" --min 4.5` in the source repo.
   When measuring live in a browser, **wait for CSS transitions to settle** after switching themes —
   `getComputedStyle` mid-transition returns interpolated colors and will report false failures.
4. **Every size** — 320, 360, 414, 430, 431, 620, 621, 700, 701, 768, 900, 1080, 1440, 2560px: no horizontal scroll,
   nothing clipped or overlapping, and the header's row count only ever falls as the viewport grows.
   Then 200% and 400% zoom. Re-walk the narrow end with `--font-ui` forced to its last fallback —
   the fallback face is wider, so a header that fits on your machine can overlap on a phone.
5. **Every engine** — Chromium, Firefox, WebKit. Confirm the glass, tube and glow render or degrade
   cleanly.
6. **Keyboard** — skip link first and reachable; tab order matches reading order; visible focus on
   everything; no traps.
7. **Forced colors** — boundaries survive Windows High Contrast.
8. **Motion** — both the in-page toggle and the OS `prefers-reduced-motion` collapse transitions.
9. **Screen reader** — one `banner`, one `contentinfo`, uniquely named `nav`s, the current item
   announced as current.
10. **Tracking log** written or appended.
