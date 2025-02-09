import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonCancelComponent } from './button-cancel.component';

@NgModule({
  declarations: [ButtonCancelComponent],
  imports: [
    CommonModule,
  ],
  exports: [ButtonCancelComponent],
})
export class CheckoutUiButtonCancelModule {}
