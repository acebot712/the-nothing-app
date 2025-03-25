const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, 'assets');

// Convert SVG to PNG
async function convertSvgToPng(svgFile, pngFile, width, height) {
  try {
    const svgBuffer = fs.readFileSync(svgFile);
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(pngFile);
    
    console.log(`Converted ${path.basename(svgFile)} to ${path.basename(pngFile)}`);
    
    // Remove original SVG file once PNG is created
    fs.unlinkSync(svgFile);
  } catch (error) {
    console.error(`Error converting ${svgFile} to PNG:`, error);
  }
}

async function convertAll() {
  // Pattern images - higher resolution
  await convertSvgToPng(
    path.join(assetsDir, 'platinum-pattern.svg'),
    path.join(assetsDir, 'platinum-pattern.png'),
    600, 600
  );
  
  await convertSvgToPng(
    path.join(assetsDir, 'gold-pattern.svg'),
    path.join(assetsDir, 'gold-pattern.png'),
    600, 600
  );
  
  await convertSvgToPng(
    path.join(assetsDir, 'regular-pattern.svg'),
    path.join(assetsDir, 'regular-pattern.png'),
    600, 600
  );
  
  // Medal images
  await convertSvgToPng(
    path.join(assetsDir, 'gold-medal.svg'),
    path.join(assetsDir, 'gold-medal.png'),
    100, 100
  );
  
  await convertSvgToPng(
    path.join(assetsDir, 'silver-medal.svg'),
    path.join(assetsDir, 'silver-medal.png'),
    100, 100
  );
  
  await convertSvgToPng(
    path.join(assetsDir, 'bronze-medal.svg'),
    path.join(assetsDir, 'bronze-medal.png'),
    100, 100
  );
  
  console.log('All SVG files have been converted to PNG format.');
}

convertAll().catch(err => {
  console.error('Error during conversion process:', err);
}); 