import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FinishDialogService } from '@pe/checkout/finish';
import { SectionStorageService } from '@pe/checkout/form-utils';
import { FlowState, ParamsState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  FormInterface,
  NodePaymentResponseDetailsInterface,
  SantanderSeFlowService,
  SantanderSePaymentProcessService,
  SantanderSePaymentStateService,
  UpdatePaymentModeEnum,
} from '../../../../shared';

@Component({
  selector: 'pe-santander-se-inquire-eba',
  templateUrl: './inquire-eba.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class InquireEbaComponent implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;
  @SelectSnapshot(ParamsState.merchantMode) public merchantMode: boolean;
  @SelectSnapshot(ParamsState.embeddedMode) public embeddedMode: boolean;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() skipStep = new EventEmitter<boolean>();

  @Output() submitted = new EventEmitter<any>();

  public formGroup = this.fb.group({
    householdForm: this.fb.control(null, Validators.required),
    existingLoansForm: this.fb.control(null, Validators.required),
  });

  isSendingPayment$ = new BehaviorSubject(false);

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private santanderSeFlowService: SantanderSeFlowService,
    private santanderSeProcessPaymentService: SantanderSePaymentProcessService,
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

  public submit(): void {
    const { valid } = this.formGroup;
    this.formGroupDirective.onSubmit(null);

    if (valid) {
      this.onSuccess();
    }
  }

  private onSuccess(): void {
    this.finishDialogService.disableHideOnNextNavigate();
    const formData = this.store.selectSnapshot(PaymentState.form);

    this.isSendingPayment$.next(true);
    this.postMoreInfo(formData);
  }

  private postMoreInfo(formData: FormInterface): void {
    this.santanderSeProcessPaymentService.preparePaymentData(formData).pipe(
      switchMap(() =>
        this.santanderSeFlowService.postMoreInfo<NodePaymentResponseDetailsInterface>().pipe(
          switchMap(
            (response) => {
              this.paymentStateService.paymentResponse = response;
              this.sectionStorageService.isPassedPaymentData = true;
              this.finishDialogService.disableHideOnNextNavigate();

              return this.santanderSeProcessPaymentService.runUpdatePaymentWithTimeout(
                UpdatePaymentModeEnum.WaitingForSigningURL
              );
            },
          ),
          catchError((error) => {
            this.santanderSeProcessPaymentService.processErrors(error);

            return throwError(error);
          }),
          finalize(() => {
            this.isSendingPayment$.next(false);
            this.submitted.emit(this.formGroup.value);
          }),
        ),
      ),
    ).subscribe();
  }
}
