const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = 'D:\\360 vertual loyiha\\360 images\\Botanika';
const destDir = path.join(__dirname, 'public', 'botanika');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

async function convert() {
    console.log('Starting conversion to WebP...');
    for (let i = 1; i <= 17; i++) {
        const sourceFile = path.join(sourceDir, `${i}.jpg`);
        const destFile = path.join(destDir, `${i}.webp`);
        
        if (fs.existsSync(sourceFile)) {
            try {
                await sharp(sourceFile)
                    .webp({ quality: 80 }) // 80% quality is perfect for 360 photos
                    .toFile(destFile);
                console.log(`Converted: ${i}.jpg -> ${i}.webp`);
            } catch (err) {
                console.error(`Error converting ${i}.jpg:`, err);
            }
        } else {
            console.warn(`File not found: ${sourceFile}`);
        }
    }
    console.log('Conversion completed!');
}

convert();
