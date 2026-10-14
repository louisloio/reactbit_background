// Keeps the asset links in both pages fresh after a deploy:
//  - the built entry has a content hash in its filename (text-animations-<hash>.js/.css); point the
//    pages at the current one. It must NOT get a query string: background chunks import it by its
//    plain URL, and a different URL would load a second copy of React.
//  - hand-written assets (appshell.css/js, panel.css, commodities.js) get ?v=<content hash>.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const PAGES = ['core-appshell-backgrounds.html', 'core-appshell-panel.html'];
const files = readdirSync(new URL('assets/', ROOT)).filter(f => statSync(new URL(`assets/${f}`, ROOT)).isFile());
const entry = ext => files.find(f => new RegExp(`^text-animations-[\\w-]+\\.${ext}$`).test(f));
const hash = f => createHash('sha256').update(readFileSync(new URL(`assets/${f}`, ROOT))).digest('hex').slice(0, 10);

for (const page of PAGES) {
  const url = new URL(page, ROOT);
  const html = readFileSync(url, 'utf8')
    .replace(/assets\/text-animations(-[\w-]+)?\.(js|css)(\?v=\w+)?"/g, (m, _h, ext) => `assets/${entry(ext)}"`)
    .replace(/assets\/((?!text-animations)[\w.-]+?)(\?v=\w+)?"/g, (m, file) =>
      files.includes(file) ? `assets/${file}?v=${hash(file)}"` : m
    );
  writeFileSync(url, html);
}
console.log('Stamped asset links in', PAGES.join(', '));
