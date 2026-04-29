/**
 * StorageAdapter is the single interface the app uses to persist data.
 *
 * Swap `setStorageAdapter(myDbAdapter)` in a single place to migrate
 * from localStorage to a remote DB (e.g. for a paid tier).
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const localStorageAdapter: StorageAdapter = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

export let storage: StorageAdapter = localStorageAdapter;

/** Replace the adapter at runtime (e.g. after authenticating a paid user). */
export function setStorageAdapter(adapter: StorageAdapter): void {
  storage = adapter;
}

/** Read a JSON value; returns null on missing key or parse error. */
export function storageGetJSON<T>(key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Write a JSON value; silently ignores quota / permission errors. */
export function storageSetJSON<T>(key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / permission errors.
  }
}
