# Overview Hero Graphic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `docs/overview.html` — a themed, self-dogfooding page whose hero renders the "What it is (in one picture)" pipeline in full neon styling, re-skinning live across all themes via the real theme selector.

**Architecture:** A single static HTML page under `docs/` loads the real built theme assets from `../themes/` (so it can't drift from the brand) and carries the shipped `<select data-theme-select>` + `[data-motion-toggle]` wiring. The hero diagram is hand-authored HTML/CSS `.node-card`s connected by inline-SVG paths with gradient strokes and glow filters — every color pulls from theme tokens so a theme switch re-skins the whole graphic. This pass builds the hero only and leaves behind a reusable component system for the remaining five diagrams.

**Tech Stack:** Plain HTML + CSS + the existing generated theme JS (`theme-init.js`, `theme-select.js`). No framework, no bundler, no new dependencies. Verification via headless browser screenshots.

## Global Constraints

- **No new dependencies; no build step for the page.** Plain HTML/CSS/JS only. (user pref: lightweight)
- **Framework-agnostic:** styling via CSS custom properties only — no framework APIs.
- **All colors come from theme tokens** — introduce **no** hardcoded hex colors in the page. Vocabulary: `--bg`, `--bg-panel`, `--bg-elevated`, `--text`, `--text-muted`, `--border`, `--border-strong`, `--accent-pink`, `--accent-purple`, `--accent-blue`, `--accent-green`, `--fx-grid-opacity`, `--font-ui`, `--font-mono`, and the glow tokens (`--tglow-*`).
- **CSP-safe:** theme scripts stay **external** (`theme-init.js` in `<head>`, `theme-select.js` at end of `<body>`) — never inline. (Inline JS is blocked under MV3/strict CSP.)
- **Accessibility:** real text nodes (not text baked into images); honor both `prefers-reduced-motion` and the in-page motion toggle (inherited from the theme assets). No new color pairings outside the AA-validated tokens.
- **Public-git safety:** no machine-specific absolute paths, usernames, or emails in committed files.
- **Dependency:** `themes/theme.css`, `effects.css`, `components.css`, `theme-init.js`, `theme-select.js`, `themes.index.json` are gitignored **build output**. Task 0 verifies they exist (builds if not) before anything references them.

## Verification approach (read once)

This is a visual artifact, so "tests" are headless-browser render checks, not unit tests. Each task ends by rendering the page headless and confirming the deliverable, then committing.

Headless screenshot command (Windows; Edge is present on Win11 — Chrome path shown as fallback). `theme-init.js` reads `?theme=` before first paint, so a specific theme is selected by URL:

```bash
# Edge (primary)
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  --headless=new --disable-gpu --window-size=1280,900 \
  --screenshot="C:/Users/KASEY~1.COL/AppData/Local/Temp/claude/c--Sources-mine-theme-service/7b98a72c-9e0b-4dc1-9735-bc1c4c0adacd/scratchpad/hero-dark.png" \
  "file:///C:/Sources/mine/theme-service/docs/overview.html?theme=rink-classic-dark"

# Chrome fallback: "/c/Program Files/Google/Chrome/Application/chrome.exe" (same flags)
```

Then **Read** the resulting PNG (the Read tool renders images) to visually confirm. Swap `?theme=` for a light id (e.g. `rink-classic-light`) and a narrow `--window-size=390,900` for the responsive check. To catch JS/load errors, also dump the rendered DOM and confirm the diagram nodes are present:

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  --headless=new --disable-gpu --dump-dom \
  "file:///C:/Sources/mine/theme-service/docs/overview.html" | grep -c "node-card"
```

Commit author for this repo is set locally (personal email) — use a plain `git commit`, no author overrides.

---

## Task 0: Verify theme build output exists

**Files:**
- Modify: none (guard task)

**Interfaces:**
- Produces: a confirmed set of `themes/*.css` + `themes/*.js` assets the page will load.

- [ ] **Step 1: Check for built assets**

Run:
```bash
cd "c:/Sources/mine/theme-service" && ls themes/theme.css themes/effects.css themes/components.css themes/theme-init.js themes/theme-select.js
```
Expected: all five paths listed.

- [ ] **Step 2: If any are missing, build them**

Run (only if Step 1 reported a missing file):
```bash
cd "c:/Sources/mine/theme-service" && npm run build-themes
```
Expected: build completes; the five files now exist. (No commit — these are gitignored build output.)

---

## Task 1: Page skeleton wired to the real theme selector (dogfood)

Deliverable: a themed `docs/overview.html` that loads the real assets and whose selector switches all themes live — with a placeholder hero region.

**Files:**
- Create: `docs/overview.html`

**Interfaces:**
- Consumes: `../themes/theme-init.js`, `../themes/theme.css`, `../themes/effects.css`, `../themes/components.css`, `../themes/theme-select.js`; data attributes `data-theme` / `data-motion` on `<html>`.
- Produces: page shell + `.topbar` with `<select data-theme-select>` and `<input data-motion-toggle>`; an empty `<section id="hero-export">` the next tasks fill.

- [ ] **Step 1: Create the page shell**

Create `docs/overview.html`:

```html
<!DOCTYPE html>
<html lang="en" data-theme="rink-classic-dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Theme Service — Visual Overview</title>

<!-- Real theme assets, exactly as a consuming app wires them (external = CSP-safe) -->
<script src="../themes/theme-init.js"></script>
<link rel="stylesheet" href="../themes/theme.css">
<link rel="stylesheet" href="../themes/effects.css">
<link rel="stylesheet" href="../themes/components.css">

<style>
  body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-ui);
         transition: background .2s, color .2s; }
  .topbar { position: sticky; top: 0; z-index: 50; display: flex; gap: 18px; align-items: center;
            flex-wrap: wrap; padding: 12px 20px; background: var(--bg-panel);
            border-bottom: 1px solid var(--border); }
  .topbar strong { font-size: 14px; }
  .topbar label { font-size: 12.5px; color: var(--text-muted); display: inline-flex; gap: 8px;
                  align-items: center; }
  .topbar select { font-family: var(--font-mono); }
  main { max-width: 1040px; margin: 0 auto; padding: 32px 20px 80px; }
  .page-title { font-size: 24px; margin: 0 0 6px; }
  .page-lead { color: var(--text-muted); max-width: 64ch; line-height: 1.55; margin: 0 0 28px; }
</style>
</head>
<body class="fx-grid">

<div class="topbar">
  <strong>Theme Service — Visual Overview</strong>
  <label>Theme
    <select class="select" data-theme-select aria-label="Theme" style="padding:6px 26px 6px 10px"></select>
  </label>
  <label class="switch"><input type="checkbox" data-motion-toggle>
    <span class="track"><span class="thumb"></span></span> Disable animations</label>
</div>

<main>
  <h1 class="page-title">What it is, in one picture</h1>
  <p class="page-lead">One consistent “90s skating rink” neon look — 16 themes, dark + light, all
  WCAG&nbsp;AA — that any agent can drop into any app. Switch the theme above: this page re-skins
  through the same tokens every app gets.</p>

  <section id="hero-export">
    <!-- Hero pipeline diagram goes here (Task 3) -->
    <p style="color:var(--text-muted)">[hero placeholder]</p>
  </section>
</main>

<!-- Shipped helper populates &amp; wires the selector/toggle. External = CSP-safe. -->
<script src="../themes/theme-select.js"></script>
</body>
</html>
```

- [ ] **Step 2: Render headless and confirm the shell + selector**

Run the Edge screenshot command from "Verification approach" against `docs/overview.html?theme=rink-classic-dark`, output to the scratchpad as `hero-dark.png`.
Expected: PNG saved, no error.

- [ ] **Step 3: Read the screenshot to visually confirm**

Read the `hero-dark.png` file. Expected: dark neon page, sticky top bar with a populated Theme dropdown and a "Disable animations" toggle, the title/lead text, and the `[hero placeholder]` line.

- [ ] **Step 4: Confirm a light theme re-skins**

Re-run the screenshot with `?theme=rink-classic-light`, output `hero-light.png`, and Read it.
Expected: light background, dark text — proving the selector/token path works end-to-end.

- [ ] **Step 5: Commit**

```bash
cd "c:/Sources/mine/theme-service" && git add docs/overview.html && git commit -m "Add overview.html shell wired to the real theme selector"
```

---

## Task 2: Reusable diagram component system (node-card, connector, labels)

Deliverable: token-driven CSS classes for diagram nodes and connectors, proven with two sample nodes joined by one gradient/glow connector.

**Files:**
- Modify: `docs/overview.html` (the `<style>` block; temporary sample markup in `#hero-export`)

**Interfaces:**
- Produces CSS classes the hero (Task 3) and later diagrams consume:
  - `.diagram` — flex/grid container for nodes + SVG overlay.
  - `.node-card` — glass panel node (bg `--bg-panel`, border `--border`, soft glow, radius).
  - `.node-card--accent` — accent-tinted border/glow (emphasis nodes). Accent chosen per-node with an inline `style="--node-accent: var(--accent-blue)"`.
  - `.node-label` — node title (`--text`, `--font-ui`).
  - `.node-sub` — mono subtitle for file paths / npm scripts (`--text-muted`, `--font-mono`).
  - `.connector` — an inline-SVG `<path>` styled with a gradient stroke + glow filter; `.connector--dashed` for optional/drives relationships.

- [ ] **Step 1: Add the component CSS**

Add to the `<style>` block in `docs/overview.html`:

```css
  /* --- Diagram component system (token-driven; reused by all overview diagrams) --- */
  .diagram { position: relative; }
  .node-card {
    --node-accent: var(--border-strong);
    background: color-mix(in srgb, var(--bg-panel) 88%, transparent);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--node-accent) 12%, transparent),
                0 8px 24px color-mix(in srgb, var(--bg) 60%, transparent);
    backdrop-filter: blur(2px);
  }
  .node-card--accent {
    border-color: color-mix(in srgb, var(--node-accent) 55%, var(--border));
    box-shadow: 0 0 18px color-mix(in srgb, var(--node-accent) 35%, transparent),
                0 0 0 1px color-mix(in srgb, var(--node-accent) 40%, transparent);
  }
  .node-label { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
  .node-sub   { display: block; margin-top: 4px; font-family: var(--font-mono);
                font-size: 11.5px; color: var(--text-muted); word-break: break-word; }
  .connector  { fill: none; stroke: url(#grad-flow); stroke-width: 2.5; filter: url(#glow-flow);
                stroke-linecap: round; }
  .connector--dashed { stroke-dasharray: 5 6; opacity: .9; }
```

- [ ] **Step 2: Add temporary sample markup to prove the classes**

Replace the `#hero-export` placeholder paragraph with two sample nodes + one connector (temporary — Task 3 replaces this):

```html
    <div class="diagram" style="display:flex; gap:60px; align-items:center; padding:20px 0;">
      <svg width="0" height="0" style="position:absolute">
        <defs>
          <linearGradient id="grad-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stop-color="var(--accent-pink)"/>
            <stop offset="50%" stop-color="var(--accent-purple)"/>
            <stop offset="100%" stop-color="var(--accent-blue)"/>
          </linearGradient>
          <filter id="glow-flow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>
      <div class="node-card"><span class="node-label">Source</span>
        <span class="node-sub">tools/palettes/*.mjs</span></div>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-blue)">
        <span class="node-label">Build</span><span class="node-sub">npm run build-themes</span></div>
    </div>
```

- [ ] **Step 3: Render and Read to confirm styling**

Screenshot `?theme=rink-classic-dark` → `comp-dark.png`, Read it.
Expected: two glass cards; the "Build" card has a visible accent (blue) glow/border; mono subtitles legible.

- [ ] **Step 4: Confirm the gradient definition resolves under a light theme**

Screenshot `?theme=synthwave-sunset-dark` → `comp-alt.png`, Read it.
Expected: cards re-skinned to the alternate theme's panel/border/accent colors (proves tokens flow, no hardcoded color).

- [ ] **Step 5: Commit**

```bash
cd "c:/Sources/mine/theme-service" && git add docs/overview.html && git commit -m "Add token-driven diagram component system (node-card, connector) with sample nodes"
```

---

## Task 3: Hero pipeline diagram

Deliverable: the real 5-node "What it is" pipeline inside `#hero-export`, with inline-SVG gradient/glow connectors (dashed for the skill relationships), replacing the Task 2 sample.

**Files:**
- Modify: `docs/overview.html` (`#hero-export` contents; add hero-specific layout CSS)

**Interfaces:**
- Consumes: `.diagram`, `.node-card(+--accent)`, `.node-label`, `.node-sub`, `.connector(+--dashed)`, and the `#grad-flow` / `#glow-flow` SVG defs from Task 2.
- Produces: the finished hero markup within the `#hero-export` container (Task 4 makes it responsive + export-framed).

Diagram content (from OVERVIEW.md "What it is in one picture"):
`Source (built-in + your palettes)` → `npm run build-themes (validates WCAG AA)` [accent] → `themes/ output` [accent] → `Your apps`; plus `Claude skill / AGENTS.md` connected by **dashed** connectors to Build ("drives") and to Your apps ("apply · update · create").

- [ ] **Step 1: Add hero layout CSS**

Add to `<style>`:

```css
  #hero-export { position: relative; padding: 28px; border-radius: 18px;
                 background: var(--bg); border: 1px solid var(--border); overflow: hidden; }
  .hero-row { display: flex; align-items: center; justify-content: space-between; gap: 18px;
              flex-wrap: wrap; }
  .hero-row .node-card { flex: 1 1 150px; min-width: 140px; }
  .hero-skill { margin-top: 22px; display: flex; justify-content: center; }
  .hero-skill .node-card { max-width: 380px; text-align: center; }
  .hero-flow-svg { position: absolute; inset: 0; width: 100%; height: 100%;
                   pointer-events: none; }
  .flow-caption { font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase;
                  color: var(--text-muted); text-align: center; margin: 2px 0 0; }
```

- [ ] **Step 2: Replace `#hero-export` contents with the real pipeline**

```html
  <section id="hero-export">
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="grad-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--accent-pink)"/>
          <stop offset="50%" stop-color="var(--accent-purple)"/>
          <stop offset="100%" stop-color="var(--accent-blue)"/>
        </linearGradient>
        <filter id="glow-flow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
    </svg>

    <div class="hero-row">
      <div class="node-card">
        <span class="node-label">Source</span>
        <span class="node-sub">built-in + your palettes<br>tools/palettes/*.mjs</span></div>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-purple)">
        <span class="node-label">Build</span>
        <span class="node-sub">npm run build-themes<br>validates WCAG AA</span></div>
      <div class="node-card node-card--accent" style="--node-accent: var(--accent-blue)">
        <span class="node-label">themes/ output</span>
        <span class="node-sub">theme.css · tokens.json · helpers</span></div>
      <div class="node-card">
        <span class="node-label">Your apps</span>
        <span class="node-sub">vendor the CSS + a theme picker</span></div>
    </div>

    <div class="hero-skill">
      <div class="node-card" style="--node-accent: var(--accent-green)">
        <span class="node-label">Claude skill / AGENTS.md</span>
        <span class="node-sub">apply · update · create</span>
        <p class="flow-caption">drives the build &amp; wires your apps</p></div>
    </div>
  </section>
```

Note: the horizontal flow arrows between the four top nodes and the dashed lines from the skill node are drawn in Step 3 (they need positional coordinates). For this step the nodes render with CSS layout; the arrows are added next.

- [ ] **Step 3: Add the connector overlay**

Because absolute SVG coordinates are brittle across widths, draw the four left-to-right arrows as small inline SVGs *between* nodes using a flex gap marker, and the dashed skill relationships as a centered overlay. Replace the `.hero-row` node separators by inserting an arrow between each pair:

```html
<!-- insert between each adjacent pair inside .hero-row -->
<svg class="hero-arrow" width="46" height="24" viewBox="0 0 46 24" aria-hidden="true">
  <path class="connector" d="M2 12 H36"/>
  <path class="connector" d="M30 6 L40 12 L30 18"/>
</svg>
```

Add CSS so arrows sit inline and shrink out on wrap:

```css
  .hero-arrow { flex: 0 0 46px; align-self: center; }
  @media (max-width: 720px) { .hero-arrow { transform: rotate(90deg); } }
```

(The dashed skill→build/apps relationship is conveyed by the `.flow-caption` text under the skill card in this rough pass; a positioned dashed connector is deferred to the polish pass — noted so it isn't mistaken for missing scope.)

- [ ] **Step 4: Render, Read, confirm the hero**

Screenshot `?theme=rink-classic-dark` → `hero-final-dark.png`; Read it.
Expected: four nodes left→right with glowing gradient arrows between them; Build + output nodes accented; skill card centered below with its caption.

- [ ] **Step 5: DOM sanity check**

Run the `--dump-dom | grep -c "node-card"` command from the Verification approach.
Expected: `5` (four pipeline nodes + skill node).

- [ ] **Step 6: Commit**

```bash
cd "c:/Sources/mine/theme-service" && git add docs/overview.html && git commit -m "Build hero pipeline diagram with gradient/glow connectors"
```

---

## Task 4: Responsive + export-framing + multi-theme verification sweep

Deliverable: the hero stacks cleanly on narrow widths, `#hero-export` is framed for a future clean image export, and the page is verified across dark/light themes and desktop/mobile widths.

**Files:**
- Modify: `docs/overview.html` (`<style>` block only)

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: final rough-draft page (no new selectors for later tasks; this closes pass 1).

- [ ] **Step 1: Add responsive stacking + export aspect framing**

Add to `<style>`:

```css
  @media (max-width: 720px) {
    .hero-row { flex-direction: column; align-items: stretch; }
    .hero-row .node-card { flex: 1 1 auto; }
  }
  /* Export framing: a stable region a headless grab can crop to cleanly */
  #hero-export { max-width: 960px; margin: 0 auto; }
```

Confirm no rule sets a fixed pixel width that would force horizontal page scroll on mobile.

- [ ] **Step 2: Desktop dark render**

Screenshot `?theme=rink-classic-dark` at `--window-size=1280,900` → `sweep-desktop-dark.png`; Read.
Expected: horizontal pipeline, no clipping, no horizontal scrollbar.

- [ ] **Step 3: Desktop light render**

Screenshot `?theme=rink-classic-light` → `sweep-desktop-light.png`; Read.
Expected: light re-skin, arrows/glow still visible, text AA-legible.

- [ ] **Step 4: Mobile render**

Screenshot `?theme=rink-classic-dark` at `--window-size=390,900` → `sweep-mobile.png`; Read.
Expected: nodes stacked vertically, arrows rotated, no horizontal overflow.

- [ ] **Step 5: Alternate-theme spot check**

Screenshot `?theme=hot-neon-dark` → `sweep-alt.png`; Read.
Expected: fully re-skinned (proves no theme-specific hardcoding slipped in).

- [ ] **Step 6: Commit**

```bash
cd "c:/Sources/mine/theme-service" && git add docs/overview.html && git commit -m "Make hero responsive + export-framed; verified across themes and widths"
```

---

## Task 5: Link the graphic from OVERVIEW.md

Deliverable: `docs/OVERVIEW.md` points readers to the new visual page and its note is updated from "comes next" to "available".

**Files:**
- Modify: `docs/OVERVIEW.md` (intro note near line 4–5)

**Interfaces:**
- Consumes: `docs/overview.html`.

- [ ] **Step 1: Update the intro note**

In `docs/OVERVIEW.md`, change the first-pass note (currently "*a polished graphic version comes next.*") to link the hero page, e.g.:

```markdown
The diagrams below render as graphics on GitHub. *(Content-first diagrams. A polished, themed
visual version is in progress — see [overview.html](overview.html) for the hero, which re-skins
live across all themes.)*
```

- [ ] **Step 2: Confirm the link path**

Run:
```bash
cd "c:/Sources/mine/theme-service" && ls docs/overview.html && grep -n "overview.html" docs/OVERVIEW.md
```
Expected: file exists; the link line is present.

- [ ] **Step 3: Commit**

```bash
cd "c:/Sources/mine/theme-service" && git add docs/OVERVIEW.md && git commit -m "Link the themed hero graphic from OVERVIEW.md"
```

---

## Self-review notes (author)

- **Spec coverage:** file/structure → Task 1; component system → Task 2; hero layout → Task 3;
  export-readiness + responsive + a11y verification → Task 4; success-criteria discoverability →
  Task 5. Dependency-on-build-output risk → Task 0.
- **Deferred (explicitly, not dropped):** positioned dashed skill→build/apps connectors (conveyed
  by caption text this pass); image export script (later pass, per spec non-goals); the other five
  diagrams (later pass).
- **Token consistency:** `#grad-flow` / `#glow-flow` SVG ids are defined in Task 2's sample and
  re-declared in Task 3's hero (self-contained within `#hero-export`); `.node-card`, `.node-sub`,
  `.connector`, `--node-accent` names match across tasks.
- **No hardcoded colors** introduced anywhere; all via tokens (Global Constraints).
