/* =============================================================================
   palette-checks.test.mjs — tests for the AA pair list both builders share.
   Run: `npm test` from the repo root.

   Fixtures are derived from the shipped built-ins rather than typed in, and each
   one asserts the property it depends on first, so a future palette change breaks
   loudly instead of quietly testing nothing.
   ============================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { contrastRatio, round2 } from './contrast-checker/contrast.mjs';
import { PAIRS, checkPalette, headingAccents, rainUnder, backdropUnder, backdropVars } from './palette-checks.mjs';

// The built-ins that ship: the highest-numbered draft, the same rule the Pages
// workflow uses to pick what to build.
const latest = Math.max(...readdirSync(new URL('./palettes/', import.meta.url))
  .map(f => /^draft-(\d+)\.mjs$/.exec(f)?.[1]).filter(Boolean).map(Number));
const { palettes: BUILTINS } = await import(`./palettes/draft-${latest}.mjs`);

const failing = p => checkPalette(p).filter(x => !x.pass).map(x => x.label);
const SURFACES = ['bg', 'panel', 'elevated'];

// First gray, scanning from `from` towards `to`, that satisfies `ok`.
function findGray(ok, from, to) {
  const step = from < to ? 1 : -1;
  for (let v = from; v !== to + step; v += step) {
    const hex = '#' + v.toString(16).padStart(2, '0').repeat(3);
    if (ok(hex)) return hex;
  }
  return null;
}

test('every surface gets every check: text 4.5:1, focus ring and strong border 3:1', () => {
  const has = (fg, bg, min) => PAIRS.some(([, f, b, m]) => f === fg && b === bg && m === min);
  for (const s of SURFACES) {
    for (const fg of ['text', 'muted', 'pink', 'green', 'blue', 'purple']) {
      assert.ok(has(fg, s, 4.5), `missing ${fg} on ${s} at 4.5:1`);
    }
    assert.ok(has('focus', s, 3), `missing focus on ${s} at 3:1`);
    assert.ok(has('borderStrong', s, 3), `missing borderStrong on ${s} at 3:1`);
  }
  for (const a of ['Pink', 'Green', 'Blue', 'Purple']) {
    assert.ok(has('on' + a, a.toLowerCase(), 4.5), `missing on${a} on its fill at 4.5:1`);
  }
});

test('pair labels are unique', () => {
  const labels = PAIRS.map(([label]) => label);
  assert.equal(new Set(labels).size, labels.length);
});

test(`every shipped built-in theme passes (draft ${latest})`, () => {
  for (const [id, p] of Object.entries(BUILTINS)) {
    assert.deepEqual(failing(p), [], `${id} fails`);
  }
});

test('pass/fail uses the unrounded ratio: a 4.4959:1 near miss fails', () => {
  // All surfaces white, so every other pair in a light theme only gets easier and
  // the muted text is the one thing near the line.
  const [, base] = Object.entries(BUILTINS).find(([, p]) => p.mode === 'light');
  const p = { ...base, bg: '#ffffff', panel: '#ffffff', elevated: '#ffffff', muted: '#70768e' };
  const r = contrastRatio(p.muted, '#ffffff');
  assert.ok(r < 4.5 && round2(r) === 4.5, `fixture should round up to 4.5, got ${r}`);

  assert.deepEqual(failing(p), ['muted on bg', 'muted on panel', 'muted on elevated']);
  // The old check rounded to two decimals before comparing, which passed all three.
  const passedWhenRounded = checkPalette(p).filter(x => round2(x.ratio) < x.min);
  assert.deepEqual(passedWhenRounded, []);
});

test('a strong border that fails only on the page background is caught', () => {
  // A light theme whose page background is darker than its panels: a gray border
  // can clear 3:1 on the panels and still miss it on the page.
  const base = Object.values(BUILTINS).find(p => p.mode === 'light' && p.bg !== p.panel);
  assert.ok(base, 'needs a light built-in whose bg differs from its panel');
  const edge = findGray(h => contrastRatio(h, base.panel) >= 3 && contrastRatio(h, base.elevated) >= 3
    && contrastRatio(h, base.bg) < 3, 0x00, 0xff);
  assert.ok(edge, 'no gray passes on panel and elevated but fails on bg');

  assert.deepEqual(failing({ ...base, borderStrong: edge }), ['border-strong on bg']);
});

test('a strong border that fails only on the elevated surface is caught', () => {
  // A dark theme whose elevated surface is the lightest of the three: a light gray
  // border can clear 3:1 on the page and panels and still miss it in menus.
  const base = Object.values(BUILTINS).find(p => p.mode === 'dark'
    && contrastRatio(p.elevated, '#000000') > contrastRatio(p.panel, '#000000'));
  assert.ok(base, 'needs a dark built-in whose elevated surface is lighter than its panel');
  const edge = findGray(h => contrastRatio(h, base.bg) >= 3 && contrastRatio(h, base.panel) >= 3
    && contrastRatio(h, base.elevated) < 3, 0xff, 0x00);
  assert.ok(edge, 'no gray passes on bg and panel but fails on elevated');

  assert.deepEqual(failing({ ...base, borderStrong: edge }), ['border-strong on elevated']);
});

test('a missing or invalid token throws instead of passing', () => {
  const [, base] = Object.entries(BUILTINS)[0];
  assert.throws(() => checkPalette({ ...base, borderStrong: undefined }));
  assert.throws(() => checkPalette({ ...base, text: 'not-a-color' }));
});

test('each heading level names one of the four accents, and keeps the neon order when omitted', () => {
  const base = Object.values(BUILTINS).find(p => p.headings === undefined);
  assert.ok(base, 'needs a built-in that leaves headings unset');
  assert.deepEqual(headingAccents(base), { h1: 'pink', h2: 'green', h3: 'blue', h4: 'purple' });
  // Only the levels named change.
  assert.deepEqual(headingAccents({ ...base, headings: { h1: 'green', h3: 'green' } }),
    { h1: 'green', h2: 'green', h3: 'green', h4: 'purple' });
  // A color is not an accent name: a heading must reuse a checked accent.
  assert.throws(() => checkPalette({ ...base, headings: { h1: 'red' } }));
  assert.throws(() => checkPalette({ ...base, headings: { h3: '#00ff41' } }));
  assert.throws(() => checkPalette({ ...base, headings: { h5: 'green' } }), /unknown level/);
});

test('rain adds its checks only when it is on, against its brightest glyph over the page', () => {
  const base = Object.values(BUILTINS).find(p => p.mode === 'dark' && p.backdrop === undefined);
  assert.ok(base, 'needs a dark built-in on the default grid backdrop');
  const labels = p => checkPalette(p).map(x => x.label).filter(l => l.endsWith('on rain'));
  assert.deepEqual(labels(base), [], 'grid: no rain pairs');
  assert.deepEqual(labels({ ...base, backdrop: 'rain', grid: 0 }), [], 'rain at 0 is off');
  assert.equal(labels({ ...base, backdrop: 'rain', grid: 0.1 }).length, 8);

  // CSS opacity is an sRGB blend; each channel rounds away from the page so the check
  // is never kinder than the paint. White over black at half strength: 127.5 -> 128.
  assert.equal(rainUnder({ bg: '#000000', green: '#ffffff', grid: 0.5 }), '#808080');
  assert.equal(rainUnder({ bg: '#ffffff', green: '#000000', grid: 0.5 }), '#7f7f7f');
  // Omitted strength is the 0.22 effects.css falls back to.
  assert.equal(rainUnder({ bg: '#000000', green: '#ffffff' }), rainUnder({ bg: '#000000', green: '#ffffff', grid: 0.22 }));
});

test('rain strong enough to wash out the text fails, and names what failed', () => {
  const base = Object.values(BUILTINS).find(p => p.mode === 'dark' && p.backdrop === undefined);
  const bad = failing({ ...base, backdrop: 'rain', grid: 1 });
  assert.ok(bad.includes('muted on rain'), `expected muted on rain among ${bad}`);
  assert.throws(() => checkPalette({ ...base, backdrop: 'snow' }));
});

test('backdropVars: a pattern sets the six effect tokens; anything else resets them to the grid', () => {
  const base = Object.values(BUILTINS).find(p => p.backdrop === undefined);
  const off = Array(6).fill('initial');
  assert.deepEqual(Object.values(backdropVars(base)), off);
  assert.deepEqual(Object.values(backdropVars({ ...base, backdrop: 'rain', grid: 0 })), off);
  assert.deepEqual(Object.values(backdropVars({ ...base, backdrop: 'flowers', grid: 0 })), off);
  assert.deepEqual(backdropVars({ ...base, backdrop: 'rain', grid: 0.1 }), {
    '--fx-backdrop-image': 'none', '--fx-backdrop-color': base.green,
    '--fx-backdrop-mask': 'var(--fx-rain)', '--fx-backdrop-mask-size': 'var(--fx-rain-size)',
    '--fx-backdrop-anim': 'fx-rain', '--fx-backdrop-timing': 'var(--fx-rain-timing)',
  });
  // The flowers' mask falls back to nothing, so an old effects.css draws no backdrop
  // rather than a solid wash of the color.
  assert.deepEqual(backdropVars({ ...base, backdrop: 'flowers', grid: 0.1 }), {
    '--fx-backdrop-image': 'none', '--fx-backdrop-color': base.purple,
    '--fx-backdrop-mask': 'var(--fx-flowers, linear-gradient(transparent, transparent))',
    '--fx-backdrop-mask-size': 'var(--fx-flowers-size)',
    '--fx-backdrop-anim': 'fx-flowers', '--fx-backdrop-timing': 'var(--fx-flowers-timing)',
  });
});

test('rainColor, when set, is what rains and what is checked', () => {
  const base = Object.values(BUILTINS).find(p => p.mode === 'dark' && p.backdrop === undefined);
  const rainy = { ...base, backdrop: 'rain', grid: 0.1, rainColor: '#ffffff' };
  assert.equal(backdropVars(rainy)['--fx-backdrop-color'], '#ffffff');
  assert.equal(rainUnder(rainy), rainUnder({ bg: base.bg, green: '#ffffff', grid: 0.1 }));
  assert.throws(() => checkPalette({ ...rainy, rainColor: 'green' }));
});

test('flowers add their checks only when on, against their most opaque point over the page', () => {
  const base = Object.values(BUILTINS).find(p => p.mode === 'dark' && p.backdrop === undefined);
  const labels = p => checkPalette(p).map(x => x.label).filter(l => l.endsWith('on flowers'));
  assert.deepEqual(labels(base), [], 'grid: no flower pairs');
  assert.deepEqual(labels({ ...base, backdrop: 'flowers', grid: 0 }), [], 'flowers at 0 are off');
  assert.equal(labels({ ...base, backdrop: 'flowers', grid: 0.1 }).length, 8);
  // Same blend as the rain, in the flowers' own color: the purple unless set.
  const flowery = { ...base, backdrop: 'flowers', grid: 0.3 };
  assert.equal(backdropUnder(flowery), rainUnder({ bg: base.bg, green: base.purple, grid: 0.3 }));
  // Strong enough to wash out the text, they fail and say so.
  assert.ok(failing({ ...base, backdrop: 'flowers', grid: 1, backdropColor: base.muted })
    .includes('muted on flowers'));
});

test('backdropColor, when set, is the pattern color for rain and flowers alike', () => {
  const base = Object.values(BUILTINS).find(p => p.mode === 'dark' && p.backdrop === undefined);
  for (const backdrop of ['rain', 'flowers']) {
    const p = { ...base, backdrop, grid: 0.1, backdropColor: '#ffffff', rainColor: '#000000' };
    assert.equal(backdropVars(p)['--fx-backdrop-color'], '#ffffff', `${backdrop}: backdropColor wins`);
    assert.equal(backdropUnder(p), rainUnder({ bg: base.bg, green: '#ffffff', grid: 0.1 }));
  }
  assert.throws(() => checkPalette({ ...base, backdrop: 'flowers', backdropColor: 'purple' }));
});
