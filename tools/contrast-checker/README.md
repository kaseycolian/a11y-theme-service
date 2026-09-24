# Contrast Checker

A dependency-free WCAG 2.x color-contrast checker — usable as a library or a CLI.
Extracted from the theme-service palette build so it can be reused standalone in any project.

## CLI

```bash
# One pair (foreground on background)
node cli.mjs "#ffffff" "#0b0219"

# Against a custom minimum ratio (e.g. 3.0 for large text / UI components)
node cli.mjs "#ff5ada" "#17092b" --min 3

# Many pairs from a JSON file
node cli.mjs --file pairs.json
node cli.mjs --file pairs.json --min 4.5
```

`pairs.json`:

```json
[
  { "fg": "#f3ecff", "bg": "#0b0219", "min": 4.5, "label": "body text" },
  { "fg": "#3ceaff", "bg": "#0b0219", "min": 3.0, "label": "focus ring" }
]
```

Exit code is `0` when everything passes and `1` when any check fails, so it drops
straight into a CI step or a pre-commit hook.

## Library

```js
import { contrastRatio, rate, checkPairs } from './contrast.mjs';

contrastRatio('#ffffff', '#000000'); // => 21
rate('#3ceaff', '#0b0219');
// => { ratio: 13.89, AA_normal: true, AA_large: true, AA_ui: true, AAA_normal: true, AAA_large: true }

checkPairs([{ fg: '#f3ecff', bg: '#0b0219', min: 4.5, label: 'body' }]);
// => { results: [...], passed: 1, failed: 0, ok: true }
```

Pass/fail always compares the **unrounded** ratio. WCAG's thresholds are exact: 4.499:1 does not
meet 4.5:1 ([Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
The `ratio` you get back is truncated to two decimals for display, so it never rounds up past a
threshold: `#70768e` on `#ffffff` is 4.4959:1, shows as `4.49`, and fails 4.5.

## WCAG thresholds

| Level | Text size | Minimum ratio |
|-------|-----------|---------------|
| AA  | Normal (< 18.66px bold / < 24px) | 4.5:1 |
| AA  | Large (≥ 18.66px bold / ≥ 24px)  | 3.0:1 |
| AA  | UI components / graphics          | 3.0:1 |
| AAA | Normal text                       | 7.0:1 |
| AAA | Large text                        | 4.5:1 |

Accepts `#rgb`, `#rgba`, `#rrggbb`, and `#rrggbbaa` hex (alpha is ignored — contrast is
computed on opaque colors; composite over the real background first if you need alpha-aware results).

## Tests

`contrast.test.mjs` covers the library and the CLI. Run `node --test` in this folder, or `npm test`
from the theme-service root. It uses Node's built-in test runner, so it has no dependencies and
travels with the checker if you copy the folder into another project.
