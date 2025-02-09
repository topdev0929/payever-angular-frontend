import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { PebAutocompleteStylesComponent } from './autocomplete-styles.component';
import { PebAutocompleteComponent } from './autocomplete.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  declarations: [
    PebAutocompleteComponent,
    PebAutocompleteStylesComponent,
  ],
  exports: [
    PebAutocompleteComponent,
  ],
})
export class PebAutocompleteModule {
}
