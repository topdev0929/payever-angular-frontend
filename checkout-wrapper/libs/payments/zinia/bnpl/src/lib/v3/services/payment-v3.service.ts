import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { PaymentState } from '@pe/checkout/store';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import {
  FlowInterface,
  NodePaymentResponseInterface,
  NodeShopUrlsInterface,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { PaymentDetails, PaymentResponse } from '../models';

import { ZiniaBnplUtilsService } from './zinia-bnpl-utils.service';

@Injectable()
export class PaymentService extends AbstractPaymentService<PaymentResponse> {

  private env = inject(PE_ENV);
  private nodeApiService = inject(NodeApiService);
  private nodeFlowService = inject(NodeFlowService);
  private localeConstantsService = inject(LocaleConstantsService);
  private threatMetrixService = inject(ThreatMetrixService);
  private topLocationService = inject(TopLocationService);
  private ziniaBNPLUtilsService = inject(ZiniaBnplUtilsService);

  public postPayment() {
    return this.preparePayment(this.flow).pipe(
      switchMap(() => this.nodeFlowService.postPayment<PaymentResponse>()),
    );
  }

  public redirect(): void {
    const { successUrl, cancelUrl, pendingUrl } = this.flow.apiCall || {};
    const paymentResponse = this.store.selectSnapshot(PaymentState.response);

    if (this.isStatusSuccess(paymentResponse) && successUrl) {
      this.topLocationService.href = successUrl;
    } else if (this.isStatusFail(paymentResponse) && cancelUrl) {
      this.topLocationService.href = cancelUrl;
    } else if (this.isStatusPending(paymentResponse) && pendingUrl) {
      this.topLocationService.href = pendingUrl;
    }
  }

  private preparePayment(flow: FlowInterface): Observable<NodeShopUrlsInterface> {
    return this.nodeApiService.getShopUrls(flow).pipe(
      tap((shopUrls) => {
        const lang = this.localeConstantsService.getLang();
        const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
        const riskSessionId = this.threatMetrixService.getLastRiskId(this.flow.id, this.paymentMethod);
        const successUrl = shopUrls.successUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`;
        const cancelUrl = shopUrls.cancelUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`;

        const nodePaymentDetails: Partial<PaymentDetails> = {
          frontendSuccessUrl: successUrl,
          frontendFinishUrl: successUrl,
          frontendFailureUrl: cancelUrl,
          frontendCancelUrl: cancelUrl,
          forceRedirect: false,
          ...(riskSessionId && { riskSessionId }),
          deviceInfo: this.ziniaBNPLUtilsService.getDeviceInfo(),
          browserInfo: this.ziniaBNPLUtilsService.getBrowserInfo(),
        };

        this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);
      }),
    );
  }

  private isStatusSuccess(paymentResponse: NodePaymentResponseInterface<PaymentResponse>): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].includes(paymentResponse.payment.status);
  }

  private isStatusFail(paymentResponse: NodePaymentResponseInterface<PaymentResponse>): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].includes(paymentResponse.payment.status);
  }

  private isStatusPending(paymentResponse: NodePaymentResponseInterface<PaymentResponse>): boolean {
    return [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].includes(paymentResponse.payment.status) && !paymentResponse.paymentDetails.verifyValue;
  }
}
