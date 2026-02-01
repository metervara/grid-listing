export type GridItem = {
    id?: string;
    title?: string;
    description?: string;
    short?: string;
    tags?: string[];
    thumbnail?: string;
    href?: string;
    group?: string;
};
/** Custom card renderer. Return a div with class "block"; layout classes and click handling are applied by the grid. */
export type RenderCardFn = (item: GridItem) => HTMLDivElement;
export type GridConfig = {
    gridEl: HTMLElement;
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
    additionalSpacerRows?: boolean;
    /** Custom card renderer. If provided, this is used instead of the default card markup (media, title, tags). */
    renderCard?: RenderCardFn;
};
export type GridState = {
    cols: number;
    rows: number;
    width: number;
    height: number;
};
//# sourceMappingURL=types.d.ts.map