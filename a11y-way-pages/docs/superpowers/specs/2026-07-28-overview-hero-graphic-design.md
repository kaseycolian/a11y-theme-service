# Overview Hero Graphic — Design (Pass 1)

**Date:** 2026-07-28
**Status:** Approved (design), pending spec review
**Scope:** Rough-draft, first-pass polished graphic for the theme-service visual overview.

## Context

[docs/OVERVIEW.md](../../OVERVIEW.md) already captures the *content* as six mermaid diagrams
(big-picture pipeline, two-ways-in, Workflows A–D, key terms). That was the deliberate
"nail the content first" pass. This spec covers the **first polished visual** — a themed,
brand-accurate rendering that replaces GitHub's default mermaid look.

Decisions locked during brainstorming:

- **Output pipeline:** themed HTML page as source of truth → export to PNG/SVG later.
  This spec builds the HTML page only; the export step is a later pass.
- **This pass' scope:** the **hero** diagram only — the "What it is (in one picture)" pipeline —
  fully styled to lock the visual language (type, glow, cards, arrows). The other five diagrams
  reuse the resulting component system in a later pass.
- **Look:** the page **dogfoods** the product — it loads the real theme assets and carries the
  real theme selector, so the hero re-skins live across all 16 themes. Initial theme:
  `rink-classic-dark` (brand default).
- **Render approach:** hand-authored HTML/CSS nodes + inline-SVG connectors, all driven by theme
  tokens (chosen over mermaid-with-overrides and one-off bespoke SVG). Only token-driven DOM
  re-skins live *and* leaves behind a reusable component system.

## Non-goals (YAGNI)

- No export script this pass (only make the hero container export-friendly).
- No restyling of the other five diagrams this pass.
- No changes to `themes/` source or the build tooling.
- No new dependencies; no build step for the page (plain HTML/CSS/JS).

## Architecture

A single self-contained page: **`docs/overview.html`**. CSS starts inline; split to
`docs/overview.css` only if it grows unwieldy. No framework, no bundler.

The page loads the **real** built theme assets by relative path so it can never drift from the
brand (same tokens every consuming app gets):

- `../themes/theme.css`, `../themes/effects.css`, `../themes/components.css`
- `../themes/theme-init.js` (pre-paint, anti-flash) — runs before body render
- `../themes/theme-select.js` (populates `<select data-theme-select>`, wires `[data-motion-toggle]`)

`<html>` starts with `data-theme="rink-classic-dark"`. The selector lets the viewer flip all 16
themes and toggle motion live. `.fx-grid` on the hero background reads `--fx-grid-opacity` per theme.

> Dependency note: `themes/theme.css` and friends are gitignored **build output**. The page
> requires a prior `npm run build-themes`. The plan must verify these files exist (or run the
> build) before the page can be viewed.

## Component system (token-driven, reused by later diagrams)

| Component | Purpose | Key tokens |
|-----------|---------|-----------|
| `.node-card` | Glass panel diagram node: panel bg, bordered, soft inner glow, rounded | `--bg-panel`, `--border`, glow tokens |
| `.node-card--accent` | Emphasis node (build step, output) — accent-tinted border/glow | `--accent-*` |
| `.connector` | Inline-SVG `<path>`, gradient stroke + SVG glow `<filter>`; solid or dashed | `--accent-pink`/`--accent-purple`/`--accent-blue` |
| `.node-label` / `.node-sub` | Node title + mono subtitle (file paths, npm scripts) | `--text`, `--text-muted` |

Gradient stroke echoes the existing pink→purple→blue scrollbar gradient for brand cohesion.
Dashed connectors represent the "optional / drives" relationships (e.g. skill → build).

## Hero layout

Renders the "What it is (in one picture)" pipeline:

```
Source (built-in + your palettes) ──▶ npm run build-themes (validates WCAG AA)
   ──▶ themes/ output ──▶ Your apps
   Claude skill / AGENTS.md ┈┈▶ build  &  ┈┈▶ apps   (dotted)
```

- Left-to-right flow on desktop; stacks to vertical on narrow widths (responsive, no fixed pixel
  layout that breaks on mobile).
- Nodes are `.node-card`s; the build and output nodes use `--accent` emphasis.
- Connectors are inline SVG with gradient + glow; skill relationships are dashed.

## Export-readiness (for the later pass, not built now)

The hero sits inside a fixed-aspect `#hero-export` wrapper with a solid themed background so a
future headless-Chrome screenshot or DOM-to-SVG grab of that single element yields a clean image
with no page chrome. This pass only ensures the container is structured for that; it writes no
export code.

## Accessibility

- Real text nodes (not text-in-image) — screen-reader legible, selectable.
- Honors `prefers-reduced-motion` **and** the in-page motion toggle (via existing theme assets).
- All color pairings inherit the AA-validated theme tokens; no new hardcoded colors introduced.

## Success criteria

1. `docs/overview.html` opens in a browser and shows the hero pipeline in full neon styling.
2. The theme selector switches all 16 themes and the hero re-skins live (dark + light verified).
3. The motion toggle and `prefers-reduced-motion` both disable animation.
4. Layout is responsive (desktop horizontal → mobile vertical) with no horizontal page scroll.
5. A reusable component system (`.node-card`, `.connector`, labels) exists for the later five
   diagrams.
6. No changes to `themes/` source or build tooling; no new dependencies.

## Verification

- Headless Chrome render at desktop + mobile widths, default + one light theme, confirming
  re-skin and no console errors.
- Visual check that connectors show gradient + glow and dashed relationships read correctly.
