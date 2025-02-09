import { Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';

declare global {
  interface Window {
    google: any;
    googleMapsOnLoad(): void;
  }
}

export class BaseGoogleAutocompleteService {

  protected onInitSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private url: string = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=googleMapsOnLoad';
  private defaultKey: string = 'AIzaSyDB-7kzuFYxb8resf60yF21TKUkTbGhljc';
  private scriptId: string = 'peGoogleAutocompleteScript';

  private localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);

  constructor(
    protected injector: Injector,
    protected googleMapsApiKey: string,
  ) {}

  onInitSubscribe(callback: () => void): void {
    this.triggerLoading();
    this.onInitSubject.pipe(filter(a => a || !a)).subscribe(() => {
      callback();
    });
  }

  protected triggerLoading(): void {
    if (document.getElementById(this.scriptId)) {
      this.onInitSubject.next(true);
    } else {
      window.googleMapsOnLoad = () => this.onInitSubject.next(true);
      const localeId: string = this.localeConstantsService.getLocaleId();

      const script: HTMLScriptElement = document.createElement('script');
      script.id = this.scriptId;
      script.src = `${this.url}&key=${this.googleMapsApiKey || this.defaultKey}&language=${localeId}`;
      document.head.appendChild(script);
    }
  }
}
