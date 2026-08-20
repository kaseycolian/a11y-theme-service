/* theme-service — build-site.mjs
 *
 * LOCAL DEV ONLY — builds the informational GitHub Pages site (`_site/`), i.e.
 * the overview page (a11y-way-pages/site/overview.html) and the themes preview
 * (a11y-way-pages/site/preview.html). This has nothing to do with installing or using the
 * theme service in an app; it exists so the pages that *explain* this repo can
 * be developed locally.
 *
 * It mirrors `.github/workflows/pages.yml` step for step, so a local run is a
 * dry-run of the real deploy:
 *   1. detect the highest-numbered finalized draft (tools/palettes/draft-<N>.mjs)
 *   2. node tools/build-final.mjs <N> --write   (generate themes/ assets)
 *   3. node a11y-way-pages/tools/assemble-site.mjs   (assemble _site/ with clean URLs)
 *
 * Run:  npm run dev:overview-site:build
 */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Two up: this file is a11y-way-pages/tools/, and everything it drives (the theme
// build, the palette sources, the _site output) is rooted at the REPO root.
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Highest finalized draft — the same rule pages.yml uses to pick the live set. */
export function latestDraft() {
  const n = readdirSync(join(REPO, 'tools', 'palettes'))
    .map((f) => /^draft-(\d+)\.mjs$/.exec(f)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b)
    .pop();
  if (!n) {
    console.error('BUILD FAIL: no tools/palettes/draft-<N>.mjs found');
    process.exit(1);
  }
  return n;
}

function run(label, args) {
  const r = spawnSync(process.execPath, args, { cwd: REPO, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`BUILD FAIL: ${label} exited ${r.status ?? r.signal}`);
    process.exit(1);
  }
}

/** Build themes from the latest draft, then assemble _site/. Returns nothing; exits on failure. */
export function buildSite({ quiet = false } = {}) {
  const n = latestDraft();
  if (!quiet) console.log(`\n[overview-site] building from draft-${n} (tools/palettes/draft-${n}.mjs)`);
  run('build-final.mjs', [join(REPO, 'tools', 'build-final.mjs'), String(n), '--write']);
  run('assemble-site.mjs', [join(REPO, 'a11y-way-pages', 'tools', 'assemble-site.mjs')]);
}

// Only build when invoked directly (serve-site.mjs imports buildSite instead).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) buildSite();
