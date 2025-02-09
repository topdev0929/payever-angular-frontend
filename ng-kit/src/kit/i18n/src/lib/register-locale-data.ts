import { registerLocaleData as ngRegisterLocaleData } from '@angular/common';

import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import localeEs from '@angular/common/locales/es';
import localeNb from '@angular/common/locales/nb';
import localeDa from '@angular/common/locales/da';
import localeSv from '@angular/common/locales/sv';

export function registerLocaleData(lang: string): void {
  let currentLocale: any;

  switch (lang) {
    case 'de':
      currentLocale = localeDe;
      break;
    case 'es':
      currentLocale = localeEs;
      break;
    case 'nb':
    case 'no':
      currentLocale = localeNb;
      break;
    case 'da':
      currentLocale = localeDa;
      break;
    case 'sv':
      currentLocale = localeSv;
      break;
    default:
      currentLocale = localeEn;
  }

  ngRegisterLocaleData(currentLocale);
}
