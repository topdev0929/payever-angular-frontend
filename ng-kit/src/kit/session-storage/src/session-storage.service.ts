import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * @deprecated Need to use ngx-webstorage instead.
 */
@Injectable()
export class SessionStorageService {
  private prefix: string;

  constructor(prefix: string,
              @Inject(PLATFORM_ID) private platformId: string) {
    this.prefix = prefix;
  }

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(`${this.prefix}${key}`, value);
    }
  }

  getItem(key: string, prefix?: string): string {
    let result: string;
    if (isPlatformBrowser(this.platformId)) {
      result = sessionStorage.getItem(`${prefix || this.prefix}${key}`);
    }
    return result;
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(`${this.prefix}${key}`);
    }
  }

  updatePrefix(prefix: string): void {
    this.prefix = prefix;
  }
}
