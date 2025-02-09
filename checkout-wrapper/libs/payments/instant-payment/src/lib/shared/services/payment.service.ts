import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { FlowInterface, NodePaymentResponseInterface, PaymentStatusEnum } from '@pe/checkout/types';

import { NodeAdditionalPaymentDetailsInterface, NodePaymentDetailsResponseInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    return this.preparePayment(this.flow).pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>().pipe(
        filter(response => !!response.paymentDetails.wizardSessionKey
          && response.payment.status === PaymentStatusEnum.STATUS_NEW
        ),
      ))
    );
  }

  private preparePayment(flow: FlowInterface): Observable<any> {
    const nodeAdditionalPaymentDetails: NodeAdditionalPaymentDetailsInterface = {};
    nodeAdditionalPaymentDetails.recipientHolder = flow.businessName;
    nodeAdditionalPaymentDetails.recipientIban = flow.businessIban;

    return this.nodeFlowService.assignPaymentDetails(nodeAdditionalPaymentDetails);
  }
}
