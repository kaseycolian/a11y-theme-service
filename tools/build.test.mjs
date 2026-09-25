/* =============================================================================
   build.test.mjs — end to end: both builders refuse to write a theme that fails,
   and say which pair failed. Run: `npm test` from the repo root.

   Each run works on a throwaway copy of tools/ in the OS temp folder, so the real
   palettes (including your tools/palettes/local.mjs) and themes/ are never touched.
   ============================================================================= */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
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

test('build-final emits --accent-h1 … h4 on every theme: the named accents, else the neon order', () => {
  assert.equal(base.headings, undefined, 'fixture must leave headings unset');
  assert.notEqual(base.pink, base.green);
  assert.notEqual(base.blue, base.green);
  const dir = sandbox('final-heading', 'local.mjs', {
    'light-01-plain':  { ...base, name: 'Plain' },
    'light-02-headed': { ...base, name: 'Headed', headings: { h1: 'green', h3: 'green' } },
  });
  const r = run(dir, 'tools/build-final.mjs', '--no-builtin', '--write');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const css = readFileSync(join(dir, 'themes', 'theme.css'), 'utf8');
  const block = id => css.match(new RegExp(`\\[data-theme="${id}"\\] \\{[^}]*\\}`))?.[0] ?? '';
  const expect = { plain: [base.pink, base.green, base.blue, base.purple],
                   headed: [base.green, base.green, base.green, base.purple] };
  for (const [name, colors] of Object.entries(expect)) {
    colors.forEach((c, i) => assert.match(block(`${name}-light`), new RegExp(`--accent-h${i + 1}: ${c};`)));
  }
});

test('build-final emits the rain for a rain theme, the flowers for a flowers theme, and resets both on every other', () => {
  const dir = sandbox('final-rain', 'local.mjs', {
    'light-01-plain':  { ...base, name: 'Plain' },
    'light-02-rainy':  { ...base, name: 'Rainy', backdrop: 'rain', grid: 0.01 },
    'light-03-flowery': { ...base, name: 'Flowery', backdrop: 'flowers', grid: 0.01 },
  });
  const r = run(dir, 'tools/build-final.mjs', '--no-builtin', '--write');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const css = readFileSync(join(dir, 'themes', 'theme.css'), 'utf8');
  const block = id => css.match(new RegExp(`\\[data-theme="${id}"\\] \\{[^}]*\\}`))?.[0] ?? '';
  assert.match(block('rainy-light'), /--fx-backdrop-image: none;/);
  assert.match(block('rainy-light'), new RegExp(`--fx-backdrop-color: ${base.green};`));
  assert.match(block('rainy-light'), /--fx-backdrop-mask: var\(--fx-rain\);/);
  assert.match(block('rainy-light'), /--fx-backdrop-anim: fx-rain;/);
  assert.match(block('rainy-light'), /--fx-backdrop-timing: var\(--fx-rain-timing\);/);
  assert.match(block('flowery-light'), /--fx-backdrop-image: none;/);
  assert.match(block('flowery-light'), new RegExp(`--fx-backdrop-color: ${base.purple};`));
  assert.match(block('flowery-light'), /--fx-backdrop-mask: var\(--fx-flowers, /);
  assert.match(block('flowery-light'), /--fx-backdrop-mask-size: var\(--fx-flowers-size\);/);
  assert.match(block('flowery-light'), /--fx-backdrop-anim: fx-flowers;/);
  assert.match(block('flowery-light'), /--fx-backdrop-timing: var\(--fx-flowers-timing\);/);
  for (const v of ['image', 'color', 'mask', 'mask-size', 'anim', 'timing']) {
    assert.match(block('plain-light'), new RegExp(`--fx-backdrop-${v}: initial;`));
  }
  const tokens = JSON.parse(readFileSync(join(dir, 'themes', 'tokens.json'), 'utf8'));
  assert.equal(tokens.themes['rainy-light'].backdrop, 'rain');
  assert.equal(tokens.themes['flowery-light'].backdrop, 'flowers');
  assert.equal(tokens.themes['plain-light'].backdrop, 'grid');
});

test('npm run validate (build-palettes, report only) exits 1 when a theme fails', () => {
  const dir = sandbox('validate-fail', 'draft-99.mjs', FAILING);
  const r = run(dir, 'tools/build-palettes.mjs', '99');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /Draft 99: 4 FAILURES/);
});

test('npm run validate exits 0 when every theme passes', () => {
  const dir = sandbox('validate-pass', 'draft-98.mjs', { [baseKey]: base });
  const r = run(dir, 'tools/build-palettes.mjs', '98');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Draft 98: ALL PASS/);
});

test('build-palettes --write (discovery drafts) refuses the same themes', () => {
  const dir = sandbox('palettes-fail', 'draft-99.mjs', FAILING);
  const r = run(dir, 'tools/build-palettes.mjs', '99', '--write');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /muted on bg: 4\.49 \(need 4\.5\)/);
  assert.match(r.stdout, /border-strong on bg: \d\.\d+ \(need 3\)/);
  assert.match(r.stderr, /Refusing to write/);
  assert.equal(existsSync(join(dir, 'discovery', 'draft-99')), false, 'nothing may be written');
});

test('theme-select.js lists Automatic first, then families A→Z, each Dark → Light with its No Background twin after it, and no id text', () => {
  // Deliberately out of order: light before dark, a twin before its theme, Z before A.
  const p = (mode, name, extra = {}) => ({ ...base, mode, name, ...extra });
  const dir = sandbox('select-order', 'local.mjs', {
    'light-02-zeta-no-background': p('light', 'Zeta', { grid: 0, description: 'No Background' }),
    'light-02-zeta':               p('light', 'Zeta'),
    'dark-02-zeta':                p('dark', 'Zeta'),
    'light-01-alpha':              p('light', 'alpha'),
    'dark-01-alpha-no-background': p('dark', 'alpha', { grid: 0, description: 'No Background' }),
    'dark-01-alpha':               p('dark', 'alpha'),
  });
  const r = run(dir, 'tools/build-final.mjs', '--no-builtin', '--write');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const src = readFileSync(join(dir, 'themes', 'theme-select.js'), 'utf8');
  const list = JSON.parse(/var THEMES = (\[.*\]);/.exec(src)[1]);
  assert.deepEqual(list.map(t => t.id), ['',
    'alpha-dark', 'alpha-dark-no-background', 'alpha-light',
    'zeta-dark', 'zeta-light', 'zeta-light-no-background']);
  assert.equal(list[0].group, 'Automatic');
  assert.equal(list[0].secondary, 'follows your OS');
  assert.ok(list.slice(1).every(t => !('secondary' in t)), 'theme rows carry no secondary text');
});
