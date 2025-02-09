import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { delay, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { CurrencySymbolPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseFormOptionsInterface,
  DE_RESIDENTIAL_TYPES,
  FormValue,
  GuarantorRelation,
  IncomeFormValue,
  PERSON_TYPE,
  PersonTypeEnum,
  ResidenceTypes,
} from '../../..';


export const PositiveNumberValidations: ValidatorFn[] = [
  (control:AbstractControl) => Number(control.value) > 0 ? null : { invalid: true },
  Validators.max(Number.MAX_SAFE_INTEGER),
];

@Component({
  selector: 'income-form',
  templateUrl: './income-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    CurrencySymbolPipe,
  ],
})
export class IncomeFormComponent extends CompositeForm<IncomeFormValue> implements OnInit {

  private store = this.injector.get(Store);

  public readonly formGroup = this.fb.group({
    netIncome: [null, [
      Validators.required,
      ...PositiveNumberValidations,
    ]],
    netIncomePartner: [null],
    otherIncome: [null],
    sortOfIncome: [null, Validators.required],
    rentalIncome: [null],
    incomeResidence: this.fb.control<ResidenceTypes>(null, Validators.required),
    housingCosts: [null, [
      Validators.required,
      Validators.min(0),
      Validators.max(Number.MAX_SAFE_INTEGER),
    ]],
    monthlyMaintenancePayments: [null],
  });

  public readonly personType = this.injector.get(PERSON_TYPE);
  private flow = this.store.selectSnapshot(FlowState.flow);
  public currency = this.flow.currency;
  public guarantorInSameHousehold = false;
  private options$ = this.store.select(PaymentState.options);

  public paymentOptions$ = this.options$.pipe(
    map((options: BaseFormOptionsInterface) => ({
      ...options,
      residentialTypes: options.residentialTypes.map(item => ({
        ...item,
        label: DE_RESIDENTIAL_TYPES[String(item.value)]
          ? DE_RESIDENTIAL_TYPES[String(item.value)](item.label)
          : item.label,
      })),
    }))
  );

  public get translations() {
    const incomeResidence = this.formGroup.get('incomeResidence').value;
    let housingCosts = $localize`:@@santander-de.inquiry.form.customer.housingCostsRent.label:Monthly rent`;

    if (incomeResidence === ResidenceTypes.PROPERTY) {
      housingCosts = $localize`:@@santander-de.inquiry.form.customer.housingCostsMortgage.label:Monthly mortgage`;
    }
    if (incomeResidence === ResidenceTypes.PAID_PROPERTY) {
      housingCosts = $localize`:@@santander-de.inquiry.form.customer.housingCostsAdditional.label:Monthly additional costs`;
    }

    return {
      housingCosts,
    };
  }

  private toggleControl(controlName: keyof IncomeFormValue, enable: boolean) {
    enable
      ? this.formGroup.get(controlName).enable()
      : this.formGroup.get(controlName).disable();
  }

  ngOnInit(): void {
    super.ngOnInit();
    const guarantorRelation = this.store.selectSnapshot<FormValue>(PaymentState.form)
      .customer.personalForm.typeOfGuarantorRelation;
    this.guarantorInSameHousehold = this.personType === PersonTypeEnum.Guarantor
      && guarantorRelation === GuarantorRelation.EQUIVALENT_HOUSEHOLD;
    this.toggleControl('netIncomePartner', !this.guarantorInSameHousehold);
    this.toggleControl('otherIncome', !this.guarantorInSameHousehold);
    this.toggleControl('rentalIncome', !this.guarantorInSameHousehold);
    this.toggleControl('incomeResidence', !this.guarantorInSameHousehold);
    this.toggleControl('housingCosts', !this.guarantorInSameHousehold);
    this.toggleControl('monthlyMaintenancePayments', !this.guarantorInSameHousehold);

    const toggleSortOfIncome$ = this.formGroup.get('otherIncome').valueChanges.pipe(
      startWith(this.formGroup.get('otherIncome').value),
      tap((value) => {
        value && !this.guarantorInSameHousehold
          ? this.formGroup.get('sortOfIncome').enable()
          : this.formGroup.get('sortOfIncome').disable();
      }),
    );

    const incomeResidenceChanged$ = this.formGroup.get('incomeResidence').valueChanges.pipe(
      delay(200), // wait for the label to be updated
      tap(() => this.formGroup.get('housingCosts').updateValueAndValidity()),
    );

    merge(
      incomeResidenceChanged$,
      toggleSortOfIncome$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
