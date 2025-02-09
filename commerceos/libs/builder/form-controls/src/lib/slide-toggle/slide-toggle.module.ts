import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSlideToggleComponent } from './slide-toggle.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebSlideToggleComponent,
  ],
  exports: [
    PebSlideToggleComponent,
  ],
})
export class PebSlideToggleModule {
}
