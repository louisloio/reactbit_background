import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds the entry (text-animations-<hash>.js + .css) plus one lazy chunk per background into dist/,
// which scripts/inject.mjs copies to ../assets. base './' keeps chunk URLs relative so the
// pages work from any folder (GitHub Pages serves them from /reactbit_background/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'text-animations-[hash].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'text-animations-[hash][extname]'
      }
    }
  }
});
