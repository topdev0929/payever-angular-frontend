import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';

import { PaymentService, SharedFinishModule } from '../shared';

import { FinishContainerComponent } from './components';


@NgModule({
  declarations: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
    SharedFinishModule,
    FormsModule,
  ],
  exports: [
    FinishContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SantanderDePosFinishModule extends BasePaymentModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent>{
    return FinishContainerComponent;
  }
}
