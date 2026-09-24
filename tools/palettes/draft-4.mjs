/* Draft 4 palettes — adds NEO, a family themed on The Matrix (the original film first).
   Every draft-3 palette is carried over verbatim, so their colors and AA results are
   unchanged; the only new entries are NEO's four variants.

   NEO is black and green with one steel grey, and no red or violet, with the accent slots
   re-hued the way Synthwave Sunset re-hues its "green" to orange:
     pink   → the same steel grey as blue (errors, radios, pressed chips, header border).
              Errors are steel grey here, not red, and share the info color: they still carry a
              ✗ glyph and a word (info an ⓘ), so neither state rides on hue alone.
     green  → the code rain      (H1-H3 via `headings`, success, switches)
     blue   → the steel grey     (links, input focus, dropdowns, info)
     purple → the lead glyph     (H4, resting input borders, badges, warnings). On dark
              that is the pale white-green at the head of each falling column of code;
              on light it flips to Agent black, lettered in white.
   Dark is a true black with bright green text, as asked. Light keeps the same story on
   a light cool grey page with white panels: deep code-green text, the steel grey as
   solids. Neutral paper, not mint: the same green on green-tinted paper reads dull and
   grassy, and on grey it reads electric.

   The greens are sampled from stills of the films, at full resolution, not picked by eye:
     greens → the green-code corridor: glyph cores #35da65, bright code #59f380, the
              white-green sparkles at the head of each column #c9fbd4, darks #001800 up
              to #29a54c. (The Reloaded arch light, #b7d3b1, backs up the light border.)
   The blue is a steel grey: the owner's indigo navy #2e3976 at under half its chroma and
   nudged from indigo (273) to steel blue (258), since a grey with an indigo cast reads
   lavender. It fills the pink slot too; a violet, #321a5f, was there until the owner
   chose the one color for both.
   Where a color passes every pair its role has to meet, it is used as given. Where it
   does not — the steel grey is too dark to read on black, and the code green too
   bright to read on paper — the hue is held and the lightness moved only as far as the
   check requires. Everything that far lighter is about equally distant from
   the original, so chroma decides the look, per the owner's direction for each. That
   floor is set by the brightest surface text sits on, so dark NEO keeps its surfaces
   low: black page, #000c02 panels, #001800 raised surfaces. Against them: steel grey
   #798aa4 (light NEO's #314058 lifted at the same hue and chroma, a shade above that
   floor so the rain's brightest glyph can sit higher and the rain fall at 0.17), lettered
   in #040b18.
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
   the rain, a backdrop nothing has to be read in, is brighter: neon #39ff14, on the
   digital-rain still's own hue. It paints only its glyphs, so the page between them stays
   the cool grey with no green in it (#f9fafc), kept as light as still sets it apart from
   the white panels, which gives the rain room to show. */
import { palettes as d3 } from './draft-3.mjs';

const neoDark = {
  mode: 'dark', name: 'NEO', cohort: 'Fresh · Dark', headings: { h1: 'green', h3: 'green' }, backdrop: 'rain',
  bg:'#000000', panel:'#000c02', elevated:'#001800', text:'#59f380', muted:'#29a54c',
  border:'#074410', borderStrong:'#197b39', focus:'#59f380',
  pink:'#798aa4', onPink:'#040b18', green:'#35da65', onGreen:'#001800',
  blue:'#798aa4', onBlue:'#040b18', purple:'#c9fbd4', onPurple:'#001800',
};
const neoLight = {
  mode: 'light', name: 'NEO', cohort: 'Fresh · Light', headings: { h1: 'green', h3: 'green' }, backdrop: 'rain', rainColor: '#39ff14',
  bg:'#f9fafc', panel:'#ffffff', elevated:'#ffffff', text:'#005825', muted:'#2d7642',
  border:'#9adca7', borderStrong:'#039946', focus:'#039946',
  pink:'#314058', onPink:'#ffffff', green:'#117e16', onGreen:'#ffffff',
  blue:'#314058', onBlue:'#ffffff', purple:'#001800', onPurple:'#ffffff',
};

export const palettes = {
  ...d3,

  // ===== NEO — the rain backdrop (tools/rain.mjs) in both modes, as strong as it can be
  // while every text, accent, focus and border color still passes over its brightest
  // glyph (palette-checks.mjs): on dark, 0.17, with the steel grey held a shade above its
  // floor so the rain can show (the strong border is the next limit); on
  // light, neon-green glyphs on the cool grey page (0.26), as strong as the accent green
  // allows. Dark rains in its green accent; light in neon #39ff14, the most chroma for the
  // least darkening, so at the same contrast it reads green where the accent only greys.
  // Each has a no-background twin.
  'dark-07-neo':                   { ...neoDark, grid: 0.17 },
  'dark-07-neo-no-background':     { ...neoDark, grid: 0, description: 'No Background' },
  'light-07-neo':                  { ...neoLight, grid: 0.26 },
  'light-07-neo-no-background':    { ...neoLight, grid: 0, description: 'No Background' },
};
