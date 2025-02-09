import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebAnglePickerComponent } from './angle-picker.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebAnglePickerComponent,
  ],
  exports: [
    PebAnglePickerComponent,
  ],
})
export class PebAnglePickerModule {
}
