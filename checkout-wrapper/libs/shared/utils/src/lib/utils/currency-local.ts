import { MAP_CURRENCY_LOCAL } from '../constants';

export function currencyLocale(locale: string, currencyCode: string): string {
  return MAP_CURRENCY_LOCAL?.[currencyCode] ?? locale;
}
