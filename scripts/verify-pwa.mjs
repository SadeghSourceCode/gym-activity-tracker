import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const outputDir = path.resolve('dist/gym-activity-tracker/browser');
const requiredFiles = ['index.html', 'manifest.webmanifest', 'sw.js', 'icons/app-icon.svg'];

for (const file of requiredFiles) {
  await access(path.join(outputDir, file), constants.R_OK);
}

const manifest = JSON.parse(
  await readFile(path.join(outputDir, 'manifest.webmanifest'), 'utf8'),
);

const requiredManifestFields = ['name', 'short_name', 'start_url', 'scope', 'display', 'icons'];
for (const field of requiredManifestFields) {
  if (manifest[field] === undefined || manifest[field] === null || manifest[field] === '') {
    throw new Error(`PWA manifest is missing required field: ${field}`);
  }
}

if (manifest.display !== 'standalone') {
  throw new Error(`Expected manifest display to be "standalone", received "${manifest.display}".`);
}

if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
  throw new Error('PWA manifest must declare at least one icon.');
}

for (const icon of manifest.icons) {
  if (!icon.src) throw new Error('Every manifest icon must include src.');
  const iconPath = path.join(outputDir, icon.src.replace(/^\.\//, ''));
  await access(iconPath, constants.R_OK);
}

const indexHtml = await readFile(path.join(outputDir, 'index.html'), 'utf8');
if (!/rel=["']manifest["']/.test(indexHtml)) {
  throw new Error('Built index.html does not reference the web app manifest.');
}
if (!/name=["']theme-color["']/.test(indexHtml)) {
  throw new Error('Built index.html does not declare a theme-color.');
}

const serviceWorker = await readFile(path.join(outputDir, 'sw.js'), 'utf8');
if (!serviceWorker.includes("addEventListener('fetch'")) {
  throw new Error('Service worker does not include a fetch handler.');
}

console.log('PWA smoke check passed.');
