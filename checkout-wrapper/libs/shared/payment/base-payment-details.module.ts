import {
  Type,
 
  Directive,
} from '@angular/core';

import { AbstractPaymentDetailsContainerInterface } from './models';

@Directive()
export abstract class BasePaymentDetailsModule {
  abstract resolvePaymentDetailsStepContainerComponent(): Type<AbstractPaymentDetailsContainerInterface>;
}
