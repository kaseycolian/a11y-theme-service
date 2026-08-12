/* =============================================================================
   theme-name.mjs — how a theme's display name is composed.

   A theme name is stored as THREE PARTS, never as one pre-composed string:

     name         'Hot Neon'        what the theme is. Required.
     group        'Dark' | 'Light'  which cut of it. Defaults to the mode; may be
                                    '' to opt out of a group segment entirely.
     description  'No Background'   what makes this variant different. Optional.

   Storing the parts rather than the sentence is the whole point: the same theme
   renders as "Hot Neon · Dark · No Background" on a trigger, as a "Hot Neon"
   group heading with a "Dark · No Background" row inside it, and could be
   regrouped tomorrow (by mode, by vendor, by anything) without the data moving.
   The alternative — one string plus a regex to pick it back apart — is what this
   file replaced, and it silently produced the wrong heading for any name that
   did not happen to end the way the regex expected.

   Every consumer composes through here so the separator and the empty-part rules
   live in exactly one place.
   ============================================================================= */

/* U+00B7 MIDDLE DOT, spaced. Matches the separator the rest of the UI uses
   (.grp-tag, the type scale's accent list, the site footer). */
export const SEP = ' · ';

/** The non-empty parts, in display order. */
export const parts = t => [t.name, t.group, t.description].filter(Boolean);

/** Everything, for a trigger or a standalone label: "Hot Neon · Dark · No Background". */
export const fullLabel = t => parts(t).join(SEP);

/** The heading a list groups under: "Hot Neon". */
export const groupLabel = t => t.name;

/* What is left once the group heading above has already said the name:
   "Dark · No Background". The fallback is load-bearing — a theme with an empty
   `group` AND no `description` has nothing left, and an empty option row is
   unpickable and unreadable, so it falls back to naming itself. */
export const optionLabel = t => [t.group, t.description].filter(Boolean).join(SEP) || t.name;

/** 'dark' -> 'Dark'. The default `group` when a palette does not set one. */
export const modeLabel = m => m[0].toUpperCase() + m.slice(1);
