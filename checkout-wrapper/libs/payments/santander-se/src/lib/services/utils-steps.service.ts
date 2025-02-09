import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FormOptionInterface, SelectOptionInterface } from '@pe/checkout/types';
import { CountryListInterface, LocaleConstantsService } from '@pe/checkout/utils';

import { FormOptionsInterface } from '../shared';

@Injectable()
export class UtilStepService {
  constructor(
    private localeConstantsService: LocaleConstantsService,
  ) {}

  getYesNoOptions(): FormOptionInterface[] {
    return [{
      label: $localize`:@@santander-se.boolean.no:`,
      value: false,
    }, {
      label: $localize`:@@santander-se.boolean.yes:`,
      value: true,
    }];
  }

  translateOptions(
    values: FormOptionInterface[],
    keysPool: { [key: string]: string },
  ): SelectOptionInterface[] {
    const valuesSet = new Set();
    const options: any = values.reduce((acc, item) => {
      if (!valuesSet.has(item.value)) {
        acc.push(item);
        valuesSet.add(item.value);
      }

      return acc;
    }, []).map((v) => {
      const key = v.value as keyof typeof keysPool;

      return {
        label: keysPool[key],
        value: v.value,
      };
    });

    return options as SelectOptionInterface[];
  }

  getCountries(withEmpty: boolean, nodeFormOptions: FormOptionsInterface): Observable<SelectOptionInterface[]> {
    const countriesPromise = this.localeConstantsService.getCountryList(this.localeConstantsService.getLang())();

    return from(countriesPromise).pipe(
      map(countries => this.mapCountries(countries, nodeFormOptions, { withEmpty })),
    );
  }

  private mapCountries(
    countries: CountryListInterface,
    nodeFormOptions: FormOptionsInterface,
    config?: { withEmpty: boolean },
  ) {
    // Some manipulations to make SE first in list
    let seCountry: SelectOptionInterface = null;
    const options = nodeFormOptions?.countryCodes.filter((c) => {
      if (c.value.toString().toUpperCase() === 'SE') {
        seCountry = {
          label: countries[String(c.value)],
          value: c.value,
        };

        return false;
      }

      return true;
    }).map(c => ({
        label: countries[String(c.value)],
        value: c.value,
      }));

    const result = [seCountry, ...options];
    if (config.withEmpty) {
      result.unshift({
        label: $localize`:@@santander-se.action.select_option:`,
        value: null,
      });
    }

    return result;
  }
}
