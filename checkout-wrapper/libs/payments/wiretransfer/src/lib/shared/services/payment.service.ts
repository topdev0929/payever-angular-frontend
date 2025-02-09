import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  NodePaymentResponseInterface,
} from '@pe/checkout/types';

import { NodeAdditionalPaymentRequestInterface, NodePaymentDetailsResponseInterface } from '../types';


@Injectable()
export class PaymentService extends AbstractPaymentService {
  private nodeFlowService = this.injector.get(NodeFlowService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    const nodeAdditionalPaymentDetails: NodeAdditionalPaymentRequestInterface = {
      shopUserSession: this.flow.shopUserSession,
      posVerifyType: this.flow.posVerifyType,
    };
    this.nodeFlowService.assignPaymentDetails(nodeAdditionalPaymentDetails);

    return this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>();
  }
}
