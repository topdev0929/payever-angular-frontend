import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { PebDefaultLanguages } from '@pe/builder/core';
import { DEFAULT_LOCALE, TranslateService } from '@pe/i18n-core';


@Injectable({ providedIn: 'any' })
@Pipe({ name: 'rendererTranslate' })
export class PebRendererTranslatePipe implements PipeTransform {
  constructor(
    private translateService: TranslateService,
  ) {
  }

  transform(value: string, options?: any): string {
    if (!value) {
      return '';
    }
    const key = value.toLowerCase();
    const localeData = PebDefaultLanguages[options.language];
    if (localeData && this.translateService.hasTranslation(key, localeData.key)) {
      return this.translateService.translate(key, undefined, localeData.key);
    }

    const defaultLocaleData = PebDefaultLanguages[options.defaultLanguage];
    if (defaultLocaleData && this.translateService.hasTranslation(key, defaultLocaleData.key)) {
      return this.translateService.translate(key, undefined, defaultLocaleData.key);
    }

    return this.translateService.translate(key, undefined, DEFAULT_LOCALE);
  }
}
