import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { NodeOptionsErrorService, PaymentVariantService } from '@pe/checkout/payment';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiPaymentLogoModule } from '@pe/checkout/ui/payment-logo';
import { UtilsModule } from '@pe/checkout/utils';

import {
  ChoosePaymentComponent,
  CustomPoliciesComponent,
  ErrorFlowFinishedComponent,
  PaymentFeeComponent,
  ChoosePaymentStylesComponent,
  ChoosePaymentHeaderComponent,
} from './components';
import { DeviceDetectPaymentsService } from './services/device-payments.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatButtonModule,

    CheckoutUiPaymentLogoModule,

    UtilsModule,
    FormUtilsModule,
    UiModule,
  ],
  declarations: [
    ChoosePaymentComponent,
    CustomPoliciesComponent,
    ErrorFlowFinishedComponent,
    PaymentFeeComponent,
    ChoosePaymentStylesComponent,

    ChoosePaymentHeaderComponent,
  ],
  exports: [
    ChoosePaymentComponent,
  ],
  providers: [
    DeviceDetectPaymentsService,
    PaymentVariantService,
    NodeOptionsErrorService,
  ],
})
export class PaymentsChooseModule {
  resolveChoosePaymentMethodComponent(): Type<ChoosePaymentComponent> {
    return ChoosePaymentComponent;
  }
}
