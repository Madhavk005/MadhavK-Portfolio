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
        } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(__dirname);

files.forEach(file => {
    if (file === __filename || file === path.join(__dirname, 'optimize.js')) return;
    let content = fs.readFileSync(file, 'utf8');
    let replaced = content.replace(/\.png/g, '.webp').replace(/\.jpg/g, '.webp');
    if (replaced !== content) {
        fs.writeFileSync(file, replaced);
        console.log(`Updated ${file}`);
    }
});
console.log('Extensions updated.');
