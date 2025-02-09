import { keys } from 'lodash-es';
import { DEFAULT_LANG } from '../constants';
import { I18nConfig } from '../interfaces';
import { getLangList } from './get-locales';

if ((window as any)['global'] === undefined) {
  (window as any)['global'] = window; // To make work locale2 lib
}

const defaultLocaleKey: string = 'pe_current_locale';
const allowedLocales: string[] = [];

// This line can be replaced during post build script bin/micro-locale-custom-key.js
const peLocaleStorageReplaceKey: string = '___PE_CUSTOM_LOCALE_KEY___';
// This line will be NOT replaced to use it for check
const peLocaleStorageCheckKey: string = String('___[[PE_CUSTOM_LOCALE_KEY]]___').replace('[[', '').replace(']]', '');

function getLocaleKey(): string {
  return peLocaleStorageReplaceKey === peLocaleStorageCheckKey ? defaultLocaleKey : peLocaleStorageReplaceKey;
}

export function getLang(config: I18nConfig): string {
  let locale: string = (document.documentElement.lang || DEFAULT_LANG).split('-')[0].toLowerCase();
  if (config.useStorageForLocale) {
    let browserLocale: string = (require('locale2') || '').split('-')[0].toLowerCase();
    browserLocale = getLangList()[browserLocale] ? browserLocale : null;
    locale = retrieveLocale() || browserLocale || locale;
    saveLocale(locale);
  }
  return locale;
}

export function saveLocale(locale: string): void {
  const langs = getLangList();
  if (keys(langs).indexOf(locale) < 0) {
    console.error('Locale is not allowed!', locale, langs);
    console.trace();
    debugger;
  }
  try {
    if (window.localStorage) {
      window.localStorage.setItem(getLocaleKey(), locale);
    }
  } catch (e) {
    console.error('Cant save locale to localStorage', !!localStorage, e);
  }
}

export function retrieveLocale(): string {
  try {
    return window.localStorage
      ? (window.localStorage.getItem(getLocaleKey()) || window.localStorage.getItem(defaultLocaleKey))
      : '';
  } catch (e) {
    console.error('Cant retrieve locale from localStorage', !!localStorage, e);
  }
  return null;
}
