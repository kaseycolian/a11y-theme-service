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
import { PEAK_ALPHA as RAIN_PEAK } from './rain.mjs';
import { PEAK_ALPHA as FLOWERS_PEAK } from './flowers.mjs';

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

/** The accent each heading level uses (.t-h1 … .t-h4), emitted as --accent-h1 … --accent-h4.
 *  Optional palette field `headings`, e.g. { h1: 'green', h3: 'green' }; a level left
 *  out keeps the neon hierarchy every theme started with, pink → green → blue → purple.
 *  Each level names one of the four accents rather than carrying a color of its own, so
 *  it needs no pair here: that accent is already checked on every surface. It exists
 *  because the accents have other jobs too — pink is the error color, blue the link
 *  color — and a theme that wants its headings in another accent must not have to
 *  recolor its errors or its links to get them. */
export const HEADING_LEVELS = { h1: 'pink', h2: 'green', h3: 'blue', h4: 'purple' };
export function headingAccents(p) {
  const h = p.headings ?? {};
  for (const lvl of Object.keys(h)) {
    if (!(lvl in HEADING_LEVELS)) throw new Error(`headings: unknown level "${lvl}"; use ${Object.keys(HEADING_LEVELS).join(', ')}`);
  }
  return Object.fromEntries(Object.entries(HEADING_LEVELS).map(([lvl, def]) => {
    const a = h[lvl] ?? def;
    if (!ACCENTS.includes(a)) throw new Error(`headings.${lvl} must be one of ${ACCENTS.join(', ')}; got "${a}"`);
    return [lvl, a];
  }));
}

/** The accent field labels use (.field-label, and the dropdown's group headings, which
 *  are the same rank), emitted as --accent-label. Optional palette field `labels`, one
 *  accent name, e.g. 'purple'; green unless set. Like `headings`, it names an accent
 *  that is already checked on every surface, so it needs no pair of its own, and a
 *  theme can move its labels off green without recoloring its success states. */
export const LABEL_DEFAULT = 'green';
export function labelAccent(p) {
  const a = p.labels ?? LABEL_DEFAULT;
  if (!ACCENTS.includes(a)) throw new Error(`labels must be one of ${ACCENTS.join(', ')}; got "${a}"`);
  return a;
}

/** The page backdrop (effects.css .fx-grid). Optional palette field `backdrop`: 'grid',
 *  the crossing neon lines (default); 'rain', falling glyphs (tools/rain.mjs); or
 *  'flowers', drifting blossoms (tools/flowers.mjs). Rain and flowers are PATTERNS:
 *  tiles painted in one color, `backdropColor` (default: the theme's green for rain,
 *  its purple for flowers; rain also still takes the older `rainColor`). Whichever it
 *  is, its strength is the palette's `grid` (0 = off; omitted, the 0.22 effects.css
 *  falls back to). Text sits straight on the page, so for a pattern its brightest point
 *  — its most opaque pixel, the color at that strength over --bg, blended in sRGB as CSS
 *  opacity is — is checked as a surface of its own. The grid's 1px lines at a few
 *  percent are not. */
export const BACKDROPS = ['grid', 'rain', 'flowers'];
export const GRID_DEFAULT = 0.22;
/* Each pattern's tiles and pace live in effects.css, generated beside each other by its
   tool; a theme only points at them. The flowers' mask falls back to a transparent image,
   so a theme.css this new over an effects.css too old to carry the tiles draws no
   backdrop, rather than a solid wash of its color. */
const PATTERNS = {
  rain: { peak: RAIN_PEAK, color: p => p.backdropColor ?? p.rainColor ?? p.green,
    mask: 'var(--fx-rain)', size: 'var(--fx-rain-size)', anim: 'fx-rain', timing: 'var(--fx-rain-timing)' },
  flowers: { peak: FLOWERS_PEAK, color: p => p.backdropColor ?? p.purple,
    mask: 'var(--fx-flowers, linear-gradient(transparent, transparent))', size: 'var(--fx-flowers-size)',
    anim: 'fx-flowers', timing: 'var(--fx-flowers-timing)' },
};
export function backdrop(p) {
  const b = p.backdrop ?? 'grid';
  if (!BACKDROPS.includes(b)) throw new Error(`backdrop must be one of ${BACKDROPS.join(', ')}; got "${b}"`);
  for (const k of ['backdropColor', 'rainColor']) {
    if (p[k] !== undefined && !/^#[0-9a-f]{6}$/i.test(p[k])) throw new Error(`${k} must be a #rrggbb color; got "${p[k]}"`);
  }
  return b;
}
/** The pattern a palette shows ('rain' or 'flowers'), or null: the grid, or strength 0. */
export const pattern = p => {
  const b = backdrop(p);
  return b in PATTERNS && (p.grid ?? GRID_DEFAULT) > 0 ? b : null;
};
export const raining = p => pattern(p) === 'rain';

/** The pattern's brightest point over the page. Each channel rounds AWAY from --bg, so
 *  the hex it is checked as is never kinder than what the browser paints. */
export function backdropUnder(p) {
  const P = PATTERNS[backdrop(p)];
  if (!P) throw new Error(`backdrop "${backdrop(p)}" is not a pattern`);
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = (p.grid ?? GRID_DEFAULT) * P.peak, bg = rgb(p.bg), fg = rgb(P.color(p));
  return '#' + bg.map((b, i) => {
    const v = b + (fg[i] - b) * a;
    return (fg[i] > b ? Math.ceil(v) : Math.floor(v)).toString(16).padStart(2, '0');
  }).join('');
}
/** The brightest rain glyph over the page, for any palette, raining or not. */
export const rainUnder = p => backdropUnder({ ...p, backdrop: 'rain' });

/** The backdrop's custom properties, identical from both builders. A theme without a
 *  pattern resets all six to `initial`, which makes effects.css fall back to the grid,
 *  so a nested theme never inherits another's rain or flowers. */
export function backdropVars(p) {
  const on = pattern(p), P = PATTERNS[on];
  return {
    '--fx-backdrop-image': on ? 'none' : 'initial',
    '--fx-backdrop-color': on ? P.color(p) : 'initial',
    '--fx-backdrop-mask': on ? P.mask : 'initial',
    '--fx-backdrop-mask-size': on ? P.size : 'initial',
    '--fx-backdrop-anim': on ? P.anim : 'initial',
    '--fx-backdrop-timing': on ? P.timing : 'initial',
  };
}

const patternPairs = p => {
  const on = pattern(p);
  return on ? [
    [`text on ${on}`, 'text', 'backdropBg', 4.5],
    [`muted on ${on}`, 'muted', 'backdropBg', 4.5],
    ...ACCENTS.map(a => [`${a} text on ${on}`, a, 'backdropBg', 4.5]),
    [`focus ring on ${on}`, 'focus', 'backdropBg', 3.0],
    [`border-strong on ${on}`, 'borderStrong', 'backdropBg', 3.0],
  ] : [];
};

/** A palette key's value; `backdropBg` is the pattern's brightest point over the page. */
export const tokenValue = (p, k) => (k === 'backdropBg' ? backdropUnder(p) : p[k]);

/**
 * Check one palette against every pair, plus the pattern pairs when its backdrop is
 * rain or flowers. `ratio` is
 * the exact, unrounded value and `pass` compares it as-is. Throws on a missing or
 * invalid token (or `headings`, `labels`, `backdrop`), which both builders report as a problem
 * rather than letting it through.
 * @returns {Array<{label:string, fg:string, bg:string, min:number, ratio:number, pass:boolean}>}
 */
export function checkPalette(p) {
  headingAccents(p);
  labelAccent(p);
  backdrop(p);
  return [...PAIRS, ...patternPairs(p)].map(([label, fg, bg, min]) => {
    const ratio = contrastRatio(tokenValue(p, fg), tokenValue(p, bg));
    return { label, fg, bg, min, ratio, pass: ratio >= min };
  });
}
