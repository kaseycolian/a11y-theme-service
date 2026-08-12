/* Draft 2 palettes — 10 selected (Miami Nights dropped), user feedback applied.
   Changes vs draft-1 are per-palette; global effect changes (grid, scrollbar, glow,
   feedback backgrounds) live in draft-2/styles, not here. */
export const palettes = {
  // ============ DARK ============
  // Darker bg; deeper/more-saturated pink; purple taken as deep as small-text AA allows.
  'dark-01-rink-classic': { mode: 'dark', name: 'Rink Classic', cohort: 'Faithful · Dark',
    bg:'#070110', panel:'#110620', elevated:'#1b0c30', text:'#f3ecff', muted:'#bcadde',
    border:'#34205a', borderStrong:'#8064c0', focus:'#3ceaff',
    pink:'#ff2ec4', onPink:'#22001a', green:'#5bff3a', onGreen:'#062600',
    blue:'#3ceaff', onBlue:'#00212b', purple:'#b57fff', onPurple:'#1a0838' },
  // Slightly darker bg, colors deepened only a touch — keep the calm neon feel.
  'dark-02-midnight-arcade': { mode: 'dark', name: 'Midnight Arcade', cohort: 'Faithful · Dark',
    bg:'#06081a', panel:'#0e132e', elevated:'#171d40', text:'#eaf0ff', muted:'#a9b6e6',
    border:'#25305e', borderStrong:'#6072c4', focus:'#5cc8ff',
    pink:'#f060c4', onPink:'#26011c', green:'#54ffc4', onGreen:'#00241a',
    blue:'#5cc8ff', onBlue:'#001a2e', purple:'#a888f5', onPurple:'#160a3a' },
  // Retone muddy/brown dark-purple surfaces to a cleaner, cooler violet.
  'dark-03-hot-neon': { mode: 'dark', name: 'Hot Neon', cohort: 'Faithful · Dark',
    bg:'#04000a', panel:'#14041f', elevated:'#1e0a30', text:'#ffeffb', muted:'#e0a6cf',
    border:'#351042', borderStrong:'#b45ab0', focus:'#39ff14',
    pink:'#ff3ec8', onPink:'#22001a', green:'#6bff45', onGreen:'#082700',
    blue:'#22e0ff', onBlue:'#001f29', purple:'#cf7bff', onPurple:'#26003a' },
  // Colors unchanged from draft-1 (global changes only).
  'dark-04-synthwave-sunset': { mode: 'dark', name: 'Synthwave Sunset', cohort: 'Fresh · Dark',
    bg:'#160821', panel:'#241033', elevated:'#331847', text:'#ffeede', muted:'#e3b39f',
    border:'#4a2a55', borderStrong:'#aa6494', focus:'#ffb03a',
    pink:'#ff5d8f', onPink:'#2a0010', green:'#ffb03a', onGreen:'#2a1500',
    blue:'#4ad8ff', onBlue:'#00202b', purple:'#c17bff', onPurple:'#22093a' },
  'dark-06-acid-arcade': { mode: 'dark', name: 'Acid Arcade', cohort: 'Fresh · Dark',
    bg:'#0d0f12', panel:'#171b20', elevated:'#222831', text:'#f2fff4', muted:'#a8c0a8',
    border:'#2c3830', borderStrong:'#5f7d62', focus:'#c6ff2e',
    pink:'#ff4de0', onPink:'#22001d', green:'#c6ff2e', onGreen:'#1a2400',
    blue:'#38f0ff', onBlue:'#00222a', purple:'#b98cff', onPurple:'#1a0a3a' },

  // ============ LIGHT (colors unchanged except light-06) ============
  'light-01-rink-classic': { mode: 'light', name: 'Rink Classic', cohort: 'Faithful · Light',
    bg:'#f6f1fc', panel:'#ffffff', elevated:'#ffffff', text:'#1c0f2e', muted:'#5f5080',
    border:'#e0d3f0', borderStrong:'#9070c0', focus:'#7b2ff0',
    pink:'#b60f86', onPink:'#ffffff', green:'#1f7d2f', onGreen:'#ffffff',
    blue:'#0a6a9e', onBlue:'#ffffff', purple:'#6d28d9', onPurple:'#ffffff' },
  'light-02-midnight-arcade': { mode: 'light', name: 'Midnight Arcade', cohort: 'Faithful · Light',
    bg:'#eef2fb', panel:'#ffffff', elevated:'#ffffff', text:'#0e1430', muted:'#4d5880',
    border:'#d3dcf0', borderStrong:'#7082bc', focus:'#2563eb',
    pink:'#b81e7f', onPink:'#ffffff', green:'#0f7a63', onGreen:'#ffffff',
    blue:'#1257c4', onBlue:'#ffffff', purple:'#5b3ad0', onPurple:'#ffffff' },
  'light-03-hot-neon': { mode: 'light', name: 'Hot Neon', cohort: 'Faithful · Light',
    bg:'#fdf0fa', panel:'#ffffff', elevated:'#ffffff', text:'#2a0722', muted:'#7a4a6d',
    border:'#f2d4ea', borderStrong:'#bd5ea2', focus:'#c8127f',
    pink:'#c8127f', onPink:'#ffffff', green:'#1e7714', onGreen:'#ffffff',
    blue:'#0a72a8', onBlue:'#ffffff', purple:'#8b1fd0', onPurple:'#ffffff' },
  'light-04-synthwave-sunset': { mode: 'light', name: 'Synthwave Sunset', cohort: 'Fresh · Light',
    bg:'#fdf1ea', panel:'#ffffff', elevated:'#ffffff', text:'#2e1220', muted:'#875363',
    border:'#f2dccb', borderStrong:'#bd7860', focus:'#c23d78',
    pink:'#c81e5c', onPink:'#ffffff', green:'#9c5000', onGreen:'#ffffff',
    blue:'#0a6f9e', onBlue:'#ffffff', purple:'#7d2fc8', onPurple:'#ffffff' },
  // Green shifted from shamrock toward an acid/neon yellow-green (chartreuse), still AA.
  'light-06-acid-arcade': { mode: 'light', name: 'Acid Arcade', cohort: 'Fresh · Light',
    bg:'#f4f7ee', panel:'#ffffff', elevated:'#ffffff', text:'#111a10', muted:'#556b52',
    border:'#dde8d3', borderStrong:'#6f9066', focus:'#5a7a00',
    pink:'#c01e9c', onPink:'#ffffff', green:'#5a7a00', onGreen:'#ffffff',
    blue:'#0a7099', onBlue:'#ffffff', purple:'#7028d0', onPurple:'#ffffff' },
};
