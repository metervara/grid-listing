type Unsub = () => void;
export declare function createEvents<E extends Record<string, any>>(): {
    readonly on: <K extends keyof E>(type: K, fn: (payload: E[K]) => void) => Unsub;
    readonly emit: <K extends keyof E>(type: K, payload: E[K]) => void;
    readonly clear: () => void;
};
export {};
//# sourceMappingURL=createEvents.d.ts.map