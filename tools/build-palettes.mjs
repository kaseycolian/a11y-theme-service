/* =============================================================================
   build-palettes.mjs — draft-aware palette generator.
   Loads tools/palettes/draft-<n>.mjs, validates every color pair against WCAG AA
   with the standalone ./contrast-checker library, and (with --write) emits into
   discovery/draft-<n>/:
     palettes/<id>.css      one token file per palette
     data/contrast.json     computed AA report (all pairs)
     data/contrast.js       same report as window.CONTRAST (for file://)

   Run:   node tools/build-palettes.mjs <draft>            # report only  (e.g. 2)
          node tools/build-palettes.mjs <draft> --write    # report + regenerate files

   Paths resolve relative to the repo root (this file's ../) — no machine-specific
   absolute paths, safe to commit and run anywhere.
   ============================================================================= */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { contrastRatio, round2 } from './contrast-checker/contrast.mjs';
import { fullLabel } from './theme-name.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');

const draft = process.argv.find(a => /^\d+$/.test(a));
if (!draft) {
  console.error('Usage: node tools/build-palettes.mjs <draftNumber> [--write]');
  process.exit(2);
}
const { palettes: P } = await import(`./palettes/draft-${draft}.mjs`);
const OUT = join(REPO, 'discovery', `draft-${draft}`);

// ---------- Checks ----------
const accents = ['pink', 'green', 'blue', 'purple'];
const cap = a => a[0].toUpperCase() + a.slice(1);
function checksFor(p) {
  const c = [];
  const add = (label, fg, bg, min) => c.push({ label, fg: p[fg], bg: p[bg], min, ratio: round2(contrastRatio(p[fg], p[bg])) });
  add('text on bg', 'text', 'bg', 4.5);
  add('text on panel', 'text', 'panel', 4.5);
  add('muted on bg', 'muted', 'bg', 4.5);
  add('muted on panel', 'muted', 'panel', 4.5);
  for (const a of accents) {
    add(`${a} text on bg`, a, 'bg', 4.5);
    add(`${a} text on panel`, a, 'panel', 4.5);
    add(`on-${a} on ${a} fill`, 'on' + cap(a), a, 4.5);
  }
  add('focus ring on bg', 'focus', 'bg', 3.0);
  add('focus ring on panel', 'focus', 'panel', 3.0);
  add('border-strong on panel', 'borderStrong', 'panel', 3.0);
  // Elevated is a real text surface: the dropdown panel and .drop-panel paint
  // labels, muted text, group headings and the focus border onto it. Kept in step
  // with build-final.mjs so validate can never pass a theme the build refuses.
  add('text on elevated', 'text', 'elevated', 4.5);
  add('muted on elevated', 'muted', 'elevated', 4.5);
  for (const a of accents) add(`${a} text on elevated`, a, 'elevated', 4.5);
  add('focus ring on elevated', 'focus', 'elevated', 3.0);
  return c;
}

// ---------- Report ----------
let failures = 0;
const annotations = {};
for (const [id, p] of Object.entries(P)) {
  const cs = checksFor(p);
  // name/description are the display parts (tools/theme-name.mjs); `cohort` is this
  // page's own review grouping ('Faithful · Dark'), unrelated to the theme's name.
  annotations[id] = { name: p.name, description: p.description || '', cohort: p.cohort,
    mode: p.mode, checks: cs };
  const bad = cs.filter(x => x.ratio < x.min);
  if (bad.length) {
    failures += bad.length;
    console.log(`\nFAIL  ${id} (${fullLabel(p)}) — ${bad.length} failing`);
    for (const x of bad) console.log(`      ${x.label}: ${x.ratio} (need ${x.min})  ${x.fg} on ${x.bg}`);
  } else {
    console.log(`PASS  ${id} (${fullLabel(p)}) — all ${cs.length}`);
  }
}
console.log(`\nDraft ${draft}: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);

// ---------- Emit ----------
if (process.argv.includes('--write')) {
  if (failures !== 0) { console.error('\nRefusing to write: fix contrast failures first.'); process.exit(1); }
  const cssVar = {
    bg:'--bg', panel:'--bg-panel', elevated:'--bg-elevated', text:'--text', muted:'--text-muted',
    border:'--border', borderStrong:'--border-strong', focus:'--focus-ring',
    pink:'--accent-pink', onPink:'--on-pink', green:'--accent-green', onGreen:'--on-green',
    blue:'--accent-blue', onBlue:'--on-blue', purple:'--accent-purple', onPurple:'--on-purple',
  };
  mkdirSync(join(OUT, 'palettes'), { recursive: true });
  mkdirSync(join(OUT, 'data'), { recursive: true });
  for (const [id, p] of Object.entries(P)) {
    const lines = Object.entries(cssVar).map(([k, v]) => `  ${v}: ${p[k]};`).join('\n');
    // Optional per-theme background (grid) strength — emitted only when set, so themes
    // without it fall back to the effects.css default (--fx-grid-opacity: 0.22).
    const gridLine = p.grid !== undefined ? `  --fx-grid-opacity: ${p.grid};\n` : '';
    // Glow scale, same rule and same values as build-final.mjs: full neon on dark,
    // dialed back on light where a wide halo turns into a smudge. Emitted PER
    // PALETTE rather than left to effects.css — that file's [data-palette] default
    // ties with these blocks on specificity and wins on source order, so a default
    // alone would pin every light palette here to full strength.
    const glow = p.mode === 'light' ? '0.35' : '1';
    const css = `/* ${fullLabel(p)} — ${p.cohort} (${p.mode}). Draft ${draft}. Generated by tools/build-palettes.mjs; AA-validated. */\n` +
      `[data-palette="${id}"] {\n  color-scheme: ${p.mode};\n  --glow-strength: ${glow};\n${gridLine}${lines}\n}\n`;
    writeFileSync(join(OUT, 'palettes', `${id}.css`), css);
  }
  writeFileSync(join(OUT, 'data/contrast.json'), JSON.stringify(annotations, null, 2));
  writeFileSync(join(OUT, 'data/contrast.js'),
    '/* Generated by tools/build-palettes.mjs. AA contrast data for the discovery page. */\n' +
    'window.CONTRAST = ' + JSON.stringify(annotations) + ';\n');
  console.log(`\nWrote ${Object.keys(P).length} palette CSS files + data/contrast.{json,js} into discovery/draft-${draft}/`);
}
