import {
  Type,
 
  Directive,
} from '@angular/core';

import { AbstractFinishContainer } from '@pe/checkout/finish';

@Directive()
export abstract class BasePaymentFinishModule {
  abstract resolveFinishContainerComponent(): Type<AbstractFinishContainer>;
}
