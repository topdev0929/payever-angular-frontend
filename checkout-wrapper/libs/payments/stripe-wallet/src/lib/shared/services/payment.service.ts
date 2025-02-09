import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { NodePaymentResponseDetailsInterface } from '../types';

import { StripeFlowService } from './stripe-flow.service';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);
  private stripeFlowService = this.injector.get(StripeFlowService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    return this.nodeFlowService.assignPaymentDetails({}).pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>().pipe(
        tap((response) => {
          this.stripeFlowService.postPayment(!!response);
        }),
      ))
    );
  }
}
