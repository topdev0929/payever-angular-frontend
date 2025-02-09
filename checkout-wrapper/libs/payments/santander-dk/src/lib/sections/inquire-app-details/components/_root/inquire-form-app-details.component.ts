import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { merge } from 'rxjs';
import { distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { FlowState, PatchFormState, PaymentState, SubmitPayment } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  BankConsentFormValue,
  BankDetailsFormValue,
  CarsFormValue,
  ChildrenFormValue,
  ConfirmFormValue,
  CprDetailsFormValue,
  ExposedPersonFormValue,
  FinanceDetailsFormValue,
  FormValue,
  PersonalFormValue,
  RateInterface,
  SafeInsuranceForm,
} from '../../../../shared';
import { EmploymentTypeEnum } from '../personal-form';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-inquire-form-app-details',
  templateUrl: './inquire-form-app-details.component.html',
  providers: [PeDestroyService],
})
export class InquireFormAppDetailsComponent implements OnInit {

  private readonly actions$ = inject(Actions);

  @SelectSnapshot(FlowState.flow)
  private readonly flow: FlowInterface;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() selectRate: EventEmitter<RateInterface> = new EventEmitter();
  @Output() productPanelOpened: EventEmitter<number> = new EventEmitter();

  @Output() submitted = new EventEmitter<Partial<FormValue>>();

  public readonly formGroup = this.fb.group({
    personalForm: this.fb.control<PersonalFormValue>(null, Validators.required),
    childrenForm: this.fb.control<ChildrenFormValue>(null, Validators.required),
    carsForm: this.fb.control<CarsFormValue>(null, Validators.required),
    bankDetailsForm: this.fb.control<BankDetailsFormValue>(null, Validators.required),
    cprDetailsForm: this.fb.control<CprDetailsFormValue>(null, Validators.required),
    exposedPersonForm: this.fb.control<ExposedPersonFormValue>(null, Validators.required),
    safeInsuranceForm: this.fb.control<SafeInsuranceForm>(null, Validators.required),
    financeDetailsForm: this.fb.control<FinanceDetailsFormValue>(null, Validators.required),
    confirmForm: this.fb.control<ConfirmFormValue>(null, Validators.required),
    bankConsentForm: this.fb.control<BankConsentFormValue>(null, Validators.required),
  });

  private paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  private formData$ = this.store.select(PaymentState.form);

  protected readonly loading$ = merge(
    merge(
      this.submitted,
      this.actions$.pipe(
        ofActionDispatched(SubmitPayment),
      ),
    ).pipe(
      map(() => true),
    ),
  );

  public readonly translations = {
    submit: $localize`:@@checkout_sdk.action.submit_application:`,
  };

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private analyticsFormService: AnalyticsFormService,
    private destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    const formData = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue({
      bankConsentForm: {
        ...formData?.bankConsentForm,
      },
      personalForm: {
        emailAddress: this.flow.billingAddress.email,
        phoneNumber: this.flow.billingAddress.phone,
        ...formData?.personalForm,
      },
      cprDetailsForm: {
        firstName: this.flow.billingAddress.firstName,
        lastName: this.flow.billingAddress.lastName,
        ...formData?.cprDetailsForm,
      },
    });
    const toggleCprDetailsForm$ = this.formData$.pipe(
      map(form => form?.bankConsentForm?.wasCPRProcessed),
      distinctUntilChanged(),
      tap((value) => {
        !value
          ? this.formGroup.get('cprDetailsForm').enable({ emitEvent: false })
          : this.formGroup.get('cprDetailsForm').disable({ emitEvent: false });
      }),
    );

    const toggleSafeInsuranceForm$ = this.formData$.pipe(
      map(form => form?.cprDetailsForm?._insuranceEnabled === false
        || form?.bankConsentForm?._insuranceEnabled === false
        || form?.personalForm?._disableSafeInsurance),
      distinctUntilChanged(),
      tap((insuranceDisabled) => {
        insuranceDisabled
          ? this.formGroup.get('safeInsuranceForm').disable({ emitEvent: false })
          : this.formGroup.get('safeInsuranceForm').enable({ emitEvent: false });
        this.cdr.markForCheck();
      }),
    );

    merge(
      toggleCprDetailsForm$,
      toggleSafeInsuranceForm$,
      this.formGroup.valueChanges.pipe(
        switchMap(value => this.store.dispatch(new PatchFormState(value))),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;

    this.formGroupDirective.onSubmit(null);

    if (!valid) {
      return;
    }

    let formValues = value;

    if (value.personalForm.employmentType === EmploymentTypeEnum.PART_TIME_MORE) {
      formValues = {
        ...value,
        personalForm: {
          ...value.personalForm,
          employmentType: EmploymentTypeEnum.PART_TIME_BELOW,
        },
      };
    }

    this.submitted.emit(formValues);

  }
}
