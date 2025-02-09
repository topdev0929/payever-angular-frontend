import { NgModule } from '@angular/core';

import { AddressDocComponent } from './address-doc.component';
import { GoogleAutocompleteDirectiveDocComponent } from './google-autocomplete-directive-doc.component';
import { GoogleAutocompleteServiceDocComponent } from './google-autocomplete-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    DocComponentSharedModule
  ],
  declarations: [
    AddressDocComponent,
    GoogleAutocompleteDirectiveDocComponent,
    GoogleAutocompleteServiceDocComponent
  ]
})
export class AddressDocModule {
}
