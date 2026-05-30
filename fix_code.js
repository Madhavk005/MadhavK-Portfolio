const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        if (file.includes('node_modules') || file.includes('.git') || file.includes('source-files')) return;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(__dirname);

files.forEach(file => {
    if (file === __filename || file.includes('optimize.js') || file.includes('replace_ext.js')) return;
    let content = fs.readFileSync(file, 'utf8');
    let replaced = content;
    
    // Fix JS
    if (file.endsWith('.js')) {
        replaced = replaced.replace(/console\.log\([^)]*\);?/g, '');
    }
    
    // Fix HTML alt tags
    if (file.endsWith('.html')) {
        replaced = replaced.replace(/alt=""/g, 'alt="Descriptive image"');
        replaced = replaced.replace(/alt="Object"/g, 'alt="Decorative object"');
        replaced = replaced.replace(/alt="Icon"/g, 'alt="Decorative icon"');
        replaced = replaced.replace(/alt="Image"/g, 'alt="Portfolio image"');
        // Fix trailing slash in img tags if any (deprecated attribute in HTML5, though allowed, user wanted it removed)
        replaced = replaced.replace(/<img([^>]+)\/>/g, '<img$1>');
    }
    
    if (replaced !== content) {
        fs.writeFileSync(file, replaced);
        console.log(`Fixed ${file}`);
    }
});
console.log('Code fixes applied.');
