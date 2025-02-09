import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebTextareaComponent } from './textarea.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebTextareaComponent,
  ],
  exports: [
    PebTextareaComponent,
  ],
})
export class PebTextareaModule {
}
