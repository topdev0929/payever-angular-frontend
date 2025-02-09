import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { PaymentDetails, PaymentResponse } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private readonly env = inject(PE_ENV);
  private readonly nodeFlowService = inject(NodeFlowService);
  private readonly externalRedirectStorage = inject(ExternalRedirectStorage);
  private readonly topLocationService = inject(TopLocationService);
  private readonly localeConstantsService = inject(LocaleConstantsService);

  postPayment(): Observable<NodePaymentResponseInterface<PaymentResponse>> {
    return this.preparePayment().pipe(
      switchMap(() => this.nodeFlowService.postPayment<PaymentResponse>().pipe(
        delayWhen((paymentResponse) => {
          if (paymentResponse.paymentDetails.redirectUrl) {
            return this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(tap(() => {
              this.topLocationService.href = paymentResponse.paymentDetails.redirectUrl;
            }));
          }

          throw new Error('The "redirectUrl" is empty in backend response');
        }),
      )),
    );
  }

  private preparePayment(): Observable<void> {
    const nodePaymentDetails: PaymentDetails = {};
    const lang = this.localeConstantsService.getLang();
    const checkoutWrapper = this.env.frontend.checkoutWrapper;

    const frontendFinishUrl = new URL(`${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`);
    const frontendCancelUrl = new URL(`${checkoutWrapper}/${lang}/pay/${this.flow.id}/static-finish/fail`);

    nodePaymentDetails.frontendFinishUrl = frontendFinishUrl.toString();
    nodePaymentDetails.frontendCancelUrl = frontendCancelUrl.toString();

    return this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);
  }
}
