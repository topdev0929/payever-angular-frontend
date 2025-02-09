import { getCountryList } from './get-country-list';
import { CountryListInterface } from '../interfaces';

describe('getCountryList', () => {
  const locales: string[] = ['de', 'es', 'nb', 'da', 'sv', 'en', 'unknown'];

  it('locales list for check should not be empty', () => {
    expect(locales.length).toBeGreaterThan(0);
  });

  locales.forEach(locale => {
    it(`should get country list for "${locale}" locale`, () => {
      const localizedCountryList: CountryListInterface = getCountryList(locale);
      expect(localizedCountryList).toBeTruthy();
      expect(typeof localizedCountryList).toBe('object');
      const counriesListCodes: string[] = Object.keys(localizedCountryList);
      expect(counriesListCodes.length).toBeGreaterThanOrEqual(locales.length);
    });
  });
});
