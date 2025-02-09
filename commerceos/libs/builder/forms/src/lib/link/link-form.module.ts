import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSelectInputModule } from '@pe/builder/form-controls';

import { PebLinkFormComponent } from './link-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSelectInputModule,
  ],
  declarations: [
    PebLinkFormComponent,
  ],
  exports: [
    PebLinkFormComponent,
  ],
})
export class PebLinkFormModule {
}
