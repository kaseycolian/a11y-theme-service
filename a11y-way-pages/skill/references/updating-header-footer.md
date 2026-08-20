# Updating a repo's header and footer to the latest version

Re-sync a repo that already has the A11Y Way page furniture. The point of this flow is that it is
**safe**: it never silently reverts a decision the repo made on purpose.

---

## 1. Read the repo's tracking log first

Open `A11Y-WAY-PAGES.md` (beside the vendored CSS). It tells you:

- the **version** the repo is on,
- the **brand decisions on record** — name, mark, which parts, nav segments, family links, class
  naming, templating,
- any **deliberate deviations** and why,
- the **History** of prior work.

**Honor all of it.** A deviation recorded there is a decision, not a defect — do not "fix" it. If you
think one is now wrong, raise it with the user; don't unilaterally revert it.

Also read `VERSION` at the source repo root. **If the versions match and no files differ, there's
nothing to do — say so** and stop. Don't manufacture a diff.

## 2. Diff against the source

Compare the repo's vendored copies with the source `a11y-way-pages/assets/`:

> **Moved in v1.3.0.** These files used to live at the repo root in `assets/`. A tracking log written
> before that release will say they come from "the theme-service repo's `assets/`" — update that line
> when you re-sync. Nothing about the files themselves changed in the move.

- `site-header.css`, `site-footer.css`
- `brand-mark.svg`, `brand-mark-theme.js`, `favicon.svg`, `favicon-theme.js`

**If the repo renamed classes** (question 7 of the brand interview), a raw diff will be noisy. Diff
the *source's* old version against its new version instead — that gives you the actual upstream change
set, which you then re-apply through the repo's naming. The tracking log records the mapping.

Sort what you find into:

| Kind of change | What to do |
|---|---|
| A rule changed or was added upstream | Apply it, translated to the repo's conventions |
| A rule the repo **deliberately** overrode | Leave the repo's version; note it if upstream moved under it |
| A new token consumed upstream | Confirm the repo's theme layer defines it before applying — see below |
| A class was renamed upstream | Rename in the repo too, and grep for the old name across markup **and tests** |
| A new markup element (e.g. a new footer zone) | Add it, adapted to the repo's templating |

## 3. Re-copy and re-apply

- Copy the changed files, preserving the repo's class names and comments-with-reasons.
- **Markup changes need doing per page** in a repo with duplicated markup, and once in a templated
  one. In a duplicated repo, re-verify the blocks are still identical afterwards.
- **New tokens are the one thing that can break an update.** The furniture only consumes tokens; if
  upstream started using one the repo's theme layer doesn't define, the rule silently falls back to
  nothing. Check the repo's theme files (and its `THEME-SERVICE.md`, which may record that
  `components.css` is deliberately not vendored) before applying. If a token is genuinely missing,
  **stop and route to the `theme-service` skill** — updating themes is that skill's job, not this one.

## 4. Re-verify

Full `page-a11y-checklist.md`. An update is not smaller than an apply — a one-line CSS change can move
a focus ring or break a 320px layout. In particular re-check:

- contrast in **every** theme the repo offers,
- the 320 → ultrawide ladder,
- forced colors,
- that the repo's own picker/nav/handlers still work.

## 5. Record it

Append a **new** History entry. Never rewrite past ones.

```markdown
- 2026-08-14 — Updated to v1.1.0. Footer gained the family cross-link nav; restyled in place
  keeping BEM names. No token changes.
```

Then refresh the version line and the "Brand decisions on record" block if anything changed.

---

## Updating the source repo itself

If the user is working in a **fork of theme-service** and wants the origin's header/footer changes,
that's `skill/references/updating-from-origin.md` in the `theme-service` skill — it merges the whole
repo, including `a11y-way-pages/assets/`. Come back here only for pushing those changes out to consuming repos.
