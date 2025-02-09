import { Injectable } from '@angular/core';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';

import { NodePaymentDetailsResponseInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);

  postPayment() {
    return this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>();
  }
}
