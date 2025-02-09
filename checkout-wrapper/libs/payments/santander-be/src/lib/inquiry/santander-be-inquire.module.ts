import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { SharedModule } from '../shared';

import { InquiryContainerComponent } from './inquiry-container.component';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class SantanderBeInquiryModule {
  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
