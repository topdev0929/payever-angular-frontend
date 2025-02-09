import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DialogModule } from '@pe/checkout/dialog';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';
import { UtilsModule } from '@pe/checkout/utils';

import { UtilStepService } from '../../services';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../../settings';
import { SantanderSeApiService, SantanderSeFlowService, SharedModule } from '../../shared';

import { HouseholdFormComponent, InquireEbaComponent, ExistingLoansFormComponent } from './components';


@NgModule({
  declarations: [
    InquireEbaComponent,
    HouseholdFormComponent,
    ExistingLoansFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    DialogModule,
    UtilsModule,
    SharedModule,

    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    CheckoutUiTooltipModule,
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
export class SantanderSeInquiryEbaModule {
  resolveComponent(): Type<InquireEbaComponent> {
    return InquireEbaComponent;
  }
}

