import { Directive } from '@angular/core';

import { AbstractContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
} from '@pe/checkout/types';

@Directive()
export abstract class BaseContainerComponent extends AbstractContainerComponent {
  errorMessage: string = null;
  errors: ErrorInterface;
}
