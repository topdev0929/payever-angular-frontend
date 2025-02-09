import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { I18nModule } from '@pe/i18n';
import { PebButtonModule, PebSelectModule } from '@pe/ui';

import { ActionProductPickerComponent } from './product-picker';
import { ActionProductPickerStylesComponent } from './styles/styles.component';

@NgModule({
  declarations: [
    ActionProductPickerComponent,
    ActionProductPickerStylesComponent,
  ],
  imports: [
    CommonModule,
    I18nModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    PebSelectModule,
    PebButtonModule,
  ],
  exports: [
    ActionProductPickerComponent,
  ],
})
export class ProductPickerModule { }
