export interface LocaleConfigInterface {
  name: string;
  dateFormatShort: string;
  dateFormatShortMoment: string;
  dateMonthFormatShort: string;
  dateMonthFormatShortMoment: string;
  dateLongFormatMoment: string;
  dateTimeFormat: string;
  thousandsSeparatorSymbol: string;
  decimalSymbol: string;
}

export interface LocalesConfigInterface {
  [key: string]: LocaleConfigInterface;
}
