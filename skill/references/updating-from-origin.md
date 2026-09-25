# Updating a theme-service fork from its origin

Use when the user has their **own clone/fork** of the theme-service and wants the origin's latest
(new built-in themes + skill/prompt/tool changes) **without losing their own themes**. This is about
updating the **theme-service repo itself** — distinct from `updating-themes.md`, which updates a
*consuming app* to a vendored version.

**Hard rules:**
- **Never delete or overwrite the user's themes.** Their themes live in `tools/palettes/local.mjs`,
  which the origin never touches. Regenerating `themes/` re-includes them. Only remove themes on the
  user's **explicit** request (they edit `local.mjs`, or choose `--no-builtin`).
- The generated `themes/` files are build output (gitignored) — never merged, always rebuilt.

## Steps

1. **Read the local history first.** `~/.claude/theme-service.local.json` holds `{ repo, version,
   includeBuiltinThemes, history[] }`. Show the user their current version and recent history so they
   know where they stand (this is also how *you* know what's already been done).

2. **Ensure the `upstream` remote** points at the origin (the repo the user tracks). If missing:
   `npm run update-from-origin -- --set-upstream https://github.com/<owner>/a11y-theme-service.git`
   (for this project's origin, `<owner>` is `kaseycolian`). Confirm the working tree is clean
   (their `local.mjs` themes should already be committed).

3. **Pull the origin's changes:** `npm run update-from-origin` (or `-- --tag vX.Y.Z` for a specific
   release). It fetches + merges upstream conflict-free (generated files aren't committed; `local.mjs`
   is untouched by the origin) and logs the version bump to the local history.

4. **Ask the user: "Include the origin's built-in themes?"**
   - **Yes** → `npm run build-themes` (built-ins + their local themes).
   - **No, just my own** → `npm run build-themes:mine` (only `local.mjs`; origin themes excluded — not
     deleted, just not generated). Persist the preference: `node install/install.mjs --builtins false`.
   This is the point of the whole design: a user who's made their own themes doesn't have to take the
   origin's, but still gets your skill/prompt/tool updates.

5. **Verify:** `themes/` regenerated; the user's local themes are present in `themes/theme.css` /
   `theme-select.js`; the build reported **ALL PASS** (AA). Nothing of theirs was removed.

6. **Report** the version change (old → new), what the origin's update added (from its `CHANGELOG.md`
   / tags), the built-in include choice, and confirm their themes survived. The update was already
   appended to the local history in step 3.

## Notes
- If the merge ever conflicts (rare), it means the user edited origin-owned source files (they
  shouldn't — their edits belong in `local.mjs`). Help them resolve, favoring the origin for shared
  source and keeping their `local.mjs`.
- To move to a different origin entirely, re-point the source: `node install/install.mjs --source
  <path>` or edit `repo` in the local config.
