import { NgModule } from '@angular/core';
import { AutocompleteDocComponent } from './autocomplete-doc.component';
import {
  AutocompleteCustomObjectExampleDocComponent,
  AutocompleteDefaultExampleDocComponent,
  AutocompleteGooglePlacesExampleDocComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FormComponentsAutocompleteModule } from '../../../../kit/form';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsAutocompleteModule
  ],
  declarations: [
    AutocompleteDocComponent,
    AutocompleteCustomObjectExampleDocComponent,
    AutocompleteDefaultExampleDocComponent,
    AutocompleteGooglePlacesExampleDocComponent
  ]
})
export class AutocompleteDocModule {
  
}
