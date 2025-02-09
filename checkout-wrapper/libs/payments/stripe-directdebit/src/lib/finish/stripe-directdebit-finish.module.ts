import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { BasePaymentFinishModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { SharedModule } from '../shared';

import { FinishContainerComponent } from './finish-container.component';

@NgModule({
  declarations: [
    FinishContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    UtilsModule,
    SharedModule,
  ],
})
export class StripeDirectdebitFinishModule extends BasePaymentFinishModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
