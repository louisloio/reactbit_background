// Inlines dist/text-animations.{js,css} into ../core-appshell-backgrounds.html
// between the text-animations markers (added right before </body> the first time).
import { readFileSync, writeFileSync } from 'node:fs';

const PAGE = new URL('../../core-appshell-backgrounds.html', import.meta.url);
const START = '<!-- text-animations:start -->';
const END = '<!-- text-animations:end -->';

const js = readFileSync(new URL('../dist/text-animations.js', import.meta.url), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(new URL('../dist/text-animations.css', import.meta.url), 'utf8').replace(/<\/style/gi, '<\\/style');
const block = `${START}\n<style id="text-animations-css">${css}</style>\n<script type="module" id="text-animations-js">${js}</script>\n${END}`;

let html = readFileSync(PAGE, 'utf8');
const s = html.indexOf(START);
const e = html.indexOf(END);
if (s >= 0 && e > s) html = html.slice(0, s) + block + html.slice(e + END.length);
else html = html.replace('</body>', () => `${block}\n</body>`);
writeFileSync(PAGE, html);
console.log(`Injected ${(js.length / 1024).toFixed(0)} KB JS + ${(css.length / 1024).toFixed(0)} KB CSS`);
