#!/usr/bin/env node
/* =============================================================================
   cli.mjs — command-line WCAG contrast checker. No dependencies.

   Usage:
     node cli.mjs "#ffffff" "#0b0219"          Check one foreground/background pair
     node cli.mjs "#ff5ada" "#17092b" --min 3  Check against a custom minimum ratio
     node cli.mjs --file pairs.json            Check many pairs from a JSON file
     node cli.mjs --file pairs.json --min 4.5  ...with a default minimum

   pairs.json format:
     [ { "fg": "#ffffff", "bg": "#000000", "min": 4.5, "label": "body text" }, ... ]

   Exit code: 0 if all checks pass, 1 if any fail (handy for CI).
   ============================================================================= */
import { readFileSync } from 'node:fs';
import { rate, checkPairs, contrastRatio } from './contrast.mjs';

const args = process.argv.slice(2);
const getFlag = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);

const GREEN = s => `\x1b[32m${s}\x1b[0m`;
const RED = s => `\x1b[31m${s}\x1b[0m`;
const DIM = s => `\x1b[2m${s}\x1b[0m`;

function die(msg) { console.error(RED(msg)); process.exit(2); }

try {
  const min = getFlag('--min') ? Number(getFlag('--min')) : undefined;
  const file = getFlag('--file');

  if (file) {
    const pairs = JSON.parse(readFileSync(file, 'utf8'));
    if (!Array.isArray(pairs)) die('pairs file must be a JSON array of {fg,bg,min?,label?}');
    const { results, passed, failed, ok } = checkPairs(pairs, min ?? 4.5);
    for (const r of results) {
      const tag = r.pass ? GREEN('PASS') : RED('FAIL');
      console.log(`${tag}  ${r.ratio.toFixed(2)}:1  (min ${r.min})  ${DIM(r.label)}`);
    }
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(ok ? 0 : 1);
  }

  // Single-pair mode
  const positional = args.filter(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--min');
  const [fg, bg] = positional;
  if (!fg || !bg) {
    die('Usage: node cli.mjs "<fg>" "<bg>" [--min N]  |  node cli.mjs --file pairs.json [--min N]');
  }
  const r = rate(fg, bg);
  const reqMin = min ?? 4.5;
  const line = (label, ok) => `  ${ok ? GREEN('✓') : RED('✗')} ${label}`;
  console.log(`\n  ${fg}  on  ${bg}`);
  console.log(`  Ratio: ${r.ratio.toFixed(2)}:1\n`);
  console.log(line('AA  normal text  (4.5:1)', r.AA_normal));
  console.log(line('AA  large text   (3.0:1)', r.AA_large));
  console.log(line('AA  UI component (3.0:1)', r.AA_ui));
  console.log(line('AAA normal text  (7.0:1)', r.AAA_normal));
  console.log(line('AAA large text   (4.5:1)', r.AAA_large));
  // The unrounded ratio, like the AA lines above: r.ratio is truncated for display.
  const passMin = contrastRatio(fg, bg) >= reqMin;
  console.log(`\n  vs --min ${reqMin}: ${passMin ? GREEN('PASS') : RED('FAIL')}\n`);
  process.exit(passMin ? 0 : 1);
} catch (err) {
  die(err.message);
}
