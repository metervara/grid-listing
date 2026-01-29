import type { GridConfig, GridItem, GridState } from './types';
type ListEvents = {
    "scroll:start": void;
    "scroll:end": {
        aboveHeader: number | undefined;
        belowHeader: number | undefined;
    };
    "initial:scroll:end": {
        aboveHeader: number | undefined;
        belowHeader: number | undefined;
    };
};
export declare function createGridList(config: GridConfig): {
    init: () => void;
    destroy: () => void;
    setItems: (newItems: GridItem[]) => void;
    events: {
        readonly on: <K extends keyof ListEvents>(type: K, fn: (payload: ListEvents[K]) => void) => () => void;
        readonly emit: <K extends keyof ListEvents>(type: K, payload: ListEvents[K]) => void;
        readonly clear: () => void;
    };
    getLayout: () => GridState;
};
export type GridListInstance = ReturnType<typeof createGridList>;
export {};
//# sourceMappingURL=GridList.d.ts.map