#!/usr/bin/env node
/* install.mjs — cross-platform skill installer.
   Links this repo's two skills into ~/.claude/skills/ (directory junction on Windows,
   symlink elsewhere; copy fallback):
     skill/                 -> ~/.claude/skills/theme-service    (create + apply themes)
     a11y-way-pages/skill/  -> ~/.claude/skills/a11y-way-pages    (site header/footer/favicon)
   They are deliberately separate: the pages skill consumes theme tokens read-only and
   never edits themes, so neither can disturb the other's work.

   Also writes the machine-local config ~/.claude/theme-service.local.json (OUTSIDE the
   repo, never committed) — both skills read `repo` from it to find their source:
     { repo, version, includeBuiltinThemes, history: [{date, version, action, note}] }

   Usage (usually via npm scripts):
     npm run install-no-themes         # link skill + config only (no themes built)
     npm run install-all               # ^ and build themes (built-ins + your local)
     node install/install.mjs --source <path>   # point at a DIFFERENT theme-service clone
     node install/install.mjs --builtins false  # remember: exclude the origin's built-ins
     node install/install.mjs --only a11y-way-pages  # link ONE skill, not both
     node install/install.mjs --help

   Change your source anytime: re-run from the clone you want, use --source, or edit the
   `repo` field in ~/.claude/theme-service.local.json. It's read at runtime. */
import { existsSync, lstatSync, rmSync, mkdirSync, symlinkSync, cpSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeLocalConfig } from './write-config.mjs';

const argv = process.argv.slice(2);
const flag = name => { const i = argv.indexOf(name); return i !== -1 ? argv[i + 1] : undefined; };
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(`theme-service installer
  --source <path>        use a different theme-service clone as your source (default: this repo)
  --builtins <true|false> remember whether to include the origin's built-in themes when building
  --only <skill>         link just one skill (theme-service | a11y-way-pages) instead of both
  --help                 show this
Links skill/ -> ~/.claude/skills/theme-service and a11y-way-pages/skill/ -> ~/.claude/skills/a11y-way-pages,
and writes ~/.claude/theme-service.local.json.`);
  process.exit(0);
}

const scriptRepo = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = flag('--source') ? resolve(flag('--source')) : scriptRepo;
const claude = join(homedir(), '.claude');
const skills = join(claude, 'skills');

// Every skill this repo ships: [source dir in the repo, name under ~/.claude/skills/].
const ALL_SKILLS = [
  ['skill', 'theme-service'],
  ['a11y-way-pages/skill', 'a11y-way-pages'],
];

/* --only <name> links a single skill instead of both — the contributor case, where you
   want one skill live from this clone without disturbing the other's link. The config
   below is still written either way: BOTH skills read `repo` from it to find their
   source, so linking one alone must not leave that pointer stale. */
const only = flag('--only');
if (only !== undefined && !ALL_SKILLS.some(([, name]) => name === only)) {
  console.error(`--only ${only}: unknown skill. Known: ${ALL_SKILLS.map(s => s[1]).join(', ')}.`);
  process.exit(1);
}
const SKILLS = only ? ALL_SKILLS.filter(([, name]) => name === only) : ALL_SKILLS;

for (const [dir] of SKILLS) {
  if (!existsSync(join(repo, dir, 'SKILL.md'))) {
    console.error(`${dir}/SKILL.md not found under ${repo} — is it a theme-service clone?`);
    process.exit(1);
  }
}
mkdirSync(skills, { recursive: true });

/** Junction/symlink `source` at `target`, refreshing an existing link. Returns false if
 *  it had to fall back to a copy (which then needs a re-run to pick up repo changes). */
function link(source, target) {
  /* Refresh an existing link; refuse to clobber a real directory. lstat, NOT
     existsSync: existsSync FOLLOWS the link, so a dangling one reported false, the
     cleanup below was skipped, symlinkSync threw EEXIST, and the cpSync fallback then
     threw uncaught onto a path that already existed. lstat sees the link itself, so a
     live link, a dangling link and a real directory are each handled — which is what
     both shell installers already did correctly. */
  let existing = null;
  try { existing = lstatSync(target); } catch { /* nothing there — the clean case */ }
  if (existing) {
    if (existing.isDirectory() && !existing.isSymbolicLink()) {
      console.error(`${target} exists and is a real directory (not a link). Remove it manually, then re-run.`);
      process.exit(1);
    }
    rmSync(target, { recursive: true, force: true });
  }
  try {
    symlinkSync(source, target, process.platform === 'win32' ? 'junction' : 'dir');
    console.log(`Linked skill: ${target} -> ${source}`);
    return true;
  } catch {
    cpSync(source, target, { recursive: true });
    console.log(`Copied skill into: ${target} (link unavailable; re-run install to update)`);
    return false;
  }
}

let linked = true;
for (const [dir, name] of SKILLS) {
  if (!link(join(repo, dir), join(skills, name))) linked = false;
}

/* One writer for the config, shared with install.sh and install.ps1 — see
   write-config.mjs for why the three cannot each own this. */
const written = writeLocalConfig({ repo, skills: SKILLS.map(s => s[1]), builtins: flag('--builtins') });
console.log(`Wrote ${written.path}  (repo=${repo}, includeBuiltinThemes=${written.includeBuiltinThemes})`);
console.log(`\nDone. Claude Code will discover these skills on next session: ${SKILLS.map(s => s[1]).join(', ')}.`);
if (!linked) console.log('Note: installed as a copy — re-run this script after updating the repo.');
