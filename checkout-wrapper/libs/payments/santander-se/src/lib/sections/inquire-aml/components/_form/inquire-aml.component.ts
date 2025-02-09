import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, skipWhile, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FinishDialogService } from '@pe/checkout/finish';
import { SectionStorageService } from '@pe/checkout/form-utils';
import { NodeFlowService } from '@pe/checkout/node-api';
import { FlowState, ParamsState, PatchFormState, PaymentState } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  NodePaymentResponseDetailsInterface,
  SantanderSeFlowService,
  SantanderSePaymentProcessService,
  SantanderSePaymentStateService,
  UpdatePaymentModeEnum,
} from '../../../../shared';

@Component({
  selector: 'pe-santander-se-inquire-aml-form',
  templateUrl: './inquire-aml.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class InquireAmlComponent implements OnInit {

  @Select(ParamsState.params) public params$: Observable<CheckoutStateParamsInterface>;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() submitted = new EventEmitter<any>();

  public formGroup = this.fb.group({
    personalForm: this.fb.control(null, Validators.required),
    exposedPersonForm: this.fb.control(null, Validators.required),
    financeDetailsForm: this.fb.control(null, Validators.required),
  });

  isSendingPayment$ = new BehaviorSubject(false);

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private nodeFlowService: NodeFlowService,
    private santanderSeProcessPaymentService: SantanderSePaymentProcessService,
    private santanderSeFlowService: SantanderSeFlowService,
    private finishDialogService: FinishDialogService,
    private sectionStorageService: SectionStorageService,
    private paymentStateService: SantanderSePaymentStateService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    const formData = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue(formData);

    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState(value));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onSubmit(): void {
    const { valid } = this.formGroup;
    this.formGroupDirective.onSubmit(null);

    if (valid) {
      this.onSuccess();
    }
  }

  protected onSuccess(): void {
    this.isSendingPayment$.next(true);
    this.postPayment();
  }

  private postPayment(): void {
    const formData = this.store.selectSnapshot(PaymentState.form);
    this.santanderSeProcessPaymentService.preparePaymentData(formData).pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>().pipe(
        skipWhile((response) => {
          this.paymentStateService.paymentResponse = response;
          const isNeedMore = this.santanderSeFlowService.isNeedMoreInfo(response);
          this.sectionStorageService.isPassedPaymentData = !isNeedMore;

          return isNeedMore;
        }),
        switchMap(() => {
          this.finishDialogService.disableHideOnNextNavigate();

          return this.santanderSeProcessPaymentService.runUpdatePaymentWithTimeout(
            UpdatePaymentModeEnum.WaitingForSigningURL
          );
        }),
        catchError((error) => {
          this.santanderSeProcessPaymentService.processErrors(error);

          return throwError(error);
        }),
        finalize(() => {
          this.isSendingPayment$.next(false);
          this.submitted.emit(this.formGroup.value);
        })
      )),
    ).subscribe();
  }
}
