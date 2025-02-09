import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { PebCurrencySignPipe } from './currency-sign.pipe';


@Injectable({ providedIn: 'any' })
@Pipe({ name: 'priceWithCurrency' })
export class PebPriceWithCurrencyPipe implements PipeTransform {

  constructor(private currencySignPipe: PebCurrencySignPipe) {
  }

  transform(value: number, currencyCode: string, showCurrencySign = true): string {
    const currencySign = this.currencySignPipe.transform(currencyCode);

    return `${new Intl.NumberFormat(this.getLocaleByCurrency(currencyCode), {
      style: 'decimal',
      minimumIntegerDigits: 1,
      minimumFractionDigits: this.getMinimumFractionDigitsByCurrency(currencyCode),
      maximumFractionDigits: 2,
    }).format(value)}${showCurrencySign ? ` ${currencySign}` : ''}`;
  }

  private getLocaleByCurrency(currencyCode: string): string {
    if (currencyCode === 'EUR') {
      return 'de';
    }
    return 'en';
  }

  private getMinimumFractionDigitsByCurrency(currencyCode: string): number {
    switch (currencyCode) {
      case 'EUR':
        return 2;
      case 'USD':
        return 2;
      default:
        return 0;
    }
  }
}
