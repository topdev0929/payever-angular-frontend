import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserDetectService {
  get isSafari(): boolean {
    const ua = navigator.appVersion.toLocaleLowerCase();

    return ua.indexOf('safari') !== -1;
  }
}
