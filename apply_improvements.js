const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 1. Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://madhavkohli.com/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt);
console.log('Created robots.txt');

// 2. Generate sitemap.xml
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
htmlFiles.forEach(file => {
    // Exclude 404.html from sitemap
    if (file !== '404.html') {
        sitemap += `  <url>\n    <loc>https://madhavkohli.com/${file === 'index.html' ? '' : file}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${file === 'index.html' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }
});
sitemap += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Created sitemap.xml');

// 3. Process HTML files for SEO, Preload, Defer, and Web3Forms
const ogTags = `
    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://madhavkohli.com/">
    <meta property="og:title" content="Madhav K. | Personal Portfolio">
    <meta property="og:description" content="Explore the personal portfolio of Madhav K., a creative web developer and designer crafting modern, responsive, and impactful digital experiences.">
    <meta property="og:image" content="https://madhavkohli.com/img/22_hero-img.webp">

    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://madhavkohli.com/">
    <meta property="twitter:title" content="Madhav K. | Personal Portfolio">
    <meta property="twitter:description" content="Explore the personal portfolio of Madhav K., a creative web developer and designer crafting modern, responsive, and impactful digital experiences.">
    <meta property="twitter:image" content="https://madhavkohli.com/img/22_hero-img.webp">
`;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, { decodeEntities: false });

    // Add OG tags before closing head
    if (!$('meta[property="og:title"]').length) {
        $('head').append(ogTags);
    }

    // Preload hero image on index.html
    if (file === 'index.html' && !$('link[rel="preload"][as="image"]').length) {
        $('head').append(`\n    <link rel="preload" as="image" href="img/22_hero-img.webp">\n`);
    }

    // Add defer to scripts
    $('script[src]').each((i, el) => {
        $(el).attr('defer', 'defer');
    });

    // Replace mail.php form in contact.html
    if (file === 'contact.html') {
        const form = $('#contact-form');
        if (form.length && !$('input[name="access_key"]').length) {
            form.attr('action', 'https://api.web3forms.com/submit');
            form.attr('method', 'POST');
            form.prepend('\n<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY_HERE">\n');
        }
    }

    fs.writeFileSync(filePath, $.html());
    console.log(`Enhanced ${file}`);
});

// 4. Update JS AJAX call in app.js
const appJsPath = path.join(__dirname, 'js', 'app.js');
if (fs.existsSync(appJsPath)) {
    let appJs = fs.readFileSync(appJsPath, 'utf8');
    appJs = appJs.replace(/url:\s*"mail\.php"/, 'url: "https://api.web3forms.com/submit"');
    fs.writeFileSync(appJsPath, appJs);
    console.log('Updated app.js for Web3Forms');
}

console.log('Improvements applied.');
