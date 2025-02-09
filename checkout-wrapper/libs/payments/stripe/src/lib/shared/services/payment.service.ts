import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  NodePaymentResponseInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import {
  NodeAdditionalPaymentDetailsInterface,
  NodePaymentDetailsResponseInterface,
} from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    const nodeAdditionalPaymentDetails: NodeAdditionalPaymentDetailsInterface = {
      postbackUrl: `${this.env.frontend.checkoutWrapper}/${this.localeConstantsService.getLang()}/pay/${this.flow.id}/stripe-postback`,
      dynamicDescriptor: this.flow.extra?.dynamic_descriptor,
    };

    return this.nodeFlowService.assignPaymentDetails(nodeAdditionalPaymentDetails).pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>()),
    );
  }
}
