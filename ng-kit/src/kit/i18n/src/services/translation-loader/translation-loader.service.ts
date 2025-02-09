import { Injectable, Injector, NgZone, PLATFORM_ID, EventEmitter } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { isEmpty, forEach, uniqBy } from 'lodash-es';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, delay, filter, map, mergeMap, take, tap, shareReplay } from 'rxjs/operators';

import { TranslationsInterface } from '../../interfaces';
import { TranslateService } from '../translate/translate.service';
import { TranslationLoaderServiceInterface } from './translation-loader.service.interface';
// Long paths are here to avoid circular dependencies
import { EnvironmentConfigService } from '../../../../environment-config/src/services/environment-config.service';
import { CustomConfigInterface, EnvironmentConfigInterface } from '../../../../environment-config/src/interfaces';
import { getLocaleId, saveLocale } from '../../lib';
import { registerLocaleData } from '../../lib/register-locale-data';
import { LocaleConstantsService } from '../locale-constants/locale-constants.service';
import { AuthHeadersEnum } from '../../../../auth/src/services/auth.service';

@Injectable()
export class TranslationLoaderService implements TranslationLoaderServiceInterface {

  loadedDomains: string[] = [];
  localeChanged: Observable<string> = null;

  private loadedLangDomains: {
    [lang: string]: string[]
  } = {};
  private pendingLoaders: Observable<boolean>[] = [];
  private http: HttpClient = this.injector.get(HttpClient);
  private localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);
  private configService: EnvironmentConfigService = this.injector.get(EnvironmentConfigService);
  private zone: NgZone = this.injector.get(NgZone);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private transferState: TransferState = this.injector.get(TransferState, null);
  private platformId: string = this.injector.get<string>(PLATFORM_ID);
  private localeChangedSubject: EventEmitter<string> = new EventEmitter();

  private get requestOptions(): { headers: HttpHeaders } {
    const header: { [headers: string]: string } = {
      'Cache-Control': 'max-age=3600'
    };
    // This header will be processed in interceptor
    header[AuthHeadersEnum.anonym] = 'true';
    return {
      headers: new HttpHeaders(header)
    };
  }

  constructor(
    protected injector: Injector
  ) {
    this.localeChanged = this.localeChangedSubject.asObservable();
  }

  private get lang(): string {
    return this.localeConstantsService.getLang();
  }

  reloadTranslations(locale: string = null): Observable<boolean> {
    const prevLang: string = this.lang;
    if (locale) {
      saveLocale(locale);
      registerLocaleData(getLocaleId(locale));
    }

    // It takes some time to update locale data during registerLocaleData() call
    // So we have to add delay in pipe to not get 'Error: Missing locale data for the locale "xx".'
    return this.loadTranslations(this.loadedDomains).pipe(delay(200), map(result => {
      this.zone.run(() => {
        // console.log('Translations reloaded!', this.lang);
        if (prevLang !== this.lang) {
          this.localeChangedSubject.emit(this.lang);
        }
      });
      return result;
    }));
  }

  loadTranslations(i18nDomains: string | string[]): Observable<boolean> {
    if (!Array.isArray(i18nDomains)) {
      i18nDomains = [i18nDomains];
    }

    // Switch alrady loaded chaced translations
    forEach(i18nDomains, domain => {
      const key: string = this.makeStorageKey(domain, this.lang);
      const cachedTranslates: TranslationsInterface = this.getTranslationsFromCache(key);
      if (cachedTranslates) {
        this.translateService.addTranslations(cachedTranslates);
      }
    });

    this.loadedDomains = i18nDomains.concat(this.loadedDomains);
    this.loadedDomains = uniqBy(this.loadedDomains, domain => domain);

    const loadedLangDomains: string[] = this.loadedLangDomains[this.lang] || (this.loadedLangDomains[this.lang] = []);
    const newi18nDomains: string[] = this.loadedDomains.filter(domain => !loadedLangDomains.find(d => d === domain));

    if (!newi18nDomains.length) {
      return of(true);
    }
    loadedLangDomains.push(...newi18nDomains);
    this.loadedLangDomains[this.lang] = uniqBy(loadedLangDomains, d => d);

    const observables: Observable<boolean>[] = newi18nDomains.map((i18nDomain: string) => {
      const loader: Observable<boolean> = this.getHttpLoadObservable(i18nDomain).pipe(
        map(() => {
          const index: number = this.pendingLoaders.indexOf(loader);
          if (index > -1) {
            this.pendingLoaders.splice(index, 1);
          }
          return true;
        }),
        shareReplay(1),
      );
      return loader;
    });
    this.pendingLoaders = this.pendingLoaders.concat(observables);

    return combineLatest(...this.pendingLoaders).pipe(
      take(1),
      map(() => true)
    );
  }

  preloadTranslationFiles(lang: string, i18nDomains: string | string[]): void {
    const domains: string[] = Array.isArray(i18nDomains) ? i18nDomains : [i18nDomains];
    this.configService.getConfig$().pipe(
      filter((config: EnvironmentConfigInterface) => !!config && !isEmpty(config)),
      take(1)
    ).subscribe((config: EnvironmentConfigInterface) => {
      domains.map((i18nDomain: string) => {
        const customConfig: CustomConfigInterface = config.custom;
        const elem: HTMLElement = document.createElement('link');
        elem.setAttribute('rel', 'preload');
        elem.setAttribute('type', 'application/json');
        elem.setAttribute('as', 'fetch');
        elem.setAttribute('crossorigin', 'anonymous');
        elem.setAttribute('href', this.makeLink(customConfig, i18nDomain, lang));
        document.getElementsByTagName('head')[0].appendChild(elem);
      });
    });
  }

  private getHttpLoadObservable(i18nDomain: string): Observable<boolean> {
    return this.configService.getConfig$().pipe(
      filter((config: EnvironmentConfigInterface) => !!config && !isEmpty(config)),
      take(1),
      mergeMap((config: EnvironmentConfigInterface) => {
        const customConfig: CustomConfigInterface = config.custom;
        const key: string = this.makeStorageKey(i18nDomain, this.lang);

        let obs$: Observable<boolean>;

        const cachedTranslates: TranslationsInterface = this.getTranslationsFromCache(key);
        if (cachedTranslates) {
          this.translateService.addTranslations(cachedTranslates);
          obs$ = of(true);
        } else {
          const url: string = this.makeLink(customConfig, i18nDomain, this.lang);
          obs$ = this.http.get<TranslationsInterface>(url, this.requestOptions)
            .pipe(
              tap((data: TranslationsInterface) => {
                this.setTranslationsInCache(key, data);
                this.translateService.addTranslations(data);
              }),
              map(() => true),
              catchError(err => {
                console.error(`Could not load translations for path: '${customConfig.translation}', key: '${i18nDomain}', reason:`, err);
                return of(true);
              }),
            );
        }

        return obs$;
      })
    );
  }

  private getTranslationsFromCache(key: string): TranslationsInterface {
    let translationsAsString: string;

    if (this.transferState) {
      const stateKey: StateKey<string> = makeStateKey<string>(key);
      translationsAsString = this.transferState.get(stateKey, null);
    } else if (isPlatformBrowser(this.platformId)) {
      translationsAsString = sessionStorage.getItem(key);
    }

    return JSON.parse(translationsAsString);
  }

  private setTranslationsInCache(key: string, data: TranslationsInterface): void {
    const dataAsString: string = JSON.stringify(data);

    if (this.transferState) {
      const stateKey: StateKey<string> = makeStateKey<string>(key);
      this.transferState.set(stateKey, dataAsString);
    } else if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(key, dataAsString);
    }
  }

  private makeLink(customConfig: CustomConfigInterface, i18nDomain: string, lang: string): string {
    if (!customConfig.translation) {
      console.error('Translation server not found in env.json!');
    }
    return `${Location.stripTrailingSlash(customConfig.translation || '')}/translations/frontend-${i18nDomain}-${lang}.json`;
  }

  private makeStorageKey(domain: string, lang: string): string {
    return `pe_lang_data_${domain}_${lang}`;
  }
}
