import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { PeInvoiceAutocompleteComponent } from './invoice-autocomplete.component';


@NgModule({
  declarations: [ PeInvoiceAutocompleteComponent ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatAutocompleteModule
  ],
  exports: [ PeInvoiceAutocompleteComponent ]
})
export class PeInvoiceAutocompleteModule {}
