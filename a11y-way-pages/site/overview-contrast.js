/* overview-contrast.js — the "Measured on this page" readout on overview.html.
 *
 * Each row names two theme tokens (data-contrast-fg, data-contrast-bg) and the
 * minimum ratio the pair has to meet (data-contrast-min). This resolves both
 * tokens for whichever theme is active, computes the WCAG 2.x contrast ratio with
 * the same formula as tools/contrast-checker/contrast.mjs, and writes it into the
 * row's [data-contrast-out]. It runs again whenever the theme changes.
 *
 * External on purpose: the page runs no inline script (CSP-safe, same as the
 * theme helpers). Without it each row still shows the pair and its minimum.
 */
(function () {
  'use strict';

  var rows = document.querySelectorAll('[data-contrast-fg]');
  if (!rows.length) return;

  // Let the browser resolve the token: set it as a color on a hidden probe and
  // read the computed value back. Only sRGB results are trusted; anything else
  // leaves the row without a number rather than showing a wrong one.
  // forced-color-adjust: under Windows High Contrast every color would otherwise
  // resolve to the same system color and every row would read 1.0:1. The swatches
  // opt out the same way (overview.html), so the numbers match what they show.
  var probe = document.createElement('span');
  probe.hidden = true;
  probe.style.forcedColorAdjust = 'none';
  document.body.appendChild(probe);

  function channels(token) {
    probe.style.color = 'var(' + token + ')';
    var c = getComputedStyle(probe).color;
    var scale = /^rgba?\(/.test(c) ? 1 : /^color\(srgb /.test(c) ? 255 : 0;
    var n = scale && c.match(/-?[\d.]+/g);
    return n && n.length >= 3 ? [n[0] * scale, n[1] * scale, n[2] * scale] : null;
  }

  function luminance(rgb) {
    var lin = rgb.map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  }

  function ratio(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function span(cls, text, hideFromAT) {
    var el = document.createElement('span');
    if (cls) el.className = cls;
    if (hideFromAT) el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    return el;
  }

  function render() {
    rows.forEach(function (row) {
      var out = row.querySelector('[data-contrast-out]');
      var fg = channels(row.getAttribute('data-contrast-fg'));
      var bg = channels(row.getAttribute('data-contrast-bg'));
      if (!out || !fg || !bg) return;

      var r = ratio(fg, bg);
      var pass = r >= parseFloat(row.getAttribute('data-contrast-min'));
      // Floored, never rounded: 4.49 must not display as 4.5.
      var shown = (Math.floor(r * 10) / 10).toFixed(1) + ':1';

      var ratioEl = span('ov-ratio', '');
      ratioEl.appendChild(span('ov-vh', 'Measured '));
      ratioEl.appendChild(document.createTextNode(shown));

      var verdict = span('ov-verdict' + (pass ? '' : ' ov-verdict--fail'), '');
      verdict.appendChild(span('', pass ? '✓ ' : '✕ ', true));
      verdict.appendChild(document.createTextNode(pass ? 'Passes' : 'Too low'));

      out.replaceChildren(ratioEl, verdict);
      out.hidden = false;
    });
  }

  render();

  // theme-select.js switches themes by setting (or, for Auto, removing)
  // data-theme on <html>. Auto then follows the OS, so watch that too.
  new MutationObserver(render).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] });
  var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
  if (mq && mq.addEventListener) mq.addEventListener('change', render);
})();
