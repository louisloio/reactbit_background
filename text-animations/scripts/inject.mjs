// Copies the build (dist/) into ../assets, which both pages load:
//   core-appshell-backgrounds.html (Enhanced) and core-appshell-panel.html (Classic)
// Old hashed entry files and assets/chunks/ are removed first so stale copies don't pile up.
import { cpSync, readdirSync, rmSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const assets = new URL('../../assets/', import.meta.url);
for (const f of readdirSync(assets)) if (/^text-animations[-.]/.test(f)) rmSync(new URL(f, assets));
rmSync(new URL('chunks/', assets), { recursive: true, force: true });
cpSync(dist, assets, { recursive: true });
console.log('Copied dist/ to assets/');
