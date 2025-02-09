import { Directive, Type } from '@angular/core';

import { AbstractFlowIdComponent } from '@pe/checkout/core';

@Directive()
export abstract class AbstractSelectorModule {
  abstract resolveComponent(): Type<AbstractFlowIdComponent>;
}
