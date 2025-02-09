import {
  ChangeDetectionStrategy,
  Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  FormValue,
  GuarantorRelation,
  PERSON_TYPE,
  PersonTypeEnum,
  TogglePrevAddressEventInterface,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-de-pos-inquire-form-personal-info-guarantor',
  templateUrl: './inquire-form-personal-info-guarantor.component.html',
})
export class InquireFormPersonalInfoGuarantorComponent implements OnInit {
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;

  @Output() submitted = new EventEmitter<any>();

  public readonly modeEnum = ModeEnum;

  public readonly formGroup = this.fb.group({
    addressForm: [{
      disabled: true,
      value: null,
    }],
    personalForm: [null],
    prevAddressForm: [{ disabled: true, value: null }],
  });

  public readonly currency = this.store.selectSnapshot(FlowState.flow).currency;
  public readonly options$ = this.store.select(PaymentState.options);
  public readonly formData$ = this.store.select(PaymentState.form);

  public readonly addressResidentSince$ = new BehaviorSubject(null);

  constructor(
    @Inject(PERSON_TYPE) public personType: PersonTypeEnum,
    private store: Store,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
  ) { }

  ngOnInit() {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue({
      ...formData[this.personType],
      personalForm: {
        ...formData?.[this.personType]?._identifyForm,
        ...formData?.[this.personType]?.personalForm,
      },
      addressForm: {
        ...formData?.[this.personType]?.addressForm,
      },
      prevAddressForm: {
        ...formData[this.personType]?.prevAddressForm,
        ...this.formGroup.value.prevAddressForm,
      },
    });

    const toggleDetailsForm$ = this.formData$.pipe(
      tap((formData) => {
        const guarantorRelation: GuarantorRelation = formData?.detailsForm?.typeOfGuarantorRelation;
        guarantorRelation == GuarantorRelation.EQUIVALENT_HOUSEHOLD
          ? this.formGroup.get('addressForm').enable()
          : this.formGroup.get('addressForm').disable();
      }),
    );

    merge(
      toggleDetailsForm$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

  }

  public submit(): void {
    this.formGroupDirective.onSubmit(null);
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    const personData = formData[this.personType];
    this.store.dispatch(new PatchFormState({
      [this.personType]: {
        ...formData[this.personType],
        addressForm: {
          ...personData?.addressForm,
          ...this.formGroup.value.addressForm,
        },
        personalForm: {
          ...personData?.personalForm,
          ...this.formGroup.value.personalForm,
        },
        prevAddressForm: {
          ...personData?.prevAddressForm,
          ...this.formGroup.value.prevAddressForm,
        },
      },
    }));
  }

  public onSubmit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      this.submitted.emit(value);
    }
  }

  togglePrevAddress(event: TogglePrevAddressEventInterface): void {
    const { date, isPrevAddress } = event;
    this.addressResidentSince$.next(date);
    isPrevAddress
      ? this.formGroup.get('prevAddressForm').enable()
      : this.formGroup.get('prevAddressForm').disable();
  }
}
