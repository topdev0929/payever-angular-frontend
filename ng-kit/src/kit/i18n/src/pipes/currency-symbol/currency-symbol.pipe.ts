import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '../currency/currency.pipe';

@Pipe({
  name: 'peCurrencySymbol',
  pure: false
})
export class CurrencySymbolPipe implements PipeTransform {

  private cleanOutputRE: RegExp = /[-+,.\d\s]/g;

  constructor (
    private currencyPipe: CurrencyPipe
  ) {}

  transform(currencyCode?: string, locale?: string): string {
    const formatted: string = this.currencyPipe.transform(9, currencyCode, 'symbol', undefined, locale);
    // this regex removes evetything about digit. It keeps only currency symbol
    return formatted.replace(this.cleanOutputRE, '');
  }

}
