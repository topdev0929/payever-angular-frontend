import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { NumberType } from 'libphonenumber-js';
import { merge } from 'rxjs';
import { distinctUntilChanged, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import {
  FormOptionsInterface,
  GuarantorRelation,
  PERSON_TYPE,
  PersonTypeEnum,
  PersonalFormValue,
  TogglePrevAddressEventInterface,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';

import { idNumberValidator } from './validators';

@Component({
  selector: 'personal-form',
  templateUrl: './personal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalFormComponent extends CompositeForm<PersonalFormValue> implements OnInit {
  @Output() public togglePrevAddress = new EventEmitter<TogglePrevAddressEventInterface>();

  private store = this.injector.get(Store);
  public personType = this.injector.get(PERSON_TYPE);
  public readonly translations = {
    customer: {
      personalDateOfBirth: $localize`:@@payment-santander-de-pos.inquiry.form.customer.personalDateOfBirth.label:`,
      profession: $localize`:@@payment-santander-de-pos.inquiry.form.customer.profession.label:`,
      addressMobilePhoneNumber: $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressMobilePhoneNumber.label:`,
      addressPhoneNumber: $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressPhoneNumber.label:`,
      addressResidentSince: $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressResidentSince.label:`,
      identificationNumber: $localize`:@@payment-santander-de-pos.inquiry.form.customer.identificationNumber.label:`,
      identificationPlaceOfIssue: $localize`:@@payment-santander-de-pos.inquiry.form.customer.identificationPlaceOfIssue.label:`,
      identificationDateOfIssue: $localize`:@@payment-santander-de-pos.inquiry.form.customer.identificationDateOfIssue.label:`,
      identificationDateOfExpiry: $localize`:@@payment-santander-de-pos.inquiry.form.customer.identificationDateOfExpiry.label:`,
      identificationIssuingAuthority: $localize`:@@payment-santander-de-pos.inquiry.form.customer.identificationIssuingAuthority.label:`,
      numberOfChildren: $localize`:@@payment-santander-de-pos.inquiry.form.customer.numberOfChildren.label:`,
      personalMaritalStatus: $localize`:@@payment-santander-de-pos.inquiry.form.customer.personalMaritalStatus.label:`,
      personalNationality: $localize`:@@payment-santander-de-pos.inquiry.form.customer.personalNationality.label:`,
      personalPlaceOfBirth: $localize`:@@payment-santander-de-pos.inquiry.form.customer.personalPlaceOfBirth.label:`,
      personalBirthName: $localize`:@@payment-santander-de-pos.inquiry.form.customer.personalBirthName.label:`,
    },
    guarantor: {
      personalDateOfBirth: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.personalDateOfBirth.label:`,
      profession: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.profession.label:`,
      addressMobilePhoneNumber: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.addressMobilePhoneNumber.label:`,
      addressPhoneNumber: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.addressPhoneNumber.label:`,
      addressResidentSince: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.addressResidentSince.label:`,
      identificationNumber: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.identificationNumber.label:`,
      identificationPlaceOfIssue: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.identificationPlaceOfIssue.label:`,
      identificationDateOfIssue: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.identificationDateOfIssue.label:`,
      identificationDateOfExpiry: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.identificationDateOfExpiry.label:`,
      identificationIssuingAuthority: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.identificationIssuingAuthority.label:`,
      numberOfChildren: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.numberOfChildren.label:`,
      personalMaritalStatus: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.personalMaritalStatus.label:`,
      personalNationality: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.personalNationality.label:`,
      personalPlaceOfBirth: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.personalPlaceOfBirth.label:`,
      personalBirthName: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.personalBirthName.label:`,
    },
  };

  private flow = this.store.selectSnapshot(FlowState.flow);
  private readonly merchantMode = this.store.selectSnapshot(ParamsState.merchantMode);
  public readonly options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  private disableProfessionAndDateOfBirth = this.personType === PersonTypeEnum.Customer
    && this.merchantMode;

  public readonly formGroup = this.fb.group({
    typeOfIdentification: this.fb.control<string>(null),
    personalDateOfBirth: this.fb.control<Date>(
      {
        disabled: this.disableProfessionAndDateOfBirth,
        value: null,
      },
      RequiredDate,
    ),
    profession: this.fb.control<string>(
      {
        disabled: this.disableProfessionAndDateOfBirth,
        value: null,
      },
      [Validators.required],
    ),
    addressMobilePhoneNumber: this.fb.control<string>(
      this.personType === PersonTypeEnum.Customer
        && this.isPhoneTypeMatches(this.flow.billingAddress?.phone, 'MOBILE')
        && this.flow.billingAddress?.phone || '',
      [
        Validators.required,
        PhoneValidators.codeRequired('DE'),
        PhoneValidators.country('DE', $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressMobilePhoneNumber.label:`),
        PhoneValidators.type('MOBILE', null, $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressMobilePhoneNumber.label:`),
      ],
    ),
    addressPhoneNumber: this.fb.control<string>(
      this.personType === PersonTypeEnum.Customer
        && this.isPhoneTypeMatches(this.flow.billingAddress.phone, 'FIXED_LINE')
        && this.flow.billingAddress.phone || '',
      [
        PhoneValidators.codeRequired('DE'),
        PhoneValidators.country('DE', $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressMobilePhoneNumber.label:`),
        PhoneValidators.type('FIXED_LINE', null, $localize`:@@payment-santander-de-pos.inquiry.form.customer.addressPhoneNumber.label:`),
      ],
    ),
    addressResidentSince: this.fb.control<Date>(
      null,
      RequiredDate,
    ),
    identificationNumber: this.fb.control<string>(
      null,
      [Validators.required, Validators.maxLength(20), idNumberValidator],
    ),
    identificationPlaceOfIssue: this.fb.control<string>(
      null,
      [Validators.required, Validators.maxLength(50)],
    ),
    identificationDateOfIssue: this.fb.control<Date>(
      null,
      RequiredDate,
    ),
    identificationDateOfExpiry: this.fb.control<Date>(
      null,
      RequiredDate,
    ),
    identificationIssuingAuthority: this.fb.control<string>(
      null,
      [Validators.required, Validators.maxLength(50)],
    ),
    numberOfChildren: this.fb.control<number>(
      null,
      [Validators.required, Validators.min(0)],
    ),
    personalMaritalStatus: this.fb.control<string>(
      null,
      [Validators.required],
    ),
    personalNationality: this.fb.control<string>(
      null,
      [Validators.required],
    ),
    personalPlaceOfBirth: this.fb.control<string>(
      null,
      [Validators.required, Validators.maxLength(30)],
    ),
    personalBirthName: this.fb.control<string>(
      null,
      [Validators.pattern(/^[\w\s-]\D+$/), Validators.maxLength(50)],
    ),
  });

  public readonly pastDateConstraints = DateConstraints.past;
  public readonly pastOrTodayDateConstraints = DateConstraints.pastOrToday;
  public readonly futureDateConstraints = DateConstraints.future;
  public readonly adultDateConstraints = DateConstraints.adultDateOfBirth;

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );
    super.ngOnInit();
    const formData$ = this.store.select(PaymentState.form);

    const togglePrevAddressForm$ = this.formGroup.get('addressResidentSince').valueChanges.pipe(
      startWith(this.formGroup.get('addressResidentSince').value),
      tap((value: Date) => {
        const isRecent = dayjs(value).isAfter(dayjs().subtract(3, 'years').subtract(1, 'month'));
        this.togglePrevAddress.emit({
          date: value,
          isPrevAddress: !!value && isRecent,
        });
      }),
    );

    const toggleNumberOfChildren$ = formData$.pipe(
      map(formData => formData?.detailsForm?.typeOfGuarantorRelation),
      distinctUntilChanged(),
      tap((value) => {
        const showChildren = value !== GuarantorRelation.EQUIVALENT_HOUSEHOLD
          && this.personType === PersonTypeEnum.Guarantor
          || this.personType === PersonTypeEnum.Customer;

        showChildren
          ? this.formGroup.get('numberOfChildren').enable({ emitEvent: false })
          : this.formGroup.get('numberOfChildren').disable({ emitEvent: false });
      }),
    );

    const numberOfChildrenValueChanges$ = this.formGroup.get('numberOfChildren').valueChanges.pipe(
      tap((value) => {
        const numberOfChildren = Number(value);
        this.formGroup.get('numberOfChildren').setValue(
          Number.isNaN(numberOfChildren)
            ? 0
            : numberOfChildren,
          {
            emitEvent: false,
          }
        );
      })
    );

    merge(
      togglePrevAddressForm$,
      toggleNumberOfChildren$,
      numberOfChildrenValueChanges$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public readonly numberMask = (value: string) => value ? String(value).replace(/\D/g, '') : value;
  public readonly phoneMask = phoneMask;

  private isPhoneTypeMatches(phoneNumber: string, type: NumberType): boolean {
    const parsed = phoneNumber && PhoneValidators.parsePhone(phoneNumber);

    return parsed && parsed.getType() === type;
  }

  public selectAddressResidentSince(date: Date, datepicker: MatDatepicker<unknown>): void {
    datepicker.close();
    const dateWithDay = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());
    this.formGroup.get('addressResidentSince').setValue(dateWithDay);
  }
}
