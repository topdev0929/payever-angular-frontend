import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { combineLatest, defer, merge } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { DateConstraints } from '@pe/checkout/forms/date';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { CurrencySymbolPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  DOWN_PAYMENT_SUB,
  FormOptionsInterface,
  RatesFormValue,
} from '../../../shared';

export const EMPLOYMENT_FREELANCER = 'FREELANCER';

const CREDIT_DUE_OPTIONS: { label: string; value: number }[] = [
  {
    label: $localize`:@@santander-de.inquiry.form.credit_due_date.value.1:`,
    value: 1,
  },
  {
    label: $localize`:@@santander-de.inquiry.form.credit_due_date.value.15:`,
    value: 15,
  },
];

@Component({
  selector: 'rates-details-form',
  templateUrl: './rates-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CurrencySymbolPipe,
    PeDestroyService,
  ],
})
export class RatesFormComponent extends CompositeForm<RatesFormValue> implements OnInit {

  @Input() isRatesLoading: boolean;

  private store = this.injector.get(Store);

  private flow = this.store.selectSnapshot(FlowState.flow);
  private options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  public readonly pastDateConstraints = DateConstraints.adultDateOfBirth;
  public readonly currency = this.flow.currency;
  public readonly isDownPaymentAllowed = this.options.isDownPaymentAllowed;
  public readonly creditDueDateOptions = CREDIT_DUE_OPTIONS;
  public readonly formGroup = this.fb.group({
    credit_due_date: this.fb.control<number>(
      this.creditDueDateOptions[0].value, Validators.required
    ),
    _down_payment_view: this.fb.control<number>(
      { disabled: !this.isDownPaymentAllowed, value: null },
      [Validators.min(0)],
    ),
    down_payment: this.fb.control<number>(
      { disabled: !this.isDownPaymentAllowed, value: 0 },
      [Validators.min(0)],
    ),
  });

  public showDownpaymentApply$ = defer(() => combineLatest([
    this.formGroup.get('_down_payment_view').valueChanges,
    this.formGroup.get('down_payment').valueChanges.pipe(
      startWith(this.formGroup.get('down_payment').value),
    ),
  ]).pipe(
    map(([depositView, downPayment]) => downPayment !== depositView
      && !this.isRatesLoading),
  ));

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );
    super.ngOnInit();

    merge(
      this.formGroup.valueChanges.pipe(
        tap((value) => {
          this.store.dispatch(new PatchFormState({
            formRatesMain: value,
          }));
        }),
      ),
      this.formGroup.get('_down_payment_view').valueChanges.pipe(
        tap((value) => {
          this.formGroup.get('_down_payment_view').setValue(
            Math.max(Math.min(this.flow.total - DOWN_PAYMENT_SUB, value), 0),
            { emitEvent: false }
          );
        })
      )
    ).pipe(
      takeUntil(this.destroy$),
    )
      .subscribe();
  }

  writeValue(value: RatesFormValue): void {
    this.formGroup.patchValue(value);
  }

  public applyDownpayment(): void {
    const value = Number(this.formGroup.get('_down_payment_view').value);
    this.formGroup.get('down_payment').setValue(value);
  }
}
