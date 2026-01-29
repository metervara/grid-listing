/// <reference types="vite/client" />

declare module 'virtual:grid-manifest' {
  import type { ManifestItem } from '@metervara/grid-listing';
  const manifest: { items: ManifestItem[] };
  export default manifest;
}
