import { Injectable, inject } from '@angular/core';

import { StorageInterface } from '../interfaces';
import { BROWSER_STORAGE } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public readonly storage: StorageInterface = inject(BROWSER_STORAGE);

  get(key: string): string | null {
    return this.storage.getItem(key);
  }

  set(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
