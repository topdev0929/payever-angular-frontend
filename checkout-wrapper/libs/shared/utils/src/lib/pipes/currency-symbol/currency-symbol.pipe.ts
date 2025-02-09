import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'peCurrencySymbol',
  pure: false,
})
export class CurrencySymbolPipe implements PipeTransform {

  private cleanOutputRE = /[-+,.\d\s]/g;

  constructor (
    private currencyPipe: CurrencyPipe,
  ) {}

  transform(currencyCode?: string, locale?: string): string {
    const formatted: string = this.currencyPipe.transform(9, currencyCode, 'symbol-narrow', undefined, locale);

    // this regex removes evetything about digit. It keeps only currency symbol
    return formatted.replace(this.cleanOutputRE, '');
  }

}
