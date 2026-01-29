import type { GridConfig, GridItem } from './types';
export declare function createGridList(config: GridConfig): {
    init: () => void;
    destroy: () => void;
    setItems: (newItems: GridItem[]) => void;
};
export type GridListInstance = ReturnType<typeof createGridList>;
//# sourceMappingURL=GridList.d.ts.map