/* =============================================================================
   contrast.test.mjs — tests for the standalone checker, library and CLI.
   Run: `npm test` from the repo root, or `node --test` in this folder. Uses only
   node:test, so the tests travel with the checker if you copy it elsewhere.
   ============================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrastRatio, floor2, round2, rate, checkPairs } from './contrast.mjs';

const CLI = fileURLToPath(new URL('./cli.mjs', import.meta.url));

// A real color pair just under AA: 4.4959:1. Rounded to two decimals it reads 4.50,
// which is the whole trap: it looks like a pass and isn't one.
const NEAR_MISS = { fg: '#70768e', bg: '#ffffff' };

test('the near-miss fixture sits just under 4.5:1, and rounding hides it', () => {
  const r = contrastRatio(NEAR_MISS.fg, NEAR_MISS.bg);
  assert.ok(r < 4.5 && r >= 4.495, `expected just under 4.5, got ${r}`);
  assert.equal(round2(r), 4.5); // why comparing a rounded ratio was a bug
});

test('contrastRatio matches the known extremes', () => {
  assert.equal(contrastRatio('#ffffff', '#000000'), 21);
  assert.equal(contrastRatio('#000000', '#ffffff'), 21); // order doesn't matter
  assert.equal(contrastRatio('#777', '#777777'), 1);     // 3-digit hex expands
});

test('floor2 truncates to two decimals and never rounds up', () => {
  assert.equal(floor2(4.4959), 4.49);
  assert.equal(floor2(2.9999), 2.99);
  assert.equal(floor2(4.4999999), 4.49);
  assert.equal(floor2(4.5), 4.5);
  assert.equal(floor2(13.891948777524014), 13.89);
});

test('floor2 is not thrown off by binary float noise', () => {
  assert.equal(floor2(4.35), 4.35);  // 4.35 * 100 = 434.99999999999994
  assert.equal(floor2(1.005), 1);    // 1.005 is really 1.00499999999999989...
  assert.equal(floor2(21), 21);
});

test('rate() judges the unrounded ratio and shows a truncated one', () => {
  const r = rate(NEAR_MISS.fg, NEAR_MISS.bg);
  assert.equal(r.AA_normal, false);
  assert.equal(r.ratio, 4.49); // was 4.5 when it rounded
  assert.equal(r.AA_large, true);
  assert.equal(rate('#ffffff', '#000000').ratio, 21);
});

test('checkPairs() fails a pair just under its minimum', () => {
  const res = checkPairs([{ ...NEAR_MISS, min: 4.5, label: 'near miss' }]);
  assert.equal(res.ok, false);
  assert.equal(res.failed, 1);
  assert.equal(res.results[0].pass, false);
  assert.equal(res.results[0].ratio, 4.49);
});

test('checkPairs() treats the minimum as inclusive', () => {
  const exact = contrastRatio('#767676', '#ffffff');
  const res = checkPairs([{ fg: '#767676', bg: '#ffffff', min: exact }]);
  assert.equal(res.ok, true);
});

test('checkPairs() uses the default minimum when a pair has none', () => {
  assert.equal(checkPairs([NEAR_MISS]).ok, false);    // default 4.5
  assert.equal(checkPairs([NEAR_MISS], 3).ok, true);  // e.g. large text or UI
});

function cli(...args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout.replace(/\x1b\[[0-9;]*m/g, '') };
}

test('CLI single pair: --min fails a near miss and shows 4.49, not 4.50', () => {
  const { status, out } = cli(NEAR_MISS.fg, NEAR_MISS.bg, '--min', '4.5');
  assert.equal(status, 1);
  assert.match(out, /Ratio: 4\.49:1/);
  assert.match(out, /vs --min 4\.5: FAIL/);
});

test('CLI single pair: --min compares the exact ratio, not the displayed one', () => {
  // 4.4959 clears a custom 4.495 minimum even though it displays as 4.49.
  const { status, out } = cli(NEAR_MISS.fg, NEAR_MISS.bg, '--min', '4.495');
  assert.equal(status, 0);
  assert.match(out, /vs --min 4\.495: PASS/);
});

test('CLI single pair: a passing pair exits 0', () => {
  const { status, out } = cli('#ffffff', '#000000', '--min', '4.5');
  assert.equal(status, 0);
  assert.match(out, /vs --min 4\.5: PASS/);
});

test('CLI --file: a near miss fails and exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'contrast-cli-'));
  try {
    const file = join(dir, 'pairs.json');
    writeFileSync(file, JSON.stringify([
      { ...NEAR_MISS, min: 4.5, label: 'near miss' },
      { fg: '#ffffff', bg: '#000000', min: 4.5, label: 'white on black' },
    ]));
    const { status, out } = cli('--file', file);
    assert.equal(status, 1);
    assert.match(out, /FAIL\s+4\.49:1 {2}\(min 4\.5\) {2}near miss/);
    assert.match(out, /PASS\s+21\.00:1/);
    assert.match(out, /1 passed, 1 failed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
