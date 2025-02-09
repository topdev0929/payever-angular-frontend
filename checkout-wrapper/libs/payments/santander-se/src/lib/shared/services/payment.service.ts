import { Injectable } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { skipWhile, switchMap, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';

import { NodePaymentResponseDetailsInterface, SantanderSePaymentStateService } from '../common';
import { UpdatePaymentModeEnum } from '../enums';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);
  private paymentStateService = this.injector.get(SantanderSePaymentStateService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    const finalResponse = this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
    
    return finalResponse
      ? of(finalResponse)
      : this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>();
  }

  private runUpdatePaymentWithTimeout(mode: UpdatePaymentModeEnum): void {
    const start: number = Math.floor(Date.now());
    const delay: number = 3 * 1000;
    const timeout: number = 5 * 60 * 1000;

    let requesting = false;

    const sub = interval(delay).pipe(
      skipWhile(() => requesting), // Skip if request still processing during delay finished
      switchMap(() => {
        requesting = true;

        return this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>().pipe(
          tap((response) => {
            let done = false;

            if (mode === UpdatePaymentModeEnum.ProcessingSigning
              && !this.checkIsUpdatePaymentRequired(response)
            ) {
              done = true;
            } else if (mode === UpdatePaymentModeEnum.WaitingForSigningURL
              && !this.checkIsWaitingForSignUrl(response)
            ) {
              done = true;
              this.paymentStateService.isReadyForStartSigning$.next(true);
            } else if (Math.floor(Date.now()) > (start + timeout)) {
              done = true;
            }

            if (done) {
              sub.unsubscribe();
            }
            requesting = false;
          }),
        );
      })
    ).subscribe();
  }

  private checkIsWaitingForSignUrl(
    paymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>,
  ): boolean {
    const ss = paymentResponse?.payment?.specificStatus;

    return !paymentResponse.paymentDetails?.signingUrl &&
      (ss === PaymentSpecificStatusEnum.STATUS_PENDING || !ss);
  }

  private checkIsUpdatePaymentRequired(
    paymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>,
  ): boolean {
    return paymentResponse?.payment?.status !== PaymentStatusEnum.STATUS_ACCEPTED &&
      paymentResponse?.payment?.status !== PaymentStatusEnum.STATUS_DECLINED &&
      !!paymentResponse.paymentDetails?.signingUrl;
  }
}
