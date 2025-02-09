import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Type,
 
  NgModule,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import {
  RatesViewMicroContainerComponent,
} from './components';

@NgModule({
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
  declarations: [
    RatesViewMicroContainerComponent,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class PaymentsSummaryModule {
  resolvePaymentSummaryComponent(): Type<RatesViewMicroContainerComponent> {
    return RatesViewMicroContainerComponent;
  }
}
