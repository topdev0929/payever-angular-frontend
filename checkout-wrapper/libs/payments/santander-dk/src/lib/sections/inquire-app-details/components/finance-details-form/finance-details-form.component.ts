import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FormOptionInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';

import { FinanceDetailsFormValue, FormValue } from '../../../../shared';
import { PAY_SOURCES } from '../../app-details-constants';

@Component({
  selector: 'finance-details-form',
  templateUrl: './finance-details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencySymbolPipe],
})
export class FinanceDetailsFormComponent extends CompositeForm<FinanceDetailsFormValue> implements OnInit {

  private store = this.injector.get(Store);
  private cdr = this.injector.get(ChangeDetectorRef);

  public readonly formGroup = this.fb.group({
    monthlySalaryBeforeTax: [null, Validators.required],
    totalDebt: [null, Validators.required],
    totalTransportCostMonthly: [null, Validators.required],
    totalRentMonthly: [{ disabled: true, value: null }, Validators.required],
    insuranceForUnemployment: [false],
    payWithMainIncome: [true],
    paySource: [{ disabled: true, value: null }, Validators.required],
    otherPaySource: [{ disabled: true, value: null }, Validators.required],
  });

  public currency = this.store.selectSnapshot(FlowState.flow).currency;
  private paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  private formData: FormValue = this.store.selectSnapshot(PaymentState.form);
  private options$ = this.store.select(PaymentState.options);

  public paySourceOptions$ = this.options$.pipe(
    map(options => this.translateOptions(options.paySources, PAY_SOURCES))
  );

  public get translations() {
    return {
      totalTransportCostMonthly: {
        label: this.formData.carsForm?._count > 0 ?
          $localize `:@@santander-dk.inquiry.form.total_transport_cost_monthly__fuel.label:` :
          $localize `:@@santander-dk.inquiry.form.total_transport_cost_monthly__public.label:`,
      },
      payWithMainIncome: {
        label: $localize`:@@santander-dk.inquiry.form.pay_with_main_income.label:`,
      },
    };
  }

  ngOnInit(): void {
    super.ngOnInit();

    const formData$ = this.store.select(PaymentState.form);

    const toggleMonthlyAndDebt$ = formData$.pipe(
      map(form => form?.bankConsentForm?.wasTaxProcessed),
      distinctUntilChanged(),
      tap((value) => {
        if (value) {
          this.formGroup.get('monthlySalaryBeforeTax').disable({ emitEvent: false });
          this.formGroup.get('totalDebt').disable({ emitEvent: false });
        } else {
          this.formGroup.get('monthlySalaryBeforeTax').enable({ emitEvent: false });
          this.formGroup.get('totalDebt').enable({ emitEvent: false });
        }
        this.cdr.markForCheck();
      }),
    );

    const toggleRentMonthly$ = formData$.pipe(
      map(v => v?.personalForm?.residentialType),
      distinctUntilChanged(),
      filter(v => !!v || v === 0),
      tap((value: number | string) => {
        ['1', '2', '4'].includes(value.toString())
          ? this.formGroup.get('totalRentMonthly').enable({ emitEvent: false })
          : this.formGroup.get('totalRentMonthly').disable({ emitEvent: false });
        this.cdr.markForCheck();
      }),
    );

    const togglePaySource$ = this.formGroup.get('payWithMainIncome').valueChanges.pipe(
      startWith(this.formGroup.get('payWithMainIncome').value),
      tap((value: boolean) => {
        if (value) {
          this.formGroup.get('paySource').disable({ emitEvent: false });
          this.formGroup.get('otherPaySource').disable({ emitEvent: false });
        } else {
          this.formGroup.get('paySource').enable({ emitEvent: false });
        }
      }),
    );

    const toggleOtherPaySource$ = this.formGroup.get('paySource').valueChanges.pipe(
      startWith(this.formGroup.get('paySource').value),
      tap((value: number | string) => {
        value === 99
          ? this.formGroup.get('otherPaySource').enable({ emitEvent: false })
          : this.formGroup.get('otherPaySource').disable({ emitEvent: false });
      }),
    );

    merge(
      toggleMonthlyAndDebt$,
      toggleRentMonthly$,
      togglePaySource$,
      toggleOtherPaySource$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private translateOptions(options: FormOptionInterface[], keysPool: string[] = []) {
    return options.map(v => ({
      label: keysPool[v.value as number],
      value: v.value,
    }));
  }
}
