export const COUNTRIES = {
  de: () => import('i18n-iso-countries/langs/de.json').then(m => m.countries),
  es: () => import('i18n-iso-countries/langs/es.json').then(m => m.countries),
  nb: () => import('i18n-iso-countries/langs/nb.json').then(m => m.countries),
  no: () => import('i18n-iso-countries/langs/nb.json').then(m => m.countries),
  da: () => import('i18n-iso-countries/langs/da.json').then(m => m.countries),
  sv: () => import('i18n-iso-countries/langs/sv.json').then(m => m.countries),
  en: () => import('i18n-iso-countries/langs/en.json').then(m => m.countries),
  nl: () => import('i18n-iso-countries/langs/nl.json').then(m => m.countries),
  fr: () => import('i18n-iso-countries/langs/fr.json').then(m => m.countries),
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type Countries = Awaited<ReturnType<typeof COUNTRIES.de>>;
export type Locale = keyof typeof COUNTRIES;
