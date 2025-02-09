import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';

import { PebColorPickerComponent } from './color-picker.component';
import { PebColorPickerDirective } from './color-picker.directive';
import { PebColorPickerService } from './color-picker.service';
import { SliderDirective, TextDirective } from './helpers';

@NgModule({
  imports: [CommonModule, I18nModule],
  exports: [PebColorPickerDirective],
  providers: [PebColorPickerService],
  declarations: [PebColorPickerComponent, PebColorPickerDirective, TextDirective, SliderDirective],
})
export class PebColorPickerModule {
}
