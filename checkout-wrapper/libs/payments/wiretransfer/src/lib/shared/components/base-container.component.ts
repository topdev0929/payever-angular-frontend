import { Directive } from '@angular/core';

import { ApiService } from '@pe/checkout/api';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import { ErrorInterface } from '@pe/checkout/types';

@Directive()
export class BaseContainerComponent extends AbstractContainerComponent {
  errors: ErrorInterface;

  protected apiService: ApiService = this.injector.get(ApiService);
}
