import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentModule } from '@pe/checkout/payment';

import { SharedModule } from '../../shared';

import { InquiryContainerComponent } from './components';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    InquiryContainerComponent,
  ],
})
export class IvyChoosePaymentModule extends BasePaymentModule {
  resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
