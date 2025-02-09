import { getLangList } from './get-locales';

describe('getLangList', () => {
  it('should return lang list', () => {
    const locale: string = 'en';
    expect(getLangList()[locale].hasOwnProperty('dateFormatShort')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('dateFormatShortMoment')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('dateLongFormatMoment')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('dateMonthFormatShort')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('dateMonthFormatShortMoment')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('dateTimeFormat')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('decimalSymbol')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('name')).toBeTruthy();
    expect(getLangList()[locale].hasOwnProperty('thousandsSeparatorSymbol')).toBeTruthy();
  });
});
