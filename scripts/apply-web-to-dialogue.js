const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptTag = '<script defer src="/assets/js/web-to-dialogue.js"></script>';
const roots = ['index.html', 'recipes', 'examples', 'mako-notes', 'cet', 'lens', 'willi-mako', 'stack', 'contact'];

function htmlFiles(target) {
  const absolute = path.join(root, target);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return absolute.endsWith('.html') ? [absolute] : [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) return htmlFiles(path.relative(root, child));
    return entry.isFile() && child.endsWith('.html') ? [child] : [];
  });
}

const changed = [];
for (const file of roots.flatMap(htmlFiles)) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('href="/assets/css/energy-practice.css"') || original.includes(scriptTag)) continue;
  if (!original.includes('</head>')) throw new Error(`Missing </head>: ${path.relative(root, file)}`);
  fs.writeFileSync(file, original.replace('</head>', `${scriptTag}\n</head>`));
  changed.push(path.relative(root, file));
}

console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
