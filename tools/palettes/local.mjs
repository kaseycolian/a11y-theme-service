/* =============================================================================
   local.mjs — YOUR OWN themes (fork-local).

   OWNER of the origin repo: leave this an empty stub. Do NOT add themes here or
   edit it after the initial commit — it must stay untouched so forks can pull your
   updates without conflicts.

   FORK USERS: add your themes here. They are ALWAYS built into themes/ (alongside
   the built-in themes, unless you build with --no-builtin), and this file is never
   touched by upstream updates — so your themes survive every `update-from-origin`.
   Commit this file in YOUR fork to persist them (git-local is enough; GitHub optional).

   Shape: same as the built-in palettes in draft-3.mjs. Key = `<mode>-NN-<family>`
   (mode is "dark" or "light"; NN is any number; family is a slug). Every theme needs
   the full token set below and must pass WCAG AA 2.2 (the build validates and refuses
   to write on any failure). `grid` is optional (0 = no backdrop, 0.22 = subtle,
   ~0.40 = pronounced). Add a "-no-background" suffix to a key for a grid-off variant.

   NAMING — three parts, never one pre-composed string (see tools/theme-name.mjs):

     name         required.  What the theme is: 'My Brand'. The SAME on every
                             variant of a family — that is what groups them.
     group        optional.  Defaults to the capitalized `mode` ('Dark' / 'Light').
                             Set it to '' for a theme that should carry no group
                             segment at all, or to your own string to group by
                             something other than mode.
     description  optional.  What makes this variant different: 'No Background'.

   They compose as "My Brand · Dark · No Background" for a trigger, and split into
   a "My Brand" group heading with a "Dark · No Background" row under it in a list.
   Do NOT bake the mode or the variant into `name` — that is what the parts are for.

   `cohort` is unrelated to display naming: it is the discovery pages' review
   grouping ('Faithful · Dark') and only matters if you render those.

   Example (uncomment and edit):

   export const palettes = {
     'dark-01-my-brand': {
       mode: 'dark', name: 'My Brand', cohort: 'Local · Dark', grid: 0.4,
       bg:'#0b0219', panel:'#17092b', elevated:'#22103c', text:'#f3ecff', muted:'#bcadde',
       border:'#3a2360', borderStrong:'#8064c0', focus:'#3ceaff',
       pink:'#ff5ada', onPink:'#22001a', green:'#5bff3a', onGreen:'#062600',
       blue:'#3ceaff', onBlue:'#00212b', purple:'#c39cff', onPurple:'#1c0940',
     },
     'light-01-my-brand': { mode: 'light', name: 'My Brand', cohort: 'Local · Light',
       bg:'#f6f1fc', panel:'#ffffff', elevated:'#ffffff', text:'#1c0f2e', muted:'#5f5080',
       border:'#e0d3f0', borderStrong:'#9070c0', focus:'#7b2ff0',
       pink:'#b60f86', onPink:'#ffffff', green:'#1f7d2f', onGreen:'#ffffff',
       blue:'#0a6a9e', onBlue:'#ffffff', purple:'#6d28d9', onPurple:'#ffffff' },
     // A grid-off variant of the same family: same `name`, its own `description`.
     'dark-01-my-brand-no-background': {
       mode: 'dark', name: 'My Brand', description: 'No Background',
       cohort: 'Local · Dark', grid: 0, /* …same tokens as above… */
     },
   };

   Tip: an agent (theme-service skill) can generate a validated palette for you — see
   CREATING-THEMES.md. To add/change themes: "Use the theme-service skill to add a new
   theme in local.mjs …", then run `npm run build-themes`.
   ============================================================================= */
export const palettes = {};
