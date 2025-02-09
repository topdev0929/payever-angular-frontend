import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { FormValue } from '../../../../shared';

export interface SafeInsuranceFormValue {
  wantsSafeInsurance: boolean;
  insuranceConditionsAccepted: boolean;
}

@Component({
  selector: 'safe-insurance-form',
  templateUrl: './safe-insurance-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PercentPipe, CurrencyPipe, PeDestroyService],
})
export class SafeInsuranceFormComponent extends CompositeForm<SafeInsuranceFormValue> implements OnInit {

  private store = this.injector.get(Store);
  private percentPipe = this.injector.get(PercentPipe);
  private currencyPipe = this.injector.get(CurrencyPipe);

  public readonly formGroup = this.fb.group({
    wantsSafeInsurance: [false],
    insuranceConditionsAccepted: [false],
  });

  private currency = this.store.selectSnapshot(FlowState.flow).currency;

  private get formData(): FormValue {
    return this.store.selectSnapshot(PaymentState.form);
  }

  private get insurancePercent(): string {
    return `<strong>${this.percentPipe.transform(
      this.formData.bankConsentForm?._insurancePercent * 0.01,
      '1.0-2',
    )}</strong>`;
  }

  private get insuranceMonthlyCost(): string {
    return `<strong>${this.currencyPipe.transform(
      this.formData.bankConsentForm?._insuranceMonthlyCost,
      this.currency,
      'symbol-narrow',
    )}</strong>`;
  }

  public get translations() {
    return {
      wantsSafeInsurance: {
        text: $localize`:@@santander-dk.inquiry.form.wants_safe_insurance.details.text:\
        ${this.insurancePercent}:insurance_percent:\
        ${this.insuranceMonthlyCost}:insurance_monthly_cost:`,
        label: $localize`:@@santander-dk.inquiry.form.wants_safe_insurance.label:`,
      },
      insuranceConditionsAccepted: {
        title: $localize`:@@santander-dk.inquiry.form.insurance_conditions_accepted.details.title:\
        ${this.insurancePercent}:insurance_percent:\
        ${this.insuranceMonthlyCost}:insurance_monthly_cost:`,
        text: $localize`:@@santander-dk.inquiry.form.insurance_conditions_accepted.details.text:\
        ${this.insurancePercent}:insurance_percent:\
        ${this.insuranceMonthlyCost}:insurance_monthly_cost:`,
        label: $localize`:@@santander-dk.inquiry.form.insurance_conditions_accepted.label:`,
      },
    };
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup.get('wantsSafeInsurance').valueChanges.pipe(
      startWith(this.formGroup.get('wantsSafeInsurance').value),
      tap((value: boolean) => {
        value
          ? this.formGroup.get('insuranceConditionsAccepted').enable({ emitEvent: false })
          : this.formGroup.get('insuranceConditionsAccepted').disable({ emitEvent: false });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
