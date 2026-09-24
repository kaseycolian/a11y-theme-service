/* =============================================================================
   contrast.mjs — standalone WCAG 2.x contrast library. No dependencies.
   Reusable across projects: import the functions, or use ./cli.mjs.

   WCAG 2.x contrast ratio + level thresholds:
     - AA  normal text (< 18.66px bold / < 24px):  >= 4.5:1
     - AA  large text  (>= 18.66px bold / >= 24px): >= 3.0:1
     - AA  UI components / graphical objects:        >= 3.0:1
     - AAA normal text:                              >= 7.0:1
     - AAA large text:                               >= 4.5:1
   ============================================================================= */

/** Parse a #rgb / #rgba / #rrggbb / #rrggbbaa hex string to [r,g,b] (0-255). Alpha ignored. */
export function hexToRgb(hex) {
  if (typeof hex !== 'string') throw new TypeError(`Expected hex string, got ${typeof hex}`);
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6 && h.length !== 8) throw new Error(`Invalid hex color: "${hex}"`);
  if (!/^[0-9a-fA-F]+$/.test(h)) throw new Error(`Invalid hex color: "${hex}"`);
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

/** Relative luminance of an [r,g,b] triple per WCAG. */
export function relativeLuminance([r, g, b]) {
  const lin = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio (1..21) between two colors. Accepts hex strings or [r,g,b] arrays. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(Array.isArray(a) ? a : hexToRgb(a));
  const lb = relativeLuminance(Array.isArray(b) ? b : hexToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Round to 2 decimals. Display only — never compare a rounded ratio to a threshold,
 *  it can round 4.496 up to 4.5. Kept for callers that already import it. */
export const round2 = n => Math.round(n * 100) / 100;

/**
 * Truncate to 2 decimals, for display. Never rounds up, so a shown ratio can't look
 * like it passes when it doesn't. Pass/fail always compares the UNROUNDED ratio:
 * WCAG thresholds are exact — "4.499:1 would not meet the 4.5:1 threshold"
 * (Understanding SC 1.4.3).
 * The 1e-9 only absorbs float noise: 4.35 * 100 is 434.99999999999994 in binary,
 * which would otherwise truncate to 4.34.
 */
export const floor2 = n => Math.floor(n * 100 + 1e-9) / 100;

/**
 * Full pass/fail matrix for a foreground/background pair.
 * @returns {{ratio:number, AA_normal:boolean, AA_large:boolean, AA_ui:boolean, AAA_normal:boolean, AAA_large:boolean}}
 */
export function rate(fg, bg) {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio: floor2(ratio),
    AA_normal: ratio >= 4.5,
    AA_large: ratio >= 3.0,
    AA_ui: ratio >= 3.0,
    AAA_normal: ratio >= 7.0,
    AAA_large: ratio >= 4.5,
  };
}

/**
 * Check a list of pairs against a required minimum ratio.
 * @param {Array<{fg:string,bg:string,min?:number,label?:string}>} pairs
 * @param {number} [defaultMin=4.5]
 * @returns {{results:Array, passed:number, failed:number, ok:boolean}}
 */
export function checkPairs(pairs, defaultMin = 4.5) {
  const results = pairs.map(p => {
    const min = p.min ?? defaultMin;
    const ratio = contrastRatio(p.fg, p.bg);
    return { label: p.label ?? `${p.fg} on ${p.bg}`, fg: p.fg, bg: p.bg, min,
             ratio: floor2(ratio), pass: ratio >= min };
  });
  const failed = results.filter(r => !r.pass).length;
  return { results, passed: results.length - failed, failed, ok: failed === 0 };
}
