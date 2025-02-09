import { registerLocaleData } from '@angular/common';
import { APP_INITIALIZER, LOCALE_ID, Provider } from '@angular/core';
import * as dayjs from 'dayjs';

export const LOCALE_MAPPER: { [key: string]: () => Promise<any> } = {
  en: () => import('@angular/common/locales/en'),
  no: () => import('@angular/common/locales/nb'),
  dk: () => import('@angular/common/locales/da'),
  da: () => import('@angular/common/locales/da'),
  de: () => import('@angular/common/locales/de'),
  es: () => import('@angular/common/locales/es'),
  sv: () => import('@angular/common/locales/sv'),
  fr: () => import('@angular/common/locales/fr'),
  nl: () => import('@angular/common/locales/nl'),
};

const DAYJS_LOCALE_MAPPER: { [key: string]: () => Promise<any> } = {
  en: () => import('dayjs/locale/en-gb'),
  no: () => import('dayjs/locale/nb'),
  dk: () => import('dayjs/locale/da'),
  da: () => import('dayjs/locale/da'),
  de: () => import('dayjs/locale/de'),
  es: () => import('dayjs/locale/es'),
  sv: () => import('dayjs/locale/sv'),
  fr: () => import('dayjs/locale/fr'),
  nl: () => import('dayjs/locale/nl'),
};

export const customLocale: Provider = {
  provide: APP_INITIALIZER,
  deps: [LOCALE_ID],
  multi: true,
  useFactory: (localeId: string) =>
    () => LOCALE_MAPPER
      ?.[localeId]?.()
      ?.then(locale => registerLocaleData(locale.default, localeId)),
};

export const dayJsLocale: Provider = {
  provide: APP_INITIALIZER,
  deps: [LOCALE_ID],
  multi: true,
  useFactory: (localeId: string) =>
    () => DAYJS_LOCALE_MAPPER[localeId in DAYJS_LOCALE_MAPPER ? localeId : 'en']()
      .then(locale => dayjs.locale(locale.default.name)),
};
