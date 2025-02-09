import { Injectable, Pipe, PipeTransform } from '@angular/core';


@Injectable({ providedIn: 'any' })
@Pipe({ name: 'currencySign' })
export class PebCurrencySignPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return undefined;
    }

    let sign: string;

    switch (value) {
      case 'EUR':
        sign = '€';
        break;
      case 'USD':
        sign = '$';
        break;
      case 'GBP':
        sign = '£';
        break;
      case 'SEK':
        sign = 'kr';
        break;
      case 'DKK':
        sign = 'Kr.';
        break;
      case 'NOK':
        sign = 'kr';
        break;
      default:
        sign = value;
    }

    return sign;
  }
}
