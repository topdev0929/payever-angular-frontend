import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AddressService, CountryArrayInterface } from '../../../../../modules/address';

@Component({
  selector: 'address-doc',
  templateUrl: 'address-doc.component.html'
})
export class AddressDocComponent {
  htmlExample: string =  require('raw-loader!./examples/address-service-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/address-service-example-basic.ts.txt');

  addressForm: FormGroup;
  preferredCountriesArray: CountryArrayInterface[];
  countriesArray: CountryArrayInterface[];

  constructor(
      private formBuilder: FormBuilder,
      private addressService: AddressService
  ) {
    this.preferredCountriesArray = this.addressService.preferredCountriesArray;
    this.countriesArray = this.addressService.countriesArray;
    this.addressForm = this.formBuilder.group({
      salutation: '',
      first_name: '',
      last_name: '',
      street: '',
      zip_code: '',
      city: '',
      country: ''
    });
  }

  get nameString(): string {
    return this.addressService.getNameString(this.addressForm.value);
  }

  get addressString(): string {
    return this.addressService.getAddressString(this.addressForm.value);
  }

}
