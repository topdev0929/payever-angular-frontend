import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebNumberInputSpinButtonsComponent } from './number-input-spinbutton.component';
import { PebNumberInputComponent } from './number-input.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  declarations: [
    PebNumberInputComponent,
    PebNumberInputSpinButtonsComponent,
  ],
  exports: [
    PebNumberInputComponent,
    PebNumberInputSpinButtonsComponent,
  ],
})
export class PebNumberInputModule {
}
