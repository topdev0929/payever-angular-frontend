import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { merge, Observable, of, Subject, throwError } from 'rxjs';
import {
  exhaustMap,
  filter,
  map,
  mapTo,
  skipWhile,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { TopLocationService } from '@pe/checkout/location';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import { FlowStorage } from '@pe/checkout/storage';
import {
  ChangeFailedPayment,
  CheckoutState,
  ClearFormState,
  PaymentState,
  SetPaymentError,
  SubmitPayment,
} from '@pe/checkout/store';
import {
  ChangePaymentDataInterface,
  ErrorInterface,
  FlowStateEnum,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';

import { AbstractFinishContainer } from '../types';


@Directive()
export abstract class AbstractFinishContainerComponent<T = any>
  extends AbstractContainerComponent
  implements AbstractFinishContainer, OnInit {

  @Input() isDisableChangePayment: boolean;

  @Output() changePaymentMethod = new EventEmitter<any>();

  @Output() destroyModal = new EventEmitter<void>();

  protected flowStorage = this.injector.get(FlowStorage);
  protected topLocationService = this.injector.get(TopLocationService);
  protected store = this.injector.get(Store);
  protected activatedRoute = this.injector.get(ActivatedRoute);
  private paymentHelperService = this.injector.get(PaymentHelperService, null, {
    optional: true,
  });

  private loaderService = this.injector.get(LoaderService);

  showCloseButton = !!this.flow.apiCall.cancelUrl;
  paymentMethod: PaymentMethodEnum;
  errorMessage: string;
  errorMessage$: Observable<string>;
  errors: ErrorInterface;
  paymentResponse: NodePaymentResponseInterface<T>;
  isNeedUpdating = false;

  protected get isPaymentComplete(): boolean {
    return Boolean(this.flow
      && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  get isPOS() {
    return this.paymentHelperService?.isPos(this.flow);
  }

  private submitPaymentSubject$ = new Subject<void>();
  private changePaymentSubject$ = new Subject<ChangePaymentDataInterface>();

  ngOnInit(): void {

    if (this.isPaymentComplete) {
      this.paymentResponse = this.nodeFlowService.getFinalResponse();
      this.showFinishModalFromExistingPayment();
    } else {
      const error = this.store.selectSnapshot(PaymentState.error);

      !error && this.paymentCallback().pipe(
        takeUntil(this.destroy$)
      ).subscribe();
    }

    const paymentResponse$ = this.store.select(PaymentState.response).pipe(
      skipWhile(() => this.isNeedUpdating),
      tap((response) => {
        this.paymentResponse = response;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$),
    );

    const handleError$ = this.store.select(PaymentState.error).pipe(
      map(err => err?.message),
      tap((error) => {
        this.errorMessage = error;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$),
    );

    const submitPayment$ = this.submitPaymentSubject$.pipe(
      filter(() => !this.isPaymentComplete),
      exhaustMap(() => this.store.dispatch([
        new SetPaymentError(null),
        new SubmitPayment(),
      ]).pipe(
      )),
    );

    const changePayment$ = this.changePaymentSubject$.pipe(
      exhaustMap(data => this.store.dispatch(new ChangeFailedPayment(data))),
      tap(() => {
        this.destroyModal.emit();
        this.loaderService.loaderGlobal = false;
      }),
      mapTo(true),
    );

    merge(
      submitPayment$,
      handleError$,
      changePayment$,
      paymentResponse$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  tryAgain(): void {
    const prevAction = this.store.selectSnapshot(CheckoutState.prevAction);
    prevAction ? this.store.dispatch(prevAction) : this.submitPayment();
  }

  changePayment(changePaymentData: ChangePaymentDataInterface): void {
    this.changePaymentSubject$.next(changePaymentData);
  }

  close(): void {
    this.cleanUp();
    this.destroyModal.emit();
    this.topLocationService.href = this.flow.apiCall.cancelUrl;
  }

  cleanUp(): void {
    this.store.dispatch(new ClearFormState());
  }

  protected paymentCallback(): Observable<unknown> {
    return of(null);
  }

  protected showFinishModalFromExistingPayment(): void {
    this.paymentResponse = this.nodeFlowService.getFinalResponse();

    if (!this.paymentResponse) {
      this.errorMessage = this.store.selectSnapshot(PaymentState.error)?.message;
    }

    this.cdr.markForCheck();
  }

  protected submitPayment(): void {
    this.submitPaymentSubject$.next();
  }

  protected handleError(response: ResponseErrorsInterface): Observable<ResponseErrorsInterface> {
    this.errors = response.errors;
    this.errorMessage = response.message;
    this.cdr.detectChanges();

    return throwError(response);
  }
}
