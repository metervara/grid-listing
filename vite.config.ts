import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GridListing',
      fileName: 'grid-listing',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'styles/[name][extname]';
          }
          return '[name][extname]';
        },
      },
    },
    cssCodeSplit: false,
  },
  plugins: [
    {
      name: 'copy-css-files',
      closeBundle() {
        // Ensure dist/styles directory exists
        const stylesDir = resolve(__dirname, 'dist/styles');
        if (!existsSync(stylesDir)) {
          mkdirSync(stylesDir, { recursive: true });
        }

        // Copy CSS files to dist
        const srcStyles = resolve(__dirname, 'src/styles');
        copyFileSync(resolve(srcStyles, 'grid.css'), resolve(stylesDir, 'grid.css'));
        copyFileSync(resolve(srcStyles, 'variables.css'), resolve(stylesDir, 'variables.css'));
        copyFileSync(resolve(srcStyles, 'index.css'), resolve(stylesDir, 'index.css'));
      },
    },
  ],
});
