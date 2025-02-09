import { Directive } from '@angular/core';

import { ApiService } from '@pe/checkout/api';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
  FlowInterface,
} from '@pe/checkout/types';

@Directive()
export class BaseContainerComponent extends AbstractContainerComponent {

  errorMessage: string = null;
  errors: ErrorInterface;
  flow: FlowInterface;

  protected apiService: ApiService = this.injector.get(ApiService);

}
