import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LocaleConstantsService } from '../../../i18n';
import { EnvironmentConfigService } from '../../../environment-config';
import { BackendLoggerService } from '../../../backend-logger';
import * as settings from '../settings';

declare global {
  interface Window {
    google: any;
    googleMapsOnLoad(): void;
  }
}

export class BaseGoogleAutocompleteService {

  protected onInitSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private url: string = settings.API_URL;
  private defaultKey: string = settings.API_KEY;
  private scriptId: string = settings.SCRIPT_ID;

  private localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);
  private configService: EnvironmentConfigService = this.injector.get(EnvironmentConfigService);
  private backendLoggerService: BackendLoggerService = this.injector.get(BackendLoggerService);

  constructor(protected injector: Injector) {}

  onInitSubscribe(callback: () => void): void {
    this.triggerLoading();
    this.onInitSubject.pipe(filter(a => a === true || a === false)).subscribe(() => {
      callback();
    });
  }

  protected triggerLoading(): void {
    // console.log('Trigger googleMaps loading');
    if (document.getElementById(this.scriptId)) {
      this.onInitSubject.next(true);
    }
    else {
      window.googleMapsOnLoad = () => this.onInitSubject.next(true);
      window['gm_authFailure'] = () => {
        this.backendLoggerService.logError('Google maps failed to load!');
      };
      const localeId: string = this.localeConstantsService.getLocaleId();

      const script: HTMLScriptElement = document.createElement('script');
      script.id = this.scriptId;
      script.src = `${this.url}&key=${this.configService.getConfigConfig().googleMapsApiKey || this.defaultKey}&language=${localeId}`;
      document.head.appendChild(script);
    }
  }

}

@Injectable()
export class GoogleAutocompleteService extends BaseGoogleAutocompleteService {
  constructor(injector: Injector) {
    super(injector);
  }
}
