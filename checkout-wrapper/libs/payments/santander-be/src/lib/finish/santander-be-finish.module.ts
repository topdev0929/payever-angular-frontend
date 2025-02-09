import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentFinishModule } from '@pe/checkout/payment';

import { SharedModule } from '../shared';

import { FinishContainerComponent } from './finish-container.component';

@NgModule({
  declarations: [
    FinishContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class SantanderBeFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
