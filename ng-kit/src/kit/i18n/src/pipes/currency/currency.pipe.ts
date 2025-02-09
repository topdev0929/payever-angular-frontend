import { Inject, Pipe, LOCALE_ID } from '@angular/core';
import { CurrencyPipe as BaseCurrencyPipe } from '@angular/common';

import { LocaleConstantsService } from '../../services';
import { registerLocaleData } from '../../lib';

/**
 * This is just wrapper around the CurrencyPipe.
 * It's added to fix problem with changing locale on fly.
 */
@Pipe({
  name: 'peCurrency',
  pure: false
})
export class CurrencyPipe extends BaseCurrencyPipe {

  constructor(@Inject(LOCALE_ID) locale: string,
              private localeConstantsService: LocaleConstantsService) {
    super(locale);
  }

  transform(value: any, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): string | null {
    locale = locale || this.localeConstantsService.getLocaleId();
    try {
      return super.transform(value, currencyCode, display, digitsInfo, locale);
    } catch (e) {
      console.warn('Error during transform. Trying to register locale data again.', e.toString());
      registerLocaleData(locale);
      return super.transform(value, currencyCode, display, digitsInfo, locale);
    }
  }
}
