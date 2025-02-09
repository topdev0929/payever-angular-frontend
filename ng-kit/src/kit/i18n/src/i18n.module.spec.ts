// tslint:disable max-classes-per-file

// @TODO uncomment when i18n logic will be stable

/*
import { Inject, LOCALE_ID, Component, ModuleWithProviders } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { I18nModule } from './i18n.module';
import { TranslationsInterface, LocalesConfigInterface, CountryListInterface, PlainTranslationsInterface } from './interfaces';
import { TranslateService, TranslationLoaderService, LocaleService } from './services';
import {
  LANG,
  LOCALES,
  COUNTRY_LIST,
  DATE_FORMAT_SHORT,
  DATE_FORMAT_SHORT_MOMENT,
  DATE_MONTH_FORMAT_SHORT,
  DATE_MONTH_FORMAT_SHORT_MOMENT,
  DATE_LONG_FORMAT_MOMENT,
  THOUSANDS_SEPARATOR_SYMBOL,
  DECIMAL_SYMBOL,
  I18N_PATH,
  PROD_MODE
} from './constants';
import {
  getLangList,
  getCountryList,
  getDateFormatShort,
  getDateFormatShortMoment,
  getDateMonthFormatShort,
  getDateMonthFormatShortMoment,
  getDateLongFormatMoment,
  getThousandsSeparatorSymbol,
  getDecimalSymbol,
  getLang,
  getLocaleIdAndRegisterLocaleData
} from './lib';

describe('I18nModule', () => {
  it('should return ngModule forChild()\'s', () => {
    expect(I18nModule.forChild()).toEqual({
      ngModule: I18nModule
    });
  });

  it('should provide all known injections provide()', async () => {
    spyOn(console, 'warn');

    const translationKey: string = 'translation_key';
    const translations: TranslationsInterface = {
      [translationKey]: 'translated_value'
    };

    @Component({
      template: `
        LocalesDropdownComponent:
        <pe-locales-dropdown></pe-locales-dropdown>

        LocaleFlagComponent:
        <pe-locale-flag></pe-locale-flag>

        LocalesSwitcherComponent:
        <pe-locales-switcher></pe-locales-switcher>

        TranslatePipe:
        <span>{{ '${translationKey}' | translate }}</span>

        CurrencySymbolPipe:
        <span>{{ 'EUR' | peCurrencySymbol }}</span>

        TranslateDirective:
        <span translate>${translationKey}</span>
        <span [translate]="{}">${translationKey}</span>
      `
    })
    class I18nTestComponent {
      constructor(
        @Inject(LANG) public lang: string,
        @Inject(LOCALE_ID) public localeId: string,
        @Inject(LOCALES) public locales: LocalesConfigInterface,
        @Inject(COUNTRY_LIST) public countryList: CountryListInterface,
        @Inject(DATE_FORMAT_SHORT) public dateFormatShort: string,
        @Inject(DATE_FORMAT_SHORT_MOMENT) public dateFormatShortMoment: string,
        @Inject(DATE_MONTH_FORMAT_SHORT) public dateMonthFormatShort: string,
        @Inject(DATE_MONTH_FORMAT_SHORT_MOMENT) public dateMonthFormatShortMoment: string,
        @Inject(DATE_LONG_FORMAT_MOMENT) public dateLongFormatMoment: string,
        @Inject(THOUSANDS_SEPARATOR_SYMBOL) public thousandsSeparatorSymbol: string,
        @Inject(DECIMAL_SYMBOL) public decimalSymbol: string,
        @Inject(I18N_PATH) public i18nPath: string,
        @Inject(PROD_MODE) public prodMode: boolean,
        public localeService: LocaleService,
        public translateService: TranslateService,
        public translationLoaderService: TranslationLoaderService,
      ) {
        translateService.setTranslations(translations);
      }
    }

    const isProd: boolean = true;
    const i18nPath: string = 'my_test_path';
    const i18nModuleProvider: ModuleWithProviders = I18nModule.forRoot({ isProd, i18nPath });
    // const i18nModuleProvider: ModuleWithProviders = I18nModule.forRoot({ isProd, i18nPath });

    expect(i18nModuleProvider.ngModule).toBe(I18nModule);
    expect(i18nModuleProvider.providers).toBeTruthy();

    await TestBed
      .configureTestingModule({
        declarations: [I18nTestComponent],
        imports: [i18nModuleProvider]
      })
      .compileComponents();

    let hasNoCompilationError: any;
    let fixture: ComponentFixture<I18nTestComponent>;
    let component: I18nTestComponent;
    try {
      fixture = TestBed.createComponent(I18nTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      hasNoCompilationError = false;
    } catch (e) {
      hasNoCompilationError = e;
    }
    expect(hasNoCompilationError).toBe(false, 'Should compile test component without any errors');

    const locale: string = getLang({});
    const localesConfig: LocalesConfigInterface = getLangList();

    expect(component.lang).toBe(locale);
    expect(component.localeId).toBe(getLocaleIdAndRegisterLocaleData(locale));
    expect(component.locales).toEqual(localesConfig);
    expect(component.countryList).toEqual(getCountryList(locale));
    expect(component.dateFormatShort).toEqual(getDateFormatShort(localesConfig, locale));
    expect(component.dateFormatShortMoment).toEqual(getDateFormatShortMoment(localesConfig, locale));
    expect(component.dateMonthFormatShort).toEqual(getDateMonthFormatShort(localesConfig, locale));
    expect(component.dateMonthFormatShortMoment).toEqual(getDateMonthFormatShortMoment(localesConfig, locale));
    expect(component.dateLongFormatMoment).toEqual(getDateLongFormatMoment(localesConfig, locale));
    expect(component.thousandsSeparatorSymbol).toEqual(getThousandsSeparatorSymbol(localesConfig, locale));
    expect(component.decimalSymbol).toEqual(getDecimalSymbol(localesConfig, locale));
    expect(component.localeService).toBeTruthy();
    expect(component.translateService).toBeTruthy();
    expect(component.translationLoaderService).toBeTruthy();
    expect(component.i18nPath).toBe(i18nPath);
    expect(component.prodMode).toBe(isProd);

    expect(component.translateService.hasTranslation(translationKey)).toBe(true);

    expect(console.warn).not.toHaveBeenCalled(); // no "missing translation key" warnings
  });

});
*/
