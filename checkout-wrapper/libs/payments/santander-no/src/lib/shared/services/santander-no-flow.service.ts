import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { BaseNodeFlowService, NodeFlowService } from '@pe/checkout/node-api';
import { GetApiCallData, PatchPaymentResponse, PaymentState } from '@pe/checkout/store';
import {
  NodePaymentInterface,
  NodePaymentResponseInterface,
  NodeShopUrlsInterface,
  PaymentSpecificStatusEnum,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common/core';

import { NodePaymentDetailsResponseInterface } from '../types';

import { SantanderNoApiService } from './santander-no-api.service';

@Injectable({
  providedIn: 'root',
})
export class SantanderNoFlowService extends BaseNodeFlowService {

  @SelectSnapshot(PaymentState.paymentPayload)
  private paymentPayload: NodePaymentInterface<any>;

  @SelectSnapshot(PaymentState.response)
  private response: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

  private nodeApiService = this.injector.get(NodeApiService);
  private santanderNoApiService = this.injector.get(SantanderNoApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private env = this.injector.get(PE_ENV);
  private store = this.injector.get(Store);
  private localeConstantService = this.injector.get(LocaleConstantsService);

  postMoreInfo<PaymentResponseDetails>(): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.santanderNoApiService.postMoreInfo(
      this.paymentMethod,
      this.flow.connectionId,
      this.response.id,
      this.paymentPayload,
    ).pipe(
      switchMap(response => response.payment.apiCallId
        ? this.store.dispatch(new GetApiCallData(response))
        : this.store.dispatch(new PatchPaymentResponse(response))
      ),
      map(() => this.store.selectSnapshot(PaymentState.response)),
    );
  }

  isNeedMoreInfo(paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>): boolean {
    return [
      PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
      PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI,
      PaymentSpecificStatusEnum.NEED_MORE_INFO_IIR,
    ].includes(paymentResponse?.payment?.specificStatus);
  }
  

  isNeedApproval(paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>): boolean {
    return PaymentSpecificStatusEnum.NEED_CUSTOMER_APPROVAL == paymentResponse?.payment?.specificStatus;
  }

  getShopUrls(): Observable<NodeShopUrlsInterface> {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      tap((shopUrls) => {
        const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
        const locale = this.localeConstantService.getLang();
        this.nodeFlowService.assignPaymentDetails(
          {
            frontendSuccessUrl:
              shopUrls.successUrl ||
              `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/success`,
            frontendFailureUrl:
              shopUrls.failureUrl ||
              `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/fail`,
            frontendCancelUrl:
              shopUrls.cancelUrl ||
              `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/cancel`,
          }
        );
      }),
    );
  }
}
