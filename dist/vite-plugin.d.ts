import { Plugin } from 'vite';
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
/**
 * Vite plugin for grid manifest virtual module with HMR support
 */
export declare function gridManifestPlugin(options: GridManifestPluginOptions): Plugin;
export default gridManifestPlugin;
//# sourceMappingURL=vite-plugin.d.ts.map