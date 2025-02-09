import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { PaymentSummaryComponent } from './payment-summary.component';

@NgModule({
  declarations: [
    PaymentSummaryComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    PaymentSummaryComponent,
  ],
})
export class PaymentSummaryModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<PaymentSummaryComponent> {
    return PaymentSummaryComponent;
  }
}
