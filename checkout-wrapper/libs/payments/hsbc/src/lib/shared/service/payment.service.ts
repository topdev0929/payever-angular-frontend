import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { AuthSelectors } from '@pe/checkout/store';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
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
    return this.preparePayment().pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>().pipe(
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

  private preparePayment(): Observable<void> {
    const nodePaymentDetails: NodePaymentDetailsInterface = {};
    const lang = this.localeConstantsService.getLang();
    const checkoutWrapper = this.env.frontend.checkoutWrapper;
    const guestToken = this.store.selectSnapshot(AuthSelectors.accessToken);

    const frontendFinishUrl = new URL(`${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`);
    const frontendCancelUrl = new URL(`${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`);

    if (window.origin !== this.env.frontend.checkoutWrapper) {
      frontendFinishUrl.searchParams.set('guest_token', guestToken);
      frontendCancelUrl.searchParams.set('guest_token', guestToken);
    }

    nodePaymentDetails.frontendFinishUrl = frontendFinishUrl.toString();
    nodePaymentDetails.frontendCancelUrl = frontendCancelUrl.toString();

    return this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);
  }
}
