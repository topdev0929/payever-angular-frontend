import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, filter, mapTo, mergeMap, switchMap, tap } from 'rxjs/operators';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PaymentState } from '@pe/checkout/store';
import {
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { POLLING_CONFIG, pollWhile } from '@pe/checkout/utils/poll';
import { PE_ENV } from '@pe/common';

import { DK_POLLING_CONFIG } from '../../../settings';
import {
  NodePaymentResponseDetailsInterface,
} from '../../../shared';


@Component({
  selector: 'santander-dk-finish-container',
  templateUrl: './finish-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: POLLING_CONFIG,
      useValue: DK_POLLING_CONFIG,
    },
  ],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentResponseDetailsInterface> {

  protected apiService = this.injector.get(ApiService);
  protected nodeApiService = this.injector.get(NodeApiService);
  protected env = this.injector.get(PE_ENV);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  private pollingConfig = this.injector.get(POLLING_CONFIG);

  isSendingPayment: boolean;
  isCheckStatusProcessing: boolean;
  isCheckStatusTimeout: boolean;
  finishModalErrorMessage: string;

  protected paymentCallback(): Observable<unknown> {
    return this.store.selectOnce(PaymentState.response).pipe(
      filter(d => !!d),
      switchMap(() => this.runStatusCheck())
    );
  }

  private runStatusCheck(): Observable<void> {
    const start: number = Math.floor(Date.now());
    const dueTime = 10_000; // need to wait for Santander to verify the payment. It takes up to 10 seconds
    const source$ = this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>();

    this.isCheckStatusProcessing = true;
    this.isCheckStatusTimeout = false;
    this.cdr.detectChanges();

    let done = false;

    return timer(dueTime).pipe(
      mergeMap(() => source$.pipe(
        pollWhile(
          this.pollingConfig,
          () => !done
        ),
        tap((response: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>) => {
          this.paymentResponse = response;
          if (!this.checkIsCheckStatusProcessing()) {
            done = true;
          } else if (Math.floor(Date.now()) > (start + this.pollingConfig.maxTimeout)) {
            this.isCheckStatusTimeout = true;
            done = true;
          }

          if (done) {
            this.isCheckStatusProcessing = false;
            this.cdr.detectChanges();
          }
        }),
        catchError((response: ResponseErrorsInterface) => {
          this.errors = response.errors;
          this.isCheckStatusProcessing = false;
          this.isCheckStatusTimeout = false;
          this.errorMessage = response.message;
          this.cdr.detectChanges();

          return throwError(response);
        }),
        mapTo(null),
      )),
    );
  }

  private checkIsCheckStatusProcessing(): boolean {
    return (
      this.paymentResponse?.payment?.status ===
        PaymentStatusEnum.STATUS_IN_PROCESS &&
      this.paymentResponse.payment.specificStatus ===
        PaymentSpecificStatusEnum.STATUS_PENDING
    );
  }
}
