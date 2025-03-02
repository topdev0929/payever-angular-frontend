import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { I18nModule } from '@pe/i18n';

import { PebButtonModule } from '../button/button.module';
import { PebFormFieldInputModule } from '../form-field-input';

import { PePickerComponent } from './picker';
import { PePickerDirective } from './picker.directive';

@NgModule({
  imports: [CommonModule, MatAutocompleteModule, PebButtonModule, I18nModule, PebFormFieldInputModule],
  declarations: [PePickerComponent, PePickerDirective],
  exports: [PePickerComponent, PePickerDirective, PebButtonModule],
})
export class PePickerModule {}
