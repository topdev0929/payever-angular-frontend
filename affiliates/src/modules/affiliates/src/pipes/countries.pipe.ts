import { Pipe, PipeTransform } from '@angular/core';
import { LocaleConstantsService } from '@pe/i18n';

@Pipe({
  name: 'countries',
})
export class CountriesPipe implements PipeTransform {
  countries = [];
  constructor(private localConstantsService: LocaleConstantsService) {}

  transform(countryCodes: string[]) {
    this.getCountries();
    let countryString = '';
    countryCodes.forEach((code, index) => {
      if (index === countryCodes.length - 1) {
        countryString = `${countryString}${this.countries[this.countries.findIndex(element => element.value === code)].label}`;
        return;
      }
      countryString = `${countryString}${this.countries[this.countries.findIndex(element => element.value === code)].label}, `;
    });

    return countryString;
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }
}
