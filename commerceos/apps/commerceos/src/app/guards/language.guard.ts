import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { keys } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LocaleService, getLangList } from '@pe/i18n-core';


@Injectable()
export class LanguageGuard implements CanActivate {

  defaultLocaleKey = 'pe_current_locale';

  constructor(
    private readonly localeService: LocaleService,
  ) {}

  canActivate(): boolean | Observable<boolean> {
    let locale: string = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
    let browserLocale: string = (require('locale2') || '').split('-')[0].toLowerCase();
    browserLocale = getLangList()[browserLocale] ? browserLocale : null;
    locale = this.retrieveLocale() || browserLocale || locale;

    return this.localeService.locales$.pipe(
      map((locales) => {
        if (locales.find(l => l.code === locale)) {
          this.saveLocale(locale);

          return true;
        }

        return true;
      }),
    );
  }

  saveLocale(locale: string): void {
    const langs = getLangList();
    if (keys(langs).indexOf(locale) < 0) {
      console.error('Locale is not allowed!', locale, langs);
    }
    window[this.defaultLocaleKey] = locale;
    try {
      if (this.isLocalStorage()) {
        localStorage.setItem(this.defaultLocaleKey, locale);
      }
    } catch (e) {}
  }

  retrieveLocale(): string {
    let result = window[this.defaultLocaleKey] || null;
    try {
      result = this.isLocalStorage() ? localStorage.getItem(this.defaultLocaleKey) : result;
    } catch (e) {}

    return result;
  }

  isLocalStorage(): boolean {
    try {
      localStorage?.getItem('_');

      return true;
    } catch (e) {
      return false;
    }
  }
}
