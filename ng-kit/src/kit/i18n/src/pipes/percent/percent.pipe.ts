import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { PercentPipe as BasePercentPipe } from '@angular/common';

import { LocaleConstantsService } from '../../services';
import { registerLocaleData } from '../../lib';

/**
 * This is just wrapper around the PercentPipe.
 * It's added to fix problem with changing locale on fly.
 */
@Pipe({
  name: 'pePercent',
  pure: false
})
export class PercentPipe extends BasePercentPipe {

  constructor(@Inject(LOCALE_ID) locale: string,
              private localeConstantsService: LocaleConstantsService) {
    super(locale);
  }

  transform(value: any, digitsInfo?: string, locale?: string): string | null {
    locale = locale || this.localeConstantsService.getLocaleId();
    try {
      return super.transform(value, digitsInfo, locale);
    } catch (e) {
      console.warn('Error during transform. Trying to register locale data again.', e.toString());
      registerLocaleData(locale);
      return super.transform(value, digitsInfo, locale);
    }
  }
}
