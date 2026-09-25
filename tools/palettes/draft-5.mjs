/* Draft 5 palettes: adds Rebecca, a family in Rebecca Purple.
   Every draft-4 palette is carried over verbatim, so their colors and AA results are
   unchanged; the only new entries are Rebecca's four variants.

   rebeccapurple, #663399, is the CSS named color added in 2014 in memory of Rebecca
   Meyer, who died on her sixth birthday. Purple was her favorite color. She had told
   her family that at six she would be a big girl, and wanted to be called Rebecca, not
   Becca, which is why the color carries her full name, and why this theme does too.
   It is meant to be gentle and a little joyful: lots of purple, and flowers.

   Every purple here is Rebecca Purple's own hue (OKLCH 303.4°), at other lightnesses:
   surfaces, text, borders, the focus ring and the purple accent alike. The accent
   slots:
     purple → Rebecca Purple   (every heading, H1–H4 via `headings`; badges, warnings)
     pink   → orchid           (errors, radios, pressed chips)
     blue   → periwinkle       (links, tabs, inputs, dropdowns, info)
     green  → leaf green       (success, switches, checkboxes)
   Pink and blue stay next to purple on the wheel (345° and 280°). The green is left
   green on purpose, the leaves of the flowers, so success still reads as success rather
   than as one more purple; it is kept out of the headings, which are all purple.

   Light: #663399 exactly, for the purple accent, the focus ring and the flowers. It is
   8.41:1 on white, so it reads as text and letters its own buttons in white. The page
   is the faintest lavender (#faf7fe) under white panels, the text a deep plum.

   Dark: #663399 is too dark to read on a dark page, so it is used exactly where nothing
   has to be read: the hairline border, and the flowers. The purple accent keeps its hue,
   lightened and given a little more chroma than Rebecca Purple's own (#bb86fc). All four
   accents sit near L 0.72–0.78 with as much chroma as still looks soft, well short of
   the neon the gamut allows at that lightness, so they read as color rather than as
   pastel. The page is a near-black aubergine at the same hue; body text is a pale
   lavender (#ede2ff) rather than white, and muted text sits a clear step below it.

   The backdrop is flowers (tools/flowers.mjs): small violets, forget-me-nots and
   daisies, buds, sprigs and loose petals, in Rebecca Purple, drifting slowly down on
   a breeze. Like the rain, the most opaque point of it is checked as a surface text
   sits on. The strengths leave headroom under the limits the checks set (0.63 dark,
   0.18 light) and were chosen by eye to look about the same in both modes. */
import { palettes as d4 } from './draft-4.mjs';

const rebeccaDark = {
  mode: 'dark', name: 'Rebecca', cohort: 'Tribute · Dark', headings: { h1: 'purple', h2: 'purple', h3: 'purple' },
  backdrop: 'flowers', backdropColor: '#663399',
  bg:'#140a20', panel:'#1e102e', elevated:'#29163e', text:'#ede2ff', muted:'#b6a4d0',
  border:'#663399', borderStrong:'#9b79c8', focus:'#c9a9f5',
  pink:'#f77dc6', onPink:'#2a051d', green:'#68d36f', onGreen:'#042107',
  blue:'#9499fa', onBlue:'#111034', purple:'#bb86fc', onPurple:'#1d0b2f',
};
const rebeccaLight = {
  mode: 'light', name: 'Rebecca', cohort: 'Tribute · Light', headings: { h1: 'purple', h2: 'purple', h3: 'purple' },
  backdrop: 'flowers', backdropColor: '#663399',
  bg:'#faf7fe', panel:'#ffffff', elevated:'#ffffff', text:'#2a163f', muted:'#5e4a79',
  border:'#e3d8f4', borderStrong:'#8d69ba', focus:'#663399',
  pink:'#a32a7a', onPink:'#ffffff', green:'#2b6b30', onGreen:'#ffffff',
  blue:'#4841af', onBlue:'#ffffff', purple:'#663399', onPurple:'#ffffff',
};

export const palettes = {
  ...d4,

  // ===== Rebecca — the flowers backdrop in both modes, each with a flat
  // no-background twin.
  'dark-09-rebecca':                   { ...rebeccaDark, grid: 0.55 },
  'dark-09-rebecca-no-background':     { ...rebeccaDark, grid: 0, description: 'No Background' },
  'light-09-rebecca':                  { ...rebeccaLight, grid: 0.14 },
  'light-09-rebecca-no-background':    { ...rebeccaLight, grid: 0, description: 'No Background' },
};
