import { NgModule } from '@angular/core';

import { AddressAutocompleteDirective } from './address-autocomplete.directive';
import { AddressAutocompleteService } from './address-autocomplete.service';

@NgModule({
  declarations: [
    AddressAutocompleteDirective,
  ],
  exports: [
    AddressAutocompleteDirective,
  ],
  providers: [
    AddressAutocompleteService,
  ],
})
export class CheckoutAddressAutocompleteModule { }
