/* theme-service — assemble-site.mjs
 *
 * Builds the GitHub Pages site tree (`_site/`) with clean, extension-less URLs:
 *
 *     /          -> the overview page   (a11y-way-pages/site/overview.html)
 *     /preview/  -> the themes preview  (a11y-way-pages/site/preview.html)
 *     /themes/*  -> the built theme assets (theme.css, *.js, ...)
 *
 * The source HTML files keep their `.html` links so they still open correctly
 * from the local filesystem; this script rewrites those links for the deployed
 * layout WITHOUT modifying the sources. Run `node tools/build-final.mjs <N> --write`
 * first so the generated theme assets exist under themes/.
 *
 * Paths here are relative, so this must run with the REPO ROOT as cwd (build-site.mjs
 * and pages.yml both do). Both source pages live two levels down now, in
 * a11y-way-pages/site/, which is why their theme links are ../../themes/ and their
 * brand-asset links are ../assets/ (a11y-way-pages/assets/, a sibling of site/).
 *
 * Every rewrite is an exact-string replace that fails loudly if the token is
 * absent — so a future edit that moves an asset link can't silently ship broken
 * URLs; the deploy (and the local dry-run) will error instead.
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';

function rewrite(source, label, replacements) {
  let out = source;
  for (const [from, to] of replacements) {
    if (!out.includes(from)) {
      console.error(`ASSEMBLE FAIL: ${label}: expected to find ${JSON.stringify(from)} — source layout drifted?`);
      process.exit(1);
    }
    out = out.split(from).join(to);
  }
  return out;
}

// Fresh tree
rmSync('_site', { recursive: true, force: true });
mkdirSync('_site/preview', { recursive: true });

// Overview -> _site/index.html (site root). In the repo it sits beside preview.html in
// a11y-way-pages/site/; from the site root every link loses its leading ../
const home = rewrite(readFileSync('a11y-way-pages/site/overview.html', 'utf8'), 'site/overview.html', [
  ['href="overview.html"', 'href="./"'],   // brand self-link -> site root
  ['href="preview.html"', 'href="preview/"'], // sibling page -> clean preview URL
  ['../../themes/', 'themes/'],            // built theme assets (css/js)
  ['../assets/', 'assets/'],               // favicon, brand mark + their themers
]);
writeFileSync('_site/index.html', home);

// Preview -> _site/preview/index.html (/preview/). One level down from the site root,
// so its two-up repo links (../../themes/, ../../gallery/) become one-up here, and its
// ../assets/ already resolves to _site/assets — no rewrite for that one.
const preview = rewrite(readFileSync('a11y-way-pages/site/preview.html', 'utf8'), 'site/preview.html', [
  ['href="overview.html"', 'href="../"'],  // back link -> home
  ['../../themes/', '../themes/'],
  ['../../gallery/', '../gallery/'],
]);
writeFileSync('_site/preview/index.html', preview);

// Theme assets. No filter any more: preview.html is a brand page and lives in
// a11y-way-pages/site/, not in themes/.
cpSync('themes', '_site/themes', { recursive: true });

// The shared component gallery (gallery.js + gallery.css), which the preview page
// renders after its page head. preview.html links ../../gallery/ in the repo, rewritten
// to ../gallery/ above so it resolves to _site/gallery/ from /preview/.
cpSync('gallery', '_site/gallery', { recursive: true });

// Site assets (favicon + brand mark + the scripts that re-color them per theme).
// Served from
// /assets/ for both pages: the home page's ../assets/ was rewritten above, and
// /preview/ resolves ../assets/ to the same place.
// (skip full-resolution image sources — they're gitignored, so they don't exist
// in CI; excluding them keeps a local dry-run identical to the real deploy)
cpSync('a11y-way-pages/assets', '_site/assets', {
  recursive: true,
  filter: (src) => !src.endsWith('header-image.png'),
});

// Sanity: the load-bearing files must exist
for (const f of ['_site/index.html', '_site/preview/index.html', '_site/themes/theme.css', '_site/themes/theme-init.js',
                 '_site/themes/dropdown.css', '_site/themes/dropdown.js',
                 '_site/gallery/gallery.js', '_site/gallery/gallery.css',
                 '_site/assets/favicon.svg', '_site/assets/favicon-theme.js',
                 '_site/assets/brand-mark.svg', '_site/assets/brand-mark-theme.js',
                 '_site/assets/site-header.css', '_site/assets/site-footer.css']) {
  if (!existsSync(f)) {
    console.error(`ASSEMBLE FAIL: missing ${f}`);
    process.exit(1);
  }
}

console.log('SITE OK — clean URLs: / (overview), /preview/ (preview)');
