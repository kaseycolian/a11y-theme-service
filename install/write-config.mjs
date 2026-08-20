#!/usr/bin/env node
/* write-config.mjs — the ONE writer for ~/.claude/theme-service.local.json.

   Every installer routes its config write through here, so the three of them cannot
   drift. They did: install.sh and install.ps1 each wrote the file from scratch with
   only { repo, version }, which silently destroyed `includeBuiltinThemes` and the
   whole `history[]` array — the array skill/references/updating-from-origin.md tells
   agents to read to know what has already been done. install.ps1 additionally wrote
   it UTF-8 *with BOM*, which makes JSON.parse throw in both install.mjs and
   tools/build-final.mjs; both swallow that error, so a Windows shell install looked
   fine and reset the config to defaults.

   The file lives OUTSIDE the repo and is never committed:
     { repo, version, includeBuiltinThemes, history: [{date, version, action, note}] }

   Usable two ways, so the shell installers need no JSON parser of their own:
     import { writeLocalConfig } from './write-config.mjs'
     node install/write-config.mjs --repo <path> --skills theme-service+a11y-way-pages [--builtins true|false]
*/
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const configPath = () => join(homedir(), '.claude', 'theme-service.local.json');

/** Read-merge-write. Preserves every field this function does not own — notably the
 *  full history, which is append-only and never rewritten. */
export function writeLocalConfig({ repo, skills = [], builtins, action = 'install' }) {
  const path = configPath();

  // A corrupt or BOM-prefixed file must not silently wipe the history, so strip a BOM
  // before parsing and keep anything we can recover.
  let cfg = {};
  try {
    if (existsSync(path)) cfg = JSON.parse(readFileSync(path, 'utf8').replace(/^﻿/, '')) || {};
  } catch {
    console.warn(`Warning: ${path} was unreadable; starting a fresh config.`);
    cfg = {};
  }

  const version = (() => {
    try { return readFileSync(join(repo, 'VERSION'), 'utf8').trim(); } catch { return '0.0.0'; }
  })();

  cfg.repo = repo;
  cfg.version = version;
  if (builtins !== undefined) cfg.includeBuiltinThemes = builtins !== 'false' && builtins !== false;
  else if (cfg.includeBuiltinThemes === undefined) cfg.includeBuiltinThemes = true;

  cfg.history = Array.isArray(cfg.history) ? cfg.history : [];
  cfg.history.push({
    date: new Date().toISOString().slice(0, 10),
    version,
    action,
    note: `source ${repo} · skills ${skills.join('+') || 'none'} · includeBuiltinThemes=${cfg.includeBuiltinThemes}`,
  });

  // writeFileSync with a plain string is UTF-8 without BOM — the thing install.ps1 could not do.
  writeFileSync(path, JSON.stringify(cfg, null, 2) + '\n');
  return { path, version, includeBuiltinThemes: cfg.includeBuiltinThemes };
}

// CLI mode — how install.sh and install.ps1 call it.
if (process.argv[1] && process.argv[1].endsWith('write-config.mjs')) {
  const argv = process.argv.slice(2);
  const flag = name => { const i = argv.indexOf(name); return i !== -1 ? argv[i + 1] : undefined; };
  const repo = flag('--repo');
  if (!repo) { console.error('write-config.mjs: --repo <path> is required.'); process.exit(1); }
  const skills = (flag('--skills') || '').split('+').filter(Boolean);
  const r = writeLocalConfig({ repo, skills, builtins: flag('--builtins') });
  console.log(`Wrote ${r.path}  (repo=${repo}, includeBuiltinThemes=${r.includeBuiltinThemes})`);
}
