import {
  Type,
 
  Directive,
} from '@angular/core';

import { AbstractPaymentDetailsContainerInterface } from './models';

@Directive()
export abstract class BasePaymentSummaryModule {
  abstract resolvePaymentSummaryStepContainerComponent(): Type<AbstractPaymentDetailsContainerInterface>;
}
