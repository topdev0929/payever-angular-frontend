import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';

import { AddressModule } from '../../address/src/address.module';
import { FormCoreModule } from '../../form-core/form-core.module';
import {
  AutocompleteComponent,
  AutocompleteChipsComponent,
  AutocompleteGooglePlacesComponent
} from './components';
import { DividerModule } from '../../divider/src/divider.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

const shared: any = [
  AutocompleteComponent,
  AutocompleteChipsComponent,
  AutocompleteGooglePlacesComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    AddressModule,
    FormCoreModule,
    DividerModule,
    MatCheckboxModule,
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared
  ]
})
export class FormComponentsAutocompleteModule {}
