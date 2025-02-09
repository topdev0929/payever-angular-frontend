import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable, combineLatest, merge } from 'rxjs';
import { map, sampleTime, skip, startWith, takeUntil, tap } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import {
  AddressFormValue,
  BankFormValue,
  EditFormValue,
  EmploymentFormValue,
  FormOptionsInterface,
  GuarantorDetailsFormValue,
  GuarantorRelation,
  IdentifyFormValue,
  IncomeFormValue,
  IncomeService,
  NO_EMPLOYMENT_PROFESSIONS,
  PersonTypeEnum,
  PersonalFormValue,
  PrevAddressFormValue,
  ProtectionFormValue,
  RateDataInterface,
  TogglePrevAddressEventInterface,
  SelectedInterface,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import {
  ClearFormState,
  FlowState,
  ParamsState,
  PatchParams,
  PaymentState,
  SetFormState,
} from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  FlowStateEnum,
} from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { EditFormService } from './form.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-pos-edit-form',
  templateUrl: './form.component.html',
  styles: [`
    :host { display: block; }
  `],
  providers: [
    PeDestroyService,
  ],
})
export class EditFormComponent implements OnInit, OnDestroy {
  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @ViewChildren(FormGroupDirective) protected formGroupDirectiveList: QueryList<FormGroupDirective>;

  public readonly options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  private readonly editMode: boolean = this.store.selectSnapshot(ParamsState.editMode);

  @Input() darkMode = false;
  @Input() isLoading = false;

  @Output() submitted = new EventEmitter();

  protected personTypeEnum: typeof PersonTypeEnum = PersonTypeEnum;

  get formData() {
    const formData: EditFormValue = this.store.selectSnapshot(PaymentState.form);

    return formData;
  }

  protected readonly customerForm = this.fb.group({
    _identifyForm: this.fb.control<IdentifyFormValue>(null),
    addressForm: this.fb.control<AddressFormValue>(null),
    employmentForm: this.fb.control<EmploymentFormValue>(null),
    incomeForm: this.fb.control<IncomeFormValue>(null),
    bankForm: this.fb.control<BankFormValue>(null),
    protectionForm: this.fb.control<ProtectionFormValue>(null),
    personalForm: this.fb.control<PersonalFormValue>(null),
    prevAddressForm: this.fb.control<PrevAddressFormValue>(null),
  });

  protected readonly guarantorForm = this.fb.group({
    _identifyForm: this.fb.control<IdentifyFormValue>(null),
    addressForm: this.fb.control<AddressFormValue>(null),
    employmentForm: this.fb.control<EmploymentFormValue>(null),
    incomeForm: this.fb.control<IncomeFormValue>(null),
    bankForm: this.fb.control<BankFormValue>(null),
    protectionForm: this.fb.control<ProtectionFormValue>(null),
    personalForm: this.fb.control<PersonalFormValue>(null),
    prevAddressForm: this.fb.control<PrevAddressFormValue>(null),
    detailsForm: this.fb.control<GuarantorDetailsFormValue>(null),
  });

  protected readonly formGroup = this.fb.group({
    ratesForm: [null],
    detailsForm: [null],
    termsForm: [null],
    billingAddress: [null],
    customer: this.customerForm,
    guarantor: this.guarantorForm,
  });

  private params$: Observable<CheckoutStateParamsInterface> = this.store.select(ParamsState.params);

  protected readonly showAddressStep$ = this.params$.pipe(
    map(({ isBillingAddressStepVisible }) => isBillingAddressStepVisible),
  );

  protected addressParams$ = this.params$.pipe(
    map(({
      forceAddressOnlyFillEmptyAllowed,
      forceCodeForPhoneRequired,
      forcePhoneRequired,
    }) => ({
      forceAddressOnlyFillEmptyAllowed,
      forceCodeForPhoneRequired,
      forcePhoneRequired,
    })),
  );

  public readonly addressResidentSince$ = new BehaviorSubject<{
    [PersonTypeEnum.Customer]: Date;
    [PersonTypeEnum.Guarantor]: Date;
  }>({
    [PersonTypeEnum.Customer]: null,
    [PersonTypeEnum.Guarantor]: null,
  });

  constructor(
    public incomeService: IncomeService,
    private store: Store,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    private editFormService: EditFormService,
    private paymentHelperService: PaymentHelperService,
    private analyticsFormService: AnalyticsFormService,
  ) {}

  ngOnDestroy(): void {
    this.store.dispatch(new ClearFormState());
  }

  onRateSelected(selected: SelectedInterface): void {
    const downPayment = this.formGroup.get('detailsForm').value?.downPayment;
    const rate: RateDataInterface = {
      raw: selected.rate,
      downPayment,
      total: (selected.rate?.totalCreditCost || 0) + downPayment,
    };
    this.paymentHelperService.totalAmount$.next(rate.total);
    this.paymentHelperService.downPayment$.next(downPayment);
  }

  ngOnInit(): void {
    this.analyticsFormService.initEditMode(this.editMode);

    this.store.dispatch(new PatchParams({ sendingPaymentSigningLink: false }));
    this.patchForm();
    const formValueChanges$ = this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value),
      sampleTime(400),
      tap((value) => {
        const { protectionForm } = value[PersonTypeEnum.Customer];

        this.store.dispatch(new SetFormState({
          ...value,
          ...protectionForm && { protectionForm },
        }));
      }),
    );

    const customerIdentifyValueChanges$ = this.customerForm.get('_identifyForm').valueChanges.pipe(
      sampleTime(400),
      tap((value) => {
        this.formGroup.get('billingAddress').setValue(this.formData?.customer.addressForm);
        this.customerForm.get('personalForm').setValue(value as PersonalFormValue);
      })
    );

    const guarantorIdentifyValueChanges$ = this.guarantorForm.get('_identifyForm').valueChanges.pipe(
      sampleTime(400),
      skip(1), // skip on initializing the formGroup
      tap((value) => {
        this.guarantorForm.patchValue({
          personalForm: value as PersonalFormValue,
          detailsForm: this.formData?.guarantor.detailsForm,
          addressForm: this.formData?.guarantor.addressForm,
        });
      })
    );

    const combineLatest$ = combineLatest([
      formValueChanges$,
      this.incomeService.cpiTariff$,
    ]).pipe(
      tap(([value, cpiTariff]) => {
        this.updatedFormData(value as FormValue, cpiTariff);
      })
    );

    merge(
      customerIdentifyValueChanges$,
      guarantorIdentifyValueChanges$,
      combineLatest$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected isFlowHasFinishedPayment(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  protected submit(): void {
    this.formGroupDirectiveList.forEach(formGroupDirective => formGroupDirective.onSubmit(null));
  }

  protected firstInitAddress(personType: PersonTypeEnum): void {
    const address = this.store.selectSnapshot(FlowState.address) as any;
    personType === PersonTypeEnum.Customer
      && this.customerForm.get('addressForm').setValue(address);
  }


  protected onSubmit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      this.submitted.emit(value);
    }
  }

  togglePrevAddress(event: TogglePrevAddressEventInterface, personType: PersonTypeEnum): void {
    const { date, isPrevAddress } = event;
    const addressResidentSince = this.addressResidentSince$.value;
    this.addressResidentSince$.next({
      ...addressResidentSince,
      [personType]: date,
    });

    const prevAddressFormName = personType === PersonTypeEnum.Customer
      ? 'customer.prevAddressForm'
      : 'guarantor.prevAddressForm';
      isPrevAddress
      ? this.formGroup.get(prevAddressFormName).enable()
      : this.formGroup.get(prevAddressFormName).disable();

    this.cdr.detectChanges();
  }

  private patchForm(): void {
    this.formGroup.patchValue(this.editFormService.prepareFormInitData(this.formGroup));
  }

  private updatedFormData(formData: FormValue, cpiTariff: number): void {
    const guarantorRelation = formData?.detailsForm?.typeOfGuarantorRelation;
    const isGuarantor: boolean = guarantorRelation !== GuarantorRelation.NONE;
    const gProfession: string = formData.guarantor?.personalForm?.profession;
    const cProfession: string = formData.customer?.personalForm?.profession;
    const noEmploymentGuarantor: boolean = NO_EMPLOYMENT_PROFESSIONS.indexOf(gProfession) >= 0;
    const noEmploymentCustomer: boolean = NO_EMPLOYMENT_PROFESSIONS.indexOf(cProfession) >= 0;

    this.toggleControl('guarantor', isGuarantor);
    this.toggleControl('guarantor.addressForm', isGuarantor && guarantorRelation === GuarantorRelation.OTHER_HOUSEHOLD);
    this.toggleControl(
      'guarantor.detailsForm',
      isGuarantor && guarantorRelation === GuarantorRelation.EQUIVALENT_HOUSEHOLD
    );

    this.toggleControl('guarantor.incomeForm', isGuarantor);
    this.toggleControl('guarantor._identifyForm', isGuarantor);
    this.toggleControl('customer.employmentForm', !noEmploymentCustomer);
    this.toggleControl('guarantor.employmentForm', isGuarantor && !noEmploymentGuarantor);
    this.toggleControl('customer.protectionForm', !isGuarantor && !!cpiTariff);
    this.toggleControl('guarantor.protectionForm', isGuarantor && !!cpiTariff);
  }

  private toggleControl(
    name: string,
    enable: boolean,
    emitEvent = false
  ): void {
    const control: AbstractControl = this.formGroup?.get(name);
    if (control) {
      if (enable && control.disabled) {
        control.enable({ emitEvent });
      } else if (!enable && control.enabled) {
        control.disable({ emitEvent });
      }
    }
  }


}
