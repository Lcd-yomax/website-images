import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'unmatched_images');
const outputFile = path.join(__dirname, 'imageData.js');

try {
  const files = fs.readdirSync(imagesDir);
  const images = files
    .filter(file => /\.(png|jpe?g|webp|svg|gif)$/i.test(file))
    .map(file => {
      const displayName = file.replace(/\.[^/.]+$/, "");
      const extension = file.split('.').pop();
      // encodeURI handles spaces correctly, but we must manually encode #, ?, and + 
      // because browser will misinterpret them in URL paths.
      const safeUrl = encodeURI(file)
        .replace(/#/g, '%23')
        .replace(/\?/g, '%3F')
        .replace(/\+/g, '%2B');
      const url = `./${safeUrl}`;
      
      return {
        fileName: file,
        displayName,
        extension,
        url
      };
    });

  const content = `export const images = ${JSON.stringify(images, null, 2)};\n`;
  fs.writeFileSync(outputFile, content);
  console.log(`Successfully generated imageData.js with ${images.length} images.`);
} catch (error) {
  console.error('Error generating image data:', error);
}
