import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync } from 'fs';
import { gridManifestPlugin } from '../src/vite-plugin';

// The built example is committed to /docs and served by GitHub Pages at
// https://metervara.github.io/grid-listing/. Dev keeps running at the root.
const PAGES_BASE = '/grid-listing/';
const PROJECTS_DIR = resolve(__dirname, 'projects');
const OUT_DIR = resolve(__dirname, '../docs');

export default defineConfig(({ command }) => {
  const base = command === 'build' ? PAGES_BASE : '/';

  return {
    root: __dirname,
    base,
    build: {
      outDir: OUT_DIR,
      emptyOutDir: true,
    },
    resolve: {
      alias: [
        { find: '@metervara/grid-listing/styles', replacement: resolve(__dirname, '../src/styles/index.css') },
        { find: '@metervara/grid-listing', replacement: resolve(__dirname, '../src/index.ts') },
      ],
    },
    plugins: [
      gridManifestPlugin({
        dir: PROJECTS_DIR,
        basePath: `${base}projects/`,
      }),
      {
        // The manifest plugin only lists the projects; the pages themselves
        // are plain static folders, so copy them into the build output.
        name: 'copy-example-projects',
        apply: 'build',
        closeBundle() {
          cpSync(PROJECTS_DIR, resolve(OUT_DIR, 'projects'), { recursive: true });
        },
      },
    ],
  };
});
