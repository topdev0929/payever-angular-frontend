import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map, first } from 'rxjs/operators';

import { LocationService } from '../../../../location';
import { I18nConfig, LocaleInterface, LocalesConfigInterface } from '../../interfaces';
import { I18N_CONFIG } from '../../constants';
import { retrieveLocale, saveLocale } from '../../lib';
import { LocaleConstantsService } from '../locale-constants/locale-constants.service';

@Injectable()
export class LocaleService {

  locales$: BehaviorSubject<LocaleInterface[]> = new BehaviorSubject<LocaleInterface[]>([]);
  currentLocale$: BehaviorSubject<LocaleInterface> = new BehaviorSubject<LocaleInterface>(null);

  private useStorageForLocale: boolean = false;

  constructor(
    @Inject(I18N_CONFIG) private i18nConfig: I18nConfig,
    private localeConstantsService: LocaleConstantsService,
    private locationService: LocationService,
  ) {
    this.locales$
      .pipe(
        filter(({ length }) => length > 0),
        map(locales => locales.find(({ code }) => code === this.currentLocaleCode)),
        filter(Boolean),
        first()
      )
      .subscribe(
        (currentLocale: LocaleInterface) => this.currentLocale$.next(currentLocale)
      );
    this.updateConfig();
  }

  private get localesConfig(): LocalesConfigInterface {
    return this.localeConstantsService.getLocales();
  }

  private get currentLocaleCode(): string {
    return this.localeConstantsService.getLang();
  }

  updateConfig(): void {
    this.useStorageForLocale = this.i18nConfig.useStorageForLocale;
    this.setLocaleConfig(this.localesConfig);
  }

  setLocaleConfig(localesConfig: LocalesConfigInterface): void {
    this.locales$.next(
      Object
        .keys(localesConfig)
        .map(key => ({
          code: key,
          ...localesConfig[key],
        }))
    );
  }

  setCurrentLocale(code: string): boolean {
    const locales: LocaleInterface[] = this.locales$.getValue();
    const newCurrentLocale: LocaleInterface = locales.find(({ code: localeCode }) => code === localeCode);
    if (newCurrentLocale) {
      this.currentLocale$.next(newCurrentLocale);
      return true;
    } else {
      return false;
    }
  }

  changeCurrentLocale(locale: string): void {
    if (this.useStorageForLocale) {
      if (retrieveLocale() !== locale) {
        saveLocale(locale);
        this.locationService.reload();
      }
    } else {
      this.locationService.href = `/switch/${locale}`;
    }
  }
}
