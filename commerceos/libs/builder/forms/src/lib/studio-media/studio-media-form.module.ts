import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebStudioMediaFormComponent } from './studio-media.form';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebStudioMediaFormComponent,
  ],
  exports: [
    PebStudioMediaFormComponent,
  ],
  providers: [],
})
export class PebStudioMediaFormModule {
}
