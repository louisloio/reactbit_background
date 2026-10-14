// Adds a content hash to every assets/ link in both pages (assets/x.js?v=1a2b3c4d), so browsers
// never mix a cached old file with a new one after a deploy.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const PAGES = ['core-appshell-backgrounds.html', 'core-appshell-panel.html'];
const hashes = Object.fromEntries(
  readdirSync(new URL('assets/', ROOT)).map(f => [
    f,
    createHash('sha256').update(readFileSync(new URL(`assets/${f}`, ROOT))).digest('hex').slice(0, 10)
  ])
);

for (const page of PAGES) {
  const url = new URL(page, ROOT);
  const html = readFileSync(url, 'utf8').replace(/assets\/([\w.-]+?)(\?v=[\w]+)?"/g, (m, file) =>
    hashes[file] ? `assets/${file}?v=${hashes[file]}"` : m
  );
  writeFileSync(url, html);
}
console.log('Stamped asset links in', PAGES.join(', '));
