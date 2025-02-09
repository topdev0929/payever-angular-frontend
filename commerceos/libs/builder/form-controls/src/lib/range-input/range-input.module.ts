import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebRangeInputComponent } from './range-input.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebRangeInputComponent,
  ],
  exports: [
    PebRangeInputComponent,
  ],
})
export class PebRangeInputModule {
}
