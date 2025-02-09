import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SidebarFileInput } from './file.input';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SidebarFileInput,
  ],
  exports: [
    SidebarFileInput,
  ],
})
export class PebSidebarFileInputModule {
}
