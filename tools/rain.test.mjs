/* =============================================================================
   rain.test.mjs — the rain backdrop's tiles (tools/rain.mjs) and effects.css agree,
   and the tiles hold the property the contrast check relies on. `npm test`.
   ============================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rainCss, BEGIN, END, TILES, WIDTH, PITCH, ROW, PEAK_ALPHA } from './rain.mjs';

const effects = readFileSync(new URL('../themes/effects.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('effects.css carries exactly what tools/rain.mjs generates', () => {
  const a = effects.indexOf(BEGIN), b = effects.indexOf(END);
  assert.ok(a >= 0 && b > a, `effects.css needs a ${BEGIN} … ${END} block`);
  assert.equal(effects.slice(a + BEGIN.length, b), '\n' + rainCss() + '  ',
    'stale: run `node tools/rain.mjs --write`');
});

test('the two tiles never overlap, so the brightest pixel is one glyph', () => {
  // palette-checks.mjs validates the rain at PEAK_ALPHA x strength. That holds only if
  // no glyph from one tile lands on a glyph from the other: their columns must sit at
  // least a glyph's width apart (half-width glyphs are about 7px at 13px).
  const [x, y] = TILES.map(t => t.offset);
  const gap = Math.min(Math.abs(x - y), PITCH - Math.abs(x - y));
  assert.ok(gap >= 8, `columns only ${gap}px apart`);
  assert.equal(PEAK_ALPHA, 1);
  assert.equal(WIDTH % PITCH, 0, 'tiles must repeat on the column grid');
  for (const t of TILES) assert.equal(t.height % ROW, 0, 'tiles must repeat on the row grid');
});

test('each tile moves by exactly its own height, so the loop is seamless', () => {
  const fall = rainCss().match(/--fx-rain-fall: (.*);/)[1];
  assert.equal(fall, TILES.map(t => `0 ${t.height}px`).join(', '));
  const size = rainCss().match(/--fx-rain-size: (.*);/)[1];
  assert.equal(size, TILES.map(t => `${WIDTH}px ${t.height}px`).join(', '));
});

test('the tiles are safe inside a CSS url("…")', () => {
  for (const url of rainCss().match(/url\("[^"]*"\)/g)) {
    assert.doesNotMatch(url.slice(5, -2), /[#<>"]|[^\x00-\x7f]/, 'unescaped character in the data URI');
  }
  assert.equal(rainCss().match(/url\("/g).length, TILES.length);
});
