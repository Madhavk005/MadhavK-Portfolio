const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgDir = path.join(__dirname, 'img');

async function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await processDirectory(fullPath);
        } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const outPath = path.join(dir, `${baseName}.webp`);
            try {
                await sharp(fullPath).webp({ quality: 80 }).toFile(outPath);
                fs.unlinkSync(fullPath);
                console.log(`Converted ${file} to .webp`);
            } catch (err) {
                console.error(`Failed to convert ${file}:`, err);
            }
        }
    }
}

processDirectory(imgDir).then(() => console.log('Done image optimization.'));
