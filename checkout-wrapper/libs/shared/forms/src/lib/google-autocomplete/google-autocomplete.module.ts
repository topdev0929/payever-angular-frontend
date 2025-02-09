import { NgModule } from '@angular/core';

import { GoogleAutocompleteDirective } from './google-autocomplete.directive';

@NgModule({
  declarations: [
    GoogleAutocompleteDirective,
  ],
  exports: [
    GoogleAutocompleteDirective,
  ],
})
export class CheckoutFormsAutocompleteModule { }
