import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { BasePaymentModule } from '@pe/checkout/payment';
import { SharedFinishModule, SharedModule } from '@pe/checkout/santander-de-pos/shared';


import {
  FinishEditContainerComponent,
} from './components';

@NgModule({
  imports: [
    CommonModule,
    FormUtilsModule,
    SharedFinishModule,
    FormsModule,
    SharedModule,
  ],
  declarations: [
    FinishEditContainerComponent,
  ],
})
export class SantanderDePosEditFinishModule extends BasePaymentModule {
  resolveFinishContainerComponent(): Type<FinishEditContainerComponent>{
    return FinishEditContainerComponent;
  }

  resolvePaymentDetailsStepContainerComponent(): null {
    return null;
  }
}
