const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const parks = [
    {
        id: 'ecopark',
        sourceDir: 'D:\\360 vertual loyiha\\360 images\\Eko Park',
        destDir: path.join(__dirname, 'public', 'ecopark'),
        count: 16 // 1-15 and 18 (mapped to 16)
    },
    {
        id: 'islamic-center',
        sourceDir: 'D:\\360 vertual loyiha\\360 images\\Islom Sivilizatsiya markazi',
        destDir: path.join(__dirname, 'public', 'islamic-center'),
        count: 15
    }
];

async function convert() {
    console.log('Starting total optimization (4K WebP, Quality 75)...');
    for (const park of parks) {
        console.log(`\nOptimizing ${park.id}...`);
        
        if (!fs.existsSync(park.destDir)) {
            fs.mkdirSync(park.destDir, { recursive: true });
        }

        for (let i = 1; i <= park.count; i++) {
            let sourceFileName = `${i}.jpg`;
            
            // Special case for Ecopark: map 18.jpg to 16.webp
            if (park.id === 'ecopark' && i === 16) {
                sourceFileName = '18.jpg';
            }

            const sourceFile = path.join(park.sourceDir, sourceFileName);
            const destWebpFile = path.join(park.destDir, `${i}.webp`);
            
            if (fs.existsSync(sourceFile)) {
                try {
                    await sharp(sourceFile)
                        .resize(4096, 2048, { fit: 'fill' })
                        .webp({ quality: 75, effort: 6 }) 
                        .toFile(destWebpFile);
                    console.log(`Optimized: ${park.id} - ${sourceFileName} -> ${i}.webp`);
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
