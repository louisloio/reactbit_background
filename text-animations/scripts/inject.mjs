// Copies dist/text-animations.{js,css} to ../assets, which both pages load:
//   core-appshell-backgrounds.html (Enhanced) and core-appshell-panel.html (Classic)
import { copyFileSync } from 'node:fs';

for (const ext of ['js', 'css']) {
  copyFileSync(new URL(`../dist/text-animations.${ext}`, import.meta.url), new URL(`../../assets/text-animations.${ext}`, import.meta.url));
}
console.log('Copied text-animations.js + .css to assets/');
