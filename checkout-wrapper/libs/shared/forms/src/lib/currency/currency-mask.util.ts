import { NumberSymbol, getLocaleNumberSymbol } from '@angular/common';

import { currencyLocale } from '@pe/checkout/utils';

function getCurrencySeparators(locale: string, currencyCode: string) {
  return {
    decimalSeparator: getLocaleNumberSymbol(currencyLocale(locale, currencyCode), NumberSymbol.Decimal),
    thousandsSeparator: getLocaleNumberSymbol(currencyLocale(locale, currencyCode), NumberSymbol.Group),
  };
}


export function currencyMaskFn(
  value: string | number,
  currencyCode: string,
  locale: string
): string {
  if (value === null || value === undefined) {
    return '';
  }

  const { decimalSeparator, thousandsSeparator } = getCurrencySeparators(locale, currencyCode);
  const stringValue = value.toString();
  const detectedDecimalSeparator = typeof value === 'number' ? '.' : decimalSeparator;
  const valueParts = stringValue.split(detectedDecimalSeparator);
  const integerPart = valueParts[0];
  const decimalPart = valueParts[1] || '';
  const hasDecimal = !!new RegExp(`[${detectedDecimalSeparator}]`).exec(stringValue);

  const formattedIntegerPart = integerPart.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  const formattedDecimalPart = decimalPart.replace(/\D/g, '').slice(0, 2);

  return `${formattedIntegerPart}`
    + (hasDecimal
      ? `${decimalSeparator}${formattedDecimalPart}`
      : '');
}

export function currencyUnmaskFn(
  value: string,
  currencyCode: string,
  locale: string
): number {
  const { decimalSeparator, thousandsSeparator } = getCurrencySeparators(locale, currencyCode);
  const rg = new RegExp(`[^\\d${decimalSeparator.replace('.', '\\.')}]+`, 'g');
  const valueParts = value.replace(rg, '').split(decimalSeparator);
  const integerPart = valueParts[0].replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
  const decimalPart = valueParts[1] || '';

  const stringValue = `${integerPart}` + (Number(decimalPart) > 0 ? `.${decimalPart.slice(0, 2)}` : '');

  return stringValue ? parseFloat(stringValue) : null;
}

