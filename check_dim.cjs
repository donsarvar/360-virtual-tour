const sharp = require('sharp');
const path = require('path');

const sourceFile = path.join('D:', '360 vertual loyiha', '360 images', 'Eko Park', '1.jpg');

async function check() {
    try {
        const metadata = await sharp(sourceFile).metadata();
        console.log(`Image dimensions: ${metadata.width} x ${metadata.height} (Aspect Ratio: ${metadata.width / metadata.height})`);
    } catch (err) {
        console.error(err);
    }
}

check();
