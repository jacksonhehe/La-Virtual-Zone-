// tests/setup.ts
import '@testing-library/jest-dom';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string) {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.localStorage = new LocalStorageMock();
}
// @ts-ignore
global.localStorage = new LocalStorageMock(); 