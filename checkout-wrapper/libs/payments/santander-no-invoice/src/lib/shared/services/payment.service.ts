import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentResponseDetailsInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private nodeApiService = this.injector.get(NodeApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private topLocationService = this.injector.get(TopLocationService);
  private localeConstantService = this.injector.get(LocaleConstantsService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      tap((shopUrls) => {
        const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
        const locale = this.localeConstantService.getLang();
        this.nodeFlowService.assignPaymentDetails({
          frontendSuccessUrl: shopUrls.successUrl || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/success`,
          frontendFailureUrl: shopUrls.failureUrl || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/fail`,
          frontendCancelUrl: shopUrls.cancelUrl || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/cancel`,
        });
      }),
      switchMap(() =>
        this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>().pipe(
          tap((response) => {
            if (response) {
              if (response.payment?.specificStatus === PaymentSpecificStatusEnum.STATUS_APPROVED
                && response.paymentDetails?.applicantSignReferenceUrl
              ) {
                this.topLocationService.href = response.paymentDetails.applicantSignReferenceUrl;
              }
            }
          }),
        ),
      ),
    );
  }
}
