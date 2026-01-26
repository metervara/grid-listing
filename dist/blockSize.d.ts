type BestBlock = {
    width: number;
    height: number;
    cols: number;
    rows: number;
    score?: number;
    sizeError?: number;
    arError?: number;
};
type FindOpts = {
    weightSize?: number;
    weightAR?: number;
    alpha?: number;
    maxCols?: number;
    maxRows?: number;
    integerBlockSize?: boolean;
};
/**
 * Find the block size that fills the screen exactly with an even grid and
 * is as close as possible to the desired size + aspect ratio.
 *
 * Gaps are applied only BETWEEN blocks: (cols-1) horizontally, (rows-1) vertically.
 * Subpixel sizes are allowed unless `integerBlockSize` is true.
 */
export declare const findBestBlockSize: (screenW: number, screenH: number, desiredW: number, desiredH: number, gap: number, opts?: FindOpts) => BestBlock;
export declare const findNaiveBlockSize: (screenW: number, screenH: number, desiredW: number, desiredH: number, gap: number) => BestBlock;
export {};
//# sourceMappingURL=blockSize.d.ts.map