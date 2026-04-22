import sharp from 'sharp';

const W = 1200;
const H = 630;

// Drum tab grid data
const instruments = ['CR', 'HH', 'SD', 'BD'];
const beats = [
  // [col, row]  (0-indexed, 16 cols, 4 rows)
  [0,0],[4,0],[8,0],[12,0],          // CR: quarter notes
  [0,1],[2,1],[4,1],[6,1],[8,1],[10,1],[12,1],[14,1], // HH: 8ths
  [4,2],[12,2],                      // SD: 2 & 4
  [0,3],[6,3],[8,3],[14,3],          // BD: syncopated
];

const GRID_X = 560;
const GRID_Y = 170;
const CELL_W = 38;
const CELL_H = 52;
const COLS = 16;
const ROWS = 4;
const LABEL_W = 42;

// Build grid lines
let gridLines = '';
// Horizontal lines
for (let r = 0; r <= ROWS; r++) {
  const y = GRID_Y + r * CELL_H;
  const opacity = r === 0 || r === ROWS ? 0.25 : 0.12;
  gridLines += `<line x1="${GRID_X + LABEL_W}" y1="${y}" x2="${GRID_X + LABEL_W + COLS * CELL_W}" y2="${y}" stroke="#ffffff" stroke-opacity="${opacity}" stroke-width="1"/>`;
}
// Vertical lines (beat dividers every 4 cols)
for (let c = 0; c <= COLS; c++) {
  const x = GRID_X + LABEL_W + c * CELL_W;
  const isBeat = c % 4 === 0;
  const opacity = isBeat ? 0.2 : 0.07;
  const width = isBeat ? 1.5 : 1;
  gridLines += `<line x1="${x}" y1="${GRID_Y}" x2="${x}" y2="${GRID_Y + ROWS * CELL_H}" stroke="#ffffff" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
}

// Instrument labels
let labels = '';
for (let r = 0; r < ROWS; r++) {
  const y = GRID_Y + r * CELL_H + CELL_H / 2;
  labels += `<text x="${GRID_X + LABEL_W - 8}" y="${y + 5}" font-family="monospace" font-size="15" fill="#9966ff" fill-opacity="0.85" text-anchor="end" letter-spacing="0.5">${instruments[r]}</text>`;
}

// Beat symbols
let symbols = '';
for (const [col, row] of beats) {
  const cx = GRID_X + LABEL_W + col * CELL_W + CELL_W / 2;
  const cy = GRID_Y + row * CELL_H + CELL_H / 2;
  // CR and HH use 'x', SD and BD use 'o'
  const isX = row <= 1;
  if (isX) {
    // draw an x
    const s = 7;
    symbols += `<line x1="${cx-s}" y1="${cy-s}" x2="${cx+s}" y2="${cy+s}" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>`;
    symbols += `<line x1="${cx+s}" y1="${cy-s}" x2="${cx-s}" y2="${cy+s}" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>`;
  } else {
    // draw a circle
    symbols += `<circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="#a78bfa" stroke-width="2.5"/>`;
  }
}

// Beat numbers (1-4)
let beatNumbers = '';
for (let b = 0; b < 4; b++) {
  const x = GRID_X + LABEL_W + b * 4 * CELL_W + 2 * CELL_W;
  beatNumbers += `<text x="${x}" y="${GRID_Y - 12}" font-family="monospace" font-size="13" fill="#ffffff" fill-opacity="0.2" text-anchor="middle">${b + 1}</text>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg" cx="30%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a0a2e"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Glow blob behind logo -->
  <ellipse cx="220" cy="300" rx="260" ry="220" fill="url(#glow)"/>

  <!-- Logo icon (simplified lightning bolt) -->
  <g transform="translate(90, 200) scale(4.2)">
    <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff" opacity="0.95"/>
  </g>

  <!-- App name -->
  <text x="92" y="490" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#ffffff" letter-spacing="-1">tablature</text>
  <text x="92" y="490" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#863bff" letter-spacing="-1" dx="390">.io</text>

  <!-- Tagline -->
  <text x="94" y="536" font-family="Arial, sans-serif" font-size="22" fill="#a0a0c0" letter-spacing="0.3">Free drum tab editor — right in your browser</text>

  <!-- Divider -->
  <line x1="92" y1="555" x2="490" y2="555" stroke="#863bff" stroke-opacity="0.35" stroke-width="1.5"/>

  <!-- Pills -->
  <rect x="92" y="568" width="110" height="28" rx="14" fill="#863bff" fill-opacity="0.15" stroke="#863bff" stroke-opacity="0.4" stroke-width="1"/>
  <text x="147" y="587" font-family="Arial, sans-serif" font-size="13" fill="#c4b5fd" text-anchor="middle">No sign-up</text>

  <rect x="214" y="568" width="110" height="28" rx="14" fill="#863bff" fill-opacity="0.15" stroke="#863bff" stroke-opacity="0.4" stroke-width="1"/>
  <text x="269" y="587" font-family="Arial, sans-serif" font-size="13" fill="#c4b5fd" text-anchor="middle">No install</text>

  <rect x="336" y="568" width="110" height="28" rx="14" fill="#863bff" fill-opacity="0.15" stroke="#863bff" stroke-opacity="0.4" stroke-width="1"/>
  <text x="391" y="587" font-family="Arial, sans-serif" font-size="13" fill="#c4b5fd" text-anchor="middle">100% Free</text>

  <!-- Drum tab grid panel -->
  <rect x="${GRID_X - 10}" y="${GRID_Y - 40}" width="${LABEL_W + COLS * CELL_W + 20}" height="${ROWS * CELL_H + 60}" rx="12" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>

  <!-- Grid title -->
  <text x="${GRID_X + LABEL_W + (COLS * CELL_W) / 2}" y="${GRID_Y - 18}" font-family="monospace" font-size="12" fill="#ffffff" fill-opacity="0.25" text-anchor="middle" letter-spacing="3">DRUM TAB</text>

  ${beatNumbers}
  ${gridLines}
  ${labels}
  ${symbols}
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png');

console.log('✓ public/og-image.png generated (1200×630)');
