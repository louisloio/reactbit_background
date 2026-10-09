import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds one minified ES module + one stylesheet that scripts/inject.mjs inlines into the page.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'text-animations.js',
        assetFileNames: 'text-animations[extname]'
      }
    }
  }
});
