import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorComponent } from './error.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ErrorComponent
  ],
  entryComponents: [ ErrorComponent ],
  exports: [ ErrorComponent ]
})
export class ErrorModule {}
