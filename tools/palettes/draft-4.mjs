/* Draft 4 palettes — adds NEO, a family themed on The Matrix (the original film first).
   Every draft-3 palette is carried over verbatim, so their colors and AA results are
   unchanged; the only new entries are NEO's four variants.

   NEO is black and green with violet and blue, and no red, with the accent slots
   re-hued the way Synthwave Sunset re-hues its "green" to orange:
     pink   → the title violet   (errors, radios, pressed chips, header border): the band
              behind "MATRIX" on the poster. Errors are violet here, not red: they still
              carry a ✗ glyph and a word, so the state never rides on hue alone.
     green  → the code rain      (H1-H3 via `headings`, success, switches)
     blue   → the indigo navy    (links, input focus, dropdowns, info)
     purple → the lead glyph     (H4, resting input borders, badges, warnings). On dark
              that is the pale white-green at the head of each falling column of code;
              on light it flips to Agent black, lettered in white.
   Dark is a true black with bright green text, as asked. Light keeps the same story on
   a light cool grey page with white panels: deep code-green text, the violet and
   indigo navy as solids. Neutral paper, not mint: the same green on green-tinted paper
   reads dull and grassy, and on grey it reads electric.

   The greens are sampled from stills of the films, at full resolution, not picked by eye:
     greens → the green-code corridor: glyph cores #35da65, bright code #59f380, the
              white-green sparkles at the head of each column #c9fbd4, darks #001800 up
              to #29a54c. (The Reloaded arch light, #b7d3b1, backs up the light border.)
   The violet is the owner's pick: #321a5f, in the family of the band behind "MATRIX" on
   the original poster. The blue is the owner's pick as well: indigo navy #2e3976.
   Where a color passes every pair its role has to meet, it is used as given. Where it
   does not — the owner's violet and blue are too dark to read on black, and the code
   green too bright to read on paper — the hue is held and the lightness moved only as
   far as the check requires. Everything that far lighter is about equally distant from
   the original, so chroma decides the look, per the owner's direction for each. That
   floor is set by the brightest surface text sits on, so dark NEO keeps its surfaces
   low: black page, #000c02 panels, #001800 raised surfaces, and rain no brighter than
   those. Against it: violet #925aff, #321a5f's own hue at the most chroma it has there
   (electric over close: nearer by the numbers is a dusty #8274b2), lettered in #0a021c;
   and blue #6c7ab5, #2e3976 lifted to the nearest passing color — a steel indigo, a
   little under its own chroma, where more chroma turns periwinkle — lettered in #070a1a.
   Like every other theme, each accent is one color for all its uses — text, headings,
   solid buttons — with its on-color lettering the button.
   Light NEO's greens are a cool emerald, hue 150: the pure code green (143) held the most
   chroma but read warm and grassy that dark, and bluer hues lose chroma fast (jade, 155,
   0.124; 160 turns teal). Each takes hue 150 at the most chroma in gamut, as light as its
   checks allow over the page, the panels and the rain's brightest glyph: strong border
   and focus ring #039946, at that limit; muted #2d7642 (chroma 0.11, so it stays a step
   under the accent); body text #005825, as light as a 7:1 floor allows; hairline border
   #9adca7. The accent green is the owner's #0e8f29 as near as it can get: #117e16. That
   green is too light for text on any light page (3.90:1 on this one, 4.22:1 on white, and
   white lettering on it 4.22:1), so the rain is held low to let the accent sit as close
   as it does. The accent is text as well as a button, so it is the one green. Only
   the rain, a backdrop nothing has to be read in, is brighter: electric spring green
   #07fa76, the same hue family at the most chroma it has. */
import { palettes as d3 } from './draft-3.mjs';

const neoDark = {
  mode: 'dark', name: 'NEO', cohort: 'Fresh · Dark', headings: { h1: 'green', h3: 'green' }, backdrop: 'rain',
  bg:'#000000', panel:'#000c02', elevated:'#001800', text:'#59f380', muted:'#29a54c',
  border:'#074410', borderStrong:'#197b39', focus:'#59f380',
  pink:'#925aff', onPink:'#0a021c', green:'#35da65', onGreen:'#001800',
  blue:'#6c7ab5', onBlue:'#070a1a', purple:'#c9fbd4', onPurple:'#001800',
};
const neoLight = {
  mode: 'light', name: 'NEO', cohort: 'Fresh · Light', headings: { h1: 'green', h3: 'green' }, backdrop: 'rain', rainColor: '#07fa76',
  bg:'#f4f6f9', panel:'#ffffff', elevated:'#ffffff', text:'#005825', muted:'#2d7642',
  border:'#9adca7', borderStrong:'#039946', focus:'#039946',
  pink:'#321a5f', onPink:'#ffffff', green:'#117e16', onGreen:'#ffffff',
  blue:'#2e3976', onBlue:'#ffffff', purple:'#001800', onPurple:'#ffffff',
};

export const palettes = {
  ...d3,

  // ===== NEO — the rain backdrop (tools/rain.mjs) in both modes, as strong as it can be
  // while every text, accent, focus and border color still passes over its brightest
  // glyph (palette-checks.mjs): on dark, a glyph head as bright as the raised surface and
  // no brighter (0.10), which is what lets the violet and blue go as deep as they do; on
  // light, electric spring-green glyphs on the cool grey page (0.15), as strong as the
  // accent green allows. Dark rains in its green accent; light in #07fa76, which at the
  // same contrast reads green where the dark accent green only greys the page.
  // Each has a no-background twin.
  'dark-07-neo':                   { ...neoDark, grid: 0.10 },
  'dark-07-neo-no-background':     { ...neoDark, grid: 0, description: 'No Background' },
  'light-07-neo':                  { ...neoLight, grid: 0.15 },
  'light-07-neo-no-background':    { ...neoLight, grid: 0, description: 'No Background' },
};
