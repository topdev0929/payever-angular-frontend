import {
  Type,
 
  Directive,
} from '@angular/core';

import { AbstractPaymentEditContainerInterface } from './models';

@Directive()
export abstract class BasePaymentEditModule {
  abstract resolveEditContainerComponent(): Type<AbstractPaymentEditContainerInterface>;
}
