import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delayWhen, tap } from 'rxjs/operators';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  NodePaymentResponseInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentDetailsInterface, NodePaymentDetailsResponseInterface } from '../types';


@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  private topLocationService = this.injector.get(TopLocationService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    const nodePaymentDetails: NodePaymentDetailsInterface = {};
    const lang = this.localeConstantsService.getLang();
    const checkoutWrapper = this.env.frontend.checkoutWrapper;
    nodePaymentDetails.frontendFinishUrl = `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`;
    nodePaymentDetails.frontendCancelUrl = `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`;

    this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);

    return this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>().pipe(
      delayWhen((paymentResponse) => {
        if (paymentResponse?.paymentDetails?.redirectUrl) {
          return this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(tap(() => {
            this.topLocationService.href = paymentResponse.paymentDetails.redirectUrl;
          }));
        } else {
          throw new Error('The "redirectUrl" is empty in backend response');
        }
      }),
    );
  }
}
