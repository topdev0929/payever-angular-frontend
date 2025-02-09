import { NgModule } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { LongDateFormatDirective } from './long-date-format.directive';
import { PeMatDatePickerValidationTool } from './mat-date-picker-validation.directive';
import { PeDatePickerMaskDirective } from './pe-date-picker-mask.directive';
import { ShortDateFormatDirective } from './short-date-format.directive';
@NgModule({
  declarations: [
    PeDatePickerMaskDirective,
    PeMatDatePickerValidationTool,
    LongDateFormatDirective,
    ShortDateFormatDirective,
  ],
  imports: [
    MatDatepickerModule,
  ],
  exports: [
    PeDatePickerMaskDirective,
    PeMatDatePickerValidationTool,
    LongDateFormatDirective,
    ShortDateFormatDirective,
    MatDatepickerModule,
  ],
})
export class CheckoutFormsDateModule {}
