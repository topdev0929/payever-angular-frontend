import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { PebNumberInputModule } from '../number-input';

import { PebSizeInputComponent } from './size-input.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    PebNumberInputModule,
  ],
  declarations: [
    PebSizeInputComponent,
  ],
  exports: [
    PebSizeInputComponent,
  ],
})
export class PebSizeInputModule {
}
