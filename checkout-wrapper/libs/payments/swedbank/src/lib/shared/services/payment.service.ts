import { Injectable } from '@angular/core';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
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

  postPayment() {
    const lang = this.localeConstantsService.getLang();
    const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
    const nodeAdditionalPaymentDetails: NodeAdditionalPaymentDetailsInterface = {
      frontendFinishUrl: `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`,
      frontendCancelUrl: `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`,
    };

    this.nodeFlowService.assignPaymentDetails(nodeAdditionalPaymentDetails);

    return this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>();
  }
}
