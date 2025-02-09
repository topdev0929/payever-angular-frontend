import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { PollUpdatePayment } from '@pe/checkout/store';
import {
  NodePaymentResponseInterface,
  PaymentStatusEnum,
} from '@pe/checkout/types';

import { NodeAdditionalPaymentDetailsInterface, NodePaymentDetailsResponseInterface } from '../types';


@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    const nodeAdditionalPaymentDetails: NodeAdditionalPaymentDetailsInterface = {};
    nodeAdditionalPaymentDetails.dynamicDescriptor = this.flow.extra?.dynamic_descriptor;
    this.nodeFlowService.assignPaymentDetails(nodeAdditionalPaymentDetails);

    return this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>().pipe(
      switchMap(() =>
        this.store.dispatch(new PollUpdatePayment(
          Object.values(PaymentStatusEnum).filter(status => status !== PaymentStatusEnum.STATUS_IN_PROCESS))
        ),
      ),
    );
  }
}
