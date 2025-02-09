import {
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { StripeApiService } from '../services';

@Directive()
export class BaseContainerComponent
  extends AbstractPaymentContainerComponent
{
  errors: ErrorInterface;
  flow: FlowInterface;

  @Input() paymentMethod: PaymentMethodEnum;

  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter();

  protected apiService = this.injector.get(ApiService);
  protected nodeApiService = this.injector.get(NodeApiService);
  protected stripeApiService = this.injector.get(StripeApiService);
}
