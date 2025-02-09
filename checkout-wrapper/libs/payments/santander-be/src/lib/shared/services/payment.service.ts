import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface, FlowStateEnum, NodePaymentResponseInterface, NodeShopUrlsInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentDetailsInterface, NodePaymentResponseDetailsInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {
  @Select(FlowState.flow) private flow$: Observable<FlowInterface>;

  private env = this.injector.get(PE_ENV);
  private localeConstantsService = this.injector.get(LocaleConstantsService);
  private nodeApiService = this.injector.get(NodeApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private topLocationService = this.injector.get(TopLocationService);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);

  private preparePayment(shopUrls: NodeShopUrlsInterface): Observable<void> {
    const nodePaymentDetails: NodePaymentDetailsInterface = {};
    const lang = this.localeConstantsService.getLang();
    const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
    nodePaymentDetails.frontendFinishUrl = `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`;
    nodePaymentDetails.frontendFailureUrl = shopUrls.failureUrl || `${checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`;

    return this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);
  }

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    return this.nodeApiService.getShopUrls(this.flow).pipe(
      switchMap(shopUrls => this.preparePayment(shopUrls)),
      switchMap(() =>
        this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>().pipe(
          switchMap(paymentResponse => this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
            switchMap(() => this.flow$.pipe(
              takeWhile(({ state }) => {
                const finished = state === FlowStateEnum.FINISH;
                if (finished) {
                  this.topLocationService.href = paymentResponse.paymentDetails.redirectUrl;
                }

                return !finished;
              }),
              map(() => paymentResponse),
            )),
          )),
        )
      ),
    );
  }
}
