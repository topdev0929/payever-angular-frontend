import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { AddressInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { loadCountries } from '@pe/checkout/utils/countries';

@Pipe({ name: 'peAddressLine' })
export class AddressLinePipe implements PipeTransform {

  constructor(
    private localeConstantsService: LocaleConstantsService,
  ) {}

  private countries$ = loadCountries(this.localeConstantsService.getLang() as any);


  transform(address: AddressInterface): Observable<string> {

    return this.countries$.pipe(
      filter(address => !!address),
      map(countries => address?.country && countries[address.country.toUpperCase() as keyof typeof countries]),
      map(country => address
        ? [address.zipCode, address.city, country ?? ''].filter(v => !!v).join(', ')
        : ''
      ),
    );
  }
}
