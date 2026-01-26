# @metervara/grid-listing

Responsive grid listing component with tag filtering and staggered animations.

## Installation

```bash
npm install github:metervara/grid-listing#v0.1.0
```

## Usage

### HTML Structure

```html
<div class="grid-listing-measure"></div>
<div class="grid-listing-header fixed-header"></div>
<div class="grid-listing"></div>
```

### JavaScript

```typescript
import { GridList, type GridItem } from '@metervara/grid-listing';
import '@metervara/grid-listing/styles';

const grid = new GridList({
  gridEl: document.querySelector('.grid-listing')!,
  headerEl: document.querySelector('.grid-listing-header'),
  measureViewportEl: document.querySelector('.grid-listing-measure'),
});

grid.init();
grid.setItems(items);
```

### Providing Data

The `setItems` method accepts an array of `GridItem` objects:

```typescript
type GridItem = {
  id?: string;
  title: string;
  description?: string;
  tags?: string[];
  thumbnails?: string[];  // Image URLs
  href?: string;          // Click navigation URL
  group?: string;
};
```

**Examples:**

```typescript
// Static array
grid.setItems([
  { title: 'Project A', tags: ['webgl', 'art'], href: '/projects/a/' },
  { title: 'Project B', tags: ['tool'], thumbnails: ['/img/b.jpg'] },
]);

// Fetch from JSON
const items = await fetch('/manifest.json').then(r => r.json());
grid.setItems(items);

// Build-time virtual module
import manifest from 'virtual:my-manifest';
grid.setItems(manifest.items);
```

## Styling

```typescript
// Full defaults (layout + Metervara theme)
import '@metervara/grid-listing/styles';

// Layout only (bring your own theme)
import '@metervara/grid-listing/grid.css';
```

Override theme by setting CSS variables:

```css
:root {
  --block-border-color: #ff0000;
  --block-background-color: #333;
  --tag-background-color: #555;
}
```

## Vite Plugin

The package includes a Vite plugin that scans a directory for items and generates a virtual module with metadata extracted from `index.html` files.

### Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { gridManifestPlugin } from '@metervara/grid-listing';

export default defineConfig({
  plugins: [
    gridManifestPlugin({
      dir: './src/projects',      // Directory to scan
      moduleId: 'virtual:projects', // Virtual module name (default: 'virtual:grid-manifest')
      basePath: '/',              // URL base path for href
    }),
  ],
});
```

### Type Declaration

Add to your `src/vite-env.d.ts` or a similar declaration file:

```typescript
declare module 'virtual:projects' {
  import type { ManifestItem } from '@metervara/grid-listing';
  const manifest: { items: ManifestItem[] };
  export default manifest;
}
```

### Usage

```typescript
import manifest from 'virtual:projects';
import { GridList } from '@metervara/grid-listing';

const grid = new GridList({ gridEl: document.querySelector('.grid-listing')! });
grid.init();
grid.setItems(manifest.items.map(item => ({
  title: item.title || item.name,
  description: item.description,
  tags: item.tags,
  thumbnails: item.thumbnail ? [`/${item.thumbnail}`] : [],
  href: item.href,
  group: item.group,
})));
```

### Directory Structure

The plugin scans for subdirectories containing `index.html`:

```
src/projects/
├── project-a/
│   ├── index.html      # Required
│   └── thumbnail.jpg   # Optional
├── category/
│   └── project-b/
│       ├── index.html
│       └── thumbnail.png
└── _hidden-project/    # Ignored (starts with _)
    └── index.html
```

### Metadata Extraction

The plugin extracts metadata from each `index.html` using standard HTML head tags:

| Field | Source |
|-------|--------|
| title | `<title>` |
| description | `<meta name="description">` |
| tags | `<meta name="tags">` (comma-separated) |
| thumbnail | `thumbnail.{png,jpg,jpeg,webp,gif,mp4,webm}` in same directory |

**Example HTML:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Project Name</title>
    <meta name="description" content="A brief description of the project">
    <meta name="tags" content="webgl, shader, animation">
  </head>
  <body>
    <!-- content -->
  </body>
</html>
```

### Plugin Options

```typescript
gridManifestPlugin({
  dir: string,                    // Required: directory to scan
  moduleId?: string,              // Virtual module ID (default: 'virtual:grid-manifest')
  basePath?: string,              // URL base for href (default: '/')
  includeHidden?: boolean,        // Include _prefixed dirs (default: false)
  thumbnailPatterns?: string[],   // Custom thumbnail filenames
});
```

### Hot Reload

In dev mode, the plugin watches the source directory and triggers a full reload when:
- `index.html` files are modified
- Thumbnail files change
- Directories are added or removed

## Configuration

```typescript
const grid = new GridList({
  gridEl: element,                    // Required: grid container
  headerEl: element,                  // Optional: fixed header element
  measureViewportEl: element,         // Optional: viewport measurement element
  desiredBlockSize: { width: 400, height: 300 },
  gap: 10,
  fadeOutDurationMs: 200,
  staggerStepMs: 75,
  fadeStaggerStepMs: 50,
  initialResizeDelayFrames: 2,
  initialScrollDelayMs: 1750,
  filterScrollDelayMs: 400,
});
```

## Releasing

1. Make your changes
2. Build the package: `npm run build`
3. Bump version in `package.json`
4. Commit changes (including `dist/`)
5. Tag and push:
   ```bash
   git tag v0.x.x
   git push origin main --tags
   ```
6. Update consumers to use the new tag

## License

MIT
