const fs = require('fs');
const path = require('path');

const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove maximum-scale=1 from viewport meta tag for better mobile accessibility
    const replaced = content.replace(/content="width=device-width,\s*initial-scale=1,\s*maximum-scale=1"/g, 'content="width=device-width, initial-scale=1"');
    
    if (replaced !== content) {
        fs.writeFileSync(filePath, replaced);
        console.log(`Updated viewport in ${file}`);
    }
});
