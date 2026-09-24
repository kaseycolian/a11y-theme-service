/* =============================================================================
   build-final.mjs — build the FINALIZED themes/ from source palettes.
   Merges BUILT-IN themes (tools/palettes/draft-<n>.mjs — the origin's pre-installed
   set, included unless opted out) with LOCAL themes (tools/palettes/local.mjs — a
   fork's own themes, ALWAYS included), re-validates AA, and emits:
     themes/theme.css  tokens.json  themes.index.json  theme-init.js  theme-select.js
   These are BUILD OUTPUT (gitignored) — regenerate them; never hand-edit.

   Run:  node tools/build-final.mjs --write             # built-ins + local (default)
         node tools/build-final.mjs --write --no-builtin # ONLY your local themes
         node tools/build-final.mjs 3 --write            # explicit source draft for built-ins

   Whether built-ins are included: --no-builtin / --with-builtin override the machine-
   local preference (`includeBuiltinThemes` in ~/.claude/theme-service.local.json,
   default true). VERSION is read from the repo's VERSION file (bump it via release.mjs).
   ============================================================================= */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { floor2 } from './contrast-checker/contrast.mjs';
import { checkPalette } from './palette-checks.mjs';
import { fullLabel, optionLabel, modeLabel } from './theme-name.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_FAMILY = 'rink-classic';

const VERSION = (() => {
  try { return readFileSync(join(REPO, 'VERSION'), 'utf8').trim() || '0.0.0'; } catch { return '0.0.0'; }
})();

// ---------- Which built-in draft, and whether to include built-ins ----------
const srcDraft = process.argv.find(a => /^\d+$/.test(a)) || '3';
function localConfig() {
  const p = join(homedir(), '.claude', 'theme-service.local.json');
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {}; } catch { return {}; }
}
let includeBuiltins = localConfig().includeBuiltinThemes !== false;  // default true
if (process.argv.includes('--no-builtin')) includeBuiltins = false;
if (process.argv.includes('--with-builtin')) includeBuiltins = true;

const { palettes: BUILTINS } = await import(`./palettes/draft-${srcDraft}.mjs`);
let LOCAL = {};
try { ({ palettes: LOCAL } = await import('./palettes/local.mjs')); } catch { LOCAL = {}; }

// Source entries: [draftKey, palette, origin]. Built-ins first (if included), then local.
const entries = [];
if (includeBuiltins) for (const [k, p] of Object.entries(BUILTINS)) entries.push([k, p, 'built-in']);
for (const [k, p] of Object.entries(LOCAL)) entries.push([k, p, 'local']);
if (!entries.length) {
  console.error('No themes to build. Add themes to tools/palettes/local.mjs, or allow built-ins (drop --no-builtin).');
  process.exit(1);
}

// token key -> CSS custom property
const VARMAP = {
  bg:'--bg', panel:'--bg-panel', elevated:'--bg-elevated', text:'--text', muted:'--text-muted',
  border:'--border', borderStrong:'--border-strong', focus:'--focus-ring',
  pink:'--accent-pink', onPink:'--on-pink', green:'--accent-green', onGreen:'--on-green',
  blue:'--accent-blue', onBlue:'--on-blue', purple:'--accent-purple', onPurple:'--on-purple',
};
const accents = ['pink', 'green', 'blue', 'purple'];

// Derive finalized metadata from a draft key like "dark-01-rink-classic".
function meta(draftId, p) {
  const m = draftId.match(/^(?:dark|light)-\d+-(.+)$/);
  const familyPart = m ? m[1] : draftId;
  const noBg = familyPart.endsWith('-no-background');
  const family = noBg ? familyPart.slice(0, -'-no-background'.length) : familyPart;
  const id = `${family}-${p.mode}${noBg ? '-no-background' : ''}`;
  /* The name is carried in three parts (tools/theme-name.mjs) so a consumer can
     render whichever of them its context has not already said. `group` defaults
     to the mode rather than being authored: two fields that must agree about the
     same fact will eventually disagree. `!== undefined` so a palette can still
     override it with '' and opt out of a group segment entirely. */
  const group = p.group !== undefined ? p.group : modeLabel(p.mode);
  const description = p.description || '';
  const name = p.name;
  return { id, family, mode: p.mode, name, group, description,
           label: fullLabel({ name, group, description }), noBg };
}

// ---------- AA validation (built-ins AND local) ----------
// The pairs and the pass rule live in palette-checks.mjs, shared with
// build-palettes.mjs (`npm run validate`) so the two can never disagree. It compares
// the UNROUNDED ratio: WCAG thresholds are exact, so 4.499:1 fails 4.5:1.
let failures = 0;
for (const [id, p, origin] of entries) {
  let bad;
  try { bad = checkPalette(p).filter(x => !x.pass); }
  catch (e) { console.error(`ERROR ${origin} "${id}": ${e.message} (missing/invalid token?)`); failures++; continue; }
  if (bad.length) {
    failures += bad.length;
    console.log(`FAIL ${origin} "${id}" — ${bad.length} AA failure(s)`);
    // Truncated, never rounded, so a near miss reads as the miss it is.
    for (const x of bad) console.log(`     ${VARMAP[x.fg]} on ${VARMAP[x.bg]}: ${floor2(x.ratio)}:1, needs ${x.min}:1`);
  }
}
console.log(`Building themes (built-ins: ${includeBuiltins ? 'draft-' + srcDraft : 'excluded'}, local: ${Object.keys(LOCAL).length}) — ${failures === 0 ? 'ALL PASS' : failures + ' PROBLEM(S)'}`);

// ---------- Assemble finalized model (collision-checked) ----------
const themes = {};        // id -> theme
const origins = {};       // id -> origin (for error messages)
for (const [draftId, p, origin] of entries) {
  const mt = meta(draftId, p);
  if (themes[mt.id]) {
    console.error(`Theme id collision: "${mt.id}" from ${origin} "${draftId}" already defined by ${origins[mt.id]}. Rename your local theme.`);
    process.exit(1);
  }
  const tokens = {};
  for (const [k, v] of Object.entries(VARMAP)) tokens[v] = p[k];
  themes[mt.id] = { ...mt, colorScheme: p.mode, glow: p.mode === 'light' ? '0.35' : '1', grid: p.grid, origin, tokens };
  origins[mt.id] = `${origin} "${draftId}"`;
}
/* The family heading is just the shared `name` — every variant of a family carries
   the same one, so which theme is seen first no longer decides what the heading
   says. This used to regex-strip " (No Background)" back off a composed label,
   which meant a family whose no-bg variant happened to be defined first got that
   suffix in its heading, and any other kind of variant kept its suffix outright. */
const families = {};
for (const t of Object.values(themes)) {
  families[t.family] ??= { family: t.family, name: t.name, label: t.name };
  if (!t.noBg) families[t.family][t.mode] = t.id;  // primary dark/light = the WITH-background variant
}

// Pick a default family robustly (prefer rink-classic; else first family with both modes; else any).
const hasBoth = f => f.dark && f.light;
const defFam = (families[DEFAULT_FAMILY] && hasBoth(families[DEFAULT_FAMILY])) ? families[DEFAULT_FAMILY]
  : Object.values(families).find(hasBoth) || Object.values(families)[0];
const defDark = defFam.dark || defFam.light || Object.values(themes)[0].id;
const defLight = defFam.light || defDark;

// ---------- Emit ----------
if (process.argv.includes('--write')) {
  if (failures !== 0) { console.error('Refusing to write: fix the problems above first.'); process.exit(1); }
  mkdirSync(join(REPO, 'themes'), { recursive: true });

  const block = (sel, t, indent = '') => {
    const lines = Object.entries(t.tokens).map(([v, val]) => `${indent}  ${v}: ${val};`);
    const gridLine = t.grid !== undefined ? `\n${indent}  --fx-grid-opacity: ${t.grid};` : '';
    return `${indent}${sel} {\n${indent}  color-scheme: ${t.colorScheme};\n${indent}  --glow-strength: ${t.glow};${gridLine}\n${lines.join('\n')}\n${indent}}`;
  };

  let css = `/* =============================================================================
   Theme Service — finalized themes. v${VERSION}. Built-ins: ${includeBuiltins ? 'draft-' + srcDraft : 'excluded'}; local: ${Object.keys(LOCAL).length}.
   GENERATED by tools/build-final.mjs — build output, not committed. Edit the palette
   source (tools/palettes/draft-*.mjs = built-in; local.mjs = yours) and rebuild.
   Pair with effects.css + components.css.

   Usage: include theme.css (+ effects.css + components.css). With no data-theme,
   the default (${defFam.name}) renders${defLight !== defDark ? ' — dark, or light under prefers-color-scheme: light' : ''}.
   Force any theme with <html data-theme="<id>">.
   Theme ids: ${Object.keys(themes).join(', ')}.
   ============================================================================= */\n\n`;

  css += `/* Default theme (${defFam.name}). */\n`;
  css += block(':root', themes[defDark]) + '\n\n';
  if (defLight !== defDark) {
    css += `@media (prefers-color-scheme: light) {\n`;
    css += block(':root:not([data-theme])', themes[defLight], '  ') + '\n}\n\n';
  }

  css += `/* All themes — force with data-theme="<id>". */\n`;
  for (const t of Object.values(themes)) css += block(`[data-theme="${t.id}"]`, t) + '\n\n';
  writeFileSync(join(REPO, 'themes/theme.css'), css);

  const tokensJson = {
    version: VERSION, builtinSource: includeBuiltins ? `draft-${srcDraft}` : null, localThemes: Object.keys(LOCAL).length,
    default: { family: defFam.family, dark: defDark, light: defLight },
    themes: Object.fromEntries(Object.values(themes).map(t =>
      // name/group/description are the parts; `label` is the three of them composed,
      // kept so a consumer that just wants a string does not have to join them itself.
      [t.id, { name: t.name, group: t.group, description: t.description, label: t.label,
        family: t.family, mode: t.mode, origin: t.origin, colorScheme: t.colorScheme, glowStrength: Number(t.glow),
        ...(t.grid !== undefined ? { gridOpacity: t.grid } : {}), tokens: t.tokens }])),
  };
  writeFileSync(join(REPO, 'themes/tokens.json'), JSON.stringify(tokensJson, null, 2) + '\n');

  const index = {
    version: VERSION,
    default: { family: defFam.family, dark: defDark, light: defLight },
    families: Object.values(families),
    themes: Object.values(themes).map(t => ({ id: t.id, name: t.name, group: t.group,
      description: t.description, label: t.label, family: t.family, mode: t.mode, origin: t.origin })),
  };
  writeFileSync(join(REPO, 'themes/themes.index.json'), JSON.stringify(index, null, 2) + '\n');

  // ---- CSP-safe helper scripts (external files — work in MV3 extensions & strict-CSP sites) ----
  const themeInit =
`/* theme-service v${VERSION} — theme-init.js
   Applies the saved (or ?theme= / ?motion=) theme BEFORE first paint, so there's no flash.
   Load in <head> via <script src="theme/theme-init.js"></script> (NOT inline — inline is blocked
   by Manifest V3 / strict CSP). CSP-safe. */
(function () {
  try {
    var p = new URLSearchParams(location.search);
    var t = p.get('theme') || localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    if ((p.get('motion') || localStorage.getItem('motion')) === 'off')
      document.documentElement.setAttribute('data-motion', 'off');
  } catch (e) {}
})();
`;
  writeFileSync(join(REPO, 'themes/theme-init.js'), themeInit);

  // Each entry carries enough to render a RICH picker: a family group heading, the
  // theme's own four accents as a swatch strip, and its id as secondary text (the
  // value you'd put in data-theme). dropdown.js reads the data-dropdown-* attributes; a
  // plain <select> ignores them and just shows the label, so both stay supported.
  const swatchOf = t => accents.map(a => t.tokens[VARMAP[a]]).join(',');
  const selectList = [{
    id: '', label: `Auto (${defFam.name})`, group: 'Automatic',
    secondary: 'follows your OS', swatch: swatchOf(themes[defDark]),
  }].concat(Object.values(themes).map(t => ({
    id: t.id,
    /* The row says only what its group heading has not already said — "Dark",
       "Dark · No Background" under a "Hot Neon" heading, rather than repeating
       the family name on every line of the list. */
    label: optionLabel(t),
    group: t.name,
    /* The composed name, for the two places a row's own text is not enough: the
       CLOSED trigger, which shows the selection with no heading above it to give
       it context, and type-ahead, where "sy" has to still find Synthwave Sunset.
       dropdown.js reads it from data-dropdown-full-label; anything without one
       falls back to the option text, so plain dropdowns are unaffected. */
    full: t.label,
    secondary: t.id,
    swatch: swatchOf(t),
  })));
  const themeSelect =
`/* theme-service v${VERSION} — theme-select.js  (GENERATED; theme list mirrors themes.index.json)
   Populates and wires any <select data-theme-select> and any [data-motion-toggle] checkbox.
   Load via <script src="theme/theme-select.js"></script> (NOT inline — MV3/strict CSP blocks inline).
   Markup you provide:  <select data-theme-select aria-label="Theme"></select>
                        <input type="checkbox" data-motion-toggle> Reduce motion  (optional)

   Options are grouped by theme name (<optgroup>), so each row carries only what the
   heading has not said — "Dark", "Dark · No Background". They also carry
   data-dropdown-swatch (the theme's four accents), data-dropdown-secondary (its id)
   and data-dropdown-full-label (the composed "Hot Neon · Dark · No Background", used
   for the closed trigger and type-ahead). A plain <select> ignores all three; add
   data-dropdown AND load dropdown.js to render them.

   For React/Angular, prefer the framework's own provider (see the skill) instead of this file. */
(function () {
  var THEMES = ${JSON.stringify(selectList)};
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var root = document.documentElement;
    var saved = '';
    try { saved = localStorage.getItem('theme') || ''; } catch (e) {}
    document.querySelectorAll('select[data-theme-select]').forEach(function (sel) {
      if (!sel.options.length) {
        var groups = {};
        THEMES.forEach(function (t) {
          var opt = new Option(t.label, t.id);
          if (t.swatch) opt.setAttribute('data-dropdown-swatch', t.swatch);
          if (t.secondary) opt.setAttribute('data-dropdown-secondary', t.secondary);
          if (t.full) opt.setAttribute('data-dropdown-full-label', t.full);
          if (!t.group) { sel.appendChild(opt); return; }
          if (!groups[t.group]) {
            groups[t.group] = document.createElement('optgroup');
            groups[t.group].label = t.group;
            sel.appendChild(groups[t.group]);
          }
          groups[t.group].appendChild(opt);
        });
      }
      sel.value = root.getAttribute('data-theme') || saved || '';
      sel.addEventListener('change', function () {
        var id = sel.value;
        if (id) { root.setAttribute('data-theme', id); try { localStorage.setItem('theme', id); } catch (e) {} }
        else { root.removeAttribute('data-theme'); try { localStorage.removeItem('theme'); } catch (e) {} }
      });
      // Opt-in upgrade to the accessible listbox. Order-independent: createDropdown
      // is idempotent, so if dropdown.js auto-init already ran on the empty <select>
      // this returns that instance, and rebuild() picks up the options added above.
      // Without data-dropdown nothing changes — apps on the old markup keep the
      // native control through an update.
      if (sel.hasAttribute('data-dropdown') && window.ThemeService && window.ThemeService.createDropdown) {
        var dd = window.ThemeService.createDropdown(sel);
        if (dd) dd.rebuild();
      }
    });
    document.querySelectorAll('[data-motion-toggle]').forEach(function (cb) {
      cb.checked = root.getAttribute('data-motion') === 'off';
      cb.addEventListener('change', function () {
        if (cb.checked) { root.setAttribute('data-motion', 'off'); try { localStorage.setItem('motion', 'off'); } catch (e) {} }
        else { root.removeAttribute('data-motion'); try { localStorage.removeItem('motion'); } catch (e) {} }
      });
    });
  });
})();
`;
  writeFileSync(join(REPO, 'themes/theme-select.js'), themeSelect);

  console.log(`\nWrote themes/{theme.css, tokens.json, themes.index.json, theme-init.js, theme-select.js} — v${VERSION}, ${Object.keys(themes).length} themes.`);
}
