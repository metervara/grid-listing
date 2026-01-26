export type GridItem = {
    id?: string;
    title: string;
    description?: string;
    tags?: string[];
    thumbnails?: string[];
    href?: string;
    group?: string;
};
export type GridConfig = {
    gridEl: HTMLElement;
    headerEl?: HTMLElement | null;
    measureViewportEl?: HTMLElement | null;
    desiredBlockSize?: {
        width: number;
        height: number;
    };
    gap?: number;
    fadeOutDurationMs?: number;
    staggerStepMs?: number;
    fadeStaggerStepMs?: number;
    initialResizeDelayFrames?: number;
    initialScrollDelayMs?: number;
    filterScrollDelayMs?: number;
};
export type GridState = {
    cols: number;
    rows: number;
    width: number;
    height: number;
};
//# sourceMappingURL=types.d.ts.map