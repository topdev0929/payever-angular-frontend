
import { registerLocaleData } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LOCALES_FOR_CURRENCIES } from '../../constants';
import { CountryListInterface, LocaleConfigInterface, LocalesConfigInterface } from '../../interfaces';

import { getLangList } from './get-locales';

@Injectable({
  providedIn: 'root',
})
export class LocaleConstantsService {

  constructor(
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  getLang(): string {
    return this.locale.split('-')[0];
  }

  getLocales(): LocalesConfigInterface {
    return getLangList();
  }

  getLocaleConfig(): LocaleConfigInterface {
    return this.getLocales()[this.getLang()];
  }

  getCountryList(localeId?: string): () => Promise<CountryListInterface> {
    const locale = this.locale || localeId;

    switch (locale) {
      case 'de':
        return () => import('i18n-iso-countries/langs/de.json').then(m => m.countries);
      case 'es':
        return () => import('i18n-iso-countries/langs/es.json').then(m => m.countries);
      case 'nb':
      case 'no':
        return () => import('i18n-iso-countries/langs/nb.json').then(m => m.countries);
      case 'da':
        return () => import('i18n-iso-countries/langs/da.json').then(m => m.countries);
      case 'sv':
        return () => import('i18n-iso-countries/langs/sv.json').then(m => m.countries);
      case 'nl':
        return () => import('i18n-iso-countries/langs/nl.json').then(m => m.countries);
      case 'fr':
        return () => import('i18n-iso-countries/langs/fr.json').then(m => m.countries);
      default:
        return () => import('i18n-iso-countries/langs/en.json').then(m => m.countries);
    }
  }

  private registeredLocales: string[] = [];
  registerLocaleForCurrency$(currency: string): Observable<string> {
    const curr = currency as keyof typeof LOCALES_FOR_CURRENCIES;

    const localeConst$ = LOCALES_FOR_CURRENCIES[curr]
      ? from(LOCALES_FOR_CURRENCIES[curr]())
      : of(null);

    return localeConst$.pipe(
      map((localeConst) => {
        const locale = localeConst?.default[0] ?? 'en';
        if (this.getLang() === locale || this.registeredLocales.includes(locale)) {
          return locale;
        }

        localeConst && registerLocaleData(localeConst.default);
        this.registeredLocales.push(locale);

        return locale;
      }),
    );
  }
}
