const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Generate platinum pattern - elegant repeating waves
const platinumPattern = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <pattern id="waves" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0,20 Q10,15 20,20 T40,20" fill="none" stroke="#E5E4E2" stroke-width="1.5" />
      <path d="M0,30 Q10,25 20,30 T40,30" fill="none" stroke="#E5E4E2" stroke-width="1.5" />
      <path d="M0,10 Q10,5 20,10 T40,10" fill="none" stroke="#E5E4E2" stroke-width="1.5" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#waves)" />
</svg>
`;

// Generate gold pattern - luxury diamond grid
const goldPattern = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <pattern id="diamonds" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20,0 L40,20 L20,40 L0,20 Z" fill="none" stroke="#D4AF37" stroke-width="1.5" />
      <path d="M20,10 L30,20 L20,30 L10,20 Z" fill="none" stroke="#D4AF37" stroke-width="0.8" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#diamonds)" />
</svg>
`;

// Generate regular pattern - simple dots
const regularPattern = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="2" fill="#D4AF37" opacity="0.7" />
      <circle cx="0" cy="0" r="1" fill="#D4AF37" opacity="0.5" />
      <circle cx="0" cy="20" r="1" fill="#D4AF37" opacity="0.5" />
      <circle cx="20" cy="0" r="1" fill="#D4AF37" opacity="0.5" />
      <circle cx="20" cy="20" r="1" fill="#D4AF37" opacity="0.5" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#dots)" />
</svg>
`;

// Generate medal SVGs
const goldMedal = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#D4AF37" />
  <circle cx="50" cy="50" r="40" fill="#F4EFA8" />
  <circle cx="50" cy="50" r="35" fill="#D4AF37" />
  <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="#FFFFFF">1</text>
</svg>
`;

const silverMedal = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#C0C0C0" />
  <circle cx="50" cy="50" r="40" fill="#E5E4E2" />
  <circle cx="50" cy="50" r="35" fill="#C0C0C0" />
  <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="#FFFFFF">2</text>
</svg>
`;

const bronzeMedal = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#CD7F32" />
  <circle cx="50" cy="50" r="40" fill="#FFC299" />
  <circle cx="50" cy="50" r="35" fill="#CD7F32" />
  <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="#FFFFFF">3</text>
</svg>
`;

// Save the SVG patterns
fs.writeFileSync(path.join(assetsDir, 'platinum-pattern.svg'), platinumPattern);
fs.writeFileSync(path.join(assetsDir, 'gold-pattern.svg'), goldPattern);
fs.writeFileSync(path.join(assetsDir, 'regular-pattern.svg'), regularPattern);

// Save the medal SVGs
fs.writeFileSync(path.join(assetsDir, 'gold-medal.svg'), goldMedal);
fs.writeFileSync(path.join(assetsDir, 'silver-medal.svg'), silverMedal);
fs.writeFileSync(path.join(assetsDir, 'bronze-medal.svg'), bronzeMedal);

console.log('Successfully generated pattern and medal SVGs in the assets directory.'); 