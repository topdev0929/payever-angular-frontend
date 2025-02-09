import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { PaymentService } from '../shared';

import {
  AmlFormComponent,
  DetailsFormComponent,
  FormComponent,
  InquiryContainerComponent,
} from './components';

@NgModule({
  declarations: [
    FormComponent,
    AmlFormComponent,
    DetailsFormComponent,
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutUiTooltipModule,
  ],
  exports: [],
  providers: [
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class InquiryModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
