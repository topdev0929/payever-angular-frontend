import { Injectable } from '@angular/core';

/**
 * @deprecated Need to use ngx-webstorage instead.
 */
@Injectable()
export class LocalStorageService {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(`${this.prefix}${key}`, value);
  }

  getItem(key: string, prefix?: string): string {
    return localStorage.getItem(`${prefix || this.prefix}${key}`);
  }

  removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  updatePrefix(prefix: string): void {
    this.prefix = prefix;
  }
}
