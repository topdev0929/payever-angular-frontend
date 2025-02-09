import { LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import './lib/moment-locales';

import { TranslateDirective } from './directives';
import { CurrencySymbolPipe, CurrencyPipe, PercentPipe, DecimalPipe, TranslatePipe } from './pipes';

import { LocaleFlagComponent, LocalesDropdownComponent, LocalesSwitcherComponent } from './components';
import { LocaleService, LocaleConstantsService, TranslateService, TranslationLoaderService } from './services';
import { TranslationGuard, ActivateUserLangGuard } from './guards';

import {
  CONTINENT_LIST,
  COUNTRY_CONTINENT_LIST,
  COUNTRY_LIST, DATE_FORMAT_SHORT, DATE_FORMAT_SHORT_MOMENT, DATE_LONG_FORMAT_MOMENT, DATE_MONTH_FORMAT_SHORT, DATE_MONTH_FORMAT_SHORT_MOMENT,
  DATE_TIME_FORMAT, DECIMAL_SYMBOL, I18N_CONFIG, I18N_PATH, LANG, LOCALES, PROD_MODE, THOUSANDS_SEPARATOR_SYMBOL,
} from './constants';

import {
  getContinentList,
  getCountryList, getDateFormatShort, getDateFormatShortMoment, getDateLongFormatMoment, getDateMonthFormatShort, getDateMonthFormatShortMoment,
  getDateTimeFormat, getDecimalSymbol, getI18nPath, getLang, getLangList, getLocaleIdAndRegisterLocaleData, getProdMode, getThousandsSeparatorSymbol,
  getCountryContinentList
} from './lib';
import { I18nConfig } from './interfaces';
import { DevModule } from '../../dev';
import { LocationModule, LocationService } from '../../location';

const shared: any = [
  LocalesDropdownComponent,
  LocaleFlagComponent,
  LocalesSwitcherComponent,
  TranslatePipe,
  CurrencySymbolPipe,
  CurrencyPipe,
  PercentPipe,
  DecimalPipe,
  TranslateDirective
];

@NgModule({
  imports: [
    CommonModule,
    // import of this module is not allowed
    // HttpClientModule,
    MatButtonModule,
    MatMenuModule,
    DevModule,
    LocationModule
  ],
  declarations: [
    ...shared
  ],
  exports: [
    ...shared
  ],
  providers: [
  ]
})
export class I18nModule {

  public static forChild(): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: [
        CurrencySymbolPipe,
        CurrencyPipe,
        PercentPipe,
        DecimalPipe
      ]
    };
  }

  public static forRoot(config: I18nConfig = {}): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: [
        {
          provide: I18N_CONFIG,
          useValue: config,
        },
        {
          provide: PROD_MODE,
          useFactory: getProdMode,
          deps: [I18N_CONFIG],
        },
        {
          provide: I18N_PATH,
          useFactory: getI18nPath,
          deps: [I18N_CONFIG, PROD_MODE],
        },
        LocaleConstantsService,
        TranslateService,
        TranslationLoaderService,
        TranslationGuard,
        ActivateUserLangGuard,
        {
          provide: LANG,
          useFactory: getLang,
          deps: [I18N_CONFIG],
        },
        {
          /**
           * @deprecated. Use LocaleConstants.getLocaleId()
           */
          provide: LOCALE_ID,
          useFactory: getLocaleIdAndRegisterLocaleData,
          deps: [LANG]
        },
        {
          provide: LOCALES,
          useFactory: getLangList
        },
        {
          provide: COUNTRY_LIST,
          useFactory: getCountryList,
          deps: [LOCALE_ID]
        },
        {
          provide: CONTINENT_LIST,
          useFactory: getContinentList,
          deps: [LOCALE_ID]
        },
        {
          provide: COUNTRY_CONTINENT_LIST,
          useFactory: getCountryContinentList
        },

        {
          provide: DATE_FORMAT_SHORT,
          useFactory: getDateFormatShort,
          deps: [LOCALES, LANG]
        },
        {
          provide: DATE_FORMAT_SHORT_MOMENT,
          useFactory: getDateFormatShortMoment,
          deps: [LOCALES, LANG]
        },
        {
          provide: DATE_MONTH_FORMAT_SHORT,
          useFactory: getDateMonthFormatShort,
          deps: [LOCALES, LANG]
        },
        {
          provide: DATE_MONTH_FORMAT_SHORT_MOMENT,
          useFactory: getDateMonthFormatShortMoment,
          deps: [LOCALES, LANG]
        },
        {
          provide: DATE_LONG_FORMAT_MOMENT,
          useFactory: getDateLongFormatMoment,
          deps: [LOCALES, LANG]
        },
        {
          provide: DATE_TIME_FORMAT,
          useFactory: getDateTimeFormat,
          deps: [LOCALES, LANG]
        },
        {
          provide: THOUSANDS_SEPARATOR_SYMBOL,
          useFactory: getThousandsSeparatorSymbol,
          deps: [LOCALES, LANG]
        },
        {
          provide: DECIMAL_SYMBOL,
          useFactory: getDecimalSymbol,
          deps: [LOCALES, LANG]
        },
        {
          provide: LocaleService,
          useClass: LocaleService,
          deps: [I18N_CONFIG, LocaleConstantsService, LocationService, TranslationLoaderService]
        }
      ]
    };
  }
}
