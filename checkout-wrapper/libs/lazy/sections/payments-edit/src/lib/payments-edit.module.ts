import { CommonModule } from '@angular/common';
import { Type, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { PaymentEditComponent } from './components';

@NgModule({
  declarations: [
    PaymentEditComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,

    UtilsModule,
    FormUtilsModule,
    UiModule,
  ],
  exports: [
    PaymentEditComponent,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class PaymentsEditModule {
  resolvePaymentEditComponent(): Type<PaymentEditComponent> {
    return PaymentEditComponent;
  }
}
