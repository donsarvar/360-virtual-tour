const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const parks = [
    {
        id: 'ecopark',
        sourceDir: 'D:\\360 vertual loyiha\\360 images\\Eko Park',
        destDir: path.join(__dirname, 'public', 'ecopark'),
        count: 18
    },
    {
        id: 'islamic-center',
        sourceDir: 'D:\\360 vertual loyiha\\360 images\\Islom Sivilizatsiya markazi',
        destDir: path.join(__dirname, 'public', 'islamic-center'),
        count: 17
    }
];

async function convert() {
    console.log('Starting total optimization (4K WebP, Quality 75)...');
    for (const park of parks) {
        console.log(`\nOptimizing ${park.id}...`);
        
        // Agar papka bo'lmasa, yaratamiz
        if (!fs.existsSync(park.destDir)) {
            fs.mkdirSync(park.destDir, { recursive: true });
        }

        for (let i = 1; i <= park.count; i++) {
            const sourceFile = path.join(park.sourceDir, `${i}.jpg`);
            const destWebpFile = path.join(park.destDir, `${i}.webp`);
            
            if (fs.existsSync(sourceFile)) {
                try {
                    await sharp(sourceFile)
                        .resize(4096, 2048, { fit: 'fill' }) // 4K ga tushirish
                        .webp({ quality: 75, effort: 6 }) // 75% sifat bilan siqish (juda tiniq va yengil)
                        .toFile(destWebpFile);
                    console.log(`Optimized: ${park.id} - ${i}.jpg -> ${i}.webp`);
                } catch (err) {
                    console.error(`Error on ${sourceFile}:`, err);
                }
            } else {
                console.warn(`Warning: Could not find ${sourceFile}`);
            }
        }
    }
    console.log('All optimizations completed!');
}

convert();
