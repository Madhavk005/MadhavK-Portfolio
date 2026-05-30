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
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(__dirname);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let replaced = content.replace(/css\/main\.css/g, 'css/main.min.css');
    replaced = replaced.replace(/js\/app\.js/g, 'js/app.min.js');
    if (replaced !== content) {
        fs.writeFileSync(file, replaced);
        console.log(`Linked minified files in ${file}`);
    }
});
console.log('Linking complete.');
