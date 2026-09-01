const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const required = [
  'index.html', 'recipes/index.html', 'recipes/klaerfall-json-queue.html',
  'recipes/cet-openwebui-provider.html', 'recipes/edifact-segment-checklist.html', 'recipes/edifact-segments-to-json.html',
  'recipes/willi-mako-question-script.html', 'recipes/willi-mako-intent-dry-run.html',
  'recipes/lens-synthetic-fixtures.html', 'examples/index.html',
  'examples/klaerfall-queue.js', 'examples/edifact-segment-checklist.js', 'examples/willi-mako-intent-dry-run.js',
  'examples/lens-fixture-check.js', 'mako-notes/index.html',
  'cet/index.html', 'lens/index.html', 'willi-mako/index.html', 'stack/index.html',
  'contact/index.html', 'sitemap.xml', 'robots.txt', 'llms.txt', 'feed.xml',
  'assets/css/energy-practice.css'
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Missing required files:', missing.join(', '));
  process.exit(1);
}
const modernHtmlFiles = required.filter((file) => file.endsWith('.html'));
const bad = [];
for (const rel of modernHtmlFiles) {
  const file = path.join(root, rel);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('https://stats.corrently.cloud/js/script.js')) bad.push(`${rel} missing plausible`);
  if (!text.includes('<link rel="canonical"')) bad.push(`${rel} missing canonical`);
  if (!text.includes('href="/assets/css/energy-practice.css"')) bad.push(`${rel} missing shared stylesheet`);
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const rel of modernHtmlFiles) {
  const urlPath = rel === 'index.html' ? '/' : '/' + rel.replace(/index\.html$/, '');
  if (!sitemap.includes(`https://energy.js.org${urlPath}`)) bad.push(`sitemap missing ${urlPath}`);
}
if (bad.length) {
  console.error(bad.join('\n'));
  process.exit(1);
}
console.log(`Validated ${modernHtmlFiles.length} modern html files and ${required.length} required assets.`);
