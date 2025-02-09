import { Injectable } from '@angular/core';
import { PebTranslateService } from '@pe/common';

@Injectable({ providedIn: 'any' })
export class SandboxTranslateService implements PebTranslateService {
  translate(key: string, args?: any): string {
    return key;
  }

  hasTranslation(key: string): boolean {
    return true;
  }
}
