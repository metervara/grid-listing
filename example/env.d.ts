declare module 'virtual:grid-manifest' {
  import type { ManifestItem } from '../src/vite-plugin';
  const manifest: { items: ManifestItem[] };
  export default manifest;
}
