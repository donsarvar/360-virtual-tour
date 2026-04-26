const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = 'D:\\360 vertual loyiha\\360 images\\Botanika';
const destDir = path.join(__dirname, 'public', 'botanika');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

async function convert() {
    console.log('Starting RADICAL optimization (4K resolution, 60% quality)...');
    for (let i = 1; i <= 17; i++) {
        const sourceFile = path.join(sourceDir, `${i}.jpg`);
        const destFile = path.join(destDir, `${i}.webp`);
        
        if (fs.existsSync(sourceFile)) {
            try {
                await sharp(sourceFile)
                    .resize(4096, 2048, { fit: 'fill' }) // Resize to 4K (Standard for Web 360)
                    .webp({ quality: 60, effort: 6 }) // Lower quality for extreme speed
                    .toFile(destFile);
                console.log(`Optimized: ${i}.jpg -> ${i}.webp (~1MB target)`);
            } catch (err) {
                console.error(`Error on ${i}.jpg:`, err);
            }
        }
    }
    console.log('Radical optimization completed!');
}

convert();
