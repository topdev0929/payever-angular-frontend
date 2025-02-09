import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { CurrencySymbolPipe } from '@pe/checkout/utils';

import { UtilStepService } from '../../../../services';
import {
  EMPLOYMENT_TYPE,
  FinanceDetailsFormValue,
  REPAYMENT_SOURCE,
} from '../../../../shared';

export const UNEMPLOYED_TYPES = ['Pensioners', 'Unemployed', 'Student'];

@Component({
  selector: 'finance-details-form',
  templateUrl: './finance-details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencySymbolPipe],
})
export class FinanceDetailsFormComponent extends CompositeForm<FinanceDetailsFormValue> implements OnInit {

  private store = this.injector.get(Store);
  private utilStepService = this.injector.get(UtilStepService);

  public readonly formGroup = this.fb.group({
    employmentType: this.fb.control<keyof typeof EMPLOYMENT_TYPE>(null, Validators.required),
    employer: [{ disabled: true, value: null }, Validators.required],
    primaryIncomeRepayment: [{ disabled: true, value: true }],
    repaymentSource: [null, Validators.required],
    repaymentSourceOther: [null, Validators.required],
    thirdPartyDeclaration: this.fb.control<boolean>(null, Validators.requiredTrue),
  });

  public currency = this.store.selectSnapshot(FlowState.flow).currency;
  private options$ = this.store.select(PaymentState.options);

  public employmentTypeOptions$ = this.options$.pipe(
    map(options => this.utilStepService.translateOptions(options.employmentType, EMPLOYMENT_TYPE)),
    tap((options) => {
      !this.formGroup.get('employmentType').value && this.formGroup.get('employmentType').setValue(options[0].value);
    }),
  );

  public repaymentSourceOptions$ = this.options$.pipe(
    map(options => this.utilStepService.translateOptions(options.repaymentSource, REPAYMENT_SOURCE))
  );

  public readonly translations = {
    thirdPartyDeclaration: {
      label: $localize `:@@santander-se.inquiry.form.third_party_declaration.label:`,
    },
    primaryIncomeRepayment: {
      label: $localize`:@@santander-se.inquiry.form.primary_income_repayment.label:`,
    },
  };

  ngOnInit(): void {
    super.ngOnInit();

    const toggleEmployed$ = this.formGroup.get('employmentType').valueChanges.pipe(
      startWith(this.formGroup.get('employmentType').value),
      tap((value) => {
        const isEmployed = value && !UNEMPLOYED_TYPES.includes(value);
        if (isEmployed) {
          this.formGroup.get('employer').enable();
          this.formGroup.get('primaryIncomeRepayment').enable();
        } else {
          this.formGroup.get('employer').disable();
          this.formGroup.get('primaryIncomeRepayment').disable();
          this.formGroup.get('repaymentSource').enable();
        }
      }),
    );

    const toggleRepaymentSource$ = this.formGroup.get('primaryIncomeRepayment').valueChanges.pipe(
      startWith(this.formGroup.get('primaryIncomeRepayment').value),
      tap((value) => {
        value ? this.formGroup.get('repaymentSource').disable() : this.formGroup.get('repaymentSource').enable();
      }),
    );

    const toggleOtherRepaymentSource$ = this.formGroup.get('repaymentSource').valueChanges.pipe(
      startWith(this.formGroup.get('repaymentSource').value),
      tap((value) => {
        value === 'Other'
          ? this.formGroup.get('repaymentSourceOther').enable()
          : this.formGroup.get('repaymentSourceOther').disable();
      }),
    );

    merge(
      toggleEmployed$,
      toggleRepaymentSource$,
      toggleOtherRepaymentSource$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
