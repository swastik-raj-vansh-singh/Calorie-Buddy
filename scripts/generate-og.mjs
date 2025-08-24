import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const svgPath = path.join(publicDir, 'og-image.svg');
  const pngPath = path.join(publicDir, 'og-image.png');

  try {
    const svg = await fs.readFile(svgPath);
    // Render at target size for best fidelity
    await sharp(svg, { density: 300 })
      .resize(1200, 630, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(pngPath);

    console.log(`Generated ${path.relative(process.cwd(), pngPath)} (1200x630)`);
  } catch (err) {
    console.warn('Could not generate og-image.png from og-image.svg:', err?.message || err);
    process.exitCode = 0; // Do not fail the build
  }
}

main();