import { Injectable, Inject } from '@angular/core';

import {
  ContinentListInterface,
  CountryContinentListInterface,
  CountryListInterface,
  I18nConfig,
  LocalesConfigInterface
} from '../../interfaces';
import { I18N_CONFIG } from '../../constants';
import {
  getContinentList,
  getCountryContinentList,
  getCountryList,
  getDateFormatShort,
  getDateFormatShortMoment,
  getDateLongFormatMoment,
  getDateMonthFormatShort,
  getDateMonthFormatShortMoment,
  getDateTimeFormat,
  getDecimalSymbol,
  getLang,
  getLangList,
  getThousandsSeparatorSymbol
} from '../../lib';
import { getLocaleId } from '../../lib/get-locale-id';

@Injectable()
export class LocaleConstantsService {

  private continentListCache: ContinentListInterface[];
  private countryContinentListCache: CountryContinentListInterface;

  constructor(
    @Inject(I18N_CONFIG) private i18nConfig: I18nConfig
  ) {
  }

  getLang(): string {
    return getLang(this.i18nConfig);
  }

  getLocaleId(lang: string = null): string {
    return getLocaleId(lang || this.getLang());
  }

  getLocales(): LocalesConfigInterface {
    return getLangList();
  }

  getCountryList(localeId: string = null): CountryListInterface {
    return getCountryList(localeId || this.getLocaleId());
  }

  getContinentList(): ContinentListInterface[] {
    return this.continentListCache || (this.continentListCache = getContinentList());
  }

  getCountryContinentList(): CountryContinentListInterface {
    return this.countryContinentListCache || (this.countryContinentListCache = getCountryContinentList());
  }

  getDateFormatShort(lang: string = null): string {
    return getDateFormatShort(this.getLocales(), lang || this.getLang());
  }

  getDateFormatShortMoment(lang: string = null): string {
    return getDateFormatShortMoment(this.getLocales(), lang || this.getLang());
  }

  getDateMonthFormatShort(lang: string = null): string {
    return getDateMonthFormatShort(this.getLocales(), lang || this.getLang());
  }

  getDateMonthFormatShortMoment(lang: string = null): string {
    return getDateMonthFormatShortMoment(this.getLocales(), lang || this.getLang());
  }

  getDateLongFormatMoment(lang: string = null): string {
    return getDateLongFormatMoment(this.getLocales(), lang || this.getLang());
  }

  getDateTimeFormat(lang: string = null): string {
    return getDateTimeFormat(this.getLocales(), lang || this.getLang());
  }

  getThousandsSeparatorSymbol(lang: string = null): string {
    return getThousandsSeparatorSymbol(this.getLocales(), lang || this.getLang());
  }

  getDecimalSymbol(lang: string = null): string {
    return getDecimalSymbol(this.getLocales(), lang || this.getLang());
  }
}
