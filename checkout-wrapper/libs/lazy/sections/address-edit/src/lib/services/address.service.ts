import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FlowState } from '@pe/checkout/store';
import { AddressInterface, P2P_PAYMENTS } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { loadCountries } from '@pe/checkout/utils/countries';

import { Locale, PREFERRED_COUNTRIES_LIST } from '../constants';

import { AddressApiService } from './address-api.service';

export type SortedCountries = { label: string; value: string }[];

@Injectable()
export class AddressService {

  private readonly store = inject(Store);
  private readonly api = inject(AddressApiService);
  private readonly localeConstantsService = inject(LocaleConstantsService);

  public getCompany(data: { company: string; country: string; }) {
    const { paymentOptions } = this.store.selectSnapshot(FlowState.flow);
    const paymentOption = paymentOptions.find(o => P2P_PAYMENTS.includes(o.paymentMethod));
    const connectionId = paymentOption?.connections?.[0]?.id;

    return this.api.getCompany(connectionId, {
      address: {
        country: data.country,
      },
      company: {
        name: data.company,
      },
    });
  }

  public getAddresses(search: string) {
    return this.api.getAddresses(search);
  }

  public getCountries(locale?: Locale): Observable<SortedCountries> {
    const language = locale || this.localeConstantsService.getLang() as Locale;

    return loadCountries(language).pipe(
      map((countries) => {
        const sorted = Object.entries(countries).reduce((acc, [key, value]) => {
          if (PREFERRED_COUNTRIES_LIST.includes(key)) {
            acc.preferred.push({ label: value, value: key });
          } else {
            acc.rest.push({ label: value, value: key });
          }

          return acc;
        },
        { preferred: [], rest: [] });


        return sorted.preferred.concat(sorted.rest);
      }),
    );
  }

  public parseFullAddress(
    {
      street,
      streetName,
      streetNumber,
      city,
      country,
      zipCode,
    }: AddressInterface,
    countriesOptions: SortedCountries,
  ): string {
    const countryName = countriesOptions.find(item => item.value === country)?.label || country;
    const streetParsed = streetName ? ` ${streetName} ${streetNumber ?? ''}` : null;

    return [street || streetParsed, city, zipCode, countryName].filter(Boolean).join(', ').trim();
  }
}
