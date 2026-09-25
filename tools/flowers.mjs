/* =============================================================================
   flowers.mjs — the blossom tiles behind the "flowers" backdrop (effects.css,
   --fx-flowers). Drawn for Rebecca (tools/palettes/draft-5.mjs).

   A gentle garden print: small violets, forget-me-nots and daisies, with buds,
   sprigs of leaves and a few loose petals, scattered loosely and drifting slowly
   down on a light breeze. Two tiles, drawn as a MASK like the rain: effects.css
   paints --fx-backdrop-color through them, so one pair of tiles serves any theme
   in its own color. The near tile carries the open flowers and is the larger, so
   it drifts the faster; the far tile carries buds and petals, smaller and
   fainter, and drifts slower. Each moves one tile across and two down in the same
   time, which is what reads as depth rather than a moving wallpaper.

   Every shape is drawn at alpha 1 at most, and mask layers composite with `add`
   (source-over), which cannot take a pixel past alpha 1 wherever the two tiles
   pass over each other. So the most opaque point anywhere is alpha 1, and the
   brightest thing text can sit on is the backdrop color at the theme's strength
   over the page: the same surface palette-checks.mjs validates for the rain.

   Deterministic (seeded), so the output only changes when this file does.
   Run:  node tools/flowers.mjs          # print the CSS
         node tools/flowers.mjs --write  # rewrite the block in themes/effects.css
   The block sits between the flowers:begin / flowers:end markers; flowers.test.mjs
   fails if effects.css and this file ever disagree.
   ============================================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The most opaque a shape is drawn; see above for why overlaps cannot exceed it. */
export const PEAK_ALPHA = 1;
/** One loop: its length in seconds, and how many steps it moves in. Slow (the near
 *  tile drifts about 5px a second) and stepped, as the rain is, to about ten
 *  repaints a second, which keeps a full-page layer cheap. At this speed a step is
 *  half a pixel, so the drift still reads as smooth. */
export const DURATION = 200, STEPS = 1920;
/** How far each tile moves per loop, in whole tiles (so the loop is seamless). */
export const DRIFT = { x: 1, y: 2 };

/* The shapes, each drawn once in <defs> about a 20px circle centered on 0,0 and
   placed with <use>, which keeps each tile's markup short: the tiles ship in every
   app's effects.css. Petals leave a small gap at the center, where a fainter eye
   sits, so the flower reads as a flower and not as a blot. */
const petal = (deg, d, rx, ry) => `<ellipse cy='-${d}' rx='${rx}' ry='${ry}' transform='rotate(${deg})'/>`;
const SHAPES = {
  // Violet: two upper petals, two side petals, a broad lower one.
  v: [petal(-28, 5.8, 3.5, 4.2), petal(28, 5.8, 3.5, 4.2), petal(-102, 5.1, 2.9, 3.6),
      petal(102, 5.1, 2.9, 3.6), petal(180, 5.9, 4.1, 4.1), `<circle r='1.1' fill-opacity='.5'/>`].join(''),
  // Forget-me-not: five round petals.
  f: [0, 72, 144, 216, 288].map(a => `<circle cy='-5.6' r='3.6' transform='rotate(${a})'/>`).join('') +
     `<circle r='1.2' fill-opacity='.5'/>`,
  // Daisy: twelve slim petals around a soft disc.
  d: Array.from({ length: 12 }, (_, i) => petal(i * 30, 6.3, 1.3, 3.5)).join('') +
     `<circle r='2.2' fill-opacity='.55'/>`,
  // Bud: a closed flower on its sepals and a short stem.
  b: `<path d='M0-9C4-5 4.2-.6 0 1.6-4.2-.6-4-5 0-9Z'/><path d='M0 1.6C2.4.8 4.4 2.2 5 4.8 2.6 4.9 1 3.6 0 1.6ZM0 1.6C-2.4.8-4.4 2.2-5 4.8-2.6 4.9-1 3.6 0 1.6Z'/>` +
     `<path d='M0 2Q1.2 6-.4 10' fill='none' stroke='#000' stroke-width='1.1' stroke-linecap='round'/>`,
  // A sprig: a curved stem with a leaf to each side.
  l: `<path d='M-1 10Q1.5 1 0-9' fill='none' stroke='#000' stroke-width='1.1' stroke-linecap='round'/>` +
     `<path d='M.6 3C3.4.6 6.8.8 9-1.8 6.2-4.2 2.4-2.6.6 3Z'/><path d='M.4-3.2C-2.4-5.6-6-5.4-8.4-8 -5.6-10.2-1.6-8.8.4-3.2Z'/>`,
  // A single loose petal, a little curled.
  p: `<path d='M0-5C3.4-3 3.1 2.8 0 5-2 2.4-2.4-2.4 0-5Z'/>`,
};

/* The two tiles. `mix` is [shape, how many, smallest and largest size in px,
   opacity, how far it may turn from upright]. Opacity is per placed shape and never
   above PEAK_ALPHA; the far tile is fainter, which is most of what sets it back. */
export const TILES = [
  { size: 480, gap: 20, seed: 0x72656265, mix: [          // near: the open flowers
    ['v', 6, 28, 38, 1, 35], ['f', 4, 22, 28, 1, 180], ['d', 3, 28, 36, 1, 180], ['l', 4, 26, 34, 0.55, 180],
  ] },
  { size: 336, gap: 16, seed: 0x63636121, mix: [          // far: buds, petals and small forget-me-nots
    ['b', 4, 16, 22, 0.8, 50], ['p', 5, 10, 14, 0.7, 180], ['f', 3, 13, 17, 0.75, 180],
  ] },
];

// mulberry32: small, seeded, good enough for placing flowers (the same as rain.mjs).
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n1 = v => +v.toFixed(1);

/** Distance between two points on a tile that wraps at `size` both ways. */
export function wrapDistance(a, b, size) {
  const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
  return Math.hypot(Math.min(dx, size - dx), Math.min(dy, size - dy));
}

/** Where each shape goes: scattered at random, no two closer than `gap` px apart
 *  edge to edge, measured across the tile's wrap so the repeat has no seam or clump.
 *  Largest first, so the big flowers get their pick of the space. */
export function layout({ size, gap, seed, mix }) {
  const rand = rng(seed), placed = [];
  const wanted = mix.flatMap(([shape, count, min, max, opacity, turn]) =>
    Array.from({ length: count }, () => ({ shape, opacity, d: n1(min + rand() * (max - min)), turn })))
    .sort((a, b) => b.d - a.d);
  for (const w of wanted) {
    for (let tries = 0; tries < 4000; tries++) {
      const at = { x: n1(rand() * size), y: n1(rand() * size) };
      if (placed.every(p => wrapDistance(p, at, size) >= (p.d + w.d) / 2 + gap)) {
        placed.push({ ...w, ...at, rot: Math.round((rand() * 2 - 1) * w.turn) });
        break;
      }
    }
  }
  return placed;
}

function tile(t) {
  const { size } = t, uses = [];
  for (const p of layout(t)) {
    const r = p.d / 2 + 1;   // + the stems' stroke
    // A shape crossing an edge is drawn again on the far side, so the tile repeats seamlessly.
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      const x = p.x + ox, y = p.y + oy;
      if (x + r < 0 || x - r > size || y + r < 0 || y - r > size) continue;
      uses.push(`<use href='#${p.shape}' transform='translate(${n1(x)} ${n1(y)}) rotate(${p.rot}) scale(${+(p.d / 20).toFixed(3)})'` +
        `${p.opacity < PEAK_ALPHA ? ` opacity='${p.opacity}'` : ''}/>`);
    }
  }
  const used = [...new Set(t.mix.map(([s]) => s))];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<defs>${used.map(s => `<g id='${s}'>${SHAPES[s]}</g>`).join('')}</defs>${uses.join('')}</svg>`;
  return `url("data:image/svg+xml,${svg.replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}

/** The CSS block effects.css carries between its flowers markers. */
export function flowersCss() {
  return `  /* GENERATED by tools/flowers.mjs — edit that file, then \`node tools/flowers.mjs --write\`. */\n` +
    `  --fx-flowers: ${TILES.map(tile).join(',\n    ')};\n` +
    `  --fx-flowers-size: ${TILES.map(t => `${t.size}px ${t.size}px`).join(', ')};\n` +
    `  --fx-flowers-drift: ${TILES.map(t => `${DRIFT.x * t.size}px ${DRIFT.y * t.size}px`).join(', ')};\n` +
    `  --fx-flowers-timing: ${DURATION}s steps(${STEPS});\n`;
}

export const BEGIN = '/* flowers:begin */', END = '/* flowers:end */';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--write')) {
    const file = fileURLToPath(new URL('../themes/effects.css', import.meta.url));
    const css = readFileSync(file, 'utf8');
    const a = css.indexOf(BEGIN), b = css.indexOf(END);
    if (a < 0 || b < a) { console.error(`effects.css has no ${BEGIN} … ${END} block.`); process.exit(1); }
    writeFileSync(file, css.slice(0, a + BEGIN.length) + '\n' + flowersCss() + '  ' + css.slice(b));
    console.log('Rewrote the flowers block in themes/effects.css.');
  } else {
    process.stdout.write(flowersCss());
  }
}
