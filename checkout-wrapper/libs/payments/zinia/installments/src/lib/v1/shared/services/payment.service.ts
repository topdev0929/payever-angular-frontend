import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { NodeShopUrlsInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { PaymentDetails, PaymentResponse } from '../models';

@Injectable()
export class PaymentService extends AbstractPaymentService<PaymentResponse> {

  private env = inject(PE_ENV);
  private nodeApiService = inject(NodeApiService);
  private nodeFlowService = inject(NodeFlowService);
  private localeConstantsService = inject(LocaleConstantsService);
  private externalRedirectStorage = inject(ExternalRedirectStorage);
  private topLocationService = inject(TopLocationService);

  postPayment() {
    return this.preparePayment().pipe(
      switchMap(() =>
      this.nodeFlowService.postPayment<PaymentResponse>().pipe(
        switchMap((paymentResponse) => {
          if (paymentResponse?.paymentDetails?.redirectUrl) {
            return this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
                tap(() => this.topLocationService.href = paymentResponse.paymentDetails.redirectUrl),
                map(() => paymentResponse),
              );
            }

            return throwError(new Error($localize `:@@payment-openbank.errors.finish.emptyRedirectUrl:`));
          }),
      )),
    );
  }

  private preparePayment(): Observable<NodeShopUrlsInterface> {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      tap((shopUrls) => {
        const lang = this.localeConstantsService.getLang();
        const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
        const successUrl = shopUrls.successUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`;
        const cancelUrl = shopUrls.cancelUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`;

        const nodePaymentDetails: Partial<PaymentDetails> = {
          frontendSuccessUrl: successUrl,
          frontendFinishUrl: successUrl,
          frontendFailureUrl: cancelUrl,
          frontendCancelUrl: cancelUrl,
          forceRedirect: true,
        };

        this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);

        return this.nodeFlowService.getPaymentData();
      }),
    );
  }
}
