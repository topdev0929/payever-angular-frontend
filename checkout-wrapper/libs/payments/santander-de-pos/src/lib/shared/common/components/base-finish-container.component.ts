import { Directive } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { filter, skipWhile, switchMap, takeWhile, tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { NodePaymentResponseInterface, PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { CommonService, SantanderDePosFlowService } from '../services';
import { NodePaymentDetailsResponseInterface } from '../types';

const POLLING_INTERVAL = 5000;

@Directive()
export abstract class BaseFinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface> {

  protected commonService = this.injector.get(CommonService);
  protected santanderDePosFlowService = this.injector.get(SantanderDePosFlowService);

  protected runUpdatePaymentWithTimeout():
    Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    const start: number = Math.floor(Date.now());
    const delay: number = POLLING_INTERVAL;
    const timeout: number = POLLING_INTERVAL * 3;
    let done = false;

    let requesting = false;

    return interval(delay).pipe(
      skipWhile(() => requesting), // Skip if request still processing during delay finished
      takeWhile(() => !done),
      switchMap(() => {
        requesting = true;

        return this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
          tap((response) => {
            if (!this.isPaymentUpdateRequired(response)
              || Math.floor(Date.now()) > (start + timeout)
            ) {
              done = true;
            }

            requesting = false;
          }),

          filter(() => done),
          switchMap((paymentResponse) => {
            if (paymentResponse.payment.specificStatus === PaymentSpecificStatusEnum.STATUS_VERSENDET) {
              return this.santanderDePosFlowService
                .postPaymentActionSimple<NodePaymentDetailsResponseInterface>(
                  'mark-failed'
                );
            }

            return this.commonService.manageDocument(this.flow, paymentResponse);
          }),
          tap((paymentResponse) => {
            this.paymentResponse = paymentResponse;
            this.isNeedUpdating = false;
            this.cdr.detectChanges();
          }),
        );
      }),
    );
  }

  public isPaymentUpdateRequired(response: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>) {
    return response.payment.specificStatus !== PaymentSpecificStatusEnum.STATUS_GENEHMIGT
      && response.payment.status !== PaymentStatusEnum.STATUS_DECLINED;
  }
}
