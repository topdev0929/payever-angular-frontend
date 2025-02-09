import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentAdditionalDetailsInterface, NodePaymentDetailsResponseInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private nodeApiService = this.injector.get(NodeApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  private topLocationService = this.injector.get(TopLocationService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      switchMap((shopUrls) => {

        const nodePaymentAdditionalDetails: NodePaymentAdditionalDetailsInterface = {};
        const lang = this.localeConstantsService.getLang();
        const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
        nodePaymentAdditionalDetails.frontendFinishUrl = `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`;
        nodePaymentAdditionalDetails.frontendFailureUrl = shopUrls.failureUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`;

        return this.nodeFlowService.assignPaymentDetails(nodePaymentAdditionalDetails);
      }),
      switchMap(() =>
        this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>().pipe(
          delayWhen((paymentResponse) => {
            if (paymentResponse?.paymentDetails?.redirectUrl) {
              return this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(tap(() => {
                this.topLocationService.href = paymentResponse.paymentDetails.redirectUrl;
              }));
            } else {
              throw new Error('The "redirectUrl" is empty in backend response');
            }
          }),
      )),
    );
  }
}
