import { Directive } from '@angular/core';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import { ErrorInterface } from '@pe/checkout/types';

@Directive()
export abstract class BaseContainerComponent extends AbstractContainerComponent {

  errorMessage: string = null;
  errors: ErrorInterface;

  protected apiService = this.injector.get(ApiService);
  protected nodeApiService = this.injector.get(NodeApiService);

}
