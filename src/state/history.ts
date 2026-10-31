import { decodeV1, type SharedState } from './codec';

export interface HistoryState { undo: boolean; redo: boolean }
export type EditHistory = ReturnType<typeof createHistory>;

/** Explicit user transactions only; renderer notifications never enter history. */
export function createHistory(options: {
  capture(actual: boolean): SharedState;
  restore(value: SharedState): void;
  available(): boolean;
  endGestures(): void;
}) {
  type Entry = { before: SharedState; after: SharedState };
  let entries: Entry[] = [], cursor = 0;
  let pending: (Entry & { initial: SharedState }) | undefined;
  const listeners = new Set<() => void>();
  const equal = (a: SharedState, b: SharedState) => JSON.stringify(a) === JSON.stringify(b);
  const changed = () => Boolean(pending && !equal(pending.initial, pending.after));
  const emit = () => { for (const listener of listeners) listener(); };
  const capture = (actual: boolean) => decodeV1(options.capture(actual));
  const api = {
    get(): HistoryState {
      const available = options.available();
      return { undo: available && (cursor > 0 || changed()), redo: available && !changed() && cursor < entries.length };
    },
    begin() {
      if (!pending) pending = { before: capture(true), initial: capture(false), after: capture(false) };
    },
    end() {
      if (!pending) return;
      if (changed()) {
        entries.splice(cursor);
        entries.push({before: pending.before, after: pending.after});
        if (entries.length > 50) entries.shift();
        cursor = entries.length;
      }
      pending = undefined;
      emit();
    },
    run(action: () => void) {
      const grouped = Boolean(pending);
      api.begin();
      try { action(); pending!.after = capture(false); }
      finally { if (!grouped) api.end(); else emit(); }
    },
    undo(): boolean { return traverse(-1); },
    redo(): boolean { return traverse(1); },
    clear() { pending = undefined; entries = []; cursor = 0; emit(); },
    refresh: emit,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose() { pending = undefined; entries = []; listeners.clear(); },
  };
  function traverse(direction: -1 | 1): boolean {
    if (!options.available()) return false;
    options.endGestures();
    api.end();
    const entry = entries[direction === -1 ? cursor - 1 : cursor];
    if (!entry) return false;
    // Validate a fresh copy; a failed restore never consumes an entry.
    options.restore(decodeV1(direction === -1 ? entry.before : entry.after));
    cursor += direction;
    emit();
    return true;
  }
  return api;
}
