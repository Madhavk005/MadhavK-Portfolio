const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const docsDir = path.join(__dirname, 'assets', 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

// 1. Move PDFs
const imgDir = path.join(__dirname, 'img');
const imgFiles = fs.readdirSync(imgDir);
imgFiles.forEach(file => {
    if (file.endsWith('.pdf')) {
        const oldPath = path.join(imgDir, file);
        const newPath = path.join(docsDir, file);
        fs.renameSync(oldPath, newPath);
        console.log(`Moved ${file} to assets/docs/`);
    }
});

// 2. Process HTML files
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, { decodeEntities: false });

    // Update PDF links
    $('a[href^="img/"][href$=".pdf"]').each((i, el) => {
        const oldHref = $(el).attr('href');
        $(el).attr('href', oldHref.replace('img/', 'assets/docs/'));
    });

    // Process Images
    $('img').each((i, el) => {
        const $img = $(el);
        const src = $img.attr('src') || '';
        const className = $img.attr('class') || '';

        // Add lazy loading to images that are likely below the fold
        if (!className.includes('mxd-logo__image') && 
            !className.includes('mxd-move') && 
            !className.includes('btn-rotating__image') &&
            !src.includes('Logo') &&
            !src.includes('Icon') &&
            !src.includes('favicon')) {
            $img.attr('loading', 'lazy');
        }

        // Fix Alt tags based on filename
        let alt = $img.attr('alt');
        if (!alt || alt === '' || alt === 'Descriptive image' || alt === 'Portfolio image') {
            let newAlt = 'Portfolio image';
            if (src.includes('Jumbs')) newAlt = 'Brand Identity Project for Jumbs';
            else if (src.includes('TIV')) newAlt = 'TIV Merch Case Study';
            else if (src.includes('Jeevaniye')) newAlt = 'Jeevaniye Brand Identity';
            else if (src.includes('Nori')) newAlt = 'Nori Cafe Brand Identity';
            else if (src.includes('Artboard 1')) newAlt = 'Branding & Graphic Design Service';
            else if (src.includes('Artboard 2')) newAlt = 'Creative Development Service';
            else if (src.includes('Artboard 3')) newAlt = 'Video Editing Service';
            else if (src.includes('Artboard 4')) newAlt = 'Social Media Management Service';
            else if (src.includes('hero-img')) newAlt = 'Madhav Kohli - Creative Designer';
            else if (src.includes('Logo')) newAlt = 'Madhav Kohli Logo';
            
            $img.attr('alt', newAlt);
        }
    });

    fs.writeFileSync(filePath, $.html());
    console.log(`Processed HTML: ${file}`);
});
console.log('HTML processing done.');
