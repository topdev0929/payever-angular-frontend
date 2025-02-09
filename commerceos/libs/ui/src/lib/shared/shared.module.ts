import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AutofocusDirective } from './input-autofocus.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AutofocusDirective,
  ],
  exports: [
    AutofocusDirective,
  ],
})
export class PeUISharedModule { }

