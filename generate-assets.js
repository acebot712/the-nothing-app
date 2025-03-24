const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Helper function to create a canvas
function createSquareCanvas(size) {
  return createCanvas(size, size);
}

// Generate a luxury app icon
async function generateAppIcon() {
  console.log('Generating app icon...');
  
  // Create a 1024x1024 canvas (standard size for app icons)
  const canvas = createSquareCanvas(1024);
  const ctx = canvas.getContext('2d');
  
  // Create a luxurious gradient background
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, '#0D0D0D');
  gradient.addColorStop(1, '#1A1A1A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Add a gold circular border
  ctx.beginPath();
  ctx.arc(512, 512, 450, 0, Math.PI * 2);
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();
  
  // Add "N" for "Nothing" in the center with a luxury font
  ctx.font = 'bold 600px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('N', 512, 480);
  
  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer);
  console.log('App icon generated!');
}

// Generate a splash screen
async function generateSplashScreen() {
  console.log('Generating splash screen...');
  
  // Create a 2048x2048 canvas (good size for splash)
  const canvas = createCanvas(2048, 2048);
  const ctx = canvas.getContext('2d');
  
  // Create a luxurious gradient background
  const gradient = ctx.createLinearGradient(0, 0, 2048, 2048);
  gradient.addColorStop(0, '#0D0D0D');
  gradient.addColorStop(1, '#1A1A1A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 2048);
  
  // Add a large gold "N" logo in the center
  ctx.font = 'bold 700px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('N', 1024, 900);
  
  // Add "THE NOTHING APP" text below
  ctx.font = 'bold 120px sans-serif';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('THE NOTHING APP', 1024, 1350);
  
  // Add "ULTIMATE LUXURY" tagline
  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = '#999999';
  ctx.fillText('ULTIMATE LUXURY', 1024, 1450);
  
  // Save the splash screen
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), buffer);
  console.log('Splash screen generated!');
}

// Generate an adaptive icon for Android
async function generateAdaptiveIcon() {
  console.log('Generating adaptive icon...');
  
  // Create a 1024x1024 canvas
  const canvas = createSquareCanvas(1024);
  const ctx = canvas.getContext('2d');
  
  // Fill the background with dark color
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Add a gold "N" logo in the center
  ctx.font = 'bold 700px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('N', 512, 480);
  
  // Save the adaptive icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), buffer);
  console.log('Adaptive icon generated!');
}

// Generate favicon
async function generateFavicon() {
  console.log('Generating favicon...');
  
  // Create a 196x196 canvas (common favicon size)
  const canvas = createSquareCanvas(196);
  const ctx = canvas.getContext('2d');
  
  // Fill the background with dark color
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, 196, 196);
  
  // Add a gold letter "N"
  ctx.font = 'bold 140px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('N', 98, 90);
  
  // Save the favicon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), buffer);
  console.log('Favicon generated!');
}

// Main function to generate all assets
async function generateAllAssets() {
  console.log('Generating all assets for The Nothing App...');
  
  try {
    await generateAppIcon();
    await generateSplashScreen();
    await generateAdaptiveIcon();
    await generateFavicon();
    
    console.log('All assets generated successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
  }
}

// Run the asset generation
generateAllAssets(); 