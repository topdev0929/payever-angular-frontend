import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { delay, distinctUntilChanged, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import {
  GuarantorRelation,
  IncomeFormValue,
  PERSON_TYPE,
  PersonTypeEnum,
  FormValue,
  ResidenceTypesPOS,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';

const CustomerHousingCostsTranslations = {
  [ResidenceTypesPOS.PROPERTY]: $localize`:@@payment-santander-de-pos.inquiry.form.customer.housingCosts.mortgage:Monthly mortgage`,
  [ResidenceTypesPOS.WITH_PARENTS]: $localize`:@@payment-santander-de-pos.inquiry.form.customer.housingCosts.additional:Monthly additional costs`,
  [ResidenceTypesPOS.PAID_PROPERTY]: $localize`:@@payment-santander-de-pos.inquiry.form.customer.housingCosts.additional:Monthly additional costs`,
  [ResidenceTypesPOS.FOR_RENT]: $localize`:@@payment-santander-de-pos.inquiry.form.customer.housingCosts.rent:Monthly rent`,
};

const GuarantorHousingCostsTranslations = {
  [ResidenceTypesPOS.PROPERTY]: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.housingCosts.mortgage:Monthly mortgage`,
  [ResidenceTypesPOS.WITH_PARENTS]: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.housingCosts.additional:Monthly additional costs`,
  [ResidenceTypesPOS.PAID_PROPERTY]: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.housingCosts.additional:Monthly additional costs`,
  [ResidenceTypesPOS.FOR_RENT]: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.housingCosts.rent:Monthly rent`,
};

@Component({
  selector: 'income-form',
  templateUrl: './income-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeFormComponent extends CompositeForm<IncomeFormValue> implements OnInit {

  @Select(PaymentState.options)
  protected readonly options$!: Observable<any>;

  private cdr = this.injector.get(ChangeDetectorRef);
  private store = this.injector.get(Store);
  public personType = this.injector.get(PERSON_TYPE);
  private flow = this.store.selectSnapshot(FlowState.flow);
  public currency = this.flow.currency;

  public readonly formGroup = this.fb.group({
    netIncome: [null, [Validators.required]],
    partnerIncomeNet: [null],
    otherIncomeFromHousehold: [null],
    typeOfResident: [null, [Validators.required]],
    incomeFromRent: [null],
    incomeInfo: [
      { disabled: true, value: null },
      [Validators.required, Validators.pattern(/[a-zA-Z\s]/)],
    ],
    housingCosts: [null, [Validators.required]],
    supportPayment: [null],
  });

  public readonly alphaMask = (value: string) => value ? value.replace(/[^a-zA-ZÄÖÜẞäöüß\s]/g, '') : value;
  public get translations() {
    const typeOfResident = this.formGroup.get('typeOfResident').value;

    return {
      customer: {
        netIncome: $localize`:@@payment-santander-de-pos.inquiry.form.customer.netIncome.label:`,
        partnerIncomeNet: $localize`:@@payment-santander-de-pos.inquiry.form.customer.partnerIncomeNet.label:`,
        otherIncomeFromHousehold: $localize`:@@payment-santander-de-pos.inquiry.form.customer.otherIncomeFromHousehold.label:`,
        incomeFromRent: $localize`:@@payment-santander-de-pos.inquiry.form.customer.incomeFromRent.label:`,
        incomeInfo: $localize`:@@payment-santander-de-pos.inquiry.form.customer.incomeInfo.label:`,
        typeOfResident: $localize`:@@payment-santander-de-pos.inquiry.form.customer.typeOfResident.label:`,
        housingCosts: CustomerHousingCostsTranslations[typeOfResident || ResidenceTypesPOS.FOR_RENT],
        supportPayment: $localize`:@@payment-santander-de-pos.inquiry.form.customer.supportPayment.label:`,
      },
      guarantor: {
        netIncome: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.netIncome.label:`,
        partnerIncomeNet: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.partnerIncomeNet.label:`,
        otherIncomeFromHousehold: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.otherIncomeFromHousehold.label:`,
        incomeFromRent: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.incomeFromRent.label:`,
        incomeInfo: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.incomeInfo.label:`,
        typeOfResident: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.typeOfResident.label:`,
        housingCosts: GuarantorHousingCostsTranslations[typeOfResident || ResidenceTypesPOS.FOR_RENT],
        supportPayment: $localize`:@@payment-santander-de-pos.inquiry.form.guarantor.supportPayment.label:`,
      },
    };
  }

  ngOnInit(): void {
    super.ngOnInit();

    const typeOfGuarantorRelation$ = this.store.select(PaymentState.form).pipe(
      map((formData: FormValue) => formData?.detailsForm?.typeOfGuarantorRelation),
      distinctUntilChanged(),
      tap((typeOfGuarantorRelation) => {
        const togglePartnerNetIncome = (this.personType === PersonTypeEnum.Customer
          || this.personType === PersonTypeEnum.Guarantor)
          && typeOfGuarantorRelation !== GuarantorRelation.EQUIVALENT_HOUSEHOLD;

        const showIncome = this.personType === PersonTypeEnum.Customer
          || (this.personType === PersonTypeEnum.Guarantor
            && typeOfGuarantorRelation !== GuarantorRelation.EQUIVALENT_HOUSEHOLD);

        togglePartnerNetIncome
          ? this.formGroup.get('partnerIncomeNet').enable()
          : this.formGroup.get('partnerIncomeNet').disable();

        if (showIncome) {
          this.formGroup.get('otherIncomeFromHousehold').enable();
          this.formGroup.get('typeOfResident').enable();
          this.formGroup.get('incomeFromRent').enable();
          this.formGroup.get('housingCosts').enable();
          this.formGroup.get('supportPayment').enable();
        } else {
          this.formGroup.get('otherIncomeFromHousehold').disable();
          this.formGroup.get('typeOfResident').disable();
          this.formGroup.get('incomeFromRent').disable();
          this.formGroup.get('housingCosts').disable();
          this.formGroup.get('supportPayment').disable();
          this.formGroup.get('incomeInfo').disable();
        }
        this.cdr.detectChanges();
      })
    );

    const typeOfResidentChanged$ = this.formGroup.get('typeOfResident').valueChanges.pipe(
      delay(200), // wait for the label to be updated
      tap(() => this.formGroup.get('housingCosts').updateValueAndValidity()),
    );

    const toggleIncomeInfo$ = this.formGroup.get('otherIncomeFromHousehold').valueChanges.pipe(
      startWith(this.formGroup.get('otherIncomeFromHousehold').value),
      tap((value) => {
        value
          ? this.formGroup.get('incomeInfo').enable()
          : this.formGroup.get('incomeInfo').disable();
      }),
    );

    merge(
      typeOfGuarantorRelation$,
      typeOfResidentChanged$,
      toggleIncomeInfo$
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
