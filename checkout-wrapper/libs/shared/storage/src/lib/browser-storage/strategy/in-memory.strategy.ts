import { Injectable } from '@angular/core';

import { StorageInterface } from '../interfaces';

@Injectable()
export class InMemoryStorageStrategy implements StorageInterface {
  private cache = new Map<string, string>();

  get length(): number {
    return this.cache.keys.length;
  }

  getItem(key: string): string | null {
    return this.cache.has(key) ? this.cache.get(key) : null;
  }

  setItem(key: string, value: string) {
    this.cache.set(key, value);
  }

  removeItem(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}
