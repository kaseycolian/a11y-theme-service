/* =============================================================================
   flowers.test.mjs — the flowers backdrop's tiles (tools/flowers.mjs) and effects.css
   agree, and the tiles hold the properties the pattern relies on. `npm test`.
   ============================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { flowersCss, layout, wrapDistance, BEGIN, END, TILES, DRIFT, PEAK_ALPHA } from './flowers.mjs';

const effects = readFileSync(new URL('../themes/effects.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('effects.css carries exactly what tools/flowers.mjs generates', () => {
  const a = effects.indexOf(BEGIN), b = effects.indexOf(END);
  assert.ok(a >= 0 && b > a, `effects.css needs a ${BEGIN} … ${END} block`);
  assert.equal(effects.slice(a + BEGIN.length, b), '\n' + flowersCss() + '  ',
    'stale: run `node tools/flowers.mjs --write`');
});

test('effects.css animates the flowers with the drift they generate', () => {
  assert.match(effects, /@keyframes fx-flowers \{\s*to \{[^}]*mask-position: var\(--fx-flowers-drift\);/);
});

test('every flower is placed, none above full alpha, none crowding another', () => {
  // palette-checks.mjs validates the flowers at PEAK_ALPHA x strength; mask layers
  // composite with `add`, so no overlap can go past it. The spacing is for the look:
  // a loose scatter, no clumps, measured across the wrap so the repeat has no seam.
  assert.equal(PEAK_ALPHA, 1);
  for (const t of TILES) {
    const placed = layout(t);
    assert.equal(placed.length, t.mix.reduce((n, [, count]) => n + count, 0), `${t.size}px tile: not every shape fit`);
    for (const p of placed) assert.ok(p.opacity > 0 && p.opacity <= PEAK_ALPHA);
    placed.forEach((p, i) => placed.slice(i + 1).forEach(q =>
      assert.ok(wrapDistance(p, q, t.size) >= (p.d + q.d) / 2 + t.gap, `${p.shape} and ${q.shape} crowd each other`)));
  }
});

test('each tile drifts by whole tiles, so the loop is seamless', () => {
  assert.ok(Number.isInteger(DRIFT.x) && Number.isInteger(DRIFT.y) && DRIFT.y > 0);
  const drift = flowersCss().match(/--fx-flowers-drift: (.*);/)[1];
  assert.equal(drift, TILES.map(t => `${DRIFT.x * t.size}px ${DRIFT.y * t.size}px`).join(', '));
  const size = flowersCss().match(/--fx-flowers-size: (.*);/)[1];
  assert.equal(size, TILES.map(t => `${t.size}px ${t.size}px`).join(', '));
});

test('the same seed draws the same flowers', () => {
  assert.equal(flowersCss(), flowersCss());
  assert.deepEqual(layout(TILES[0]), layout(TILES[0]));
});

test('the tiles are safe inside a CSS url("…")', () => {
  for (const url of flowersCss().match(/url\("[^"]*"\)/g)) {
    assert.doesNotMatch(url.slice(5, -2), /[#<>"]|[^\x00-\x7f]/, 'unescaped character in the data URI');
  }
  assert.equal(flowersCss().match(/url\("/g).length, TILES.length);
});
