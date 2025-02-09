// origin: https://github.com/owsolutions/amazing-time-picker
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PebTimePickerComponent } from './time-picker/time-picker.component';
import { PebTimePickerService } from './time-picker.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    PebTimePickerComponent,
  ],
  providers: [
    PebTimePickerService,
  ],
  exports: [
    PebTimePickerComponent,
  ],
})
export class PebTimePickerModule { }
