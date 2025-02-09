import { LocalesConfigInterface, LocaleConfigInterface } from '../interfaces';

import {
  getDateFormatShort,
  getDateFormatShortMoment,
  getDateMonthFormatShort,
  getDateMonthFormatShortMoment,
  getDateLongFormatMoment,
  getDateTimeFormat,
  getThousandsSeparatorSymbol,
  getDecimalSymbol,
} from './date-formats';

describe('date-formats', () => {
  it('should return proper values', () => {
    const locale: string = 'pe';
    const localeConfig: LocaleConfigInterface = {
      name: '[test_name]',
      dateFormatShort: '[test_dateFormatShort]',
      dateFormatShortMoment: '[test_dateFormatShortMoment]',
      dateMonthFormatShort: '[test_dateMonthFormatShort]',
      dateMonthFormatShortMoment: '[test_dateMonthFormatShortMoment]',
      dateLongFormatMoment: '[test_dateLongFormatMoment]',
      dateTimeFormat: '[test_dateTimeFormat]',
      thousandsSeparatorSymbol: '[test_thousandsSeparatorSymbol]',
      decimalSymbol: '[test_decimalSymbol]',
    };
    const locales: LocalesConfigInterface = {
      [locale]: localeConfig
    };

    expect(getDateFormatShort(locales, locale)).toBe(localeConfig.dateFormatShort);
    expect(getDateFormatShortMoment(locales, locale)).toBe(localeConfig.dateFormatShortMoment);
    expect(getDateMonthFormatShort(locales, locale)).toBe(localeConfig.dateMonthFormatShort);
    expect(getDateMonthFormatShortMoment(locales, locale)).toBe(localeConfig.dateMonthFormatShortMoment);
    expect(getDateLongFormatMoment(locales, locale)).toBe(localeConfig.dateLongFormatMoment);
    expect(getDateTimeFormat(locales, locale)).toBe(localeConfig.dateTimeFormat);
    expect(getThousandsSeparatorSymbol(locales, locale)).toBe(localeConfig.thousandsSeparatorSymbol);
    expect(getDecimalSymbol(locales, locale)).toBe(localeConfig.decimalSymbol);
  });
});
