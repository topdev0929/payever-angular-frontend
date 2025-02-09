import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { LocaleConstantsService } from '../../services';
import { currencyLocale } from '../../utils/currency-local';

@Pipe({
  name: 'peCurrency',
  pure: false,
})
export class PeCurrencyPipe implements PipeTransform {

  constructor (
    private currencyPipe: CurrencyPipe,
    private localeConstantsService: LocaleConstantsService
  ) {}

  transform(
    value: number,
    currencyCode?: string,
    symbol = 'symbol-narrow',
    digits = '1.2-2',
    locale: string = this.localeConstantsService.getLang(),
  ): string {
    return this.currencyPipe.transform(value, currencyCode, symbol, digits, currencyLocale(locale, currencyCode));
  }
}
