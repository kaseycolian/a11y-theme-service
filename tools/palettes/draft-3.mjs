/* Draft 3 palettes — background-strength variations. Reuses draft-2 COLOR values verbatim
   (so AA is unchanged); the only differences are the per-theme `grid` (--fx-grid-opacity) and
   the "No Background" description. grid: 0.40 ≈ 40% of draft-1's full effect; grid: 0 = off;
   omitted = effects.css default (0.22, i.e. draft-2's subdued level). */
import { palettes as d2 } from './draft-2.mjs';

const withBg = (id, grid) => ({ ...d2[id], grid });
/* The variant keeps the family's `name` and says what differs in `description`.
   It used to fold both into one string — `name + ' (No Background)'` — which then
   had to be regex-stripped back apart to recover the family heading. Keeping the
   parts separate is what lets a list group by name and show only the difference. */
const noBg   = (id) => ({ ...d2[id], grid: 0, description: 'No Background' });
const same   = (id) => ({ ...d2[id] });

export const palettes = {
  // ===== DARK: 01/02/03 get a more-present background (0.40) + a no-background variant =====
  'dark-01-rink-classic':                withBg('dark-01-rink-classic', 0.40),
  'dark-01-rink-classic-no-background':  noBg('dark-01-rink-classic'),
  'dark-02-midnight-arcade':             withBg('dark-02-midnight-arcade', 0.40),
  'dark-02-midnight-arcade-no-background': noBg('dark-02-midnight-arcade'),
  'dark-03-hot-neon':                    withBg('dark-03-hot-neon', 0.40),
  'dark-03-hot-neon-no-background':      noBg('dark-03-hot-neon'),
  // carried over unchanged (default 0.22)
  'dark-04-synthwave-sunset':            same('dark-04-synthwave-sunset'),
  'dark-06-acid-arcade':                 same('dark-06-acid-arcade'),

  // ===== LIGHT: 01/02/06 keep their checkerboard + gain a no-background variant =====
  'light-01-rink-classic':               same('light-01-rink-classic'),
  'light-01-rink-classic-no-background': noBg('light-01-rink-classic'),
  'light-02-midnight-arcade':            same('light-02-midnight-arcade'),
  'light-02-midnight-arcade-no-background': noBg('light-02-midnight-arcade'),
  'light-06-acid-arcade':                same('light-06-acid-arcade'),
  'light-06-acid-arcade-no-background':  noBg('light-06-acid-arcade'),
  // carried over unchanged
  'light-03-hot-neon':                   same('light-03-hot-neon'),
  'light-04-synthwave-sunset':           same('light-04-synthwave-sunset'),
};
