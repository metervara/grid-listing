import { defineConfig } from 'vite';
import { resolve } from 'path';
import { gridManifestPlugin } from '../src/vite-plugin';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: [
      { find: '@metervara/grid-listing/styles', replacement: resolve(__dirname, '../src/styles/index.css') },
      { find: '@metervara/grid-listing', replacement: resolve(__dirname, '../src/index.ts') },
    ],
  },
  plugins: [
    gridManifestPlugin({
      dir: resolve(__dirname, 'projects'),
      basePath: '/projects/',
    }),
  ],
});
