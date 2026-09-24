/* =============================================================================
   build.test.mjs — end to end: both builders refuse to write a theme that fails,
   and say which pair failed. Run: `npm test` from the repo root.

   Each run works on a throwaway copy of tools/ in the OS temp folder, so the real
   palettes (including your tools/palettes/local.mjs) and themes/ are never touched.
   ============================================================================= */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { contrastRatio } from './contrast-checker/contrast.mjs';

const TOOLS = fileURLToPath(new URL('.', import.meta.url));
const latest = Math.max(...readdirSync(join(TOOLS, 'palettes'))
  .map(f => /^draft-(\d+)\.mjs$/.exec(f)?.[1]).filter(Boolean).map(Number));
const { palettes: BUILTINS } = await import(`./palettes/draft-${latest}.mjs`);

// Two themes that fail in exactly the ways the old checks let through, built from
// a shipped light theme: muted text at 4.4959:1 (rounds to 4.50), and a strong
// border that clears 3:1 on the panels but not on the page background.
const [baseKey, base] = Object.entries(BUILTINS).find(([, p]) => p.mode === 'light' && p.bg !== p.panel);
let edge = null;
for (let v = 0; v <= 0xff && !edge; v++) {
  const hex = '#' + v.toString(16).padStart(2, '0').repeat(3);
  if (contrastRatio(hex, base.panel) >= 3 && contrastRatio(hex, base.elevated) >= 3
      && contrastRatio(hex, base.bg) < 3) edge = hex;
}
const FAILING = {
  'light-90-near-miss': { ...base, name: 'Near Miss', bg: '#ffffff', panel: '#ffffff',
                          elevated: '#ffffff', muted: '#70768e' },
  'light-91-border-edge': { ...base, name: 'Border Edge', borderStrong: edge },
};

let root;
before(() => { root = mkdtempSync(join(tmpdir(), 'theme-build-')); });
after(() => rmSync(root, { recursive: true, force: true }));

// A fresh copy of tools/ with `palettes` written to `file` inside tools/palettes/.
function sandbox(name, file, palettes) {
  const dir = join(root, name);
  cpSync(TOOLS, join(dir, 'tools'), { recursive: true });
  writeFileSync(join(dir, 'tools', 'palettes', file),
    `export const palettes = ${JSON.stringify(palettes, null, 2)};\n`);
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8' });

test('fixtures are set up the way the tests below assume', () => {
  assert.ok(edge, 'no gray passes on panel and elevated but fails on bg');
  assert.ok(contrastRatio('#70768e', '#ffffff') < 4.5);
});

test('build-final (npm run build-themes) refuses a failing theme and names the pair', () => {
  const dir = sandbox('final-fail', 'local.mjs', FAILING);
  const r = run(dir, 'tools/build-final.mjs', '--no-builtin', '--write');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /FAIL local "light-90-near-miss" — 3 AA failure\(s\)/);
  assert.match(r.stdout, /--text-muted on --bg: 4\.49:1, needs 4\.5:1/);
  assert.match(r.stdout, /FAIL local "light-91-border-edge" — 1 AA failure\(s\)/);
  assert.match(r.stdout, /--border-strong on --bg: \d\.\d+:1, needs 3:1/);
  assert.match(r.stderr, /Refusing to write/);
  assert.equal(existsSync(join(dir, 'themes')), false, 'nothing may be written');
});

test('build-final still writes a theme that passes', () => {
  const dir = sandbox('final-pass', 'local.mjs', { [baseKey]: base });
  const r = run(dir, 'tools/build-final.mjs', '--no-builtin', '--write');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /ALL PASS/);
  assert.ok(existsSync(join(dir, 'themes', 'theme.css')));
});

test('build-palettes (npm run validate, discovery drafts) refuses the same themes', () => {
  const dir = sandbox('palettes-fail', 'draft-99.mjs', FAILING);
  const r = run(dir, 'tools/build-palettes.mjs', '99', '--write');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /muted on bg: 4\.49 \(need 4\.5\)/);
  assert.match(r.stdout, /border-strong on bg: \d\.\d+ \(need 3\)/);
  assert.match(r.stderr, /Refusing to write/);
  assert.equal(existsSync(join(dir, 'discovery', 'draft-99')), false, 'nothing may be written');
});
