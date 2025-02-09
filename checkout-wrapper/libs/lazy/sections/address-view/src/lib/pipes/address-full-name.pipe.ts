import { Pipe, PipeTransform } from '@angular/core';

import { AddressInterface } from '@pe/checkout/types';
import { SALUTATION_TRANSLATION } from '@pe/checkout/utils';

@Pipe({ name: 'peAddressFullName' })
export class AddressFullNamePipe implements PipeTransform {

  transform(address: AddressInterface, hideSalutation = false): string {
    const salutation: string = address?.salutation && !hideSalutation
      ? SALUTATION_TRANSLATION[address.salutation]
      : null;

    return address
      ? [salutation, address.firstName, address.lastName].filter(v => !!v).join(' ')
      : '';
  }
}
