import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';

import { AddressService } from './address.service';
import { nonRecompilableTestModuleHelper } from '../../../test';
import {
  I18nModule,
  TranslateStubService,
  CountryListInterface,
  COUNTRY_LIST,
  getCountryList,
  LocaleConstantsService,
  getContinentList,
  getCountryContinentList
} from '../../../i18n';
import { AddressInterface, CountryArrayInterface, SalutationEnum } from '../interfaces';

// tslint:disable-next-line no-var-requires
const countries: CountryListInterface = getCountryList(null);

describe('AddressService', () => {
  let service: AddressService;

  const preferredCountries: string[] = ['AT', 'GB', 'NO', 'SE'];

  // NOTE: using here mutated value to get ensure that
  // COUNTRY_LIST provider override is working
  const countriesMutated: CountryListInterface = Object.keys(countries)
    .slice(0, 5)
    .concat(preferredCountries)
    .reduce(
      (countriesMutated, countryCode) => {
        countriesMutated[countryCode] = countries[countryCode];
        return countriesMutated;
      },
      {}
    );

  const addressFixture: () => AddressInterface = () => ({
    city: 'FIXTURE_city',
    country: 'FIXTURE_country',
    country_name: 'FIXTURE_country_name',
    discr: 'FIXTURE_discr',
    extra_phone: 'FIXTURE_extra_phone',
    fax: 'FIXTURE_fax',
    first_name: 'FIXTURE_first_name',
    id: 123,
    last_name: 'FIXTURE_last_name',
    mobile_phone: 'FIXTURE_mobile_phone',
    phone: 'FIXTURE_phone',
    salutation: 'FIXTURE_salutation' as SalutationEnum,
    social_security_number: 'FIXTURE_social_security_number',
    street: 'FIXTURE_street',
    type: 'FIXTURE_type',
    zip_code: 'FIXTURE_zip_code',
  });

  nonRecompilableTestModuleHelper({
    imports: [
      I18nModule.forRoot()
    ],
    providers: [
      AddressService,
      TranslateStubService.provide(),
      { provide: COUNTRY_LIST, useValue: countriesMutated },
      { provide: LOCALE_ID, useValue: 'en-DE'},
      { provide: LocaleConstantsService, useValue: {
        getCountryList: () => countriesMutated,
        getContinentList,
        getCountryContinentList
      }}
    ]
  });

  beforeEach(() => service = TestBed.get(AddressService));

  describe('AddressService#countries', () => {
    it('return proper countries list', () => {
      expect(service.countries).toEqual(countriesMutated, 'Countries should be as expected');
    });
  });

  describe('AddressService#preferredCountries', () => {
    it('should return preferred countries', () => {
      expect(service.preferredCountries).toEqual(preferredCountries);
    });
  });

  describe('AddressService#countriesArray', () => {
    it('should return proper value', () => {
      const countriesMutatedList: CountryArrayInterface[] = Object.keys(countriesMutated)
        .filter(code => !preferredCountries.includes(code))
        .reduce(
          (list, code) => {
            list.push({
              code,
              name: countriesMutated[code]
            });
            return list;
          },
          []
        );
      expect(service.countriesArray).toEqual(countriesMutatedList);
    });
  });

  describe('AddressService#preferredCountriesArray', () => {
    it('should return proper value', () => {
      const preferredCountriesMutatedList: CountryArrayInterface[] = Object.keys(countriesMutated)
        .filter(code => preferredCountries.includes(code))
        .reduce(
          (list, code) => {
            list.push({
              code,
              name: countriesMutated[code]
            });
            return list;
          },
          []
        );
      expect(service.preferredCountriesArray).toEqual(preferredCountriesMutatedList);
    });
  });

  describe('AddressService#getNameString()', () => {
    it('should build proper string for full address', () => {
      const address: AddressInterface = addressFixture();
      const nameString: string = service.getNameString(address);
      const nameStringTarget: string =
        'salutation.FIXTURE_salutation FIXTURE_first_name FIXTURE_last_name';
      expect(nameString).toBe(nameStringTarget);
    });
  });

  describe('AddressService#getAddressString()', () => {
    it('should build proper address string', () => {
      const address: AddressInterface = {
        ...addressFixture(),
        country: preferredCountries[0]
      };
      const countryName: string = countriesMutated[address.country];
      const nameString: string = service.getAddressString(address);
      const nameStringTarget: string =
        `FIXTURE_street, FIXTURE_zip_code FIXTURE_city, ${countryName}`;
      expect(nameString).toBe(nameStringTarget);
    });
  });

  describe('AddressService#mutateAddress()', () => {
    it('should update address with new field', () => {
      const address: AddressInterface = addressFixture();
      const mutateKey: keyof AddressInterface = 'first_name';
      const mutateValue: string = 'MUTATED_first_name';
      const mutatedAddress: AddressInterface = service.mutateAddress(address, mutateKey, mutateValue);
      expect(address).toEqual(mutatedAddress, 'existing address should be mutated');
      expect(mutatedAddress).toBe(address, 'returned address should be instance of exists address');
    });
  });

});
