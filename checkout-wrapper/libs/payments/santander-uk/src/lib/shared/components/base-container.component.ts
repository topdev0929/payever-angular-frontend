import { Directive, Input } from '@angular/core';

import { AbstractContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { NodePaymentResponseDetailsInterface } from '../types';

@Directive()
export abstract class BaseContainerComponent extends AbstractContainerComponent {
  errorMessage: string = null;
  errors: ErrorInterface;
  flow: FlowInterface;
  nodeResult: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

  @Input() paymentMethod: PaymentMethodEnum;

}
