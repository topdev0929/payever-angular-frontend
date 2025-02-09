import { Observable, from } from 'rxjs';

import { COUNTRIES, Countries, Locale } from './countries.constant';

export function loadCountries(locale: Locale): Observable<Countries> {
  let countries: () => Promise<Countries>;
  try {
    countries = COUNTRIES[locale];
  } catch (e) {
    countries = COUNTRIES.en;
  }

  return from(countries());
}

export * from './preferred-countries.constant';
export { Countries, Locale } from './countries.constant';
