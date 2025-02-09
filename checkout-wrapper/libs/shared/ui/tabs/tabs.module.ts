import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CheckoutUiButtonModule } from '../button';

import { CheckoutUiTabComponent, CheckoutUiTabsComponent } from './components';


@NgModule({
  declarations: [
    CheckoutUiTabComponent,
    CheckoutUiTabsComponent,
  ],
  imports: [
    CommonModule,

    CheckoutUiButtonModule,
  ],
  exports: [
    CheckoutUiTabComponent,
    CheckoutUiTabsComponent,
  ],
})
export class CheckoutUiTabsModule {}
