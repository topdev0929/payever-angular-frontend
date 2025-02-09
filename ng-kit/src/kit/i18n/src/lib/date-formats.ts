import { LocalesConfigInterface } from '../interfaces';

export function getDateFormatShort(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].dateFormatShort;
}

export function getDateFormatShortMoment(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].dateFormatShortMoment;
}

export function getDateMonthFormatShort(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].dateMonthFormatShort;
}

export function getDateMonthFormatShortMoment(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].dateMonthFormatShortMoment;
}

export function getDateLongFormatMoment(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].dateLongFormatMoment;
}

export function getDateTimeFormat(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].dateTimeFormat;
}

export function getThousandsSeparatorSymbol(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].thousandsSeparatorSymbol;
}

export function getDecimalSymbol(locales: LocalesConfigInterface, lang: string): string {
  return locales[lang].decimalSymbol;
}
