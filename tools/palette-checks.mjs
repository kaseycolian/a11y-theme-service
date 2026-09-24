/* =============================================================================
   palette-checks.mjs — the WCAG 2.2 AA pairs every theme has to pass.

   ONE list, used by both builders: build-final.mjs (`npm run build-themes`, which
   writes themes/) and build-palettes.mjs (`npm run validate` and the discovery
   drafts). Sharing it is what guarantees validate can never pass a theme the build
   refuses; the two used to carry their own copies, kept in step by hand.

   Pass/fail compares the UNROUNDED ratio. WCAG thresholds are exact: "4.499:1
   would not meet the 4.5:1 threshold" (Understanding SC 1.4.3). Anything shown to
   a person is truncated with floor2 (contrast-checker/contrast.mjs), never rounded
   up past the line.

   Tested by palette-checks.test.mjs; build.test.mjs runs both builders end to end.
   ============================================================================= */
import { contrastRatio } from './contrast-checker/contrast.mjs';

const ACCENTS = ['pink', 'green', 'blue', 'purple'];
const cap = a => a[0].toUpperCase() + a.slice(1);

/** Every checked pair, in report order: [label, fg key, bg key, minimum ratio].
 *  Keys are the palette's own (tools/palettes/*.mjs), not CSS custom properties. */
export const PAIRS = [
  ['text on bg', 'text', 'bg', 4.5],
  ['text on panel', 'text', 'panel', 4.5],
  ['muted on bg', 'muted', 'bg', 4.5],
  ['muted on panel', 'muted', 'panel', 4.5],
  ...ACCENTS.flatMap(a => [
    [`${a} text on bg`, a, 'bg', 4.5],
    [`${a} text on panel`, a, 'panel', 4.5],
    [`on-${a} on ${a} fill`, 'on' + cap(a), a, 4.5],
  ]),
  ['focus ring on bg', 'focus', 'bg', 3.0],
  ['focus ring on panel', 'focus', 'panel', 3.0],
  // --border-strong is the visible edge of ghost and icon buttons, the switch track
  // and toggle chips (components.css). Those sit on the page and inside menus as
  // often as on panels, so it is checked on all three surfaces.
  ['border-strong on bg', 'borderStrong', 'bg', 3.0],
  ['border-strong on panel', 'borderStrong', 'panel', 3.0],
  // --bg-elevated is a real text surface, not just a shade: the dropdown panel
  // (dropdown.css) and .drop-panel both paint labels, muted secondary text, group
  // headings and the focus border straight onto it. Left unchecked, a new theme
  // could pass every other pair and still ship an unreadable open dropdown.
  ['text on elevated', 'text', 'elevated', 4.5],
  ['muted on elevated', 'muted', 'elevated', 4.5],
  ...ACCENTS.map(a => [`${a} text on elevated`, a, 'elevated', 4.5]),
  ['focus ring on elevated', 'focus', 'elevated', 3.0],
  ['border-strong on elevated', 'borderStrong', 'elevated', 3.0],
];

/**
 * Check one palette against every pair. `ratio` is the exact, unrounded value and
 * `pass` compares it as-is. Throws on a missing or invalid token, which both
 * builders report as a problem rather than letting it through.
 * @returns {Array<{label:string, fg:string, bg:string, min:number, ratio:number, pass:boolean}>}
 */
export function checkPalette(p) {
  return PAIRS.map(([label, fg, bg, min]) => {
    const ratio = contrastRatio(p[fg], p[bg]);
    return { label, fg, bg, min, ratio, pass: ratio >= min };
  });
}
