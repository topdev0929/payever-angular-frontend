import { Inject, Injectable } from '@angular/core';
import { forOwn } from 'lodash-es';

import {
  TranslateService,
  LocaleConstantsService,
  CountryListInterface,
  ContinentListInterface
} from '../../../i18n';
import {
  SelectOptionInterface
} from '../../../form-components/select/interfaces';
import { AddressInterface, ContinentArrayInterface, CountryArrayInterface, CountryContinentArrayInterface } from '../interfaces';

import * as settings from '../settings';

@Injectable()
export class AddressService {

  private preferredCountriesList: string[] = settings.PREFERRED_COUNTRIES_LIST
    .filter(countryCode => this.localeConstantsService.getCountryList()[countryCode]);
  private countriesArrayList: CountryArrayInterface[];
  private preferredCountriesArrayList: CountryArrayInterface[];
  private pContinentList: ContinentArrayInterface[];
  private pCountryContinentArray: {
    [key: string]: CountryContinentArrayInterface[]
  } = {};
  private pPreferredCountryContinentArray: CountryContinentArrayInterface[];

  constructor(
      private translateService: TranslateService,
      private localeConstantsService: LocaleConstantsService
  ) {
    this.countriesArrayList = [];
    this.pContinentList = this.localeConstantsService.getContinentList().map((continent: ContinentListInterface) => {
      return {
        code: continent.code,
        name: this.translateService.translate(`ng_kit.continents.${continent.code}`)
      };
    });

    this.preferredCountriesArrayList = this.preferredCountriesList.map((code: string) => {
        return {
          code: code as string,
          name: this.localeConstantsService.getCountryList()[code] as string
        };
      });
    forOwn(this.localeConstantsService.getCountryList(), (name: string, code: string): void => {
      if ( this.preferredCountriesList.indexOf(code) === -1 ) {
        this.countriesArrayList.push({
          code: code as string,
          name: name as string
        });
      }
    });

    this.pPreferredCountryContinentArray = this.preferredCountriesArrayList.map((country: CountryArrayInterface) => {
      return {
        code: country.code as string,
        name: country.name as string,
        continent: this.localeConstantsService.getCountryContinentList()[country.code] as string
      };
    });
  }

  get countries(): CountryListInterface {
    return this.localeConstantsService.getCountryList();
  }

  get continents(): ContinentArrayInterface[] {
    return this.pContinentList;
  }

  get preferredCountries(): string[] {
    return this.preferredCountriesList;
  }

  get countriesArray(): CountryArrayInterface[] {
    return this.countriesArrayList;
  }

  get preferredCountriesArray(): CountryArrayInterface[] {
    return this.preferredCountriesArrayList;
  }

  get countriesContinent(): CountryContinentArrayInterface[] {
    const lang: string = this.localeConstantsService.getLang();
    return this.pCountryContinentArray[lang] ||
      (this.pCountryContinentArray[lang] = this.getCountryContinent());
  }

  get preferredCountryContinentArray(): CountryContinentArrayInterface[] {
    return this.pPreferredCountryContinentArray;
  }

  get countriesFormOptions(): SelectOptionInterface[] {
    const countries: CountryArrayInterface[] = this.preferredCountriesArray.concat(this.countriesArray);
    return countries.map((country: CountryArrayInterface) => {
      return {
        label: country.name,
        value: country.code
      };
    });
  }

  getNameString(address: AddressInterface): string {
    let nameString: string = '';
    if (address) {
      if (address.salutation) {
        nameString += this.translateService.translate(`salutation.${address.salutation}`);
      }
      if (address.first_name) {
        nameString += ` ${address.first_name}`;
      }
      if (address.last_name) {
        nameString += ` ${address.last_name}`;
      }
    }
    return nameString;
  }

  getAddressString(address: AddressInterface): string {
    let addressString: string = '';

    if (address) {
      addressString = address.street || '';

      if (address.zip_code) {
        addressString += `${addressString ? ', ' : ''}${address.zip_code}`;
      }

      if (address.city) {
        addressString = addressString
          ? `${addressString}${address.zip_code ? ' ' : ', '}${address.city}`
          : address.city;
      }

      if (address.country && address.country !== 'Country') {
        addressString += `${addressString ? ', ' : ''}${this.localeConstantsService.getCountryList()[address.country]}`;
      }
    }

    return addressString;
  }

  mutateAddress(
    address: AddressInterface = {},
    fieldName: keyof AddressInterface,
    value: string | number
  ): AddressInterface {
    address[fieldName] = value as any;
    return address;
  }

  private getCountryContinent(): CountryContinentArrayInterface[] {
    const pCountryContinentArray: CountryContinentArrayInterface[] = [];
    forOwn(this.localeConstantsService.getCountryList(), (name: string, code: string): void => {
      pCountryContinentArray.push({
        code: code as string,
        name: name as string,
        continent: this.localeConstantsService.getCountryContinentList()[code] as string
      });
    });
    return pCountryContinentArray;
  }

}
