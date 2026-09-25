/* =============================================================================
   rain.mjs — the glyph tiles behind the "rain" backdrop (effects.css, --fx-rain).

   Falling columns of code, as in The Matrix: mirrored half-width katakana, digits
   and a few symbols, each column a bright head with a trail fading up behind it.
   Two tiles, drawn as a MASK: effects.css paints --fx-backdrop-color through them,
   so one pair of tiles serves every theme in its own color. They scroll down at
   different speeds (two heights, one animation), which is what reads as rain
   rather than a moving wallpaper.

   The two tiles put their columns on disjoint x positions, so a glyph from one
   never lands on a glyph from the other: the most opaque pixel anywhere is one
   head glyph at full alpha. That is what lets palette-checks.mjs validate the
   backdrop exactly — the brightest thing text can sit on is the theme's rain
   color at the backdrop's strength over the page.

   Deterministic (seeded), so the output only changes when this file does.
   Run:  node tools/rain.mjs          # print the CSS
         node tools/rain.mjs --write  # rewrite the block in themes/effects.css
   The block sits between the rain:begin / rain:end markers; rain.test.mjs fails
   if effects.css and this file ever disagree.
   ============================================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const PITCH = 22;          // column spacing; a half-width glyph is ~7px wide
export const ROW = 16;            // line height of a glyph
export const WIDTH = 20 * PITCH;  // 440 — both tiles, so columns stay aligned across tiles
// `streams`: the chance a column carries a first and a second stream of glyphs.
export const TILES = [
  { height: 40 * ROW, offset: 2,  streams: [0.85, 0.55] },   // 640
  { height: 52 * ROW, offset: 13, streams: [0.8, 0.5] },     // 832, offset half a pitch from the first
];
/** A head glyph is drawn at full alpha; everything else is fainter. */
export const PEAK_ALPHA = 1;
/** One fall: each tile moves its own height in DURATION seconds (two heights, two
 *  speeds), stepped to about 16 repaints a second. At this speed that is still under
 *  a pixel a step, and it keeps a full-page layer cheap. */
export const DURATION = 60, STEPS = 960;

const GLYPHS = [
  ...Array.from({ length: 0xff9d - 0xff66 + 1 }, (_, i) => 0xff66 + i),  // half-width katakana
  ...'0123456789'.split('').map(c => c.codePointAt(0)),
  ...'Z:."=*+-<>|'.split('').map(c => c.codePointAt(0)),
];

// mulberry32: small, seeded, good enough for placing glyphs.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const glyph = cp => (cp < 0x80 ? { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[String.fromCodePoint(cp)] ?? String.fromCodePoint(cp) : `&#${cp};`);

// Trail alphas are quantized to twentieths and named by class (.a13 = 0.65), which
// keeps each glyph's markup short: the tiles ship in every app's effects.css.
const LEVELS = 14;   // 0.05 … 0.70

function tile({ height, offset, streams }, seed) {
  const rand = rng(seed), rows = height / ROW, cols = [];
  for (let col = 0; col < WIDTH / PITCH; col++) {
    const taken = new Set(), out = [];
    // Up to two streams per column, the second roughly half a tile below the first.
    // A cell is drawn at most once, so no two glyphs ever stack their alpha.
    let head = Math.floor(rand() * rows);
    for (const chance of streams) {
      if (rand() < chance) {
        const length = 6 + Math.floor(rand() * 15);      // 6–20 glyphs
        for (let i = 0; i < length; i++) {
          const row = (head - i + rows) % rows;          // wraps, so the tile repeats seamlessly
          const level = i === 0 ? null : Math.round(LEVELS * (1 - i / length) ** 1.2);
          if (taken.has(row) || level === 0) continue;
          taken.add(row);
          const cp = GLYPHS[Math.floor(rand() * GLYPHS.length)];
          out.push(`<text y='${(row + 1) * ROW - 3}'${level ? ` class='a${level}'` : ''}>${glyph(cp)}</text>`);
        }
      }
      head = (head + Math.floor(rows / 2) + Math.floor(rand() * rows / 4) - Math.floor(rows / 8)) % rows;
    }
    if (out.length) cols.push(`<g transform='translate(${col * PITCH + offset})'>${out.join('')}</g>`);
  }
  const classes = Array.from({ length: LEVELS }, (_, i) => `.a${i + 1}{fill-opacity:${+((i + 1) / 20).toFixed(2)}}`).join('');
  // Mirrored as a whole, the way the film's glyphs are.
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${WIDTH}' height='${height}'>` +
    `<style>text{font:13px 'MS Gothic','Hiragino Kaku Gothic ProN','Noto Sans Mono CJK JP',monospace}${classes}</style>` +
    `<g transform='matrix(-1 0 0 1 ${WIDTH} 0)'>${cols.join('')}</g></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}

/** The CSS block effects.css carries between its rain markers. */
export function rainCss() {
  const urls = TILES.map((t, i) => tile(t, 0x6e656f + i));
  return `  /* GENERATED by tools/rain.mjs — edit that file, then \`node tools/rain.mjs --write\`. */\n` +
    `  --fx-rain: ${urls.join(',\n    ')};\n` +
    `  --fx-rain-size: ${TILES.map(t => `${WIDTH}px ${t.height}px`).join(', ')};\n` +
    `  --fx-rain-fall: ${TILES.map(t => `0 ${t.height}px`).join(', ')};\n` +
    `  --fx-rain-timing: ${DURATION}s steps(${STEPS});\n`;
}

export const BEGIN = '/* rain:begin */', END = '/* rain:end */';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--write')) {
    const file = fileURLToPath(new URL('../themes/effects.css', import.meta.url));
    const css = readFileSync(file, 'utf8');
    const a = css.indexOf(BEGIN), b = css.indexOf(END);
    if (a < 0 || b < a) { console.error(`effects.css has no ${BEGIN} … ${END} block.`); process.exit(1); }
    writeFileSync(file, css.slice(0, a + BEGIN.length) + '\n' + rainCss() + '  ' + css.slice(b));
    console.log('Rewrote the rain block in themes/effects.css.');
  } else {
    process.stdout.write(rainCss());
  }
}
