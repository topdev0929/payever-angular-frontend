import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PebProductPickerComponent } from './product-picker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PebProductPickerDirective } from './product-picker.directive';
import { PebButtonModule } from '@pe/ui';
import { DateValidatorDirective } from '../create-invoice/data-valid-directive';

@NgModule({
  imports: [CommonModule, PebButtonModule, MatAutocompleteModule],
  declarations: [PebProductPickerComponent, PebProductPickerDirective, DateValidatorDirective],
  exports: [PebProductPickerComponent, PebButtonModule, PebProductPickerDirective],
})
export class PebProductPickerModule {}
