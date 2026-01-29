type Unsub = () => void;

export function createEvents<E extends Record<string, any>>() {
  const map = new Map<keyof E, Set<(payload: any) => void>>();

  const on = <K extends keyof E>(type: K, fn: (payload: E[K]) => void): Unsub => {
    let set = map.get(type);
    if (!set) map.set(type, (set = new Set()));
    set.add(fn as any);
    return () => set!.delete(fn as any);
  };

  const emit = <K extends keyof E>(type: K, payload: E[K]) => {
    const set = map.get(type);
    if (!set) return;
    // copy so unsubscribe during emit doesn’t break iteration
    [...set].forEach((fn) => fn(payload));
  };

  const clear = () => map.clear();

  return { on, emit, clear } as const;
}
