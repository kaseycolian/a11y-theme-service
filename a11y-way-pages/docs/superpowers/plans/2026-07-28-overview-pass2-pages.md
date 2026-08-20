# Overview Pass 2 — Polished Diagrams + GitHub Pages Home — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the polished visual overview (`docs/overview.html`), wire it as the GitHub Pages home with two-way navigation to the live product preview, and ship an Actions workflow that builds the themes and deploys the site — always reflecting the latest finalized themes.

**Architecture:** Extend the existing hand-authored, 100%-token-driven diagram component system in `docs/overview.html` (established by the Pass 1 hero) to render the five remaining flows, so everything re-skins live across all 16 themes. Add a "See Built-In Themes" CTA → `themes/preview.html`, and a back-to-home header on the preview. Deploy via a Pages workflow that builds themes from the highest-numbered `discovery/draft-N`, assembles a `_site/` mirroring the repo layout (so `../themes/…` relative paths resolve unchanged), and publishes it; a root `index.html` redirect is the entry point.

**Tech Stack:** Static HTML/CSS (no framework, no build step for the page itself), the repo's existing Node build (`tools/build-final.mjs`), GitHub Actions (`actions/configure-pages`, `upload-pages-artifact`, `deploy-pages`).

## Global Constraints

- **No hardcoded colors in diagrams.** Every diagram color must come from a theme token (`var(--…)`) or `color-mix()` over tokens, exactly like the hero. This is what makes the page re-skin.
- **Reuse the locked component system:** `.node-card`, `.node-card--accent`, `.connector`, `.connector--dashed`, `.node-label`, `.node-sub`. Add new shared helpers only when a flow genuinely needs one, and keep them token-driven and reusable across diagrams.
- **Responsive, zero horizontal overflow** at mobile / tablet / desktop widths — verified numerically (Playwright), not by eye.
- **Do not modify** `discovery/draft-1` (frozen) or the other discovery draft pages.
- **Do not change** the product's default build draft or `build-final.mjs` selection logic. The "latest draft" auto-detect lives only in the Pages workflow.
- **Content parity:** each HTML diagram must carry the same nodes / labels / intent as its `docs/OVERVIEW.md` mermaid counterpart, so the two representations stay in sync.
- **Assumption (documented):** highest `discovery/draft-N` == latest finalized themes.

## Verification method (reused from Pass 1 — referenced by every visual task)

- **Theming/legibility:** headless Edge screenshot with the `?theme=<id>` deep link (theme-init.js honors it). Capture a representative set — at minimum `rink-classic-dark`, `rink-classic-light`, `acid-arcade-light`, `hot-neon-dark` — and Read the PNGs to confirm the diagram re-skins and reads cleanly.
  ```bash
  # from repo root; run `npm run build-themes` once first so themes/theme.css exists
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
    --headless=new --disable-gpu --window-size=1200,2400 \
    --screenshot="scratch/ov-<theme>.png" \
    "file:///C:/Sources/mine/theme-service/docs/overview.html?theme=<theme>"
  ```
- **Overflow truth:** global Playwright driving system Chrome. Assert `scrollWidth == innerWidth` at 390 / 768 / 1280.
  ```js
  // node scratch/overflow.js  (NODE_PATH=$(npm root -g))
  const { chromium } = require('playwright');
  (async () => {
    const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
    const url = 'file:///C:/Sources/mine/theme-service/docs/overview.html';
    for (const w of [390, 768, 1280]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.goto(url, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(400);
      const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      console.log(w, m, m.sw <= m.iw ? 'OK' : 'OVERFLOW');
      await p.close();
    }
    await b.close();
  })();
  ```
- Screenshots go in the gitignored scratchpad, never committed.

---

## Task 1: Hero polish (deferred Pass 1 cleanups)

**Files:**
- Modify: `docs/overview.html` (hero section + `<style>`)

**Interfaces:**
- Produces: no new shared components; leaves `.node-card`/`.connector`/etc. unchanged for later tasks.

- [ ] **Step 1:** In `docs/overview.html`, add `aria-hidden="true"` to the defs-only `<svg>` (the `<svg width="0" height="0" …>` around line 92).

- [ ] **Step 2:** Remove the redundant accessible-name duplication on the theme select (~line 79): keep the wrapping `<label>Theme …</label>` and drop the `aria-label="Theme"` attribute from the `<select>` (a visible `<label>` already names it). Result: `<select class="select" data-theme-select style="padding:6px 26px 6px 10px"></select>`.

- [ ] **Step 3:** Delete the unused `.hero-flow-svg { … }` rule from the `<style>` block (~line 62). Confirm no element uses that class (grep `hero-flow-svg`).

- [ ] **Step 4:** Add a positioned dashed skill→build connector. Give `.hero-skill .node-card` a stable hook and draw one dashed connector from the skill card up to the "Build" card region using an absolutely-positioned inline SVG inside `#hero-export` that reuses `.connector.connector--dashed` (stroke `url(#grad-flow)`, glow `url(#glow-flow)`). Keep it `aria-hidden="true"` and `pointer-events:none`. It should visually reinforce the existing caption "drives the build & wires your apps" without breaking the responsive stack (hide or reflow it under the `max-width:720px` breakpoint if it would overlap).

- [ ] **Step 5: Verify** — run `npm run build-themes`, then the Edge screenshot (dark + light) and the Playwright overflow check. Expected: hero looks the same as before minus the fixes, the dashed connector renders, `scrollWidth <= innerWidth` at 390/768/1280.

- [ ] **Step 6: Commit**
  ```bash
  git add docs/overview.html
  git commit -m "Hero polish: aria tidy-ups, drop unused CSS, add dashed skill connector"
  ```

---

## Task 2: Diagram — "Who uses it, and the two ways in"

**Files:**
- Modify: `docs/overview.html` (add a `<section>` after the hero; add layout helpers to `<style>` if not present)

**Interfaces:**
- Produces: reusable layout helpers `.flow-row` (horizontal, wraps→stacks) and `.flow-col` (vertical stack), and a reusable arrow snippet — consumed by Tasks 3–6. Define them here once.

- [ ] **Step 1:** Add these token-driven layout helpers to the `<style>` block (only the ones not already present):
  ```css
  .ov-section { margin-top: 56px; }
  .ov-section > h2 { font-size: 19px; margin: 0 0 4px; }
  .ov-section > .ov-lead { color: var(--text-muted); margin: 0 0 20px; max-width: 64ch; line-height: 1.55; }
  .flow-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .flow-col { display: flex; flex-direction: column; gap: 12px; }
  .flow-row .node-card { flex: 1 1 160px; min-width: 150px; }
  .flow-arrow { flex: 0 0 40px; align-self: center; }
  @media (max-width: 720px) {
    .flow-row { flex-direction: column; align-items: stretch; }
    .flow-row .node-card { flex: 1 1 auto; }
    .flow-arrow { transform: rotate(90deg); align-self: center; }
  }
  ```
  Reusable arrow snippet (copy wherever a connector is needed between cards):
  ```html
  <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
    <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/>
  </svg>
  ```

- [ ] **Step 2:** Add the section markup after the hero `</section>` (content parity with OVERVIEW.md lines 45–56). Use a `.node-card--accent` for the decision node and one branch per path:
  ```html
  <section class="ov-section" id="two-ways">
    <h2>Who uses it, and the two ways in</h2>
    <p class="ov-lead">You never have to touch theme creation to get value — Path 1 stands alone.</p>
    <div class="flow-row">
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-purple)">
        <span class="node-label">You</span>
        <span class="node-sub">what do you want?</span></div>
      <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
        <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
      <div class="flow-col" style="flex:1 1 320px">
        <div class="flow-row">
          <div class="node-card" style="--node-accent: var(--accent-pink)">
            <span class="node-label">Path 1 — Use the themes as-is</span>
            <span class="node-sub">install the skill → apply 16 themes to any app<br>npm run install-all</span></div>
          <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
            <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
          <div class="node-card">
            <span class="node-label">Apps get a theme picker</span>
            <span class="node-sub">every theme AA-validated</span></div>
        </div>
        <div class="flow-row">
          <div class="node-card" style="--node-accent: var(--accent-blue)">
            <span class="node-label">Path 2 — Make your own themes</span>
            <span class="node-sub">add a palette, be guided, or design a new style<br>npm run build-themes</span></div>
          <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
            <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
          <div class="node-card">
            <span class="node-label">Your themes join the set</span>
            <span class="node-sub">reusable across all your apps</span></div>
        </div>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 3: Verify** — Edge screenshot (dark + light) + Playwright overflow. Expected: two clearly-branched paths, re-skins, no overflow at 390/768/1280.

- [ ] **Step 4: Commit**
  ```bash
  git add docs/overview.html
  git commit -m "Overview: add themed 'two ways in' diagram + shared flow layout helpers"
  ```

---

## Task 3: Diagram — Workflow A (Apply the themes to an app)

**Files:**
- Modify: `docs/overview.html`

**Interfaces:**
- Consumes: `.flow-col`, `.node-card`, arrow snippet from Task 2.
- Produces: nothing new.

- [ ] **Step 1:** Add a vertical sequence section (content parity with OVERVIEW.md lines 69–82). Model the sequence as a `.flow-col` of steps with down-arrows between them; label the actor/participant in each `.node-sub`:
  ```html
  <section class="ov-section" id="wf-apply">
    <h2>Workflow A — Apply the themes to an app</h2>
    <p class="ov-lead">You ask; the agent does the wiring and confirms the choices that matter before changing anything.</p>
    <div class="flow-col" style="max-width:640px">
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-pink)">
        <span class="node-label">"Apply the theme-service to this app"</span>
        <span class="node-sub">you → Claude (skill)</span></div>
      <div class="node-card">
        <span class="node-label">Locate the source</span>
        <span class="node-sub">reads machine-local config</span></div>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-purple)">
        <span class="node-label">Confirm the choices that matter</span>
        <span class="node-sub">restyle depth? fonts? existing selector? placement?</span></div>
      <div class="node-card">
        <span class="node-label">Vendor CSS + map colors to tokens</span>
        <span class="node-sub">agent → your app repo</span></div>
      <div class="node-card">
        <span class="node-label">Add a theme picker + persistence</span>
        <span class="node-sub">all themes selectable</span></div>
      <div class="node-card">
        <span class="node-label">Verify WCAG AA + write tracking log</span>
        <span class="node-sub">THEME-SERVICE.md</span></div>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-green)">
        <span class="node-label">Done — switch themes live</span>
        <span class="node-sub">nothing else changed</span></div>
    </div>
  </section>
  ```
  Between each `.node-card` insert a down arrow: the arrow snippet wrapped so it points down, e.g. `<div style="align-self:center"><svg class="flow-arrow" style="transform:rotate(90deg)" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true"><path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg></div>`. (Since `.flow-col` stacks vertically at all widths, the rotate is unconditional here.)

- [ ] **Step 2: Verify** — Edge screenshot (dark + light) + Playwright overflow. Expected: readable top-to-bottom sequence, re-skins, no overflow.

- [ ] **Step 3: Commit**
  ```bash
  git add docs/overview.html
  git commit -m "Overview: add themed Workflow A (apply) diagram"
  ```

---

## Task 4: Diagram — Workflow B (Clone / save / update, local + GitHub)

**Files:**
- Modify: `docs/overview.html`

**Interfaces:**
- Consumes: Task 2 helpers. Uses `.connector--dashed` for optional-GitHub arrows.

- [ ] **Step 1:** Add the section (content parity with OVERVIEW.md lines 94–117). Convey **solid = local / dashed = optional GitHub** using `.connector` vs `.connector--dashed`, and include a short inline legend:
  ```html
  <section class="ov-section" id="wf-clone">
    <h2>Workflow B — Clone / save / update, with your own storage</h2>
    <p class="ov-lead">Your themes live on your machine and persist with a plain local commit — GitHub is optional. You can still pull upstream updates anytime without losing your themes.</p>
    <div class="flow-col" style="max-width:720px">
      <div class="node-card"><span class="node-label">Origin — theme-service</span>
        <span class="node-sub">clone or fork (once)</span></div>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-purple)">
        <span class="node-label">Your machine — local clone</span>
        <span class="node-sub">add your themes → tools/palettes/local.mjs → npm run build-themes → git commit (saved locally ✔, no GitHub required)</span></div>
      <div class="node-card"><span class="node-label">npm run update-from-origin</span>
        <span class="node-sub">fetch + merge, conflict-free — your local.mjs is never touched; nothing auto-deleted</span></div>
      <div class="node-card" style="--node-accent: var(--accent-blue); border-style:dashed">
        <span class="node-label">Optional: git push → your own GitHub</span>
        <span class="node-sub">backup · sync machines · share</span></div>
    </div>
    <p class="node-sub" style="margin-top:12px">Solid = local (works with just local git). Dashed = optional GitHub.</p>
  </section>
  ```
  Insert down-arrows between the first three cards (solid `.connector`) and a **dashed** down-arrow before the "Optional: git push" card (`.connector.connector--dashed`).

- [ ] **Step 2: Verify** — Edge screenshot (dark + light) + Playwright overflow. Expected: the dashed/solid distinction is visible and re-skins; no overflow.

- [ ] **Step 3: Commit**
  ```bash
  git add docs/overview.html
  git commit -m "Overview: add themed Workflow B (clone/save/update) diagram"
  ```

---

## Task 5: Diagram — Workflow C (Create or edit a theme)

**Files:**
- Modify: `docs/overview.html`

**Interfaces:**
- Consumes: Task 2 helpers (three-branch pattern like Task 2's decision node).

- [ ] **Step 1:** Add the section (content parity with OVERVIEW.md lines 134–145): a decision node → three on-ramps → one destination → build → commit.
  ```html
  <section class="ov-section" id="wf-create">
    <h2>Workflow C — Create or edit a theme</h2>
    <p class="ov-lead">Three on-ramps, one destination: a validated palette that becomes a reusable theme.</p>
    <div class="flow-row">
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-purple)">
        <span class="node-label">Add / edit a theme</span><span class="node-sub">how?</span></div>
      <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
        <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
      <div class="flow-col" style="flex:1 1 300px">
        <div class="node-card" style="--node-accent: var(--accent-pink)"><span class="node-label">I have a palette</span>
          <span class="node-sub">give colors → agent fills gaps + validates AA</span></div>
        <div class="node-card" style="--node-accent: var(--accent-blue)"><span class="node-label">Guide me</span>
          <span class="node-sub">describe a vibe → agent proposes + iterates</span></div>
        <div class="node-card" style="--node-accent: var(--accent-green)"><span class="node-label">A whole new style</span>
          <span class="node-sub">design candidates in a discovery draft, compare side-by-side</span></div>
      </div>
      <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
        <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
      <div class="flow-col" style="flex:1 1 180px">
        <div class="node-card"><span class="node-label">local.mjs (yours)</span>
          <span class="node-sub">npm run build-themes — AA-validated</span></div>
        <div class="node-card"><span class="node-label">git commit</span>
          <span class="node-sub">saved locally</span></div>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 2: Verify** — Edge screenshot (dark + light) + Playwright overflow. Expected: three on-ramps converge to one destination; re-skins; no overflow.

- [ ] **Step 3: Commit**
  ```bash
  git add docs/overview.html
  git commit -m "Overview: add themed Workflow C (create/edit) diagram"
  ```

---

## Task 6: Diagram — Workflow D (Releasing)

**Files:**
- Modify: `docs/overview.html`

**Interfaces:**
- Consumes: Task 2 helpers.

- [ ] **Step 1:** Add the section (content parity with OVERVIEW.md lines 156–166): change → release command → (bump VERSION / CHANGELOG / tag) → push → forks update.
  ```html
  <section class="ov-section" id="wf-release">
    <h2>Workflow D — Releasing (origin owner)</h2>
    <p class="ov-lead">One command cuts a versioned, tagged release that forks can pull.</p>
    <div class="flow-row">
      <div class="node-card"><span class="node-label">Make changes</span></div>
      <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
        <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-purple)">
        <span class="node-label">npm run release minor -- --note '…'</span>
        <span class="node-sub">bump VERSION · CHANGELOG entry · git tag vX.Y.Z</span></div>
      <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
        <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
      <div class="node-card" style="--node-accent: var(--accent-blue)">
        <span class="node-label">git push --follow-tags</span></div>
      <svg class="flow-arrow" width="40" height="24" viewBox="0 0 46 24" aria-hidden="true">
        <path class="connector" d="M2 12 H36"/><path class="connector" d="M30 6 L40 12 L30 18"/></svg>
      <div class="node-card" style="--node-accent: var(--accent-green)">
        <span class="node-label">Forks update</span>
        <span class="node-sub">via update-from-origin</span></div>
    </div>
  </section>
  ```

- [ ] **Step 2: Verify** — Edge screenshot (dark + light) + Playwright overflow. Also do a full-page screenshot to confirm all six diagrams read as one consistent system. Expected: consistent styling across all diagrams; no overflow.

- [ ] **Step 3: Commit**
  ```bash
  git add docs/overview.html
  git commit -m "Overview: add themed Workflow D (release) diagram"
  ```

---

## Task 7: Two-way navigation (home CTA + preview back-home header)

**Files:**
- Modify: `docs/overview.html` (topbar CTA)
- Modify: `themes/preview.html` (sticky back-home header)

**Interfaces:**
- Produces: home → `../themes/preview.html`; preview → `../docs/overview.html`. These exact relative paths must hold in-repo AND in the deployed `_site/` layout (Task 9 mirrors the structure so they do).

- [ ] **Step 1:** In `docs/overview.html`, add a "See Built-In Themes →" CTA to the `.topbar` (after the motion toggle). Style it with tokens (reuse the accent/button look; it must re-skin):
  ```html
  <a class="ov-cta" href="../themes/preview.html">See Built-In Themes →</a>
  ```
  ```css
  .topbar { justify-content: flex-start; }
  .ov-cta { margin-left: auto; text-decoration: none; font-size: 13px; font-weight: 600;
            padding: 7px 14px; border-radius: 999px; color: var(--text);
            border: 1px solid color-mix(in srgb, var(--accent-purple) 55%, var(--border));
            background: color-mix(in srgb, var(--accent-purple) 14%, transparent);
            box-shadow: 0 0 12px color-mix(in srgb, var(--accent-purple) 30%, transparent);
            white-space: nowrap; }
  .ov-cta:hover { border-color: var(--accent-pink); box-shadow: 0 0 16px color-mix(in srgb, var(--accent-pink) 40%, transparent); }
  .ov-cta:focus-visible { outline: 3px solid var(--accent-blue); outline-offset: 2px; }
  @media (max-width: 720px) { .ov-cta { margin-left: 0; } }
  ```

- [ ] **Step 2:** In `themes/preview.html`, add a sticky back-home header immediately after `<body>` (it already loads `theme.css`, so tokens are available). Add the CSS to its `<style>` block:
  ```html
  <div class="ov-nav">
    <a class="ov-nav-back" href="../docs/overview.html">← Overview</a>
    <strong>Built-In Themes — Live Preview</strong>
  </div>
  ```
  ```css
  .ov-nav { position: sticky; top: 0; z-index: 50; display: flex; gap: 16px; align-items: center;
            padding: 10px 18px; background: var(--bg-panel); border-bottom: 1px solid var(--border); }
  .ov-nav strong { font-size: 13.5px; }
  .ov-nav-back { text-decoration: none; font-size: 13px; font-weight: 600; color: var(--text);
                 padding: 5px 12px; border-radius: 999px; border: 1px solid var(--border); white-space: nowrap; }
  .ov-nav-back:hover { border-color: var(--accent-pink); }
  .ov-nav-back:focus-visible { outline: 3px solid var(--accent-blue); outline-offset: 2px; }
  ```
  If `preview.html` already has its own top switcher bar, place `.ov-nav` above it and make sure the two don't visually collide (adjust `top`/order as needed).

- [ ] **Step 3: Verify** — Open `docs/overview.html` in a browser, click "See Built-In Themes →" (lands on preview), click "← Overview" (returns home). Confirm both re-skin. Re-run the overflow check on both pages if the topbar changed layout. Note: `themes/theme.css` must exist (`npm run build-themes`) for the preview to render.

- [ ] **Step 4: Commit**
  ```bash
  git add docs/overview.html themes/preview.html
  git commit -m "Add two-way nav: home CTA to preview + back-to-home header on preview"
  ```

---

## Task 8: Root redirect + ignore build artifacts

**Files:**
- Create: `index.html` (repo root)
- Modify: `.gitignore`

**Interfaces:**
- Produces: the Pages entry point `index.html` that Task 9 copies to `_site/index.html`.

- [ ] **Step 1:** Create `index.html` at the repo root — a redirect to the overview:
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=docs/overview.html">
    <link rel="canonical" href="docs/overview.html">
    <title>Theme Service</title>
  </head>
  <body>
    <p>Redirecting to the <a href="docs/overview.html">Theme Service overview</a>…</p>
    <script>location.replace('docs/overview.html');</script>
  </body>
  </html>
  ```

- [ ] **Step 2:** Append `_site/` to `.gitignore` (the assembled site is CI output; never commit it).

- [ ] **Step 3: Verify** — Open `index.html` locally; it should redirect to `docs/overview.html`. `git status` shows `index.html` tracked and no `_site/`.

- [ ] **Step 4: Commit**
  ```bash
  git add index.html .gitignore
  git commit -m "Add root index.html redirect to overview + gitignore _site/"
  ```

---

## Task 9: GitHub Actions — build themes, assemble _site, deploy to Pages

**Files:**
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: `index.html` (Task 8), `docs/overview.html` (Tasks 1–7), `themes/` (built), `tools/build-final.mjs`, `discovery/draft-*`.

- [ ] **Step 1:** Create `.github/workflows/pages.yml`:
  ```yaml
  name: Deploy overview to GitHub Pages

  on:
    push:
      branches: [main]
    workflow_dispatch:

  permissions:
    contents: read
    pages: write
    id-token: write

  concurrency:
    group: pages
    cancel-in-progress: false

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 'lts/*'
        - name: Install deps
          run: npm ci || npm install
        - name: Build themes from the latest finalized draft
          run: |
            N=$(ls -d discovery/draft-*/ | sed -E 's#.*draft-([0-9]+)/#\1#' | sort -n | tail -1)
            echo "Latest finalized draft: draft-$N"
            node tools/build-final.mjs "$N" --write
        - name: Assemble _site (mirror repo layout so ../themes/ resolves)
          run: |
            rm -rf _site
            mkdir -p _site/docs _site/themes
            cp index.html _site/index.html
            cp docs/overview.html _site/docs/overview.html
            cp -r themes/. _site/themes/
        - uses: actions/configure-pages@v5
        - uses: actions/upload-pages-artifact@v3
          with:
            path: _site
    deploy:
      needs: build
      runs-on: ubuntu-latest
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - id: deployment
          uses: actions/deploy-pages@v4
  ```

- [ ] **Step 2:** Note in the PR/handoff that the repo owner must set **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time, manual, out of scope for code).

- [ ] **Step 3: Verify (local dry-run of the build + assembly, since Actions can't run locally):**
  ```bash
  N=$(ls -d discovery/draft-*/ | sed -E 's#.*draft-([0-9]+)/#\1#' | sort -n | tail -1); echo "draft-$N"
  node tools/build-final.mjs "$N" --write
  rm -rf _site && mkdir -p _site/docs _site/themes
  cp index.html _site/index.html && cp docs/overview.html _site/docs/overview.html && cp -r themes/. _site/themes/
  # sanity: these must exist
  test -f _site/index.html && test -f _site/docs/overview.html && test -f _site/themes/theme.css && test -f _site/themes/preview.html && echo "SITE OK"
  ```
  Then open `_site/index.html` (redirects to `_site/docs/overview.html`), confirm the page + all six diagrams render, click through to `_site/themes/preview.html` and back. Confirm auto-detect printed the highest draft number. Clean up: `rm -rf _site` (it's gitignored anyway).

- [ ] **Step 4: Commit**
  ```bash
  git add .github/workflows/pages.yml
  git commit -m "Add GitHub Pages workflow: build latest-draft themes, assemble _site, deploy"
  ```

---

## Task 10: Documentation & agent-workflow consistency

**Files:**
- Modify: `docs/OVERVIEW.md` (status block + live-demo link)
- Modify: `AGENTS.md`, `CREATING-THEMES.md`, `skill/references/adding-a-theme.md` (auto-detect convention note)

**Interfaces:**
- Consumes: the behavior shipped in Tasks 1–9.

- [ ] **Step 1:** In `docs/OVERVIEW.md`, update the "## Polished-graphic status" block:
  - Change Pass 2 to ✅ (remaining diagrams done).
  - Change the Image-export line to: `- ⛔ **Image export — dropped.** The graphics live on the page (it's the human quick-view / GitHub Pages home), so no PNG/SVG export is needed.`
  - Change Hero-polish to ✅.
  - Add a line: `- 🌐 **Live demo:** the [overview page](overview.html) is the repo's GitHub Pages home; its "See Built-In Themes" button opens the live [product preview](../themes/preview.html).`
  - (Once Pages is enabled and the URL is known, add the actual `https://kaseycolian.github.io/theme-service/` link.)

- [ ] **Step 2:** Add a short note to each of `AGENTS.md`, `CREATING-THEMES.md`, and `skill/references/adding-a-theme.md` in the finalize/create-a-draft section. Suggested wording (adapt to each file's voice):
  > **Publishing to the live site.** The GitHub Pages home (`docs/overview.html`) links a live "Built-In Themes" preview (`themes/preview.html`), which renders the built `theme.css`. The Pages workflow (`.github/workflows/pages.yml`) auto-detects the **highest-numbered `discovery/draft-N`** and builds themes from it, so **when you finalize a new draft as the highest `draft-N`, it automatically becomes the live preview on the next push to `main`** — no extra publish step. Convention: highest `draft-N` = the latest finalized set.

- [ ] **Step 3: Verify** — Render `docs/OVERVIEW.md` mentally/preview; confirm the status block is accurate and the convention note appears in all three docs (grep for "highest-numbered" across them).

- [ ] **Step 4: Commit**
  ```bash
  git add docs/OVERVIEW.md AGENTS.md CREATING-THEMES.md skill/references/adding-a-theme.md
  git commit -m "Docs: mark Pass 2 done, drop image export, document Pages auto-detect convention"
  ```

---

## Self-review — spec coverage

- Spec §1 (five diagrams) → Tasks 2–6. ✔
- Spec §2 (hero polish, export dropped) → Task 1. ✔
- Spec §3 (home CTA + preview back-home header) → Task 7. ✔
- Spec §4 (Pages workflow, root redirect, `_site` mirror, auto-detect always-latest) → Tasks 8 + 9. ✔
- Spec §5 (docs consistency: OVERVIEW status + auto-detect convention in AGENTS/CREATING-THEMES/adding-a-theme) → Task 10. ✔
- Spec non-goals respected: no image export; preview only gains a header; draft-1 untouched; product build default unchanged (auto-detect only in the workflow); Pages-settings enablement flagged as manual. ✔
- Verification method (Playwright overflow + Edge screenshots) → defined once, referenced by every visual task. ✔

**Type/name consistency:** shared helpers `.flow-row` / `.flow-col` / `.flow-arrow` / arrow snippet defined in Task 2, reused verbatim in Tasks 3–6. Nav paths `../themes/preview.html` and `../docs/overview.html` are consistent across Tasks 7, 8, 9 and hold in the `_site/` mirror. Build entry `node tools/build-final.mjs <N> --write` matches `package.json`'s `build-themes`.
