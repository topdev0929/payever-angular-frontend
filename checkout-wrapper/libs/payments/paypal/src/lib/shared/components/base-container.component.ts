import { Directive } from '@angular/core';

import { ApiService } from '@pe/checkout/api';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import { ErrorInterface } from '@pe/checkout/types';

@Directive()
export class BaseContainerComponent extends AbstractContainerComponent {
  errorMessage: string = null;
  errors: ErrorInterface;

  protected apiService = this.injector.get(ApiService);
}
