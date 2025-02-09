import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FileDropDirective } from './directives';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileDropDirective
  ],
  exports: [
    FileDropDirective
  ]
})
export class FileDropModule {
}
