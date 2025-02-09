import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractFinishContainer } from '@pe/checkout/finish';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { BasePaymentFinishModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { SharedModule } from '../../shared';

import { FinishContainerComponent } from './components';

@NgModule({
  declarations: [FinishContainerComponent],
  imports: [
    CommonModule,

    FormUtilsModule,
    UtilsModule,
    SharedModule,
  ],
  exports: [FinishContainerComponent],
})
export class IvyFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<AbstractFinishContainer> {
    return FinishContainerComponent;
  }
}
