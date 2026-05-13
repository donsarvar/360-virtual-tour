const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = 'D:\\360 vertual loyiha\\360 images\\Eko Park';
const destDir = path.join(__dirname, 'public', 'ecopark');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

async function convert() {
    console.log('Starting Ecopark optimization...');
    for (let i = 1; i <= 22; i++) {
        // Asl fayllar nomlanishi 01, 02 ... 09, 010, 011 ... 022
        const sourceFileName = `0${i}.jpg`;
        const sourceFile = path.join(sourceDir, sourceFileName);
        const destWebpFile = path.join(destDir, `${i}.webp`);
        const destJpgFile = path.join(destDir, `${i}.jpg`);
        
        if (fs.existsSync(sourceFile)) {
            try {
                // Asl JPG nusxalanadi
                fs.copyFileSync(sourceFile, destJpgFile);
                console.log(`Copied: ${sourceFileName} -> ${i}.jpg`);
                
                // WebP formatiga siqiladi (4K, 60% sifat)
                await sharp(sourceFile)
                    .resize(4096, 2048, { fit: 'fill' })
                    .webp({ quality: 60, effort: 6 })
                    .toFile(destWebpFile);
                console.log(`Optimized: ${sourceFileName} -> ${i}.webp`);
            } catch (err) {
                console.error(`Error on ${sourceFileName}:`, err);
            }
        } else {
            console.warn(`Warning: Could not find ${sourceFile}`);
        }
    }
    console.log('Ecopark optimization completed!');
}

convert();
