/* theme-service — serve-site.mjs
 *
 * LOCAL DEV ONLY — serves the informational GitHub Pages site (`_site/`) so the
 * overview page (a11y-way-pages/site/overview.html) and the themes preview (a11y-way-pages/site/preview.html)
 * can be developed against the *deployed* URL layout (`/` and `/preview/`), which
 * opening the files from disk can't reproduce. Nothing here ships to a consuming
 * app; this is not part of installing or using the theme service.
 *
 * Zero dependencies (node:http), like the rest of this repo.
 *
 * Run:  npm run dev:overview-site           # build, serve, rebuild on change
 *       npm run dev:overview-site:serve     # serve whatever _site/ already holds
 *
 * Flags: --port <n> (default 4173)  --no-build  --no-watch
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, sep } from 'node:path';
import { buildSite } from './build-site.mjs';

// Two up: this file is a11y-way-pages/tools/, and _site/ is at the REPO root.
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = join(REPO, '_site');

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const portArg = Number(argv[argv.indexOf('--port') + 1]);
const PORT = argv.includes('--port') && Number.isInteger(portArg) ? portArg : 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

// ---------- initial build ----------
if (!flag('--no-build')) buildSite();
if (!existsSync(SITE)) {
  console.error('SERVE FAIL: _site/ does not exist — run `npm run dev:overview-site:build` first.');
  process.exit(1);
}

// ---------- static server (clean URLs, same shape as GitHub Pages) ----------
const server = createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  // Contain every request inside _site/ (no traversal out of the site root).
  const target = normalize(join(SITE, urlPath));
  if (target !== SITE && !target.startsWith(SITE + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let file = target;
  if (existsSync(file) && statSync(file).isDirectory()) {
    // A directory URL must end in "/" or its relative asset links resolve one level up.
    if (!urlPath.endsWith('/')) {
      res.writeHead(301, { Location: urlPath + '/' }).end();
      return;
    }
    file = join(file, 'index.html');
  }

  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
       .end(`<h1>404</h1><p>Not in _site: ${urlPath}</p><p><a href="/">overview</a> &middot; <a href="/preview/">preview</a></p>`);
    return;
  }

  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  res.writeHead(200, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',  // always serve the newest rebuild
  });
  createReadStream(file).pipe(res);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`SERVE FAIL: port ${PORT} is in use — retry with \`npm run dev:overview-site -- --port ${PORT + 1}\`.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`\n[overview-site] local dev server (informational pages only)`);
  console.log(`  overview  http://localhost:${PORT}/`);
  console.log(`  preview   http://localhost:${PORT}/preview/`);
});

// ---------- rebuild on source change ----------
if (!flag('--no-watch')) {
  // themes/ build output would retrigger the watcher that produced it.
  const GENERATED = new Set(['theme.css', 'tokens.json', 'themes.index.json', 'theme-init.js', 'theme-select.js']);
  let timer = null;
  let building = false;

  const onChange = (_evt, name) => {
    if (building) return;
    if (name && GENERATED.has(name.split(/[\\/]/).pop())) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      building = true;
      try {
        buildSite({ quiet: true });
        console.log(`[overview-site] rebuilt (${name ?? 'change'}) — refresh the browser`);
      } finally {
        // Ignore the writes this build just made before listening again.
        setTimeout(() => { building = false; }, 200);
      }
    }, 150);
  };

  for (const dir of [join('a11y-way-pages', 'site'), join('a11y-way-pages', 'assets'),
                     'themes', 'gallery', join('tools', 'palettes')]) {
    const full = join(REPO, dir);
    if (existsSync(full)) watch(full, { recursive: true }, onChange);
  }
  watch(join(REPO, 'a11y-way-pages', 'tools', 'assemble-site.mjs'), onChange);
  console.log(`  watching a11y-way-pages/{site,assets}/, themes/, gallery/, tools/palettes/ — Ctrl+C to stop\n`);
}
