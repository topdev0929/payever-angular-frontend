import {
  Type,
  Directive,
  Injector,
} from '@angular/core';

import type { AbstractFinishContainer } from '@pe/checkout/finish';

@Directive()
export abstract class BasePaymentModule {
  constructor(
    protected injector: Injector,
  ) {}

  resolveFinishContainerComponent(): Type<AbstractFinishContainer> { return null }
}
