import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebBorderStyleFormComponent } from './border-style-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebBorderStyleFormComponent,
  ],
  exports: [
    PebBorderStyleFormComponent,
  ],
})
export class PebBorderStyleFormModule {
}
