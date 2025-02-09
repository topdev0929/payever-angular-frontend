import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { LocaleConstantsService } from '../../../i18n';
import * as settings from '../settings';

declare global {
  interface Window {
    google: any;
    peReCaptchaOnLoad(): void;
  }
}

@Injectable()
export class ReCaptchaService {

  private readySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private url: string = settings.API_URL;
  private scriptId: string = settings.SCRIPT_ID;

  constructor(private localeConstantsService: LocaleConstantsService) {
    if (document.getElementById(this.scriptId)) {
      this.readySubject.next(true);
    }
    else {
      window.peReCaptchaOnLoad = () => {
        this.readySubject.next(true);
      };
      const localeId: string = localeConstantsService.getLocaleId();
      
      const script: HTMLScriptElement = document.createElement('script');
      script.id = this.scriptId;
      script.src = `${this.url}&hl=${localeId}`;
      document.head.appendChild(script);
    }
  }

  initialized$(): Observable<boolean> {
    return this.readySubject.asObservable().pipe(
      filter(d => d),
      take(1)
    );
  }

}
