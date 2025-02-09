import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { NodePaymentDetailsInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsInterface>> {
    return this.nodeFlowService.postPayment<NodePaymentDetailsInterface>();
  }
}
