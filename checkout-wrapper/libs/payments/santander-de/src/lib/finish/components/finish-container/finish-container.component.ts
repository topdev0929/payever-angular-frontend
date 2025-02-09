import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { ParamsState } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  PollingConfig,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  PROCESSING_POLLING_INTERVAL,
  PROCESSING_POLLING_TIMEOUT,
  SIGNING_LINK_POLLING_INTERVAL,
  SIGNING_LINK_POLLING_TIMEOUT,
} from '../../../settings';
import { SantanderDeFlowService, UpdatePaymentModeEnum } from '../../../shared/services';

@Component({
  selector: 'santander-de-finish-container',
  templateUrl: './finish-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer, OnInit {

  protected apiService: ApiService = this.injector.get(ApiService);
  private santanderDeFlowService = this.injector.get(SantanderDeFlowService);
  protected storage: PaymentInquiryStorage = this.injector.get(PaymentInquiryStorage);

  @SelectSnapshot(ParamsState.params) private params: CheckoutStateParamsInterface;

  isCheckStatusProcessing: boolean;
  isWaitingForSignUrl: boolean;
  isUpdatePaymentTimeout: boolean;
  isProcessingSigning: boolean;

  protected get isPaymentComplete(): boolean {
    const paymentResponse = this.nodeFlowService.getFinalResponse();

    if (!paymentResponse?.payment) {
      return false;
    }

    return super.isPaymentComplete && (
      paymentResponse.payment.status !== PaymentStatusEnum.STATUS_IN_PROCESS
      || paymentResponse.payment.specificStatus ===
      PaymentSpecificStatusEnum.STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.analyticsFormService.initPaymentMethod(this.paymentMethod);

    if (this.needToProcessingSigning()) {
      this.runUpdatePaymentWithTimeout(UpdatePaymentModeEnum.ProcessingSigning, {
        pollingInterval: PROCESSING_POLLING_INTERVAL,
        maxTimeout: PROCESSING_POLLING_TIMEOUT,
      }).pipe(
        catchError((err) => {
          this.processErrors(err);

          return throwError(err);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  protected paymentCallback(): Observable<void> {
    this.isCheckStatusProcessing = false;
    this.isWaitingForSignUrl = false;
    this.isUpdatePaymentTimeout = false;
    this.cdr.detectChanges();

    return this.runUpdatePaymentWithTimeout(UpdatePaymentModeEnum.WaitingForSigningURL, {
      pollingInterval: SIGNING_LINK_POLLING_INTERVAL,
      maxTimeout: SIGNING_LINK_POLLING_TIMEOUT,
    }).pipe(
      catchError((err) => {
        this.processErrors(err);

        return throwError(err);
      }),
    );
  }

  private processErrors(response: ResponseErrorsInterface): void {
    this.errors = response.errors;
    this.isCheckStatusProcessing = false;
    this.isWaitingForSignUrl = false;
    this.isUpdatePaymentTimeout = false;
    const errorTexts: string[] = Object.values(response.errors || {}) as any;
    this.errorMessage = errorTexts?.length > 0 ? errorTexts.join(', ') : response.message;
    this.cdr.detectChanges();
  }

  private runUpdatePaymentWithTimeout(mode: UpdatePaymentModeEnum, config: PollingConfig): Observable<void> {
    this.isCheckStatusProcessing = true;
    if (mode === UpdatePaymentModeEnum.WaitingForSigningURL) {
      this.isWaitingForSignUrl = true;
    } else {
      this.isProcessingSigning = true;
    }
    this.isUpdatePaymentTimeout = false;
    this.cdr.detectChanges();

    return this.santanderDeFlowService.runUpdatePaymentWithTimeout(mode, config).pipe(
      tap((v) => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse();
        this.isUpdatePaymentTimeout = v.isUpdatePaymentTimeout;
        this.isCheckStatusProcessing = v.isCheckStatusProcessing;
        this.isWaitingForSignUrl = v.isWaitingForSignUrl;
        this.isProcessingSigning = v.isProcessingSigning;
        this.cdr.detectChanges();
      }),
      map(() => null),
      catchError((response: ResponseErrorsInterface) => {
        this.errors = response.errors;
        this.isCheckStatusProcessing = false;
        this.isWaitingForSignUrl = false;
        this.isUpdatePaymentTimeout = false;
        this.errorMessage = response.message || 'Cant update payment from server';
        this.cdr.detectChanges();

        return of(null);
      }),
      takeUntil(this.destroy$),
    );
  }

  private needToProcessingSigning() {
    return this.params.processed
      && !this.isSiningFailed()
      && !this.santanderDeFlowService.isSigned();
  }

  private isSiningFailed(): boolean {
    return Boolean(this.params.redirectToPaymentQueryParams?.['identification-failed']);
  }
}
