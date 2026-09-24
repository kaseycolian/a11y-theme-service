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
import { PAIRS, checkPalette } from './palette-checks.mjs';

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
