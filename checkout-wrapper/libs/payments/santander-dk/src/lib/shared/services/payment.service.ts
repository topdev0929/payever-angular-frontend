import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentResponseDetailsInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private nodeApiService = this.injector.get(NodeApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  postPayment() {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      switchMap((shopUrls) => {
        const checkoutWrapper = this.env.frontend.checkoutWrapper;
        const locale = this.localeConstantsService.getLang();

        return this.nodeFlowService.assignPaymentDetails({
            frontendSuccessUrl: shopUrls.successUrl
              || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/success`,
            frontendFailureUrl: shopUrls.failureUrl
              || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/fail`,
          },
        );
      }),
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>()),
    );
  }
}
