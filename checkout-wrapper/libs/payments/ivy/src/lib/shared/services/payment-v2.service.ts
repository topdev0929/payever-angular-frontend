import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { PaymentState } from '@pe/checkout/store';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { LocaleConstantsService, loadScript, fromMutationObserver } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { IVY_BUTTON_SCRIPT } from '../../settings';
import { NodePaymentDetailsInterface, NodePaymentDetailsResponseInterface } from '../types';

/**
 * Initiates an Ivy checkout in a popup.
 */
declare function startIvyCheckout(url: string, mode: 'popup'): void;

@Injectable()
export class PaymentServiceV2 extends AbstractPaymentService {

  @SelectSnapshot(PaymentState.response)
  private paymentResponse: NodePaymentResponseInterface<any>;

  private env = this.injector.get(PE_ENV);
  private localeConstantsService = this.injector.get(LocaleConstantsService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private nodeApiService = this.injector.get(NodeApiService);

  private preparePayment(): Observable<void> {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      switchMap((shopUrls) => {
        const lang = this.localeConstantsService.getLang();
        const checkoutWrapper = this.env.frontend.checkoutWrapper;
        const nodePaymentDetails: NodePaymentDetailsInterface = {
          frontendFinishUrl: `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`,
          frontendCancelUrl: shopUrls.cancelUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`,
        };

        return this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);
      }),
    );
  }

  postPayment(): Observable<any> {
    return this.preparePayment().pipe(
      switchMap(() => loadScript(IVY_BUTTON_SCRIPT, 'ivy-button-script').pipe(
        switchMap(() => this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>()),
        switchMap(() => {
          startIvyCheckout(this.paymentResponse.paymentDetails.redirectUrl, 'popup');

          return fromMutationObserver(document.body).pipe(
            first(),
          );
        })
      )),
      map(() => null),
    );
  }
}
