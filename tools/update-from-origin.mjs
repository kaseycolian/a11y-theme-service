#!/usr/bin/env node
/* =============================================================================
   update-from-origin.mjs — pull the origin's updates into YOUR fork/clone.
   Mechanical git only: ensures an `upstream` remote, fetches, and merges
   upstream/main (or a chosen version tag). Because the generated theme files
   aren't committed and your themes live in tools/palettes/local.mjs (which the
   origin never touches), this is conflict-free. It does NOT rebuild — you decide
   whether to include the origin's built-in themes, then run `npm run build-themes`.

   Usage:
     npm run update-from-origin -- --set-upstream https://github.com/<owner>/a11y-theme-service.git
     npm run update-from-origin                 # merge upstream/main
     npm run update-from-origin -- --tag v0.3.0  # update to a specific release tag
   ============================================================================= */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = n => { const i = argv.indexOf(n); return i !== -1 ? argv[i + 1] : undefined; };
const git = a => spawnSync('git', a, { cwd: REPO, encoding: 'utf8' });
const gitIO = a => spawnSync('git', a, { cwd: REPO, stdio: 'inherit' });
const die = m => { console.error(m); process.exit(1); };
const ver = () => { try { return readFileSync(join(REPO, 'VERSION'), 'utf8').trim(); } catch { return '?'; } };

if (git(['rev-parse', '--is-inside-work-tree']).status !== 0) die('Not a git repo.');

// Ensure an `upstream` remote.
const setUp = flag('--set-upstream');
const remotes = git(['remote']).stdout.split(/\s+/);
if (setUp) {
  gitIO([remotes.includes('upstream') ? 'remote' : 'remote', remotes.includes('upstream') ? 'set-url' : 'add', 'upstream', setUp]);
} else if (!remotes.includes('upstream')) {
  die('No `upstream` remote. Add the origin you want to track, e.g.:\n' +
      '  npm run update-from-origin -- --set-upstream https://github.com/<owner>/a11y-theme-service.git');
}

// Refuse to run with a dirty tree (so a merge can't tangle with uncommitted work).
if (git(['status', '--porcelain']).stdout.trim()) {
  die('Working tree has uncommitted changes. Commit or stash them first (your local.mjs themes should be committed anyway).');
}

const before = ver();
console.log('Fetching upstream…');
if (gitIO(['fetch', 'upstream', '--tags']).status !== 0) die('git fetch failed.');

const ref = flag('--tag') || 'upstream/main';
console.log(`Merging ${ref}…`);
if (gitIO(['merge', '--no-edit', ref]).status !== 0) {
  die('Merge did not complete cleanly. Resolve conflicts (rare — usually only if you edited origin source files), then commit.');
}
const after = ver();

// Append a history entry to the machine-local config (never committed).
try {
  const cp = join(homedir(), '.claude', 'theme-service.local.json');
  const cfg = existsSync(cp) ? JSON.parse(readFileSync(cp, 'utf8')) : {};
  cfg.version = after;
  cfg.history = Array.isArray(cfg.history) ? cfg.history : [];
  cfg.history.push({ date: new Date().toISOString().slice(0, 10), version: after, action: 'update-from-origin', note: `${before} → ${after} (${ref})` });
  writeFileSync(cp, JSON.stringify(cfg, null, 2) + '\n');
} catch { /* config is optional */ }

console.log(`\nUpdated: ${before} → ${after}.`);
console.log('Next: rebuild themes/ (your local.mjs themes are preserved):');
console.log('  npm run build-themes        # include the origin\'s built-in themes');
console.log('  npm run build-themes:mine   # ONLY your own themes');
console.log('The theme-service skill can also drive this and ask whether to include built-ins.');
