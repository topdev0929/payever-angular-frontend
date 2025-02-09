import { CountryListInterface } from '../interfaces';

export function getCountryList(localeId: string): CountryListInterface {
  // Please don't use call like:
  // > require(`i18n-iso-countries/langs/${localeId}.json`)
  // Because it make bundle size too big
  switch (localeId) {
    case 'de':
      return require(`i18n-iso-countries/langs/de.json`).countries;
    case 'es':
      return require(`i18n-iso-countries/langs/es.json`).countries;
    case 'nb':
    case 'no':
      return require(`i18n-iso-countries/langs/nb.json`).countries;
    case 'da':
      return require(`i18n-iso-countries/langs/da.json`).countries;
    case 'sv':
      return require(`i18n-iso-countries/langs/sv.json`).countries;
    default:
      return require(`i18n-iso-countries/langs/en.json`).countries;
  }
}
