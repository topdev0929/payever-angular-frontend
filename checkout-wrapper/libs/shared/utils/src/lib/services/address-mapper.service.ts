import { Injectable } from '@angular/core';

import { AddressInterface } from '@pe/checkout/types';

type OldAddressInterface = {
  country_name: string;
  extra_phone: string;
  first_name: string;
  last_name: string;
  social_security_number: string;
  street_name: string;
  street_number: string;
  mobile_phone: string;
  zip_code: string;
}
@Injectable()
export class AddressMapperService {
  mapAddress(address: OldAddressInterface): AddressInterface {
    return {
      ...address,
      countryName: address.country_name,
      extraPhone: address.extra_phone,
      firstName: address.first_name,
      lastName: address.last_name,
      socialSecurityNumber: address.social_security_number,
      streetName: address.street_name,
      streetNumber: address.street_number,
      mobilePhone: address.mobile_phone,
      zipCode: address.zip_code,
    };
  }
}
