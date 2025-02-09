import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SidebarCheckboxInput } from './checkbox.input';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SidebarCheckboxInput,
  ],
  exports: [
    SidebarCheckboxInput,
  ],
})
export class PebSidebarCheckboxModule {
}
