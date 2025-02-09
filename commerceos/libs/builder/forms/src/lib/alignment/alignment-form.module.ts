import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSelectInputModule } from '@pe/builder/form-controls';

import { PebAlignmentForm } from './alignment-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSelectInputModule,
  ],
  declarations: [
    PebAlignmentForm,
  ],
  exports: [
    PebAlignmentForm,
  ],
})
export class PebAlignmentFormModule {
}
