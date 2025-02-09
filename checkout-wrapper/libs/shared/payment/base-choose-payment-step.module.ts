import {
  Type,
 
  Directive,
} from '@angular/core';

import { AbstractContainerComponent } from './components';

@Directive()
export abstract class BaseChoosePaymentStepContainer {
  abstract resolveChoosePaymentStepContainerComponent(): Type<AbstractContainerComponent>;
}
