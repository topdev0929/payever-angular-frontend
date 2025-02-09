import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSidebarTextInput } from './text.input';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebSidebarTextInput,
  ],
  exports: [
    PebSidebarTextInput,
  ],
})
export class PebTextInputModule {
}
