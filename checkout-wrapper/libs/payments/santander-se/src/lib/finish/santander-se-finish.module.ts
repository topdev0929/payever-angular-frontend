import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentFinishModule } from '@pe/checkout/payment';

import { SharedModule } from '../shared';

import { FinishContainerComponent } from './components';


@NgModule({
  declarations: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    FinishContainerComponent,
  ],
})
export class SantanderSeFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent>{
    return FinishContainerComponent;
  }
}
