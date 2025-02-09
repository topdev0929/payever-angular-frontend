import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { UtilStepService } from '../../services';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../../settings';
import {
  SantanderSeApiService,
  SantanderSeFlowService,
  SharedModule,
} from '../../shared';

import {
  ExposedPersonFormComponent,
  FinanceDetailsFormComponent,
  InquireAmlComponent,
  InquireAmlContainerComponent,
  PersonalFormComponent,
  SummaryAmlComponent,
} from './components';

@NgModule({
  declarations: [
    InquireAmlContainerComponent,
    InquireAmlComponent,
    PersonalFormComponent,
    ExposedPersonFormComponent,
    FinanceDetailsFormComponent,
    SummaryAmlComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    UtilsModule,
    SharedModule,

    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
  ],
  providers: [
    SantanderSeFlowService,
    SantanderSeApiService,
    UtilStepService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class SantanderSeInquiryAmlModule {
  resolveComponent(): Type<InquireAmlContainerComponent> {
    return InquireAmlContainerComponent;
  }
}

