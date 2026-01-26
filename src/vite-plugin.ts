import { Plugin, ViteDevServer } from 'vite';
import { readdirSync, readFileSync, existsSync, watch, FSWatcher } from 'fs';
import { join, relative, basename, posix } from 'path';

export type ManifestItem = {
  /** Relative path from source directory (posix format) */
  path: string;
  /** Directory name */
  name: string;
  /** First-level folder name, or 'misc' if at root */
  group: string;
  /** Extracted from HTML */
  title?: string;
  /** Extracted from HTML */
  description?: string;
  /** Extracted from HTML */
  tags?: string[];
  /** Relative path to thumbnail (posix format) */
  thumbnail?: string;
  /** URL path for navigation */
  href: string;
  /** Hidden if directory starts with _ */
  hidden: boolean;
};

export type GridManifestPluginOptions = {
  /** Directory to scan for items */
  dir: string;
  /** Virtual module ID (default: 'virtual:grid-manifest') */
  moduleId?: string;
  /** URL base path for href generation (default: '/') */
  basePath?: string;
  /** Include hidden items (directories starting with _) in output (default: false) */
  includeHidden?: boolean;
  /** Custom thumbnail file patterns (default: ['thumbnail.png', 'thumbnail.jpg', ...]) */
  thumbnailPatterns?: string[];
};

const DEFAULT_THUMBNAIL_PATTERNS = [
  'thumbnail.png',
  'thumbnail.jpg',
  'thumbnail.jpeg',
  'thumbnail.webp',
  'thumbnail.gif',
  'thumbnail.mp4',
  'thumbnail.webm',
];

/**
 * Find all directories containing index.html
 */
function findItemDirs(dir: string, rootDir: string = dir): string[] {
  const results: string[] = [];

  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = join(dir, entry.name);
    const indexPath = join(fullPath, 'index.html');

    if (existsSync(indexPath)) {
      results.push(fullPath);
    }

    // Recurse into subdirectories
    results.push(...findItemDirs(fullPath, rootDir));
  }

  return results;
}

/**
 * Extract title from HTML content
 * Source: <title> tag
 */
function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract description from HTML content
 * Source: <meta name="description">
 */
function extractDescription(html: string): string | undefined {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract tags from HTML content
 * Source: <meta name="tags"> (comma-separated)
 */
function extractTags(html: string): string[] {
  const match = html.match(/<meta[^>]*name=["']tags["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']tags["'][^>]*>/i);

  if (!match) return [];

  return match[1]
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Find thumbnail file in directory
 */
function findThumbnail(dir: string, patterns: string[]): string | undefined {
  for (const pattern of patterns) {
    const thumbPath = join(dir, pattern);
    if (existsSync(thumbPath)) {
      return pattern;
    }
  }
  return undefined;
}

/**
 * Build manifest from directory
 */
function buildManifest(
  rootDir: string,
  options: GridManifestPluginOptions
): ManifestItem[] {
  const {
    basePath = '/',
    includeHidden = false,
    thumbnailPatterns = DEFAULT_THUMBNAIL_PATTERNS,
  } = options;

  const itemDirs = findItemDirs(rootDir);
  const items: ManifestItem[] = [];

  for (const itemDir of itemDirs) {
    const relPath = relative(rootDir, itemDir);
    const name = basename(itemDir);
    const hidden = name.startsWith('_');

    if (hidden && !includeHidden) continue;

    // Determine group (first-level folder or 'misc')
    const pathParts = relPath.split(/[/\\]/);
    const group = pathParts.length > 1 ? pathParts[0] : 'misc';

    // Read and parse index.html
    const indexPath = join(itemDir, 'index.html');
    const html = readFileSync(indexPath, 'utf-8');

    const title = extractTitle(html);
    const description = extractDescription(html);
    const tags = extractTags(html);
    const thumbnailFile = findThumbnail(itemDir, thumbnailPatterns);

    // Build href and thumbnail paths (posix format)
    const posixPath = relPath.split(/[/\\]/).join(posix.sep);
    const href = `${basePath}${posixPath}/`.replace(/\/+/g, '/');
    const thumbnail = thumbnailFile
      ? `${posixPath}/${thumbnailFile}`.replace(/\\/g, '/')
      : undefined;

    items.push({
      path: posixPath,
      name,
      group,
      title,
      description,
      tags: tags.length > 0 ? tags : undefined,
      thumbnail,
      href,
      hidden,
    });
  }

  // Sort by path
  items.sort((a, b) => a.path.localeCompare(b.path));

  return items;
}

/**
 * Vite plugin for grid manifest virtual module with HMR support
 */
export function gridManifestPlugin(options: GridManifestPluginOptions): Plugin {
  const moduleId = options.moduleId || 'virtual:grid-manifest';
  const resolvedModuleId = '\0' + moduleId;

  let watcher: FSWatcher | null = null;
  let server: ViteDevServer | null = null;

  return {
    name: 'grid-manifest',

    resolveId(id) {
      if (id === moduleId) {
        return resolvedModuleId;
      }
    },

    load(id) {
      if (id === resolvedModuleId) {
        const manifest = buildManifest(options.dir, options);
        return `export default ${JSON.stringify({ items: manifest }, null, 2)};`;
      }
    },

    configureServer(_server) {
      server = _server;

      // Watch the source directory for changes
      if (existsSync(options.dir)) {
        watcher = watch(options.dir, { recursive: true }, (eventType, filename) => {
          if (!filename) return;

          // Trigger HMR on directory or index.html changes
          const isRelevant =
            filename.endsWith('index.html') ||
            filename.includes('thumbnail') ||
            eventType === 'rename'; // rename fires on add/delete

          if (isRelevant) {
            // Invalidate the virtual module
            const mod = server?.moduleGraph.getModuleById(resolvedModuleId);
            if (mod) {
              server?.moduleGraph.invalidateModule(mod);
              server?.ws.send({
                type: 'full-reload',
                path: '*',
              });
            }
          }
        });
      }
    },

    buildEnd() {
      // Clean up watcher
      if (watcher) {
        watcher.close();
        watcher = null;
      }
    },
  };
}

export default gridManifestPlugin;
