import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { CheckoutUiButtonComponent } from './button.component';


@NgModule({
  declarations: [
    CheckoutUiButtonComponent,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
  ],
  exports: [
    CheckoutUiButtonComponent,
  ],
})
export class CheckoutUiButtonModule {}
