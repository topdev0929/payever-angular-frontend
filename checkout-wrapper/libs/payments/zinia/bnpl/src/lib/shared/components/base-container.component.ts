import { Directive } from '@angular/core';

import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
  FlowInterface,
} from '@pe/checkout/types';

@Directive()
export abstract class BaseContainerComponent extends AbstractPaymentContainerComponent {
  errorMessage: string = null;
  errors: ErrorInterface;
  flow: FlowInterface;
}
