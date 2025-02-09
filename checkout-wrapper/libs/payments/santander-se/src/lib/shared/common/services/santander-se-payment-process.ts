import { Inject, Injectable, isDevMode } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, interval, EMPTY } from 'rxjs';
import { skipWhile, takeWhile, tap, catchError, exhaustMap, switchMap } from 'rxjs/operators';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { AuthSelectors, FlowState } from '@pe/checkout/store';
import {
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { UpdatePaymentModeEnum } from '../../enums';
import {
  FormInterface,
  NodePaymentDetailsInterface,
  NodePaymentResponseDetailsInterface,
} from '../types';

import { SantanderSeFlowService } from './santander-se-flow.service';
import { SantanderSePaymentStateService } from './santander-se-payment-state';

const DEFAULT_EMPLOYMENT_TYPE = 'Permanent';

@Injectable()
export class SantanderSePaymentProcessService {
  @SelectSnapshot(FlowState.flow) protected flow: FlowInterface;
  @SelectSnapshot(FlowState.paymentMethod) protected paymentMethod: PaymentMethodEnum;

  prepareData: (formData: FormInterface) => NodePaymentDetailsInterface;

  constructor(
    private nodeFlowService: NodeFlowService,
    private paymentStateService: SantanderSePaymentStateService,
    private santanderSeFlowService: SantanderSeFlowService,
    private topLocationService: TopLocationService,
    private localeConstantsService: LocaleConstantsService,
    private externalRedirectStorage: ExternalRedirectStorage,
    private store: Store,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
  }

  init(
    paymentResponse: NodePaymentResponseInterface<any>,
    prepareData: (formData: FormInterface) => NodePaymentDetailsInterface,
  ): void {
    this.paymentStateService.paymentResponse = paymentResponse;
    this.prepareData = prepareData;
  }

  onStartSigning(): void {
    if (this.paymentStateService.isCheckStatusProcessing$.value) {
      return;
    }

    this.paymentStateService.isCheckStatusProcessing$.next(true);
    this.santanderSeFlowService.startMobileSigning<NodePaymentResponseDetailsInterface>().pipe(
      switchMap(response => this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(tap(() => {
        this.topLocationService.href = response?.paymentDetails.signingUrl;
      }))),
      catchError(() => {
        this.paymentStateService.isCheckStatusProcessing$.next(false);

        return EMPTY;
      })
    ).subscribe();
  }

  preparePaymentData(formData: FormInterface): Observable<void> {
    const nodePaymentDetails: NodePaymentDetailsInterface = this.prepareData(formData);

    return this.nodeFlowService.assignPaymentDetails({
      ...nodePaymentDetails,
      employmentType: nodePaymentDetails?.employmentType ?? DEFAULT_EMPLOYMENT_TYPE,
      frontendFailureUrl: this.wrapperUrl(),
      frontendSuccessUrl: this.wrapperUrl('complete'),
    }).pipe(
      tap(() => {
        this.paymentStateService.error$.next({
          error: null,
          errorMessage: null,
        });
        this.paymentStateService.isCheckStatusProcessing$.next(false);
        this.paymentStateService.isWaitingForSignUrl$.next(false);
        this.paymentStateService.isUpdatePaymentTimeout$.next(false);
      }),
    );
  }

  processErrors(response: ResponseErrorsInterface): void {
    this.paymentStateService.isCheckStatusProcessing$.next(false);
    this.paymentStateService.isWaitingForSignUrl$.next(false);
    this.paymentStateService.isUpdatePaymentTimeout$.next(false);

    const errorTexts: string[] = Object.values(response.errors || {}) as any;
    this.paymentStateService.error$.next({
      error: response.errors,
      errorMessage: errorTexts?.length > 0 ? errorTexts.join(', ') : response.message,
    });
  }

  runUpdatePaymentWithTimeout(mode: UpdatePaymentModeEnum):
    Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    const start: number = Math.floor(Date.now());
    const delay: number = 3 * 1000;
    const timeout: number = 5 * 60 * 1000;
    let done = false;

    let requesting = false;

    this.paymentStateService.isCheckStatusProcessing$.next(true);
    if (mode === UpdatePaymentModeEnum.WaitingForSigningURL) {
      this.paymentStateService.isWaitingForSignUrl$.next(true);
    }
    this.paymentStateService.isUpdatePaymentTimeout$.next(false);

    return interval(delay).pipe(
      skipWhile(() => requesting), // Skip if request still processing during delay finished
      takeWhile(() => {
        if (done) {
          this.paymentStateService.isCheckStatusProcessing$.next(false);
          this.paymentStateService.isWaitingForSignUrl$.next(false);
        }

        return !done;
      }),
      exhaustMap(() => {
        requesting = true;

        return this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>().pipe(
          tap((response) => {
            this.paymentStateService.paymentResponse = response;

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
              this.paymentStateService.isUpdatePaymentTimeout$.next(true);
              this.paymentStateService.isCheckStatusProcessing$.next(false);
              this.paymentStateService.isWaitingForSignUrl$.next(false);
            }

            requesting = false;
          }),
          catchError(() => EMPTY)
        );
      }),
    );
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
      !!paymentResponse.paymentDetails?.signingUrl &&
      !paymentResponse.paymentDetails?.mobileSigningStatus;
  }

  private wrapperUrl(redirectQueryParam: string = null): string {
    const checkoutWrapper = isDevMode() ? window.origin : this.env.frontend.checkoutWrapper;
    const url = new URL(`${checkoutWrapper}/${this.localeConstantsService.getLang()}/pay/${this.flow.id}/redirect-to-payment`);

    !!redirectQueryParam && url.searchParams.set(redirectQueryParam, 'true');

    if (window.origin !== this.env.frontend.checkoutWrapper) {
      url.searchParams.set('guest_token', this.store.selectSnapshot(AuthSelectors.accessToken));
    }

    return url.toString();
  }
}
