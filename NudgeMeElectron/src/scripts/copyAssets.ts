import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..'); // dist directory after build
// When compiled, this file sits in dist/scripts, so navigate accordingly
const distDir = join(__dirname, '..');
const iconSource = join(distDir, '..', 'icon.png'); // go back to project root then src/icon.png
const destIcon = join(distDir, 'icon.png');

if (!existsSync(iconSource)) {
  console.warn('[copyAssets] icon.png not found. Skipping.');
  process.exit(0);
}

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

copyFileSync(iconSource, destIcon);
console.log('[copyAssets] Copied icon.png to dist directory');
