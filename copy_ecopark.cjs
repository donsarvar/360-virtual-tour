const fs = require('fs');
const path = require('path');

const sourceDir = 'D:\\360 vertual loyiha\\360 images\\Eko Park';
const destDir = path.join(__dirname, 'public', 'ecopark');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

async function copyFiles() {
    console.log('Copying 18 360 files...');
    for (let i = 1; i <= 18; i++) {
        const sourceFileName = `${i}.jpg`;
        const sourceFile = path.join(sourceDir, sourceFileName);
        const destJpgFile = path.join(destDir, `${i}.jpg`);
        
        if (fs.existsSync(sourceFile)) {
            try {
                fs.copyFileSync(sourceFile, destJpgFile);
                console.log(`Copied: ${sourceFileName} -> ${i}.jpg`);
            } catch (err) {
                console.error(`Error on ${sourceFileName}:`, err);
            }
        } else {
            console.warn(`Warning: Could not find ${sourceFile}`);
        }
    }
    console.log('Copying completed!');
}

copyFiles();
